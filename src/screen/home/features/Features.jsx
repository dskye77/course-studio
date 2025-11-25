"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Interactive Courses",
      description:
        "Create courses with quizzes, videos, and assignments that keep learners engaged.",
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
    },
    {
      title: "Track Progress",
      description:
        "Monitor your learning journey with progress tracking and completion badges.",
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
    },
    {
      title: "Community Engagement",
      description:
        "Interact with teachers and learners through discussions, forums, and chats.",
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
    },
    {
      title: "Flexible Learning",
      description:
        "Learn at your own pace with offline access and downloadable resources.",
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <section className="bg-background text-foreground py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Features that Empower Learning
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
          CourseStudio provides all the tools you need to create, learn, and
          grow—whether you are a teacher or a student.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="p-6 bg-card hover:shadow-lg transition-shadow course-card flex flex-col items-start gap-4"
          >
            <div className="mb-2">{feature.icon}</div>
            <CardHeader className="p-0">
              <CardTitle className="text-xl md:text-2xl">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CardDescription className="text-muted-foreground">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
