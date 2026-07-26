import type { Metadata, Viewport } from "next";
import { Averia_Serif_Libre } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import TopLoader from "@/components/TopLoader";
import NavigationProgressHandler from "@/components/NavigationProgressHandler";
import "./globals.css";

const averiaSerifLibre = Averia_Serif_Libre({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Chain - Word duel",
  description:
    "A live 2-player word game. Match letters, race the clock, and out-spell your opponent in real time.",
  keywords: ["word game", "multiplayer", "real-time", "chain letters", "word duel", "browser game", "puzzle"],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Chain - Word duel",
    description: "A live 2-player word game with tile-flip feedback and a race-the-clock twist.",
    url: '/',
    siteName: 'Chain Letters',
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chain - Word duel",
    description: "A live 2-player word game. Match letters, race the clock, and out-spell your opponent.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Chain Letters",
    "description": "A live 2-player word game. Match letters, race the clock, and out-spell your opponent in real time.",
    "playMode": "MultiPlayer",
    "genre": ["Word Game", "Puzzle"],
    "applicationCategory": "GameApplication",
    "operatingSystem": "Any",
    "url": baseUrl
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${averiaSerifLibre.className} bg-white dark:bg-zinc-900`}>
        <TopLoader />
        <NavigationProgressHandler />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
