# Progetto Danza Bergamo

Sito pubblico + area maestre/genitori della scuola di danza.

- **Stack**: Next.js (App Router) + TypeScript + Tailwind, Supabase, Netlify.
- **Stato**: Fase 2 completata (contenuti da Supabase, area maestre con login via email, gestione corsi/orari, richieste di prova).
- Le pagine leggono i contenuti solo tramite `src/lib/dati.ts`; la struttura del database è in `supabase/migrations/`.

## Avvio in locale

```bash
npm install
npm run dev
```
