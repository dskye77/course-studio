"use client";
import Header from "@/screen/layout/header/header";
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
