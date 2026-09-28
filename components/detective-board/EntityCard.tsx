"use client";

import { Entity } from "@/types/detective";

interface Props {
  entity: Entity;

  selected: boolean;

  onSelect: () => void;

  onMove: (x: number, y: number) => void;

  onStartConnect: (e: React.PointerEvent) => void;
}

const PAPER_LINES =
  "repeating-linear-gradient(" +
  "to bottom," +
  "transparent," +
  "transparent 21px," +
  "#E5DCC8 21px," +
  "#E5DCC8 22px" +
  ")";

export default function EntityCard({
  entity,

  selected,

  onSelect,

  onMove,

  onStartConnect,
}: Props) {
  const typeLabel =
    entity.type === "suspect"
      ? "Suspect"
      : entity.type === "weapon"
        ? "Weapon"
        : "Location";

  return (
    <div
      data-entity-id={entity.id}
      onPointerDown={(e) => {
        const startX = e.clientX;

        const startY = e.clientY;

        const ox = entity.x;

        const oy = entity.y;

        function move(ev: PointerEvent) {
          const dx = ev.clientX - startX;

          const dy = ev.clientY - startY;

          onMove(
            ox + dx,

            oy + dy,
          );
        }

        function up() {
          window.removeEventListener("pointermove", move);

          window.removeEventListener("pointerup", up);
        }

        window.addEventListener("pointermove", move);

        window.addEventListener("pointerup", up);
      }}
      onClick={onSelect}
      style={{
        left: entity.x,

        top: entity.y,

        backgroundImage: PAPER_LINES,
      }}
      className={`
        card

absolute
z-10

w-[196px]
min-h-[108px]

bg-[#FBF7EC]

border
border-[#D9CEB0]

rounded-sm

pt-7
pb-3
pl-9
pr-3

shadow-[2px_3px_8px_rgba(42,36,24,0.14),0_1px_0_rgba(255,255,255,0.6)_inset]

cursor-grab

select-none

transition-shadow

${
  selected
    ? "border-[#B08328] ring-2 ring-[#F4E7C6] shadow-[3px_5px_14px_rgba(42,36,24,0.2)]"
    : "hover:shadow-[3px_4px_10px_rgba(42,36,24,0.18)]"
}

`}
    >
      <div
        className="
absolute
top-0
bottom-0
left-7
w-px
bg-[#D4A08A]/70
pointer-events-none
"
        aria-hidden
      />

      <div
        className="
absolute
top-[-7px]
left-1/2
z-10
-translate-x-1/2
flex
flex-col
items-center
pointer-events-none
"
        aria-hidden
      >
        <div
          className="
w-3
h-3
rounded-full
bg-[#B08328]
shadow-[0_1px_2px_rgba(0,0,0,0.25)]
"
        />
        <div className="w-px h-1.5 bg-[#8A6420]" />
      </div>

      <p
        className="
text-[9px]
font-bold
uppercase
tracking-[0.14em]
text-[#A89B82]
leading-[22px]
-mb-px
"
      >
        {typeLabel}
      </p>

      <p
        className="
font-display
font-semibold
text-sm
text-[#2C281F]
leading-[22px]
"
      >
        <span>{entity.icon}</span> {entity.name}
      </p>

      {entity.meta ? (
        <p
          className="
text-xs
text-[#5C5648]
leading-[22px]
line-clamp-2
"
        >
          {entity.meta}
        </p>
      ) : null}

      <button
        type="button"
        aria-label={`Connect ${entity.name} to another card`}
        className="
absolute
right-0
top-1/2
z-20
h-4
w-4
-translate-y-1/2
translate-x-1/2
rounded-full
border-2
border-[#B08328]
bg-[#FBF7EC]
shadow-sm
cursor-crosshair
hover:bg-[#F4E7C6]
"
        onPointerDown={(e) => {
          e.stopPropagation();
          onStartConnect(e);
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
