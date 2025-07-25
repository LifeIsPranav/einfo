import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores";

import {
  User,
  LogOut,
  Mail,
  CreditCard,
  HelpCircle,
  UserCog,
  LayoutDashboard,
  X,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AuthButton() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    signOut,
    clearError,
    setRedirectPath,
  } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle sign in - set redirect path and navigate to auth page
  const handleSignIn = () => {
    // If on home page, redirect to dashboard after auth
    // Otherwise, redirect back to current page
    const redirectTo =
      location.pathname === "/" ? "/dashboard" : location.pathname;
    setRedirectPath(redirectTo);
    navigate("/auth");
  };

  // Sign out function with error handling
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Menu item click handlers
  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const handleMyAccountClick = () => {
    navigate("/account");
  };

  const handleProfileClick = () => {
    navigate("/mycard");
  };

  const handleViewCardClick = () => {
    if (user?.username) {
      navigate(`/@${user.username}`);
    } else {
      navigate("/demo");
    }
  };

  // Show loading spinner during auth operations
  if (isLoading) {
    return (
      <div className="h-10 w-10 flex items-center justify-center">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={handleSignIn}
        size="sm"
        className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-sm font-medium transition-colors duration-200"
      >
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100/80 transition-all duration-200 hover:shadow-md hover:shadow-gray-900/5 focus:ring-2 focus:ring-gray-300/50 focus:ring-offset-2"
        >
          <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 text-sm font-medium">
              {user ? getUserInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 p-2 bg-white border-gray-200 shadow-lg"
        align="end"
        forceMount
        sideOffset={8}
      >
        {/* Error display if needed */}
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-xs text-red-600">{error}</p>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-1">
          <DropdownMenuItem
            onClick={handleDashboardClick}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
          >
            <LayoutDashboard className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span>Dashboard</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleMyAccountClick}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
          >
            <UserCog className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span>My Account</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleProfileClick}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
          >
            <User className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span>My Card</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleViewCardClick}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
          >
            <Eye className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span>View Card</span>
          </DropdownMenuItem>
        </div>

        {/* Sign Out Section */}
        <div className="p-2 border-t border-gray-100/80">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
          >
            <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-600 transition-colors" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
