import { sampleGame } from "../data/sample-be";
import { sampleIds } from "../data/sample-ids";
import { gameToEntities } from "../lib/game-to-entities";

const e = gameToEntities(sampleGame);
const keys = Object.keys(e);
const counts = { suspect: 0, weapon: 0, location: 0, motive: 0 };
let boundsOk = true;

for (const ent of Object.values(e)) {
  counts[ent.type]++;
  if (ent.x < 50 || ent.x > 1100 || ent.y < 50 || ent.y > 1100) {
    boundsOk = false;
  }
}

console.log(
  JSON.stringify({ keyCount: keys.length, counts, boundsOk }, null, 2),
);

try {
  gameToEntities({ ...sampleGame, gameMetadata: sampleIds.metadata });
  console.error("expected throw for string metadata");
  process.exit(1);
} catch (err) {
  console.log("string metadata throws:", (err as Error).message);
}
