import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useNavigate,
} from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LogOut } from "lucide-react";
import * as Sentry from "@sentry/react";

import appCss from "../styles.css?url";

if (typeof window !== "undefined") {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN || "";
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
      tracesSampleRate: 1.0,
      tracePropagationTargets: ["localhost", /^https:\/\/api\.scrapco\.in/],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  } else {
    console.warn("Sentry DSN not found in environment variables. Error tracking is disabled.");
  }
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  if (typeof window !== "undefined") {
    Sentry.captureException(error);
  }
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export { NavAuth } from "@/components/nav-auth";

const JSON_LD_LOCAL_BUSINESS = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://scrapco.in/#business",
  name: "The Scrap Co.",
  description:
    "Tech-enabled doorstep scrap pickup for apartments and RWAs in Noida, Greater Noida (including Greater Noida West) and Indirapuram. Transparent digital weighing, paid at pickup by UPI or cash.",
  url: "https://scrapco.in",
  logo: "https://scrapco.in/images/logo.jpg",
  image: "https://scrapco.in/images/Screenshot-1.png",
  telephone: "+91-72920-16625",
  email: "bookings.scrapco@gmail.com",
  priceRange: "₹",
  currenciesAccepted: "INR",
  paymentAccepted: "UPI, Cash",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Greater Noida West",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN",
  },
  areaServed: [
    { "@type": "City", name: "Greater Noida" },
    { "@type": "City", name: "Noida" },
    { "@type": "City", name: "Indirapuram" },
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "09:00",
    closes: "18:00",
  },
  sameAs: [
    "https://www.instagram.com/scrapco.in",
    "https://www.facebook.com/share/19DUEDLcYa",
    "https://x.com/thescrapcoin",
  ],
  serviceType: "Scrap Collection and Recycling",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Scrap Materials",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Paper & Cardboard Pickup" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Metal Scrap Pickup" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plastic Scrap Pickup" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "E-Waste Pickup" } },
    ],
  },
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: ({ matches }) => {
    // Unknown URLs render NotFoundComponent under the root route, so the
    // root is the only place that can give the 404 page its own title.
    const isNotFound = matches.some((m) => m.status === "notFound" || m.globalNotFound);
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          title: isNotFound
            ? "Page not found — The Scrap Co."
            : "The Scrap Co. — Doorstep Scrap Pickup in Noida, Greater Noida & Indirapuram",
        },
        {
          name: "description",
          content:
            "Doorstep scrap pickup for apartments in Noida, Greater Noida (including Greater Noida West) and Indirapuram. Transparent digital weighing, paid at pickup by UPI or cash.",
        },
        { name: "author", content: "The Scrap Co." },
        { name: "robots", content: isNotFound ? "noindex" : "index, follow" },
        {
          name: "google-site-verification",
          content: "R31npkH2HUW4zmf13jrTffEDFY0fbLuTPf46mJUli3o",
        },
        // Open Graph
        { property: "og:type", content: "website" },
        // og:url, og:title and og:description are set per page by pageHead() in lib/seo.ts
        {
          property: "og:title",
          content: "The Scrap Co. — Doorstep Scrap Pickup in Noida, Greater Noida & Indirapuram",
        },
        {
          property: "og:description",
          content:
            "Doorstep scrap pickup for apartments in Noida, Greater Noida (including Greater Noida West) and Indirapuram. Transparent digital weighing, paid at pickup by UPI or cash.",
        },
        { property: "og:image", content: "https://scrapco.in/images/Screenshot-1.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:locale", content: "en_IN" },
        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@thescrapcoin" },
        { name: "twitter:title", content: "The Scrap Co. — Smart Scrap Pickup" },
        {
          name: "twitter:description",
          content: "Doorstep scrap pickup in Noida, Greater Noida & Indirapuram.",
        },
        { name: "twitter:image", content: "https://scrapco.in/images/Screenshot-1.png" },
      ],
      // No canonical here: links aren't de-duplicated, so each page sets its own via pageHead().
      links: [{ rel: "stylesheet", href: appCss }],
    };
  },
  scripts: () => [
    {
      type: "application/ld+json",
      children: JSON_LD_LOCAL_BUSINESS,
    },
  ],
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
