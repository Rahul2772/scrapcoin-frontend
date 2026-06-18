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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut } from "lucide-react";

import appCss from "../styles.css?url";

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

export function NavAuth() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
      toast.success("Signed out");
      await navigate({ to: "/" });
    } catch {
      toast.error("Failed to sign out");
    }
  }

  // Don't render until auth is ready
  if (loading) return null;

  if (user) {
    const userInitials = user.email ? user.email.slice(0, 2).toUpperCase() : "U";

    return (
      <TooltipProvider>
        <div className="flex items-center gap-3 rounded-full border border-border/80 bg-background/85 backdrop-blur-md pl-3 pr-2.5 py-1.5 shadow-md">
          <div className="flex items-center gap-2 border-r border-border/60 pr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border border-border cursor-help">
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                <p className="text-[11px] font-medium">Logged in as:</p>
                <p className="text-[10px] opacity-80">{user.email}</p>
              </TooltipContent>
            </Tooltip>
            <span className="hidden lg:inline text-xs font-medium text-foreground max-w-[120px] truncate" title={user.email}>
              {user.email}
            </span>
          </div>

          <Link
            to="/my-bookings"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            My Bookings
          </Link>
          {profile?.role === "admin" && (
            <Link
              to="/admin"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin ⚙️
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <Link to="/login">
      <Button size="sm" className="rounded-full shadow-sm hover:shadow">
        Sign in
      </Button>
    </Link>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Scrap Co. — Smart Scrap Pickup in Greater Noida West" },
      {
        name: "description",
        content:
          "Tech-enabled doorstep scrap collection for apartments in Greater Noida West. Transparent weighing, instant UPI payment, full traceability.",
      },
      { name: "author", content: "The Scrap Co." },
      { property: "og:title", content: "The Scrap Co. — Smart Scrap Pickup" },
      {
        property: "og:description",
        content:
          "Tech-enabled doorstep scrap collection for apartments in Greater Noida West.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Scrap Co. — Smart Scrap Pickup" },
      {
        name: "twitter:description",
        content:
          "Tech-enabled doorstep scrap collection for apartments in Greater Noida West.",
      },
      { property: "og:image", content: "/images/Screenshot-1.png" },
      { name: "twitter:image", content: "/images/Screenshot-1.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
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
