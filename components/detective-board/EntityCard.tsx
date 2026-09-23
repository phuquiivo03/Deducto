"use client";

import { Entity } from "@/types/detective";

interface Props {
  entity: Entity;

  selected: boolean;

  onSelect: () => void;

  onMove: (x: number, y: number) => void;
}

export default function EntityCard({
  entity,

  selected,

  onSelect,

  onMove,
}: Props) {
  return (
    <div
      onPointerDown={(e) => {
        const el = e.currentTarget;

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
      }}
      className={`

absolute

w-[196px]

bg-white

border

rounded-xl

p-3

shadow-sm

cursor-grab

select-none

transition

${selected ? "border-[#B08328] ring-4 ring-[#F4E7C6]" : "border-[#E7DFCC]"}

`}
    >
      <div
        className="
flex
items-center
gap-2
mb-2
"
      >
        <div
          className="
w-8
h-8
rounded-lg
bg-[#F3EEE0]
flex
items-center
justify-center
text-[#6F6858]
"
        >
          {entity.type === "suspect"
            ? "◯"
            : entity.type === "weapon"
              ? "⚔"
              : "⌖"}
        </div>

        <div
          className="
text-[10px]
font-bold
text-[#9C9482]
uppercase
"
        >
          {entity.type}
        </div>
      </div>

      <div
        className="
font-semibold
text-sm
"
      >
        {entity.name}
      </div>

      <div
        className="
text-xs
text-[#6F6858]
mt-1
"
      >
        {entity.meta}
      </div>
    </div>
  );
}
