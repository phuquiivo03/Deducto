export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
w-full
max-w-[640px]
mx-auto
px-4
pt-5
pb-10
"
    >
      {children}
    </div>
  );
}
