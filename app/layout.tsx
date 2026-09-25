import "./globals.css";
import { momoTrustDisplay, permanentMarker, playwriteVN } from "./fonts";

export const metadata = {
  title: "The Ashcombe Case",
  description: "Detective investigation board",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${permanentMarker.variable} ${momoTrustDisplay.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
