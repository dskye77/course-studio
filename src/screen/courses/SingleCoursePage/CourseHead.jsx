import Image from "next/image";

export default function CourseHead({ course }) {
  return (
    <div className="w-full mx-auto p-6 shadow-m mt-14">
      {/* Course Image */}
      <Image
        src={course.image}
        alt={course.title}
        width="500"
        height="64"
        className="w-full h-64 object-cover rounded-md mb-4"
      />

      {/* Course Info */}
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        {course.title}
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-2">
        By <strong>{course.instructor}</strong>
      </p>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {course.description}
      </p>

      <div className="flex items-center justify-between">
        {/* Price */}
        <div className="text-xl font-semibold text-green-600 dark:text-green-400">
          ₦{course.price}
        </div>

        {/* Purchase Button */}
        <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Buy Now
        </button>
      </div>
    </div>
  );
}
