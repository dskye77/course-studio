// src/screen/dev/courses/chapter/ChapterEditorScreen.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getMyCourseData, updateCourse } from "@/lib/firebaseCourses";
import { useCourseEditor } from "@/stores/courseEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // Local chapter state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Zustand store
  const {
    course,
    chapters,
    initializeCourse,
    updateChapterById,
    getChapterById,
    getCourseData,
  } = useCourseEditor();

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      const unwrapped = await params;
      setCourseId(unwrapped.id);
      setChapterId(unwrapped.chapterId);
    };
    unwrapParams();
  }, [params]);

  // Load course and chapter
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !courseId || !chapterId) return;

      try {
        setLoading(true);

        // Check if course is already in store
        if (!course || course.id !== courseId) {
          const courseData = await getMyCourseData(courseId);
          if (!courseData) {
            toast.error("Course not found");
            router.replace("/dev/courses");
            return;
          }
          initializeCourse(courseData);
        }

        // Get chapter from store
        const chapter = getChapterById(chapterId);
        if (!chapter) {
          toast.error("Chapter not found");
          router.replace(`/dev/courses/${courseId}`);
          return;
        }

        // Initialize local state
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
    };

    if (!authLoading && user && courseId && chapterId) {
      fetchData();
    }
  }, [
    user,
    authLoading,
    courseId,
    chapterId,
    course,
    router,
    initializeCourse,
    getChapterById,
  ]);

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
      // Update chapter in store
      updateChapterById(chapterId, {
        title: title.trim(),
        content,
        videoUrl: videoUrl.trim(),
      });

      // Save entire course to Firebase
      const courseData = getCourseData();
      await updateCourse({
        courseId,
        chapters: courseData.chapters,
      });

      toast.success("Chapter saved successfully!");
      setHasLocalChanges(false);

      // Refresh course data
      const updatedCourse = await getMyCourseData(courseId);
      initializeCourse(updatedCourse);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save chapter");
    }
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [title, content, videoUrl]);

  const handleBack = () => {
    if (hasLocalChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirm) return;
    }
    router.push(`/dev/courses/${courseId}`);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    setHasLocalChanges(true);
  };

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    setHasLocalChanges(true);
  };

  const handleVideoUrlChange = (newUrl) => {
    setVideoUrl(newUrl);
    setHasLocalChanges(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
        <Skeleton className="h-16 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!course) return null;

  const currentChapter = getChapterById(chapterId);
  if (!currentChapter) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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

      <div className="max-w-5xl mx-auto p-6">
        {/* Title Input */}
        <div className="mb-6">
          <Input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Chapter Title"
            className="text-3xl font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0"
            disabled={isPreview}
          />
        </div>

        {/* Video URL */}
        {!isPreview && (
          <div className="mb-6">
            <Input
              type="url"
              value={videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              placeholder="Video URL (optional) - e.g., YouTube embed link"
              className="mb-2"
            />
            {videoUrl && (
              <p className="text-sm text-muted-foreground">
                💡 Tip: Use YouTube embed URLs for best results
              </p>
            )}
          </div>
        )}

        {isPreview ? (
          /* Preview Mode */
          <div className="space-y-6">
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
          /* Edit Mode */
          <>
            <RichTextEditor
              content={content}
              onChange={handleContentChange}
              disabled={false}
            />

            {/* Help Text */}
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p className="font-medium">💡 Tips:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  Changes are tracked automatically - just click Save when ready
                </li>
                <li>Select text to format it with the toolbar buttons</li>
                <li>Click the image icon to upload images inline</li>
                <li>Press Ctrl/Cmd + S to save at any time</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
