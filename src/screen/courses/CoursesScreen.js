"use client";
import SearchBar from "@/components/custom/CourseSearchBar";

import CoursesDisplay from "@/components/custom/CourseDisplay";

export default function CoursesScreen({ from = "courses", courses }) {
  if (courses.length === 0)
    return (
      <div className="p-5">
        <div className="loader">No Courses Available</div>
      </div>
    );

  return (
    <div>
      <SearchBar />
      <div className="px-4">
        <h1 className="text-4xl font-bold mt-8 mb-8">
          {from === "courses" && "Published Courses"}
          {from === "dev" && "My Courses"}
        </h1>
        <CoursesDisplay courses={courses} ignoreFilters={false} from={from} />
      </div>
    </div>
  );
}
