"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ImageUploader from "@/components/custom/ImageUploader";

import {
  Upload,
  Copy,
  Trash2,
  Search,
  Calendar,
  ImageIcon,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadsScreen() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("");

  const filteredUploads = !searchQuery.trim()
    ? uploads
    : uploads.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // ======================
  // API CALLS
  // ======================

  const fetchUploads = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/fetch-images?userId=${user.uid}`);
      const data = await res.json();
      if (res.ok) setUploads(data.images || []);
      else toast.error(data.error || "Failed to fetch uploads");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch uploads");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!imageFile || !imageName.trim()) {
      toast.error("Please select an image and enter a name");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("userId", user.uid);
      formData.append("name", imageName.trim());

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploads([data.upload, ...uploads]);
        setImageFile(null);
        setImageName("");
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (publicId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, userId: user.uid }),
      });

      const data = await res.json();
      if (res.ok) {
        setUploads(uploads.filter((u) => u.publicId !== publicId));
        toast.success("Image deleted successfully!");
      } else {
        toast.error(data.error || "Failed to delete image");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete image");
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  // ======================
  // LOAD ON MOUNT
  // ======================
  useEffect(() => {
    if (!authLoading && user) {
      fetchUploads();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-96 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Image Uploads
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage your images. Use these images in your courses.
        </p>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} /> Upload New Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Image Name"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              disabled={uploading}
            />
            <ImageUploader
              onImageSelect={setImageFile}
              onImageRemove={() => setImageFile(null)}
              disabled={uploading}
            />
            <Button
              onClick={handleUpload}
              disabled={uploading || !imageFile || !imageName.trim()}
              className="w-full gap-2"
            >
              <Upload size={18} /> {uploading ? "Uploading..." : "Upload Image"}
            </Button>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
          <Input
            placeholder="Search images by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Grid */}
        {filteredUploads.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">
                {searchQuery ? "No images found" : "No images yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Upload your first image to get started"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUploads.map((upload) => (
              <Card key={upload.publicId} className="overflow-hidden">
                <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                  <Image
                    src={upload?.url || ""}
                    alt={upload?.name || "undefined"}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg truncate">
                      {upload.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar size={12} />
                      <span>
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="font-medium">
                        {(upload.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span className="font-medium">
                        {upload.width} × {upload.height}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span className="font-medium uppercase">
                        {upload.format}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() =>
                        navigator.clipboard.writeText(upload.url) &&
                        toast.success("Copied!")
                      }
                    >
                      <Copy size={14} /> Copy URL
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(upload.url, "_blank")}
                    >
                      <ExternalLink size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(upload.publicId)}
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
