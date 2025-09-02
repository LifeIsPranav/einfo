import { Calendar, ExternalLink, MapPin, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIconFromName } from "@/lib/iconUtils";
import type { AchievementData } from "@/types/newSections";

interface AchievementProps {
  achievement: AchievementData;
  isOpen: boolean;
  onClose: () => void;
  onExpand: () => void;
}

export default function Achievement({
  achievement,
  isOpen,
  onClose,
  onExpand,
}: AchievementProps) {
  const handleMainClick = () => {
    onExpand();
  };

  const handleVisitWebsite = () => {
    if (achievement.websiteUrl) {
      window.open(achievement.websiteUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div>
      {/* Compact Achievement Button */}
      <div className="bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-xl transition-all duration-200 group shadow-sm overflow-hidden">
        <button
          onClick={handleMainClick}
          className="w-full p-4 flex items-center gap-4 text-left"
        >
          {/* Achievement Icon */}
          <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 dark:group-hover:bg-zinc-700 transition-colors duration-200">
            {achievement.iconName ? getIconFromName(achievement.iconName) : (
              <Trophy className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-gray-900 dark:text-white font-medium text-sm">
              {achievement.title}
            </div>
            <div className="text-gray-500 dark:text-zinc-400 text-xs mt-0.5 truncate">
              {achievement.organization} • {achievement.duration}
            </div>
          </div>
        </button>
      </div>

      {/* Expandable Achievement Section */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isOpen ? "max-h-[800px] opacity-100 mb-2" : "max-h-0 opacity-0 mb-0"
        }`}
      >
        <div
          className="bg-white dark:bg-zinc-900 rounded-b-xl shadow-sm border-l border-r border-b border-gray-100 dark:border-zinc-800 p-4 transform transition-transform duration-500 ease-out -mt-1"
          style={{
            transform: isOpen ? "translateY(0)" : "translateY(-10px)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {achievement.title}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-200">
                  {achievement.organization}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400">
                  <Calendar className="w-3 h-3" />
                  {achievement.duration}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400">
                  <MapPin className="w-3 h-3" />
                  {achievement.location}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 p-1 h-8 w-8 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Achievement Image */}
          {achievement.imageUrl && (
            <div className="mb-4">
              <img
                src={achievement.imageUrl}
                alt={achievement.title}
                className="w-full h-48 object-cover rounded-lg bg-gray-100 dark:bg-zinc-800"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
          )}

          {/* Achievement Description */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-zinc-200 leading-relaxed">
              {achievement.description}
            </p>
          </div>

          {/* Skills Involved */}
          {achievement.skillsInvolved.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Skills Involved
              </h4>
              <div className="flex flex-wrap gap-2">
                                  {achievement.skillsInvolved.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 px-2 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Key Points */}
          {achievement.keyPoints.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Key Points
              </h4>
              <ul className="space-y-1">
                {achievement.keyPoints.map((point, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 dark:text-zinc-300 flex items-start gap-2"
                  >
                    <span className="w-1 h-1 bg-gray-400 dark:bg-zinc-500 rounded-full mt-2 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Visit Website Button */}
          {achievement.websiteUrl && (
            <div className="flex">
              <Button
                onClick={handleVisitWebsite}
                variant="outline"
                className="flex-1 h-10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export types for easy use
export type { AchievementData };
