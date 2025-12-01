// src/stores/courseEditor.js
"use client";

import { create } from "zustand";

export const useCourseEditor = create((set, get) => ({
  // Course data
  course: null,
  title: "",
  description: "",
  price: "",
  imageUrl: "", // Changed from imageFile to imageUrl
  chapters: [],

  // UI states
  isSaving: false,
  isPublishing: false,
  hasUnsavedChanges: false,

  // Initialize course editor
  initializeCourse: (courseData) => {
    set({
      course: courseData,
      title: courseData.title || "",
      description: courseData.description || "",
      price: courseData.price?.toString() || "",
      imageUrl: courseData.imageUrl || "",
      chapters: courseData.chapters || [],
      hasUnsavedChanges: false,
    });
  },

  // Update course fields
  setTitle: (title) => set({ title, hasUnsavedChanges: true }),
  setDescription: (description) =>
    set({ description, hasUnsavedChanges: true }),
  setPrice: (price) => set({ price, hasUnsavedChanges: true }),
  setImageUrl: (imageUrl) => set({ imageUrl, hasUnsavedChanges: true }),

  // Chapter management
  addChapter: () => {
    const { chapters } = get();
    const newChapter = {
      id: `chapter-${Date.now()}`,
      title: "",
      content: "<p>Start writing your chapter content...</p>",
      videoUrl: "",
      order: chapters.length,
    };
    set({
      chapters: [...chapters, newChapter],
      hasUnsavedChanges: true,
    });
  },

  updateChapter: (index, field, value) => {
    const { chapters } = get();
    const updated = [...chapters];
    updated[index] = { ...updated[index], [field]: value };
    set({
      chapters: updated,
      hasUnsavedChanges: true,
    });
  },

  deleteChapter: (index) => {
    const { chapters } = get();
    const updated = chapters.filter((_, i) => i !== index);
    set({
      chapters: updated,
      hasUnsavedChanges: true,
    });
  },

  reorderChapters: (reorderedChapters) => {
    set({
      chapters: reorderedChapters,
      hasUnsavedChanges: true,
    });
  },

  // Update a specific chapter (used by chapter editor)
  updateChapterById: (chapterId, updates) => {
    const { chapters } = get();
    const updated = chapters.map((ch) =>
      ch.id === chapterId ? { ...ch, ...updates } : ch
    );
    set({
      chapters: updated,
      hasUnsavedChanges: true,
    });
  },

  // Get chapter by ID
  getChapterById: (chapterId) => {
    const { chapters } = get();
    return chapters.find((ch) => ch.id === chapterId);
  },

  // Save states
  setIsSaving: (isSaving) => set({ isSaving }),
  setIsPublishing: (isPublishing) => set({ isPublishing }),
  markAsSaved: () => set({ hasUnsavedChanges: false }),

  // Get all course data for saving
  getCourseData: () => {
    const state = get();
    return {
      title: state.title,
      description: state.description,
      price: state.price,
      imageUrl: state.imageUrl,
      chapters: state.chapters,
    };
  },

  // Reset store
  resetCourse: () => {
    set({
      course: null,
      title: "",
      description: "",
      price: "",
      imageUrl: "",
      chapters: [],
      isSaving: false,
      isPublishing: false,
      hasUnsavedChanges: false,
    });
  },
}));