// src/lib/env.js
/**
 * Environment variable validation
 * Run this at build time to catch missing variables early
 */

const requiredEnvVars = {
  // Firebase (public)
  NEXT_PUBLIC_FIREBASE_API_KEY: "Firebase API Key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "Firebase Auth Domain",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "Firebase Project ID",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "Firebase Storage Bucket",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "Firebase Messaging Sender ID",
  NEXT_PUBLIC_FIREBASE_APP_ID: "Firebase App ID",

  // Cloudinary (public)
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "Cloudinary Cloud Name",

  // Cloudinary (private - server only)
  CLOUDINARY_API_KEY: "Cloudinary API Key",
  CLOUDINARY_API_SECRET: "Cloudinary API Secret",
};

export function validateEnv() {
  const missing = [];

  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      missing.push(`${key} (${description})`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join("\n")}\n\n` +
        "Please check your .env.local file."
    );
  }
}

// Validate on import (build time)
if (typeof window === "undefined") {
  validateEnv();
}

export const env = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
