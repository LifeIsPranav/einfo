import React from "react";
import { cn } from "@/lib/utils";
import type { WithChildren, WithClassName } from "@/types";
import ErrorBoundary from "@/components/common/ErrorBoundary";

interface BaseLayoutProps extends WithChildren, WithClassName {
  /**
   * Whether to include the default padding
   */
  noPadding?: boolean;
  /**
   * Background variant
   */
  background?: "white" | "gray" | "gradient";
  /**
   * Maximum width constraint
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /**
   * Whether to center content horizontally
   */
  centered?: boolean;
  /**
   * Custom error fallback component
   */
  errorFallback?: React.ReactNode;
}

const backgroundClasses = {
  white: "bg-white dark:bg-black",
  gray: "bg-gray-50 dark:bg-zinc-950",
  gradient: "bg-gradient-to-br from-gray-50 to-white dark:from-zinc-950 dark:to-black",
};

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  className,
  noPadding = false,
  background = "white",
  maxWidth = "full",
  centered = false,
  errorFallback,
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <div
        className={cn(
          "min-h-screen",
          backgroundClasses[background],
          !noPadding && "p-4 md:p-6",
          className,
        )}
      >
        <div
          className={cn(
            maxWidth !== "full" && maxWidthClasses[maxWidth],
            centered && "mx-auto",
            "w-full",
          )}
        >
          {children}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BaseLayout;
