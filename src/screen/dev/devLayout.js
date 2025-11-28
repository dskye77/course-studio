"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/stores/dashboard";
import { useAuth } from "@/hooks/useAuth"; // ← your new hook

import Sidebar from "@/screen/dev/layout/Sidebar";

export default function DevLayout({ children }) {
  const { user, loading } = useAuth(); // ← beautiful & reusable
  const setUser = useDashboard((state) => state.setUser);
  const router = useRouter();

  // Sync Firebase user → Zustand store
  useEffect(() => {
    if (user) {
      setUser(user);
    } else if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, setUser, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  // If no user after loading → this won't render (redirect already triggered)
  if (!user) return null;

  return (
    <main className="h-screen flex bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 overflow-x-auto h-full px-4">{children}</div>
    </main>
  );
}
