// src/app/courses/[id]/page.js
import CoursePage from "@/screen/courses/SingleCoursePage";
import {
  getPublishedCourseData,
  getPublishedCourseList,
} from "@/lib/firebaseCourses";

export default async function SingleCoursePage({ params }) {
  let course = null;
  let relatedCourses = [];
  let fetchError = null;

  const { id } = await params;

  try {
    // Fetch the specific course
    course = await getPublishedCourseData(id);

    // Fetch related courses (all published courses)
    const allCourses = await getPublishedCourseList();

    // Filter out current course and get up to 6 related courses
    relatedCourses = allCourses.filter((c) => c.id !== id).slice(0, 6);
  } catch (err) {
    console.error("Error fetching course:", err);
    fetchError = err;
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Course
          </h1>
          <p className="text-muted-foreground">{fetchError.message}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground">
            The course you&#39;re looking for doesn&#39;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return <CoursePage course={course} courses={relatedCourses} />;
}
