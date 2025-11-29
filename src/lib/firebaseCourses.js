// lib/firebaseCourses.js

import { auth, db } from "./firebaseClient";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  serverTimestamp,
  runTransaction,
  writeBatch,
} from "firebase/firestore";

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

// Upload image
async function uploadImage(file, userId, courseId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);
  formData.append("courseId", courseId);
  formData.append("type", "main");

  const res = await fetch("/api/upload-course-image", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

// CREATE COURSE
export async function createCourse({ title, description, price, imageFile }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseId = `course-${makeId()}`;
  const courseRef = doc(db, "users", user.uid, "courses", courseId);

  const imageUrl = await uploadImage(imageFile, user.uid, courseId);

  const courseData = {
    id: courseId,
    title: title.trim(),
    description: description.trim(),
    price: Number(price),
    imageUrl,
    authorId: user.uid,
    chapters: [],
    published: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(courseRef, courseData);
  return courseData;
}

// 1. Get my courses — lightweight (NO chapters)
export async function getMyCourseList() {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const q = query(collection(db, "users", user.uid, "courses"));
  const snapshot = await getDocs(q);

  const list = [];
  snapshot.forEach((doc) => {
    const d = doc.data();
    list.push({
      id: d.id,
      title: d.title,
      description: d.description,
      price: d.price,
      imageUrl: d.imageUrl,
      published: d.published || false,
      chaptersCount: d.chapters?.length || 0,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  });

  return list.sort(
    (a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0)
  );
}

// 2. Get published courses — lightweight (NO chapters) — public homepage
export async function getPublishedCourseList() {
  const q = query(collection(db, "publicCourses"));
  const snapshot = await getDocs(q);

  const list = [];
  snapshot.forEach((doc) => {
    const d = doc.data();
    list.push({
      id: d.id,
      title: d.title,
      description: d.description,
      price: d.price,
      imageUrl: d.imageUrl,
      authorId: d.authorId,
      authorName: d.authorName,
      publishedAt: d.publishedAt,
    });
  });

  return list.sort(
    (a, b) =>
      (b.publishedAt?.toMillis() || 0) - (a.publishedAt?.toMillis() || 0)
  );
}

// 3. Get ONE of my courses — FULL data with chapters
export async function getMyCourseData(courseId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const ref = doc(db, "users", user.uid, "courses", courseId);
  const snap = await getDoc(ref);

  return snap.exists() ? snap.data() : null;
}

// 4. Get ONE published course — FULL data with chapters (public course page)
export async function getPublishedCourseData(courseId) {
  const ref = doc(db, "publicCourseData", courseId);
  const snap = await getDoc(ref);

  return snap.exists() ? snap.data() : null;
}

// PUBLISH
export async function publishCourse(courseId, authorName = "Creator") {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);
  const lightRef = doc(db, "publicCourses", courseId);
  const fullRef = doc(db, "publicCourseData", courseId);

  await runTransaction(db, async (transaction) => {
    const courseSnap = await transaction.get(courseRef);
    if (!courseSnap.exists()) throw new Error("Course not found");
    const course = courseSnap.data();

    if (course.chapters.length === 0) {
      throw new Error("Add at least one chapter before publishing");
    }

    const now = serverTimestamp();

    transaction.update(courseRef, {
      published: true,
      publishedAt: now,
      updatedAt: now,
    });

    transaction.set(lightRef, {
      id: courseId,
      title: course.title,
      description: course.description,
      price: course.price,
      imageUrl: course.imageUrl,
      authorId: user.uid,
      authorName,
      publishedAt: now,
    });

    transaction.set(fullRef, {
      ...course,
      publishedAt: now,
      authorName,
    });
  });
}

// UNPUBLISH
export async function unpublishCourse(courseId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);
  const batch = writeBatch(db);

  batch.update(courseRef, {
    published: false,
    publishedAt: null,
    updatedAt: serverTimestamp(),
  });
  batch.delete(doc(db, "publicCourses", courseId));
  batch.delete(doc(db, "publicCourseData", courseId));

  await batch.commit();
}

// UPDATE COURSE
export async function updateCourse({
  courseId,
  title,
  description,
  price,
  imageFile,
  chapters,
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);
  let imageUrl = undefined;
  if (imageFile) {
    imageUrl = await uploadImage(imageFile, user.uid, courseId);
  }

  const updates = { updatedAt: serverTimestamp() };
  if (title) updates.title = title.trim();
  if (description) updates.description = description.trim();
  if (price != null) updates.price = Number(price);
  if (imageUrl) updates.imageUrl = imageUrl;
  if (chapters !== undefined) updates.chapters = chapters;

  await setDoc(courseRef, updates, { merge: true });

  // Re-sync public if published
  const snap = await getDoc(courseRef);
  if (snap.data()?.published) {
    await publishCourse(courseId);
  }
}

// UPDATE CHAPTER - Updates a specific chapter within a course
export async function updateChapter(courseId, chapterId, data) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);

  // Get current course data
  const courseSnap = await getDoc(courseRef);
  if (!courseSnap.exists()) throw new Error("Course not found");

  const courseData = courseSnap.data();
  const chapters = courseData.chapters || [];

  // Find and update the chapter
  const chapterIndex = chapters.findIndex((ch) => ch.id === chapterId);
  if (chapterIndex === -1) throw new Error("Chapter not found");

  // Update the chapter
  chapters[chapterIndex] = {
    ...chapters[chapterIndex],
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Save back to Firebase
  await setDoc(
    courseRef,
    {
      chapters,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Re-sync public if published
  const snap = await getDoc(courseRef);
  if (snap.data()?.published) {
    await publishCourse(courseId);
  }

  return chapters[chapterIndex];
}

// GET SINGLE CHAPTER - Get one chapter from a course
export async function getChapter(courseId, chapterId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);
  const courseSnap = await getDoc(courseRef);

  if (!courseSnap.exists()) throw new Error("Course not found");

  const courseData = courseSnap.data();
  const chapter = courseData.chapters?.find((ch) => ch.id === chapterId);

  if (!chapter) throw new Error("Chapter not found");

  return chapter;
}

// DELETE CHAPTER - Remove a chapter from a course
export async function deleteChapter(courseId, chapterId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);

  // Get current course data
  const courseSnap = await getDoc(courseRef);
  if (!courseSnap.exists()) throw new Error("Course not found");

  const courseData = courseSnap.data();
  let chapters = courseData.chapters || [];

  // Remove the chapter
  chapters = chapters.filter((ch) => ch.id !== chapterId);

  // Reorder remaining chapters
  chapters = chapters.map((ch, index) => ({
    ...ch,
    order: index,
  }));

  // Save back to Firebase
  await setDoc(
    courseRef,
    {
      chapters,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Re-sync public if published
  const snap = await getDoc(courseRef);
  if (snap.data()?.published) {
    await publishCourse(courseId);
  }
}

// REORDER CHAPTERS - Change the order of chapters
export async function reorderChapters(courseId, reorderedChapters) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);

  // Update chapter order
  const chaptersWithOrder = reorderedChapters.map((ch, index) => ({
    ...ch,
    order: index,
  }));

  await setDoc(
    courseRef,
    {
      chapters: chaptersWithOrder,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Re-sync public if published
  const snap = await getDoc(courseRef);
  if (snap.data()?.published) {
    await publishCourse(courseId);
  }
}
