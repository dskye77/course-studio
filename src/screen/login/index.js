"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { signIn, getCurrentUser, onAuthStateChange } from "@/lib/firebaseAuth";
import VerificationMessage from "@/components/auth/VerificationMessage";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verify, setVerify] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Redirect if user already logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.emailVerified) {
      router.replace("/dev/dashboard");
    }

    const unsubscribe = onAuthStateChange((user) => {
      if (user?.emailVerified) {
        router.replace("/dev/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      newErrors.email = "Enter a valid email.";
    if (!password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await signIn(email, password); // Firebase sign-in

      // Normal login flow
      toast.success(`Welcome back, ${user.displayName || user.email}!`);
      router.push("/dev/dashboard");
    } catch (error) {
      // Detect if the error is due to unverified email
      if (
        error.message.includes("Please verify your email before signing in") ||
        error.message.includes("not verified")
      ) {
        setVerify(true);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (verify) {
    return <VerificationMessage email={email} />;
  }
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <Card className="w-full max-w-md p-6 shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Welcome Back
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`h-11 text-base ${
                errors.email ? "border-red-500" : ""
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`h-11 text-base ${
                errors.password ? "border-red-500" : ""
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <Button
            className="w-full h-11 text-base"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="absolute w-full border-t border-gray-200 dark:border-gray-800" />
            <span className="bg-white dark:bg-gray-900 px-2 text-sm text-gray-500">
              or
            </span>
          </div>

          {/* Sign Up */}
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
