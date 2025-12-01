// src/app/api/fetch-images/route.js
import { NextResponse } from "next/server";
import { fetchAllImages } from "@/lib/cloudinaryImages";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const uploads = await fetchAllImages(userId);

    return NextResponse.json({ uploads });
  } catch (err) {
    console.error("Fetch API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
