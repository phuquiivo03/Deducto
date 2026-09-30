"use client";

import { Entity, Relationship, RelationshipStatus } from "@/types/detective";

interface Props {
  entity?: Entity;

  relationships: Relationship[];

  entities: Record<string, Entity>;

  onUpdateRelationship: (id: string, status: RelationshipStatus) => void;
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
bg-card
border-l
border-erased
p-5
"
      >
        <h3
          className="
font-semibold
font-heading
"
        >
          Inspector
        </h3>

        <p
          className="
text-sm
text-pencil/70
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
bg-card
border-l
border-erased
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
text-pencil/60
font-bold
"
        >
          {entity.type}
        </div>

        <h2
          className="
text-xl
font-semibold
font-heading
"
        >
          {entity.name}
        </h2>

        <p
          className="
text-sm
text-pencil/70
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
border-erased
rounded-wobbly-sm
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
text-pencil/70
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
bg-pen/10
text-pen
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
bg-marker/10
text-marker
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
