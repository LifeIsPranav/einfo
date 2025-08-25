import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { AlertCircle, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { googleOAuth } from "@/services/googleOAuth";
import { useAuthStore } from "@/stores";
import { useThemeStore } from "@/stores/themeStore";
import { sanitizeUsername, validateUsername } from "@/utils/validation";

const Auth = () => {
  const { signIn, isLoading, error, clearError, getRedirectPath } =
    useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initialize Google OAuth on component mount
  useEffect(() => {
    const initializeGoogle = async () => {
      try {
        setIsInitializing(true);
        setGoogleError(null);

        if (!googleOAuth.isConfigured()) {
          setGoogleError(
            "Google OAuth is not configured. Please add your Google Client ID to the environment variables.",
          );
          setIsGoogleReady(false);
          return;
        }

        await googleOAuth.initialize();
        setIsGoogleReady(true);
      } catch (error) {
        console.error("Failed to initialize Google OAuth:", error);
        setGoogleError(
          "Failed to initialize Google OAuth. Please check your configuration.",
        );
        setIsGoogleReady(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeGoogle();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      // Clear any previous errors and set loading state
      clearError();
      setGoogleError(null);
      
      // Get the setLoading function from auth store
      const { setLoading } = useAuthStore.getState();
      setLoading(true);

      if (!isGoogleReady) {
        throw new Error("Google OAuth is not ready");
      }

      // Sign in with Google OAuth
      const googleUser = await googleOAuth.signIn();

      // Send Google token to backend for validation and user creation/login
      const response = await api.googleLogin(googleUser.idToken);

      if (response.success && response.data) {
        // Convert backend user data to frontend format
        const user = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          avatar: response.data.user.avatarUrl,
          username: response.data.user.username,
          instantMessage: response.data.user.instantMessageBody,
        };

        await signIn(user);
        const redirectTo = getRedirectPath();
        navigate(redirectTo);
      } else {
        throw new Error(response.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Google sign in failed:", error);
      setGoogleError(error.message || "Google sign in failed");
      
      // Reset loading state on error
      const { setLoading } = useAuthStore.getState();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="w-full px-6 py-4 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors duration-200"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content - Centered */}
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
        <div className="max-w-md mx-auto space-y-8">
          {/* Header with Logo */}
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="E-Info Logo" 
                className="auth-logo w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain dark:brightness-0 dark:invert transition-all duration-300"
              />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-zinc-100 transition-colors duration-200">Welcome</h1>
            <p className="text-gray-600 dark:text-zinc-400 text-xl transition-colors duration-200">
              Sign in to create and manage your digital identity
            </p>
          </div>

          {/* Configuration Warning */}
          {!isGoogleReady && !isInitializing && (
            <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 transition-colors duration-200">
              <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
              <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
                {googleError ||
                  "Google OAuth is not configured. Please add your Google Client ID to continue."}
                <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300 transition-colors duration-200">
                  To set up Google OAuth:
                  <ol className="list-decimal list-inside mt-1 ml-2">
                    <li>
                      Go to{" "}
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
                      >
                        Google Cloud Console
                      </a>
                    </li>
                    <li>Create OAuth 2.0 credentials</li>
                    <li>Add your Google Client ID to the .env file</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Authentication Options */}
          <div className="space-y-4">
            {/* Google Sign In */}
            <Button
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-3 py-3 bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200 disabled:opacity-50"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isInitializing || !isGoogleReady}
            >
              {!isLoading && !isInitializing && (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Signing in...
                </div>
              ) : isInitializing ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Initializing...
                </div>
              ) : !isGoogleReady ? (
                "Google OAuth Not Configured"
              ) : (
                "Continue with Google"
              )}
            </Button>

            {(error || googleError) && (
              <Alert variant="destructive" className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 transition-colors duration-200">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="flex items-center justify-between text-red-800 dark:text-red-200 transition-colors duration-200">
                  <span>{error || googleError}</span>
                  <button
                    onClick={() => {
                      clearError();
                      setGoogleError(null);
                    }}
                    className="ml-auto text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
