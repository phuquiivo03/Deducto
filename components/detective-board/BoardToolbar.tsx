"use client";

import { useState } from "react";
import { LayoutGrid, Network } from "lucide-react";

import { Entity } from "@/types/detective";
import { useGameStore } from "@/store/game.store";
import { Button, buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/cn";

import AccusationForm from "./AccusationForm";

interface Props {
  view: "board" | "grid";
  setView: (v: "board" | "grid") => void;
  entities: Record<string, Entity>;
}

export default function BoardToolbar({ view, setView, entities }: Props) {
  const [accusationOpen, setAccusationOpen] = useState(false);
  const { isSolved } = useGameStore();
  return (
    <>
      <div
        className="
flex justify-between items-center px-4 py-2
border-b-2 border-dashed border-erased bg-paper
"
      >
        <div
          className="
flex bg-erased/50 rounded-wobbly-sm p-1 gap-1 border-2 border-pencil
"
        >
          {(["board", "grid"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-wobbly-sm text-sm font-body",
                "border-2 border-transparent transition-transform duration-100",
                view === item
                  ? "bg-card border-pencil shadow-hard-sm -rotate-1"
                  : "text-pencil/70 hover:bg-postit/50",
              )}
            >
              {item === "board" ? (
                <Network className="h-4 w-4" strokeWidth={2.5} />
              ) : (
                <LayoutGrid className="h-4 w-4" strokeWidth={2.5} />
              )}
              {item === "board" ? "Board" : "Grid"}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center flex-wrap justify-end">
          <Button
            type="button"
            size="sm"
            onClick={() => setAccusationOpen(true)}
            disabled={isSolved}
          >
            {isSolved ? "Case đã giải quyết" : "Cáo buộc"}
          </Button>

          <button
            type="button"
            className={buttonClassName({
              variant: "secondary",
              size: "sm",
            })}
          >
            + Thêm ghi chú
          </button>

          <button
            type="button"
            className={buttonClassName({
              variant: "ghost",
              size: "sm",
            })}
          >
            Khởi động lại
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
