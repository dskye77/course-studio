"use client";

import Link from "next/link";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink, Star, Bookmark } from "lucide-react";

export default function CourseCard({ course }) {
  return (
    <Card
      className={`w-full border rounded-md overflow-hidden shadow-sm hover:shadow-lg transition-all pt-0`}
    >
      {/* Course Image */}
      <div className="relative w-full h-40">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover"
        />

        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 bg-white/90 hover:bg-white text-primary p-2 rounded-full shadow-md transition cursor-pointer">
          <Bookmark size={18} />
        </button>
      </div>

      <CardContent className="space-y-3 pt-4">
        {/* Ratings */}
        <div className="flex gap-1 text-yellow-400">
          {Array.from({ length: course.rating }).map((_, i) => (
            <Star key={i} size={24} />
          ))}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold">{course.title}</h3>
        <p className="text-sm text-muted">{course.description}</p>

        {/* Students */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <Users size={15} />
          {course.students}
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-3 mt-2">
          {/* Avatar Letter */}
          <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-full font-bold">
            {course.instructor[0]}
          </div>

          <p className="text-sm text-muted-foreground">
            By{" "}
            <span className="font-medium text-foreground">
              {course.instructor}
            </span>{" "}
            in <span className="text-primary">{course.category}</span>
          </p>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between border-t pt-4">
        {/* Price */}
        <p className="font-semibold text-lg">
          ₦{course.price.toLocaleString()}
        </p>

        {/* Add to Cart */}
        <Link href={`/courses/${course.id - 1}`}>
          <Button
            variant="outline"
            className="flex gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            View Course
            <ExternalLink size={16} />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
