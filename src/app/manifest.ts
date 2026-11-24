import type { MetadataRoute } from "next";

// Dice al telefono come installare il sito come un'app (nome, colori, icone).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Progetto Danza Bergamo",
    short_name: "Danza Bergamo",
    description: "Avvisi, calendario e conferme della scuola di danza.",
    start_url: "/genitori",
    display: "standalone",
    background_color: "#d13583",
    theme_color: "#d13583",
    lang: "it",
    icons: [
      { src: "/icona-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icona-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icona-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
