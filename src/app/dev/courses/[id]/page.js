import CoursePage from "@/screen/courses/SingleCoursePage";

export default async function SingleCoursePage({ params }) {
  let courses = [];
  let course = null;
  let fetchError = null;

  const { id } = await params;

  try {
    const res = await fetch("http://localhost:5500/courses.json");
    courses = await res.json();

    // Correct: find the course object by id
    course = courses.find((c) => c.id.toString() === id);
  } catch (err) {
    fetchError = err;
  }

  if (fetchError) {
    return <div>Error loading course</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return <CoursePage course={course} courses={courses} />;
}
