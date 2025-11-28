"use client";

import { useState } from "react";
import { createCourse } from "@/lib/firebaseCourses";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImageUploader from "@/components/custom/ImageUploader"; // ← your new one

import { useRouter } from "next/navigation";

export default function NewCourseForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null); // ← raw File object
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    price: "",
    mainImage: "",
  });

  const validateInputs = () => {
    const newErrors = {
      title: title.trim() ? "" : "Title is required",
      description: description.trim() ? "" : "Description is required",
      price: price && Number(price) > 0 ? "" : "Price must be greater than 0",
      mainImage: imageFile ? "" : "Please select a main image",
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
        imageFile, // ← File object → uploaded inside createCourse
      });

      toast.success(`Course created!`);

      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setImageFile(null);
      setErrors({ title: "", description: "", price: "", mainImage: "" });
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
          <input
            type="text"
            placeholder="e.g. Complete React Mastery 2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 ${
              errors.title
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
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
              errors.description
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
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
          <input
            type="number"
            min="0"
            step="100"
            placeholder="15000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 ${
              errors.price
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        {/* Image Uploader */}
        <div className="mb-8">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-4">
            Main Course Image
          </label>

          <ImageUploader
            onImageSelect={setImageFile}
            onImageRemove={() => setImageFile(null)}
            disabled={loading}
          />

          {errors.mainImage && (
            <p className="text-red-500 text-sm mt-3">{errors.mainImage}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleCreate}
          disabled={loading || !imageFile}
          className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? "Creating Course..." : "Create Course"}
        </Button>
      </div>
    </div>
  );
}
