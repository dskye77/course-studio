"use client";
import Header from "@/components/layouts/header";
import { Toaster } from "sonner";

export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Toaster richColors position="top-center"/>
    </div>
  );
}
