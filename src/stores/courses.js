"use client";

import { create } from "zustand";

export const useCourseDisplay = create((set) => ({
  searchQuery: "",
  category: "All",
  price: "All",
  rating: "All",
  sortPopular: 0,
  sortPrice: 0,
  sortRating: 0,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategory: (newCategory) => set({ category: newCategory }),
  setPrice: (newPrice) => set({ price: newPrice }),
  setRating: (newRating) => set({ rating: newRating }),
  setSortPopular: (newVal) => set({ sortPopular: newVal }),
  setSortPrice: (newVal) => set({ sortPrice: newVal }),
  setSortRating: (newVal) => set({ sortRating: newVal }),
}));

export const useCourses = create((set) => ({
  courses: null,
  setCourses: (courses) => set({ courses }),
}));
