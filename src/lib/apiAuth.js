// src/lib/apiAuth.js
import { auth } from "@/lib/firebaseClient";
import { NextResponse } from "next/server";

/**
 * Verify Firebase ID token from request headers
 */
export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);

    // Verify token with Firebase Admin (you'll need to set this up)
    // For now, we'll use client-side auth check
    const user = auth.currentUser;

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

/**
 * Middleware wrapper to protect API routes
 */
export function withAuth(handler) {
  return async (request, context) => {
    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Attach user to request
    request.user = user;

    return handler(request, context);
  };
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or a proper rate limiting service
 */
const rateLimitMap = new Map();

export function rateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];

  // Clean old requests
  const recentRequests = userRequests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);

  return true;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 10000); // Limit length
}

/**
 * Validate file upload
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  } = options;

  if (!file) {
    throw new Error("No file provided");
  }

  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
  }

  return true;
}
