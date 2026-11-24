import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permette di caricare allegati (PDF, immagini) fino a 5 MB dai moduli.
  // La libreria delle notifiche va usata così com'è, senza impacchettarla.
  serverExternalPackages: ["web-push"],
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
