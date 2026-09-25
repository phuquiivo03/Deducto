interface Props {
  active: string;

  setActive: (v: string) => void;
}

export default function MobileNav({
  active,

  setActive,
}: Props) {
  return (
    <nav
      className="
md:hidden
fixed
bottom-0
left-0
right-0
h-16
bg-white
border-t
border-[#E7DFCC]
flex
justify-around
items-center
"
    >
      {["Clues", "Board", "Inspector"].map((item) => (
        <button
          key={item}
          onClick={() => setActive(item)}
          className={`
text-xs
font-semibold
${active === item ? "text-[#B08328]" : "text-[#6F6858]"}
`}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}
