// src/screen/dev/courses/chapter/ChapterEditorScreen.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getMyCourseData, updateCourse } from "@/lib/firebaseCourses";
import { useCourseEditor } from "@/stores/courseEditor";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import RichTextEditor from "@/components/custom/RichTextEditor";
import { ArrowLeft, Save, Eye, Edit, AlertCircle } from "lucide-react";

export default function ChapterEditorScreen({ params }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courseId, setCourseId] = useState(null);
  const [chapterId, setChapterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  const {
    course,
    chapters,
    initializeCourse,
    updateChapterById,
    getChapterById,
    getCourseData,
  } = useCourseEditor();

  // 1) Unwrap params synchronously (no await)
  useEffect(() => {
    if (!params) return;
    // Next.js route params might be e.g. { id, chapterId }
    setCourseId(params.id ?? params.courseId ?? null);
    setChapterId(params.chapterId ?? params.chapterId ?? null);
  }, [params]);

  // fetchData callback (memoized to avoid recreation in useEffect)
  const fetchData = useCallback(async () => {
    // defensive: ensure we only run when we have user & route ids
    if (!user || !courseId || !chapterId) return;

    setLoading(true);
    try {
      // try reading chapter from store first
      let chapter = getChapterById(chapterId);

      // if not found or store course mismatch, fetch full course from backend
      if (!chapter || !course || course.id !== courseId) {
        const courseData = await getMyCourseData(courseId);
        if (!courseData) {
          toast.error("Course not found");
          router.replace("/dev/courses");
          return;
        }
        // initialize the store synchronously with fetched course
        initializeCourse(courseData);
        chapter = courseData.chapters?.find((ch) => ch.id === chapterId);
      }

      if (!chapter) {
        toast.error("Chapter not found");
        router.replace(`/dev/courses/${courseId}`);
        return;
      }

      // Initialize local controlled state
      setTitle(chapter.title || "");
      setContent(
        chapter.content || "<p>Start writing your chapter content...</p>"
      );
      setVideoUrl(chapter.videoUrl || "");
      setHasLocalChanges(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load chapter");
    } finally {
      setLoading(false);
    }
  }, [
    user,
    courseId,
    chapterId,
    getChapterById,
    initializeCourse,
    router,
    course,
  ]);

  // 2) Effect that triggers the fetch after auth and params are available
  useEffect(() => {
    // if auth is still loading, wait
    if (authLoading) return;

    // if auth finished and there is no user, bail and stop loading state so UI doesn't hang
    if (!user) {
      setLoading(false);
      return;
    }

    // if params are not ready, stop showing spinner (this prevents stuck skeleton)
    if (!courseId || !chapterId) {
      setLoading(false);
      return;
    }

    // All good: load data
    fetchData();
  }, [authLoading, user, courseId, chapterId, fetchData]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasLocalChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasLocalChanges]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Chapter title is required");
      return;
    }

    try {
      updateChapterById(chapterId, {
        title: title.trim(),
        content,
        videoUrl: videoUrl.trim(),
      });

      const courseData = getCourseData();
      await updateCourse({
        courseId,
        chapters: courseData.chapters,
      });

      toast.success("Chapter saved successfully!");
      setHasLocalChanges(false);

      // refresh store with latest from backend
      const updatedCourse = await getMyCourseData(courseId);
      initializeCourse(updatedCourse);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save chapter");
    }
  };

  const handleBack = () => {
    if (hasLocalChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) return;
    }
    router.push(`/dev/courses/${courseId || ""}`);
  };

  // On-change handler from the editor (accepts { title, content, videoUrl })
  const handleChange = (newData) => {
    if (!newData) return;
    setTitle(newData.title ?? title);
    setContent(newData.content ?? content);
    setVideoUrl(newData.videoUrl ?? videoUrl);
    setHasLocalChanges(true);
  };

  // Show skeleton while auth or data fetching is in progress
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
        <Skeleton className="h-16 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // If we don't have course after loading finished, show friendly message
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl text-center">
          <h2 className="text-lg font-semibold mb-2">Course not found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We couldn&apos;t find that course. It may have been deleted or you
            don&apos;t have access.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => router.push("/dev/courses")}>
              Back to courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Safely get the current chapter (may be undefined while store updates).
  // If it's missing we still render the editor using local state.
  const currentChapter = getChapterById(chapterId) || {
    id: chapterId,
    title,
    content,
    videoUrl,
    order: 0,
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">Chapter Editor</h1>
                {hasLocalChanges && (
                  <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                    <AlertCircle className="w-3 h-3" />
                    Unsaved
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {course.title} • Chapter {currentChapter.order + 1}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
              className="gap-2"
            >
              {isPreview ? (
                <>
                  <Edit className="w-4 h-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Preview
                </>
              )}
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasLocalChanges}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div className="h-full overflow-auto p-8 space-y-6">
            {videoUrl && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Video</h3>
                <div className="aspect-video">
                  <iframe
                    src={videoUrl}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-800">
              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        ) : (
          <div className="h-full min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <RichTextEditor
                initialContent={content}
                initialTitle={title}
                initialVideoUrl={videoUrl}
                onChange={handleChange}
                disabled={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
