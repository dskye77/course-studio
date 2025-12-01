// src/app/api/fetch-images/route.js
import { NextResponse } from "next/server";
import { fetchAllImages } from "@/lib/cloudinaryImages";
import { rateLimit } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Rate limiting
    if (!rateLimit(userId, 30, 60000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        { status: 429 }
      );
    }

    const images = await fetchAllImages(userId);

    return NextResponse.json(
      { images },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err) {
    console.error("Fetch images API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch images" },
      { status: 500 }
    );
  }
}
