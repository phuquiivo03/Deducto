"use client";

import type { IGameMetadata } from "@/features/game/game.schemas";
import { useCreateGameStore } from "@/store/create-game.store";
import Card from "@/components/ui/Card";
import { StickyTag } from "@/components/ui/sticky-tag";

import { FieldShell, inputClass } from "./field-shell";

function resultChanged(
  a: Record<string, string> | null,
  b: Record<string, string> | null,
): boolean {
  if (!a || !b) {
    return false;
  }
  return (
    a.murder_id !== b.murder_id ||
    a.weapon_id !== b.weapon_id ||
    a.location_id !== b.location_id ||
    a.motive_id !== b.motive_id
  );
}

export default function SolutionPicker({
  metadata,
}: {
  metadata: IGameMetadata;
}) {
  const result = useCreateGameStore((s) => s.result);
  const originalResult = useCreateGameStore((s) => s.originalResult);
  const issues = useCreateGameStore((s) => s.issues);
  const setResult = useCreateGameStore((s) => s.setResult);
  const restoreOriginalResult = useCreateGameStore(
    (s) => s.restoreOriginalResult,
  );

  if (!result) {
    return null;
  }

  const changed = resultChanged(result, originalResult);

  return (
    <Card
      id="section-solution"
      decoration="tack"
      tone="postit"
      className="space-y-4 mb-0"
    >
      <h2 className="font-heading text-2xl text-pencil">Đáp án</h2>
      {changed ? (
        <div className="border-2 border-dashed border-pencil bg-card px-3 py-2 text-sm text-pencil rounded-wobbly-sm">
          Các manh mối đã được tạo cho đáp án gốc. Thay đổi hung thủ
          <button
            type="button"
            onClick={restoreOriginalResult}
            className="ml-2 wavy-underline font-heading"
          >
            Restore original
          </button>
        </div>
      ) : null}
      <FieldShell
        label="Hung thủ"
        path={["result", "murder_id"]}
        issues={issues}
      >
        <select
          value={result.murder_id}
          onChange={(e) => setResult("murder_id", e.target.value)}
          className={inputClass(false)}
        >
          {metadata.suspects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </FieldShell>
      <FieldShell label="Vũ khí" path={["result", "weapon_id"]} issues={issues}>
        <select
          value={result.weapon_id}
          onChange={(e) => setResult("weapon_id", e.target.value)}
          className={inputClass(false)}
        >
          {metadata.weapons.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </FieldShell>
      <FieldShell
        label="Hiện trường"
        path={["result", "location_id"]}
        issues={issues}
      >
        <select
          value={result.location_id}
          onChange={(e) => setResult("location_id", e.target.value)}
          className={inputClass(false)}
        >
          {metadata.locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </FieldShell>
      <FieldShell
        label="Động cơ"
        path={["result", "motive_id"]}
        issues={issues}
      >
        <select
          value={result.motive_id}
          onChange={(e) => setResult("motive_id", e.target.value)}
          className={inputClass(false)}
        >
          {metadata.motives.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </FieldShell>
      <StickyTag className="rotate-0">
        Giữ các manh mối này đồng bộ với các manh mối của bạn
      </StickyTag>
    </Card>
  );
}
