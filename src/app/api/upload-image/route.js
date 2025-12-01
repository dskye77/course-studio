// src/app/api/upload-image/route.js
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinaryImages";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // disable Next.js default parser
  },
};

export async function POST(req) {
  try {
    const form = formidable({ multiples: false });

    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const { fields, files } = data;
    const userId = fields.userId;
    const name = fields.name;

    if (!userId || !name || !files.file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const fileBuffer = fs.readFileSync(files.file.filepath);

    const upload = await uploadImage({
      userId,
      fileBuffer,
      imageName: name,
    });

    return NextResponse.json({ upload });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
