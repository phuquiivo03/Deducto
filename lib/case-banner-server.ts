import fs from "node:fs";
import path from "node:path";

import type { IShortGame } from "@/features/game/game.schemas";

import { classifyBanner } from "./case-banner";

export function localPublicFileExists(src: string): boolean {
  if (classifyBanner(src) !== "local") return false;
  const publicRoot = path.resolve(process.cwd(), "public");
  const relative = src.replace(/^\/+/, "");
  const filePath = path.resolve(publicRoot, relative);
  const rootWithSep = publicRoot.endsWith(path.sep)
    ? publicRoot
    : `${publicRoot}${path.sep}`;
  if (filePath !== publicRoot && !filePath.startsWith(rootWithSep)) {
    return false;
  }
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Banner src safe to hand to a card.
 * Missing files under public/ become an empty string so the card
 * keeps its paper panel instead of a broken image.
 */
export function bannerForDisplay(banner: string | null | undefined): string {
  const src = banner?.trim() ?? "";
  const kind = classifyBanner(src);
  if (kind === "local") {
    return localPublicFileExists(src) ? src : "";
  }
  if (kind === "remote-allowed" || kind === "remote-other") return src;
  return "";
}

export function withDisplayBanners(games: IShortGame[]): IShortGame[] {
  return games.map((game) => ({
    ...game,
    banner: bannerForDisplay(game.banner),
  }));
}
