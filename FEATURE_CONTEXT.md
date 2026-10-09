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
type EntityType = "suspect" | "weapon" | "location" | "motive";
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
|-- CaseBrief
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
- Profile control (avatar + name when signed in, Log in when signed out)

Input:

```ts
relationships;
title;
relationshipTotal;
```

`title` is the loaded case title. `relationshipTotal` is the number of true cross-type matches for that case (`relationshipCapacityForGame` in `lib/relationship-pairs.ts`), so the progress line is not a fixed "of 9".

Calculates:

```
confirmed relationships count
```

Signed-in profile opens a menu: **My cases** (`/store?tab=my`) and **Exit** (sign out). Signed-out **Log in** opens a modal with Google OAuth via `BoardProfile` in `board-profile.tsx`.

### CaseBrief.tsx

Pinned under `TopBar` for both board and grid.

Shows `caseFileFromGame(game).description` for the game in the store. The player can re-read that case’s premise without leaving the board. A blank description uses the same fallback as the intro card. The brief is not a sticky note and not a numbered clue.

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

Control board mode and show the investigation clock.

Modes:

```ts
board;

grid;
```

Clock:

- Starts when the player presses Start on the case intro (`startClock` in `useGameStore`)
- Ticks every second on the toolbar as `MM:SS`, or `HH:MM:SS` after one hour
- Stops when this session solves the case (`freezeClock`)
- The stopped elapsed seconds are sent as `time_taken` with the accusation

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
- Board zoom (25%–200%)

Zoom:

- Floating controls: zoom out, current percent (resets to 100%), zoom in
- Ctrl + scroll zooms toward the cursor
- Entity and note drags divide pointer movement by the current scale so cards stay under the cursor

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

`AccusationForm` lets the player pick one suspect, weapon, location, and motive, then POSTs to `/api/game/[id]/result` with `IAnswer` (`game_id` + `answer` ids). The route id is the case being graded. The body `user_id` is ignored.

The route only implements POST. There is no GET.

On success, the API returns `AppResponse<IAnswerResponse>`; the client stores `data.data` in Zustand (`resultResponse`).

`IAnswerResponse` is the whole accusation, not four field grades:

- `solved` — the four ids match the stored result
- `alreadySolved` — this player already closed the case, so this guess was not graded
- `attemptsUsed`, `attemptsRemaining`, `attemptLimit`

Unauthenticated calls are `401`. A malformed body or a `game_id` that does not match the route is `400`. An unknown case is `404`. The sixth accusation for that player and case is `429`. Responses use `cache-control: no-store` and do not include `murder`, `weapon`, `motive`, or `location` booleans.

## Result popup (`AccusationResultModal`)

After a successful submit, the form is replaced by a verdict dialog:

- It lists the four names the player chose, without marking any of them correct or wrong.
- A fresh solve says the accusation is correct.
- A miss says it is not correct, how many accusations remain, and that the verdict does not identify which part failed. **Try again** returns to the form while attempts remain.
- If the case was already solved, the dialog says this accusation was not checked.

Grading lives in `features/game/accusation-decision.ts` (`decideAccusation`). `features/game/accusation.handler.ts` is the HTTP boundary. `features/submission/accusation.repositories.ts` stores the attempt.

## Why the verdict is all or nothing

Easy cases have 3 choices in each category. Two responses that say which fields are correct identify the solution by elimination. The public response is therefore only solved or not solved. Each signed-in player gets 5 recorded accusations per case (`ACCUSATION_ATTEMPT_LIMIT`). That is enough to correct a bad final answer and far below the 81, 256, or 625 possible tuples.

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

A correct accusation inserts `user_submissions` in the same database transaction as the attempt, using the session user id. A later guess from that player is not compared to the solution.

## Accusation attempts

`accusation_attempts` stores every graded guess. It is not seeded.

- `id` (uuid)
- `user_id` (uuid, foreign key to `users.id`, cascade delete)
- `game_id` (uuid, foreign key to `games.id`, cascade delete)
- `murder_id`, `weapon_id`, `motive_id`, `location_id` (the guessed ids)
- `solved` (boolean; the whole tuple, not four field scores)
- `created_at`

Indexes: `(user_id, game_id)` and `game_id`. Row level security is enabled. Authenticated users may select only their own rows. They cannot insert, update, or delete through the API. The result route writes with Prisma inside a transaction locked by `pg_advisory_xact_lock`. A before-insert trigger rejects a sixth row for the same player and case. The lock key is the lowercase user id, a colon, and the lowercase game id.

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
- **Hybrid generation:** Bedrock (Nova 2 Lite) returns **story + entities only** — see `infrastructure/ai/system_prompt.md` (`aiCaseDraftSchema` in `features/game/game.schemas.ts`). `normalizeDraft` in `features/game/case-draft.ts` remaps short ids to UUIDs and fixes attribute distributions. `generateCaseLogic` in `features/game/case-generator.ts` builds a hidden world, A1 anchors, and clues, looping on `solveCase` until the tuple is unique. The API still responds with `{ game, result }` (`IGeneratedCase`). Story text is **Vietnamese**; schema enums stay English. Clue sentences are mixed VI/EN per `lib/clues.helper.ts`. Draft JSON is parsed via `lib/extract-json.ts`; invalid entity drafts retry once against Bedrock.
- The draft lives in Zustand `store/create-game.store.ts`. Users edit overview fields, entities, clues (template-based), and the solution tuple.
- While editing, `hooks/use-draft-solvability.ts` debounces (300ms) and runs `checkUniquelySolvable` on clues normalized via `prepareMetadataForSolver` (same as publish). `SolvabilityBanner` shows valid vs error copy in Vietnamese; **Tạo vụ án** stays disabled until status is `valid`.
- **Create case** validates with `createGameInputSchema` (Zod + reference checks), then `POST /api/game`.
- On the clue step the creator can lock any clue and pick a kind from `listPuzzleKinds()` (Scytale today). **Gợi ý khóa** selects one sensible clue (a clue the case cannot lose, otherwise the longest sentence a registered kind can wrap). The client sends `locks: [{ clueId, kind }]`. It does not send a cipher, a diameter, or a role.
- On success, Prisma creates `game_metadata` (nested suspects, weapons, locations, motives, clues), `games`, and `results` in one transaction. AI ids are remapped to new UUIDs in `features/game/game.repositories.ts` (`createGame`). Locked clues store the server-built `puzzle` jsonb.
- Client redirects to `/case/{id}`.

## API

| Route           | Method | Auth     | Body                | Response                      |
| --------------- | ------ | -------- | ------------------- | ----------------------------- |
| `/api/generate` | POST   | required | `{ prompt, level }` | `AppResponse<IGeneratedCase>` |
| `/api/game`     | POST   | required | `ICreateGameInput`  | `AppResponse<{ id }>`         |

Schemas: `features/game/game.schemas.ts` (`generateRequestSchema`, `aiCaseDraftSchema`, `parseAiCaseDraft`, `generatedCaseSchema`, `createGameInputSchema`).

## Unique solution gate

`features/game/case-solver.ts` checks a draft against the model in `infrastructure/ai/system_prompt.md` before it can be stored.

- Place, weapon, and motive are bijections from suspects. A weapon is found in the location of the suspect who holds it.
- Pair clues use the entity ids (the same ids the sentence renderer uses). Motive clues and crime-level anchors use `value`.
- Anchors are `ATTRIBUTE` + `REQUIRED` with no suspect, weapon, or location id. They constrain the murderer (`location`, `motive`, `handedness`, `hairColor`) or the murder weapon (`weight`, `material`).
- An entity fact (`ATTRIBUTE` + `EQUAL` on one card) does not narrow the grid. A fact that disagrees with that card is rejected.
- The solution is the tuple (murderer, their weapon, their location, their motive). Other guests may stay partly ambiguous.

`gameServices.generate` and `publishCase` (used by `gameServices.create`) call `assertUniquelySolvable`. A draft with no solution, more than one tuple, a clue the solver cannot read, or a saved answer that is not that tuple throws `CaseNotSolvableError`. The create wizard blocks **Tạo vụ án** until the live check is valid. `POST /api/game` still rejects that draft and stores nothing.

Groups larger than 6 are rejected instead of searching. Difficulty cases are size 3, 4, or 5.

## Homepage case

`data/sample-be.ts` (The Missing Sapphire) is the seeded case behind **Open a case**. The clues place Arthur, Eleanor, and Charles, tie the candlestick to the Library and the pocket knife to the Garden, rule the letter opener out for Charles, and rule three motives out for Violet. The last clue is the anchor “The location is Dining Room.” The only tuple is Lady Violet, the Silver Letter Opener, the Dining Room, and Greed. `data/sample-be.test.ts` locks that. Migration `20261005153000_fix_sample_case_clues` rewrites the row when it is already in the database.

## Clue templates

- `lib/clue-templates.ts` mirrors system prompt section 6.6 (E1–E4, L1–L4, R1–R4, A1, A2).
- `detectTemplate`, `buildClue`, and `resolveClueValueForSubmit` keep clue sentences aligned with entity names before save.
- UI: `components/create-game/ClueList.tsx`, `ClueEditor.tsx`; preview uses `clueToText` from `lib/clues.helper.ts`.

## UI components

- `components/create-game/`: `PromptPanel`, `GeneratingState`, `CaseEditor`, entity editors, `SolutionPicker`, `ValidationSummary`.
- Theme tokens match the detective board (`paper`, `ink`, `gold`, `line`).

## Notes

- Generation requires AWS Bedrock env vars (`AWS_REGION`, `BEDROCK_MODEL_ID`, credentials). `infrastructure/ai/bedrock.ts` sends the system prompt via Converse `system` (not inlined in the user message), `maxTokens` 4096, temperature 0.7.
- Changing the solution after generation shows a warning; clues were generated for the original `result`.
- Entity counts are fixed after generation (no add/remove suspects/weapons/locations/motives).

---

# 18. Design system (hand-drawn UI)

## Overview

- Source of truth: [`design.md`](design.md) (hand-drawn / sketchbook aesthetic).
- Tokens live in [`app/globals.css`](app/globals.css) via Tailwind v4 `@theme` (no `tailwind.config.ts`).
- Typography: **Mali** (headings, `--font-mali`, weight 700) and **Patrick Hand** (body, `--font-patrick-hand`) from [`app/fonts.ts`](app/fonts.ts). Both load the `vietnamese` subset. Kalam was replaced because Google Fonts ships it without Vietnamese glyphs, so accented headings fell back to a system font.

## Color tokens

| Token    | Role                                        |
| -------- | ------------------------------------------- |
| `paper`  | Warm page background + dot grid             |
| `pencil` | Primary text and borders                    |
| `erased` | Muted fills, dashed dividers                |
| `marker` | Correction-marker accent (errors, emphasis) |
| `pen`    | Ballpoint accent (links, confirmed state)   |
| `postit` | Sticky-note surfaces                        |
| `card`   | White surfaces                              |

## Shape and motion

- Wobbly radii: `rounded-wobbly`, `rounded-wobbly-md`, `rounded-wobbly-sm`.
- Hard shadows: `shadow-hard`, `shadow-hard-sm`, `shadow-hard-lg`, `shadow-paper` (no blur).
- Utility: `.wavy-underline` for nav/footer links.
- `prefers-reduced-motion` disables playful rotation/bounce globally.

## Shared UI primitives (`components/ui/`)

- `button.tsx` — primary / secondary / ghost + `buttonClassName()` for links.
- `Card.tsx` — optional `tape` / `tack` decoration, `postit` tone, tilt.
- `input.tsx` — `Input`, `Textarea`, `Select`.
- `sticky-tag.tsx`, `icon-circle.tsx`, `doodles.tsx`, `modal-shell.tsx`.

## Board status colors

Relationship strokes and grid cells map gameplay state to design tokens (see [`relationship-line-style.ts`](components/detective-board/relationship-line-style.ts)):

- **confirmed** → pen (`#2d5da1`)
- **impossible** → marker (`#ff4d4d`)
- **unknown** → pencil dashed
- **empty** → erased dotted

---

# 16. Landing page

## Overview

- Route: `app/page.tsx` (marketing home, scrollable).
- Play flow: **Open a case** links to the seeded sample game (`lib/landing-constants.ts` → `/case/{sampleIds.game}`). Sign-in and **Start investigation** remain on `IntroCard` at `/case/[id]`.
- **Create a case** links to `/create`.
- Shared chrome: [`Header`](components/layout/Header.tsx), [`SiteFooter`](components/layout/site-footer.tsx), `max-w-5xl` sections, hand-drawn hero doodles.

## Components

- `components/landing/`: `landing-hero`, `case-guide`, `landing-close`, `open-case-link`.
- Assets: `public/images/landing/hero-desk.png`.

## Guide section

- Four steps (read clues → connect dots → deduce → solve) as a static row of post-it cards.
- Each card shows the step number, a Lucide icon (search, waypoints, lightbulb, gavel), title, and body. No evidence image and no scroll-driven crossfade.
- Desktop (`lg`): one row of four. Below that: two columns, then a single column. Alternate tape/tack and a slight tilt.

## Global scroll

- `body` in `app/globals.css` is scrollable for the landing page (paper + dot grid).
- Case play routes keep `h-screen overflow-hidden` on `main` / `DetectiveBoard` so the board does not scroll the document.

---

# 17. Case store

## Overview

- Route: `app/store/page.tsx` (`/store`).
- Catalog of detective cases with three collections via query `tab`: `public` (default), `solved`, `my`.
- Data loads on the server through `gameServices.findPublic`, `findSolved`, and `findByUserId` (same sources as `GET /api/game?tab=…`). Public tab does not require sign-in; solved and my require a session or show a Google sign-in empty state.

## UI

- `components/store/`: `StoreTabs`, `StoreShelf`, `CaseCard`, `StoreSignInEmpty`.
- `app/store/loading.tsx`: wobbly skeleton grid while the page loads.
- Search (`q` in the URL) filters the current tab’s list client-side by title, description, and creator.
- Price controls (free-only checkbox, min/max inputs) are present in the UI; filtering by price is not wired until cases expose a catalog price (see `listedSchema` in `game.schemas.ts`).
- Case cards alternate tape/tack decoration with slight rotation on hover; tokens match the global hand-drawn system (`paper`, `pencil`, `pen`, `marker`, `postit`).
- Banner paths are passed through `withDisplayBanners` (`lib/case-banner-server.ts`). A local path that is not a file in `public/` is omitted, so the card keeps the blank paper panel. Other http(s) URLs render with a plain `img` that hides itself on error, because `next/image` only allows `lh3.googleusercontent.com`.
- Header nav includes **Store** and **Create** ([`components/layout/Header.tsx`](components/layout/Header.tsx)).

---

# 18. Account data and API errors

## Public creator fields

- `public.users` exposes `id`, `name`, and `avatar` to the Data API. A row is visible when it is the signed-in user or when that user has created a game.
- `email`, `created_at`, and `updated_at` are not granted to `anon` or `authenticated`. The auth callback still writes the signed-in user's email and returns `id, name, avatar`.
- Migration: `prisma/migrations/20261005120000_restrict_users_public_profile`.

## Auth callback

- `app/auth/callback/route.ts` accepts `next` only when `safeNextPath` resolves a single on-site path. Other values redirect to `/`.

## API errors

- Create, generate, result, case load, and solve-status handlers log the exception and return a fixed message via `publicApiFailure`. Client JSON does not include the thrown message.

# 19. The case you open is the case you play

## Case file

- `/case/[id]` loads the game on the server with `gameServices.getById`.
- `IntroCard` shows that game’s title, description, difficulty (`level`), and victim.
- There is no victim column. `victimFromDescription` in `lib/case-file.ts` reads a leading “was found / discovered / killed / murdered” phrase. If the description does not name one, the row says “Not named”.
- A missing game calls `notFound()` and renders `app/case/[id]/not-found.tsx` (“Case not found”). Other load failures render `error.tsx` (“Could not open this case”). The intro is not filled with sample copy.
- `GET /api/game/[id]` returns **404** when the game row is missing (`GameNotFoundError`) and **500** when the read itself fails.

## Board

- `TopBar` title is `game.title`. The denominator is `relationshipCapacityForGame` (one confirmed link per row in each of the six cross-type grids).
- `CaseBrief`, directly under `TopBar`, shows that case’s description on the board and in the grid. It stays on screen while cards, clues, and the inspector change.
- A fresh board starts with no sticky notes. The old “Probably Violet…” seed is not copied onto every case.
- Entity cards use `entityTypeLabel`. Motive cards say “Motive”.
- Grid headings cover suspect×motive, weapon×motive, and location×motive as well as the original three blocks.
- Opening a case resets `isSolved` before `/api/game/[id]/resolved` answers, so a previous solve does not stick to the next case.

---

# 20. Clue puzzles

## Two layers

- The solver still reads structured clues only. A puzzle is an optional `puzzle` object on the clue (`features/game/game.schemas.ts`). It does not change deduction.
- Ciphers are built in shared code from `clueToText`, never by the model. `gameServices.generate` calls `assertPuzzlesValid` after `assertUniquelySolvable` (generated drafts have no locks). `publishCase` does the same after it builds locks. A case with no locks passes that gate unchanged and stores clues with `puzzle` unset.
- Create flow: the wizard records `{ clueId, kind, hint }` only. The hint is required, trimmed, plain text, and at most 200 characters. Helper copy tells the creator to describe context and not add new facts. `buildCasePuzzles` ignores any client cipher or role, sanitizes the hint, computes `role` with `clueLockRole` (required when removing the clue breaks the unique solution, optional otherwise), then `generatePuzzle`. The hint is stored on the puzzle jsonb. The solver and `assertUniquelySolvable` do not read it. If a kind cannot wrap that sentence, or the hint is blank or too long, `POST /api/game` returns **400**. Nothing is stored. The wizard shows that message in the editor. Bedrock never emits puzzle fields.
- Older stored puzzles with no `hint` still parse. While a lock is unsolved, the board shows the hint instead of the clue sentence (or a plain sealed line when no hint was stored). After the player solves it, the clue sentence shows again. The hint is rendered as text, not HTML.

## Registry

- `features/puzzles/registry.ts` maps a kind to its generator, validator, flat ciphertext, and “does this tool decode the sentence?” check.
- `features/puzzles/registry-ui.tsx` maps a kind to its solve tool. `toolkit.tsx` is the shared popup: one tab per registered kind, the same flat ciphertext for every tool. It does not open on the stored kind. A wrong tool only changes the reading.
- `features/puzzles/schema.ts` is the zod union stored on the clue. `hint` is optional on that union.
- Scytale lives in `features/puzzles/scytale/`. Caesar lives in `features/puzzles/caesar/`.

### Adding a kind

1. Add `features/puzzles/<kind>/` with a zod schema, a player schema (no key), generator, validator, failure reason, `decodes`, `readingMatches`, `cipherText`, and a solve tool. The tool receives the flat ciphertext and reports its reading. It does not own the dialog.
2. Add both schemas to the unions in `features/puzzles/schema.ts`. Keep `hint` optional on the stored schema.
3. Register generate, validate, canGenerate, toPlayer, cipherText, decodes, readingMatches, label, and failureReason in `registry.ts`, and the tool in `registry-ui.tsx`.
4. `buildCasePuzzles` sets `role` (`required` or `optional`) from `clueLockRole` and copies the sanitized hint. `validateCasePuzzles` checks that role with the existing solver and ignores the hint. The create wizard and the solve toolkit both pick the new kind up from the registry. No wizard or popup edit.

## Scytale

- The sentence is written in rows of `columns` letters. The strip is the columns read downward. The player picks a diameter and reads the rows. The tool shows a flat strip and does not title itself as the clue’s cipher or display the stored diameter.
- Diameters `1` and `length` are the identity wrap, so they are excluded. Uniqueness is checked by trying every diameter from 2 through length − 1. A string that spells the sentence at two diameters is rejected. The generator walks outward from a near-square rod until it finds a unique one.

## Caesar

- Latin letters are shifted after Vietnamese diacritics are stripped and case is ignored. Other characters pass through. Shift `0` is the identity and is never stored. The generator hashes the normalized sentence to pick a shift in 1..25, then checks that only that shift restores the normalized sentence.
- The solve tool is the paper wheel: drag or arrow keys rotate the inner ring, and the plain box shows the decoding. The shift number is not shown.

## Toolkit

- One clue is encrypted with exactly one kind. The player gets every registered tool and the same flat ciphertext. Only the correct tool can produce the canonical sentence (normalized, for Caesar). The other tools produce a different reading and no error.
- The stored `kind` is still in the player payload, so a technical player can read it. The popup does not use it to choose the open tab. Hiding `kind` would need a payload change beyond this registry.

## Roles

- `required`: removing that clue leaves the case not uniquely solved.
- `optional`: removing that clue still leaves the one saved solution.
- The seeded sample locks the first clue (Arthur in the library) as required. `applySamplePuzzles` copies that lock onto the loaded sample case when the rendered sentences still match and the row has no puzzle of its own.
- The `clues.puzzle` jsonb column stores the full wrapper, including role, the optional hint, the scytale diameter, and the Caesar shift. No migration. Player progress is not saved.
- Before the case reaches the browser, `presentGameForPlayer` keeps `kind`, the flat ciphertext, and `hint`, and drops `role`, `columns`, and `shift`. `GET /api/game/[id]` and `/case/[id]` both do this. The board still derives the sentence from the structured clue, because that is how `clueToText` and the solve modal know the reading matches. The panel shows the hint until the puzzle is solved. The diameter and shift are not in that payload. `kind` is. A direct Data API read of `clues.puzzle` can still see the stored key, because the column is on the public-read `clues` table. Splitting it out would make `clues(*)` fail for the anon role, so case load would have to name every column. That migration is not in this change.

## Dev lab

- `/dev/puzzles` clones the create-page shell and uses only `data/sample-be.ts`. It is not in the header or footer. The page sets `noindex`.
- Pick a clue, choose required or optional, wrap it, read the validation report, and solve through the same toolkit the board opens. The embedded panel is the board's `CluePanel`.
