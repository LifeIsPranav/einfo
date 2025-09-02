import { useState, useEffect, useRef } from "react";
import WorkExperience, {
  WorkExperienceData,
} from "@/components/WorkExperience";
import { defaultWorkExperiences } from "@/lib/workExperienceData";

interface WorkExperienceSectionProps {
  experiences?: WorkExperienceData[];
  className?: string;
  onExperienceClick?: (experienceId: string) => void;
}

export default function WorkExperienceSection({
  experiences = defaultWorkExperiences,
  className = "",
  onExperienceClick,
}: WorkExperienceSectionProps) {
  const [expandedExperience, setExpandedExperience] = useState<string | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const experienceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleExperienceExpand = (experienceId: string) => {
    if (onExperienceClick) {
      onExperienceClick(experienceId);
    } else {
      // Default behavior
      if (expandedExperience === experienceId) {
        setExpandedExperience(null);
      } else {
        setExpandedExperience(experienceId);
      }
    }
  };

  // Auto-scroll when experience expands
  useEffect(() => {
    if (expandedExperience && experienceRefs.current[expandedExperience]) {
      // Wait for the expansion animation to complete
      const timer = setTimeout(() => {
        const expandedElement = experienceRefs.current[expandedExperience];
        if (expandedElement) {
          expandedElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }, 300); // Wait 300ms for the expansion animation

      return () => clearTimeout(timer);
    }
  }, [expandedExperience]);

  // Close expandable experiences when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Always close expandable experiences when clicking outside the main container
      if (containerRef.current && !containerRef.current.contains(target)) {
        setExpandedExperience(null);
        return;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-lg mx-auto space-y-2 transition-colors duration-300 ${className}`}
    >
      {experiences.map((experience) => (
        <div
          key={experience.id}
          ref={(el) => (experienceRefs.current[experience.id] = el)}
          className="transition-colors duration-300"
        >
          <WorkExperience
            experience={experience}
            isOpen={expandedExperience === experience.id}
            onClose={() => setExpandedExperience(null)}
            onExpand={() => handleExperienceExpand(experience.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Export types for easy use
export type { WorkExperienceData };
