// src/lib/firebaseQuizzes.js
import { auth, db } from "./firebaseClient";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Quiz types
export const QUIZ_TYPES = {
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
  FILL_BLANK: "fill_blank",
};

// Create or update quiz for a chapter
export async function saveChapterQuiz(courseId, chapterId, quiz) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);
  const courseSnap = await getDoc(courseRef);

  if (!courseSnap.exists()) throw new Error("Course not found");

  const course = courseSnap.data();
  const chapters = course.chapters || [];

  const chapterIndex = chapters.findIndex((ch) => ch.id === chapterId);
  if (chapterIndex === -1) throw new Error("Chapter not found");

  // Add quiz to chapter
  chapters[chapterIndex].quiz = {
    ...quiz,
    updatedAt: serverTimestamp(),
  };

  await setDoc(
    courseRef,
    {
      chapters,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return chapters[chapterIndex];
}

// Get quiz for a chapter
export async function getChapterQuiz(courseId, chapterId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);
  const courseSnap = await getDoc(courseRef);

  if (!courseSnap.exists()) return null;

  const course = courseSnap.data();
  const chapter = course.chapters?.find((ch) => ch.id === chapterId);

  return chapter?.quiz || null;
}

// Delete quiz from chapter
export async function deleteChapterQuiz(courseId, chapterId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const courseRef = doc(db, "users", user.uid, "courses", courseId);
  const courseSnap = await getDoc(courseRef);

  if (!courseSnap.exists()) throw new Error("Course not found");

  const course = courseSnap.data();
  const chapters = course.chapters || [];

  const chapterIndex = chapters.findIndex((ch) => ch.id === chapterId);
  if (chapterIndex === -1) throw new Error("Chapter not found");

  // Remove quiz from chapter
  delete chapters[chapterIndex].quiz;

  await setDoc(
    courseRef,
    {
      chapters,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Save quiz attempt (for student progress)
export async function saveQuizAttempt(courseId, chapterId, attempt) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const attemptRef = doc(
    db,
    "users",
    user.uid,
    "quizAttempts",
    `${courseId}_${chapterId}_${Date.now()}`
  );

  await setDoc(attemptRef, {
    courseId,
    chapterId,
    userId: user.uid,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    answers: attempt.answers,
    timestamp: serverTimestamp(),
  });

  // Update purchase record with quiz progress
  const purchaseRef = doc(db, "users", user.uid, "purchases", courseId);
  const purchaseSnap = await getDoc(purchaseRef);

  if (purchaseSnap.exists()) {
    const quizScores = purchaseSnap.data().quizScores || {};
    quizScores[chapterId] = {
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
      completedAt: serverTimestamp(),
    };

    await setDoc(
      purchaseRef,
      {
        quizScores,
        lastAccessedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return attempt;
}

// Get quiz attempts for a chapter
export async function getQuizAttempts(courseId, chapterId) {
  const user = auth.currentUser;
  if (!user) return null;

  const purchaseRef = doc(db, "users", user.uid, "purchases", courseId);
  const purchaseSnap = await getDoc(purchaseRef);

  if (!purchaseSnap.exists()) return null;

  const quizScores = purchaseSnap.data().quizScores || {};
  return quizScores[chapterId] || null;
}

// Validate quiz answers
export function validateQuizAnswers(quiz, userAnswers) {
  let score = 0;
  const results = [];

  quiz.questions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    let isCorrect = false;

    switch (question.type) {
      case QUIZ_TYPES.MULTIPLE_CHOICE:
        isCorrect = userAnswer === question.correctAnswer;
        break;

      case QUIZ_TYPES.TRUE_FALSE:
        isCorrect = userAnswer === question.correctAnswer;
        break;

      case QUIZ_TYPES.FILL_BLANK:
        // Case-insensitive comparison, trim whitespace
        const userAnswerNormalized = String(userAnswer || "")
          .toLowerCase()
          .trim();
        const correctAnswerNormalized = String(question.correctAnswer)
          .toLowerCase()
          .trim();
        isCorrect = userAnswerNormalized === correctAnswerNormalized;
        break;
    }

    if (isCorrect) score++;

    results.push({
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation || null,
    });
  });

  return {
    score,
    totalQuestions: quiz.questions.length,
    percentage: Math.round((score / quiz.questions.length) * 100),
    results,
  };
}
