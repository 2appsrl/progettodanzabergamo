// Forma dei dati del sito. Dalla Fase 2 questi stessi dati arriveranno da Supabase.

export type Colore = "magenta" | "giallo" | "nero" | "rosa";

export type Sede = {
  id: string;
  nome: string;
  indirizzo: string;
  lat: number;
  lon: number;
};

export type Maestra = {
  id: string;
  nome: string;
  discipline: string;
  bio: string;
  colore: Colore;
};

export type Fascia = {
  id: string;
  etichetta: string;
  eta_min: number;
  eta_max: number | null; // null = senza limite (es. 15+)
};

export type Lezione = {
  giorno: number; // 1 = lunedì ... 6 = sabato
  inizio: string; // "16:30"
  fine: string;
};

export type Corso = {
  id: string;
  slug: string;
  nome: string;
  disciplina: string;
  insegnante: string;
  eta_min: number;
  eta_max: number | null;
  sede_id: string;
  colore: Colore;
  foto: string | null;
  descrizione: string;
  da_confermare?: boolean;
  lezioni: Lezione[];
};

export type Evento = {
  id: string;
  titolo: string;
  tipo: "Saggio" | "Evento" | "Stage";
  data: string; // AAAA-MM-GG
  luogo: string;
  descrizione: string;
  colore: Colore;
};

export type Scuola = {
  nome: string;
  motto: string;
  whatsapp: string; // numero con prefisso, senza +
  instagram: string;
  email: string;
};
