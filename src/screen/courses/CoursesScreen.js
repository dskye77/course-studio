"use client";
import SearchBar from "@/components/custom/CourseSearchBar";

import CoursesDisplay from "@/components/custom/CourseDisplay";

export default function CoursesScreen({ from = "courses", courses }) {
  return (
    <div>
      <SearchBar />
      <div className="px-4">
        <h1 className="text-4xl font-bold mt-8 mb-8">
          {from === "courses" && "Published Courses"}
          {from === "dev" && "My Courses"}
        </h1>
        {courses.length > 0 && (
          <CoursesDisplay courses={courses} ignoreFilters={false} from={from} />
        )}
        {courses.length === 0 && <h2>No Courses Available</h2>}
      </div>
    </div>
  );
}
