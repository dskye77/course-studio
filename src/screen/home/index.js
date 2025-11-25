import React from "react";

import Hero from "./hero/Hero";
import Features from "./features/Features";
import PopularCourses from "./popular/Popular";
import Benefits from "./Benefits/Benefits";
import Footer from "./footer/Footer";

export default function HomeScreen({ popularCourses }) {
  return (
    <div>
      <Hero />
      <Features />
      <PopularCourses courses={popularCourses} />
      <Benefits />
      <Footer />
    </div>
  );
}
