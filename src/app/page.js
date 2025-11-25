import HomeScreen from "@/screen/home";


export default async function HomePage() {
  let popularCourses;
  try {
    const res = await fetch("http://localhost:5500/courses.json");
    const courses = await res.json();
    popularCourses = courses
      .sort((a, b) => b.students - a.students)
      .slice(0, 6);
  } catch (err) {
    popularCourses = [];
  } finally {
    return <HomeScreen popularCourses={popularCourses} />;
  }
}
