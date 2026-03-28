import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Generator Diet AI — dieta pod lodówkę i portfel w 60 sekund",
    template: "%s | Generator Diet AI",
  },
  description:
    "Przestań zastanawiać się „co na obiad”. AI ułoży jadłospis z produktów z Twojego sklepu — budżet i czas gotowania pod kontrolą.",
  keywords: [
    "dieta AI",
    "lista zakupów",
    "Biedronka",
    "Lidl",
    "Żabka",
    "keto",
    "dieta pudełkowa",
  ],
  openGraph: {
    title: "Generator Diet AI",
    description: "Plan żywienia dopasowany do lodówki, portfela i czasu.",
    locale: "pl_PL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${inter.variable} ${manrope.variable} h-full scroll-smooth antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
