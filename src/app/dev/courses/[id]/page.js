// src/app/dev/courses/[id]/page.js
import DevSingleCourseScreen from "@/screen/dev/courses/single/DevSingleCourseScreen";

export default function DevSingleCoursePage({ params }) {
  return <DevSingleCourseScreen params={params} />;
}
