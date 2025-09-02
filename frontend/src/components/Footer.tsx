import React from "react";
import { APP_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";
import type { WithClassName } from "@/types";

interface FooterProps extends WithClassName {
  /**
   * Position variant
   */
  position?: "absolute" | "relative" | "fixed";
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether to show additional links
   */
  minimal?: boolean;
}

const positionClasses = {
  absolute: "absolute bottom-4 left-0 right-0",
  relative: "relative",
  fixed: "fixed bottom-4 left-0 right-0 z-50",
};

const sizeClasses = {
  sm: "text-sm",
  md: "text-md",
  lg: "text-lg",
};

export const Footer: React.FC<FooterProps> = ({
  position = "absolute",
  size = "md",
  minimal = true,
  className,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(positionClasses[position], "text-center", className)}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="space-y-2">
        <p className={cn("font-medium tracking-wider", sizeClasses[size])}>
          <span className="text-gray-900 dark:text-white">{APP_CONFIG.name.split(".")[0]}</span>
          <span className="text-gray-400 dark:text-zinc-400">
            .{APP_CONFIG.name.split(".")[1]}
          </span>
        </p>

        {!minimal && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              © {currentYear} {APP_CONFIG.name}. All rights reserved.
            </p>
            <div className="flex justify-center gap-4 text-xs">
              <button
                className="text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded px-1"
                onClick={() => {
                  /* Handle privacy policy */
                }}
              >
                Privacy
              </button>
              <button
                className="text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded px-1"
                onClick={() => {
                  /* Handle terms */
                }}
              >
                Terms
              </button>
              <button
                className="text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded px-1"
                onClick={() => {
                  /* Handle contact */
                }}
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
