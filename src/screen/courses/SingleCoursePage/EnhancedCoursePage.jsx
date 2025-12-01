// src/screen/courses/SingleCoursePage/EnhancedCoursePage.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import {
  hasPurchased,
  purchaseCourse,
  getCourseProgress,
  rateCourse,
} from "@/lib/firebasePurchases";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Check,
  Lock,
  PlayCircle,
  Award,
  TrendingUp,
} from "lucide-react";

export default function EnhancedCoursePage({ course, relatedCourses = [] }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [progress, setProgress] = useState(null);

  // Check if user has purchased the course
  useEffect(() => {
    async function checkPurchase() {
      if (!authLoading && user) {
        try {
          const purchased = await hasPurchased(course.id);
          setIsPurchased(purchased);

          if (purchased) {
            const progressData = await getCourseProgress(course.id);
            setProgress(progressData);
          }
        } catch (error) {
          console.error("Error checking purchase:", error);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
      }
    }

    checkPurchase();
  }, [user, authLoading, course.id]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please login to purchase this course");
      router.push("/login");
      return;
    }

    setPurchasing(true);
    try {
      await purchaseCourse(course.id, {
        title: course.title,
        price: course.price,
        imageUrl: course.imageUrl,
        authorId: course.authorId,
        authorName: course.authorName,
      });

      toast.success("Course purchased successfully! 🎉");
      setIsPurchased(true);

      // Refresh the page to show new content
      window.location.reload();
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to purchase course");
    } finally {
      setPurchasing(false);
    }
  };

  const handleStartLearning = () => {
    if (isPurchased && course.chapters && course.chapters.length > 0) {
      router.push(`/learn/${course.id}/chapter/${course.chapters[0].id}`);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen p-8">
        <Skeleton className="h-96 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          {/* Course Info */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm">
              {course.category || "Course"}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {course.title}
            </h1>

            <p className="text-lg text-white/90">{course.description}</p>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">
                  {course.rating?.toFixed(1) || "New"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{course.students || 0} students</span>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{course.chapters?.length || 0} chapters</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Image
                src="/default-avatar.png"
                alt={course.authorName}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="text-sm text-white/70">Created by</p>
                <p className="font-semibold">
                  {course.authorName || "Instructor"}
                </p>
              </div>
            </div>
          </div>

          {/* Course Image/Preview */}
          <div className="relative">
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={course.imageUrl || "/placeholder.jpg"}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>

            {isPurchased && progress && (
              <div className="absolute -bottom-4 left-0 right-0 mx-4 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Your Progress</span>
                  <span className="font-semibold">{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="md:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  What You&apos;ll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.requirements && course.requirements.length > 0 ? (
                    course.requirements.map((req, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{req}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm col-span-2">
                      Course requirements not specified
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.chapters && course.chapters.length > 0 ? (
                  course.chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isPurchased
                          ? "hover:bg-muted cursor-pointer transition"
                          : "opacity-60"
                      }`}
                      onClick={() => isPurchased && handleStartLearning()}
                    >
                      <div className="flex items-center gap-3">
                        {isPurchased ? (
                          <PlayCircle className="w-5 h-5 text-primary" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">
                            {index + 1}. {chapter.title || "Untitled Chapter"}
                          </p>
                          {chapter.videoUrl && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <PlayCircle className="w-3 h-3" />
                              Video lesson
                            </p>
                          )}
                        </div>
                      </div>

                      {isPurchased &&
                        progress?.completedChapters?.includes(chapter.id) && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    Course content coming soon
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary mb-2">
                    ₦{course.price?.toLocaleString()}
                  </p>
                  {course.price === 0 && (
                    <p className="text-sm text-green-600 font-semibold">
                      FREE COURSE
                    </p>
                  )}
                </div>

                {isPurchased ? (
                  <div className="space-y-3">
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={handleStartLearning}
                    >
                      <PlayCircle className="w-5 h-5" />
                      {progress?.progress > 0
                        ? "Continue Learning"
                        : "Start Learning"}
                    </Button>

                    <div className="text-center text-sm text-green-600 font-semibold flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      You own this course
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePurchase}
                    disabled={purchasing}
                  >
                    {purchasing
                      ? "Processing..."
                      : course.price === 0
                      ? "Enroll Free"
                      : "Buy Now"}
                  </Button>
                )}

                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-semibold">This course includes:</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Lifetime access</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{course.chapters?.length || 0} chapters</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span>Progress tracking</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span>Certificate on completion</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
