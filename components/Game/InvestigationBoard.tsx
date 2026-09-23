"use client";

import { useState } from "react";

import CategoryTabs from "./CategoryTabs";
import ItemChips from "./ItemChips";
import ClueList from "./ClueList";

import { suspects, evidence, places, clues } from "@/data/case";

export default function InvestigationBoard() {
  const [tab, setTab] = useState("suspects");
  const [detail, setDetail] = useState<any>();

  const source: any = {
    suspects,
    evidence,
    places,
  };

  return (
    <div>
      <div
        className="
flex justify-between mb-5 pt-4
"
      >
        <span className="text-soft text-sm font-semibold">
          ‹ Cases · Case #024
        </span>

        <div className="flex gap-2">
          <button className="cursor-pointer bg-card text-sm text-gold font-bold shadow-card rounded-card px-3 py-[6px]">
            💡 3
          </button>{" "}
          <button className="cursor-pointer bg-card rounded-full shadow-card flex items-center justify-center w-8 h-8">
            ⟲
          </button>
        </div>
      </div>

      <div
        className="
bg-card
border
border-line
rounded-card
shadow-card
p-5
mb-5
"
      >
        <h2 className="font-serif text-xl">The Midnight Murder</h2>

        <p className="text-soft text-sm">
          A body was discovered at the old mansion. Review the suspects,
          evidence and places, then read every clue before you accuse.
        </p>
      </div>

      <CategoryTabs active={tab} change={setTab} />

      <ItemChips
        items={source[tab]}
        selected={detail?.id}
        onSelect={setDetail}
      />

      {detail && (
        <div
          className="
bg-goldBg
rounded-xl
p-4
mb-5
"
        >
          {detail.detail}
        </div>
      )}

      <h3 className="font-bold mb-3 text-sm text-soft">💡 Clues</h3>

      <ClueList clues={clues} />

      <button
        className="
w-full
bg-ink
text-paper
rounded-xl
py-4
font-bold
mt-1.5
text-xl
"
      >
        🔍 Solve the case
      </button>
    </div>
  );
}
