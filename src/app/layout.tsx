import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stellar.ai — Work Smarter. Move Faster. AI Powers You Up.",
  description: "Intelligent automation syncs with the tools you love to streamline tasks, boost output, and save time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased selection:bg-black selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
