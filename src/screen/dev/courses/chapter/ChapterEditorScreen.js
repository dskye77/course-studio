// src/screen/dev/courses/chapter/ChapterEditorScreen.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getMyCourseData, updateCourse } from "@/lib/firebaseCourses";
import {
  saveChapterQuiz,
  getChapterQuiz,
  deleteChapterQuiz,
} from "@/lib/firebaseQuizzes";
import { useCourseEditor } from "@/stores/courseEditor";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import RichTextEditor from "@/components/custom/RichTextEditor";
import QuizEditor from "@/components/custom/QuizEditor";
import {
  ArrowLeft,
  Save,
  Eye,
  Edit,
  AlertCircle,
  BookOpenCheck,
  Plus,
  Trash2,
} from "lucide-react";

export default function ChapterEditorScreen({ params }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courseId, setCourseId] = useState(null);
  const [chapterId, setChapterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [showQuizEditor, setShowQuizEditor] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  const {
    course,
    chapters,
    initializeCourse,
    updateChapterById,
    getChapterById,
    getCourseData,
  } = useCourseEditor();

  useEffect(() => {
    if (!params) return;
    setCourseId(params.id ?? params.courseId ?? null);
    setChapterId(params.chapterId ?? params.chapterId ?? null);
  }, [params]);

  const fetchData = useCallback(async () => {
    if (!user || !courseId || !chapterId) return;

    setLoading(true);
    try {
      let chapter = getChapterById(chapterId);

      if (!chapter || !course || course.id !== courseId) {
        const courseData = await getMyCourseData(courseId);
        if (!courseData) {
          toast.error("Course not found");
          router.replace("/dev/courses");
          return;
        }
        initializeCourse(courseData);
        chapter = courseData.chapters?.find((ch) => ch.id === chapterId);
      }

      if (!chapter) {
        toast.error("Chapter not found");
        router.replace(`/dev/courses/${courseId}`);
        return;
      }

      setTitle(chapter.title || "");
      setContent(
        chapter.content || "<p>Start writing your chapter content...</p>"
      );

      // Load quiz
      const chapterQuiz = await getChapterQuiz(courseId, chapterId);
      setQuiz(chapterQuiz);

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

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    if (!courseId || !chapterId) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [authLoading, user, courseId, chapterId, fetchData]);

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
        // videoUrl removed - no longer stored at chapter level
      });

      const courseData = getCourseData();
      await updateCourse({
        courseId,
        chapters: courseData.chapters,
      });

      toast.success("Chapter saved successfully!");
      setHasLocalChanges(false);

      const updatedCourse = await getMyCourseData(courseId);
      initializeCourse(updatedCourse);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save chapter");
    }
  };

  const handleSaveQuiz = async (quizData) => {
    try {
      await saveChapterQuiz(courseId, chapterId, quizData);
      setQuiz(quizData);
      setShowQuizEditor(false);
      toast.success("Quiz saved successfully!");
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error("Failed to save quiz");
    }
  };

  const handleDeleteQuiz = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await deleteChapterQuiz(courseId, chapterId);
      setQuiz(null);
      toast.success("Quiz deleted");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
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

  const handleChange = (newData) => {
    if (!newData) return;
    setTitle(newData.title ?? title);
    setContent(newData.content ?? content);
    // videoUrl removed from handler
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

  const currentChapter = getChapterById(chapterId) || {
    id: chapterId,
    title,
    content,
    order: 0,
  };

  if (showQuizEditor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <QuizEditor
            quiz={quiz}
            onSave={handleSaveQuiz}
            onCancel={() => setShowQuizEditor(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
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

            {quiz ? (
              <Button
                variant="outline"
                onClick={() => setShowQuizEditor(true)}
                className="gap-2"
              >
                <BookOpenCheck className="w-4 h-4" />
                Edit Quiz
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowQuizEditor(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Quiz
              </Button>
            )}

            {quiz && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteQuiz}
                title="Delete Quiz"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            )}

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
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-800">
              <h1 className="text-3xl font-bold mb-6">{title}</h1>
              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>

            {quiz && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpenCheck className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Chapter Quiz</h2>
                </div>
                <p className="text-muted-foreground mb-2">{quiz.title}</p>
                <p className="text-sm text-muted-foreground">
                  {quiz.questions.length} questions • Passing score:{" "}
                  {quiz.passingScore}%
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <RichTextEditor
                initialContent={content}
                initialTitle={title}
                initialVideoUrl="" // Empty - no longer used
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
