"use client";

import { useState } from "react";

export default function ClueList({ clues }: any) {
  const [open, setOpen] = useState<number[]>([]);

  return (
    <div>
      {clues.map((c: any, i: number) => (
        <div
          key={i}
          onClick={() =>
            setOpen((v) =>
              v.includes(i) ? v.filter((x) => x !== i) : [...v, i],
            )
          }
          className="
bg-card
border
border-line
border-l-4
border-l-gold
rounded-xl
px-[14px]
py-[13px]
mb-3
cursor-pointer
text-sm
"
        >
          <div className="flex justify-between">
            <span>
              <span className=" font-serif text-gold font-bold">0{i + 1}</span>
              &nbsp;&nbsp;
              {c.t}
            </span>
            <span className={open.includes(i) ? "rotate-90" : ""}>{`>`}</span>
          </div>

          {open.includes(i) && (
            <p
              className="
text-sm
text-soft
mt-3
"
            >
              {c.d}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
