"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Mail, Calendar, Shield, Save, Camera } from "lucide-react";

export default function ProfileScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user, loading, router]);

  const validate = () => {
    const newErrors = {};
    if (!displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }
    if (photoURL && !isValidURL(photoURL)) {
      newErrors.photoURL = "Please enter a valid URL";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidURL = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || null,
      });

      toast.success("Profile updated successfully!");

      // Force refresh to update UI
      window.location.reload();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">My Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={photoURL || user.photoURL} />
                <AvatarFallback className="bg-blue-600 text-white text-4xl">
                  {(displayName || user.email)?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="gap-2">
                <Camera size={16} />
                Change Photo
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User size={18} />
                <span className="font-medium">Display Name:</span>
                <span>{user.displayName || "Not set"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={18} />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={18} />
                <span className="font-medium">Member Since:</span>
                <span>
                  {user.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-green-600" />
                <span className="font-medium">Email Verified:</span>
                <span
                  className={
                    user.emailVerified ? "text-green-600" : "text-red-600"
                  }
                >
                  {user.emailVerified ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={saving}
                className={errors.displayName ? "border-red-500" : ""}
              />
              {errors.displayName && (
                <p className="text-sm text-red-500">{errors.displayName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoURL">Photo URL</Label>
              <Input
                id="photoURL"
                type="text"
                placeholder="https://example.com/photo.jpg"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                disabled={saving}
                className={errors.photoURL ? "border-red-500" : ""}
              />
              {errors.photoURL && (
                <p className="text-sm text-red-500">{errors.photoURL}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Paste a URL to your profile picture
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  User ID
                </p>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1 truncate">
                  {user.uid}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Sign In
                </p>
                <p className="text-sm mt-1">
                  {user.metadata?.lastSignInTime
                    ? new Date(user.metadata.lastSignInTime).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/dev/dashboard")}
            >
              Go to Instructor Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/courses")}
            >
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
