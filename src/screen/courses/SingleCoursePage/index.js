"use client";

import CourseHead from "./CourseHead";

import SearchBar from "../../../components/custom/CourseSearchBar";

import CoursesDisplay from "../../../components/custom/CourseDisplay";

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
