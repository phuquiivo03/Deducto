import { Clue } from "@/types/detective";
import { StickyTag } from "@/components/ui/sticky-tag";

interface Props {
  clues: Clue[];
  onSelect: (id: string) => void;
}

function statusTone(status: Clue["status"]) {
  if (status === "Đã dùng") return "marker" as const;
  if (status === "Đã phân tích") return "pen" as const;
  return "postit" as const;
}

export default function CluePanel({ clues, onSelect }: Props) {
  return (
    <aside
      className="
w-[268px] bg-card border-r-2 border-dashed border-erased
flex flex-col
"
    >
      <div className="p-5">
        <h2 className="font-heading text-lg text-pencil">Manh mối</h2>
        <p className="mt-1 text-sm text-pencil/70">
          Thông tin bạn đã tìm thấy trong quá trình điều tra
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-5 space-y-3">
        {clues.map((clue, index) => (
          <button
            key={clue.id}
            type="button"
            onClick={() => onSelect(clue.id)}
            className="
w-full text-left bg-paper border-2 border-pencil
rounded-wobbly-sm p-3 shadow-paper
hover:shadow-hard-sm hover:-rotate-1
transition-transform duration-100
"
          >
            <div className="flex justify-between items-center mb-2 gap-2">
              <span className="text-xs font-heading text-pen">
                Manh mối #{index + 1}
              </span>
              <StickyTag
                tone={statusTone(clue.status)}
                className="text-xs py-0.5 rotate-0"
              >
                {clue.status}
              </StickyTag>
            </div>
            <p className="text-base leading-relaxed text-pencil">{clue.text}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
