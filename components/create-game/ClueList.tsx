"use client";

import { useState } from "react";

import { Lock } from "lucide-react";

import type { IGameMetadata } from "@/features/game/game.schemas";
import { listPuzzleKinds, type PuzzleKind } from "@/features/puzzles/registry";
import { buildClue } from "@/lib/clue-templates";
import { clueToText } from "@/lib/clues.helper";
import { newClueId, useCreateGameStore } from "@/store/create-game.store";
import Card from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/button";

import ClueEditor from "./ClueEditor";

export default function ClueList({ metadata }: { metadata: IGameMetadata }) {
  const clues = metadata.clues;
  const moveClue = useCreateGameStore((s) => s.moveClue);
  const removeClue = useCreateGameStore((s) => s.removeClue);
  const addClue = useCreateGameStore((s) => s.addClue);
  const locks = useCreateGameStore((s) => s.locks);
  const setLock = useCreateGameStore((s) => s.setLock);
  const suggestLock = useCreateGameStore((s) => s.suggestLock);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [suggestNote, setSuggestNote] = useState<string | null>(null);
  const kinds = listPuzzleKinds();
  const defaultKind = kinds[0]?.kind;

  const handleAdd = () => {
    const id = newClueId();
    const firstSuspect = metadata.suspects[0]?.id;
    const firstWeapon = metadata.weapons[0]?.id;
    addClue(
      buildClue(
        id,
        "E1",
        { suspect_id: firstSuspect, weapon_id: firstWeapon },
        metadata.weapons[0]?.name ?? "",
      ),
    );
    setExpandedId(id);
  };

  const handleSuggest = () => {
    const clueId = suggestLock();
    if (!clueId) {
      setSuggestNote(
        "Không có manh mối nào khóa được với mật thư hiện có.",
      );
      return;
    }
    const index = clues.findIndex((clue) => clue.id === clueId);
    setSuggestNote(
      index >= 0
        ? `Đã khóa manh mối #${index + 1}.`
        : "Đã khóa một manh mối.",
    );
  };

  const handleSetLock = (clueId: string, kind: PuzzleKind | null) => {
    setLock(clueId, kind);
    setSuggestNote(null);
  };

  return (
    <Card id="section-clues" className="space-y-4 mb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-2xl text-pencil">Manh mối</h2>
        <div className="flex flex-wrap gap-2">
          {defaultKind ? (
            <button
              type="button"
              onClick={handleSuggest}
              className={buttonClassName({
                variant: "secondary",
                size: "sm",
              })}
            >
              Gợi ý khóa
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleAdd}
            className={buttonClassName({
              variant: "secondary",
              size: "sm",
            })}
          >
            + Thêm manh mối
          </button>
        </div>
      </div>
      <p className="text-sm text-pencil/70">
        Khóa một manh mối thành mật thư. Máy chủ tạo mật mã và vai trò
        khi bạn tạo vụ án.
      </p>
      {suggestNote ? (
        <p className="text-sm text-pen" role="status">
          {suggestNote}
        </p>
      ) : null}
      <ul className="space-y-3">
        {clues.map((clue, index) => {
          const open = expandedId === clue.id;
          const preview = clueToText(clue, metadata);
          const lock = locks.find((item) => item.clueId === clue.id);
          return (
            <li
              key={clue.id}
              className="
rounded-wobbly-sm border-2 border-pencil bg-card overflow-hidden
shadow-paper -rotate-1
"
            >
              <div className="flex items-start gap-2 px-4 py-3">
                <span className="font-heading text-pen mt-0.5">
                  #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : clue.id)}
                  className="flex-1 text-left text-base text-pencil"
                >
                  {preview}
                </button>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveClue(index, index - 1)}
                    className="text-sm text-pencil/60 disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === clues.length - 1}
                    onClick={() => moveClue(index, index + 1)}
                    className="text-sm text-pencil/60 disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeClue(clue.id)}
                  className="text-sm text-marker font-heading"
                  aria-label="Remove clue"
                >
                  ×
                </button>
              </div>
              {defaultKind ? (
                <div className="flex flex-wrap items-center gap-3 px-4 pb-3">
                  <label className="inline-flex items-center gap-2 text-sm text-pencil">
                    <input
                      type="checkbox"
                      checked={Boolean(lock)}
                      onChange={(event) => {
                        handleSetLock(
                          clue.id,
                          event.target.checked ? defaultKind : null,
                        );
                      }}
                    />
                    <Lock
                      className="h-3.5 w-3.5"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    Khóa mật thư
                  </label>
                  {lock ? (
                    <select
                      value={lock.kind}
                      aria-label={`Loại mật thư cho manh mối ${index + 1}`}
                      onChange={(event) => {
                        handleSetLock(
                          clue.id,
                          event.target.value as PuzzleKind,
                        );
                      }}
                      className="
border-2 border-pencil bg-card px-3 py-1
rounded-wobbly-sm text-base text-pencil
"
                    >
                      {kinds.map((kind) => (
                        <option key={kind.kind} value={kind.kind}>
                          {kind.label}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              ) : null}
              {open ? (
                <div className="px-4 pb-4 border-t-2 border-dashed border-pencil">
                  <ClueEditor clue={clue} index={index} metadata={metadata} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
