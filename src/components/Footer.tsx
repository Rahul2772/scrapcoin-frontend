import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 text-left">
        <div>
          <BrandLogo size={40} showTagline />
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed font-medium">
            Waste to Worth — making scrap pickup transparent and tech-enabled across Noida, Greater Noida & Indirapuram.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-foreground">Contact Us</p>
          <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span>+91 72920 16625</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span className="break-all">bookings.scrapco@gmail.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>Noida & Greater Noida</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-foreground">Service Area</p>
          <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground font-semibold">
            <li>Greater Noida</li>
            <li>Indirapuram</li>
            <li>Noida</li>
            <li className="text-[10px] font-normal italic text-muted-foreground/75 pt-1">More areas coming soon</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-foreground">Company</p>
          <ul className="mt-4 space-y-2 text-xs text-muted-foreground font-medium">
            <li>
              <Link to="/about" className="hover:text-foreground transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-foreground transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/impact" className="hover:text-foreground transition-colors">
                Impact / Sustainability
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-foreground transition-colors">
                Careers
              </Link>
            </li>
            <li>
              <Link to="/partner" className="hover:text-foreground transition-colors">
                Partner with Us
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            {[
              { Icon: Instagram, href: "https://www.instagram.com/scrapco.in", label: "Instagram" },
              { Icon: Facebook, href: "https://www.facebook.com/share/19DUEDLcYa", label: "Facebook" },
              { Icon: Twitter, href: "https://x.com/thescrapcoin", label: "Twitter" },
            ].map(({ Icon, href, label }, i) => (
              <a
                key={i}
                href={href}
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label={label}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} The Scrap Co. All rights reserved.
      </div>
    </footer>
  );
}
