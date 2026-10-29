import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { SITE_NAME, SITE_TAGLINE } from "@/config/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const COLORS = {
  paper: "#fdfbf7",
  pencil: "#2d2d2d",
  marker: "#ff4d4d",
  erased: "#e5e0d8",
};

async function loadMaliBold() {
  return readFile(path.join(process.cwd(), "public/og/mali-bold.ttf"));
}

export default async function Image() {
  const font = await loadMaliBold();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: COLORS.paper,
          backgroundImage: `linear-gradient(${COLORS.erased} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.erased} 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: COLORS.marker,
              color: "#ffffff",
              fontSize: 44,
              fontFamily: "Mali",
              padding: "10px 32px",
              borderRadius: 18,
              transform: "rotate(-2deg)",
              boxShadow: `6px 6px 0 ${COLORS.pencil}22`,
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 84,
              lineHeight: 1.1,
              color: COLORS.pencil,
              fontFamily: "Mali",
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: `${COLORS.pencil}c0`,
              fontFamily: "Mali",
            }}
          >
            Kết nối chứng cứ — phán đoán hung thủ
          </div>
        </div>

        <div style={{ display: "flex", gap: 40 }}>
          {["Nghi phạm", "Chứng cứ", "Hung khí"].map((label, index) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                backgroundColor: "#ffffff",
                border: `3px solid ${COLORS.pencil}`,
                borderRadius: 14,
                padding: "14px 30px",
                fontSize: 30,
                color: COLORS.pencil,
                fontFamily: "Mali",
                transform: `rotate(${index % 2 === 0 ? -1.5 : 1.5}deg)`,
                boxShadow: `6px 6px 0 ${COLORS.pencil}20`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: COLORS.marker,
                }}
              />
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Mali",
          data: font,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
