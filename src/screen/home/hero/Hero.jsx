"use client";

import Link from "next/link";

import useBreakpoint from "@/hooks/useBreakpoints";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Hero() {
  const { isAbove } = useBreakpoint();

  const actionCards = [
    {
      title: "For Creators",
      description:
        "Build and sell your courses. Create beautiful interactive courses easily.",
      actionText: "Get Started",
    },
    {
      title: "For Learners",
      description:
        "Discover and learn skills. Find courses from thousands of creators and learn quickly.",
      actionText: <Link href="/courses">Browse Courses</Link>,
    },
  ];

  return (
    <section className="bg-background text-foreground">
      <div className="flex flex-col justify-center items-center gap-6 text-center w-full py-10 md:py-20">
        {/* Hero Heading */}
        <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-4xl px-4 text-primary text-gradient">
          Build Courses & Learn Anything, All in One Platform
        </h1>

        {/* Subtext */}
        <p className="md:max-w-2xl text-sm md:text-lg px-3 text-muted-foreground">
          Create beautiful interactive courses, discover and learn skills
          quickly.
        </p>

        {/* Hero Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mt-6 justify-center items-center">
          <ScaleButton className="bg-primary text-primary-foreground py-4 px-8">
            Create Course
          </ScaleButton>
          <ScaleButton
            className="border border-primary text-primary py-4 px-8"
            variant="outline"
          >
            <Link href="/courses">Learn Something</Link>
          </ScaleButton>
        </div>

        {/* Avatars / Skeleton */}
        <div className="flex flex-wrap items-center gap-2 mt-6 justify-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          {isAbove("sm") && (
            <>
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </>
          )}
          <span className="text-sm text-muted-foreground mt-2 sm:mt-0">
            Join 10,000+ creators
          </span>
        </div>

        {/* Action Cards */}
        <div className="flex flex-wrap gap-8 justify-center mt-10 w-full px-4">
          {actionCards.map((card) => (
            <ActionCard
              key={card.title}
              title={card.title}
              description={card.description}
              actionText={card.actionText}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ActionCard Component ---------------- */

const ActionCard = ({ title, description, actionText }) => {
  return (
    <Card className="w-full max-w-[450px] h-auto flex flex-col justify-between bg-card border border-primary text-card-foreground shadow-md hover:shadow-lg transition-shadow course-card">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-lg text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <ScaleButton className="bg-primary text-primary-foreground py-2 px-6">
          {actionText}
        </ScaleButton>
      </CardFooter>
    </Card>
  );
};

/* ---------------- ScaleButton Component ---------------- */
/* Uses Tailwind-supported scale classes for hover */
const ScaleButton = ({ children, className, ...props }) => {
  return (
    <Button
      size="lg"
      className={`transition-transform transform hover:scale-105 ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};
