import CoursesScreen from "@/screen/courses";
export default async function CoursesPage() {
  let courses;

  try {
    const res = await fetch("http://localhost:5500/courses.json");
    courses = await res.json();
  } catch {
    courses = [];
  }

  return <CoursesScreen courses={courses} />;
}
