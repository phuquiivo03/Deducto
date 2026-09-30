import Image from "next/image";
import Link from "next/link";

import { OpenCaseLink } from "./open-case-link";

export default function LandingHero() {
  return (
    <section
      className="
max-w-7xl mx-auto px-4 md:px-6
pt-8 md:pt-12 pb-16 md:pb-20
min-h-[calc(100dvh-4rem)]
grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14
items-center
"
    >
      <div className="order-2 lg:order-1">
        <h1
          className="
font-display text-4xl md:text-5xl lg:text-6xl
text-ink tracking-tight leading-[1.05]
max-w-[14ch]
"
        >
          Every clue connects to the truth.
        </h1>

        <p className="mt-4 text-base text-soft leading-relaxed max-w-[65ch]">
          Build a detective board, test your theories, and accuse the killer
          when the evidence lines up.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <OpenCaseLink
            className="
inline-flex items-center justify-center
rounded-xl bg-ink text-paper
px-6 py-3.5 text-sm font-bold
transition-transform active:scale-[0.98]
hover:bg-[#1f1d19]
"
          />

          <Link
            href="/create"
            className="
text-sm  text-ink
 decoration-line
border hover:border-gold
px-6 py-3.5 shadow-md
rounded-xl
font-bold
"
          >
            Create a case
          </Link>
        </div>
      </div>

      <div
        className="
order-1 lg:order-2
relative aspect-[16/10] w-full
rounded-card overflow-hidden
border border-line shadow-card
"
      >
        <Image
          src="/images/landing/hero-desk.png"
          alt="Lamp-lit study desk with notes and a magnifying glass"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
