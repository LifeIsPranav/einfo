import BaseLayout from "@/components/layout/BaseLayout";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Navigation from "@/components/navigation/Navigation";
import ThemeToggle from "@/components/common/ThemeToggle";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/stores";
import { useThemeStore } from "@/stores/themeStore";
import { formatNumber } from "@/utils";

import {
  Eye,
  MousePointer,
  Edit3,
  ExternalLink,
  Home,
  UserCog,
  CreditCard,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalViews: 0,
    totalClicks: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

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
      navigate(ROUTES.AUTH);
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch simple analytics
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setStatsLoading(true);
        const { api } = await import("@/services/api");
        
        const response = await api.getSimpleAnalytics();
        
        if (response.success) {
          setStats({
            totalViews: response.data.totalViews,
            totalClicks: response.data.totalClicks,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user]);

  // Refresh stats when user returns to dashboard (to show updated star count)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user?.username) {
        // Refresh star count when page becomes visible
        const starData = JSON.parse(
          localStorage.getItem("profile_stars") || "{}",
        );
        const starCount = starData[user.username] || 0;

        setStats((prevStats) => ({
          ...prevStats,
          stars: starCount,
        }));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, user?.username]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-16 h-16 object-contain animate-pulse dark:brightness-0 dark:invert"
              style={{
                filter: 'brightness(0)',
                animation: 'logo-fade 2s ease-in-out infinite'
              }}
            />
          </div>
          <LoadingSpinner size="lg" />
          <p className="text-gray-800 dark:text-zinc-300 font-light">Turning Personality into Pixels...</p>
        </div>
      </div>
    );
  }

  // Redirect will handle navigation for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <BaseLayout background="gray" noPadding>
      {/* Navigation */}
      <Navigation
        background="blur"
        rightContent={
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50 rounded-lg transition-colors bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/50 font-medium"
              aria-label="Go to homepage"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => navigate(ROUTES.ACCOUNT)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50 rounded-lg transition-colors bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/50 font-medium"
              aria-label="Manage account settings"
            >
              <UserCog className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </button>

            <button
              onClick={() => navigate(user?.username ? `/@${user.username}` : ROUTES.DEMO)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-900 hover:bg-gray-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-lg transition-colors font-medium"
              aria-label="View your profile card"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">My Card</span>
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-5xl mx-auto">
          {/* Welcome Section */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome back, {firstName}!
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 text-lg">
              Here's how your profile is performing
            </p>
          </header>

          {/* Stats Section */}
          <section
            className="grid md:grid-cols-3 gap-6 mb-16"
            aria-labelledby="stats-heading"
          >
            <h2 id="stats-heading" className="sr-only">
              Profile Statistics
            </h2>

            {/* Total Views */}
            <div className="bg-white dark:bg-zinc-900/20 rounded-xl border border-gray-100 dark:border-zinc-800/30 shadow-sm dark:shadow-none p-6 text-center hover:shadow-md dark:hover:bg-zinc-900/30 transition-all duration-200">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800/30 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-gray-600 dark:text-zinc-400" aria-hidden="true" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                  Total Views
                </h3>
                {statsLoading ? (
                  <div className="h-12 flex items-center justify-center">
                    <LoadingSpinner size="md" />
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.totalViews)}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  People who viewed your profile
                </p>
              </div>
            </div>

            {/* Brand Card with Logo */}
            <div 
              onClick={() => user?.username && (window.location.href = `/@${user.username}`)}
              className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-zinc-800 dark:to-zinc-900 rounded-xl shadow-sm dark:shadow-none p-6 text-center hover:shadow-md dark:hover:from-zinc-700 dark:hover:to-zinc-800 transition-all duration-200 cursor-pointer hover:scale-105 transform"
            >
              <div className="flex justify-center mb-4">
                <img 
                  src="/logo.png" 
                  alt="E-Info Logo" 
                  className="h-12 w-auto filter brightness-0 invert"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-300 dark:text-zinc-400 uppercase tracking-wider">
                  Powered by
                </h3>
                <p className="text-lg font-bold text-white dark:text-zinc-100">
                  E-Info
                </p>
                <p className="text-sm text-gray-400 dark:text-zinc-400">
                  Simplifying Your Digital Presence
                </p>
              </div>
            </div>

            {/* Total Clicks */}
            <div className="bg-white dark:bg-zinc-900/20 rounded-xl border border-gray-100 dark:border-zinc-800/30 shadow-sm dark:shadow-none p-6 text-center hover:shadow-md dark:hover:bg-zinc-900/30 transition-all duration-200">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800/30 rounded-full flex items-center justify-center">
                  <MousePointer className="w-6 h-6 text-gray-600 dark:text-zinc-400" aria-hidden="true" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                  Total Clicks
                </h3>
                {statsLoading ? (
                  <div className="h-12 flex items-center justify-center">
                    <LoadingSpinner size="md" />
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.totalClicks)}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  Clicks on all your links
                </p>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section
            className="flex flex-col sm:flex-row gap-4 justify-center"
            aria-labelledby="actions-heading"
          >
            <h2 id="actions-heading" className="sr-only">
              Quick Actions
            </h2>

            <button
              onClick={() => navigate(ROUTES.EDIT_PROFILE)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
              aria-describedby="edit-card-description"
            >
              <Edit3 className="w-4 h-4" />
              Edit My Card
            </button>
            <div id="edit-card-description" className="sr-only">
              Modify your profile information and customize your card
            </div>

            <button
              onClick={() => navigate(user?.username ? `/@${user.username}` : ROUTES.DEMO)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
              aria-describedby="view-card-description"
            >
              <ExternalLink className="w-4 h-4" />
              View My Card
            </button>
            <div id="view-card-description" className="sr-only">
              See how your profile card appears to others
            </div>
          </section>
        </div>
      </main>

      {/* Added padding bottom for mobile view to prevent content overlap with footer */}
      <div className="pb-16 md:pb-0"></div>
      <Footer position="relative" />
    </BaseLayout>
  );
};

export default Dashboard;
