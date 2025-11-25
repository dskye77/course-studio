"use client";
import Header from "@/screen/layout/header/header";

export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}
