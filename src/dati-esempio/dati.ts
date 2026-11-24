// ============================================================
//  DATI DI ESEMPIO — NON REALI
//  Corsi, orari, indirizzi, eventi e numeri qui sotto sono inventati
//  per mostrare come funziona il sito. Dalla Fase 2 verranno sostituiti
//  dai dati veri inseriti dalle maestre nel database.
// ============================================================

import type { Corso, Evento, Fascia, Maestra, Scuola, Sede } from "@/lib/tipi";

export const DATI_DI_ESEMPIO = true;

export const scuola: Scuola = {
  nome: "Progetto Danza Bergamo",
  motto: "Una scuola. Tante storie in movimento.",
  whatsapp: "390000000000", // ESEMPIO: numero da sostituire
  instagram: "progetto_danza_bergamo",
  email: "info@esempio.it", // ESEMPIO
};

export const sedi: Sede[] = [
  { id: "gorle", nome: "Gorle", indirizzo: "Indirizzo da confermare, Gorle (BG)", lat: 45.7036, lon: 9.7139 },
  { id: "torre-boldone", nome: "Torre Boldone", indirizzo: "Indirizzo da confermare, Torre Boldone (BG)", lat: 45.7147, lon: 9.7083 },
];

export const maestre: Maestra[] = [
  {
    id: "valentina",
    nome: "Valentina",
    discipline: "Danza classica",
    bio: "Testo di esempio: qui Valentina racconta in due righe il suo percorso e come lavora con le allieve.",
    colore: "magenta",
  },
  {
    id: "roberta",
    nome: "Roberta",
    discipline: "Hip hop e modern",
    bio: "Testo di esempio: qui Roberta racconta in due righe il suo percorso e l'energia che porta in sala.",
    colore: "giallo",
  },
];

export const fasce: Fascia[] = [
  { id: "3-5", etichetta: "3–5", eta_min: 3, eta_max: 5 },
  { id: "6-8", etichetta: "6–8", eta_min: 6, eta_max: 8 },
  { id: "9-11", etichetta: "9–11", eta_min: 9, eta_max: 11 },
  { id: "12-14", etichetta: "12–14", eta_min: 12, eta_max: 14 },
  { id: "15", etichetta: "15+", eta_min: 15, eta_max: null },
];

export const corsi: Corso[] = [
  {
    id: "c1", slug: "gioco-danza", nome: "Gioco danza", disciplina: "Danza classica", insegnante: "Valentina",
    eta_min: 3, eta_max: 5, sede_id: "gorle", colore: "giallo", foto: null,
    descrizione: "Il primo incontro con la danza: musica, gioco e movimento per le più piccole e i più piccoli.",
    lezioni: [{ giorno: 1, inizio: "16:30", fine: "17:15" }, { giorno: 4, inizio: "16:30", fine: "17:15" }],
  },
  {
    id: "c2", slug: "classica-propedeutica", nome: "Classica propedeutica", disciplina: "Danza classica", insegnante: "Valentina",
    eta_min: 6, eta_max: 8, sede_id: "gorle", colore: "magenta", foto: null,
    descrizione: "Le basi della danza classica: postura, ritmo e i primi passi alla sbarra.",
    lezioni: [{ giorno: 2, inizio: "17:00", fine: "18:00" }, { giorno: 5, inizio: "17:00", fine: "18:00" }],
  },
  {
    id: "c3", slug: "hip-hop-kids", nome: "Hip hop kids", disciplina: "Hip hop", insegnante: "Roberta",
    eta_min: 6, eta_max: 8, sede_id: "torre-boldone", colore: "nero", foto: null,
    descrizione: "Groove, coordinazione e tanto divertimento sulle basi dell'hip hop.",
    lezioni: [{ giorno: 2, inizio: "17:00", fine: "18:00" }, { giorno: 4, inizio: "17:00", fine: "18:00" }],
  },
  {
    id: "c4", slug: "classica-1", nome: "Classica 1", disciplina: "Danza classica", insegnante: "Valentina",
    eta_min: 9, eta_max: 11, sede_id: "torre-boldone", colore: "rosa", foto: null,
    descrizione: "Tecnica classica con sbarra e centro, per chi ha già qualche anno di studio.",
    lezioni: [{ giorno: 1, inizio: "17:30", fine: "18:45" }, { giorno: 3, inizio: "17:30", fine: "18:45" }],
  },
  {
    id: "c5", slug: "hip-hop-junior", nome: "Hip hop junior", disciplina: "Hip hop", insegnante: "Roberta",
    eta_min: 9, eta_max: 11, sede_id: "gorle", colore: "giallo", foto: null,
    descrizione: "Coreografie, stili e freestyle per crescere insieme al gruppo.",
    lezioni: [{ giorno: 1, inizio: "18:00", fine: "19:00" }, { giorno: 3, inizio: "18:00", fine: "19:00" }],
  },
  {
    id: "c6", slug: "classica-2", nome: "Classica 2", disciplina: "Danza classica", insegnante: "Valentina",
    eta_min: 12, eta_max: 14, sede_id: "gorle", colore: "magenta", foto: null,
    descrizione: "Tecnica intermedia e avvicinamento alle punte, con preparazione al saggio.",
    lezioni: [{ giorno: 2, inizio: "18:15", fine: "19:45" }, { giorno: 4, inizio: "18:15", fine: "19:45" }],
  },
  {
    id: "c7", slug: "hip-hop-teen", nome: "Hip hop teen", disciplina: "Hip hop", insegnante: "Roberta",
    eta_min: 12, eta_max: 14, sede_id: "torre-boldone", colore: "nero", foto: null,
    descrizione: "Coreografie più complesse, lavoro di gruppo ed esibizioni.",
    lezioni: [{ giorno: 2, inizio: "18:15", fine: "19:30" }, { giorno: 5, inizio: "18:15", fine: "19:30" }],
  },
  {
    id: "c8", slug: "modern-teen", nome: "Modern teen", disciplina: "Modern", insegnante: "Roberta",
    eta_min: 12, eta_max: 14, sede_id: "gorle", colore: "rosa", foto: null,
    descrizione: "Movimento fluido, espressività e lavoro a terra.",
    lezioni: [{ giorno: 3, inizio: "19:15", fine: "20:30" }],
  },
  {
    id: "c9", slug: "classica-avanzato", nome: "Classica avanzato", disciplina: "Danza classica", insegnante: "Valentina",
    eta_min: 15, eta_max: null, sede_id: "torre-boldone", colore: "magenta", foto: null,
    descrizione: "Tecnica avanzata, punte e repertorio.",
    lezioni: [{ giorno: 3, inizio: "19:00", fine: "20:30" }, { giorno: 5, inizio: "19:00", fine: "20:30" }],
  },
  {
    id: "c10", slug: "modern", nome: "Modern", disciplina: "Modern", insegnante: "Roberta",
    eta_min: 15, eta_max: null, sede_id: "gorle", colore: "giallo", foto: null,
    descrizione: "Tecnica modern e laboratorio coreografico per ragazze, ragazzi e adulti.",
    lezioni: [{ giorno: 1, inizio: "19:30", fine: "21:00" }, { giorno: 4, inizio: "19:45", fine: "21:15" }],
  },
  {
    id: "c11", slug: "hip-hop-open", nome: "Hip hop open", disciplina: "Hip hop", insegnante: "Roberta",
    eta_min: 15, eta_max: null, sede_id: "torre-boldone", colore: "nero", foto: null,
    descrizione: "Classe aperta del sabato: stili, coreografia e freestyle.",
    lezioni: [{ giorno: 6, inizio: "11:30", fine: "13:00" }],
  },
  {
    id: "c12", slug: "aerial-hoop", nome: "Aerial hoop", disciplina: "Aerial hoop", insegnante: "Da confermare",
    eta_min: 9, eta_max: null, sede_id: "gorle", colore: "rosa", foto: null, da_confermare: true,
    descrizione: "Danza aerea sul cerchio: forza, equilibrio ed eleganza. Corso da confermare.",
    lezioni: [{ giorno: 6, inizio: "10:00", fine: "11:15" }],
  },
];

export const eventi: Evento[] = [
  {
    id: "e1", titolo: "Lezioni aperte di Natale", tipo: "Evento", data: "2026-12-19", luogo: "Sede di Gorle",
    descrizione: "I genitori entrano in sala per vedere una lezione.", colore: "giallo",
  },
  {
    id: "e2", titolo: "Stage di hip hop", tipo: "Stage", data: "2027-03-13", luogo: "Sede di Torre Boldone",
    descrizione: "Un pomeriggio con un'insegnante ospite.", colore: "nero",
  },
  {
    id: "e3", titolo: "Saggio di fine anno", tipo: "Saggio", data: "2027-06-05", luogo: "Teatro da confermare",
    descrizione: "Tutti i corsi sul palco per lo spettacolo finale.", colore: "magenta",
  },
];
