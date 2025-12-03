// lib/firebaseCourses.js
import { auth, db } from "./firebaseClient";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  serverTimestamp,
  runTransaction,
  writeBatch,
} from "firebase/firestore";
// ID generator
const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

// ============================
// CREATE COURSE (URL-based)
// ============================
export async function createCourse({
  title,
  description,
  price,
  imageUrl,
  requirements = [],
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  if (!imageUrl) throw new Error("Image URL is required");

  const courseId = `course-${makeId()}`;
  const courseRef = doc(db, "users", user.uid, "courses", courseId);

  const courseData = {
    id: courseId,
    title: title.trim(),
    description: description.trim(),
    price: Number(price),
    imageUrl: imageUrl.trim(),
    authorId: user.uid,

    rating: 0,
    students: 0,
    requirements,

    chapters: [],
    published: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(courseRef, courseData);
  return courseData;
}

// ============================
// DELETE COURSE
// ============================
export async function deleteCourse(courseId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  try {
    const batch = writeBatch(db);

    // Delete from user's courses
    const courseRef = doc(db, "users", user.uid, "courses", courseId);
    batch.delete(courseRef);

    // Check if published and delete from public collections
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists() && courseSnap.data().published) {
      const lightRef = doc(db, "publicCourses", courseId);
      const fullRef = doc(db, "publicCourseData", courseId);

      batch.delete(lightRef);
      batch.delete(fullRef);
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
}

// ============================
// UPDATE CHAPTER (Modified to remove videoUrl from chapter object)
// ============================
export async function updateChapter(courseId, chapterId, data) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);

  const snap = await getDoc(courseRef);
  if (!snap.exists()) throw new Error("Course not found");

  const course = snap.data();
  const chapters = course.chapters || [];

  const index = chapters.findIndex((c) => c.id === chapterId);
  if (index === -1) throw new Error("Chapter not found");

  // Remove videoUrl from the chapter object if it exists in data
  const { videoUrl, ...chapterData } = data;

  chapters[index] = {
    ...chapters[index],
    ...chapterData,
    updatedAt: serverTimestamp(),
  };

  await setDoc(
    courseRef,
    { chapters, updatedAt: serverTimestamp() },
    { merge: true }
  );

  if (snap.data()?.published) {
    await publishCourse(courseId);
  }

  return chapters[index];
}

// ============================
// GET MY COURSES (light data)
// ============================
export async function getMyCourseList() {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const q = query(collection(db, "users", user.uid, "courses"));
  const snapshot = await getDocs(q);

  const list = [];

  snapshot.forEach((docSnap) => {
    const d = docSnap.data();
    list.push({
      id: d.id,
      title: d.title,
      description: d.description,
      price: d.price,
      imageUrl: d.imageUrl,
      published: d.published || false,
      chaptersCount: d.chapters?.length || 0,

      rating: d.rating || 0,
      students: d.students || 0,

      createdAt: d.createdAt ? d.createdAt.toMillis() : null,
      updatedAt: d.updatedAt ? d.updatedAt.toMillis() : null,
    });
  });

  return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

// ============================
// GET PUBLISHED COURSES (homepage)
// ============================
export async function getPublishedCourseList() {
  const q = query(collection(db, "publicCourses"));
  const snapshot = await getDocs(q);

  const list = [];

  snapshot.forEach((docSnap) => {
    const d = docSnap.data();
    list.push({
      id: d.id,
      title: d.title,
      description: d.description,
      price: d.price,
      imageUrl: d.imageUrl,
      authorId: d.authorId,
      authorName: d.authorName,

      publishedAt: d.publishedAt ? d.publishedAt.toMillis() : null,

      rating: d.rating || 0,
      students: d.students || 0,
    });
  });

  return list.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
}

// ============================
// GET ONE OF MY COURSES - FULL
// ============================
export async function getMyCourseData(courseId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const ref = doc(db, "users", user.uid, "courses", courseId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// ============================
// GET ONE PUBLISHED COURSE - FULL
// ============================
export async function getPublishedCourseData(courseId) {
  const ref = doc(db, "publicCourseData", courseId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const d = snap.data();

  return {
    ...d,
    publishedAt: d.publishedAt ? d.publishedAt.toMillis() : null,
    createdAt: d.createdAt ? d.createdAt.toMillis() : null,
    updatedAt: d.updatedAt ? d.updatedAt.toMillis() : null,
  };
}

// ============================
// PUBLISH COURSE
// ============================
export async function publishCourse(courseId, authorName = "Creator") {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);
  const lightRef = doc(db, "publicCourses", courseId);
  const fullRef = doc(db, "publicCourseData", courseId);

  await runTransaction(db, async (tx) => {
    const courseSnap = await tx.get(courseRef);
    if (!courseSnap.exists()) throw new Error("Course not found");

    const course = courseSnap.data();
    if (course.chapters.length === 0) {
      throw new Error("Add at least one chapter before publishing");
    }

    const now = serverTimestamp();

    tx.update(courseRef, {
      published: true,
      publishedAt: now,
      updatedAt: now,
    });

    tx.set(lightRef, {
      id: courseId,
      title: course.title,
      description: course.description,
      price: course.price,
      imageUrl: course.imageUrl,
      authorId: user.uid,
      authorName,
      publishedAt: now,

      rating: course.rating || 0,
      students: course.students || 0,
    });

    tx.set(fullRef, {
      ...course,
      authorName,
      publishedAt: now,
    });
  });
}

// ============================
// UNPUBLISH
// ============================
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

// ============================
// UPDATE COURSE (URL-based)
// ============================
export async function updateCourse({
  courseId,
  title,
  description,
  price,
  imageUrl,
  chapters,
  rating,
  students,
  requirements,
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);

  const updates = {
    updatedAt: serverTimestamp(),
  };

  if (title) updates.title = title.trim();
  if (description) updates.description = description.trim();
  if (price != null) updates.price = Number(price);
  if (chapters !== undefined) updates.chapters = chapters;
  if (imageUrl) updates.imageUrl = imageUrl.trim();

  // new fields
  if (rating != null) updates.rating = rating;
  if (students != null) updates.students = students;
  if (requirements) updates.requirements = requirements;

  await setDoc(courseRef, updates, { merge: true });

  // sync with public if published
  const snap = await getDoc(courseRef);
  if (snap.data()?.published) {
    await publishCourse(courseId);
  }
}

export async function getChapter(courseId, chapterId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const ref = doc(db, "users", user.uid, "courses", courseId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Course not found");

  const chapters = snap.data().chapters || [];
  return chapters.find((c) => c.id === chapterId) || null;
}

export async function deleteChapter(courseId, chapterId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const ref = doc(db, "users", user.uid, "courses", courseId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Course not found");

  let chapters = snap.data().chapters || [];
  chapters = chapters.filter((c) => c.id !== chapterId);

  // reassign order
  chapters = chapters.map((c, i) => ({ ...c, order: i }));

  await setDoc(
    ref,
    { chapters, updatedAt: serverTimestamp() },
    { merge: true }
  );

  if (snap.data()?.published) {
    await publishCourse(courseId);
  }
}

export async function reorderChapters(courseId, reorderedChapters) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const ref = doc(db, "users", user.uid, "courses", courseId);

  const newOrder = reorderedChapters.map((c, i) => ({
    ...c,
    order: i,
  }));

  await setDoc(
    ref,
    { chapters: newOrder, updatedAt: serverTimestamp() },
    { merge: true }
  );

  const snap = await getDoc(ref);
  if (snap.data()?.published) {
    await publishCourse(courseId);
  }
}
