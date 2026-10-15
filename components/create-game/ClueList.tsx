"use client";

import { useState } from "react";

import { Lock } from "lucide-react";

import type { IGameMetadata } from "@/features/game/game.schemas";
import { listPuzzleKinds, type PuzzleKind } from "@/features/puzzles/registry";
import { buildClue } from "@/lib/clue-templates";
import { clueToText } from "@/lib/clues.helper";
import {
  suggestVeilAttributes,
  veilAttributeOptions,
  veilBlockReason,
  veilOnlyId,
  veilPreview,
  veilRoleId,
} from "@/lib/attribute-veil";
import { newClueId, useCreateGameStore } from "@/store/create-game.store";
import type { PuzzleLockDraft } from "@/features/puzzles/lock-request";
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
  const veils = useCreateGameStore((s) => s.veils);
  const setVeil = useCreateGameStore((s) => s.setVeil);
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
        ? `Đã khóa manh mối #${index + 1}. Hãy thêm gợi ý.`
        : "Đã khóa một câu người chơi thấy. Hãy thêm gợi ý.",
    );
  };

  const handleSetLock = (
    clueId: string,
    kind: PuzzleKind | null,
    hint?: string,
  ) => {
    setLock(clueId, kind, hint);
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
        Che bằng thuộc tính giấu câu gốc và thay bằng câu thuộc tính
        nói vòng. Khóa mật thư giấu câu bằng Caesar hoặc Scytale (gợi
        ý là bắt buộc). Máy chủ tạo mật mã khi bạn tạo vụ án.
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
          const veil = veils.find((item) => item.clueId === clue.id);
          const block = veilBlockReason(metadata, clue);
          const options = veilAttributeOptions(metadata, clue);
          const shown = veil
            ? veilPreview(metadata, clue, veil.attributes)
            : null;
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
                  className={
                    veil
                      ? "flex-1 text-left text-base text-pencil/50 line-through"
                      : "flex-1 text-left text-base text-pencil"
                  }
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
              <div className="flex flex-wrap items-center gap-3 px-4 pb-3">
                <label
                  className="inline-flex items-center gap-2 text-sm text-pencil"
                  title={block && !veil ? block : undefined}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(veil)}
                    disabled={Boolean(block) && !veil}
                    onChange={(event) => {
                      if (!event.target.checked) {
                        setVeil(clue.id, null);
                        return;
                      }
                      const suggested = suggestVeilAttributes(
                        metadata,
                        clue,
                      );
                      if (suggested) setVeil(clue.id, suggested);
                    }}
                  />
                  Che bằng thuộc tính
                </label>
                {block && !veil ? (
                  <span className="text-sm text-pencil/70">{block}</span>
                ) : null}
                {defaultKind && !veil ? (
                  <CipherLock
                    clueId={clue.id}
                    index={index}
                    lock={locks.find((item) => item.clueId === clue.id)}
                    kinds={kinds}
                    defaultKind={defaultKind}
                    onLock={handleSetLock}
                  />
                ) : null}
              </div>
              {veil && shown ? (
                <div className="space-y-3 px-4 pb-3">
                  <p className="text-sm text-pencil/70">Người chơi thấy:</p>
                  {shown.role ? (
                    <PlayerLine
                      text={shown.role}
                      clueId={veilRoleId(clue.id)}
                      index={index}
                      which="vai"
                      locks={locks}
                      kinds={kinds}
                      defaultKind={defaultKind}
                      onLock={handleSetLock}
                    />
                  ) : null}
                  {shown.only ? (
                    <PlayerLine
                      text={shown.only}
                      clueId={veilOnlyId(clue.id)}
                      index={index}
                      which="duy nhất"
                      locks={locks}
                      kinds={kinds}
                      defaultKind={defaultKind}
                      onLock={handleSetLock}
                    />
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    {options.map((option) => (
                      <label
                        key={option.key}
                        className="inline-flex items-center gap-2 text-sm text-pencil"
                      >
                        <input
                          type="checkbox"
                          checked={veil.attributes.includes(option.key)}
                          onChange={() => {
                            const next = options
                              .map((item) => item.key)
                              .filter((key) =>
                                key === option.key
                                  ? !veil.attributes.includes(option.key)
                                  : veil.attributes.includes(key),
                              );
                            setVeil(clue.id, next);
                          }}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {shown.message ? (
                    <p className="text-sm text-marker">{shown.message}</p>
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

function PlayerLine({
  text,
  clueId,
  index,
  which,
  locks,
  kinds,
  defaultKind,
  onLock,
}: {
  text: string;
  clueId: string;
  index: number;
  which: string;
  locks: PuzzleLockDraft[];
  kinds: { kind: PuzzleKind; label: string }[];
  defaultKind: PuzzleKind | undefined;
  onLock: (clueId: string, kind: PuzzleKind | null, hint?: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-wobbly-sm border-2 border-dashed border-pencil px-3 py-2">
      <p className="text-base text-pencil">{text}</p>
      {defaultKind ? (
        <CipherLock
          clueId={clueId}
          index={index}
          label={`Khóa mật thư (${which})`}
          lock={locks.find((item) => item.clueId === clueId)}
          kinds={kinds}
          defaultKind={defaultKind}
          onLock={onLock}
        />
      ) : null}
    </div>
  );
}

function CipherLock({
  clueId,
  index,
  lock,
  kinds,
  defaultKind,
  onLock,
  label = "Khóa mật thư",
}: {
  clueId: string;
  index: number;
  lock: PuzzleLockDraft | undefined;
  kinds: { kind: PuzzleKind; label: string }[];
  defaultKind: PuzzleKind;
  onLock: (clueId: string, kind: PuzzleKind | null, hint?: string) => void;
  label?: string;
}) {
  return (
    <>
      <label className="inline-flex items-center gap-2 text-sm text-pencil">
        <input
          type="checkbox"
          checked={Boolean(lock)}
          onChange={(event) => {
            onLock(clueId, event.target.checked ? defaultKind : null);
          }}
        />
        <Lock className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        {label}
      </label>
      {lock ? (
        <select
          value={lock.kind}
          aria-label={`Loại mật thư cho manh mối ${index + 1}`}
          onChange={(event) => {
            onLock(clueId, event.target.value as PuzzleKind, lock.hint);
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
      {lock ? (
        <div className="w-full min-w-[12rem] flex-1">
          <label htmlFor={`hint-${clueId}`} className="text-sm text-pencil">
            Gợi ý
          </label>
          <input
            id={`hint-${clueId}`}
            value={lock.hint}
            maxLength={200}
            required
            aria-invalid={lock.hint.trim().length === 0}
            aria-describedby={`hint-help-${clueId}`}
            onChange={(event) => {
              onLock(clueId, lock.kind, event.target.value);
            }}
            className="
mt-1 w-full border-2 border-pencil bg-card px-3 py-1
rounded-wobbly-sm text-base text-pencil
"
          />
          <p
            id={`hint-help-${clueId}`}
            className="mt-1 text-sm text-pencil/70"
          >
            Gợi ý chỉ mô tả ngữ cảnh. Không thêm sự kiện hay manh mối
            mới.
          </p>
        </div>
      ) : null}
    </>
  );
}
