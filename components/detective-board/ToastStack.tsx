interface Toast {
  id: number;

  text: string;
}

export default function ToastStack({ items }: { items: Toast[] }) {
  return (
    <div
      className="
fixed
bottom-5
right-5
space-y-2
z-50
"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className="
bg-[#2C2A24]
text-white
px-4
py-2
rounded-lg
text-sm
shadow-lg
"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
