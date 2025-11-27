import type { Metadata } from "next";
import "./globals.css";
import FloatingIcon from "../components/FloatingIcon";

export const metadata: Metadata = {
  title:
    "iPay9 Reviews Australia | Trusted Casino Wallet & Gaming Platform Feedback",
  description:
    "Read authentic iPay9 reviews from Australian players. Discover how iPay9 helps users enjoy smooth, secure, and trusted online gaming experiences. Transparent feedback, trusted ratings, and real user experiences from across Australia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/review-icon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'Orbitron', monospace" }}
      >
        <div style={{ fontFamily: "'Orbitron', monospace" }}>{children}</div>

        {/* 🌟 Floating Icon (client component) */}
        <FloatingIcon />
      </body>
    </html>
  );
}
