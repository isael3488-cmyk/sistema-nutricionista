import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "NutriSaaS",
  description: "Plataforma SaaS moderna para nutricionistas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
