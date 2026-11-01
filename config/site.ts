import { env } from "./env";

// Canonical origin used for metadataBase, canonical URLs, sitemap and JSON-LD.
// SITE_URL wins, then NEXT_PUBLIC_SITE_URL, then the current production domain.
export const SITE_URL = (
	process.env.SITE_URL ||
	env.siteUrl ||
	"https://deducto-gamma.vercel.app"
).replace(/\/+$/, "");

export const siteUrl = (path = "/"): string => {
	return new URL(path, `${SITE_URL}/`).toString();
};

export const SITE_NAME = "Deducto";

export const SITE_TAGLINE = "Trò chơi suy luận, phá án online";

export const SITE_DESCRIPTION =
	"Xây dựng bảng điều tra, kết nối chứng cứ và phán đoán hung thủ. Chơi các case trinh sát do AI tạo ra hoặc tự tạo case của riêng bạn.";
