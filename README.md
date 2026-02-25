# 💪 Syntax Squad Workout App

- En webb app där användaren kan:

- Utforska en övningsbank

- Generera slumpmässiga träningspass baserat på muskelgrupp

- Skapa och spara egna träningspass

- Applikationen är byggd med fokus på användarvänlighet, prestanda och tillgänglighet.

# 📖 Projektbeskrivning

Syntax Squad Workout App är en interaktiv träningsappsom hjälper användare att planera och strukturera sin träning.

Appen innehåller tre sidor:
### 🏠 Home

- Startvy med introduktion

- Knapp för att starta träningsgeneratorn

- Sektion med information om appen

### 📚 Exercise Bank

- Sökfunktion för att filtrera övningar

- Övningskort som visar:

- Kategori (strength/stretching)

- Nivå (beginner/intermediate)

- Utrustning

- Primära och sekundära muskler

- Utfällbara instruktioner

### 🏋️ Generate Workout

- Välj muskelgrupp (ex. Biceps)

- Generera slumpmässigt träningspass

Visar:

- Övning

- Sets

- Reps

### ✍️ Create Your Own Workout

Lägg till:

- Övningsnamn

- Antal sets

- Antal reps

- Spara träningspass

- Rensa sparade pass

# ⚙️ Installation och körning
1. Klona repositoryt
git clone https://github.com/niklaserikssoon/SQ-workoutapp
cd REPO-NAME

Live Server via VS Code

npm run build
🧪 Testning

npm run test

Testerna kontrollerar exempelvis:

Att övningar renderas korrekt

Att filtrering fungerar

Att generering av träningspass returnerar korrekt data

Att egna träningspass sparas korrekt

# 🗓 Sprint Planning & Retrospective
Sprint 1 – Grundstruktur

Mål:

- Sätta upp projektstruktur

- Skapa navigering

- Implementera Exercise Bank

Resultat:

- Fungerande routing

- Renderade övningskort

- Sökfunktion

Sprint 2 – Funktionalitet

Mål:

- Implementera Workout Generator

- Skapa funktion för egna träningspass

Resultat:

- Slumpmässig generering av övningar

- Sets & reps genereras dynamiskt

- Local storage för sparade pass

### Retrospective

Det som fungerade bra:

- Tydlig uppdelning av ansvar

- Bra samarbete

- Strukturerad kod

Utmaningar:

- Strukturering

- Förbättringar till nästa projekt:

- Skriva tester tidigare

- Mer fokus på accessibility från början

# 🔍 Lighthouse Scores

Home / Exercise bank

<img width="468" height="490" alt="Skärmbild 2026-02-25 195219" src="https://github.com/user-attachments/assets/480758ce-35e5-4ea7-9d08-91370409bd9e" />

<img width="479" height="493" alt="Skärmbild 2026-02-25 195138" src="https://github.com/user-attachments/assets/3608c3ed-89a8-46e0-9896-0db470e562fd" />

Körda via Chrome DevTools → Lighthouse.

# ♿ Tillgänglighet (Accessibility)

- Vi har arbetat med:

- Semantisk HTML

- Kontrast mellan text och bakgrund

- Tydliga knappar och klickytor

- Responsiv design

- Struktur för skärmläsare

- Fokus-states för tangentbordsnavigering

# ⚡ Prestanda

Åtgärder som förbättrar prestanda:

- Rendera json data mer effektivt

- Minimal DOM-manipulation

# 🧠 Reflektion

Detta projekt gav oss praktisk erfarenhet av:

- Agilt arbete

- DOM-manipulation

- Arbete med Automatiserade tester

- Design tänk

- UX tänkande
