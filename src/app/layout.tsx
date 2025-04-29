import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootLayout from "@/components/layout/RootLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Farewell Shenanigans - Multiplayer Games",
  description: "Play multiplayer games with friends in real-time.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
