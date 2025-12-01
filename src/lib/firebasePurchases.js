// src/lib/firebasePurchases.js
import { auth, db } from "./firebaseClient";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  runTransaction,
  increment,
} from "firebase/firestore";

/**
 * Check if user has purchased a course
 */
export async function hasPurchased(courseId) {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const purchaseRef = doc(db, "users", user.uid, "purchases", courseId);
    const purchaseSnap = await getDoc(purchaseRef);
    return purchaseSnap.exists();
  } catch (error) {
    console.error("Error checking purchase:", error);
    return false;
  }
}

/**
 * Get user's purchased courses
 */
export async function getPurchasedCourses() {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  try {
    const purchasesRef = collection(db, "users", user.uid, "purchases");
    const snapshot = await getDocs(purchasesRef);

    const purchases = [];
    snapshot.forEach((doc) => {
      purchases.push({
        id: doc.id,
        ...doc.data(),
        purchaseDate: doc.data().purchaseDate?.toMillis() || null,
      });
    });

    return purchases;
  } catch (error) {
    console.error("Error fetching purchases:", error);
    throw error;
  }
}

/**
 * Purchase a course (simulate payment)
 * In production, integrate with Stripe/Paystack
 */
export async function purchaseCourse(courseId, courseData) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  // Check if already purchased
  const alreadyPurchased = await hasPurchased(courseId);
  if (alreadyPurchased) {
    throw new Error("You already own this course");
  }

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Add to user's purchases
      const purchaseRef = doc(db, "users", user.uid, "purchases", courseId);
      transaction.set(purchaseRef, {
        courseId,
        title: courseData.title,
        price: courseData.price,
        imageUrl: courseData.imageUrl,
        authorId: courseData.authorId,
        authorName: courseData.authorName,
        purchaseDate: serverTimestamp(),
        progress: 0,
        completedChapters: [],
      });

      // 2. Add to course enrollments
      const enrollmentRef = doc(
        db,
        "publicCourseData",
        courseId,
        "enrollments",
        user.uid
      );
      transaction.set(enrollmentRef, {
        userId: user.uid,
        userName: user.displayName || user.email,
        enrolledAt: serverTimestamp(),
        progress: 0,
      });

      // 3. Increment student count on public course
      const publicCourseRef = doc(db, "publicCourses", courseId);
      transaction.update(publicCourseRef, {
        students: increment(1),
      });

      // 4. Increment student count on course data
      const courseDataRef = doc(db, "publicCourseData", courseId);
      transaction.update(courseDataRef, {
        students: increment(1),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Purchase error:", error);
    throw error;
  }
}

/**
 * Update course progress
 */
export async function updateProgress(courseId, chapterId, completed = true) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  try {
    const purchaseRef = doc(db, "users", user.uid, "purchases", courseId);
    const purchaseSnap = await getDoc(purchaseRef);

    if (!purchaseSnap.exists()) {
      throw new Error("You don't own this course");
    }

    const data = purchaseSnap.data();
    let completedChapters = data.completedChapters || [];

    if (completed && !completedChapters.includes(chapterId)) {
      completedChapters.push(chapterId);
    } else if (!completed) {
      completedChapters = completedChapters.filter((id) => id !== chapterId);
    }

    // Calculate progress percentage (assuming we know total chapters)
    const courseDataRef = doc(db, "publicCourseData", courseId);
    const courseSnap = await getDoc(courseDataRef);
    const totalChapters = courseSnap.data()?.chapters?.length || 1;
    const progress = Math.round(
      (completedChapters.length / totalChapters) * 100
    );

    await setDoc(
      purchaseRef,
      {
        completedChapters,
        progress,
        lastAccessedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { progress, completedChapters };
  } catch (error) {
    console.error("Progress update error:", error);
    throw error;
  }
}

/**
 * Get course progress for user
 */
export async function getCourseProgress(courseId) {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const purchaseRef = doc(db, "users", user.uid, "purchases", courseId);
    const snap = await getDoc(purchaseRef);

    if (!snap.exists()) return null;

    return {
      progress: snap.data().progress || 0,
      completedChapters: snap.data().completedChapters || [],
    };
  } catch (error) {
    console.error("Error fetching progress:", error);
    return null;
  }
}

/**
 * Leave a course rating and review
 */
export async function rateCourse(courseId, rating, review = "") {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Check if user owns the course
  const purchased = await hasPurchased(courseId);
  if (!purchased) {
    throw new Error("You must purchase this course to rate it");
  }

  try {
    await runTransaction(db, async (transaction) => {
      // Add review
      const reviewRef = doc(
        db,
        "publicCourseData",
        courseId,
        "reviews",
        user.uid
      );
      transaction.set(reviewRef, {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        rating,
        review: review.trim(),
        createdAt: serverTimestamp(),
      });

      // Recalculate average rating
      const reviewsRef = collection(
        db,
        "publicCourseData",
        courseId,
        "reviews"
      );
      const reviewsSnap = await getDocs(reviewsRef);

      let totalRating = rating;
      let count = 1;

      reviewsSnap.forEach((doc) => {
        if (doc.id !== user.uid) {
          totalRating += doc.data().rating;
          count++;
        }
      });

      const avgRating = totalRating / count;

      // Update course rating
      const publicCourseRef = doc(db, "publicCourses", courseId);
      transaction.update(publicCourseRef, { rating: avgRating });

      const courseDataRef = doc(db, "publicCourseData", courseId);
      transaction.update(courseDataRef, { rating: avgRating });
    });

    return { success: true };
  } catch (error) {
    console.error("Rating error:", error);
    throw error;
  }
}
