"use client";

import { usePathname } from "next/navigation";

import { CategorySelect, SearchInput, FilterModal } from "./SearchBarProps";

// -------------------------
// Main SearchBar Component
// -------------------------
export default function SearchBar() {
  const categories = [
    "All",
    "Programming",
    "Data Science",
    "Digital Marketing",
    "Motion Design",
    "3D Modeling",
    "Photography",
    "Audio Production",
    "Product Management",
    "Illustration",
    "Game Design",
    "Freelancing & Business",
  ];

  const pathName = usePathname();

  return (
    <header className="w-full bg-background py-10 px-4 md:px-8 border-b">
      {pathName === "/courses" && (
        <div className="max-w-5xl mx-auto text-center mb-8 mt-6">
          <h1 className="text-3xl md:text-5xl font-bold text-primary">
            Find Your Perfect Course
          </h1>
          <p className="text-muted-foreground mt-2 md:text-lg">
            Search thousands of expertly crafted courses and level up your
            skills.
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3 items-center bg-muted/50 rounded-xl border p-4 shadow-sm">
          <CategorySelect categories={categories} />
          <SearchInput />

          <FilterModal />
        </div>
      </div>
    </header>
  );
}
