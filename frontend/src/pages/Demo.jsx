import AuthButton from "@/components/AuthButton";
import EducationSection from "@/components/EducationSection";
import AchievementSection from "@/components/AchievementSection";
import Footer from "@/components/Footer";
import LinkButton from "@/components/LinkButton";
import Logo from "@/components/Logo";
import PortfolioSection from "@/components/PortfolioSection";
import UnifiedProfileSection from "@/components/UnifiedProfileSection";
import WorkExperienceSection from "@/components/WorkExperienceSection";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getIconFromName } from "@/lib/iconUtils";
import { useProfileStore } from "@/stores";
import { useThemeStore } from "@/stores/themeStore";
import { useEffect } from "react";

const Demo = () => {
  const {
    profile,
    projects,
    portfolioProjects,
    workExperiences,
    education,
    achievements,
    visibilitySettings,
  } = useProfileStore();
  
  const { theme } = useThemeStore();

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-6 relative transition-colors duration-300">
      {/* Logo - Top Left */}
      <div className="absolute top-4 left-4 z-50">
        <Logo />
      </div>

      {/* Navigation - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <ThemeToggle />
        <AuthButton />
      </div>

      {/* Main Content Container - Custom spacing for profile and links */}
      <div className="w-full max-w-lg mx-auto pt-40 pb-24">
        {/* Profile Section */}
        <UnifiedProfileSection profile={profile} canEdit={false} />

        {/* Links Section - Double the current gap from profile card */}
        {visibilitySettings.showLinks && projects.length > 0 && (
          <div className="space-y-2 mt-4">
            {projects.map((project) => (
              <LinkButton
                key={project.id}
                href={project.href}
                title={project.title}
                description={project.description}
                icon={project.icon ? getIconFromName(project.icon) : null}
                onDirectLink={(href) =>
                  window.open(href, "_blank", "noopener,noreferrer")
                }
              />
            ))}
          </div>
        )}

        {/* Work Experience Section */}
        {visibilitySettings.showExperience && workExperiences.length > 0 && (
          <div className="space-y-4 mt-24">
            {visibilitySettings.showTitles && (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  Experience
                </h2>
                <p className="text-gray-600 dark:text-zinc-400 text-sm transition-colors duration-300">
                  My professional journey and key achievements
                </p>
              </div>
            )}
            <WorkExperienceSection experiences={workExperiences} />
          </div>
        )}

        {/* Achievements Section */}
        {visibilitySettings.showAchievements && achievements.length > 0 && (
          <div className="space-y-4 mt-24">
            {visibilitySettings.showTitles && (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  Achievements
                </h2>
                <p className="text-gray-600 dark:text-zinc-400 text-sm transition-colors duration-300">
                  Recognition and accomplishments throughout my career
                </p>
              </div>
            )}
            <AchievementSection achievements={achievements} />
          </div>
        )}

        {/* Portfolio Section */}
        {visibilitySettings.showPortfolio && portfolioProjects.length > 0 && (
          <div className="space-y-4 mt-24">
            {visibilitySettings.showTitles && (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  Portfolio
                </h2>
                <p className="text-gray-600 dark:text-zinc-400 text-sm transition-colors duration-300">
                  Explore my latest projects and creative work
                </p>
              </div>
            )}
            <PortfolioSection projects={portfolioProjects} />
          </div>
        )}

        {/* Education Section */}
        {visibilitySettings.showEducation && education.length > 0 && (
          <div className="space-y-4 mt-24 mb-16">
            {visibilitySettings.showTitles && (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  Education & Certifications
                </h2>
                <p className="text-gray-600 dark:text-zinc-400 text-sm transition-colors duration-300">
                  My educational journey and professional certifications
                </p>
              </div>
            )}
            <EducationSection education={education} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Demo;
