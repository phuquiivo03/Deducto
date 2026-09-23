import { Entity } from "@/types/detective";

interface Props {
  entities: Record<string, Entity>;
}

export default function GridView({ entities }: Props) {
  return (
    <div
      className="
grid
grid-cols-3
gap-4
"
    >
      {Object.values(entities).map((entity) => (
        <div
          key={entity.id}
          className="
bg-white
border
border-[#E7DFCC]
rounded-xl
p-4
"
        >
          <div
            className="
text-xs
uppercase
text-[#9C9482]
"
          >
            {entity.type}
          </div>

          <h3
            className="
font-semibold
font-[Outfit]
"
          >
            {entity.name}
          </h3>

          <p
            className="
text-xs
text-[#6F6858]
"
          >
            {entity.meta}
          </p>
        </div>
      ))}
    </div>
  );
}
