"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dev() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dev/dashboard");
  }, [router]);

  return <p>Redirecting...</p>;
}
