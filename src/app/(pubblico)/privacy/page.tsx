import type { Metadata } from "next";
import { TestataPagina } from "@/components/pubblico/TestataPagina";
import { VERSIONE_INFORMATIVA } from "@/lib/certificati";
import { getScuola } from "@/lib/dati";

export const metadata: Metadata = { title: "Privacy" };

// BOZZA di informativa: i punti segnati "da completare" vanno riempiti dalla scuola
// e il testo va fatto rivedere da un consulente prima dell'uso con dati veri.
export default async function Privacy() {
  const scuola = await getScuola();
  const h2 = "titolo mt-10 text-[34px]";
  const daCompletare = (t: string) => <mark className="rounded bg-giallo px-1.5 font-bold">[{t}]</mark>;
  return (
    <>
      <TestataPagina colore="rosa" titolo="Privacy">Come trattiamo i dati delle famiglie e delle allieve.</TestataPagina>
      <div className="mx-auto max-w-3xl px-4 py-10 text-[17px] font-medium leading-relaxed sm:px-6">
        <p className="rounded-card bg-giallo p-5 font-bold">Bozza, versione {VERSIONE_INFORMATIVA}. I punti evidenziati sono da completare e il testo va verificato con un consulente privacy prima di usare il sito con dati reali.</p>

        <h2 className={h2}>Chi tratta i dati</h2>
        <p className="mt-2">Il titolare del trattamento è {scuola.nome}, {daCompletare("ragione sociale, sede legale, codice fiscale o partita IVA")}. Per qualsiasi richiesta: {daCompletare("email di contatto per la privacy")}.</p>

        <h2 className={h2}>Quali dati raccogliamo</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-6">
          <li><strong>Richiesta di prova</strong>: nome del genitore, telefono, nome ed età di chi balla, corso scelto.</li>
          <li><strong>Iscrizione</strong>: nome, cognome e data di nascita dell&apos;allieva o dell&apos;allievo; nome, telefono ed email del genitore; corsi frequentati.</li>
          <li><strong>Vita della scuola</strong>: risposte alle richieste di conferma, avvisi letti.</li>
          <li><strong>Certificato medico</strong>: data di scadenza e copia del certificato. È un dato relativo alla salute e lo trattiamo con particolare attenzione.</li>
          <li><strong>Foto e video</strong>: solo se hai dato il consenso.</li>
        </ul>

        <h2 className={h2}>Perché li usiamo</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-6">
          <li>Per organizzare corsi, lezioni, prove e saggi e per comunicare con le famiglie (esecuzione del rapporto con la scuola).</li>
          <li>Per verificare l&apos;idoneità all&apos;attività sportiva tramite il certificato medico (obbligo di legge).</li>
          <li>Per pubblicare foto e video sul sito e sui canali social della scuola, <strong>solo con il tuo consenso</strong>.</li>
        </ul>

        <h2 className={h2}>Foto e video di minori</h2>
        <p className="mt-2">Pubblichiamo immagini di bambine, bambini e ragazzi solo se un genitore ha dato il consenso dall&apos;area genitori. Il consenso è facoltativo, non condiziona l&apos;iscrizione e si può togliere in ogni momento dalla pagina Profilo: da quel momento non pubblichiamo nuove immagini e, su richiesta, rimuoviamo quelle già pubblicate. Di ogni scelta conserviamo data, ora e versione di questa informativa.</p>

        <h2 className={h2}>Chi può vedere i dati</h2>
        <p className="mt-2">Le insegnanti della scuola vedono i dati di tutte le allieve. Ogni genitore vede solo i dati dei propri figli. Nelle pagine di conferma condivise su WhatsApp compare l&apos;elenco delle allieve del corso con nome e iniziale del cognome.</p>
        <p className="mt-2">Per far funzionare il sito usiamo fornitori esterni che trattano i dati per nostro conto: Supabase (database e file, server nell&apos;Unione Europea) e Netlify (pubblicazione del sito). {daCompletare("verificare e indicare eventuali trasferimenti fuori dall'UE e altri fornitori, es. servizio email")}</p>

        <h2 className={h2}>Per quanto tempo</h2>
        <p className="mt-2">Conserviamo i dati per la durata dell&apos;iscrizione e {daCompletare("periodo di conservazione dopo la fine dell'iscrizione")}. Le richieste di prova non seguite da iscrizione vengono cancellate entro {daCompletare("periodo")}.</p>

        <h2 className={h2}>I tuoi diritti</h2>
        <p className="mt-2">Puoi chiederci in ogni momento di vedere, correggere o cancellare i tuoi dati e quelli dei tuoi figli, di limitarne l&apos;uso o di riceverne una copia. Puoi anche presentare un reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).</p>
      </div>
    </>
  );
}
