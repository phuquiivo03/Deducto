"use client";

import { Entity, Relationship } from "@/types/detective";

interface Props {
  entity?: Entity;

  relationships: Relationship[];

  entities: Record<string, Entity>;

  onUpdateRelationship: (
    id: string,
    status: "confirmed" | "impossible",
  ) => void;
}

export default function InspectorPanel({
  entity,

  relationships,

  entities,

  onUpdateRelationship,
}: Props) {
  if (!entity) {
    return (
      <aside
        className="
w-[320px]
bg-white
border-l
border-[#E7DFCC]
p-5
"
      >
        <h3
          className="
font-semibold
font-[Outfit]
"
        >
          Inspector
        </h3>

        <p
          className="
text-sm
text-[#6F6858]
mt-2
"
        >
          Select a card to inspect details.
        </p>
      </aside>
    );
  }

  const related = relationships.filter(
    (r) => r.a === entity.id || r.b === entity.id,
  );

  return (
    <aside
      className="
w-[320px]
bg-white
border-l
border-[#E7DFCC]
overflow-y-auto
p-5
"
    >
      <div
        className="
mb-5
"
      >
        <div
          className="
text-xs
uppercase
text-[#9C9482]
font-bold
"
        >
          {entity.type}
        </div>

        <h2
          className="
text-xl
font-semibold
font-[Outfit]
"
        >
          {entity.name}
        </h2>

        <p
          className="
text-sm
text-[#6F6858]
"
        >
          {entity.meta}
        </p>
      </div>

      <h3
        className="
font-semibold
text-sm
mb-3
"
      >
        Facts
      </h3>

      <div
        className="
space-y-2
mb-6
"
      >
        {entity.facts.map((fact, i) => (
          <div
            key={i}
            className="
flex
gap-2
text-sm
"
          >
            <span>{fact.ok ? "✓" : "×"}</span>

            <p>{fact.text}</p>
          </div>
        ))}
      </div>

      <h3
        className="
font-semibold
text-sm
mb-3
"
      >
        Relationships
      </h3>

      <div
        className="
space-y-3
"
      >
        {related.map((rel) => {
          const otherId = rel.a === entity.id ? rel.b : rel.a;

          const other = entities[otherId];

          return (
            <div
              key={rel.id}
              className="
border
border-[#E7DFCC]
rounded-lg
p-3
"
            >
              <div
                className="
flex
justify-between
"
              >
                <strong
                  className="
text-sm
"
                >
                  {rel.label}
                </strong>

                <span
                  className="
text-xs
"
                >
                  {rel.status}
                </span>
              </div>

              <div
                className="
text-sm
mt-2
"
              >
                {other.name}
              </div>

              <p
                className="
text-xs
text-[#6F6858]
mt-2
"
              >
                {rel.reason}
              </p>

              <div
                className="
flex
gap-2
mt-3
"
              >
                <button
                  onClick={() => onUpdateRelationship(rel.id, "confirmed")}
                  className="
text-xs
px-2
py-1
rounded
bg-[#E4EFE1]
text-[#5E8A62]
"
                >
                  Confirm
                </button>

                <button
                  onClick={() => onUpdateRelationship(rel.id, "impossible")}
                  className="
text-xs
px-2
py-1
rounded
bg-[#F5E2DD]
text-[#BD5F51]
"
                >
                  Impossible
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
