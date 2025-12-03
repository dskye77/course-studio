// src/screen/dev/courses/single/DevSingleCourseScreen.js
"use client";

import {
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Edit2,
  FileText,
  AlertCircle,
  ImageIcon,
  ExternalLink,
} from "lucide-react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyCourseData,
  updateCourse,
  publishCourse,
  unpublishCourse,
  deleteCourse,
} from "@/lib/firebaseCourses";
import { useCourseEditor } from "@/stores/courseEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function DevSingleCourseScreen({ params }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courseId, setCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    course,
    title,
    description,
    price,
    imageUrl,
    chapters,
    isSaving,
    isPublishing,
    hasUnsavedChanges,
    initializeCourse,
    setTitle,
    setDescription,
    setPrice,
    setImageUrl,
    addChapter,
    updateChapter,
    deleteChapter,
    setIsSaving,
    setIsPublishing,
    markAsSaved,
    getCourseData,
  } = useCourseEditor();

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrapped = await params;
      setCourseId(unwrapped.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user || !courseId) return;

      try {
        setLoading(true);
        const data = await getMyCourseData(courseId);

        if (!data) {
          toast.error("Course not found");
          router.replace("/dev/courses");
          return;
        }

        initializeCourse(data);
      } catch (err) {
        console.error("Error fetching course:", err);
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && courseId) {
      fetchCourse();
    }
  }, [user, authLoading, courseId, router, initializeCourse]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!price || Number(price) < 0)
      newErrors.price = "Price must be 0 or greater";
    if (!imageUrl.trim()) newErrors.imageUrl = "Image URL is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const courseData = getCourseData();

      await updateCourse({
        courseId,
        title: courseData.title.trim(),
        description: courseData.description.trim(),
        price: Number(courseData.price),
        imageUrl: courseData.imageUrl.trim(),
        chapters: courseData.chapters,
      });

      toast.success("Course updated successfully!");
      markAsSaved();

      const updatedData = await getMyCourseData(courseId);
      initializeCourse(updatedData);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save course");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validate()) {
      toast.error("Please fix errors before publishing");
      return;
    }

    if (chapters.length === 0) {
      toast.error("Add at least one chapter before publishing");
      return;
    }

    setIsPublishing(true);
    try {
      await publishCourse(courseId, user.displayName || user.email);
      toast.success("Course published successfully!");

      const updatedData = await getMyCourseData(courseId);
      initializeCourse(updatedData);
    } catch (err) {
      console.error("Publish error:", err);
      toast.error(err.message || "Failed to publish course");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setIsPublishing(true);
    try {
      await unpublishCourse(courseId);
      toast.success("Course unpublished");

      const updatedData = await getMyCourseData(courseId);
      initializeCourse(updatedData);
    } catch (err) {
      console.error("Unpublish error:", err);
      toast.error(err.message || "Failed to unpublish course");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteCourse = async () => {
    setDeleting(true);
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted successfully");
      router.push("/dev/courses");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete course");
      setDeleting(false);
    }
  };

  const handleAddChapter = () => {
    addChapter();
    toast.success("Chapter added! Click Edit to add content.");
  };

  const handleDeleteChapter = (index) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this chapter? This action cannot be undone."
    );
    if (!confirmed) return;

    deleteChapter(index);
    toast.success("Chapter removed");
  };

  const handleEditChapter = (chapterId) => {
    if (chapters.some((ch) => !ch.title.trim())) {
      toast.error("Please add a title to all chapters before editing content");
      return;
    }
    router.push(`/dev/courses/${courseId}/chapters/${chapterId}`);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirm) return;
    }
    router.push("/dev/courses");
  };

  if (authLoading || loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft size={18} />
              Back to Courses
            </Button>
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 size={18} />
              Delete Course
            </Button>

            <Button
              variant="outline"
              onClick={course.published ? handleUnpublish : handlePublish}
              disabled={isPublishing || hasUnsavedChanges}
              className="gap-2"
            >
              {course.published ? (
                <>
                  <EyeOff size={18} />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye size={18} />
                  Publish
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="gap-2"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  course.published
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                }`}
              >
                {course.published ? "Published" : "Draft"}
              </span>
              <p className="text-sm text-muted-foreground">
                {course.published
                  ? "Your course is live and visible to students"
                  : "Your course is in draft mode"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Course title"
                disabled={isSaving}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn?"
                rows={5}
                disabled={isSaving}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₦)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 for free"
                disabled={isSaving}
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter 0 for a free course
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="imageUrl">Course Image URL</Label>
                <Link href="/dev/uploads" target="_blank">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ImageIcon size={14} />
                    Manage Uploads
                    <ExternalLink size={14} />
                  </Button>
                </Link>
              </div>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isSaving}
                className={errors.imageUrl ? "border-red-500" : ""}
              />
              {errors.imageUrl && (
                <p className="text-sm text-red-500">{errors.imageUrl}</p>
              )}
              {imageUrl && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="Course preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chapters ({chapters.length})</CardTitle>
            <Button onClick={handleAddChapter} size="sm" className="gap-2">
              <Plus size={16} />
              Add Chapter
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {chapters.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No chapters yet. Add your first chapter to get started.
              </p>
            ) : (
              chapters.map((chapter, index) => (
                <Card key={chapter.id} className="relative">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <GripVertical
                        className="text-muted-foreground mt-2 cursor-move"
                        size={20}
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Chapter title"
                            value={chapter.title}
                            onChange={(e) =>
                              updateChapter(index, "title", e.target.value)
                            }
                            disabled={isSaving}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditChapter(chapter.id)}
                            title="Edit chapter content"
                            disabled={isSaving || !chapter.title.trim()}
                          >
                            <Edit2 size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteChapter(index)}
                            disabled={isSaving}
                            title="Delete chapter"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </Button>
                        </div>

                        {chapter.content && chapter.content.length > 20 && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                            <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium mb-1">
                                Chapter Content
                              </p>
                              <div
                                className="line-clamp-2 text-xs"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    chapter.content.length > 150
                                      ? `${chapter.content.substring(
                                          0,
                                          150
                                        )}...`
                                      : chapter.content,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {chapter.quiz && (
                          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            <FileText className="w-4 h-4" />
                            <span>
                              Quiz: {chapter.quiz.questions.length} questions
                            </span>
                          </div>
                        )}

                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Order: {index + 1}</span>
                          {chapter.content && (
                            <span>
                              Content: {chapter.content.length} characters
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{course.title}&quot;? This
              action cannot be undone. All chapters, quizzes, and student
              enrollments will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourse}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? "Deleting..." : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
