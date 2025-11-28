"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "../../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Menu } from "lucide-react";

export default function Header() {
  const pathName = usePathname();

  const [open, setOpen] = useState(false);

  // Auto close menu when screen becomes desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMenu = () => setOpen(false);

  if (
    pathName.startsWith("/login") ||
    pathName.startsWith("/signup") ||
    pathName.startsWith("/dev")
  )
    return;

  return (
    <header className="w-full px-6 py-4 border-b border-gray-200 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center gap-3">
          <Image
            src={"/icon.png"}
            alt="Icon"
            width={42}
            height={42}
            className="dark:invert"
          />
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Course Studio
          </h1>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/courses">
          <Button variant="ghost" className="text-base px-3">
            Courses
          </Button>
        </Link>
        <Link href="/about">
          <Button variant="ghost" className="text-base px-3">
            About us
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant="ghost" className="text-base px-3">
            Contact
          </Button>
        </Link>
      </nav>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex items-center gap-3">
        <Link href="/login">
          <Button variant="outline" className="px-5">
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button className="px-5">Sign up</Button>
        </Link>
      </div>

      {/* Mobile Menu Trigger */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          {/* Mobile Menu Content */}
          <SheetContent
            side="top"
            className="w-full pt-6 pb-10 rounded-b-2xl shadow-lg"
          >
            <SheetHeader className="px-6 mb-4">
              <SheetTitle className="text-lg font-semibold tracking-tight">
                Menu
              </SheetTitle>
            </SheetHeader>

            {/* Navigation Links */}
            <nav className="px-6 flex flex-col gap-2">
              <Link href="/courses" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Courses
                </Button>
              </Link>

              <Link href="/about" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  About us
                </Button>
              </Link>

              <Link href="/contact" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Contact
                </Button>
              </Link>
            </nav>

            {/* Divider */}
            <div className="mx-6 my-6 border-t border-gray-200 dark:border-gray-800" />

            {/* Auth Buttons */}
            <div className="px-6 flex flex-col gap-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="py-3 rounded-xl text-base"
                  onClick={closeMenu}
                >
                  Login
                </Button>
              </Link>

              <Link href="/signup">
                <Button
                  className="py-3 rounded-xl text-base"
                  onClick={closeMenu}
                >
                  Sign up
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
