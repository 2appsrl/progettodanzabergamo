import type { Metadata } from "next";
import { TestataPagina } from "@/components/pubblico/TestataPagina";

export const metadata: Metadata = { title: "Cookie" };

export default function Cookie() {
  const h2 = "titolo mt-10 text-[34px]";
  return (
    <>
      <TestataPagina colore="rosa" titolo="Cookie">Solo l&apos;indispensabile.</TestataPagina>
      <div className="mx-auto max-w-3xl px-4 py-10 text-[17px] font-medium leading-relaxed sm:px-6">
        <p>Questo sito usa soltanto strumenti tecnici, necessari per funzionare. Non usiamo cookie di pubblicità, di profilazione o di statistica, quindi non ti chiediamo un consenso: ti informiamo e basta.</p>

        <h2 className={h2}>Cosa salviamo sul tuo dispositivo</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-6">
          <li><strong>Accesso alle aree riservate</strong>: un cookie tiene aperta la sessione dopo che sei entrata o entrato con la tua email.</li>
          <li><strong>Chi sono i tuoi figli</strong>: nelle pagine di conferma il telefono ricorda la tua scelta, così la volta dopo basta un tocco. Puoi cancellarla con il link &quot;Cambia&quot;.</li>
          <li><strong>Avviso cookie</strong>: ricordiamo che l&apos;hai già letto, per non mostrartelo di nuovo.</li>
          <li><strong>Notifiche</strong>: se le attivi, il telefono salva il collegamento per riceverle. Puoi disattivarle dal Profilo.</li>
        </ul>

        <h2 className={h2}>Servizi esterni</h2>
        <p className="mt-2">Nella pagina Contatti la mappa è fornita da OpenStreetMap e viene caricata solo quando tocchi &quot;Mostra la mappa&quot;. I link a WhatsApp e Instagram aprono quei servizi, che hanno regole proprie.</p>

        <h2 className={h2}>Come cancellare tutto</h2>
        <p className="mt-2">Dalle impostazioni del browser puoi cancellare cookie e dati dei siti in qualsiasi momento. Dovrai solo rientrare nelle aree riservate.</p>
      </div>
    </>
  );
}
