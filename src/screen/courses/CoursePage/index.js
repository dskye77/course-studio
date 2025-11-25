"use client";

import CourseHead from "./CourseHead";

import SearchBar from "../SearchBar";

import CoursesDisplay from "../CoursesDisplay";

export default function CoursePage({ course, courses }) {
  if (!course) return <p>Course not found</p>;

  return (
    <div>
      <CourseHead course={course} />
      <SearchBar />
      <CoursesDisplay courses={courses} ignoreFilters={false}/>
    </div>
  );
}
