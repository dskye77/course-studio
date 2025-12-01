/* eslint-disable @next/next/no-img-element */
// src/screen/dev/courses/new/NewCourseScreen.js
"use client";

import { useState } from "react";
import { createCourse } from "@/lib/firebaseCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ExternalLink, ImageIcon } from "lucide-react";
import Link from "next/link";

export default function NewCourseForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const validateInputs = () => {
    const newErrors = {
      title: title.trim() ? "" : "Title is required",
      description: description.trim() ? "" : "Description is required",
      price: price && Number(price) > 0 ? "" : "Price must be greater than 0",
      imageUrl: imageUrl.trim() ? "" : "Image URL is required",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  const handleCreate = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const course = await createCourse({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        imageUrl: imageUrl.trim(),
      });

      toast.success(`Course created!`);

      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setErrors({ title: "", description: "", price: "", imageUrl: "" });
      router.replace(`/dev/courses/${course.id}`);
    } catch (err) {
      console.error("Create course error:", err);
      toast.error(err.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-3xl p-8 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          Create New Course
        </h2>

        {/* Title */}
        <div className="mb-5">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Title
          </label>
          <Input
            type="text"
            placeholder="e.g. Complete React Mastery 2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Description
          </label>
          <textarea
            rows={5}
            placeholder="Describe what students will learn..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 ${
              errors.description ? "border-red-500" : ""
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Price */}
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Price (₦)
          </label>
          <Input
            type="number"
            min="0"
            step="100"
            placeholder="15000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        {/* Image URL */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-gray-700 dark:text-gray-300 font-medium">
              Course Image URL
            </label>
            <Link href="/dev/uploads" target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <ImageIcon size={14} />
                Manage Uploads
                <ExternalLink size={14} />
              </Button>
            </Link>
          </div>
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={loading}
            className={errors.imageUrl ? "border-red-500" : ""}
          />
          {errors.imageUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Upload images in the Uploads page and paste the URL here
          </p>

          {imageUrl && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-4 text-lg font-semibold"
        >
          {loading ? "Creating Course..." : "Create Course"}
        </Button>
      </div>
    </div>
  );
}