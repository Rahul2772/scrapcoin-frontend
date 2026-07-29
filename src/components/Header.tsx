import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { NavAuth } from "./nav-auth";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/about", label: "About" },
  { to: "/rates", label: "Rates" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Announcement Banner — always visible, no dismiss */}
      <div
        className="w-full text-white text-center py-2 px-4 text-[11px] sm:text-xs font-semibold flex items-center justify-center shrink-0 z-50"
        style={{ backgroundColor: "#1a6b3a", minHeight: "36px" }}
      >
        🎉 Now serving Noida, Greater Noida &amp; Indirapuram — Book your pickup today
      </div>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" aria-label="The Scrap Co. home" onClick={() => setMobileOpen(false)}>
            <BrandLogo size={60} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="hover:text-foreground transition-colors"
                activeProps={{ className: "text-foreground font-bold" }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/" hash="booking">
              <Button
                size="sm"
                className="rounded-full shadow-sm cursor-pointer"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Schedule a Pickup
              </Button>
            </Link>
            <NavAuth />

          </div>

          {/* Mobile: auth icon + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <NavAuth />
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md px-4 pb-4 pt-3 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                activeProps={{ className: "text-foreground font-bold bg-accent" }}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-border/40">
              <Link to="/" hash="booking">
                <Button
                  size="sm"
                  className="w-full rounded-full shadow-sm cursor-pointer"
                  onClick={(e) => {
                    setMobileOpen(false);
                    if (window.location.pathname === "/") {
                      e.preventDefault();
                      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Schedule a Pickup
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
