import Image from "next/image";
import Link from "next/link";

import type { IShortGame } from "@/features/game/game.schemas";
import { formatDifficulty } from "@/lib/case-file";
import { cn } from "@/lib/cn";
import { StickyTag } from "@/components/ui/sticky-tag";
import { CaseBanner } from "@/components/store/case-banner";
import { VisibilityFlag } from "@/components/store/visibility-flag";

interface CaseCardProps {
  game: IShortGame;
  index?: number;
  showVisibility?: boolean;
}

export function CaseCard({
  game,
  index = 0,
  showVisibility = false,
}: CaseCardProps) {
  const banner = game.banner?.trim();
  const description =
    game.description.length > 120
      ? `${game.description.slice(0, 117)}…`
      : game.description;
  const decoration = index % 2 === 0 ? "tape" : "tack";
  const tiltClass =
    index % 2 === 0 ? "-rotate-1 hover:rotate-1" : "rotate-1 hover:-rotate-1";

  const cardClass = cn(
    "group relative flex flex-col overflow-hidden",
    "border-2 border-pencil bg-card rounded-wobbly-md shadow-paper",
    "transition-transform duration-100",
    tiltClass,
  );

  const body = (
    <>
      {decoration === "tape" ? (
        <div
          className="
pointer-events-none absolute left-1/2 top-0 z-10
h-6 w-20 -translate-x-1/2 -translate-y-1/2
rotate-1 border border-pencil/20 bg-erased/80
"
          aria-hidden
        />
      ) : (
        <div
          className="
pointer-events-none absolute left-1/2 top-0 z-10
h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2
rounded-full border-2 border-pencil bg-marker
"
          aria-hidden
        />
      )}
      {/* <div className="relative aspect-[16/10] w-full bg-paper border-b-2 border-dashed border-pencil">
        {banner ? <CaseBanner src={banner} /> : null}
      </div> */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h2
            className="
font-heading text-xl text-pencil leading-snug
group-hover:text-pen transition-colors
"
          >
            {game.title}
          </h2>
          {showVisibility ? (
            <div className="flex shrink-0 flex-col items-end gap-2">
              <StickyTag className="shrink-0 text-sm rotate-0">
                {formatDifficulty(String(game.level))}
              </StickyTag>
              <VisibilityFlag
                gameId={game.id}
                visibility={game.visibility}
              />
            </div>
          ) : (
            <StickyTag className="shrink-0 text-sm rotate-0">
              {formatDifficulty(String(game.level))}
            </StickyTag>
          )}
        </div>
        <p className="text-base text-pencil/75 leading-relaxed line-clamp-2">
          {description}
        </p>
        <p className="mt-auto pt-2 text-sm text-pencil/60">By</p>
        <div className="flex gap-2">
          <Image
            src={game.creator?.avatar ?? "/user.svg"}
            alt="Creator avatar"
            width={20}
            height={20}
            className="rounded-wobbly-sm  shadow-hard-sm border-pencil border-2"
          />
          <p className="font-bold  text-sm">{game.creator?.name}</p>
        </div>
      </div>
    </>
  );

  if (!showVisibility) {
    return (
      <Link href={`/case/${game.id}`} className={cardClass}>
        {body}
      </Link>
    );
  }

  return (
    <div className={cardClass}>
      <Link
        href={`/case/${game.id}`}
        className="absolute inset-0 z-10"
        aria-label={game.title}
      />
      {body}
    </div>
  );
}
