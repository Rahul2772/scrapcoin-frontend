import "./lib/error-capture";

const SITE_URL = "https://scrapco.in";

/** Serve robots.txt directly from the Worker — no SSR needed */
function robotsTxtResponse(): Response {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "Disallow: /admin/",
    "Disallow: /erp/",
    "Disallow: /my-bookings",
    "Disallow: /login",
    "Disallow: /register",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ].join("\n");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

/** Serve sitemap.xml directly from the Worker — no SSR needed */
function sitemapXmlResponse(): Response {
  // No <lastmod>: stamping every URL with today's date teaches search engines to ignore it.
  const pages = [
    { path: "/",        priority: "1.0", changefreq: "weekly"  },
    { path: "/about",   priority: "0.8", changefreq: "monthly" },
    { path: "/rates",   priority: "0.9", changefreq: "weekly"  },
    { path: "/faq",     priority: "0.8", changefreq: "monthly" },
    { path: "/contact", priority: "0.8", changefreq: "monthly" },
    { path: "/partner", priority: "0.7", changefreq: "monthly" },
    { path: "/impact",  priority: "0.7", changefreq: "weekly"  },
    { path: "/blog",    priority: "0.6", changefreq: "weekly"  },
    { path: "/careers", priority: "0.6", changefreq: "monthly" },
    { path: "/terms",   priority: "0.3", changefreq: "yearly"  },
    { path: "/privacy", priority: "0.3", changefreq: "yearly"  },
  ];
  const urls = pages
    .map(
      ({ path, priority, changefreq }) =>
        `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

/** Contact for vulnerability reports (RFC 9116) */
function securityTxtResponse(): Response {
  const body = [
    "Contact: mailto:bookings.scrapco@gmail.com",
    "Expires: 2027-12-31T23:59:59Z",
    "Preferred-Languages: en, hi",
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
  ].join("\n");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

/** Send plain-HTTP and www traffic to https://scrapco.in so there is one
 *  canonical origin. Only applies on the production domain, not in dev. */
function canonicalOriginRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const isProdHost = url.hostname === "scrapco.in" || url.hostname === "www.scrapco.in";
  if (!isProdHost) return null;
  if (url.protocol === "https:" && url.hostname === "scrapco.in") return null;
  return Response.redirect(`${SITE_URL}${url.pathname}${url.search}`, 301);
}

// Content-Security-Policy starts in report-only mode: violations show in the
// browser console without breaking anything. Rename the header to
// "Content-Security-Policy" once a few days of real traffic show no reports.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // TanStack Start inlines hydration scripts and JSON-LD
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.scrapco.in https://*.supabase.co wss://*.supabase.co https://nominatim.openstreetmap.org https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
  "frame-src 'self' blob: https://*.supabase.co",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)",
  "Content-Security-Policy-Report-Only": CONTENT_SECURITY_POLICY,
};

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

/** Inject caching and security headers onto the response.
 *  - HTML pages → no-cache so the browser always fetches fresh HTML (ensuring
 *    it gets the latest JS chunk hashes on every deployment).
 *  - JS/CSS assets → immutable long-term cache (content-hash filenames handle
 *    cache busting automatically).
 */
function applyResponseCacheHeaders(request: Request, response: Response): Response {
  const url = new URL(request.url);
  const contentType = response.headers.get("content-type") ?? "";
  const isHtml = contentType.includes("text/html");
  const isAsset = url.pathname.startsWith("/assets/");

  // Clone so we can mutate headers
  const newHeaders = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) newHeaders.set(name, value);

  if (isAsset) {
    // Static assets have content-hash names → safe to cache forever
    newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (isHtml) {
    // HTML pages must always be revalidated so browsers pick up new JS chunks
    newHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    newHeaders.set("Pragma", "no-cache");
    newHeaders.set("Expires", "0");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // Intercept special paths before passing to SSR handler
    const redirect = canonicalOriginRedirect(request);
    if (redirect) return redirect;

    const { pathname } = new URL(request.url);
    if (pathname === "/robots.txt") return robotsTxtResponse();
    if (pathname === "/sitemap.xml") return sitemapXmlResponse();
    if (pathname === "/.well-known/security.txt") return securityTxtResponse();

    // ── API Proxy ─────────────────────────────────────────────────────────────
    // Forward all /api/* requests directly to the backend (Railway).
    // This avoids the SSR handler which has no route for API calls and would
    // hang or crash on PUT/DELETE requests.
    if (pathname.startsWith("/api/")) {
      const proxiedUrl = `https://api.scrapco.in${pathname}${new URL(request.url).search}`;
      // Clone the request to the new URL, preserving method/headers/body
      const proxiedRequest = new Request(proxiedUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
        redirect: "follow",
        // @ts-ignore – required in some runtimes to stream a body in a fetch
        duplex: "half",
      });
      return fetch(proxiedRequest);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return applyResponseCacheHeaders(request, normalized);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};

