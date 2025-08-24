import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex space-x-1">
        <div className={cn("bg-black dark:bg-zinc-100 rounded-full animate-bounce", 
          size === "sm" ? "w-1 h-1" : size === "lg" ? "w-2 h-2" : "w-1.5 h-1.5"
        )} style={{ animationDelay: '0ms' }}></div>
        <div className={cn("bg-gray-700 dark:bg-zinc-300 rounded-full animate-bounce", 
          size === "sm" ? "w-1 h-1" : size === "lg" ? "w-2 h-2" : "w-1.5 h-1.5"
        )} style={{ animationDelay: '150ms' }}></div>
        <div className={cn("bg-gray-900 dark:bg-zinc-400 rounded-full animate-bounce", 
          size === "sm" ? "w-1 h-1" : size === "lg" ? "w-2 h-2" : "w-1.5 h-1.5"
        )} style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export { LoadingSpinner };

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  loadingText = "Turning Personality into Pixels...",
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50 rounded-inherit">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-800 font-light">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
