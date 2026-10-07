import { ArrowLeftFromLine } from "lucide-react";
import { useRouter } from "next/navigation";

import { Relationship } from "@/types/detective";

import BoardProfile from "./board-profile";

interface Props {
  relationships: Relationship[];
  title: string;
  relationshipTotal: number;
}

export default function TopBar({
  relationships,
  title,
  relationshipTotal,
}: Props) {
  const count = relationships.filter((r) => r.status === "confirmed").length;
  const progress =
    relationshipTotal > 0
      ? `trên ${relationshipTotal} mối quan hệ đã xác nhận`
      : "quan hệ đã xác nhận";
  const router = useRouter();
  return (
    <header
      className="
h-[62px] flex items-center gap-3 px-5
bg-card border-b-2 border-dashed border-erased
"
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="
flex h-10 w-10 items-center justify-center
rounded-wobbly-sm border-2 border-pencil bg-paper
shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5
transition-transform duration-100
"
        aria-label="Go back"
      >
        <ArrowLeftFromLine className="h-5 w-5 text-pencil" strokeWidth={2.5} />
      </button>

      <div className="leading-tight min-w-0 flex-1">
        <div className="font-heading text-lg text-pencil truncate">{title}</div>
        <div className="text-sm text-pencil/70">Bảng điều tra</div>
      </div>

      <div
        className="
flex shrink-0 items-center gap-2 px-3 py-1.5
rounded-wobbly-sm bg-erased/60 border-2 border-pencil
text-sm text-pencil/80 whitespace-nowrap
"
      >
        <span className="h-2 w-2 rounded-full bg-pen" />
        <b className="text-pencil">{count}</b>
        <span>{progress}</span>
      </div>

      <BoardProfile />
    </header>
  );
}
