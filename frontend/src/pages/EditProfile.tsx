import AuthButton from "@/components/AuthButton";
import EditableAchievementSection from "@/components/EditableAchievementSection";
import EditableEducationSection from "@/components/EditableEducationSection";
import EditableExperienceSection from "@/components/EditableExperienceSection";
import EditableExtracurricularSection from "@/components/EditableExtracurricularSection";
import EditableLinksSection from "@/components/EditableLinksSection";
import EditablePortfolioSection from "@/components/EditablePortfolioSection";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ThemeToggle from "@/components/common/ThemeToggle";
import Logo from "@/components/Logo";
import UnifiedProfileSection from "@/components/UnifiedProfileSection";
import { Eye, EyeOff, LayoutDashboard, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { EducationData } from "@/components/Education";
import type { WorkExperienceData } from "@/components/WorkExperience";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { defaultAchievements } from "@/lib/achievementsData";
import { defaultExtracurriculars } from "@/lib/extracurricularsData";
import { getIconFromName } from "@/lib/iconUtils";
import type { PortfolioProject } from "@/lib/portfolioData";
import type { PersonProfile, ProjectLink } from "@/lib/profileData";
import { api } from "@/services/api";
import { useAuthStore, useProfileStore } from "@/stores";
import { useThemeStore } from "@/stores/themeStore";
import type { VisibilitySettings } from "@/stores/profileStore";
import type { AchievementData, ExtracurricularData } from "@/types/newSections";

const EditProfile = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const {
    profile,
    projects,
    portfolioProjects,
    workExperiences,
    education,
    visibilitySettings,
    updateProfile,
    updateProjects,
    updatePortfolioProjects,
    updateWorkExperiences,
    updateEducation,
    updateVisibilitySettings,
    initializeWithUserData,
  } = useProfileStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Local state for new sections (hardcoded for now)
  const [achievements, setAchievements] = useState<AchievementData[]>(defaultAchievements);
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularData[]>(defaultExtracurriculars);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Initialize profile with user data and load profile data
  useEffect(() => {
    if (user) {
      initializeWithUserData(user);
      loadProfileData();
    }
  }, [user, initializeWithUserData]);

  const loadProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await api.getProfile();
      if (response.success && response.data) {
        const { profile: profileData, visibilitySettings: visibility, links, experiences, portfolio, education: educationData } = response.data;
        
        // Transform backend data to match frontend interface
        const transformedLinks = (links || []).map((link: any) => ({
          ...link,
          href: link.url || link.href, // Map url to href
          icon: link.iconName || "Link", // iconName from backend is already a string
        }));
        
        // Transform portfolio data to match frontend interface
        const transformedPortfolio = (portfolio || []).map((project: any) => ({
          ...project,
          href: project.url || project.href, // Map url to href
        }));
        
        // Transform experience data to match frontend interface
        const transformedExperiences = (experiences || []).map((exp: any) => ({
          ...exp,
          duration: exp.duration || "Duration not specified", // Use duration field directly
        }));
        
        // Transform education data to match frontend interface
        const transformedEducation = (educationData || []).map((edu: any) => ({
          ...edu,
          duration: edu.duration || "Duration not specified", // Use duration field directly
        }));
        
        // Update all store data with backend data
        updateProfile(profileData);
        updateVisibilitySettings(visibility);
        updateProjects(transformedLinks);
        updateWorkExperiences(transformedExperiences);
        updatePortfolioProjects(transformedPortfolio);
        updateEducation(transformedEducation);
      }

      // Load achievements and extracurriculars separately
      await Promise.all([
        loadAchievements(),
        loadExtracurriculars()
      ]);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadAchievements = async () => {
    try {
      const response = await api.getAchievements();
      if (response.success && response.data) {
        setAchievements(response.data.achievements || []);
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
      // Keep default achievements on error
    }
  };

  const loadExtracurriculars = async () => {
    try {
      const response = await api.getExtracurriculars();
      if (response.success && response.data) {
        setExtracurriculars(response.data.extracurriculars || []);
      }
    } catch (error) {
      console.error('Failed to load extracurriculars:', error);
      // Keep default extracurriculars on error
    }
  };

  // API-integrated update functions
  const handleProfileUpdate = async (newProfile: PersonProfile) => {
    try {
      const response = await api.updateBasicProfile(newProfile);
      if (response.success) {
        updateProfile(newProfile);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleProjectsUpdate = async (newProjects: ProjectLink[]) => {
    try {
      // Transform frontend data to backend format
      const transformedProjects = newProjects.map((project: any) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        href: project.href || project.url, // Ensure href is included
        url: project.href || project.url, // Map href to url
        iconName: typeof project.icon === 'string' ? project.icon : "Link", // Ensure iconName is a string
        imageUrl: project.imageUrl || "",
        projectDetails: project.projectDetails || "",
      }));
      
      const response = await api.updateLinks(transformedProjects);
      if (response.success) {
        updateProjects(newProjects);
        toast.success('Links updated successfully');
      } else {
        console.error('Links update failed:', response.message);
        toast.error(response.message || 'Failed to update links');
      }
    } catch (error) {
      console.error('Failed to update links:', error);
      // Check if it's an authentication error
      if (error.message?.includes('Authentication') || error.message?.includes('401')) {
        toast.error('Authentication expired. Please sign in again.');
        // You might want to redirect to login page here
      } else {
        toast.error('Failed to update links. Please try again.');
      }
    }
  };

  const handlePortfolioUpdate = async (newPortfolio: PortfolioProject[]) => {
    try {
      // Transform portfolio data back to backend format
      const backendPortfolio = newPortfolio.map((project: any) => ({
        ...project,
        url: project.href || project.url, // Map href back to url
        // iconName is already stored as string, no conversion needed
      }));
      
      const response = await api.updatePortfolio(backendPortfolio);
      if (response.success) {
        updatePortfolioProjects(newPortfolio);
        toast.success('Portfolio updated successfully');
      } else {
        toast.error('Failed to update portfolio');
      }
    } catch (error) {
      console.error('Failed to update portfolio:', error);
      toast.error('Failed to update portfolio');
    }
  };

  const handleExperiencesUpdate = async (newExperiences: WorkExperienceData[]) => {
    try {
      // Transform frontend data back to backend format
      const backendExperiences = newExperiences.map(exp => ({
        ...exp,
        duration: exp.duration, // Pass duration as-is
        // iconName is already stored as string, no conversion needed
      }));
      
      const response = await api.updateExperiences(backendExperiences);
      if (response.success) {
        updateWorkExperiences(newExperiences);
        toast.success('Work experience updated successfully');
      } else {
        toast.error('Failed to update work experience');
      }
    } catch (error) {
      console.error('Failed to update work experience:', error);
      toast.error('Failed to update work experience');
    }
  };

  const handleEducationUpdate = async (newEducation: EducationData[]) => {
    try {
      // Transform frontend data back to backend format
      const backendEducation = newEducation.map(edu => ({
        ...edu,
        duration: edu.duration, // Pass duration as-is
        // iconName is already stored as string, no conversion needed
      }));
      
      const response = await api.updateEducation(backendEducation);
      if (response.success) {
        updateEducation(newEducation);
        toast.success('Education updated successfully');
      } else {
        toast.error('Failed to update education');
      }
    } catch (error) {
      console.error('Failed to update education:', error);
      toast.error('Failed to update education');
    }
  };

  // API-integrated handlers for new sections
  const handleAchievementsUpdate = async (newAchievements: AchievementData[]) => {
    try {
      const response = await api.updateAchievements(newAchievements);
      if (response.success) {
        setAchievements(newAchievements);
        toast.success('Achievements updated successfully');
      } else {
        toast.error('Failed to update achievements');
      }
    } catch (error) {
      console.error('Failed to update achievements:', error);
      toast.error('Failed to update achievements');
    }
  };

  const handleExtracurricularsUpdate = async (newExtracurriculars: ExtracurricularData[]) => {
    try {
      const response = await api.updateExtracurriculars(newExtracurriculars);
      if (response.success) {
        setExtracurriculars(newExtracurriculars);
        toast.success('Extracurriculars updated successfully');
      } else {
        toast.error('Failed to update extracurriculars');
      }
    } catch (error) {
      console.error('Failed to update extracurriculars:', error);
      toast.error('Failed to update extracurriculars');
    }
  };

  const handleVisibilityUpdate = async (newSettings: VisibilitySettings) => {
    try {
      const response = await api.updateVisibilitySettings(newSettings);
      if (response.success) {
        updateVisibilitySettings(newSettings);
        toast.success('Visibility settings updated successfully');
      } else {
        toast.error('Failed to update visibility settings');
      }
    } catch (error) {
      console.error('Failed to update visibility settings:', error);
      toast.error('Failed to update visibility settings');
    }
  };

  // Show loading while checking auth or loading profile data
  if (authLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-16 h-16 object-contain animate-pulse"
              style={{
                filter: 'brightness(0)',
                animation: 'logo-fade 2s ease-in-out infinite'
              }}
            />
          </div>
          <LoadingSpinner size="lg" />
          <p className="text-gray-800 dark:text-zinc-200 font-light transition-colors duration-300">Turning Personality into Pixels...</p>
        </div>
      </div>
    );
  }

  // Redirect will handle navigation for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 p-4 md:p-6 relative transition-colors duration-300">
      {/* Logo - Top Left */}
      <div className="absolute top-4 left-4 z-50">
        <Logo />
      </div>

      {/* Navigation - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <ThemeToggle />
        <Button
          onClick={() => (window.location.href = "/dashboard")}
          variant="outline"
          size="sm"
          className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium transition-colors duration-200"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        <AuthButton />
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-lg mx-auto pt-40 pb-64">
        {/* Info Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            My Profile
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 text-sm transition-colors duration-300">
            Customize your digital card and links below
          </p>
        </div>

        {/* Editable Profile Section - Closer to title */}
        <div className="mb-20">
          <UnifiedProfileSection
            profile={profile}
            canEdit={true}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>

        {/* Visibility Controls Section */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-6 shadow-sm mb-20 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
              Visibility Settings
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 transition-colors duration-300">
            Control which sections are visible on your public profile
          </p>

          <div className="space-y-4">
            {/* Section Visibility Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="show-links"
                    className="text-sm font-medium text-gray-700 dark:text-zinc-200 transition-colors duration-300"
                  >
                    Links Section
                  </Label>
                </div>
                <Switch
                  id="show-links"
                  checked={visibilitySettings.showLinks}
                  onCheckedChange={(checked) =>
                    handleVisibilityUpdate({
                      ...visibilitySettings,
                      showLinks: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="show-experience"
                    className="text-sm font-medium text-gray-700 dark:text-zinc-200 transition-colors duration-300"
                  >
                    Experience Section
                  </Label>
                </div>
                <Switch
                  id="show-experience"
                  checked={visibilitySettings.showExperience}
                  onCheckedChange={(checked) =>
                    handleVisibilityUpdate({
                      ...visibilitySettings,
                      showExperience: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="show-portfolio"
                    className="text-sm font-medium text-gray-700 dark:text-zinc-200 transition-colors duration-300"
                  >
                    Portfolio Section
                  </Label>
                </div>
                <Switch
                  id="show-portfolio"
                  checked={visibilitySettings.showPortfolio}
                  onCheckedChange={(checked) =>
                    handleVisibilityUpdate({
                      ...visibilitySettings,
                      showPortfolio: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="show-education"
                    className="text-sm font-medium text-gray-700 dark:text-zinc-200 transition-colors duration-300"
                  >
                    Education Section
                  </Label>
                </div>
                <Switch
                  id="show-education"
                  checked={visibilitySettings.showEducation}
                  onCheckedChange={(checked) =>
                    handleVisibilityUpdate({
                      ...visibilitySettings,
                      showEducation: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="show-achievements"
                    className="text-sm font-medium text-gray-700 dark:text-zinc-200 transition-colors duration-300"
                  >
                    Achievements
                  </Label>
                </div>
                <Switch
                  id="show-achievements"
                  checked={visibilitySettings.showAchievements}
                  onCheckedChange={(checked) =>
                    handleVisibilityUpdate({
                      ...visibilitySettings,
                      showAchievements: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="show-extracurriculars"
                    className="text-sm font-medium text-gray-700 dark:text-zinc-200 transition-colors duration-300"
                  >
                    Extracurriculars
                  </Label>
                </div>
                <Switch
                  id="show-extracurriculars"
                  checked={visibilitySettings.showExtracurriculars}
                  onCheckedChange={(checked) =>
                    handleVisibilityUpdate({
                      ...visibilitySettings,
                      showExtracurriculars: checked,
                    })
                  }
                />
              </div>
            </div>

            {/* Title Visibility Control */}
            <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-zinc-800 rounded-lg border border-blue-200 dark:border-zinc-600 transition-colors duration-300">
                <div>
                  <Label
                    htmlFor="show-titles"
                    className="text-sm font-semibold text-gray-800 dark:text-zinc-100 transition-colors duration-300"
                  >
                    Show Section Titles & Descriptions
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 transition-colors duration-300">
                    When disabled, only content will be shown without section
                    headers
                  </p>
                </div>
                <Switch
                  id="show-titles"
                  checked={visibilitySettings.showTitles}
                  onCheckedChange={(checked) =>
                    handleVisibilityUpdate({
                      ...visibilitySettings,
                      showTitles: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Editable Links Section - Closer to profile card */}
        <div className="mb-20">
          <EditableLinksSection
            projects={projects}
            onProjectsUpdate={handleProjectsUpdate}
          />
        </div>

        {/* Editable Experience Section */}
        <div className="mb-20">
          <EditableExperienceSection
            experiences={workExperiences}
            onExperiencesUpdate={handleExperiencesUpdate}
          />
        </div>

        {/* Editable Portfolio Section */}
        <div className="mb-20">
          <EditablePortfolioSection
            projects={portfolioProjects}
            onProjectsUpdate={handlePortfolioUpdate}
          />
        </div>

        {/* Editable Education Section */}
        <div className="mb-20">
          <EditableEducationSection
            education={education}
            onEducationUpdate={handleEducationUpdate}
          />
        </div>

        {/* Editable Achievements Section */}
        <div className="mb-20">
          <EditableAchievementSection
            achievements={achievements}
            onAchievementsUpdate={handleAchievementsUpdate}
          />
        </div>

        {/* Editable Extracurricular Section */}
        <div className="mb-20">
          <EditableExtracurricularSection
            extracurriculars={extracurriculars}
            onExtracurricularsUpdate={handleExtracurricularsUpdate}
          />
        </div>

        {/* Extra spacing for consistency with public profile */}
        <div className="h-0"></div>
      </div>
      <div className="pt-12">
        <Footer position="relative" />
      </div>
    </div>
  );
};

export default EditProfile;
