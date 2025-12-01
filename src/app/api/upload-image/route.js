// src/app/api/upload-image/route.js
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinaryImages";
import { rateLimit, sanitizeInput } from "@/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Increase body size limit for image uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export async function POST(request) {
  try {
    // Get userId from query params or body
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!rateLimit(userId, 10, 60000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file");
    const name = formData.get("name");

    if (!file || !name) {
      return NextResponse.json(
        { error: "File and name are required" },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Sanitize name
    const sanitizedName = sanitizeInput(name);
    if (!sanitizedName) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const upload = await uploadImage({
      userId,
      fileBuffer: buffer,
      imageName: sanitizedName,
    });

    return NextResponse.json({ upload }, { status: 200 });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
