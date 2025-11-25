"use client";
import SearchBar from "./SearchBar";

import CoursesDisplay from "./CoursesDisplay";

export default function CoursesScreen({ courses }) {
  // Show loading state

  if (courses.length === 0)
    return (
      <div className="p-5">
        <div className="loader">No Courses Available</div>
      </div>
    );

  return (
    <div>
      <SearchBar />
      <h1 className="text-4xl font-bold mt-8 mb-8">All Courses</h1>
      <CoursesDisplay courses={courses} ignoreFilters={false} />
    </div>
  );
}
