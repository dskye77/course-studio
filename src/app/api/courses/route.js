// app/api/courses/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch your courses from wherever (local JSON, database, etc.)
    const res = await fetch("http://127.0.0.1:5500/courses.json");
    const courses = await res.json();

    return NextResponse.json(courses);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
