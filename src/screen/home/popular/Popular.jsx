"use client";

import React from "react";
import CourseCard from "@/components/custom/CourseCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function PopularCourses({ courses }) {
  return (
    <section className="bg-muted text-foreground dark:bg-background py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Popular Courses
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
          Discover what other learners are enjoying and trending courses from
          top creators.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {courses.map((course, i) => (
          <CourseCard key={i} course={course} />
        ))}
        {courses.length === 0 &&
          [0, 0, 0, 0, 0, 0].map((_, i) => (
            <Skeleton className="w-full h-96" key={i}></Skeleton>
          ))}
      </div>
    </section>
  );
}
