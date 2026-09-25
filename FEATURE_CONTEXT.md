# Feature Context: Detective Investigation Board

## 1. Feature Overview

Detective Investigation Board is an interactive visual investigation workspace.

Users can:

- View investigation clues
- Arrange suspects, weapons, and locations on a board
- Create relationships between entities
- Inspect evidence and relationships
- Add movable notes
- Switch between board view and grid view

The feature is implemented using:

- Next.js App Router
- React Client Components
- TypeScript
- Tailwind CSS

---

# 2. Core Concept

The application represents an investigation as a graph.

There are three main concepts:

## Entity

An entity is an investigation object.

Types:

```ts
type EntityType = "suspect" | "weapon" | "location";
```

Examples:

- Suspect:
  - Lady Violet
  - Professor Grant
  - Mr. Chen
- Weapon:
  - Crystal Dagger
  - Candlestick
  - Poison Vial
- Location:
  - Garden
  - Library
  - Conservatory

Each entity contains:

```ts
interface Entity {
  id: string;

  type: EntityType;

  name: string;

  meta: string;

  x: number;

  y: number;

  facts: Fact[];
}
```

`x` and `y` represent board coordinates.

# 3. Relationship System

Relationships connect two entities.

Structure:

```ts
interface Relationship {
  id: string;

  a: string;

  b: string;

  label: string;

  status: "confirmed" | "impossible" | "unknown";

  reason: string;
}
```

Example:

```
Lady Violet
|
|
HAS WEAPON
|
|
Crystal Dagger
```

Relationship status controls visualization:

### confirmed

- Green line
- Solid line

### impossible

- Red line
- Used to eliminate theories

### unknown

- Gray dashed line
- Needs investigation

# 4. Application Architecture

```
DetectiveBoard
|
|-- TopBar
|
|-- CluePanel
|
|-- BoardToolbar
|
|-- BoardCanvas
| |
| |-- ConnectionLines
| |
| |-- EntityCard
| |
| |-- StickyNote
|
|-- InspectorPanel
|
|-- GridView
|
|-- MobileNav
```

# 5. Component Responsibilities

### DetectiveBoard.tsx

Main controller.

Responsibilities:

- Store global state
- Manage selected entity
- Update entities
- Update relationships
- Update notes
- Switch board/grid mode

State:

```ts
entities;

relationships;

notes;

selected;

view;
```

Do not put visual UI logic here.

### TopBar.tsx

Purpose:

Display:

- Case title
- Investigation progress

Input:

```ts
relationships;
```

Calculates:

```
confirmed relationships count
```

### CluePanel.tsx

Purpose:

Display investigation clues.

Input:

```ts
clues[]
```

Actions:

Clicking clue selects related entity.

### BoardToolbar.tsx

Purpose:

Control board mode.

Modes:

```ts
board;

grid;
```

Future extensions:

- Add note
- Reset board
- Export board

### BoardCanvas.tsx

Main visual workspace.

Responsibilities:

Render:

- EntityCard
- StickyNote
- ConnectionLines

Owns:

- Entity position updates
- Note position updates

Coordinate system:

```
0,0
|
|
+-----------------
|
|
Board area
```

### EntityCard.tsx

Represents an entity on the board.

Features:

- Drag movement
- Selection
- Display facts summary

Important:

Entity position comes from:

```ts
entity.x;

entity.y;
```

Never store local position state.

The source of truth is:

```ts
DetectiveBoard.entities;
```

### StickyNote.tsx

Represents a user note.

Features:

- Drag
- Edit text
- Delete

Important:

The note position must update parent state:

```ts
onMove(x, y);
```

Never mutate note object directly.

### ConnectionLines.tsx

Responsible for SVG graph rendering.

Input:

```ts
entities;
relationships;
```

Calculates:

Start point:

```
entity.x + cardWidth/2
```

End point:

```
entity.y + cardHeight/2
```

### InspectorPanel.tsx

Shows selected entity information.

Displays:

- Entity metadata
- Facts
- Relationships

Actions:

Confirm relationship:

```
unknown
|
v
confirmed
```

Reject relationship:

```
unknown
|
v
impossible
```

### GridView.tsx

Alternative **cross-type relationship grids** (no full N×N — avoids duplicate pairs and same-type cells).

Input:

```ts
entities;
relationships;
onSetPairStatus(idA, idB, status);
```

Behavior:

- Three blocks: Suspects×Weapons, Suspects×Locations, Weapons×Locations.
- Each cell is one unique pair; no suspect×suspect, weapon×weapon, or mirrored A×B / B×A cells.
- Status: `confirmed` | `impossible` | `unknown`; click cycles unknown → confirmed → impossible → unknown.
- Upserts into `relationships[]` via parent callback (same source of truth as board lines and Inspector).

# 6. Data Flow

### Entity movement

User drags card:

```
EntityCard

↓

onMove()

↓

BoardCanvas

↓

setEntities()

↓

DetectiveBoard state

↓

React rerender
```

### Note movement

Flow:

```
StickyNote

↓

onMove(x,y)

↓

BoardCanvas

↓

setNotes()

↓

DetectiveBoard
```

### Relationship update

Flow:

```
InspectorPanel

↓

onUpdateRelationship()

↓

DetectiveBoard

↓

setRelationships()

↓

ConnectionLines update
```

# 7. File Responsibilities

```
src

├── data

│ └── detective-board.ts

│
├── types

│ └── detective.ts

│
├── hooks

│ └── useDrag.ts

│
└── components

    └── detective-board
```

# 8. Important Development Rules

### Rule 1

Do not manipulate DOM directly.

Avoid:

```ts
document.querySelector();

innerHTML;

classList;
```

Use:

```ts
state;

props;

conditional rendering
```

### Rule 2

Entity position belongs to data.

Wrong:

```ts
const [position, setPosition];
```

Correct:

```ts
entity.x;

entity.y;
```

### Rule 3

Relationship visualization must always derive from:

```
relationships[]
```

Do not create independent line state.

### Rule 4

Components should remain isolated.

Example:

EntityCard should not know:

- Inspector logic
- Relationship logic
- Global state

It only receives props.

# 10. AI Modification Instructions

When modifying this feature:

Always:

1. Preserve Entity / Relationship data model.
2. Keep components separated.
3. Keep state ownership inside DetectiveBoard.
4. Use TypeScript types.
5. Use Tailwind instead of CSS files.
6. Avoid direct DOM manipulation.

Before adding new feature:

Understand:

```
Data
↓
State
↓
Props
↓
Component
↓
UI
```

Any new interaction should follow React data flow.
