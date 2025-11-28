import { create } from "zustand";

export const useDashboard = create((set) => ({
  user: null,
  setUser: (newVal) => set({ user: newVal }),
}));
