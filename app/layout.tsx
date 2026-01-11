import type { Metadata } from "next";
import { Geist, Geist_Mono, Righteous, Fredoka } from "next/font/google";
import "./globals.css";

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-righteous",
});

const fredoka = Fredoka({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fredoka",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Les Rires de Yasmine ☮️ | Groovy Vibes",
  description: "Application psychédélique permettant d'écouter les différents types de rire de Yasmine dans une ambiance rétro années 70 - Peace, Love & Laughter!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${righteous.variable} ${fredoka.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
