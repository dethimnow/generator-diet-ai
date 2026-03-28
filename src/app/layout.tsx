import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Generator Diet AI — gotowa dieta w 60 sekund",
    template: "%s | Generator Diet AI",
  },
  description:
    "Wpisz swoje dane, wybierz cel i otrzymaj spersonalizowaną dietę na 7 dni oraz listę zakupów dopasowaną do Biedronki, Lidla i Żabki.",
  keywords: [
    "dieta AI",
    "generator diety",
    "keto",
    "low carb",
    "dieta pudełkowa",
    "dieta vikinga",
    "lista zakupów",
  ],
  openGraph: {
    title: "Generator Diet AI",
    description: "Spersonalizowana dieta i lista zakupów w minutę.",
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
    <html lang="pl" className={`${dmSans.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
