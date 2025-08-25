import CreateAdminModal from "@/components/admin/CreateAdminModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ThemeToggle from "@/components/common/ThemeToggle";
import Logo from "@/components/Logo";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThemeStore } from "@/stores/themeStore";

import {
  Users,
  UserCheck,
  UserX,
  Activity,
  Shield,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  MoreHorizontal
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProfiles: number;
  inactiveUsers: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  isActive: boolean;
  emailVerified: boolean;
  totalViews: number;
  totalClicks: number;
  createdAt: string;
  profile: {
    profileImageUrl?: string;
    jobTitle?: string;
    location?: string;
  } | null;
  _count: {
    links: number;
    portfolio: number;
    experiences: number;
    receivedStars: number;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
  admin: {
    name: string;
    email: string;
  };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adminData, setAdminData] = useState<any>(null);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
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

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("adminToken");
    const admin = localStorage.getItem("adminData");
    
    if (!token || !admin) {
      navigate("/admin/login");
      return;
    }

    setAdminData(JSON.parse(admin));
    loadDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (adminData) {
      loadUsers();
    }
  }, [currentPage, searchTerm, statusFilter, adminData]);

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("adminToken");
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      navigate("/admin/login");
      throw new Error("Unauthorized");
    }

    return response;
  };

  const loadDashboardData = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${import.meta.env.VITE_API_BASE_URL}/admin/dashboard`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
        setActivities(data.data.recentActivities); // Backend now limits to 10
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      if (error.message !== "Unauthorized") {
        toast.error("Failed to load dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!adminData) return;
    
    setIsUsersLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter })
      });

      const response = await makeAuthenticatedRequest(
        `${import.meta.env.VITE_API_BASE_URL}/admin/users?${params}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Users error:", error);
      if (error.message !== "Unauthorized") {
        toast.error("Failed to load users");
      }
    } finally {
      setIsUsersLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await makeAuthenticatedRequest(
        `${import.meta.env.VITE_API_BASE_URL}/admin/users/${userId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ isActive: !currentStatus })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`User ${!currentStatus ? "activated" : "deactivated"} successfully`);
        loadUsers(); // Reload users list
        loadDashboardData(); // Reload stats
      } else {
        toast.error(data.message || "Failed to update user status");
      }
    } catch (error) {
      console.error("Toggle user status error:", error);
      if (error.message !== "Unauthorized") {
        toast.error("Failed to update user status");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await makeAuthenticatedRequest(
        `${import.meta.env.VITE_API_BASE_URL}/admin/logout`,
        { method: "POST" }
      );
    } catch (error) {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      navigate("/admin/login");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-300">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Logo />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 transition-colors duration-300">Admin Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {adminData && (
                <div className="text-sm text-gray-600 dark:text-zinc-400 transition-colors duration-300">
                  Welcome, <span className="font-medium text-gray-900 dark:text-zinc-100">{adminData.name}</span>
                  <Badge variant="secondary" className="ml-2 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border-gray-200 dark:border-zinc-700">
                    {adminData.role}
                  </Badge>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 transition-colors duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-zinc-100">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 transition-colors duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-zinc-100">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.activeUsers || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 transition-colors duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-zinc-100">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.inactiveUsers || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 transition-colors duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-zinc-100">Total Profiles</CardTitle>
              <Activity className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{stats?.totalProfiles || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Table */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 transition-colors duration-300">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="mb-6">
                    <CardTitle className="text-gray-900 dark:text-zinc-100">Users Management</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-zinc-400"> </CardDescription>
                  </div>
                  {adminData?.role === "super_admin" && (
                    <Button 
                      size="sm" 
                      onClick={() => setIsCreateAdminModalOpen(true)}
                      className="bg-gray-900 dark:bg-zinc-700 hover:bg-gray-800 dark:hover:bg-zinc-600 text-white transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Admin
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder:text-gray-500 dark:placeholder:text-zinc-400 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700">
                      <SelectItem value="all" className="text-gray-900 dark:text-zinc-100 focus:bg-gray-100 dark:focus:bg-zinc-700">All</SelectItem>
                      <SelectItem value="active" className="text-gray-900 dark:text-zinc-100 focus:bg-gray-100 dark:focus:bg-zinc-700">Active</SelectItem>
                      <SelectItem value="inactive" className="text-gray-900 dark:text-zinc-100 focus:bg-gray-100 dark:focus:bg-zinc-700">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isUsersLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800/50 transition-colors duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center transition-colors duration-300">
                            {user.profile?.profileImageUrl ? (
                              <img
                                src={user.profile.profileImageUrl}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600 dark:text-zinc-300">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-zinc-100">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-zinc-400">@{user.username}</div>
                            <div className="text-xs text-gray-400 dark:text-zinc-500">{user.email}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={user.isActive ? "default" : "secondary"}
                            className={user.isActive 
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800" 
                              : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-300 border-gray-200 dark:border-zinc-700"
                            }
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                            className="border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors duration-200"
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/@${user.username}`, '_blank')}
                            title={`View ${user.username}'s public profile`}
                            className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors duration-200"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>
                        
                        <span className="text-sm text-gray-600 dark:text-zinc-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors duration-200"
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-zinc-100">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600 dark:text-zinc-400">Latest admin actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="text-sm p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 transition-colors duration-300">
                      <div className="font-medium text-gray-900 dark:text-zinc-100">{activity.action.replace(/_/g, ' ')}</div>
                      <div className="text-gray-500 dark:text-zinc-400">by {activity.admin.name}</div>
                      <div className="text-xs text-gray-400 dark:text-zinc-500">{formatDate(activity.createdAt)}</div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-zinc-400 py-4 transition-colors duration-300">
                      No recent activities
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={isCreateAdminModalOpen}
        onClose={() => setIsCreateAdminModalOpen(false)}
        onSuccess={() => {
          // Reload dashboard data after creating admin
          loadDashboardData();
        }}
      />
    </div>
  );
};

export default AdminDashboard;
