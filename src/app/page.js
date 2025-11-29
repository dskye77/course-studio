import HomeScreen from "@/screen/home";
import { getPublishedCourseList } from "@/lib/firebaseCourses";

export default async function HomePage() {
  let popularCourses = [];

  try {
    const courses = await getPublishedCourseList();
    // Sort by most recent and take top 6
    popularCourses = courses
      .sort((a, b) => b.students - a.students)
      .slice(0, 6);
  } catch (error) {
    console.error("Error fetching popular courses:", error);
    popularCourses = [];
  }

  return <HomeScreen popularCourses={popularCourses} />;
}
