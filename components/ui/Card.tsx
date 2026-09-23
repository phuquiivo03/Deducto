export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
bg-card
border border-line
rounded-card
shadow-card
p-5
mb-4
"
    >
      {children}
    </div>
  );
}
