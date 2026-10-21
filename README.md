# Kårappen

Kårens medlemsapp: medlemmar ser kårens evenemang och anmäler sig, kåren skapar och hanterar dem.

Byggd i React Native med Expo, med egen Express-backend och PostgreSQL-databas.

---

## Plan

### Appens namn, målgrupp och vad användaren kan göra

**Kårappen** är till för **studenter som är medlemmar i kåren** och för **kårens styrelse/aktiva** som anordnar evenemang.

- **Medlem:** registrerar sig, loggar in, ser kommande evenemang (nollning, pubar, sittningar, föreläsningar), öppnar en detaljsida, anmäler sig och avanmäler sig, ser sina anmälningar och redigerar sin profil (namn, program, årskurs, specialkost).
- **Admin (kåren):** allt ovan, plus skapa, ändra och ta bort evenemang och se vilka som är anmälda (inklusive specialkost inför sittningar).

### Vad vi bygger nu och vad som får vänta

**Version 1 (bygger nu)**

|                   | Funktion          | Beskrivning                                                           |
| ----------------- | ----------------- | --------------------------------------------------------------------- |
| Huvudfunktion     | **Evenemang**     | Lista, detaljsida och formulär. Admin har full CRUD, medlemmar läser. |
| Mindre funktion 1 | **Anmälan**       | Anmäl/avanmäl till evenemang, max antal platser, "Mina anmälningar".  |
| Mindre funktion 2 | **Medlemsprofil** | Namn, program, årskurs och specialkost. Medlemmen redigerar sin egen. |

Två roller via ett `role`-fält på användaren: `member` (standard) och `admin`.

**Får vänta**

- **Extrafunktion för VG (väljs när grunden fungerar):** nyhetsflöde/anslag från kåren. Det är nästan samma CRUD som evenemang. _Ska stämmas av med David._
- Alternativ om vi hinner: rabatter/medlemsförmåner.
- Bilder på evenemang, pushnotiser, kalenderexport, väntelista vid fullt evenemang.

### Skisser av skärmarna

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│     Kårappen     │  │ Evenemang     [+]│  │ ← Sittning       │
│                  │  │──────────────────│  │                  │
│ E-post [_______] │  │ Pub 24/10  18:00 │  │ Fre 31/10 18:00  │
│ Lösen  [_______] │  │ Kårhuset  12/80  │  │ Plats: Kårhuset  │
│                  │  │──────────────────│  │ Platser: 34/60   │
│  [ Logga in ]    │  │ Sittning 31/10   │  │                  │
│  Skapa konto →   │  │ Kårhuset  34/60  │  │ Beskrivning ...  │
│                  │  │──────────────────│  │                  │
│ (fel: "Fel e-post│  │ (tomt: "Inga     │  │ [  Anmäl mig  ]  │
│  eller lösenord")│  │  kommande event")│  │ admin: [Ändra]   │
└──────────────────┘  └──────────────────┘  │ [Ta bort] [Anm.] │
  Inloggning/Registr.   Evenemangslista     └──────────────────┘
                                              Evenemangsdetalj
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Mina anmälningar │  │ Profil           │  │ Nytt evenemang   │
│──────────────────│  │                  │  │ Titel   [______] │
│ Pub 24/10        │  │ Namn    [______] │  │ Datum   [______] │
│ Sittning 31/10   │  │ Program [______] │  │ Plats   [______] │
│                  │  │ Årskurs [______] │  │ Max     [______] │
│ (tomt: "Du är    │  │ Specialkost [__] │  │ Beskr.  [______] │
│  inte anmäld     │  │                  │  │                  │
│  till något")    │  │ [Spara][Logga ut]│  │ [    Spara    ]  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
 [Evenemang | Mina anmälningar | Profil]     Skapa/redigera (admin)
```

Navigering med Expo Router: inloggning och registrering utanför flikarna. Flikarna är **Evenemang**, **Mina anmälningar** och **Profil**. Detaljsidan och formuläret öppnas ovanpå flikarna.

### Data som sparas

```
users                          events                         registrations
─────────────────              ─────────────────              ─────────────────
id                             id                             id
email (unik)                   title                          user_id  → users
password_hash (bcrypt)         description                    event_id → events
name                           starts_at                      created_at
program                        location                       UNIQUE(user_id, event_id)
year (årskurs)                 max_participants
dietary (specialkost)          created_by → users
role ('member' | 'admin')      created_at
created_at
```

**För varje användare** sparas profilen (namn, program, årskurs, specialkost), rollen och vilka evenemang hen är anmäld till. Lösenord sparas bara som bcrypt-hash och skickas aldrig tillbaka i API-svar.

Se [backend/db/schema.sql](backend/db/schema.sql).

### Behörighet (det vi testar)

- Ej inloggad → `401` på allt utom `/auth/*` och `/health`.
- Medlem som försöker skapa/ändra/ta bort evenemang → `403`.
- Medlem kan bara se och ändra **sin egen** profil och **sina egna** anmälningar.
- Bara admin ser listan över anmälda till ett evenemang.
- Anmälan till fullt evenemang → `409`. Dubbelanmälan → `409`.
- Ogiltig indata (t.ex. saknad titel, max platser ≤ 0) → `400`.

### API (utkast)

| Metod         | Route                       | Vem                                |
| ------------- | --------------------------- | ---------------------------------- |
| POST          | `/auth/register`            | alla                               |
| POST          | `/auth/login`               | alla                               |
| GET / PUT     | `/me`                       | inloggad (egen profil)             |
| GET           | `/me/registrations`         | inloggad                           |
| GET           | `/events`, `/events/:id`    | inloggad                           |
| POST          | `/events`                   | admin                              |
| PUT / DELETE  | `/events/:id`               | admin                              |
| POST / DELETE | `/events/:id/registration`  | inloggad (anmäl/avanmäl sig själv) |
| GET           | `/events/:id/registrations` | admin                              |

Utloggning sker i appen genom att JWT:n tas bort från SecureStore.

### Teknik

| Del         | Val                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| App         | React Native, Expo, Expo Router, TypeScript, `expo-secure-store` för token                                     |
| Backend     | Node.js och Express, JWT (`jsonwebtoken`), `bcryptjs`                                                          |
| Databas     | PostgreSQL (`pg`)                                                                                              |
| Tester      | `node:test` och `supertest` mot en riktig Postgres i CI                                                        |
| CI/CD       | GitHub Actions: tester → Docker-build → deploy till EC2 via SSH vid push till `main`                           |
| Hosting     | **AWS EC2** (Ubuntu) med Docker Compose: backend-container och Postgres-container med data i en Docker-volym   |
| HTTPS       | Läggs till framför backend (reverse proxy med certifikat) innan redovisningen                                  |
| Hemligheter | `POSTGRES_PASSWORD` och `JWT_SECRET` i en `.env`-fil på servern, aldrig i appen eller Git                      |

### Arbetsfördelning

Båda jobbar med både app och backend. Vi delar upp per **funktion genom hela kedjan** (skärm → API → databas) så att båda kan förklara ett flöde från app till databas.

|         | Person A: _Andrea_                                                                     | Person B: _Alice_                                          |
| ------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Vecka 1 | Evenemang-CRUD i backend och lista/detalj/formulär i appen | Auth i backend (register/login, JWT, bcrypt) och inloggnings- och registreringsskärmar |
|         | Deploy: EC2, Docker Compose och deploy via SSH i GitHub Actions                        | Roller och behörighetsmiddleware (admin/medlem)            |
| Vecka 2 | Profil (API och skärm) och tester för profil/auth                                      | Anmälan (API och skärmar) och tester för evenemang/anmälan |
|         | Extrafunktion (om tid finns)                                                           | README och förberedelse av redovisning                     |

Arbetssätt: en branch per uppgift, pull request och att den andra läser innan merge. Uppgiftstavla (Att göra / Pågår / Klart) i GitHub Projects. Kort avstämning varje dag.

### Tidsplan

- **Vecka 1:** repo, databas, inloggning och evenemang. Deploy av backend redan dag 2–3.
- **Vecka 2:** anmälan, profil, tester, eventuell extrafunktion, README och redovisning **3 november**.

---

## Kom igång

### Backend

```bash
cd backend
cp .env.example .env      # fyll i värden
docker compose up db -d   # från repots rot: startar lokal Postgres
npm install
npm run migrate
npm run dev               # http://localhost:3000/health
npm test
```

### App

```bash
cd app
npm install
npx expo start            # öppna i Expo Go eller emulator
```

Sätt backend-adressen i `app/.env` som `EXPO_PUBLIC_API_URL=...` (den deployade adressen vid redovisning). Lägg aldrig hemligheter i appen.

## Deployment

Backend körs på en AWS EC2-instans (Ubuntu) med en Elastic IP: **http://51.21.6.174** (hälsokontroll: [/health](http://51.21.6.174/health)). HTTPS läggs till innan redovisningen.

```
push till main → GitHub Actions: test → docker build → deploy
                                                        │ rsync + ssh
                                                        ▼
                                   EC2: docker compose -f docker-compose.prod.yml up -d --build
                                        ├── backend  (port 80 → 3000)
                                        └── db       (Postgres, data i volymen db-data)
```

- `deploy`-jobbet kopierar `backend/` och `docker-compose.prod.yml` till `~/karappen` på servern och startar om containrarna. Databasschemat körs vid varje start (`db/migrate.js`).
- Postgres-data ligger i Docker-volymen `db-data`, så den finns kvar efter omstart och ny deploy.
- Hemligheterna ligger i `~/karappen/.env` på servern (`POSTGRES_PASSWORD`, `JWT_SECRET`) och finns aldrig i Git.
- GitHub-hemligheter: `EC2_HOST` (serverns IP) och `EC2_SSH_KEY` (privat nyckel som bara används av GitHub Actions).

Felsökning på servern:

```bash
cd ~/karappen
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend
```

## Struktur

```
karappen/
├── app/                 # Expo-appen (Expo Router)
├── backend/             # Express-API, Dockerfile, schema och tester
├── docker-compose.yml        # Lokal Postgres och backend
├── docker-compose.prod.yml   # Produktion på EC2
└── .github/workflows/        # CI/CD
```
