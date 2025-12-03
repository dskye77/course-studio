// src/lib/firebasePurchases.js
// Updated with proper backend verification support

import { auth, db } from "./firebaseClient";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
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

    return purchases.sort(
      (a, b) => (b.purchaseDate || 0) - (a.purchaseDate || 0)
    );
  } catch (error) {
    console.error("Error fetching purchases:", error);
    throw error;
  }
}

/**
 * Complete course purchase after payment verification
 */
export async function completePurchase(courseId, courseData, paymentData) {
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
        paymentReference: paymentData.reference,
        paymentMethod: paymentData.method || "paystack",
        paymentAmount: paymentData.amount,
        paymentVerified: true,
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
        userEmail: user.email,
        enrolledAt: serverTimestamp(),
        progress: 0,
        paymentReference: paymentData.reference,
        amountPaid: paymentData.amount,
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

      // 5. (Optional) Track revenue for course owner
      const revenueRef = doc(
        db,
        "users",
        courseData.authorId,
        "revenue",
        `${Date.now()}_${user.uid}`
      );
      transaction.set(revenueRef, {
        courseId,
        courseTitle: courseData.title,
        studentId: user.uid,
        studentEmail: user.email,
        amount: courseData.price,
        paymentReference: paymentData.reference,
        date: serverTimestamp(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Purchase completion error:", error);
    throw error;
  }
}

/**
 * Initialize Paystack payment
 */
export function initializePaystackPayment(courseData, userEmail) {
  if (!courseData || courseData.price <= 0) {
    throw new Error("Invalid course data or price");
  }

  const amountInKobo = Math.round(courseData.price * 100);

  return {
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email: userEmail,
    amount: amountInKobo,
    currency: "NGN",
    ref: `course_${courseData.id}_${Date.now()}`,
    metadata: {
      courseId: courseData.id,
      courseTitle: courseData.title,
      userId: auth.currentUser?.uid,
      custom_fields: [
        {
          display_name: "Course",
          variable_name: "course_title",
          value: courseData.title,
        },
      ],
    },
  };
}

/**
 * Verify payment on backend
 */
export async function verifyPaystackPayment(reference) {
  try {
    // Call backend verification API
    const response = await fetch("/api/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference,
        userId: auth.currentUser?.uid,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Payment verification failed");
    }

    return data.verified ? data.data : null;
  } catch (error) {
    console.error("Payment verification error:", error);
    throw error;
  }
}

/**
 * Purchase flow for free courses (no payment)
 */
export async function enrollFreeCourse(courseId, courseData) {
  return completePurchase(courseId, courseData, {
    reference: `free_${courseId}_${Date.now()}`,
    method: "free",
    amount: 0,
  });
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

    // Get total chapters
    const courseDataRef = doc(db, "publicCourseData", courseId);
    const courseSnap = await getDoc(courseDataRef);
    const totalChapters = courseSnap.data()?.chapters?.length || 1;
    const progress = Math.round(
      (completedChapters.length / totalChapters) * 100
    );

    // Update purchase
    await setDoc(
      purchaseRef,
      {
        completedChapters,
        progress,
        lastAccessedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Update enrollment
    const enrollmentRef = doc(
      db,
      "publicCourseData",
      courseId,
      "enrollments",
      user.uid
    );
    await setDoc(
      enrollmentRef,
      {
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
 * Get course progress
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
 * Rate a course
 */
export async function rateCourse(courseId, rating, review = "") {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const purchased = await hasPurchased(courseId);
  if (!purchased) {
    throw new Error("You must purchase this course to rate it");
  }

  try {
    await runTransaction(db, async (transaction) => {
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

      const avgRating = Math.round((totalRating / count) * 10) / 10;

      // Update ratings
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
