// components/Sidebar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, BookOpen, PlusCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signOut } from "@/lib/firebaseAuth";

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!");
      window.location.href = "/login";
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const isActive = (path) => pathname.startsWith(path);

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="px-6 py-6">
        <Link href="/dev/dashboard" className="flex items-center gap-3">
          <Image
            src="/icon.png"
            alt="Logo"
            width={42}
            height={42}
            className="dark:invert"
          />
          <div>
            <h1 className="text-xl font-bold text-primary">Course Studio</h1>
            <p className="text-xs text-muted-foreground">Instructor Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <Link
          href="/dev/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            pathname === "/dev/dashboard"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Home size={20} />
          Dashboard
        </Link>

        <Link
          href="/dev/courses"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            pathname === "/dev/courses"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <BookOpen size={20} />
          My Courses
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </aside>
  );
}
