"use client";

import { useCreateGameStore } from "@/store/create-game.store";
import { Button, buttonClassName } from "@/components/ui/button";

import CaseInfoForm from "./CaseInfoForm";
import ClueList from "./ClueList";
import EntityEditors from "./EntityEditors";
import SolutionPicker from "./SolutionPicker";
import ValidationSummary from "./ValidationSummary";
import SolvabilityBanner from "./SolvabilityBanner";
import { useDraftSolvability } from "@/hooks/use-draft-solvability";

const NAV = [
  { id: "section-overview", label: "Tổng quan" },
  { id: "section-suspects", label: "Nghi phạm" },
  { id: "section-weapons", label: "Hung khí" },
  { id: "section-locations", label: "Địa điểm" },
  { id: "section-motives", label: "Động cơ" },
  { id: "section-clues", label: "Manh mối" },
  { id: "section-solution", label: "Đáp án" },
];

export default function CaseEditor({
  onCreate,
  onRegenerate,
  isSubmitting,
}: {
  onCreate: () => void;
  onRegenerate: () => void;
  isSubmitting: boolean;
}) {
  const draft = useCreateGameStore((s) => s.draft);
  const issues = useCreateGameStore((s) => s.issues);
  const solvability = useDraftSolvability();

  if (!draft) {
    return null;
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-8 items-start">
      <nav
        className="
hidden lg:block sticky top-4 space-y-1
border-2 border-dashed border-pencil bg-erased/40 p-3 rounded-wobbly-md
"
        aria-label="Case sections"
      >
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            className="
block w-full text-left text-base px-2 py-2 rounded-wobbly-sm
text-pencil/70 hover:bg-postit hover:text-pencil
"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="space-y-8 min-w-0">
        <SolvabilityBanner
          status={solvability.status}
          messageVi={solvability.messageVi}
          isChecking={solvability.isChecking}
        />
        <ValidationSummary issues={issues} />
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className="
shrink-0 text-sm border-2 border-pencil px-3 py-1 rounded-wobbly-sm bg-card
"
            >
              {item.label}
            </button>
          ))}
        </div>
        <CaseInfoForm />
        <EntityEditors metadata={draft.gameMetadata} />
        <ClueList metadata={draft.gameMetadata} />
        <SolutionPicker metadata={draft.gameMetadata} />

        <div
          className="
sticky bottom-0 z-10 -mx-1 px-1 py-4 bg-paper
border-t-2 border-dashed border-pencil flex flex-col sm:flex-row gap-3
"
        >
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isSubmitting}
            className={buttonClassName({
              variant: "secondary",
              className: "flex-1",
            })}
          >
            Tạo lại
          </button>
          <Button
            type="button"
            onClick={onCreate}
            disabled={isSubmitting || !solvability.canCreate}
            title={
              !solvability.canCreate && !isSubmitting
                ? solvability.messageVi ??
                  "Sửa manh mối hoặc đáp án cho đến khi logic hợp lệ."
                : undefined
            }
            className="flex-1"
          >
            {isSubmitting ? "Đang tạo…" : "Tạo vụ án"}
          </Button>
        </div>
      </div>
    </div>
  );
}
