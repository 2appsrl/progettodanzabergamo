-- ============================================================
--  FASE 2 — Struttura base del database
--  Contenuti del sito pubblico + richieste di prova + elenco maestre.
--  Regola generale (Row Level Security):
--    - chiunque può LEGGERE i contenuti pubblici (corsi, orari, sedi...)
--    - solo le maestre possono MODIFICARLI
--    - chiunque può INVIARE una richiesta di prova, solo le maestre le leggono
-- ============================================================

create schema if not exists privato;

-- Chi può entrare nell'area maestre: basta che l'email sia in questo elenco.
create table public.maestre (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  nome text not null,
  creato_il timestamptz not null default now()
);

-- Vero se l'utente collegato è una maestra. Sta in uno schema non esposto.
create or replace function privato.e_maestra()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.maestre m
    where m.email = lower((select auth.jwt() ->> 'email'))
  );
$$;
revoke all on function privato.e_maestra() from public;
grant usage on schema privato to authenticated, anon;
grant execute on function privato.e_maestra() to authenticated, anon;

-- Dati generali della scuola (una sola riga)
create table public.scuola (
  id boolean primary key default true check (id),
  nome text not null,
  motto text not null,
  whatsapp text not null default '',
  instagram text not null default '',
  email text not null default ''
);

create table public.sedi (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  indirizzo text not null default '',
  lat double precision,
  lon double precision,
  ordine int not null default 0
);

-- Scheda pubblica delle insegnanti (pagina "Chi siamo")
create table public.insegnanti (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  discipline text not null default '',
  bio text not null default '',
  colore text not null default 'magenta' check (colore in ('magenta','giallo','nero','rosa')),
  foto text,
  ordine int not null default 0
);

create table public.fasce_eta (
  id uuid primary key default gen_random_uuid(),
  etichetta text not null,
  eta_min int not null check (eta_min >= 0),
  eta_max int check (eta_max is null or eta_max >= eta_min), -- vuoto = senza limite (15+)
  ordine int not null default 0
);

create table public.corsi (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nome text not null,
  disciplina text not null,
  insegnante text not null default '',
  eta_min int not null check (eta_min >= 0),
  eta_max int check (eta_max is null or eta_max >= eta_min),
  sede_id uuid references public.sedi(id) on delete set null,
  colore text not null default 'magenta' check (colore in ('magenta','giallo','nero','rosa')),
  foto text,
  descrizione text not null default '',
  da_confermare boolean not null default false,
  pubblicato boolean not null default true,
  ordine int not null default 0,
  creato_il timestamptz not null default now()
);
create index corsi_sede_idx on public.corsi(sede_id);

create table public.lezioni_settimanali (
  id uuid primary key default gen_random_uuid(),
  corso_id uuid not null references public.corsi(id) on delete cascade,
  giorno int not null check (giorno between 1 and 6), -- 1 = lunedì ... 6 = sabato
  ora_inizio time not null,
  ora_fine time not null,
  check (ora_fine > ora_inizio)
);
create index lezioni_corso_idx on public.lezioni_settimanali(corso_id);

create table public.eventi (
  id uuid primary key default gen_random_uuid(),
  titolo text not null,
  tipo text not null default 'Evento' check (tipo in ('Saggio','Evento','Stage')),
  data date not null,
  luogo text not null default '',
  descrizione text not null default '',
  colore text not null default 'magenta' check (colore in ('magenta','giallo','nero','rosa')),
  pubblicato boolean not null default true
);

create table public.richieste_prova (
  id uuid primary key default gen_random_uuid(),
  nome_genitore text not null check (char_length(nome_genitore) between 2 and 80),
  telefono text not null check (char_length(telefono) between 6 and 20),
  nome_allievo text not null check (char_length(nome_allievo) between 2 and 80),
  eta int not null check (eta between 3 and 99),
  corso_id uuid references public.corsi(id) on delete set null,
  stato text not null default 'nuova' check (stato in ('nuova','contattata','chiusa')),
  note_maestre text not null default '',
  creata_il timestamptz not null default now()
);
create index richieste_prova_corso_idx on public.richieste_prova(corso_id);
create index richieste_prova_data_idx on public.richieste_prova(creata_il desc);

-- ---------- Row Level Security ----------
alter table public.maestre enable row level security;
alter table public.scuola enable row level security;
alter table public.sedi enable row level security;
alter table public.insegnanti enable row level security;
alter table public.fasce_eta enable row level security;
alter table public.corsi enable row level security;
alter table public.lezioni_settimanali enable row level security;
alter table public.eventi enable row level security;
alter table public.richieste_prova enable row level security;

-- Elenco maestre: lo vedono solo le maestre (contiene email).
create policy "maestre leggono elenco" on public.maestre
  for select to authenticated using ((select privato.e_maestra()));

-- Contenuti pubblici: lettura libera, modifica solo maestre.
create policy "lettura pubblica" on public.scuola for select to anon, authenticated using (true);
create policy "lettura pubblica" on public.sedi for select to anon, authenticated using (true);
create policy "lettura pubblica" on public.insegnanti for select to anon, authenticated using (true);
create policy "lettura pubblica" on public.fasce_eta for select to anon, authenticated using (true);
create policy "lettura pubblica" on public.lezioni_settimanali for select to anon, authenticated using (true);
create policy "lettura corsi pubblicati" on public.corsi
  for select to anon, authenticated using (pubblicato or (select privato.e_maestra()));
create policy "lettura eventi pubblicati" on public.eventi
  for select to anon, authenticated using (pubblicato or (select privato.e_maestra()));

do $$
declare t text;
begin
  foreach t in array array['scuola','sedi','insegnanti','fasce_eta','corsi','lezioni_settimanali','eventi']
  loop
    execute format('create policy "maestre inseriscono" on public.%I for insert to authenticated with check ((select privato.e_maestra()))', t);
    execute format('create policy "maestre modificano" on public.%I for update to authenticated using ((select privato.e_maestra())) with check ((select privato.e_maestra()))', t);
    execute format('create policy "maestre eliminano" on public.%I for delete to authenticated using ((select privato.e_maestra()))', t);
  end loop;
end $$;

-- Richieste di prova: chiunque può inviarne una (sempre come "nuova"),
-- ma solo le maestre possono leggerle e aggiornarle.
create policy "chiunque invia una richiesta" on public.richieste_prova
  for insert to anon, authenticated with check (stato = 'nuova' and note_maestre = '');
create policy "maestre leggono richieste" on public.richieste_prova
  for select to authenticated using ((select privato.e_maestra()));
create policy "maestre aggiornano richieste" on public.richieste_prova
  for update to authenticated using ((select privato.e_maestra())) with check ((select privato.e_maestra()));
create policy "maestre eliminano richieste" on public.richieste_prova
  for delete to authenticated using ((select privato.e_maestra()));
