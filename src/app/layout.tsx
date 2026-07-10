import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-grid-layout/css/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Dashboard Builder",
  description: "Upload data and generate AI-powered dashboards",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
