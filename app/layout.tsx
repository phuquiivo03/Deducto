import "./globals.css";
import { momoTrustDisplay, permanentMarker, playwriteVN } from "./fonts";

export const metadata = {
	title: 'Deducto',
	description:
		'Build a detective board, connect the clues, and solve the case.',
}

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
