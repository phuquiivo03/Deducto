import { Relationship } from "@/types/detective";

interface Props {
  relationships: Relationship[];
}

export default function TopBar({ relationships }: Props) {
  const count = relationships.filter((r) => r.status === "confirmed").length;

  return (
    <header
      className="
h-[62px]
flex
items-center
gap-3
px-5
bg-white
border-b
border-[#E7DFCC]
"
    >
      <div
        className="
w-9
h-9
rounded-xl
bg-gradient-to-br
from-[#3B3730]
to-[#23211C]
flex
items-center
justify-center
shadow-sm
"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F1E6C8"
          strokeWidth="1.8"
        >
          <circle cx="10.5" cy="10.5" r="6.2" />

          <line x1="15.1" y1="15.1" x2="20" y2="20" />
        </svg>
      </div>

      <div
        className="
leading-tight
"
      >
        <div
          className="
font-semibold
text-[16px]
font-display
"
        >
          The Ashcombe Case
        </div>

        <div
          className="
text-xs
text-[#6F6858]
"
        >
          Detective Board
        </div>
      </div>

      <div className="flex-1" />

      <div
        className="
flex
items-center
gap-2
px-3
py-1.5
rounded-full
bg-[#F7F2E6]
border
border-[#E7DFCC]
text-xs
text-[#6F6858]
"
      >
        <span
          className="
w-1.5
h-1.5
rounded-full
bg-[#B08328]
"
        />

        <b
          className="
text-[#2C2A24]
"
        >
          {count}
        </b>

        <span>of 9 relationships confirmed</span>
      </div>
    </header>
  );
}
