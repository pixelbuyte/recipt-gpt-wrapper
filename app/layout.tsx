import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Purchase Ping",
  description:
    "Personal control center for online purchases — receipts, return deadlines, warranties, and spending.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
