"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { signOut, getCurrentUser } from "@/lib/firebaseAuth";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { toast } from "sonner";

import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  BarChart3,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [stats] = useState({
    courses: 0,
    students: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    views: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        toast.error("Failed to fetch user.");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out!");
      router.replace("/login");
    } catch (err) {
      toast.error("Logout failed!");
    }
  };

  return (
    <main className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <Header user={user} onLogout={handleLogout} />
      <StatsGrid stats={stats} />
      <QuickActions />
      <RecentActivity />
    </main>
  );
}

/* ---------- Header Component ---------- */
function Header({ user, onLogout }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back, {user?.user_metadata?.full_name || user?.email}
        </p>
      </div>
      <Button variant="outline" onClick={onLogout}>
        Logout
      </Button>
    </div>
  );
}

/* ---------- StatsGrid Component ---------- */
function StatsGrid({ stats }) {
  const cards = [
    {
      icon: <BookOpen className="text-blue-500" />,
      title: "Total Courses",
      value: stats.courses,
    },
    {
      icon: <Users className="text-green-500" />,
      title: "Students",
      value: stats.students,
    },
    {
      icon: <DollarSign className="text-yellow-500" />,
      title: "Total Earnings",
      value: `₦${stats.totalEarnings.toLocaleString()}`,
    },
    {
      icon: <TrendingUp className="text-purple-500" />,
      title: "Earnings This Month",
      value: `₦${stats.monthlyEarnings.toLocaleString()}`,
    },
    {
      icon: <Eye className="text-teal-500" />,
      title: "Course Views",
      value: stats.views.toLocaleString(),
    },
    {
      icon: <BarChart3 className="text-red-500" />,
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
      {cards.map((card, idx) => (
        <Card key={idx}>
          <CardHeader className="flex items-center gap-2">
            {card.icon}
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------- QuickActions Component ---------- */
function QuickActions() {
  const router = useRouter();

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Quick Actions
      </h3>
      <div className="flex flex-wrap gap-4">
        <Button
          className="flex items-center gap-2"
          onClick={() => router.push("/dev/courses/create-course")}
        >
          <Plus size={18} /> Create Course
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => router.push("/dev/courses")}
        >
          <BookOpen size={18} /> View Courses
        </Button>
      </div>
    </section>
  );
}

/* ---------- RecentActivity Component ---------- */
function RecentActivity() {
  return (
    <section className="mt-10">
      <Card className="p-6">
        <CardTitle>Recent Activity</CardTitle>
        <p className="text-gray-500 mt-3">
          No recent activity yet — start creating courses.
        </p>
      </Card>
    </section>
  );
}
