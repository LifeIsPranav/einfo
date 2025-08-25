import AuthButton from "@/components/AuthButton";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { apiClient } from "@/services/apiClient";
import { useAuthStore } from "@/stores";
import { useThemeStore } from "@/stores/themeStore";
import { isNetworkError, safeApiCall } from "@/utils/apiSafety";
import { sanitizeUsername, validateUsername } from "@/utils/validation";

import {
  User,
  Save,
  ArrowLeft,
  Home,
  CreditCard,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserAccountData {
  name: string;
  username: string;
  instantMessageSubject: string;
  instantMessage: string;
}

interface ValidationErrors {
  username?: string;
  name?: string;
  instantMessageSubject?: string;
  instantMessage?: string;
}

const MyAccount = () => {
  const {
    user,
    updateUser,
    signOut,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  // TODO: Re-enable when delete account is implemented
  // const [deleteLoading, setDeleteLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  // TODO: Re-enable when delete account is implemented
  // const [verificationData, setVerificationData] = useState({
  //   username: "",
  // });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Generate a more unique default username
  const generateDefaultUsername = (email: string) => {
    if (!email) return "";
    
    const emailPrefix = email.split("@")[0];
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${emailPrefix}${timestamp}${randomNum}`.toLowerCase();
  };

  const [accountData, setAccountData] = useState<UserAccountData>({
    name: "",
    username: "",
    instantMessageSubject: "",
    instantMessage: "",
  });

  // Debounced username availability check
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      // Reset previous state
      setUsernameAvailable(null);
      
      if (!accountData.username || accountData.username === user?.username) {
        return;
      }

      // Don't check availability if username is too short (less than 5 characters)
      if (accountData.username.length < 5) {
        return;
      }

      const usernameValidation = validateUsername(accountData.username);
      if (!usernameValidation.isValid) {
        return;
      }

      setUsernameCheckLoading(true);
      try {
        const response = await api.checkUsernameAvailability(accountData.username);
        console.log("Username availability check response:", response);
        
        if (response.success && response.data) {
          setUsernameAvailable(response.data.available);
        } else {
          // If the API call fails, assume username might be taken or there's an issue
          setUsernameAvailable(null);
          console.warn("Username availability check failed:", response.message);
        }
      } catch (error) {
        console.error("Username availability check error:", error);
        setUsernameAvailable(null);
      } finally {
        setUsernameCheckLoading(false);
      }
    };

    // Increase debounce time to 1 second to reduce API calls
    const timeoutId = setTimeout(checkUsernameAvailability, 1000);
    return () => clearTimeout(timeoutId);
  }, [accountData.username, user?.username]);
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load complete user data from backend
  useEffect(() => {
    const loadUserData = async () => {
      if (!user || !isAuthenticated) return;

      setIsSyncing(true);

      // Use safe API call wrapper to handle fetch errors gracefully
      const response = await safeApiCall(() => api.getCurrentUser());

      if (response?.success && response.data) {
        const userData = response.data.user;
        setAccountData({
          name: userData.name || "",
          username: userData.username || "",
          instantMessageSubject:
            userData.instant_message_subject || "Let's Connect!",
          instantMessage:
            userData.instant_message_body ||
            "Hey there! I'm using e-info.me to connect and share.",
        });
        setIsBackendConnected(true);
      } else {
        // API call failed or returned null, use local data
        setIsBackendConnected(false);

        if (user) {
          setAccountData((prev) => ({
            ...prev,
            name: user.name || "",
            username: user.username || generateDefaultUsername(user.email || ""),
            instantMessageSubject: "Let's Connect!",
            instantMessage: "Hey there! I'm using e-info.me to connect and share.",
          }));
        }
      }

      setIsSyncing(false);
      setIsDataLoaded(true);
    };

    loadUserData();
  }, [user, isAuthenticated, toast]);

  const handleFieldChange = (field: keyof UserAccountData, value: string) => {
    let processedValue = value;

    // Sanitize username input
    if (field === "username") {
      processedValue = sanitizeUsername(value);
    }

    setAccountData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    setHasChanges(true);
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate username
    const usernameValidation = validateUsername(accountData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.error;
    }

    // Check username availability
    if (usernameAvailable === false) {
      errors.username = "This username is already taken. Please choose a different one.";
    }

    // Validate name
    if (!accountData.name.trim()) {
      errors.name = "Name is required";
    }

    // Validate instant message subject
    if (!accountData.instantMessageSubject.trim()) {
      errors.instantMessageSubject = "Instant message subject is required";
    }

    // Validate instant message body
    if (!accountData.instantMessage.trim()) {
      errors.instantMessage = "Instant message body is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // First check if username is available if it has changed
    const currentUsername = user?.username;
    if (accountData.username !== currentUsername) {
      // Only check if we don't already have the availability status
      if (usernameAvailable === null && !usernameCheckLoading) {
        setUsernameCheckLoading(true);
        try {
          const usernameCheck = await api.checkUsernameAvailability(accountData.username);
          console.log("Final username check before save:", usernameCheck);
          
          if (usernameCheck.success && usernameCheck.data) {
            setUsernameAvailable(usernameCheck.data.available);
            
            if (!usernameCheck.data.available) {
              setUsernameCheckLoading(false);
              toast({
                title: "Username Not Available",
                description: `The username "${accountData.username}" is already taken. Please choose a different username.`,
                variant: "destructive",
              });
              return;
            }
          } else {
            // If API check fails, let user proceed but warn them
            setUsernameCheckLoading(false);
            console.warn("Username availability check failed, proceeding with save");
          }
        } catch (error) {
          // If API check fails, let user proceed but warn them
          setUsernameCheckLoading(false);
          console.error("Username availability check error:", error);
        }
        setUsernameCheckLoading(false);
      } else if (usernameAvailable === false) {
        // We already know username is not available
        toast({
          title: "Username Not Available",
          description: `The username "${accountData.username}" is already taken. Please choose a different username.`,
          variant: "destructive",
        });
        return;
      }
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    if (isBackendConnected) {
      try {
        // Try to update via backend
        const accountResult = await safeApiCall(() =>
          api.updateAccount({
            name: accountData.name,
            username: accountData.username,
            instantMessageSubject: accountData.instantMessageSubject,
          }),
        );

        const messageResult = await safeApiCall(() =>
          api.updateInstantMessage({
            instant_message_subject: accountData.instantMessageSubject,
            instant_message_body: accountData.instantMessage,
          }),
        );

        if (accountResult?.success && messageResult?.success) {
          toast({
            title: "Account Updated",
            description: "Your account information has been saved successfully.",
          });
        } else {
          // Check if it's a username conflict specifically
          if (accountResult && !accountResult.success && accountResult.message?.toLowerCase().includes('username')) {
            toast({
              title: "Username Conflict",
              description: accountResult.message || "Username is already taken. Please choose a different username.",
              variant: "destructive",
            });
          } else {
            // Other backend errors - fall back to local storage
            setIsBackendConnected(false);
            toast({
              title: "Changes Saved Locally",
              description: "Backend connection lost. Changes saved in demo mode only.",
            });
          }
        }
      } catch (error) {
        console.error("Error saving account:", error);
        toast({
          title: "Save Failed",
          description: "Failed to save changes. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Backend not available, just update local store
      toast({
        title: "Changes Saved Locally",
        description:
          "Backend is not connected. Changes saved in demo mode only.",
      });
    }

    // Always update local auth store
    updateUser({
      name: accountData.name,
      username: accountData.username,
      instantMessage: accountData.instantMessage,
      instantMessageSubject: accountData.instantMessageSubject,
    });

    setHasChanges(false);
    setIsLoading(false);
  };

  // TODO: Re-enable when delete account is implemented
  /*
  const handleDeleteAccount = async () => {
    // Validate username
    if (verificationData.username !== accountData.username) {
      toast({
        title: "Username Mismatch",
        description:
          "The username you entered does not match your account username.",
        variant: "destructive",
      });
      return;
    }

    setDeleteLoading(true);

    try {
      // Simulate account deletion process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear all local data
      localStorage.clear();

      // Sign out
      await signOut();

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
        variant: "destructive",
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      // Reset verification data
      setVerificationData({ username: "" });
    }
  };
  */

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Show loading while checking auth or syncing data
  if (authLoading || isSyncing || !isDataLoaded) {
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
          <p className="text-gray-800 dark:text-zinc-200 font-light">
            Turning Personality into Pixels...
          </p>
        </div>
      </div>
    );
  }

  // Redirect will handle navigation for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-6 relative transition-colors duration-300">
      {/* Logo - Top Left */}
      <div className="absolute top-4 left-4 z-50">
        <Logo />
      </div>

      {/* Navigation - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <ThemeToggle />
        <Button
          onClick={() => (window.location.href = "/")}
          variant="outline"
          size="sm"
          className="hidden md:inline-flex bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium transition-colors duration-200"
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
        <Button
          onClick={() => (window.location.href = "/mycard")}
          className="bg-gray-900 dark:bg-zinc-700 hover:bg-gray-800 dark:hover:bg-zinc-600 text-white font-medium transition-colors duration-200"
          size="sm"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          My Card
        </Button>
        <AuthButton />
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-md mx-auto pt-24 pb-24 space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-3 mb-16">
          <Link
            to="/mycard"
            className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Card
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mb-2 transition-colors duration-200">
              My Account
            </h2>
            <p className="text-gray-600 dark:text-zinc-400 text-sm transition-colors duration-200">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        {/* Backend Status Alert */}
        {!isBackendConnected && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-lg p-4 transition-colors duration-200">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-yellow-500 dark:bg-yellow-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1 transition-colors duration-200">
                  Demo Mode
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 leading-relaxed transition-colors duration-200">
                  Backend is not connected. You're in demo mode - changes will
                  be saved locally only. To enable full functionality, set up
                  the backend using the provided implementation guide.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Account Form */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-200">
          <div className="p-6 space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Full Name <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <Input
                value={accountData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Enter your full name"
                className={`bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200 ${
                  validationErrors.name
                    ? "border-red-300 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400 dark:focus:ring-red-500"
                    : ""
                }`}
                required
              />
              {validationErrors.name && (
                <p className="text-sm text-red-600 dark:text-red-400 transition-colors duration-200">{validationErrors.name}</p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Email Address
              </label>
              <Input
                value={user?.email || ""}
                readOnly
                className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 cursor-not-allowed transition-colors duration-200"
              />
              <p className="text-xs text-gray-500 dark:text-zinc-500 transition-colors duration-200">
                Email address is managed through your Google account and cannot
                be changed here
              </p>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Username <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-sm font-medium transition-colors duration-200">
                  @
                </span>
                <Input
                  value={accountData.username}
                  onChange={(e) =>
                    handleFieldChange("username", e.target.value)
                  }
                  placeholder="yourname"
                  className={`bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium pl-8 pr-10 transition-colors duration-200 ${
                    validationErrors.username
                      ? "border-red-300 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400 dark:focus:ring-red-500"
                      : usernameAvailable === false
                      ? "border-red-300 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400 dark:focus:ring-red-500"
                      : usernameAvailable === true
                      ? "border-green-300 dark:border-green-600 focus:border-green-400 dark:focus:border-green-500 focus:ring-green-400 dark:focus:ring-green-500"
                      : ""
                  }`}
                  required
                  maxLength={20}
                />
                {/* Username availability indicator */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {usernameCheckLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : usernameAvailable === true ? (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : usernameAvailable === false ? (
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : null}
                </div>
              </div>
              {validationErrors.username ? (
                <p className="text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                  {validationErrors.username}
                </p>
              ) : usernameAvailable === false ? (
                <p className="text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                  This username is already taken. Please choose a different one.
                </p>
              ) : usernameAvailable === true ? (
                <p className="text-sm text-green-600 dark:text-green-400 transition-colors duration-200">
                  Great! This username is available.
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-zinc-500 transition-colors duration-200">
                  5-20 characters, lowercase letters, numbers, and dashes only.
                  Your profile will be at e-info.me/@
                  {accountData.username || "username"}
                </p>
              )}
            </div>

            {/* Instant Message Subject Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Instant Message Subject <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <Input
                value={accountData.instantMessageSubject}
                onChange={(e) =>
                  handleFieldChange("instantMessageSubject", e.target.value)
                }
                placeholder="Subject for instant messages..."
                className={`bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200 ${
                  validationErrors.instantMessageSubject
                    ? "border-red-300 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400 dark:focus:ring-red-500"
                    : ""
                }`}
                required
              />
              {validationErrors.instantMessageSubject ? (
                <p className="text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                  {validationErrors.instantMessageSubject}
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-zinc-500 transition-colors duration-200">
                  Subject line for the instant message template that visitors
                  can use
                </p>
              )}
            </div>

            {/* Instant Message Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Instant Message Body <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <Textarea
                value={accountData.instantMessage}
                onChange={(e) =>
                  handleFieldChange("instantMessage", e.target.value)
                }
                placeholder="Set your instant message for quick communication..."
                className={`bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium min-h-20 resize-none transition-colors duration-200 ${
                  validationErrors.instantMessage
                    ? "border-red-300 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400 dark:focus:ring-red-500"
                    : ""
                }`}
                required
              />
              {validationErrors.instantMessage ? (
                <p className="text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                  {validationErrors.instantMessage}
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-zinc-500 transition-colors duration-200">
                  Message body for the instant message template. This will be
                  displayed when people want to message you quickly.
                </p>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 transition-colors duration-200">
              <Button
                onClick={handleSave}
                disabled={isLoading || !hasChanges || usernameAvailable === false || usernameCheckLoading}
                className={`w-full font-medium py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasChanges && usernameAvailable !== false
                    ? "bg-gray-900 dark:bg-zinc-700 hover:bg-gray-800 dark:hover:bg-zinc-600 text-white"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Updating...
                  </div>
                ) : usernameCheckLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Checking Username...
                  </div>
                ) : usernameAvailable === false ? (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Username Not Available
                  </div>
                ) : hasChanges ? (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    All Changes Saved
                  </div>
                )}
              </Button>
              
              {/* Username availability message below save button */}
              {usernameAvailable === false && hasChanges && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                    Cannot save: Username "{accountData.username}" is already taken. Please choose a different username.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-4 transition-colors duration-200">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1 transition-colors duration-200">
                Account Information
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed transition-colors duration-200">
                Your account information is used across the platform. Changes to
                your name and username will be reflected in your profile and
                public displays.
              </p>
            </div>
          </div>
        </div>

        {/* TODO: Implement proper delete account functionality */}
        {/* Danger Zone - Temporarily commented out until backend implementation is complete */}
        {/*
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-900 mb-1">
                Danger Zone
              </h4>
              <p className="text-xs text-red-700 leading-relaxed">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-lg bg-white border-gray-200">
              <AlertDialogHeader className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                  Delete Account
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-700 text-base leading-relaxed">
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-6 py-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">
                    What will be deleted:
                  </h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• Your profile and all personal information</li>
                    <li>• All your portfolio items and work samples</li>
                    <li>• Your account settings and preferences</li>
                    <li>• All activity history and analytics</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-900 block">
                    To confirm deletion, type your username:{" "}
                    <span className="font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      {accountData.username}
                    </span>
                  </label>
                  <Input
                    value={verificationData.username}
                    onChange={(e) =>
                      setVerificationData({ username: e.target.value })
                    }
                    placeholder={`Type "${accountData.username}" to confirm`}
                    className="bg-white border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-center font-mono text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <AlertDialogFooter className="flex gap-3">
                <AlertDialogCancel
                  onClick={() => setVerificationData({ username: "" })}
                  className="flex-1"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteLoading ||
                    verificationData.username !== accountData.username
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Deleting...
                    </div>
                  ) : (
                    "Delete My Account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        */}
      </div>
      <Footer />
    </div>
  );
};

export default MyAccount;
