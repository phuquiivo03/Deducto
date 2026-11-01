"use client";

import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";

import Card from "./Card";

export default function CaseUnavailable({
  title,
  message,
  showStoreLink = true,
  onRetry,
  heading = "h1",
}: {
  title: string;
  message: string;
  showStoreLink?: boolean;
  onRetry?: () => void;
  heading?: "h1" | "p";
}) {
  const TitleTag = heading;
  return (
    <Card decoration="tack" tone="postit" tilt="left" className="mb-0">
      <TitleTag className="font-heading text-4xl mb-3 text-pencil">
        {title}
      </TitleTag>
      <p className="text-base leading-relaxed text-pencil/80 mb-6">{message}</p>
      {showStoreLink || onRetry ? (
        <div className="flex flex-wrap gap-3">
          {onRetry ? (
            <button type="button" className={buttonClassName()} onClick={onRetry}>
              Thử lại
            </button>
          ) : null}
          {showStoreLink ? (
            <Link
              href="/store"
              className={buttonClassName({ variant: "secondary" })}
            >
              Về cửa hàng
            </Link>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
