"use client";

import { Entity } from "@/types/detective";

interface Props {
  entity: Entity;

  selected: boolean;

  onSelect: () => void;

  onMove: (x: number, y: number) => void;

  onStartConnect: (e: React.PointerEvent) => void;
}

export default function EntityCard({
  entity,

  selected,

  onSelect,

  onMove,

  onStartConnect,
}: Props) {
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
      }}
      className={`
        card

absolute
z-10

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
            ? "🦹‍♀️"
            : entity.type === "weapon"
              ? "⚔"
              : "📍"}
        </div>

        <span
          className="
text-[10px]
font-bold
text-[#9C9482]
uppercase
"
        >
          {entity.type}
        </span>
      </div>

      <span
        className="
font-semibold
text-sm
"
      >
        {entity.name}
      </span>

      <span
        className="
        block
text-xs
text-[#6F6858]
mt-1
"
      >
        {entity.meta}
      </span>

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
bg-white
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
