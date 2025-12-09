// src/config/platform.config.js
/**
 * PLATFORM CONFIGURATION
 * Edit these values to customize your platform
 */

export const PLATFORM_CONFIG = {
  // Basic Information
  name: process.env.NEXT_PUBLIC_PLATFORM_NAME || "CourseStudio",
  tagline:
    process.env.NEXT_PUBLIC_PLATFORM_TAGLINE ||
    "Build Courses & Learn Anything",
  description:
    process.env.NEXT_PUBLIC_PLATFORM_DESCRIPTION ||
    "Create and sell courses online",

  // Contact Information
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@example.com",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
    address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "",
  },

  // Branding
  branding: {
    logo: process.env.NEXT_PUBLIC_LOGO_URL || "/icon.png",
    favicon: process.env.NEXT_PUBLIC_FAVICON_URL || "/favicon.ico",
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#3B82F6",
    secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#8B5CF6",
  },

  // Features
  features: {
    enableUserRegistration:
      process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== "false",
    enableCourseCreation:
      process.env.NEXT_PUBLIC_ENABLE_COURSE_CREATION !== "false",
    requireCourseApproval:
      process.env.NEXT_PUBLIC_REQUIRE_COURSE_APPROVAL === "true",
    enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== "false",
    enableQuizzes: process.env.NEXT_PUBLIC_ENABLE_QUIZZES !== "false",
    enableReviews: process.env.NEXT_PUBLIC_ENABLE_REVIEWS !== "false",
  },

  // Payments
  payments: {
    currency: process.env.NEXT_PUBLIC_CURRENCY || "NGN",
    currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₦",
    provider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || "paystack", // paystack, stripe, etc.
    commissionRate: parseFloat(
      process.env.NEXT_PUBLIC_COMMISSION_RATE || "0.15"
    ), // 15% platform fee
  },

  // Course Settings
  courses: {
    maxChaptersPerCourse: parseInt(
      process.env.NEXT_PUBLIC_MAX_CHAPTERS || "50"
    ),
    maxQuizQuestionsPerChapter: parseInt(
      process.env.NEXT_PUBLIC_MAX_QUIZ_QUESTIONS || "20"
    ),
    defaultQuizPassingScore: parseInt(
      process.env.NEXT_PUBLIC_DEFAULT_PASSING_SCORE || "70"
    ),
  },

  // Upload Limits
  uploads: {
    maxImageSize: parseInt(
      process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE || "10485760"
    ), // 10MB
    maxVideoSize: parseInt(
      process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE || "104857600"
    ), // 100MB
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  },

  // Social Links
  social: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "",
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "",
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "",
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "",
  },

  // Legal
  legal: {
    companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "Your Company",
    termsUrl: process.env.NEXT_PUBLIC_TERMS_URL || "/terms",
    privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL || "/privacy",
  },

  // Admin
  admin: {
    requireAdminApproval:
      process.env.NEXT_PUBLIC_REQUIRE_ADMIN_APPROVAL === "true",
    maxAdmins: parseInt(process.env.NEXT_PUBLIC_MAX_ADMINS || "5"),
  },

  // Email (for notifications)
  email: {
    fromName: process.env.NEXT_PUBLIC_EMAIL_FROM_NAME || "CourseStudio",
    fromEmail: process.env.NEXT_PUBLIC_EMAIL_FROM || "noreply@example.com",
  },

  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
    facebookPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || "",
  },
};

// Helper functions
export const getPlatformName = () => PLATFORM_CONFIG.name;
export const getCurrencySymbol = () => PLATFORM_CONFIG.payments.currencySymbol;
export const getContactEmail = () => PLATFORM_CONFIG.contact.email;
export const getCommissionRate = () => PLATFORM_CONFIG.payments.commissionRate;
export const isFeatureEnabled = (feature) =>
  PLATFORM_CONFIG.features[feature] ?? false;
