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
} from "lucide-react";

export default function CourseCard({ course, type = "courses" }) {
  // Public marketplace view
  if (type === "courses") {
    return (
      <Card className="w-full border rounded-md overflow-hidden shadow-sm hover:shadow-xl transition-all py-0">
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

        <CardContent className="pt-5 space-y-3">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                }
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2">(4.8)</span>
          </div>

          <h3 className="text-lg font-bold line-clamp-2">{course.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={14} />
            <span>{course.students || 128} students</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {course.authorName?.[0] || "A"}
            </div>
            <div>
              <p className="text-sm">
                By{" "}
                <span className="font-medium text-foreground">
                  {course.authorName || "Instructor"}
                </span>
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center border-t bg-gray-50 dark:bg-gray-900 py-4">
          <p className="text-xl font-bold">₦{course.price.toLocaleString()}</p>
          <Link href={`/courses/${course.id}`}>
            <Button variant="default" className="gap-2">
              View Course <ExternalLink size={16} />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Instructor dashboard view (type="dev")
  if (type === "dev") {
    const isPublished = course.published;

    return (
      <Link href={`/dev/courses/${course.id}`} className="block">
        <Card
          className={`w-full border-2 rounded-xl overflow-hidden shadow hover:shadow-lg transition-all pt-0 ${
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
            <div className="absolute top-3 left-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isPublished
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                }`}
              >
                {isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <button className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition">
                {isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <CardContent className="pt-5">
            <h3 className="text-xl font-bold mb-2">{course.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {course.description || "No description"}
            </p>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{course.chaptersCount || 0} chapters</span>
                <span>•</span>
                <span>₦{course.price.toLocaleString()}</span>
              </div>
              <Button size="sm" variant="ghost" className="gap-2">
                <Edit2 size={16} />
                Edit
              </Button>
            </div>
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground border-t pt-3">
            Last updated:{" "}
            {course.updatedAt?.toDate?.().toLocaleDateString() || "Just now"}
          </CardFooter>
        </Card>
      </Link>
    );
  }

  return null;
}
