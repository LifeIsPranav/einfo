import AchievementSection from "@/components/AchievementSection";
import AuthButton from "@/components/AuthButton";
import EducationSection from "@/components/EducationSection";
import ExtracurricularSection from "@/components/ExtracurricularSection";
import Footer from "@/components/Footer";
import LinkButton from "@/components/LinkButton";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ThemeToggle from "@/components/common/ThemeToggle";
import Logo from "@/components/Logo";
import PortfolioSection from "@/components/PortfolioSection";
import ProfileSEO from "@/components/SEO/ProfileSEO";
import UnifiedProfileSection from "@/components/UnifiedProfileSection";
import WorkExperienceSection from "@/components/WorkExperienceSection";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { defaultAchievements } from "@/lib/achievementsData";
import { defaultExtracurriculars } from "@/lib/extracurricularsData";
import { getIconFromName } from "@/lib/iconUtils";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores";
import { useThemeStore } from "@/stores/themeStore";
import { trackLinkClick, trackPageView, trackProfileView, trackShareEvent } from "@/utils/analytics";

import {
  Home,
  Share2,
  ExternalLink,
  AlertCircle,
  Eye,
  LayoutGrid,
} from "lucide-react";

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();

  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check if URL starts with @ (proper format)
  const hasAtSymbol = location.pathname.startsWith('/@');
  
  // Clean username (remove @ if present)
  const cleanUsername = username?.startsWith("@")
    ? username.slice(1)
    : username;

  // Handle invalid URL format (without @)
  useEffect(() => {
    if (username && !hasAtSymbol) {
      // Show redirect message instead of loading
      setShowRedirectMessage(true);
      setIsLoading(false);
      return;
    } else if (username && hasAtSymbol) {
      // Reset redirect message for valid URLs
      setShowRedirectMessage(false);
    }
  }, [username, hasAtSymbol]);

  useEffect(() => {
    if (!cleanUsername || !hasAtSymbol || showRedirectMessage) {
      setIsLoading(false);
      return;
    }

    loadProfile();
    
    // Non-visible SEO analytics tracking
    if (cleanUsername) {
      trackPageView(window.location.pathname, `${cleanUsername} Profile | E-Info.me`);
    }
  }, [cleanUsername, hasAtSymbol, showRedirectMessage]);

  useEffect(() => {
    // Check if viewing own profile
    if (user && profile && user.username === profile.username) {
      setIsOwner(true);
    }
  }, [user, profile]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.getPublicProfile(cleanUsername!);

      if (response.success && response.data) {
        // Transform portfolio and experience data to match frontend interface
        const apiData = response.data as any; // Bypass TypeScript checking to access the original data structure
        const transformedData = {
          ...apiData,
          portfolio: apiData.portfolio ? apiData.portfolio.map((project: any) => ({
            ...project,
            href: project.url || project.href, // Map url to href
          })) : [],
          experiences: apiData.experiences ? apiData.experiences.map((exp: any) => ({
            ...exp,
            duration: exp.duration || "Duration not specified", // Use duration field directly
          })) : [],
          education: apiData.education ? apiData.education.map((edu: any) => ({
            ...edu,
            duration: edu.duration || "Duration not specified", // Use duration field directly
          })) : [],
          links: apiData.links ? apiData.links.map((link: any) => ({
            ...link,
            href: link.url || link.href, // Map url to href
            icon: link.iconName ? getIconFromName(link.iconName) : null, // Convert iconName to icon component
          })) : [],
          achievements: apiData.achievements || [],
          extracurriculars: apiData.extracurriculars || [],
        };
        
        setProfile(transformedData);
        
        // Non-visible SEO analytics tracking  
        if (cleanUsername) {
          trackProfileView(cleanUsername, transformedData);
        }
      } else {
        setError("Profile not found");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setError("Profile not found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/@${cleanUsername}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.user.name} - E-Info.me`,
          text: `Check out ${profile?.user.name}'s profile on E-Info.me`,
          url,
        });
        // Non-visible SEO tracking
        trackShareEvent('native_share', url);
      } catch (error) {
        // User cancelled or error occurred
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Profile link copied to clipboard!");
      // Non-visible SEO tracking
      trackShareEvent('clipboard_copy', text);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleLinkClick = (href: string, title: string) => {
    // Track click asynchronously
    (async () => {
      try {
        const { api } = await import("@/services/api");
        await api.trackClick(cleanUsername);
      } catch (error) {
        console.error("Failed to track click:", error);
        // Continue even if tracking fails
      }
    })();

    // Non-visible SEO analytics tracking
    trackLinkClick(href, title);

    // Open link immediately
    window.open(href, "_blank", "noopener,noreferrer");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center transition-colors duration-300">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-16 h-16 object-contain animate-pulse dark:brightness-0 dark:invert transition-all duration-300"
              style={{
                filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'brightness(0)',
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

  // Show redirect message for invalid URL format
  if (showRedirectMessage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-6 transition-colors duration-300">
        {/* Logo - Top Left */}
        <div className="absolute top-4 left-4 z-50">
          <Logo />
        </div>

        {/* Navigation - Top Right */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
          <ThemeToggle />
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        {/* Redirect Message Content */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center transition-colors duration-300">
              <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 transition-colors duration-300">
                Looking for a profile?
              </h1>
              <p className="text-gray-600 dark:text-zinc-400 transition-colors duration-300">
                User profiles start with the @ symbol
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Try going to:
              </p>
              <Button
                onClick={() => {
                  navigate(`/@${cleanUsername}`, { replace: true });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <span>/@{cleanUsername}</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/")} variant="default">
                Go Home
              </Button>
              <Button
                onClick={() => navigate("/demo")}
                variant="outline"
                size="lg"
                className="border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100 transition-all duration-300"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-6 transition-colors duration-300">
        {/* Logo - Top Left */}
        <div className="absolute top-4 left-4 z-50">
          <Logo />
        </div>

        {/* Navigation - Top Right */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
          <ThemeToggle />
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        {/* Error Content */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center transition-colors duration-300">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 transition-colors duration-300">
                404 - Profile Not Found
              </h1>
              <p className="text-gray-600 dark:text-zinc-400 transition-colors duration-300">
                Looking for profile @{cleanUsername}? It doesn't exist or has been removed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => navigate("/")} 
                variant="default"
                className="bg-gray-900 dark:bg-zinc-700 hover:bg-gray-800 dark:hover:bg-zinc-600 text-white transition-colors duration-200"
              >
                Go Home
              </Button>
              <Button
                onClick={() => navigate("/demo")}
                variant="outline"
                size="lg"
                className="border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100 transition-all duration-300"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Non-visible SEO optimization */}
      {profile && cleanUsername && (
        <ProfileSEO profile={profile} username={cleanUsername} />
      )}
      
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-6 relative transition-colors duration-300">
      {/* Logo - Top Left */}
      <div className="absolute top-4 left-4 z-50">
        <Logo />
      </div>

      {/* Navigation - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <ThemeToggle />
        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 px-4 transition-colors duration-200"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        {isOwner ? (
          <Link to="/mycard">
            <Button
              size="sm"
              className="bg-gray-900 dark:bg-zinc-700 hover:bg-gray-800 dark:hover:bg-zinc-600 text-white transition-colors duration-200"
            >
              Edit Profile
            </Button>
          </Link>
        ) : !isAuthenticated ? (
          <Link to="/auth" className="hidden md:inline-flex">
            <Button
              size="sm"
              className="bg-gray-700 dark:bg-zinc-700 hover:bg-gray-800 dark:hover:bg-zinc-600 text-white transition-colors duration-200"
            >
              Want Your Public Profile?
            </Button>
          </Link>
        ) : (
          <Link to="/dashboard" className="hidden md:inline-flex">
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        )}

        <AuthButton />
      </div>

      {/* Owner Alert */}
      {isOwner && (
        <div className="max-w-lg mx-auto mt-20 mb-4">
          <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              This is how your profile appears to others. You can{" "}
              <Link
                to="/mycard"
                className="font-medium underline hover:no-underline text-blue-700 dark:text-blue-300"
              >
                edit your profile
              </Link>{" "}
              or view your{" "}
              <Link
                to="/dashboard"
                className="font-medium underline hover:no-underline text-blue-700 dark:text-blue-300"
              >
                analytics dashboard
              </Link>
              .
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content Container */}
      <div className="w-full max-w-lg mx-auto pt-40 pb-64 transition-colors duration-300">{/* Profile Section */}
        <UnifiedProfileSection profile={profile.profile} canEdit={false} />

        {/* Links Section */}
        {profile.visibilitySettings.showLinks && profile.links.length > 0 && (
          <div className="space-y-2 mt-4">
            {profile.links.map((project) => (
              <LinkButton
                key={project.id}
                href={project.url}
                title={project.title}
                description={project.description}
                icon={project.iconName ? getIconFromName(project.iconName) : null}
                onDirectLink={() => handleLinkClick(project.url, project.title)}
              />
            ))}
          </div>
        )}

        {/* Work Experience Section */}
        {profile.visibilitySettings.showExperience &&
          profile.experiences.length > 0 && (
            <div className="space-y-4 mt-24">
              {profile.visibilitySettings.showTitles && (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
                    Experience
                  </h2>
                  <p className="text-gray-600 dark:text-zinc-400 text-sm">
                    Professional journey and key achievements
                  </p>
                </div>
              )}
              <WorkExperienceSection experiences={profile.experiences} />
            </div>
          )}

        {/* Portfolio Section */}
        {profile.visibilitySettings.showPortfolio &&
          profile.portfolio.length > 0 && (
            <div className="space-y-4 mt-24">
              {profile.visibilitySettings.showTitles && (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
                    Portfolio
                  </h2>
                  <p className="text-gray-600 dark:text-zinc-400 text-sm">
                    Selected projects and creative work
                  </p>
                </div>
              )}
              <PortfolioSection projects={profile.portfolio} />
            </div>
          )}

        {/* Education Section */}
        {profile.visibilitySettings.showEducation &&
          profile.education.length > 0 && (
            <div className="space-y-4 mt-24">
              {profile.visibilitySettings.showTitles && (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
                    Education & Certifications
                  </h2>
                  <p className="text-gray-600 dark:text-zinc-400 text-sm">
                    My educational journey and professional certifications
                  </p>
                </div>
              )}
              <EducationSection education={profile.education} />
            </div>
          )}

        {/* Achievements Section */}
        {profile.visibilitySettings.showAchievements && profile.achievements && profile.achievements.length > 0 && (
          <div className="space-y-4 mt-24">
            {profile.visibilitySettings.showTitles && (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
                  Achievements
                </h2>
                <p className="text-gray-600 dark:text-zinc-400 text-sm">
                  Notable accomplishments and recognitions
                </p>
              </div>
            )}
            <AchievementSection achievements={profile.achievements} />
          </div>
        )}

        {/* Extracurricular Section */}
        {profile.visibilitySettings.showExtracurriculars && profile.extracurriculars && profile.extracurriculars.length > 0 && (
          <div className="space-y-4 mt-24">
            {profile.visibilitySettings.showTitles && (
              <div className="text-center">
                <h2 className="text-2xl font-semibold dark:text-white text-gray-900 mb-2">
                  Extracurricular Activities
                </h2>
                <p className="text-gray-600 dark:text-white text-sm">
                  Community involvement and personal interests
                </p>
              </div>
            )}
            <ExtracurricularSection extracurriculars={profile.extracurriculars} />
          </div>
        )}

        {/* Bottom spacing for non-authenticated users */}
        {!isAuthenticated && (
          <div className="h-0"></div>
        )}
      </div>

      <div className="pt-12">
        <Footer position="relative" />
      </div>
    </div>
    </>
  );
};

export default PublicProfile;
