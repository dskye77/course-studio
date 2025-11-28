"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { signUp, getCurrentUser, onAuthStateChange } from "@/lib/firebaseAuth";
import VerificationMessage from "@/components/auth/VerificationMessage";

export default function Signup() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
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
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      newErrors.email = "Enter a valid email.";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp(email, password, name);

      // Show verification screen
      setVerification(true);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
    }
  };

  // Verification screen
  if (verification) {
    return <VerificationMessage email={email} />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <Card className="w-full max-w-md p-6 shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Create an Account
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John"
              disabled={loading}
              className={`h-11 text-base ${
                errors.name ? "border-red-500" : ""
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              disabled={loading}
              placeholder="you@example.com"
              className={`h-11 text-base ${
                errors.email ? "border-red-500" : ""
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              disabled={loading}
              placeholder="••••••••"
              className={`h-11 text-base ${
                errors.password ? "border-red-500" : ""
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              disabled={loading}
              placeholder="••••••••"
              className={`h-11 text-base ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Errors */}
          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}

          {/* Sign up Button */}
          <Button
            className="w-full h-11 text-base"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="absolute w-full border-t border-gray-200 dark:border-gray-800" />
            <span className="bg-white dark:bg-gray-900 px-2 text-sm text-gray-500">
              or
            </span>
          </div>

          {/* Login redirect */}
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
