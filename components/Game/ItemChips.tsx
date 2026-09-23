export default function ItemChips({ items, selected, onSelect }: any) {
  return (
    <div
      className="
flex gap-3
overflow-x-auto
mb-4
"
    >
      {items.map((item: any) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className={`
min-w-[110px]
rounded-xl
border
p-3
font-bold
text-ssm
${
  selected === item.id
    ? "border-gold bg-goldBg text-gold"
    : "border-line bg-card"
}
`}
        >
          <div className="text-2xl">{item.emoji}</div>

          {item.name}
        </button>
      ))}
    </div>
  );
}
