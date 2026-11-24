import type { Metadata, Viewport } from "next";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/barlow-condensed/900.css";
import "./globals.css";

// Indirizzo del sito: sta in un solo posto, così cambiare dominio è semplice.
const SITO = process.env.NEXT_PUBLIC_SITE_URL ?? "https://progettodanza.2app.it";

export const metadata: Metadata = {
  metadataBase: new URL(SITO),
  title: { default: "Progetto Danza Bergamo", template: "%s · Progetto Danza Bergamo" },
  description: "Una scuola. Tante storie in movimento. Corsi di danza dai 3 anni a Gorle e Torre Boldone.",
  // Finché il sito è dimostrativo chiediamo a Google di non indicizzarlo.
  robots: { index: false, follow: false },
  // Per installare il sito sul telefono come un'app.
  appleWebApp: { capable: true, title: "Danza Bergamo", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#d13583", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="antialiased">
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
