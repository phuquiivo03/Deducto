import Image from "next/image";
import Link from "next/link";

import {
  DoodleArrow,
  DoodleCornerMarks,
  DoodleScribbleCircle,
} from "@/components/ui/doodles";
import { buttonClassName } from "@/components/ui/button";

import { OpenCaseLink } from "./open-case-link";

export default function LandingHero() {
  return (
    <section
      className="
max-w-5xl mx-auto px-6
py-20
min-h-[calc(100dvh-4rem)]
grid grid-cols-1 md:grid-cols-2 gap-8
items-center
"
    >
      <div className="order-2 md:order-1 -rotate-1">
        <h1
          className="
font-heading text-4xl md:text-5xl lg:text-6xl
text-pencil leading-[1.05] max-w-[14ch]
"
        >
          Mỗi chứng cứ đều liên kết với sự thật
          <span className="inline-block text-marker rotate-12 ml-1">!</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-pencil/80 leading-relaxed max-w-[65ch]">
          Xây dựng bảng điều tra, kiểm tra giả thuyết, và phán đoán tội phạm khi
          các chứng cứ hợp lý.
        </p>

        <div className="relative mt-10 flex flex-wrap items-center gap-6">
          <OpenCaseLink className={buttonClassName({ size: "default" })} />
          <DoodleArrow className="hover:hidden absolute -right-5 top-full md:top-[60%] md:-translate-y-1/2 md:left-[11rem] md:right-auto" />
          <Link
            href="/create"
            className={buttonClassName({
              variant: "secondary",
              size: "default",
            })}
          >
            Tạo case
          </Link>
        </div>
      </div>

      <div
        className="
order-1 md:order-2 relative rotate-1
aspect-[16/10] w-full
border-2 border-pencil overflow-hidden
rounded-wobbly-md shadow-hard
"
      >
        <div
          className="
pointer-events-none absolute left-1/2 top-0 z-10
h-7 w-28 -translate-x-1/2 -translate-y-1/2
rotate-2 border border-pencil/20 bg-erased/90
"
          aria-hidden
        />
        <DoodleScribbleCircle className="absolute -right-2 -top-4 z-10" />
        {/* <Image
          src="/images/landing/hero-desk.png"
          alt="Lamp-lit study desk with notes and a magnifying glass"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        /> */}
        <video
          src={
            "https://ayykrasuylzwljioovgz.supabase.co/storage/v1/object/public/storage/Screen%20Recording%202026-10-02%20at%2019.27.24.mp4"
          }
          autoPlay
          muted
          loop
          className="object-cover w-full h-full"
        />
      </div>
    </section>
  );
}
