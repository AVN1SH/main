import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css"; // Global styles

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Google AI Studio App",
  description: "My Google AI Studio App",
};

// Locks the layout viewport to the device width and disables pinch-zoom so
// the game frame always fills the real screen edge-to-edge in real time
// (instead of the user being able to zoom/pan and expose empty canvas), and
// `viewport-fit=cover` extends the canvas under notches/home-indicators on
// modern phones so nothing is cropped.
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
        {/* Preload UI icons used across the app */}
        <link rel="preload" as="image" href="/icons/music-on.png" />
        <link rel="preload" as="image" href="/icons/music-off.png" />
        <link rel="preload" as="image" href="/icons/sound-on.png" />
        <link rel="preload" as="image" href="/icons/sound-off.png" />
        <link rel="preload" as="image" href="/icons/settings.png" />
        <link rel="preload" as="image" href="/icons/star-golden.png" />
        <link rel="preload" as="image" href="/icons/star-white.png" />
        <link rel="preload" as="image" href="/icons/trophy.png" />
        <link rel="preload" as="image" href="/icons/house.png" />
        <link rel="preload" as="image" href="/icons/skull.png" />
        <link rel="preload" as="image" href="/icons/crown.png" />
        <link rel="preload" as="image" href="/icons/stats.png" />
        <link rel="preload" as="image" href="/icons/checkmark.png" />
        <link rel="preload" as="image" href="/icons/close.png" />
      </head>
      <body suppressHydrationWarning className="font-sans">
        {children}
      </body>
    </html>
  );
}
