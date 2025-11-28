// lib/firebaseAuth.js
"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "./firebaseClient";

/**
 * Sign up new user and send verification email
 */
export const signUp = async (email, password, displayName) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  // Set displayName
  await updateProfile(user, { displayName });

  // Send verification email
  await sendEmailVerification(user);

  return user;
};

/**
 * Sign in existing user
 * If email is not verified, sends a new verification email automatically
 */
export const signIn = async (email, password) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  if (!user.emailVerified) {
    // Send a new verification email
    await sendEmailVerification(user);

    // Sign out so they cannot proceed until verified
    await firebaseSignOut(auth);

    throw new Error(
      "Your email is not verified. A new verification email has been sent. Please check your inbox."
    );
  }

  return user;
};

/**
 * Sign out
 */
export const signOut = async () => {
  return firebaseSignOut(auth);
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Auth state listener
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, (user) => callback(user));
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  return sendPasswordResetEmail(auth, email);
};
