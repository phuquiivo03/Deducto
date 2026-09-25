"use client";

import { useState } from "react";

import { Entity } from "@/types/detective";

import AccusationForm from "./AccusationForm";

interface Props {
  view: "board" | "grid";

  setView: (v: "board" | "grid") => void;

  entities: Record<string, Entity>;
}

export default function BoardToolbar({ view, setView, entities }: Props) {
  const [accusationOpen, setAccusationOpen] = useState(false);

  return (
    <>
      <div
        className="
flex
justify-between
items-center
px-4
py-2
border-b
border-[#E7DFCC]
bg-[#F5F0E4]/90
"
      >
        <div
          className="
flex
bg-[#EDE7D6]
rounded-lg
p-1
gap-1
"
        >
          {(["board", "grid"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={`
px-4
py-1.5
rounded-md
text-xs
font-semibold
${view === item ? "bg-white shadow-sm" : "text-[#6F6858]"}
`}
            >
              {item === "board" ? "Board" : "Grid"}
            </button>
          ))}
        </div>

        <div
          className="
flex
gap-2
items-center
"
        >
          <button
            type="button"
            onClick={() => setAccusationOpen(true)}
            className="
px-4
py-2
rounded-lg
text-xs
font-bold
uppercase
tracking-wide
text-[#FDFCF9]
bg-gradient-to-br
from-[#3B3730]
to-[#23211C]
shadow-md
ring-2
ring-[#B08328]/50
hover:brightness-120
ring-offset-2
ring-offset-[#F5F0E4]
active:scale-[0.98]
transition
cursor-pointer
"
          >
            Make accusation 🛎️
          </button>

          <button
            type="button"
            className="
px-3
py-1.5
rounded-lg
border
border-[#E7DFCC]
bg-white
text-xs
font-semibold
"
          >
            ＋ Add Note
          </button>

          <button
            type="button"
            className="
px-3
py-1.5
rounded-lg
border
border-[#E7DFCC]
bg-white
text-xs
font-semibold
"
          >
            ↻ Reset
          </button>
        </div>
      </div>

      <AccusationForm
        entities={entities}
        open={accusationOpen}
        onClose={() => setAccusationOpen(false)}
      />
    </>
  );
}
