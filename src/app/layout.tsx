import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vanguard Financial Engine — Bank Statement Analytics",
  description: "Institutional black & white financial statement analyzer and cash flow engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${poppins.className} bg-black text-white antialiased selection:bg-white selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
