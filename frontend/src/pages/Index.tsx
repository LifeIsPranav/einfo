import AuthButton from "@/components/AuthButton";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import GlobalSEO from "@/components/SEO/GlobalSEO";
import ThemeToggle from "@/components/common/ThemeToggle";
import { trackPageView } from "@/utils/analytics";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  
  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Non-visible SEO analytics tracking
  useEffect(() => {
    trackPageView('/', 'E-Info.me - Digital Profile & Portfolio Maker');
  }, []);
  
  // Structured data for homepage SEO
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "E-Info.me",
    "applicationCategory": "BusinessApplication",
    "description": "Create beautiful digital profiles to showcase your work, portfolio, and professional links. The modern portfolio maker and link-in-bio tool.",
    "url": "https://e-info.me",
    "operatingSystem": "Any",
    "browserRequirements": "Modern web browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free digital profile creation"
    },
    "featureList": [
      "Digital profile creation",
      "Portfolio showcase",
      "Link organization", 
      "Professional networking",
      "Custom branding"
    ],
    "author": {
      "@type": "Organization",
      "name": "E-Info.me",
      "url": "https://e-info.me"
    }
  };

  return (
    <>
      <GlobalSEO 
        title="E-Info.me - Digital Profile & Portfolio Maker | Create Your Link in Bio"
        description="Create a beautiful, unified profile to share all your work and links. The modern portfolio maker and digital profile builder. Perfect for professionals, creators, and freelancers."
        keywords="einfo, e-info, portfolio maker, digital profile, link in bio, personal website, portfolio builder, professional profile, online presence, freelancer portfolio, creator profile"
        url="https://e-info.me"
        image="/og-image.png"
        structuredData={homeStructuredData}
      />
      
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        {/* Navigation Bar */}
        <nav className="w-full px-6 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AuthButton />
          </div>
        </nav>

        {/* Main Content - Centered */}
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 -mt-8">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Centralized Logo */}
            <div className="flex justify-center mb-10">
              <img 
                src="/logo.png" 
                alt="e-info.me logo" 
                className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain dark:brightness-0 dark:invert transition-all duration-300"
              />
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-300">
              Your Digital Identity, Simplified
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 dark:text-zinc-300 leading-relaxed max-w-xl mx-auto transition-colors duration-300">
              Create a beautiful, unified profile to share all your work and
              links.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white dark:bg-zinc-900 border-2 border-gray-900 dark:border-zinc-200 text-gray-900 dark:text-zinc-200 font-semibold hover:bg-gray-900 dark:hover:bg-zinc-200 hover:text-white dark:hover:text-zinc-900 transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => navigate("/dashboard")}
              >
                Get Started
              </Button>
              <Link to="/demo" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100 transition-all duration-300"
                >
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Index;
