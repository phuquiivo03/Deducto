"use client";

import { Note } from "@/types/detective";

interface Props {
  note: Note;

  onMove: (x: number, y: number) => void;

  onDelete: () => void;

  onChange: (text: string) => void;
}

export default function StickyNote({
  note,

  onMove,

  onDelete,

  onChange,
}: Props) {
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const startX = e.clientX;

    const startY = e.clientY;

    const originX = note.x;

    const originY = note.y;

    const target = e.currentTarget;

    target.setPointerCapture(e.pointerId);

    function move(ev: PointerEvent) {
      const dx = ev.clientX - startX;

      const dy = ev.clientY - startY;

      onMove(
        originX + dx,

        originY + dy,
      );
    }

    function up() {
      target.releasePointerCapture(e.pointerId);

      target.removeEventListener("pointermove", move);

      target.removeEventListener("pointerup", up);
    }

    target.addEventListener("pointermove", move);

    target.addEventListener("pointerup", up);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        left: `${note.x}px`,

        top: `${note.y}px`,

        transform: `rotate(${note.rot}deg)`,
      }}
      className="
absolute
w-[150px]
min-h-[96px]
bg-[#FBF7EC]
border
border-[#E9DFC2]
rounded-lg
p-3
shadow-sm
cursor-grab
select-none
text-xs
text-[#4A452F]
touch-none
"
    >
      {/* ghim */}

      <div
        className="
absolute
top-[-6px]
left-1/2
-translate-x-1/2
w-2.5
h-2.5
rounded-full
bg-[#B08328]
"
      />

      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onDelete}
        className="
absolute
right-1
top-1
text-[#B8AF95]
hover:text-red-500
"
      >
        ×
      </button>

      <div
        contentEditable
        suppressContentEditableWarning
        onPointerDown={(e) => e.stopPropagation()}
        onInput={(e) => onChange(e.currentTarget.innerText)}
        className="
outline-none
min-h-[70px]
"
      >
        {note.text}
      </div>
    </div>
  );
}
