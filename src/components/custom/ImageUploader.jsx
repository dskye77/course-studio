/* eslint-disable @next/next/no-img-element */
// components/ImageUploader.jsx  ← renamed (not Cloudinary-specific anymore)
"use client";

import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";

export default function ImageUploader({
  onImageSelect, // ← gives you the File when user picks it
  onImageRemove, // ← optional: when user clicks X
  disabled = false,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const blobUrl = URL.createObjectURL(selected);
    setPreview(blobUrl);

    // Tell parent: "Here is the selected file"
    onImageSelect?.(selected);
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    onImageRemove?.();
  };

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="space-y-6">
      {!preview ? (
        <label
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors
            ${
              disabled
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }
            border-gray-300 dark:border-gray-700
          `}
        >
          <div className="flex flex-col items-center gap-4 text-gray-600 dark:text-gray-400">
            <Upload className="w-12 h-12" />
            <div className="text-center">
              <p className="text-lg font-medium">Click to upload image</p>
              <p className="text-sm">PNG, JPG, WebP up to 10MB</p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-96 object-cover rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          />
          <button
            onClick={removeImage}
            disabled={disabled}
            className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
