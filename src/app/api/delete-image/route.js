// src/app/api/delete-image/route.js
import { NextResponse } from "next/server";
import { deleteImage } from "@/lib/cloudinaryImages";

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { userId, publicId } = body;

    if (!userId || !publicId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const parts = publicId.split("/");
    const imageName = parts[parts.length - 1];

    await deleteImage(userId, imageName);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete API error:", err);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
