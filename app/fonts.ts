import {
  Momo_Trust_Display,
  Permanent_Marker,
  Playwrite_VN,
} from "next/font/google";

export const playwriteVN = Playwrite_VN({
  weight: "variable",
  display: "swap",
  variable: "--font-playwrite-vn",
});

export const momoTrustDisplay = Momo_Trust_Display({
  weight: "400",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-momo-trust-display",
});

export const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-permanent-marker",
});
