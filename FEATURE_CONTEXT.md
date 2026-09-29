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
- Lined note-paper styling (margin rule, push pin, ruled lines)

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

---

# 11. Accusation and result reveal

## Accusation form

`AccusationForm` lets the player pick one suspect, weapon, location, and motive, then POSTs to `/api/game/[id]/result` with `IAnswer` (`game_id` + `answer` ids).

On success, the API returns `AppResponse<IAnswerResponse>`; the client stores `data.data` in Zustand (`resultResponse`).

## Result popup (`AccusationResultModal`)

After a successful submit, the form is replaced by a modal with four flip cards (2×2 grid):

- Categories: Suspect (murder), Weapon, Motive, Location.
- Each card starts face-down; one tap reveals the chosen entity name and Correct/Wrong from `IAnswerResponse` (`murder`, `weapon`, `motive`, `location` booleans).
- When all four cards are flipped, a summary appears: full congratulations if all are correct, otherwise “X of 4 correct” with **Try again** (returns to the form with prior selection).

Validation logic lives in `features/game/game.services.ts` (`validateResult`), comparing submitted ids to the stored game result.

---

# 12. Case load and game store

- Case page `app/case/[id]/page.tsx` fetches `GET /api/game/[id]`, then calls `setGame` on success.
- Supabase rows use `game_metadata`; `features/game/game.mapper.ts` maps that to `IGame.gameMetadata` in `game.repositories` before the API responds.
- Game tables have RLS enabled with **public SELECT** policies on case content (`games`, `game_metadata`, suspects, locations, weapons, motives, clues). Prisma-created tables also need `GRANT` for `anon` / `authenticated` (migration `20260928172000_game_public_read_rls`).
- **`results`** has no public read policy; `getResult` uses `infrastructure/supabase/service.ts` (service role) so answers are not exposed to the browser API.
- Zustand `useGameStore` starts with `game: null`; the intro **Start** control stays disabled until the fetch completes.
- `DetectiveBoard` reads `game` from the store and must call all hooks before any early return when `game` is missing.

---

# 13. User submissions

`user_submissions` stores one row per player per game. It is not seeded.

Columns match `IUserSubmission` in `features/submission/submission.schemas.ts`:

- Primary key is the pair `(user_id, game_id)`
- `game_id` (uuid foreign key to `games.id`, cascade delete)
- `user_id` (uuid foreign key to `users.id`, cascade delete)
- `time_taken` (integer)
- `created_at` (defaults to now)

`game_id` stays indexed for joins. Row level security is enabled. Authenticated users may select and insert only rows where `user_id = auth.uid()`.

Successful accusation inserts use the session user id from `getSessionUserId()` in the result API, not the client payload alone.

---

# 14. Users and authentication

## `users` table

Prisma model `User` maps to `users` and aligns with `features/user/user.schemas.ts`:

- `id` (uuid; matches `auth.users.id` for Google sign-in)
- `name`, `email` (unique), optional `avatar`
- `created_at`, `updated_at`

Seeded system user (see `sampleIds.user` in `data/sample-ids.ts`):

- id `b1000001-0001-4001-8001-000000000060`
- name `System`, email `system@deducto.local`
- Used as `games.creator_id` for the sample case

`games.creator` (text) was replaced by `games.creator_id` → `users.id` (`onDelete: Restrict`). API `IGame.creator` remains a string and holds the creator user id; `game.mapper.ts` reads `creator_id`.

## Google OAuth (Supabase)

- Browser client: `infrastructure/supabase/client.ts`
- Server client: `infrastructure/supabase/server.ts`
- Session refresh: root `proxy.ts` → `infrastructure/supabase/update-session.ts` (`getUser()` on matched routes)
- OAuth callback: `app/auth/callback/route.ts` exchanges the code, upserts `users` from Google metadata, redirects to `next` or `/`
- Sign-in UI: `IntroCard` → `signInWithGoogle()` in `features/user/user.sign-in.ts`
- **Start investigation** requires a signed-in user on the intro screen

Dashboard setup (manual):

- Enable Google provider under Authentication → Providers
- Add redirect URL `http://localhost:3000/auth/callback` (and production URL when deployed)

RLS on `users`: public read; authenticated insert/update only for `id = auth.uid()`.

Prisma-created tables need explicit `GRANT` for Supabase API roles (`anon`, `authenticated`, `service_role`); see migration `20260928171000_supabase_api_grants`.

---

# 15. Create game

## Flow

- Page: `app/create/page.tsx` → client `CreateGameWizard`.
- Signed-in users enter a prompt and difficulty, then **Generate case** (`POST /api/generate`).
- Bedrock returns `{ game, result }` (see `infrastructure/ai/system_prompt.md`). The service parses JSON via `lib/extract-json.ts` and validates with `generatedCaseSchema`.
- The draft lives in Zustand `store/create-game.store.ts`. Users edit overview fields, entities, clues (template-based), and the solution tuple.
- **Create case** validates with `createGameInputSchema` (Zod + reference checks), then `POST /api/game`.
- On success, Prisma creates `game_metadata` (nested suspects, weapons, locations, motives, clues), `games`, and `results` in one transaction. AI ids are remapped to new UUIDs in `features/game/game.repositories.ts` (`createGame`).
- Client redirects to `/case/{id}`.

## API

| Route | Method | Auth | Body | Response |
|-------|--------|------|------|----------|
| `/api/generate` | POST | required | `{ prompt, level }` | `AppResponse<IGeneratedCase>` |
| `/api/game` | POST | required | `ICreateGameInput` | `AppResponse<{ id }>` |

Schemas: `features/game/game.schemas.ts` (`generateRequestSchema`, `generatedCaseSchema`, `createGameInputSchema`).

## Clue templates

- `lib/clue-templates.ts` mirrors system prompt section 6.6 (E1–E4, L1–L4, R1–R4, A1, A2).
- `detectTemplate`, `buildClue`, and `resolveClueValueForSubmit` keep clue sentences aligned with entity names before save.
- UI: `components/create-game/ClueList.tsx`, `ClueEditor.tsx`; preview uses `clueToText` from `lib/clues.helper.ts`.

## UI components

- `components/create-game/`: `PromptPanel`, `GeneratingState`, `CaseEditor`, entity editors, `SolutionPicker`, `ValidationSummary`.
- Theme tokens match the detective board (`paper`, `ink`, `gold`, `line`).

## Notes

- Generation requires AWS Bedrock env vars (`AWS_REGION`, `BEDROCK_MODEL_ID`, credentials). `maxTokens` is 8192 in `infrastructure/ai/bedrock.ts`.
- Changing the solution after generation shows a warning; clues were generated for the original `result`.
- Entity counts are fixed after generation (no add/remove suspects/weapons/locations/motives).

---

# 16. Landing page

## Overview

- Route: `app/page.tsx` (marketing home, scrollable).
- Play flow: **Open a case** links to the seeded sample game (`lib/landing-constants.ts` → `/case/{sampleIds.game}`). Sign-in and **Start investigation** remain on `IntroCard` at `/case/[id]`.
- **Create a case** links to `/create`.

## Components

- `components/landing/`: `LandingNav`, `LandingHero`, `CaseGuide`, `LandingClose`, `OpenCaseLink`.
- Assets: `public/images/landing/hero-desk.png`, `guide-evidence.png`.

## Guide section

- Four steps (read clues → connect dots → deduce → solve) with scroll-driven crossfade via `IntersectionObserver` (no extra motion dependency).
- `prefers-reduced-motion`: all four steps shown in a static grid (`GuideReducedMotion`).

## Global scroll

- `body` in `app/globals.css` is scrollable for the landing page.
- Case play routes keep `h-screen overflow-hidden` on `main` / `DetectiveBoard` so the board does not scroll the document.

---

# 17. Case store

## Overview

- Route: `app/store/page.tsx` (`/store`).
- Catalog of detective cases with three collections via query `tab`: `public` (default), `solved`, `my`.
- Data loads on the server through `gameServices.findPublic`, `findSolved`, and `findByUserId` (same sources as `GET /api/game?tab=…`). Public tab does not require sign-in; solved and my require a session or show a Google sign-in empty state.

## UI

- `components/store/`: `StoreTabs`, `StoreShelf`, `CaseCard`, `StoreSignInEmpty`.
- `app/store/loading.tsx`: skeleton grid while the page loads.
- Search (`q` in the URL) filters the current tab’s list client-side by title, description, and creator.
- Price controls (free-only checkbox, min/max inputs) are present in the UI; filtering by price is not wired until cases expose a catalog price (see `listedSchema` in `game.schemas.ts`).
- Cards link to `/case/[id]`. Theme tokens match landing (`paper`, `ink`, `gold`, `line`, `rounded-card`).
- Landing nav includes a **Store** link (`components/landing/landing-nav.tsx`).
