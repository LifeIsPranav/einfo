import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LinkButtonProps {
  href: string;
  title: string;
  icon?: React.ReactNode;
  description?: string;
  onDirectLink?: () => void;
}

export default function LinkButton({
  href,
  title,
  icon,
  description,
  onDirectLink,
}: LinkButtonProps) {
  const handleClick = () => {
    if (onDirectLink) {
      onDirectLink();
    } else {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-xl transition-all duration-200 group shadow-sm overflow-hidden"
    >
      <div className="p-4 flex items-center gap-4 text-left">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 dark:group-hover:bg-zinc-700 transition-colors duration-200">
          {icon || <ExternalLink className="w-4 h-4 text-gray-600 dark:text-zinc-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 dark:text-white font-medium text-sm transition-colors duration-200">{title}</div>
          {description && (
            <div className="text-gray-500 dark:text-zinc-400 text-xs mt-0.5 truncate transition-colors duration-200">
              {description}
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <ExternalLink className="w-4 h-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-300 transition-colors duration-200" />
      </div>
    </button>
  );
}
