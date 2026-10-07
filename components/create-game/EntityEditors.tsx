"use client";

import { useState } from "react";

import type {
  IGameMetadata,
  ISuspect,
  IWeapon,
  ILocation,
  IMotive,
} from "@/features/game/game.schemas";
import { useCreateGameStore } from "@/store/create-game.store";

import { FieldShell, inputClass } from "./field-shell";

function CollapsibleCard({
  title,
  subtitle,
  children,
  defaultOpen = false,
  fieldPath,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  fieldPath: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-wobbly-sm border-2 border-pencil bg-card overflow-hidden"
      data-field-path={fieldPath}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-paper/60"
      >
        <span>
          <span className="font-semibold text-pencil">{title}</span>
          {subtitle ? (
            <span className="block text-xs text-pencil/70">{subtitle}</span>
          ) : null}
        </span>
        <span className="text-pencil/70 text-sm">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="px-4 pb-4 space-y-3 border-t border-pencil pt-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function SuspectFields({
  suspect,
  index,
}: {
  suspect: ISuspect;
  index: number;
}) {
  const issues = useCreateGameStore((s) => s.issues);
  const updateEntity = useCreateGameStore((s) => s.updateEntity);
  const updateAttributes = useCreateGameStore((s) => s.updateAttributes);
  const base: (string | number)[] = ["gameMetadata", "suspects", index];

  return (
    <>
      <FieldShell label="Tên" path={[...base, "name"]} issues={issues}>
        <input
          value={suspect.name}
          onChange={(e) =>
            updateEntity("suspects", suspect.id, { name: e.target.value })
          }
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell
        label="Ảnh đại diện"
        path={[...base, "avatar"]}
        issues={issues}
      >
        <input
          value={suspect.avatar ?? ""}
          onChange={(e) =>
            updateEntity("suspects", suspect.id, { avatar: e.target.value })
          }
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell label="Mô tả" path={[...base, "description"]} issues={issues}>
        <textarea
          value={suspect.description ?? ""}
          onChange={(e) =>
            updateEntity("suspects", suspect.id, {
              description: e.target.value,
            })
          }
          rows={2}
          className={inputClass(false)}
        />
      </FieldShell>
      <div className="grid grid-cols-2 gap-2">
        <FieldShell label="Tuổi" path={[...base, "age"]} issues={issues}>
          <input
            type="number"
            value={suspect.age ?? ""}
            onChange={(e) =>
              updateEntity("suspects", suspect.id, {
                age: Number(e.target.value) || undefined,
              })
            }
            className={inputClass(false)}
          />
        </FieldShell>
        <FieldShell
          label="Giới tính"
          path={[...base, "gender"]}
          issues={issues}
        >
          <select
            value={suspect.gender ?? "female"}
            onChange={(e) =>
              updateEntity("suspects", suspect.id, { gender: e.target.value })
            }
            className={inputClass(false)}
          >
            <option value="female">female</option>
            <option value="male">male</option>
            <option value="nonbinary">nonbinary</option>
          </select>
        </FieldShell>
      </div>
      <FieldShell label="Chiều cao (cm)" path={base} issues={issues}>
        <input
          type="number"
          value={suspect.attributes?.height ?? ""}
          onChange={(e) =>
            updateAttributes("suspects", suspect.id, {
              height: Number(e.target.value),
            })
          }
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell label="Màu tóc" path={base} issues={issues}>
        <select
          value={suspect.attributes?.hairColor ?? "brown"}
          onChange={(e) =>
            updateAttributes("suspects", suspect.id, {
              hairColor: e.target.value,
            })
          }
          className={inputClass(false)}
        >
          {["black", "brown", "blonde", "red", "gray", "white", "auburn"].map(
            (c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ),
          )}
        </select>
      </FieldShell>
      <FieldShell label="Tay thuận" path={base} issues={issues}>
        <select
          value={suspect.attributes?.handedness ?? "RIGHT"}
          onChange={(e) =>
            updateAttributes("suspects", suspect.id, {
              handedness: e.target.value,
            })
          }
          className={inputClass(false)}
        >
          <option value="LEFT">LEFT</option>
          <option value="RIGHT">RIGHT</option>
        </select>
      </FieldShell>
      <FieldShell label="Ngày sinh" path={base} issues={issues}>
        <input
          type="date"
          value={suspect.attributes?.birthday ?? ""}
          onChange={(e) =>
            updateAttributes("suspects", suspect.id, {
              birthday: e.target.value,
            })
          }
          className={inputClass(false)}
        />
      </FieldShell>
    </>
  );
}

function WeaponFields({ weapon, index }: { weapon: IWeapon; index: number }) {
  const issues = useCreateGameStore((s) => s.issues);
  const updateEntity = useCreateGameStore((s) => s.updateEntity);
  const updateAttributes = useCreateGameStore((s) => s.updateAttributes);
  const base: (string | number)[] = ["gameMetadata", "weapons", index];

  return (
    <>
      <FieldShell label="Tên" path={[...base, "name"]} issues={issues}>
        <input
          value={weapon.name}
          onChange={(e) =>
            updateEntity("weapons", weapon.id, { name: e.target.value })
          }
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell label="Biểu tượng" path={[...base, "icon"]} issues={issues}>
        <input
          value={weapon.icon}
          onChange={(e) =>
            updateEntity("weapons", weapon.id, { icon: e.target.value })
          }
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell label="Mô tả" path={[...base, "description"]} issues={issues}>
        <textarea
          value={weapon.description ?? ""}
          onChange={(e) =>
            updateEntity("weapons", weapon.id, {
              description: e.target.value,
            })
          }
          rows={2}
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell label="Cân nặng" path={base} issues={issues}>
        <select
          value={weapon.attributes?.weight ?? "MEDIUM"}
          onChange={(e) =>
            updateAttributes("weapons", weapon.id, { weight: e.target.value })
          }
          className={inputClass(false)}
        >
          <option value="LIGHT">LIGHT</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HEAVY">HEAVY</option>
        </select>
      </FieldShell>
      <FieldShell label="Vật liệu" path={base} issues={issues}>
        <input
          value={weapon.attributes?.material ?? ""}
          onChange={(e) =>
            updateAttributes("weapons", weapon.id, {
              material: e.target.value,
            })
          }
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell label="Loại" path={base} issues={issues}>
        <input
          value={weapon.attributes?.type ?? ""}
          onChange={(e) =>
            updateAttributes("weapons", weapon.id, { type: e.target.value })
          }
          className={inputClass(false)}
        />
      </FieldShell>
    </>
  );
}

function LocationFields({
  location,
  index,
}: {
  location: ILocation;
  index: number;
}) {
  const issues = useCreateGameStore((s) => s.issues);
  const updateEntity = useCreateGameStore((s) => s.updateEntity);
  const updateAttributes = useCreateGameStore((s) => s.updateAttributes);
  const base: (string | number)[] = ["gameMetadata", "locations", index];

  return (
    <>
      <FieldShell label="Tên" path={[...base, "name"]} issues={issues}>
        <input
          value={location.name}
          onChange={(e) =>
            updateEntity("locations", location.id, { name: e.target.value })
          }
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell label="Biểu tượng" path={[...base, "icon"]} issues={issues}>
        <input
          value={location.icon}
          onChange={(e) =>
            updateEntity("locations", location.id, { icon: e.target.value })
          }
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell label="Mô tả" path={[...base, "description"]} issues={issues}>
        <textarea
          value={location.description ?? ""}
          onChange={(e) =>
            updateEntity("locations", location.id, {
              description: e.target.value,
            })
          }
          rows={2}
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell label="Loại" path={base} issues={issues}>
        <select
          value={location.attributes?.type ?? "indoor"}
          onChange={(e) =>
            updateAttributes("locations", location.id, {
              type: e.target.value,
            })
          }
          className={inputClass(false)}
        >
          <option value="indoor">indoor</option>
          <option value="outdoor">outdoor</option>
        </select>
      </FieldShell>
      <FieldShell label="Đặc điểm" path={base} issues={issues}>
        <input
          value={location.attributes?.characteristic ?? ""}
          onChange={(e) =>
            updateAttributes("locations", location.id, {
              characteristic: e.target.value,
            })
          }
          className={inputClass(false)}
        />
      </FieldShell>
    </>
  );
}

function MotiveFields({ motive, index }: { motive: IMotive; index: number }) {
  const issues = useCreateGameStore((s) => s.issues);
  const updateEntity = useCreateGameStore((s) => s.updateEntity);
  const base: (string | number)[] = ["gameMetadata", "motives", index];

  return (
    <>
      <FieldShell label="Tên" path={[...base, "name"]} issues={issues}>
        <input
          value={motive.name}
          onChange={(e) =>
            updateEntity("motives", motive.id, { name: e.target.value })
          }
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell label="Biểu tượng" path={[...base, "icon"]} issues={issues}>
        <input
          value={motive.icon}
          onChange={(e) =>
            updateEntity("motives", motive.id, { icon: e.target.value })
          }
          className={inputClass(false)}
        />
      </FieldShell>
      <FieldShell label="Mô tả" path={[...base, "description"]} issues={issues}>
        <textarea
          value={motive.description ?? ""}
          onChange={(e) =>
            updateEntity("motives", motive.id, {
              description: e.target.value,
            })
          }
          rows={2}
          className={inputClass(false)}
        />
      </FieldShell>
    </>
  );
}

function EntitySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="border-2 border-pencil bg-card p-5 rounded-wobbly-md shadow-paper mb-0 space-y-3"
    >
      <h2 className="font-heading text-2xl text-pencil">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default function EntityEditors({
  metadata,
}: {
  metadata: IGameMetadata;
}) {
  return (
    <>
      <EntitySection id="section-suspects" title="Nghi phạm">
        {metadata.suspects.map((s, i) => (
          <CollapsibleCard
            key={s.id}
            title={`${s.avatar ?? "🧑"} ${s.name}`}
            subtitle={s.description?.slice(0, 60)}
            fieldPath={`gameMetadata.suspects.${i}.name`}
          >
            <SuspectFields suspect={s} index={i} />
          </CollapsibleCard>
        ))}
      </EntitySection>
      <EntitySection id="section-weapons" title="Vũ khí">
        {metadata.weapons.map((w, i) => (
          <CollapsibleCard
            key={w.id}
            title={`${w.icon} ${w.name}`}
            fieldPath={`gameMetadata.weapons.${i}.name`}
          >
            <WeaponFields weapon={w} index={i} />
          </CollapsibleCard>
        ))}
      </EntitySection>
      <EntitySection id="section-locations" title="Hiện trường">
        {metadata.locations.map((l, i) => (
          <CollapsibleCard
            key={l.id}
            title={`${l.icon} ${l.name}`}
            fieldPath={`gameMetadata.locations.${i}.name`}
          >
            <LocationFields location={l} index={i} />
          </CollapsibleCard>
        ))}
      </EntitySection>
      <EntitySection id="section-motives" title="Động cơ">
        {metadata.motives.map((m, i) => (
          <CollapsibleCard
            key={m.id}
            title={`${m.icon} ${m.name}`}
            fieldPath={`gameMetadata.motives.${i}.name`}
          >
            <MotiveFields motive={m} index={i} />
          </CollapsibleCard>
        ))}
      </EntitySection>
    </>
  );
}
