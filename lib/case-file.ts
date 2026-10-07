const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const VICTIM_PATTERN = /^(.+?)\s+was\s+(?:found|discovered|killed|murdered)\b/i;

const HONORIFIC_SOURCE = "\\b(?:Dr|Mr|Mrs|Ms|Prof|St|Sr|Jr|Lt|Col|Gen)\\.\\s+";

export const UNNAMED_VICTIM = "Chưa xác định tên";

export interface CaseFileView {
  title: string;
  description: string;
  difficulty: string;
  victim: string;
}

export function formatDifficulty(level: string): string {
  const trimmed = level.trim();
  return DIFFICULTY_LABELS[trimmed.toLowerCase()] ?? (trimmed || "Unknown");
}

/**
 * Pull a victim phrase from the case description.
 * Cases do not store a separate victim field; the description names them.
 */
export function victimFromDescription(description: string): string | null {
  const text = description.replace(/\s+/g, " ").trim();
  const match = text.match(VICTIM_PATTERN);
  if (!match) return null;
  const lead = match[1].trim();
  if (lead.length < 2 || lead.length > 80) return null;
  const withoutHonorifics = lead.replace(new RegExp(HONORIFIC_SOURCE, "g"), "");
  if (/[.!?]/.test(withoutHonorifics)) return null;
  return lead;
}

export function caseFileFromGame(game: {
  title: string;
  description: string;
  level: string;
}): CaseFileView {
  const title = game.title.trim() || "Untitled case";
  const description = game.description.trim();
  return {
    title,
    description: description || "No description was filed for this case.",
    difficulty: formatDifficulty(game.level),
    victim: victimFromDescription(description) ?? UNNAMED_VICTIM,
  };
}
