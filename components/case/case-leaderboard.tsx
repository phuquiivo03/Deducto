"use client";

import Card from "@/components/ui/Card";
import { StickyTag } from "@/components/ui/sticky-tag";
import {
  LEADERBOARD_LIMIT,
  type LeaderboardRow,
} from "@/features/submission/submission.schemas";
import { formatInvestigationClock } from "@/lib/game-clock";
import { cn } from "@/lib/cn";

function SolveRow({ row }: { row: LeaderboardRow }) {
  return (
    <li
      className={cn(
        "flex items-baseline gap-3 py-2",
        "border-b-2 border-dashed border-pencil/30",
        row.isViewer && "-mx-2 rounded-wobbly-sm bg-postit px-2",
      )}
    >
      <span className="w-8 shrink-0 font-heading text-xl">{row.rank}</span>
      <span className="min-w-0 flex-1 truncate text-base">
        {row.name}
        {row.isViewer ? (
          <span className="text-pencil/70"> (bạn)</span>
        ) : null}
      </span>
      <span className="shrink-0 font-heading text-lg">
        {formatInvestigationClock(row.seconds * 1000)}
      </span>
    </li>
  );
}

export default function CaseLeaderboard({
  entries,
}: {
  entries: LeaderboardRow[];
}) {
  const top = entries.filter((row) => row.rank <= LEADERBOARD_LIMIT);
  const own = entries.find((row) => row.rank > LEADERBOARD_LIMIT);

  return (
    <Card decoration="tape" tilt="right" className="mb-0">
      <StickyTag className="mb-4 rotate-0">Bảng xếp hạng</StickyTag>
      <h2 className="mb-1 font-heading text-2xl text-pencil">
        Thời gian giải
      </h2>
      <p className="mb-4 text-sm text-pencil/70">
        Nhanh nhất đứng đầu. Chỉ tính người đã giải xong.
      </p>

      {top.length === 0 ? (
        <p className="text-base text-pencil/70">
          Chưa có ai giải xong case này.
        </p>
      ) : (
        <ul className="list-none" aria-label="Bảng xếp hạng thời gian giải">
          {top.map((row) => (
            <SolveRow key={row.userId} row={row} />
          ))}
        </ul>
      )}

      {own ? (
        <div className="mt-4 border-t-2 border-dashed border-pencil pt-3">
          <p className="mb-1 text-sm text-pencil/70">Hạng của bạn</p>
          <ul className="list-none">
            <SolveRow row={own} />
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
