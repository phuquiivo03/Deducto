import { Entity, Relationship } from "@/types/detective";

interface Props {
  entities: Record<string, Entity>;

  relationships: Relationship[];
}

export default function ConnectionLines({
  entities,

  relationships,
}: Props) {
  return (
    <svg
      className="
absolute
inset-0
pointer-events-none
w-full
h-full
"
    >
      {relationships.map((rel) => {
        const a = entities[rel.a];

        const b = entities[rel.b];

        return (
          <line
            key={rel.id}
            x1={a.x + 98}
            y1={a.y + 50}
            x2={b.x + 98}
            y2={b.y + 50}
            stroke={
              rel.status === "confirmed"
                ? "#5E8A62"
                : rel.status === "impossible"
                  ? "#BD5F51"
                  : "#CBC2AC"
            }
            strokeWidth="2"
            strokeDasharray={rel.status === "unknown" ? "4 4" : undefined}
          />
        );
      })}
    </svg>
  );
}
