# TinyTales – frontend

En frontend-designprototyp för TinyTales: en sajt för att dokumentera barns uppväxt med minnen och foton, samt dela resan med familjen.

## Status

Detta är **bara frontend-designen**. All data (barnet "Elsa", minnen, familjemedlemmar, inbjudningar) kommer från `scripts/data/demoData.js` och hålls i minnet under sessionen – inget sparas mellan sidladdningar (utom mörkt/ljust läge, som sparas i `localStorage`).

Fältnamnen i `demoData.js` är medvetet valda för att matcha entiteterna i backend-projektet (`TinyTales.Models`) 1:1, så att integrationen blir ett rakt utbyte, inte en omskrivning:

| Frontend (demoData.js)                        | Backend-entitet                                  |
| ---------------------------------------------- | ------------------------------------------------- |
| `child` (`id`, `name`, `birthDate`, ...)       | `Child`                                            |
| `memories[]` (`title`, `description`, `memoryDate`, `isFavorite`, `location`) | `Memory`                     |
| `memories[].media[]` (`type`, `caption`)       | `Media` (`type`: `"Image"` \| `"Video"`)           |
| `familyMembers[]` (`displayName`, `role`)      | `FamilyMember` + `User` (`role`: `Parent`/`Guardian`/`Viewer`) |
| `pendingInvites[]` (`email`, `expiresAt`)      | `FamilyInvite` (`email`, `token`, `expiresAt`, `accepted`) |

Det finns **ingen separat milstolpe- eller tillväxt-entitet** i backend – allt är ett `Memory`. En "milstolpe" i UI:t är bara ett Memory med `isFavorite: true`. Det saknas därför en Tillväxt-sida i den här prototypen (skulle kräva en ny entitet i databasen).

## Var du kopplar in backend senare

1. `scripts/data/demoData.js` → byt ut mot `fetch()`-anrop (t.ex. `GET /api/children/{id}/memories`).
2. `scripts/ui/addEntryModal.js` → `onAdd`-callbacken (i `home.js`/`simplePage.js`) sparar nu bara i minnet, byt mot `POST /api/memories`. Formuläret samlar redan exakt de fält `Memory` + en `Media`-post behöver.
3. `scripts/ui/settings.js` → `generateInviteLink()` och `onAdd`-callbacken för inbjudan är mock. Byt mot `POST /api/families/{id}/invites` med bara `email` (backens `FamilyInvite` har ingen roll vid själva inbjudan – rollen sätts när `FamilyMember` skapas efter accept).

## Köra lokalt

ES-moduler kräver att sidan laddas via http (inte `file://`):

```bash
npm install
npm run serve
```

Öppna sedan `http://localhost:8080/index.html`.

## Struktur

- `index.html`, `gallery.html`, `timeline.html`, `memories.html`, `milestones.html`, `settings.html` – en sida per vy i sidomenyn.
- `styles/` – `base.css` (design-tokens, ljust/mörkt tema), `layout.css` (sidomeny/topbar), `components.css` (kort, knappar, modaler).
- `scripts/data/` – statisk demodata (se tabellen ovan).
- `scripts/logic/` – rena funktioner (ålder, gruppering per ålder, filtrering på bilder/minnen/milstolpar).
- `scripts/ui/` – rendering per sida samt delad UI (sidomeny/topbar, minnes-kort, "lägg till"-modal).

## Kända begränsningar (medvetet, för att hålla detta som en ren designprototyp)

- Inga riktiga foton – bildkort visas som emoji-placeholders istället för `Media.Url`.
- Ingen persistens – lägger man till ett minne eller en inbjudan finns det bara kvar tills sidan laddas om.
- Inbjudan är helt visuell (genererar en låtsaslänk/token, skickar inget e-postmeddelande).
- Bara ett barn stöds i UI:t just nu – "Lägg till barn" är en platshållare.
