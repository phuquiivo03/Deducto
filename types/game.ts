export interface Item {
  id: string;
  emoji: string;
  name: string;
  detail: string;
}

export interface Clue {
  t: string;
  d: string;
}

export interface Solution {
  suspect: string;
  evidence: string;
  place: string;
}
