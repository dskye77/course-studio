// src/lib/firebaseAdmin.js
import { auth, db } from "./firebaseClient";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
};

// ==========================================
// ROLE MANAGEMENT
// ==========================================

/**
 * Check if user is admin
 */
export async function isAdmin(userId = null) {
  const uid = userId || auth.currentUser?.uid;
  if (!uid) return false;

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return false;
    
    const role = userSnap.data().role;
    return role === USER_ROLES.ADMIN;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get user role
 */
export async function getUserRole(userId = null) {
  const uid = userId || auth.currentUser?.uid;
  if (!uid) return USER_ROLES.STUDENT;

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create user document with default role
      await setDoc(userRef, {
        role: USER_ROLES.STUDENT,
        createdAt: serverTimestamp(),
        email: auth.currentUser?.email,
        displayName: auth.currentUser?.displayName,
      });
      return USER_ROLES.STUDENT;
    }
    
    return userSnap.data().role || USER_ROLES.STUDENT;
  } catch (error) {
    console.error("Error getting user role:", error);
    return USER_ROLES.STUDENT;
  }
}

/**
 * Set user role (Admin only)
 */
export async function setUserRole(userId, newRole) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Login required");

  // Check if current user is admin
  const isCurrentUserAdmin = await isAdmin();
  if (!isCurrentUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  // Validate role
  if (!Object.values(USER_ROLES).includes(newRole)) {
    throw new Error("Invalid role");
  }

  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        role: newRole,
        roleUpdatedAt: serverTimestamp(),
        roleUpdatedBy: currentUser.uid,
      },
      { merge: true }
    );

    // Log action
    await logAdminAction({
      action: "role_change",
      targetUserId: userId,
      newRole,
      performedBy: currentUser.uid,
    });

    return true;
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
}

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(filters = {}) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Login required");

  const isCurrentUserAdmin = await isAdmin();
  if (!isCurrentUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  try {
    const usersRef = collection(db, "users");
    let q = query(usersRef);

    // Apply filters
    if (filters.role) {
      q = query(usersRef, where("role", "==", filters.role));
    }
    if (filters.banned !== undefined) {
      q = query(usersRef, where("banned", "==", filters.banned));
    }

    const snapshot = await getDocs(q);
    const users = [];

    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || null,
      });
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * Ban/Unban user (Admin only)
 */
export async function toggleUserBan(userId, banned, reason = "") {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Login required");

  const isCurrentUserAdmin = await isAdmin();
  if (!isCurrentUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        banned,
        banReason: banned ? reason : null,
        bannedAt: banned ? serverTimestamp() : null,
        bannedBy: banned ? currentUser.uid : null,
      },
      { merge: true }
    );

    // Log action
    await logAdminAction({
      action: banned ? "user_banned" : "user_unbanned",
      targetUserId: userId,
      reason,
      performedBy: currentUser.uid,
    });

    return true;
  } catch (error) {
    console.error("Error toggling user ban:", error);
    throw error;
  }
}

/**
 * Delete user account (Admin only - careful!)
 */
export async function deleteUserAccount(userId) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Login required");

  const isCurrentUserAdmin = await isAdmin();
  if (!isCurrentUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  try {
    // Delete user document
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);

    // Log action
    await logAdminAction({
      action: "user_deleted",
      targetUserId: userId,
      performedBy: currentUser.uid,
    });

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// ==========================================
// COURSE MODERATION
// ==========================================

/**
 * Get all courses for moderation (Admin only)
 */
export async function getAllCoursesForModeration() {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Login required");

  const isCurrentUserAdmin = await isAdmin();
  if (!isCurrentUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  try {
    const coursesRef = collection(db, "publicCourseData");
    const snapshot = await getDocs(coursesRef);
    
    const courses = [];
    snapshot.forEach((doc) => {
      courses.push({
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data().publishedAt?.toMillis() || null,
      });
    });

    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
}

/**
 * Delete course (Admin only)
 */
export async function adminDeleteCourse(courseId, reason = "") {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Login required");

  const isCurrentUserAdmin = await isAdmin();
  if (!isCurrentUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  try {
    // Delete from public collections
    await deleteDoc(doc(db, "publicCourses", courseId));
    await deleteDoc(doc(db, "publicCourseData", courseId));

    // Log action
    await logAdminAction({
      action: "course_deleted",
      targetCourseId: courseId,
      reason,
      performedBy: currentUser.uid,
    });

    return true;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
}

/**
 * Toggle course visibility (Admin only)
 */
export async function toggleCourseVisibility(courseId, visible) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Login required");

  const isCurrentUserAdmin = await isAdmin();
  if (!isCurrentUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  try {
    const courseRef = doc(db, "publicCourses", courseId);
    await updateDoc(courseRef, {
      visible,
      visibilityUpdatedAt: serverTimestamp(),
      visibilityUpdatedBy: currentUser.uid,
    });

    await logAdminAction({
      action: visible ? "course_shown" : "course_hidden",
      targetCourseId: courseId,
      performedBy: currentUser.uid,
    });

    return true;
  } catch (error) {
    console.error("Error toggling course visibility:", error);
    throw error;
  }
}

// ==========================================
// ANALYTICS & STATS
// ==========================================

/**
 * Get platform statistics (Admin only)
 */
export async function getPlatformStats() {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Login required");

  const isCurrentUserAdmin = await isAdmin();
  if (!isCurrentUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  try {
    // Get user counts
    const usersSnapshot = await getDocs(collection(db, "users"));
    const totalUsers = usersSnapshot.size;
    
    let totalInstructors = 0;
    let totalStudents = 0;
    let bannedUsers = 0;

    usersSnapshot.forEach((doc) => {
      const role = doc.data().role;
      const banned = doc.data().banned;
      
      if (banned) bannedUsers++;
      if (role === USER_ROLES.INSTRUCTOR) totalInstructors++;
      if (role === USER_ROLES.STUDENT) totalStudents++;
    });

    // Get course counts
    const coursesSnapshot = await getDocs(collection(db, "publicCourses"));
    const totalCourses = coursesSnapshot.size;

    // Get revenue (this would need proper transaction tracking)
    // For now, return placeholder
    const totalRevenue = 0;

    return {
      users: {
        total: totalUsers,
        instructors: totalInstructors,
        students: totalStudents,
        banned: bannedUsers,
      },
      courses: {
        total: totalCourses,
        published: totalCourses,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    throw error;
  }
}

// ==========================================
// ADMIN ACTIONS LOG
// ==========================================

/**
 * Log admin actions for audit trail
 */
export async function logAdminAction(actionData) {
  try {
    const logRef = doc(collection(db, "adminLogs"));
    await setDoc(logRef, {
      ...actionData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging admin action:", error);
  }
}

/**
 * Get admin action logs
 */
export async function getAdminLogs(limit = 50) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Login required");

  const isCurrentUserAdmin = await isAdmin();
  if (!isCurrentUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  try {
    const logsRef = collection(db, "adminLogs");
    const snapshot = await getDocs(logsRef);
    
    const logs = [];
    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || null,
      });
    });

    // Sort by timestamp descending
    logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    return logs.slice(0, limit);
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    throw error;
  }
}