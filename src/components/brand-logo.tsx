import { useState } from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
  size?: number;
}

/**
 * Brand mark for The Scrap Co. using the official logo image
 */
export function BrandLogo({
  className,
  showWordmark = true,
  showTagline = false,
  size = 48, // Increased default size for better visibility
}: BrandLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn("flex items-center gap-3.5 cursor-pointer select-none", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium Squircle Logo Box */}
      <div
        className="relative shrink-0 overflow-hidden rounded-[24%] border-2 border-emerald-500/30 bg-[#0e4923] transition-all duration-300"
        style={{
          width: size,
          height: size,
          boxShadow: isHovered
            ? "0 6px 20px -4px oklch(0.60 0.18 150 / 0.3), inset 0 1px 1px oklch(1 0 0 / 0.15)"
            : "0 2px 8px -2px oklch(0.12 0.04 150 / 0.15)",
          transform: isHovered ? "translateY(-1px) scale(1.02)" : "none",
        }}
        aria-hidden
      >
        <img
          src="/images/logo.jpg"
          alt="The Scrap Co."
          className="w-full h-full object-cover transition-transform duration-500 ease-out"
          style={{
            transform: isHovered ? "scale(2.05)" : "scale(1.85)",
            transformOrigin: "center 36%",
          }}
        />
      </div>
      {showWordmark && (
        <div className="leading-tight">
          <span
            className="block bg-clip-text text-transparent font-black tracking-wider uppercase transition-colors duration-300"
            style={{
              backgroundImage:
                "linear-gradient(135deg, oklch(0.60 0.18 150), oklch(0.40 0.15 155))",
              fontSize: size * 0.44,
              letterSpacing: "0.06em",
            }}
          >
            The Scrap Co.
          </span>
          {showTagline && (
            <span
              className="block font-bold tracking-[0.25em] uppercase mt-0.5"
              style={{ color: "oklch(0.50 0.15 150)", fontSize: size * 0.20 }}
            >
              Waste To Worth
            </span>
          )}
        </div>
      )}
    </div>
  );
}



