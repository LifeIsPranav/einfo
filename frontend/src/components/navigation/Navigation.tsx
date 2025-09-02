import React from "react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import AuthButton from "@/components/AuthButton";
import type { WithClassName } from "@/types";

interface NavigationProps extends WithClassName {
  /**
   * Whether to show a border at the bottom
   */
  bordered?: boolean;
  /**
   * Background variant
   */
  background?: "transparent" | "white" | "blur";
  /**
   * Positioning variant
   */
  position?: "static" | "sticky" | "fixed";
  /**
   * Additional content to render on the left side (after logo)
   */
  leftContent?: React.ReactNode;
  /**
   * Additional content to render on the right side (before auth button)
   */
  rightContent?: React.ReactNode;
}

const backgroundClasses = {
  transparent: "bg-transparent",
  white: "bg-white dark:bg-black",
  blur: "bg-white/80 dark:bg-black/80 backdrop-blur-md",
};

const positionClasses = {
  static: "relative",
  sticky: "sticky top-0 z-40",
  fixed: "fixed top-0 left-0 right-0 z-50",
};

export const Navigation: React.FC<NavigationProps> = ({
  bordered = false,
  background = "transparent",
  position = "static",
  leftContent,
  rightContent,
  className,
}) => {
  return (
    <nav
      className={cn(
        "w-full px-6 py-4 flex justify-between items-center",
        backgroundClasses[background],
        positionClasses[position],
        bordered && "border-b border-gray-200 dark:border-zinc-800",
        className,
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-4">
        <Logo />
        {leftContent}
      </div>

      <div className="flex items-center gap-3">
        {rightContent}
        <AuthButton />
      </div>
    </nav>
  );
};

export default Navigation;
