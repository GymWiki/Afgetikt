# Afgetikt

De rekening splitsen zonder gedoe. Fotografeer de bon, deel één link, iedereen
kiest zijn eigen producten — Afgetikt rekent de rest automatisch uit.

Dit is fase 1 van het product: de consumentenflow (geen restaurant-dashboard
nog). Zie de flow hieronder.

## Flow

1. `/nieuw` — foto van de bon uploaden (Claude Vision leest de producten uit)
   of zelf invoeren.
2. `/nieuw/[code]/controleren` — producten controleren/bewerken.
3. `/nieuw/[code]/betaallink` — eigen naam + betaalverzoek-link (Tikkie, ING,
   Rabobank, ABN AMRO, …) toevoegen. Afgetikt verwerkt zelf geen betalingen.
4. `/nieuw/[code]/klaar` — groepslink delen.
5. `/b/[code]` — iedereen opent dezelfde link, vult zijn naam in en tikt zijn
   producten aan (gedeelde items worden evenredig verdeeld).
6. `/b/[code]/beheer` — alleen bereikbaar met een geheime `key` (geen account
   nodig): overzicht van wie al betaald heeft.

Er is bewust geen account nodig om mee te doen. De hoofdbetaler krijgt een
geheime beheerlink; deelnemers krijgen een geheim token opgeslagen in
`localStorage` van hun eigen apparaat, zodat ze hun keuzes later nog kunnen
aanpassen zonder in te loggen.

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Postgres via Drizzle ORM — werkt lokaal en tegen een Supabase-project
  (gewoon de Postgres connection string invullen)
- Tailwind CSS v4
- Claude Vision (`@anthropic-ai/sdk`) om bonnetjes te lezen

## Development

```bash
cp .env.example .env.local   # vul DATABASE_URL en ANTHROPIC_API_KEY in
npm install
npm run db:generate          # migratiebestand genereren na schemawijzigingen
npm run db:migrate           # migraties toepassen
npm run dev
```

Lokale Postgres opzetten (als alternatief voor een Supabase-project):

```bash
sudo service postgresql start
sudo -u postgres psql -c "CREATE ROLE afgetikt WITH LOGIN PASSWORD 'afgetikt_dev' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE afgetikt_dev OWNER afgetikt;"
```

Zonder `ANTHROPIC_API_KEY` werkt de "foto uploaden"-stap niet, maar de rest
van de flow (inclusief "zelf invoeren") wel.
