import CourseCard from "@/components/custom/CourseCard";
import { useCourseDisplay } from "@/stores/courses";

export default function CoursesDisplay({ courses, ignoreFilters = false }) {
  const searchQuery = useCourseDisplay((state) => state.searchQuery);
  const category = useCourseDisplay((state) => state.category);
  const price = useCourseDisplay((state) => state.price);
  const rating = useCourseDisplay((state) => state.rating);

  const sortPopular = useCourseDisplay((state) => state.sortPopular);
  const sortPrice = useCourseDisplay((state) => state.sortPrice);
  const sortRating = useCourseDisplay((state) => state.sortRating);

  const priceRanges = {
    All: [0, Infinity],
    free: [0, 0],
    "₦500 - ₦1000": [500, 1000],
    "₦1000 - ₦3000": [1000, 3000],
    "₦3000 - ₦10000": [3000, 10000],
  };

  const ratingValues = {
    All: 0,
    "4 Stars & above": 4,
    "3 Stars & above": 3,
    "2 Stars & above": 2,
  };

  // -----------------------------------------------------
  // If ignoreFilters, skip filtering entirely
  // -----------------------------------------------------
  const filteredCourses = ignoreFilters
    ? courses
    : courses.filter((course) => {
        const matchesSearch =
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          category === "All" || course.category === category;

        const matchesPriceRange =
          course.price >= priceRanges[price][0] &&
          course.price <= priceRanges[price][1];

        const matchesRating = course.rating >= ratingValues[rating];

        return (
          matchesSearch && matchesCategory && matchesPriceRange && matchesRating
        );
      });

  // -----------------------------------------------------
  // If ignoreFilters, skip all sorting too
  // -----------------------------------------------------
  const sortedCourses = ignoreFilters
    ? filteredCourses
    : [...filteredCourses]
        .sort((a, b) => (a.students - b.students) * sortPopular)
        .sort((a, b) => (a.price - b.price) * sortPrice)
        .sort((a, b) => (a.rating - b.rating) * sortRating);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
      {sortedCourses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
      {sortedCourses.length === 0 && <h2>No courses match your requiremets</h2>}
    </div>
  );
}
