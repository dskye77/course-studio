// src/app/error.js
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-red-600">
          Something went wrong!
        </h2>
        <p className="text-muted-foreground max-w-md">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}
