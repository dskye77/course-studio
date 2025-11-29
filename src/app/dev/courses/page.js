// src/app/dev/courses/page.js
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getMyCourseList } from "@/lib/firebaseCourses";
import CoursesScreen from "@/screen/courses/CoursesScreen";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DevCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const myCourses = await getMyCourseList();
        setCourses(myCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchCourses();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">
          <p>Error loading courses: {error}</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            No Courses Yet
          </h2>
          <p className="text-muted-foreground max-w-md">
            You haven&apos;t created any courses yet. Start creating your first course and share your knowledge with the world!
          </p>
          <Button
            size="lg"
            className="gap-2 mt-4"
            onClick={() => router.push("/dev/courses/new")}
          >
            <Plus size={20} />
            Create Your First Course
          </Button>
        </div>
      </div>
    );
  }

  return <CoursesScreen courses={courses} from="dev" />;
}