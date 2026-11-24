-- ============================================================
--  FASE 3 — Conferme via WhatsApp
--  Famiglie, allieve, iscrizioni ai corsi, richieste di risposta e risposte.
--  Tutte le tabelle sono visibili SOLO alle maestre.
--  I genitori (senza login) passano da tre funzioni che, dato il codice del link,
--  mostrano solo l'evento e l'elenco "Nome + iniziale" e registrano la risposta.
-- ============================================================
create table public.famiglie (
  id uuid primary key default gen_random_uuid(),
  nome_genitore text not null default '',
  telefono text not null default '',
  email text,
  note text not null default '',
  creata_il timestamptz not null default now()
);

create table public.allievi (
  id uuid primary key default gen_random_uuid(),
  famiglia_id uuid not null references public.famiglie(id) on delete cascade,
  nome text not null,
  cognome text not null,
  data_nascita date,
  attivo boolean not null default true,
  creato_il timestamptz not null default now()
);
create index allievi_famiglia_idx on public.allievi(famiglia_id);

create table public.iscrizioni (
  allievo_id uuid not null references public.allievi(id) on delete cascade,
  corso_id uuid not null references public.corsi(id) on delete cascade,
  primary key (allievo_id, corso_id)
);
create index iscrizioni_corso_idx on public.iscrizioni(corso_id);

create table public.richieste (
  id uuid primary key default gen_random_uuid(),
  codice text not null unique check (codice ~ '^[a-z0-9]{8,16}$'),
  titolo text not null check (char_length(titolo) between 2 and 120),
  messaggio text not null default '',
  corso_id uuid references public.corsi(id) on delete set null,
  tutta_la_scuola boolean not null default false,
  opzioni jsonb not null default '["Partecipo","Non partecipo","Forse"]'::jsonb,
  scadenza date,
  data_evento date,
  ora_inizio time,
  ora_fine time,
  luogo text not null default '',
  firma text not null default '',
  chiusa boolean not null default false,
  creata_il timestamptz not null default now()
);
create index richieste_corso_idx on public.richieste(corso_id);

create table public.risposte (
  richiesta_id uuid not null references public.richieste(id) on delete cascade,
  allievo_id uuid not null references public.allievi(id) on delete cascade,
  scelta text not null,
  risposta_il timestamptz not null default now(),
  primary key (richiesta_id, allievo_id)
);
create index risposte_allievo_idx on public.risposte(allievo_id);

alter table public.famiglie enable row level security;
alter table public.allievi enable row level security;
alter table public.iscrizioni enable row level security;
alter table public.richieste enable row level security;
alter table public.risposte enable row level security;

do $$
declare t text;
begin
  foreach t in array array['famiglie','allievi','iscrizioni','richieste','risposte']
  loop
    execute format('create policy "maestre leggono" on public.%I for select to authenticated using ((select privato.e_maestra()))', t);
    execute format('create policy "maestre inseriscono" on public.%I for insert to authenticated with check ((select privato.e_maestra()))', t);
    execute format('create policy "maestre modificano" on public.%I for update to authenticated using ((select privato.e_maestra())) with check ((select privato.e_maestra()))', t);
    execute format('create policy "maestre eliminano" on public.%I for delete to authenticated using ((select privato.e_maestra()))', t);
  end loop;
end $$;

-- A chi è rivolta una richiesta: tutta la scuola oppure le iscritte a un corso.
create or replace function privato.destinatario(r public.richieste, a public.allievi)
returns boolean language sql stable set search_path = '' as $$
  select a.attivo and (
    r.tutta_la_scuola
    or exists (select 1 from public.iscrizioni i where i.allievo_id = a.id and i.corso_id = r.corso_id)
  );
$$;

create or replace function privato.richiesta_aperta(r public.richieste)
returns boolean language sql stable set search_path = '' as $$
  select not r.chiusa and (r.scadenza is null or (now() at time zone 'Europe/Rome')::date <= r.scadenza);
$$;

create or replace function public.richiesta_pubblica(p_codice text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'titolo', r.titolo, 'messaggio', r.messaggio, 'firma', r.firma, 'opzioni', r.opzioni,
    'scadenza', r.scadenza, 'data_evento', r.data_evento,
    'ora_inizio', to_char(r.ora_inizio, 'HH24:MI'), 'ora_fine', to_char(r.ora_fine, 'HH24:MI'),
    'luogo', r.luogo, 'corso', c.nome, 'aperta', privato.richiesta_aperta(r),
    'destinatari', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id,
        'etichetta', a.nome || ' ' || upper(left(a.cognome, 1)) || '.',
        'gruppo', md5(a.famiglia_id::text || r.codice)
      ) order by a.nome, a.cognome)
      from public.allievi a where privato.destinatario(r, a)
    ), '[]'::jsonb)
  )
  from public.richieste r left join public.corsi c on c.id = r.corso_id
  where r.codice = p_codice;
$$;

create or replace function public.risposte_richiesta(p_codice text, p_allievi uuid[])
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(x.allievo_id, x.scelta), '{}'::jsonb)
  from public.risposte x join public.richieste r on r.id = x.richiesta_id
  where r.codice = p_codice and x.allievo_id = any(p_allievi);
$$;

create or replace function public.rispondi_richiesta(p_codice text, p_allievo uuid, p_scelta text)
returns text language plpgsql security definer set search_path = '' as $$
declare r public.richieste; a public.allievi;
begin
  select * into r from public.richieste where codice = p_codice;
  if not found then return 'non_trovata'; end if;
  if not privato.richiesta_aperta(r) then return 'chiusa'; end if;
  if not (r.opzioni ? p_scelta) then return 'non_valida'; end if;
  select * into a from public.allievi where id = p_allievo;
  if not found or not privato.destinatario(r, a) then return 'non_valida'; end if;
  insert into public.risposte (richiesta_id, allievo_id, scelta) values (r.id, a.id, p_scelta)
  on conflict (richiesta_id, allievo_id) do update set scelta = excluded.scelta, risposta_il = now();
  return 'ok';
end $$;

revoke all on function public.richiesta_pubblica(text) from public;
revoke all on function public.risposte_richiesta(text, uuid[]) from public;
revoke all on function public.rispondi_richiesta(text, uuid, text) from public;
grant execute on function public.richiesta_pubblica(text) to anon, authenticated;
grant execute on function public.risposte_richiesta(text, uuid[]) to anon, authenticated;
grant execute on function public.rispondi_richiesta(text, uuid, text) to anon, authenticated;
revoke all on function privato.destinatario(public.richieste, public.allievi) from public;
revoke all on function privato.richiesta_aperta(public.richieste) from public;
