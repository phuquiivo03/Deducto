import { Clue } from "@/types/detective";

interface Props {
  clues: Clue[];

  onSelect: (id: number) => void;
}

export default function CluePanel({ clues, onSelect }: Props) {
  return (
    <aside
      className="
w-[268px]
bg-white
border-r
border-[#E7DFCC]
flex
flex-col
"
    >
      <div
        className="
p-[18px]
"
      >
        <h2
          className="
font-semibold
text-[15px]
font-display
"
        >
          Clues
        </h2>

        <p
          className="
mt-1
text-xs
text-[#6F6858]
"
        >
          Information you've discovered
        </p>
      </div>

      <div
        className="
flex-1
overflow-y-auto
px-3
pb-5
space-y-2
"
      >
        {clues.map((clue) => (
          <button
            key={clue.id}
            onClick={() => onSelect(clue.id)}
            className="
w-full
text-left
bg-[#FDFCF9]
border
border-[#E7DFCC]
rounded-lg
p-3
hover:shadow-sm
transition
"
          >
            <div
              className="
flex
justify-between
items-center
mb-2
"
            >
              <span
                className="
text-[11px]
font-semibold
text-[#B08328]
"
              >
                CLUE #{String(clue.id).padStart(2, "0")}
              </span>

              <span
                className="
text-[10px]
px-2
py-0.5
rounded-full
bg-[#F4E7C6]
text-[#8C6A1E]
"
              >
                {clue.status}
              </span>
            </div>

            <p
              className="
text-sm
leading-relaxed
"
            >
              {clue.text}
            </p>
          </button>
        ))}
      </div>
    </aside>
  );
}
