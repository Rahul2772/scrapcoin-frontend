import { K as _process } from "./vendor-D_Usrqei.js";
globalThis.process = _process;
let lastCapturedError;
const TTL_MS = 5e3;
function record(error) {
  lastCapturedError = { error, at: Date.now() };
}
if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record(event.error ?? event));
  globalThis.addEventListener(
    "unhandledrejection",
    (event) => record(event.reason)
  );
}
function consumeLastCapturedError() {
  if (!lastCapturedError) return void 0;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = void 0;
    return void 0;
  }
  const { error } = lastCapturedError;
  lastCapturedError = void 0;
  return error;
}
function renderErrorPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
const SITE_URL = "https://scrapco.in";
function robotsTxtResponse() {
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
    `Sitemap: ${SITE_URL}/sitemap.xml`
  ].join("\n");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400"
    }
  });
}
function sitemapXmlResponse() {
  const lastmod = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const pages = [
    { path: "/", priority: "1.0", changefreq: "weekly" },
    { path: "/about", priority: "0.8", changefreq: "monthly" },
    { path: "/rates", priority: "0.9", changefreq: "weekly" },
    { path: "/faq", priority: "0.8", changefreq: "monthly" },
    { path: "/contact", priority: "0.8", changefreq: "monthly" },
    { path: "/partner", priority: "0.7", changefreq: "monthly" },
    { path: "/impact", priority: "0.7", changefreq: "weekly" },
    { path: "/blog", priority: "0.6", changefreq: "weekly" },
    { path: "/careers", priority: "0.6", changefreq: "monthly" },
    { path: "/terms", priority: "0.3", changefreq: "yearly" },
    { path: "/privacy", priority: "0.3", changefreq: "yearly" }
  ];
  const urls = pages.map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
let serverEntryPromise;
async function getServerEntry() {
  if (!serverEntryPromise) {
    serverEntryPromise = import("./vendor-D_Usrqei.js").then((n) => n.bZ).then(
      (m) => m.default ?? m
    );
  }
  return serverEntryPromise;
}
function brandedErrorResponse() {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
function isCatastrophicSsrErrorBody(body, responseStatus) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }
  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }
  const fields = payload;
  const expectedKeys = /* @__PURE__ */ new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }
  return fields.unhandled === true && fields.message === "HTTPError" && (fields.status === void 0 || fields.status === responseStatus);
}
async function normalizeCatastrophicSsrResponse(response) {
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
function applyResponseCacheHeaders(request, response) {
  const url = new URL(request.url);
  const contentType = response.headers.get("content-type") ?? "";
  const isHtml = contentType.includes("text/html");
  const isAsset = url.pathname.startsWith("/assets/");
  const newHeaders = new Headers(response.headers);
  if (isAsset) {
    newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (isHtml) {
    newHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    newHeaders.set("Pragma", "no-cache");
    newHeaders.set("Expires", "0");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
const server = {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === "/robots.txt") return robotsTxtResponse();
    if (pathname === "/sitemap.xml") return sitemapXmlResponse();
    if (pathname.startsWith("/api/")) {
      const proxiedUrl = `https://api.scrapco.in${pathname}${new URL(request.url).search}`;
      const proxiedRequest = new Request(proxiedUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
        redirect: "follow",
        // @ts-ignore – required in some runtimes to stream a body in a fetch
        duplex: "half"
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
  }
};
const workerEntry = server ?? {};
export {
  renderErrorPage as r,
  workerEntry as w
};
