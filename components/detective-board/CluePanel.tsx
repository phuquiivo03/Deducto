import { Lock } from "lucide-react";

import { StickyTag } from "@/components/ui/sticky-tag";
import { clueBoardText } from "@/features/puzzles/clue-board-text";
import { Clue } from "@/types/detective";

interface Props {
  clues: Clue[];
  solvedPuzzleIds?: readonly string[];
  onSelect: (id: string) => void;
  onOpenPuzzle?: (id: string) => void;
}

function statusTone(status: Clue["status"]) {
  if (status === "Đã dùng") return "marker" as const;
  if (status === "Đã phân tích") return "pen" as const;
  return "postit" as const;
}

function isLocked(clue: Clue, solvedPuzzleIds: readonly string[]) {
  return Boolean(clue.puzzle) && !solvedPuzzleIds.includes(clue.id);
}

export default function CluePanel({
  clues,
  solvedPuzzleIds = [],
  onSelect,
  onOpenPuzzle,
}: Props) {
  return (
    <aside
      className="
w-[268px] bg-card border-r-2 border-dashed border-erased
flex flex-col
"
    >
      <div className="p-5">
        <h2 className="font-heading text-lg text-pencil">Manh mối</h2>
        <p className="mt-1 text-sm text-pencil/70">
          Thông tin bạn đã tìm thấy trong quá trình điều tra
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-5 space-y-3">
        {clues.map((clue, index) => {
          const locked = isLocked(clue, solvedPuzzleIds);
          return (
            <button
              key={clue.id}
              type="button"
              aria-haspopup={locked ? "dialog" : undefined}
              aria-label={
                locked ? `Manh mối ${index + 1}, bị khóa` : undefined
              }
              onClick={() => {
                if (locked) {
                  onOpenPuzzle?.(clue.id);
                  return;
                }
                onSelect(clue.id);
              }}
              className={`
w-full text-left border-2 border-pencil
rounded-wobbly-sm p-3 shadow-paper
hover:shadow-hard-sm hover:-rotate-1
transition-transform duration-100
focus-visible:outline focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-pen
${locked ? "bg-erased/70" : "bg-paper"}
`}
            >
              <div className="flex justify-between items-center mb-2 gap-2">
                <span className="text-xs font-heading text-pen">
                  Manh mối #{index + 1}
                </span>
                <StickyTag
                  tone={locked ? "marker" : statusTone(clue.status)}
                  className="text-xs py-0.5 rotate-0"
                >
                  {locked ? (
                    <span className="inline-flex items-center gap-1">
                      <Lock
                        className="h-3.5 w-3.5"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      Bị khóa
                    </span>
                  ) : (
                    clue.status
                  )}
                </StickyTag>
              </div>
              <p className="text-base leading-relaxed text-pencil whitespace-pre-wrap break-words">
                {clueBoardText(clue, !locked)}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
