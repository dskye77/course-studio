"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // ✅ import toast

import { signOut } from "@/lib/firebaseAuth";

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!"); // ✅ show success toast
      router.replace("/login"); // redirect after logout
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again."); // ✅ show error toast
    }
  };

  return (
    <aside className="w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col hidden md:flex">
      <div className="px-4 py-4 flex items-center space-x-2">
        <Image
          src={"/icon.png"}
          alt="Icon"
          width={42}
          height={42}
          className="dark:invert"
        />
        <div className="flex flex-col">
          <Link href="/">
            <h1 className="text-xl font-bold text-primary">Course Studio</h1>
          </Link>
          <p className="text-muted">Developer platform</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link
          href="/dev/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Home size={20} /> Dashboard
        </Link>
        <Link
          href="/dev/courses"
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <BookOpen size={20} /> My Courses
        </Link>
      </nav>

      <div className="px-4 py-6">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} /> Logout
        </Button>
      </div>
    </aside>
  );
}
