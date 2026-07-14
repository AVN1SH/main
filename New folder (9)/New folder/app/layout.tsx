import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jump Over – Altitude Challenge",
  description: "A fast-paced vertical jumping game. How high can you go?",
};

// Lock the viewport: fills screen edge-to-edge, no pinch-zoom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fredoka.variable}>
      <head>
        {/*
         * ── YouTube Playables SDK ──────────────────────────────────────────
         * MUST be the very first script loaded.  The SDK sets up the global
         * `ytgame` object before any game code runs.
         */}
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script
          src="https://www.youtube.com/s/gaming/playables/2.2.0/api_web_games_sdk.js"
        // strategy="beforeInteractive" is not valid in <head> outside _document,
        // so we use a plain <script> tag which Next.js hoists correctly.
        />

        {/*
         * ── Lottie player ─────────────────────────────────────────────────
         * Loaded as a module so it self-registers the <dotlottie-player> tag.
         */}
        <script
          src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"
          type="module"
        />

        {/*
         * ── Game-asset preloads ────────────────────────────────────────────
         * Hint to the browser to start fetching the most critical assets before
         * the Phaser loader even boots.  This dramatically reduces the chance of
         * visible pop-in during early gameplay.
         *
         * Sounds are handled by Howler's own preloading; we only hint the
         * images/SVGs used in the UI layer here.
         */}

        {/* Map 1 — backgrounds + player */}
        <link rel="preload" as="image" href="./game-assets/map-1/environment/background_tall.svg" />
        <link rel="preload" as="image" href="./game-assets/map-1/characters/white_sheep.svg" />

        {/* Map 2 — backgrounds + player */}
        <link rel="preload" as="image" href="./game-assets/map-2/background/background_tall.svg" />
        <link rel="preload" as="image" href="./game-assets/map-2/characters/parrot.svg" />

        {/* Map 3 — backgrounds + player */}
        <link rel="preload" as="image" href="./game-assets/map-3/environment/background.svg" />
        <link rel="preload" as="image" href="./game-assets/map-3/characters/demon.svg" />

        {/* Lobby map-card thumbnails */}
        <link rel="preload" as="image" href="./game-assets/map-1/environment/background_wide.svg" />

        {/* In-game UI icons (used during gameplay) */}
        <link rel="preload" as="image" href="./game-assets/map-1/items/heart.svg" />
        <link rel="preload" as="image" href="./icons/coin.png" />
        <link rel="preload" as="image" href="./icons/trophy.png" />
        <link rel="preload" as="image" href="./icons/star-golden.png" />
        <link rel="preload" as="image" href="./icons/skull.png" />
        <link rel="preload" as="image" href="./icons/crown.png" />
        <link rel="preload" as="image" href="./icons/house.png" />
        <link rel="preload" as="image" href="./icons/music-on.png" />
        <link rel="preload" as="image" href="./icons/music-off.png" />
      </head>
      <body suppressHydrationWarning className="font-sans">
        {children}
      </body>
    </html>
  );
}
