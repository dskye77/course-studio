// components/Header.js
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Menu, LogOut, User, Settings } from "lucide-react";
import { signOut } from "@/lib/firebaseAuth";
import { toast } from "sonner";

/* ----------------------- Internal Components ----------------------- */

const Logo = () => (
  <Link href="/" className="flex items-center gap-3">
    <Image
      src="/icon.png"
      alt="Course Studio"
      width={42}
      height={42}
      className="dark:invert"
    />
    <h1 className="text-2xl font-bold tracking-tight text-primary hidden sm:block">
      Course Studio
    </h1>
  </Link>
);

const NavLinks = ({ className = "", onClick }) => {
  const navLinks = [
    { href: "/courses", label: "Courses" },
    { href: "/about", label: "About us" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className={className}>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClick}
          className="text-foreground/80 hover:text-foreground font-medium transition"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

const AuthButtons = ({
  isMobile = false,
  loading,
  user,
  handleLogout,
  setMobileOpen,
}) => {
  if (loading)
    return (
      <div
        className={
          isMobile
            ? "h-10 w-full rounded-md animate-pulse"
            : "w-10 h-10 rounded-full animate-pulse"
        }
      />
    );

  if (user) {
    if (isMobile) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2">
            <Avatar>
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>
                {user.displayName?.[0] || user.email?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.displayName || "User"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Link href="/dev/dashboard" onClick={() => setMobileOpen(false)}>
            <Button variant="outline" className="w-full">
              Instructor Dashboard
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 hover:opacity-80 transition">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-blue-600 text-white">
                {user.displayName?.[0] || user.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium hidden lg:block">
              {user.displayName || user.email?.split("@")[0]}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <User size={16} /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dev/dashboard" className="flex items-center gap-2">
              <Settings size={16} /> Instructor Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={isMobile ? "space-y-3" : "flex gap-4"}>
      <Link href="/login">
        <Button
          variant={isMobile ? "outline" : "outline"}
          className={isMobile ? "w-full" : ""}
        >
          Login
        </Button>
      </Link>
      <Link href="/signup">
        <Button className={isMobile ? "w-full" : ""}>Sign up</Button>
      </Link>
    </div>
  );
};

/* ----------------------- Main Header ----------------------- */

export default function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/dev")
  ) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="w-full px-6 py-4 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80">
      <div className="flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <NavLinks className="hidden md:flex items-center gap-8" />

        {/* Desktop Auth/Profile */}
        <div className="hidden md:flex items-center">
          <AuthButtons
            loading={loading}
            user={user}
            handleLogout={handleLogout}
            setMobileOpen={setMobileOpen}
          />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="pt-6">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <NavLinks
                className="mt-6 flex flex-col gap-3"
                onClick={() => setMobileOpen(false)}
              />
              <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
              <AuthButtons
                isMobile
                loading={loading}
                user={user}
                handleLogout={handleLogout}
                setMobileOpen={setMobileOpen}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
