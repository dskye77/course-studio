// src/app/admin/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin, getUserRole, USER_ROLES } from "@/lib/firebaseAdmin";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Shield,
  AlertCircle,
  Activity,
  Ban,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  getPlatformStats,
  getAllUsers,
  toggleUserBan,
  getAllCoursesForModeration,
  adminDeleteCourse,
  setUserRole,
  getAdminLogs,
} from "@/lib/firebaseAdmin";
import { signOut } from "@/lib/firebaseAuth";
import { PLATFORM_CONFIG } from "@/config/platform.config";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check admin status
  useEffect(() => {
    async function checkAdminStatus() {
      if (authLoading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const adminStatus = await isAdmin();
        setIsAdminUser(adminStatus);

        if (!adminStatus) {
          toast.error("Access denied: Admin privileges required");
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      } finally {
        setCheckingAdmin(false);
      }
    }

    checkAdminStatus();
  }, [user, authLoading, router]);

  // Load data based on active tab
  useEffect(() => {
    async function loadData() {
      if (!isAdminUser) return;

      setLoading(true);
      try {
        switch (activeTab) {
          case "overview":
            const statsData = await getPlatformStats();
            setStats(statsData);
            const recentLogs = await getAdminLogs(10);
            setLogs(recentLogs);
            break;
          case "users":
            const usersData = await getAllUsers();
            setUsers(usersData);
            break;
          case "courses":
            const coursesData = await getAllCoursesForModeration();
            setCourses(coursesData);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    if (isAdminUser && !checkingAdmin) {
      loadData();
    }
  }, [activeTab, isAdminUser, checkingAdmin]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  if (authLoading || checkingAdmin) {
    return <LoadingScreen />;
  }

  if (!isAdminUser) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {PLATFORM_CONFIG.name} Management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Platform
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          >
            <Activity className="w-4 h-4" />
            Overview
          </TabButton>
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          >
            <Users className="w-4 h-4" />
            Users
          </TabButton>
          <TabButton
            active={activeTab === "courses"}
            onClick={() => setActiveTab("courses")}
          >
            <BookOpen className="w-4 h-4" />
            Courses
          </TabButton>
          <TabButton
            active={activeTab === "revenue"}
            onClick={() => setActiveTab("revenue")}
          >
            <DollarSign className="w-4 h-4" />
            Revenue
          </TabButton>
          <TabButton
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="w-4 h-4" />
            Settings
          </TabButton>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingContent />
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewTab stats={stats} logs={logs} />
            )}
            {activeTab === "users" && (
              <UsersTab users={users} setUsers={setUsers} />
            )}
            {activeTab === "courses" && (
              <CoursesTab courses={courses} setCourses={setCourses} />
            )}
            {activeTab === "revenue" && <RevenueTab stats={stats} />}
            {activeTab === "settings" && <SettingsTab />}
          </>
        )}
      </div>
    </div>
  );
}

// Tab Components
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

// Overview Tab
function OverviewTab({ stats, logs }) {
  if (!stats) return <div>Loading statistics...</div>;

  const statCards = [
    {
      title: "Total Users",
      value: stats.users.total,
      icon: Users,
      color: "blue",
      subtitle: `${stats.users.instructors} instructors • ${stats.users.students} students`,
    },
    {
      title: "Total Courses",
      value: stats.courses.total,
      icon: BookOpen,
      color: "green",
      subtitle: `${stats.courses.published} published`,
    },
    {
      title: "Total Revenue",
      value: `${
        PLATFORM_CONFIG.payments.currencySymbol
      }${stats.revenue.total.toLocaleString()}`,
      icon: DollarSign,
      color: "yellow",
      subtitle: "All time earnings",
    },
    {
      title: "This Month",
      value: `${
        PLATFORM_CONFIG.payments.currencySymbol
      }${stats.revenue.thisMonth.toLocaleString()}`,
      icon: TrendingUp,
      color: "purple",
      subtitle: "Current month revenue",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatRow label="Active Students" value={stats.users.students} />
            <StatRow
              label="Active Instructors"
              value={stats.users.instructors}
            />
            <StatRow label="Banned Users" value={stats.users.banned} alert />
            <StatRow
              label="Published Courses"
              value={stats.courses.published}
            />
            <StatRow
              label="Platform Fee Collected"
              value={`${PLATFORM_CONFIG.payments.currencySymbol}${(
                stats.revenue.total * PLATFORM_CONFIG.payments.commissionRate
              ).toLocaleString()}`}
            />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            ) : (
              logs.map((log, i) => <ActivityItem key={i} log={log} />)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Users Tab
function UsersTab({ users, setUsers }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleBanUser = async (userId, currentlyBanned) => {
    const action = currentlyBanned ? "unban" : "ban";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`
    );
    if (!confirmed) return;

    try {
      await toggleUserBan(userId, !currentlyBanned, "Admin action");
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, banned: !currentlyBanned } : u
        )
      );
      toast.success(`User ${action}ned successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await setUserRole(userId, newRole);
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-900"
        >
          <option value="all">All Roles</option>
          <option value={USER_ROLES.STUDENT}>Students</option>
          <option value={USER_ROLES.INSTRUCTOR}>Instructors</option>
          <option value={USER_ROLES.ADMIN}>Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {(user.displayName || user.email)[0].toUpperCase()}
                      </div>
                      <span className="font-medium">
                        {user.displayName || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role || USER_ROLES.STUDENT}
                      onChange={(e) =>
                        handleChangeRole(user.id, e.target.value)
                      }
                      className="text-xs px-2 py-1 rounded-full border"
                    >
                      <option value={USER_ROLES.STUDENT}>Student</option>
                      <option value={USER_ROLES.INSTRUCTOR}>Instructor</option>
                      <option value={USER_ROLES.ADMIN}>Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.banned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        <Ban className="w-3 h-3" />
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBanUser(user.id, user.banned)}
                      >
                        {user.banned ? "Unban" : "Ban"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Courses Tab
function CoursesTab({ courses, setCourses }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteCourse = async (courseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await adminDeleteCourse(courseId, "Admin deletion");
      setCourses(courses.filter((c) => c.id !== courseId));
      toast.success("Course deleted successfully");
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id}>
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold line-clamp-2">{course.title}</h3>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>By: {course.authorName}</p>
                <p>{course.students || 0} students</p>
                <p className="font-semibold text-lg text-foreground">
                  {PLATFORM_CONFIG.payments.currencySymbol}
                  {course.price?.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`/courses/${course.id}`, "_blank")}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCourse(course.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Revenue Tab
function RevenueTab({ stats }) {
  if (!stats) return <div>Loading...</div>;

  const platformFee =
    stats.revenue.total * PLATFORM_CONFIG.payments.commissionRate;
  const instructorEarnings = stats.revenue.total - platformFee;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </h3>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold">
              {PLATFORM_CONFIG.payments.currencySymbol}
              {stats.revenue.total.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Platform Fee ({PLATFORM_CONFIG.payments.commissionRate * 100}%)
              </h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">
              {PLATFORM_CONFIG.payments.currencySymbol}
              {platformFee.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Instructor Earnings
              </h3>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold">
              {PLATFORM_CONFIG.payments.currencySymbol}
              {instructorEarnings.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span>Total Transactions</span>
            <span className="font-semibold">{stats.courses.total}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Average Course Price</span>
            <span className="font-semibold">
              {PLATFORM_CONFIG.payments.currencySymbol}
              {stats.courses.total > 0
                ? Math.round(stats.revenue.total / stats.courses.total)
                : 0}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span>Commission Rate</span>
            <span className="font-semibold">
              {PLATFORM_CONFIG.payments.commissionRate * 100}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Platform Name</label>
              <p className="text-lg">{PLATFORM_CONFIG.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Contact Email</label>
              <p className="text-lg">{PLATFORM_CONFIG.contact.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Currency</label>
              <p className="text-lg">{PLATFORM_CONFIG.payments.currency}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Commission Rate</label>
              <p className="text-lg">
                {PLATFORM_CONFIG.payments.commissionRate * 100}%
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              To modify these settings, edit the .env.local file and restart the
              server.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-600",
    purple: "bg-purple-100 dark:bg-purple-900/20 text-purple-600",
    green: "bg-green-100 dark:bg-green-900/20 text-green-600",
    yellow: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <p className="text-3xl font-bold mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value, alert }) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-semibold ${alert ? "text-red-600" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function ActivityItem({ log }) {
  const getActionText = () => {
    switch (log.action) {
      case "user_banned":
        return "User banned";
      case "user_unbanned":
        return "User unbanned";
      case "course_deleted":
        return "Course deleted";
      case "role_change":
        return "User role changed";
      default:
        return log.action;
    }
  };

  return (
    <div className="flex items-start gap-3 py-2">
      <div
        className={`w-2 h-2 rounded-full mt-2 ${
          log.action.includes("banned") || log.action.includes("deleted")
            ? "bg-red-600"
            : "bg-blue-600"
        }`}
      />
      <div className="flex-1">
        <p className="text-sm">{getActionText()}</p>
        <p className="text-xs text-muted-foreground">
          {log.timestamp
            ? new Date(log.timestamp).toLocaleString()
            : "Just now"}
        </p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Loading admin dashboard...
        </p>
      </div>
    </div>
  );
}

function LoadingContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have permission to access the admin dashboard.
        </p>
        <Button onClick={() => (window.location.href = "/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
