// src/app/learn/[courseId]/chapter/[chapterId]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  hasPurchased,
  getCourseProgress,
  updateProgress,
} from "@/lib/firebasePurchases";
import { saveQuizAttempt, getQuizAttempts } from "@/lib/firebaseQuizzes";
import { getPublishedCourseData } from "@/lib/firebaseCourses";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import QuizPlayer from "@/components/custom/QuizPlayer";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  BookOpen,
  Menu,
  X,
  BookOpenCheck,
  Award,
} from "lucide-react";

export default function LearnPage({ params }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courseId, setCourseId] = useState(null);
  const [chapterId, setChapterId] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    const unwrap = async () => {
      const p = await params;
      setCourseId(p.courseId);
      setChapterId(p.chapterId);
    };
    unwrap();
  }, [params]);

  useEffect(() => {
    async function loadCourse() {
      if (!user || !courseId || !chapterId) return;

      try {
        const purchased = await hasPurchased(courseId);
        if (!purchased) {
          toast.error("You don't have access to this course");
          router.push(`/courses/${courseId}`);
          return;
        }

        const courseData = await getPublishedCourseData(courseId);
        if (!courseData) {
          toast.error("Course not found");
          router.push("/courses");
          return;
        }

        setCourse(courseData);

        const chapter = courseData.chapters?.find((ch) => ch.id === chapterId);
        if (!chapter) {
          toast.error("Chapter not found");
          return;
        }

        setCurrentChapter(chapter);

        const progressData = await getCourseProgress(courseId);
        setProgress(progressData);

        // Load quiz score if exists
        if (chapter.quiz) {
          const previousScore = await getQuizAttempts(courseId, chapterId);
          setQuizScore(previousScore);
        }
      } catch (error) {
        console.error("Error loading course:", error);
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadCourse();
    }
  }, [user, authLoading, courseId, chapterId, router]);

  const handleMarkComplete = async () => {
    if (!currentChapter) return;

    // If there's a quiz and it hasn't been passed, show quiz first
    if (currentChapter.quiz && !quizScore) {
      toast.info("Complete the quiz to finish this chapter");
      setShowQuiz(true);
      return;
    }

    setMarkingComplete(true);
    try {
      const isCompleted = progress?.completedChapters?.includes(
        currentChapter.id
      );
      const newProgress = await updateProgress(
        courseId,
        currentChapter.id,
        !isCompleted
      );

      setProgress(newProgress);
      toast.success(
        isCompleted ? "Marked as incomplete" : "Chapter completed! 🎉"
      );

      if (!isCompleted) {
        setTimeout(() => handleNextChapter(), 1000);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleQuizComplete = async (attempt) => {
    try {
      await saveQuizAttempt(courseId, chapterId, attempt);
      setQuizScore({
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
      });

      const passed = attempt.percentage >= currentChapter.quiz.passingScore;

      if (passed) {
        toast.success(`Quiz passed with ${attempt.percentage}%! 🎉`);

        // Auto-mark chapter as complete if quiz is passed
        const newProgress = await updateProgress(
          courseId,
          currentChapter.id,
          true
        );
        setProgress(newProgress);

        setTimeout(() => {
          setShowQuiz(false);
          handleNextChapter();
        }, 2000);
      } else {
        toast.error(
          `You need ${currentChapter.quiz.passingScore}% to pass. Try again!`
        );
      }
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
      toast.error("Failed to save quiz results");
    }
  };

  const handleNextChapter = () => {
    if (!course || !currentChapter) return;

    const currentIndex = course.chapters.findIndex(
      (ch) => ch.id === currentChapter.id
    );
    if (currentIndex < course.chapters.length - 1) {
      const nextChapter = course.chapters[currentIndex + 1];
      router.push(`/learn/${courseId}/chapter/${nextChapter.id}`);
    } else {
      toast.success("You've completed the course! 🎉");
      router.push(`/courses/${courseId}`);
    }
  };

  const handlePrevChapter = () => {
    if (!course || !currentChapter) return;

    const currentIndex = course.chapters.findIndex(
      (ch) => ch.id === currentChapter.id
    );
    if (currentIndex > 0) {
      const prevChapter = course.chapters[currentIndex - 1];
      router.push(`/learn/${courseId}/chapter/${prevChapter.id}`);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!course || !currentChapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Course or chapter not found</p>
      </div>
    );
  }

  const currentIndex = course.chapters.findIndex(
    (ch) => ch.id === currentChapter.id
  );
  const isLastChapter = currentIndex === course.chapters.length - 1;
  const isFirstChapter = currentIndex === 0;
  const isCompleted = progress?.completedChapters?.includes(currentChapter.id);
  const hasQuiz = !!currentChapter.quiz;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>

          <div>
            <h1 className="font-semibold text-lg">{course.title}</h1>
            <p className="text-sm text-muted-foreground">
              Chapter {currentIndex + 1} of {course.chapters.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 mr-4">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <span className="font-semibold">{progress?.progress || 0}%</span>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push(`/courses/${courseId}`)}
          >
            Exit Course
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div className="w-80 bg-white dark:bg-gray-900 border-r overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Content
              </h2>
              <div className="mt-3">
                <Progress value={progress?.progress || 0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {progress?.completedChapters?.length || 0} of{" "}
                  {course.chapters.length} completed
                </p>
              </div>
            </div>

            <div className="p-2">
              {course.chapters.map((chapter, index) => {
                const completed = progress?.completedChapters?.includes(
                  chapter.id
                );
                const isCurrent = chapter.id === currentChapter.id;

                return (
                  <button
                    key={chapter.id}
                    onClick={() =>
                      router.push(`/learn/${courseId}/chapter/${chapter.id}`)
                    }
                    className={`w-full text-left p-3 rounded-lg transition ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium shrink-0">
                          {index + 1}.
                        </span>
                        <span className="text-sm truncate">
                          {chapter.title || "Untitled"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {chapter.quiz && (
                          <BookOpenCheck className="w-3 h-3 text-blue-600" />
                        )}
                        {completed && (
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {showQuiz && currentChapter.quiz ? (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setShowQuiz(false)}
                  className="mb-4 gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Chapter
                </Button>
                <QuizPlayer
                  quiz={currentChapter.quiz}
                  onComplete={handleQuizComplete}
                  previousScore={quizScore}
                />
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
                  <h1 className="text-3xl font-bold mb-6">
                    {currentChapter.title}
                  </h1>

                  <div
                    className="prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentChapter.content }}
                  />
                </div>

                {hasQuiz && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <BookOpenCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            Chapter Quiz
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {currentChapter.quiz.title}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>
                              {currentChapter.quiz.questions.length} questions
                            </span>
                            <span>
                              Passing: {currentChapter.quiz.passingScore}%
                            </span>
                          </div>

                          {quizScore && (
                            <div className="mt-3 flex items-center gap-2">
                              <Award
                                className={`w-4 h-4 ${
                                  quizScore.percentage >=
                                  currentChapter.quiz.passingScore
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }`}
                              />
                              <span
                                className={`text-sm font-semibold ${
                                  quizScore.percentage >=
                                  currentChapter.quiz.passingScore
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }`}
                              >
                                Best Score: {quizScore.percentage}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => setShowQuiz(true)}
                        className="shrink-0"
                      >
                        {quizScore ? "Retake Quiz" : "Start Quiz"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                  <Button
                    variant="outline"
                    onClick={handlePrevChapter}
                    disabled={isFirstChapter}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <Button
                    onClick={handleMarkComplete}
                    disabled={markingComplete || (hasQuiz && !quizScore)}
                    variant={isCompleted ? "outline" : "default"}
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {markingComplete
                      ? "Updating..."
                      : isCompleted
                      ? "Completed"
                      : hasQuiz && !quizScore
                      ? "Complete Quiz First"
                      : "Mark Complete"}
                  </Button>

                  <Button
                    onClick={handleNextChapter}
                    disabled={isLastChapter}
                    className="gap-2"
                  >
                    {isLastChapter ? "Finish Course" : "Next"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
