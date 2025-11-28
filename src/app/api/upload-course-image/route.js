// app/api/upload-course-image/route.js
import { NextRequest } from "next/server";
import { uploadCourseImage } from "@/lib/cloudinaryClient";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");
    const courseId = formData.get("courseId") || "temp";
    const type = formData.get("type") || "main";

    if (!file || !userId) {
      return Response.json({ error: "Missing file or userId" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadCourseImage({
      userId,
      courseId,
      fileBuffer: buffer,
      type,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}