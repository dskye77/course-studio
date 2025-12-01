// components/CourseCard.js
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Bookmark,
  Users,
  Star,
  ExternalLink,
  Edit2,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

export default function CourseCard({ course, type = "courses" }) {
  const rating = course.rating || 0;
  const students = course.students || 0;
  const requirements = course.requirements || [];

  // ===== PUBLIC MARKETPLACE CARD =====
  if (type === "courses") {
    return (
      <Card className="w-full border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-transform hover:-translate-y-1 duration-300 pt-0 pb-0">
        {/* IMAGE */}
        <div className="relative w-full h-48">
          <Image
            src={course.imageUrl || "/placeholder.jpg"}
            alt={course.title}
            fill
            className="object-cover"
          />
          <button className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition">
            <Bookmark size={18} className="text-gray-700" />
          </button>
        </div>

        {/* BODY */}
        <CardContent className="pt-5 space-y-3">
          {/* RATING */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.round(rating)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2">
              ({rating.toFixed(1)})
            </span>
          </div>

          {/* TITLE */}
          <h3 className="text-lg font-semibold line-clamp-2 hover:text-blue-600 transition">
            {course.title}
          </h3>

          {/* DESCRIPTION */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>

          {/* STUDENTS */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={14} /> <span>{students} students</span>
          </div>

          {/* REQUIREMENTS PREVIEW */}
          {requirements.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {requirements.slice(0, 3).map((req, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
                >
                  <Check size={12} /> {req}
                </span>
              ))}
              {requirements.length > 3 && (
                <span className="text-xs text-blue-500 font-medium">
                  + {requirements.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* AUTHOR */}
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {course.authorName?.[0] || "A"}
            </div>
            <p className="text-sm">
              By{" "}
              <span className="font-medium text-foreground">
                {course.authorName || "Instructor"}
              </span>
            </p>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex justify-between items-center border-t bg-gray-50 dark:bg-gray-900 py-4">
          <p className="text-xl font-bold">₦{course.price?.toLocaleString()}</p>
          <Link href={`/courses/${course.id}`}>
            <Button
              variant="default"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Course <ExternalLink size={16} />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // ===== INSTRUCTOR DASHBOARD CARD =====
  if (type === "dev") {
    const isPublished = course.published;

    return (
      <Link href={`/dev/courses/${course.id}`} className="block">
        <Card
          className={`w-full border-2 rounded-xl overflow-hidden shadow hover:shadow-lg transition-transform hover:-translate-y-1 pt-0 ${
            isPublished
              ? "border-green-200 dark:border-green-800"
              : "border-orange-200 dark:border-orange-800"
          }`}
        >
          <div className="relative w-full h-48 bg-gray-200">
            <Image
              src={course.imageUrl || "/placeholder.jpg"}
              alt={course.title}
              fill
              className="object-cover"
            />

            {/* STATUS BADGE */}
            <span
              className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                isPublished
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
              }`}
            >
              {isPublished ? "Published" : "Draft"}
            </span>

            {/* VISIBILITY ICON */}
            <button className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition">
              {isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <CardContent className="pt-5 space-y-3">
            <h3 className="text-xl font-semibold">{course.title}</h3>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.description || "No description"}
            </p>

            <div className="flex justify-between items-center text-sm mt-3 text-muted-foreground">
              <span>
                {course.chaptersCount}{" "}
                {course.chaptersCount === 1 ? "chapter" : "chapters"}
              </span>
              <span>₦{course.price?.toLocaleString()}</span>
            </div>
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground border-t pt-3 flex justify-between items-center">
            <span>
              Last updated:{" "}
              {course.updatedAt?.toDate?.().toLocaleDateString() || "Just now"}
            </span>
            <Button size="sm" variant="ghost" className="gap-1">
              <Edit2 size={16} /> Edit
            </Button>
          </CardFooter>
        </Card>
      </Link>
    );
  }

  return null;
}
