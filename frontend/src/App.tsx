import Auth from "./pages/Auth";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import PageLoader from "@/components/common/PageLoader";
import React, { Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeAuth, startAuthRefresh, stopAuthRefresh } from "@/stores";

// Eager load critical pages, lazy load others for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Demo = React.lazy(() => import("./pages/Demo"));
const AuthCallback = React.lazy(() => import("./pages/AuthCallback"));
const EditProfile = React.lazy(() => import("./pages/EditProfile"));
const MyAccount = React.lazy(() => import("./pages/MyAccount"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const PublicProfile = React.lazy(() => import("./pages/PublicProfile"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const LoaderShowcase = React.lazy(() => import("./pages/LoaderShowcase"));

// Admin pages
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminUserProfile = React.lazy(() => import("./pages/AdminUserProfile"));

// Configure React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});


const App = () => {
  useEffect(() => {
    // Initialize auth state by checking existing token
    initializeAuth();

    // Start auth session refresh monitoring
    startAuthRefresh();

    // Cleanup on unmount
    return () => {
      stopAuthRefresh();
    };
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // In production, you would send this to an error reporting service
        console.error("App Error:", error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
                    <Suspense fallback={<PageLoader message="Turning Personality into Pixels..." />}>
            <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/mycard" element={<EditProfile />} />
                <Route path="/account" element={<MyAccount />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/loaders" element={<LoaderShowcase />} />
                
                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users/:userId" element={<AdminUserProfile />} />
                
                <Route path="/:username" element={<PublicProfile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </Suspense>

          {/* Global toast notifications */}
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
