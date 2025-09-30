"use client";

import AsciiHero from "@/components/ascii-hero";
import CardViewer from "@/components/card-viewer";

export default function HeroStage() {
  return (
    <section className="relative min-h-screen w-full">
      <AsciiHero />
      <CardViewer />
    </section>
  );
}
