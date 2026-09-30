import { Relationship } from "@/types/detective";
import { useRouter } from "next/navigation";

import BoardProfile from "./board-profile";

interface Props {
  relationships: Relationship[];
}

export default function TopBar({ relationships }: Props) {
  const count = relationships.filter((r) => r.status === "confirmed").length;
  const router = useRouter();
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
      <button
        onClick={() => router.back()}
        className="
w-9
h-9
rounded-xl

flex
items-center
justify-center
hover:text-red-400
cursor-pointer
"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-arrow-left-from-line preview-icon"
        >
          <path d="m9 6-6 6 6 6" />
          <path d="M3 12h14" />
          <path d="M21 19V5" />
        </svg>
      </button>

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

      <BoardProfile />
    </header>
  );
}
