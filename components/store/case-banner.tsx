"use client";

import Image from "next/image";
import { useState } from "react";

import { canUseNextImage, classifyBanner } from "@/lib/case-banner";

export function CaseBanner({ src }: { src: string }) {
  const [hidden, setHidden] = useState(false);
  const kind = classifyBanner(src);
  if (hidden || kind === "empty" || kind === "invalid") return null;

  const handleError = () => {
    setHidden(true);
  };

  if (!canUseNextImage(kind)) {
    // Creator URLs are not in next.config remotePatterns, so next/image
    // would throw and take down the store list.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-cover"
      onError={handleError}
    />
  );
}
