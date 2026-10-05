export type BannerKind =
  | "empty"
  | "local"
  | "remote-allowed"
  | "remote-other"
  | "invalid";

const ALLOWED_REMOTE_HOSTS = new Set(["lh3.googleusercontent.com"]);

function isSafeLocalAssetPath(src: string): boolean {
  if (!src.startsWith("/") || src.startsWith("//")) return false;
  if (src.includes("\\") || src.includes("\0") || src.includes("?")) {
    return false;
  }
  const parts = src.split("/");
  return parts.every((part) => part !== ".." && part !== ".");
}

/** Classify a catalog banner before it is rendered. */
export function classifyBanner(raw: string | null | undefined): BannerKind {
  const src = raw?.trim() ?? "";
  if (!src) return "empty";
  if (src.startsWith("/") && !src.startsWith("//")) {
    return isSafeLocalAssetPath(src) ? "local" : "invalid";
  }
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return "invalid";
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return "invalid";
  if (ALLOWED_REMOTE_HOSTS.has(url.hostname)) return "remote-allowed";
  return "remote-other";
}

/** next/image may load local files and hosts listed in next.config. */
export function canUseNextImage(kind: BannerKind): boolean {
  return kind === "local" || kind === "remote-allowed";
}
