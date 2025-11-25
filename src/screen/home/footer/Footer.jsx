"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

//
// ──────────────────────────────────────────
// COMPONENTS
// ──────────────────────────────────────────
//

function BrandingSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-primary">CourseStudio</h2>

      <p className="mt-3 text-muted-foreground">
        The best place to learn, grow, and build your skills for the future.
      </p>

      <div className="flex gap-3 mt-4">
        <SocialIcon href="#" icon={<Instagram className="size-5" />} />
        <SocialIcon href="#" icon={<Facebook className="size-5" />} />
        <SocialIcon href="#" icon={<Twitter className="size-5" />} />
        <SocialIcon href="#" icon={<Youtube className="size-5" />} />
      </div>
    </div>
  );
}

function SocialIcon({ href, icon }) {
  return (
    <Link
      href={href}
      className="p-2 bg-muted rounded-lg hover:bg-primary/20 transition"
    >
      {icon}
    </Link>
  );
}

function LinkSection({ title, links }) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <ul className="space-y-2 text-muted-foreground">
        {links.map((item, i) => (
          <li key={i}>
            <Link href="#" className="hover:text-primary">
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsletterSection() {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">Stay Updated</h3>

      <p className="text-muted-foreground mb-4">
        Subscribe to receive the latest updates and course offers.
      </p>

      <form className="flex gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-3 py-2 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition"
        >
          Join
        </button>
      </form>
    </div>
  );
}

//
// ──────────────────────────────────────────
// MAIN FOOTER COMPONENT
// ──────────────────────────────────────────
//

export default function Footer() {
  return (
    <footer className="bg-background border-t py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <BrandingSection />

        <LinkSection
          title="Company"
          links={["About Us", "Careers", "Blog", "Contact"]}
        />

        <LinkSection
          title="Popular"
          links={["Graphic Design", "Web Design", "UI/UX", "Animation"]}
        />

        <NewsletterSection />
      </div>

      <div className="text-center text-muted-foreground mt-10 text-sm">
        © {new Date().getFullYear()} CourseStudio. All rights reserved.
      </div>
    </footer>
  );
}
