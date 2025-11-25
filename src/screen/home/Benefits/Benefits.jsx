import React from "react";
import { CheckCircle, PlayCircle, Library, BadgeCheck } from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      title: "Super Easy Course Creation",
      description:
        "Create beautiful courses with videos, quizzes, modules, and drag-and-drop organization.",
      icon: CheckCircle,
    },
    {
      title: "Learn Faster & Smarter",
      description:
        "Progress tracking, structured lessons, and a smooth learning experience built for speed.",
      icon: PlayCircle,
    },
    {
      title: "For All Skill Levels",
      description:
        "Whether beginner or expert, the platform adapts to creators and learners of any level.",
      icon: Library,
    },
    {
      title: "Built for Growth",
      description:
        "Tools that help creators earn more and students learn more — without stress.",
      icon: BadgeCheck,
    },
  ];

  return (
    <section className="text-foreground py-20 px-4 md:px-8 flex flex-col items-center">
      <h2 className="text-center text-4xl md:text-5xl font-bold tracking-tight">
        Why Choose CourseStudio?
      </h2>

      <p className="text-muted-foreground text-center max-w-2xl mt-4 text-lg">
        Powerful tools for creators. A smooth learning experience for students.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14 w-full max-w-6xl">
        {benefits.map(({ title, description, icon: Icon }, i) => (
          <div
            key={i}
            className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-all"
          >
            <Icon className="text-primary mb-4" size={32} />

            <h3 className="font-bold text-xl mb-2">{title}</h3>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
