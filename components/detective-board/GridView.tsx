"use client";

import {
  entitiesOfType,
  getPairStatus,
  matrixBlockTitle,
  MATRIX_TYPE_PAIRS,
  nextRelationshipStatus,
} from "@/lib/relationship-pairs";

import { Entity, Relationship, RelationshipStatus } from "@/types/detective";

interface Props {
  entities: Record<string, Entity>;
  relationships: Relationship[];
  onSetPairStatus: (
    idA: string,
    idB: string,
    status: RelationshipStatus,
  ) => void;
}

const STATUS_CELL: Record<
  RelationshipStatus,
  { symbol: string; className: string }
> = {
  impossible: {
    symbol: "×",
    className: "bg-[#F5E2DD] border-[#BD5F51] text-[#BD5F51]",
  },
  unknown: {
    symbol: "?",
    className: "bg-white border-[#CBC2AC] border-dashed text-[#9C9482]",
  },
  confirmed: {
    symbol: "✓",
    className: "bg-[#E4EFE1] border-[#5E8A62] text-[#5E8A62]",
  },
  empty: {
    symbol: " ",
    className: "bg-white border-[#CBC2AC] border-dashed text-[#9C9482]",
  },
};

function handleCellClick(
  rowId: string,
  colId: string,
  relationships: Relationship[],
  onSetPairStatus: Props["onSetPairStatus"],
) {
  const current = getPairStatus(relationships, rowId, colId);
  const next = nextRelationshipStatus(current);
  onSetPairStatus(rowId, colId, next);
}

function EntityHeader({ entity }: { entity: Entity }) {
  return (
    <>
      <div
        className="
text-[10px]
uppercase
text-[#9C9482]
font-bold
truncate
"
      >
        {entity.type}
      </div>
      <div
        className="
font-semibold
font-display
truncate
"
        title={entity.name}
      >
        {entity.name}
      </div>
    </>
  );
}

function RelationshipBlock({
  rowEntities,
  colEntities,
  relationships,
  onSetPairStatus,
  title,
}: {
  rowEntities: Entity[];
  colEntities: Entity[];
  relationships: Relationship[];
  onSetPairStatus: Props["onSetPairStatus"];
  title: string;
}) {
  if (rowEntities.length === 0 || colEntities.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 last:mb-0">
      <h3
        className="
text-sm
font-semibold
font-display
text-[#6F6858]
mb-3
"
      >
        {title}
      </h3>
      <div className="overflow-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th
                className="
sticky
top-0
left-0
z-20
min-w-28
bg-[#F7F4ED]
border
border-[#E7DFCC]
p-2
"
                scope="col"
              />
              {colEntities.map((entity) => (
                <th
                  key={entity.id}
                  scope="col"
                  className="
sticky
top-0
z-10
min-w-11
max-w-20
bg-[#F7F4ED]
border
border-[#E7DFCC]
p-2
text-left
font-normal
"
                >
                  <EntityHeader entity={entity} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowEntities.map((row) => (
              <tr key={row.id}>
                <th
                  scope="row"
                  className="
sticky
left-0
z-10
min-w-28
bg-[#F7F4ED]
border
border-[#E7DFCC]
p-2
text-left
font-normal
"
                >
                  <EntityHeader entity={row} />
                </th>
                {colEntities.map((col) => {
                  const status = getPairStatus(relationships, row.id, col.id);
                  const cell = STATUS_CELL[status];

                  return (
                    <td
                      key={col.id}
                      className="
border
border-[#E7DFCC]
p-0.5
"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleCellClick(
                            row.id,
                            col.id,
                            relationships,
                            onSetPairStatus,
                          )
                        }
                        className={`
w-full
min-w-10
h-9
rounded
border
font-semibold
text-sm
transition-colors
hover:opacity-90
focus:outline-none
focus-visible:ring-2
focus-visible:ring-[#5E8A62]
${cell.className}
`}
                        aria-label={`${row.name} and ${col.name}: ${status}. Click to change.`}
                      >
                        {cell.symbol}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function GridView({
  entities,
  relationships,
  onSetPairStatus,
}: Props) {
  return (
    <div className="overflow-auto max-h-full space-y-2">
      {MATRIX_TYPE_PAIRS.map(([rowType, colType]) => (
        <RelationshipBlock
          key={`${rowType}-${colType}`}
          title={matrixBlockTitle(rowType, colType)}
          rowEntities={entitiesOfType(entities, rowType)}
          colEntities={entitiesOfType(entities, colType)}
          relationships={relationships}
          onSetPairStatus={onSetPairStatus}
        />
      ))}
    </div>
  );
}
