import CoursesScreen from "@/screen/courses/CoursesScreen";
import { getPublishedCourseList } from "@/lib/firebaseCourses";

export default async function CoursesPage() {
  let courses = [];

  try {
    courses = await getPublishedCourseList();
  } catch (error) {
    console.error("Error fetching courses:", error);
    courses = [];
  }

  return <CoursesScreen courses={courses} from="courses" />;
}
