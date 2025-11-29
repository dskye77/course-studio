// src/screen/dev/courses/single/DevSingleCourseScreen.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyCourseData,
  updateCourse,
  publishCourse,
  unpublishCourse,
} from "@/lib/firebaseCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ImageUploader from "@/components/custom/ImageUploader";
import Image from "next/image";
import {
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";

export default function DevSingleCourseScreen({ params }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courseId, setCourseId] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [errors, setErrors] = useState({});

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

        setCourse(data);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setPrice(data.price?.toString() || "");
        setChapters(data.chapters || []);
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
  }, [user, authLoading, courseId, router]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!price || Number(price) <= 0)
      newErrors.price = "Price must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await updateCourse({
        courseId,
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        imageFile: imageFile || undefined,
        chapters,
      });

      toast.success("Course updated successfully!");
      setImageFile(null);

      const updatedData = await getMyCourseData(courseId);
      setCourse(updatedData);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save course");
    } finally {
      setSaving(false);
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

    setPublishing(true);
    try {
      await publishCourse(courseId, user.displayName || user.email);
      toast.success("Course published successfully!");

      const updatedData = await getMyCourseData(courseId);
      setCourse(updatedData);
    } catch (err) {
      console.error("Publish error:", err);
      toast.error(err.message || "Failed to publish course");
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setPublishing(true);
    try {
      await unpublishCourse(courseId);
      toast.success("Course unpublished");

      const updatedData = await getMyCourseData(courseId);
      setCourse(updatedData);
    } catch (err) {
      console.error("Unpublish error:", err);
      toast.error(err.message || "Failed to unpublish course");
    } finally {
      setPublishing(false);
    }
  };

  const addChapter = () => {
    const newChapter = {
      id: `chapter-${Date.now()}`,
      title: "",
      content: "",
      videoUrl: "",
      order: chapters.length,
    };
    setChapters([...chapters, newChapter]);
  };

  const updateChapter = (index, field, value) => {
    const updated = [...chapters];
    updated[index] = { ...updated[index], [field]: value };
    setChapters(updated);
  };

  const deleteChapter = (index) => {
    const updated = chapters.filter((_, i) => i !== index);
    setChapters(updated);
    toast.success("Chapter removed");
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
          <Button
            variant="ghost"
            onClick={() => router.push("/dev/courses")}
            className="gap-2"
          >
            <ArrowLeft size={18} />
            Back to Courses
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={course.published ? handleUnpublish : handlePublish}
              disabled={publishing}
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
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
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
                disabled={saving}
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
                disabled={saving}
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
                placeholder="15000"
                disabled={saving}
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Image</CardTitle>
          </CardHeader>
          <CardContent>
            {course.imageUrl && !imageFile && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Current image:
                </p>
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            <ImageUploader
              onImageSelect={setImageFile}
              onImageRemove={() => setImageFile(null)}
              disabled={saving}
            />
            {imageFile && (
              <p className="text-sm text-muted-foreground mt-2">
                New image selected. Click &quot;Save Changes&quot; to upload.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chapters ({chapters.length})</CardTitle>
            <Button onClick={addChapter} size="sm" className="gap-2">
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
                            disabled={saving}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteChapter(index)}
                            disabled={saving}
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Chapter content"
                          value={chapter.content}
                          onChange={(e) =>
                            updateChapter(index, "content", e.target.value)
                          }
                          rows={3}
                          disabled={saving}
                        />
                        <Input
                          placeholder="Video URL (optional)"
                          value={chapter.videoUrl || ""}
                          onChange={(e) =>
                            updateChapter(index, "videoUrl", e.target.value)
                          }
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
