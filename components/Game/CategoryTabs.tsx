const tabs = [
  ["suspects", "👤 Suspects"],
  ["evidence", "🔎 Evidence"],
  ["places", "📍 Places"],
];

export default function CategoryTabs({ active, change }: any) {
  return (
    <div className="flex gap-2 mb-4">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          onClick={() => change(id)}
          className={`
flex-1
rounded-xl
border
py-[10px]
font-bold
text-ssm
${active === id ? "border-gold bg-goldBg text-gold" : "bg-card border-line text-soft"}
`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
