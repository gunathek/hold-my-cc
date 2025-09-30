import AsciiHero from "@/components/ascii-hero";
import CardViewer from "@/components/card-viewer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black">
      <AsciiHero />
      <section className="flex w-full justify-center bg-transparent">
        <CardViewer />
      </section>
    </main>
  );
}
