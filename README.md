# Kårappen

Kårens medlemsapp: medlemmar ser kårens evenemang och anmäler sig, kåren skapar och hanterar dem.

Byggd i React Native med Expo, med egen Express-backend och PostgreSQL-databas.

---

## Plan

### Appens namn, målgrupp och vad användaren kan göra

**Kårappen** är till för **studenter som är medlemmar i kåren** och för **kårens styrelse/aktiva** som anordnar evenemang.

- **Medlem:** registrerar sig, loggar in, ser kommande evenemang (fester, pubar, spelkvällar, föreläsningar), öppnar en detaljsida, anmäler sig och avanmäler sig, ser sina anmälningar och redigerar sin profil (namn, program, programår, specialkost och profilbild).
- **Admin (kåren):** allt ovan, plus skapa, ändra och ta bort evenemang, ladda upp bilder till evenemang och se vilka som är anmälda (inklusive specialkost inför sittningar).

### Funktioner

|                   | Funktion          | Beskrivning                                                                              |
| ----------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| Huvudfunktion     | **Evenemang**     | Lista, detaljsida och formulär. Admin har full CRUD, medlemmar läser.                    |
| Mindre funktion 1 | **Anmälan**       | Anmäl/avanmäl till evenemang, max antal platser, "Mina anmälningar" och lista för admin. |
| Mindre funktion 2 | **Medlemsprofil** | Namn, program, programår och specialkost. Medlemmen redigerar sin egen.                  |
| Extrafunktion, VG | **Bilder**        | Admin laddar upp bild till evenemang, medlemmar laddar upp profilbild. Godkänd av David. |

Två roller via ett `role`-fält på användaren: `member` (standard) och `admin`.

Appen har också ljust och mörkt läge. Knappen med sol/måne i headern växlar, och valet sparas på enheten. Innan man har valt följer appen telefonens inställning.

**Bilder i korthet:** appen väljer bild med `expo-image-picker` (beskuren till 16:9 för evenemang) och skickar den som `multipart/form-data`. Backend tar emot den med `multer`, kontrollerar filtyp (JPEG, PNG, WebP) och storlek (max 5 MB), sparar filen med ett slumpat namn och lagrar sökvägen i databasen. När en bild ersätts eller ett evenemang tas bort raderas den gamla filen. Bilderna serveras under `/uploads`.

**Fick vänta:** nyhetsflöde, rabatter/medlemsförmåner, pushnotiser, kalenderexport och väntelista vid fullt evenemang.

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
year (programår, 0–99)         max_participants
dietary (specialkost)          image_url
avatar_url                     created_by → users
role ('member' | 'admin')      created_at
created_at
```

**För varje användare** sparas profilen (namn, program, programår, specialkost, profilbild), rollen och vilka evenemang hen är anmäld till. Bilderna sparas som filer, och databasen lagrar bara sökvägen (`image_url`, `avatar_url`). Lösenord sparas bara som bcrypt-hash och skickas aldrig tillbaka i API-svar.

Se [backend/db/schema.sql](backend/db/schema.sql).

### Behörighet (det vi testar)

- Ej inloggad → `401` på allt utom `/auth/*` och `/health`.
- Medlem som försöker skapa/ändra/ta bort evenemang → `403`.
- Medlem kan bara se och ändra **sin egen** profil och **sina egna** anmälningar.
- Bara admin ser listan över anmälda till ett evenemang.
- Anmälan till fullt evenemang → `409`. Dubbelanmälan → `409`.
- Ogiltig indata (t.ex. saknad titel, max platser ≤ 0) → `400`.
- Bilder: bara admin laddar upp till evenemang, och en medlem kan bara byta **sin egen** profilbild. Fel filtyp, för stor fil eller ingen fil → `400`.
- Det går inte att ge sig själv admin-roll, varken vid registrering eller via `PUT /me`.

### API

| Metod         | Route                       | Vem                                |
| ------------- | --------------------------- | ---------------------------------- |
| POST          | `/auth/register`            | alla                               |
| POST          | `/auth/login`               | alla                               |
| GET           | `/health`                   | alla                               |
| GET / PUT     | `/me`                       | inloggad (egen profil)             |
| POST          | `/me/avatar`                | inloggad (egen profilbild)         |
| GET           | `/me/registrations`         | inloggad                           |
| GET           | `/events`, `/events/:id`    | inloggad                           |
| POST          | `/events`                   | admin                              |
| PUT / DELETE  | `/events/:id`               | admin                              |
| POST          | `/events/:id/image`         | admin                              |
| POST / DELETE | `/events/:id/registration`  | inloggad (anmäl/avanmäl sig själv) |
| GET           | `/events/:id/registrations` | admin                              |
| GET           | `/uploads/:fil`             | alla (uppladdade bilder)           |

Utloggning sker i appen genom att JWT:n tas bort från SecureStore.

### Teknik

| Del         | Val                                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| App         | React Native, Expo, Expo Router, TypeScript, `expo-secure-store` för token, `expo-image-picker` och `expo-image` för bilder |
| Backend     | Node.js och Express, JWT (`jsonwebtoken`), `bcryptjs`, `multer` för bilduppladdning                                         |
| Databas     | PostgreSQL (`pg`)                                                                                                           |
| Tester      | `node:test` och `supertest` mot en riktig Postgres i CI                                                                     |
| CI/CD       | GitHub Actions: tester → Docker-build → deploy till EC2 via SSH vid push till `main`                                        |
| Hosting     | **AWS EC2** (Ubuntu) med Docker Compose: backend-container och Postgres-container med data i en Docker-volym                |
| HTTPS       | nginx som reverse proxy framför backend, Let's Encrypt-certifikat via Certbot (förnyas automatiskt)                         |
| Hemligheter | `POSTGRES_PASSWORD` och `JWT_SECRET` i en `.env`-fil på servern, aldrig i appen eller Git                                   |

### Arbetsfördelning

Båda jobbar med både app och backend. Vi delar upp per **funktion genom hela kedjan** (skärm → API → databas) så att båda kan förklara ett flöde från app till databas.

|                                                                                                                                                                             | Person A: _Andrea_                                              | Person B: _Alice_                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Vecka 1                                                                                                                                                                     | Evenemang-CRUD i backend och lista/detalj/formulär i appen      | Auth i backend (register/login, JWT, bcrypt) och inloggnings- och registreringsskärmar |
|                                                                                                                                                                             | Deploy: EC2, Docker Compose och deploy via SSH i GitHub Actions |
|                                                                                                                                                                             | Anmälan (API och skärmar) och tester för evenemang/anmälan      | Roller och behörighetsmiddleware (admin/medlem)                                        |
| Vecka 2                                                                                                                                                                     |                                                                 | Profil (API och skärm) och tester för profil/auth                                      |
|                                                                                                                                                                             | Extrafunktion Bilder i events                                   | Uppdaterad Profil med profilbild och Kursikon                                          |
|                                                                                                                                                                             | README och förberedelse av redovisning                          | README och förberedelse av redovisning                                                 |
| Arbetssätt: en branch per uppgift, pull request och att den andra läser innan merge. Uppgiftstavla (Att göra / Pågår / Klart) i GitHub Projects. Kort avstämning varje dag. |

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
npm run migrate           # kör igen efter varje pull som ändrar db/schema.sql
npm run seed:admin        # skapar admin från ADMIN_EMAIL och ADMIN_PASSWORD i .env
npm run dev               # http://localhost:3000/health
npm test
```

Ny användare som registrerar sig i appen blir alltid `member`. Admin skapas bara med `seed:admin`, lokalt och på servern.

### App

```bash
cd app
npm install
npx expo start            # öppna i Expo Go eller emulator
```

Sätt backend-adressen i `app/.env`:

```
EXPO_PUBLIC_API_URL=https://karappen.duckdns.org   # deployad backend
EXPO_PUBLIC_API_URL=http://<datorns-lan-ip>:3000    # lokal backend, testa på telefon i samma wifi
```

Starta om med `npx expo start -c` när adressen ändras. Lägg aldrig hemligheter i appen.

## Tester

62 tester med `node:test` och `supertest` som körs mot en riktig Postgres-databas, lokalt och i CI.

| Fil              | Antal | Testar                                                                                   |
| ---------------- | ----- | ---------------------------------------------------------------------------------------- |
| `auth.test.js`   | 8     | Registrering, inloggning, fel lösenord, ogiltig token, att role inte går att sätta själv |
| `events.test.js` | 36    | Evenemang-CRUD, anmälan/avanmälan, fullt evenemang, admin-listan och bilduppladdning     |
| `me.test.js`     | 16    | Profil, egna anmälningar och profilbild                                                  |
| `health.test.js` | 2     | `/health` och okänd route                                                                |

Testerna täcker uppgiftens krav:

- **CRUD:** skapa, läsa, ändra och ta bort evenemang, anmälningar, profil och bilder.
- **Ogiltig indata:** saknad titel, ogiltigt datum, max platser 0, ogiltigt programår, fel filtyp, för stor bild och saknad bild ger `400`.
- **Ingen inloggning:** `401` på evenemang, anmälan, profil och profilbild.
- **Andras data:** en medlem kan inte ta bort någon annans anmälan, ändra någon annans profil eller byta någon annans profilbild. En medlem får `403` på alla admin-routes, och evenemanget finns kvar efter ett nekat `DELETE`.

```bash
cd backend
npm test
```

I GitHub Actions startas en Postgres-container, schemat körs och sedan alla tester. Deploy sker bara om testerna går igenom.

## Deployment

Backend körs på en AWS EC2-instans (Ubuntu) med en Elastic IP (`51.21.6.174`) och nås via HTTPS: **https://karappen.duckdns.org** (hälsokontroll: [/health](https://karappen.duckdns.org/health)).

```
push till main → GitHub Actions: test → docker build → deploy
                                                        │ rsync + ssh
                                                        ▼
                                   EC2: docker compose -f docker-compose.prod.yml up -d --build
                                        ├── backend  (127.0.0.1:3000, nås bara via nginx)
                                        └── db       (Postgres, data i volymen db-data)

internet → nginx (443 HTTPS, 80 omdirigeras till 443) → backend (127.0.0.1:3000)
```

- `deploy`-jobbet kopierar `backend/` och `docker-compose.prod.yml` till `~/karappen` på servern och startar om containrarna. Databasschemat körs vid varje start (`db/migrate.js`).
- Postgres-data ligger i Docker-volymen `db-data`, så den finns kvar efter omstart och ny deploy.
- Hemligheterna ligger i `~/karappen/.env` på servern (`POSTGRES_PASSWORD`, `JWT_SECRET`) och finns aldrig i Git.
- Uppladdade bilder ligger i Docker-volymen `uploads` och serveras av backend under `/uploads`.
- GitHub-hemligheter: `EC2_HOST` (serverns IP) och `EC2_SSH_KEY` (privat nyckel som bara används av GitHub Actions).

### HTTPS (nginx och Certbot)

nginx och Certbot är installerade direkt på servern (inte i Docker) och ligger därför inte i repot.

- Domänen `karappen.duckdns.org` är en gratis subdomän från [DuckDNS](https://www.duckdns.org) som pekar på Elastic IP:n.
- nginx-konfigurationen ligger i `/etc/nginx/sites-available/karappen` och skickar alla anrop vidare till `http://127.0.0.1:3000`. Den sätter `client_max_body_size 6M`, eftersom nginx annars bara tillåter 1 MB och bilduppladdningar (max 5 MB) skulle få fel 413.
- Certifikatet kommer från Let's Encrypt via `certbot --nginx`, som också lade till port 443 och omdirigeringen från HTTP i konfigurationen. Det gäller i 90 dagar och förnyas automatiskt av `certbot.timer`.
- Security group i AWS släpper in port 22 (SSH), 80 (HTTP, behövs för omdirigering och certifikatförnyelse) och 443 (HTTPS).

Felsökning på servern:

```bash
cd ~/karappen
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend

sudo nginx -t                    # kontrollera nginx-konfigurationen
sudo systemctl reload nginx      # läs in ändrad konfiguration
sudo tail /var/log/nginx/error.log
sudo certbot certificates        # visa certifikat och utgångsdatum
sudo certbot renew --dry-run     # testa förnyelsen
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
