// src/app/api/delete-image/route.js
import { NextResponse } from "next/server";
import { deleteImage } from "@/lib/cloudinaryImages";
import { rateLimit, sanitizeInput } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { userId, publicId } = body;

    if (!userId || !publicId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!rateLimit(userId, 20, 60000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        { status: 429 }
      );
    }

    // Extract image name from publicId
    // publicId format: "course_studio/users/{userId}/uploads/{imageName}"
    const parts = publicId.split("/");
    const imageName = parts[parts.length - 1];

    if (!imageName) {
      return NextResponse.json({ error: "Invalid public ID" }, { status: 400 });
    }

    // Validate that the image belongs to this user
    if (!publicId.includes(`users/${userId}/`)) {
      return NextResponse.json(
        { error: "Unauthorized: You can only delete your own images" },
        { status: 403 }
      );
    }

    await deleteImage(userId, imageName);

    return NextResponse.json(
      { success: true, message: "Image deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Delete API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}
