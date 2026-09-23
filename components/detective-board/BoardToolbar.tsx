interface Props {
  view: "board" | "grid";

  setView: (v: "board" | "grid") => void;
}

export default function BoardToolbar({ view, setView }: Props) {
  return (
    <div
      className="
flex
justify-between
items-center
px-4
py-2
border-b
border-[#E7DFCC]
bg-[#F5F0E4]/90
"
    >
      <div
        className="
flex
bg-[#EDE7D6]
rounded-lg
p-1
gap-1
"
      >
        {(["board", "grid"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setView(item)}
            className={`
px-4
py-1.5
rounded-md
text-xs
font-semibold
${view === item ? "bg-white shadow-sm" : "text-[#6F6858]"}
`}
          >
            {item === "board" ? "Board" : "Grid"}
          </button>
        ))}
      </div>

      <div
        className="
flex
gap-2
"
      >
        <button
          className="
px-3
py-1.5
rounded-lg
border
border-[#E7DFCC]
bg-white
text-xs
font-semibold
"
        >
          ＋ Add Note
        </button>

        <button
          className="
px-3
py-1.5
rounded-lg
border
border-[#E7DFCC]
bg-white
text-xs
font-semibold
"
        >
          ↻ Reset
        </button>
      </div>
    </div>
  );
}
