---
schemaVersion: 1
status: active
currentGoal: Fylla ut tidslinjens innehåll så att fler händelser har bild och källa
nextAction: Lägg till image-fält för de 29 händelser som saknar bild, med 1917-seskaro, 1974-las-fml och 2023-tesla först
blockers: []
reviewedAt: 2026-07-24
---

# Handoff: tidslinje

## Läget

Sajten är live och fungerar. Det som återstår är innehållsarbete, inte teknik.
56 händelser ligger i `src/data/events.json`, fördelade på tre epoker. 27 av dem
har bild.

Arkitektur och konventioner står i `project.md`, den fullständiga arbetslistan i
`to-do-list.md`.

## Recent work

- Alla komponenter byggda: `Timeline`, `EventCard`, `Modal` och `EpochGroup`.
- Bildstöd i både kort och modal, med `imgSrc()` som hanterar Vite base-URL korrekt
  för GitHub Pages.
- Nedladdningsskript för bilder skrivet och kört.
- Tillgänglighet i modalen: `role="dialog"`, fokus på stängknappen vid öppning och
  scroll-lock.
- Bildfilnamn med icke-ASCII-tecken hittade och åtgärdade.

## Verification

- Fem flaggade länkar granskade 2026-07-21, alla fungerar i riktig webbläsare.
  `sverigesradio.se` gav 403 mot automatiska hämtare, vilket är bot-blockering och
  inte ett verkligt fel. Ingen ändring behövdes.
- `package.json`-versionen är synkad med `version.txt`.

## Unresolved details

- 29 av 56 händelser saknar bild.
- Några nedladdade bilder kan vara felaktiga och behöver granskas manuellt.
- `imgSrc()` och `ICONS` är duplicerade i `EventCard.jsx` och `Modal.jsx`.
- `project.md` säger att inga hårdkodade strängar ska finnas, men `App.jsx` och
  `Modal.jsx` har det. Inte akut, men motsägelsen bör lösas.

## Resume here

Börja med bilderna. De tre prioriterade är `1917-seskaro`, `1974-las-fml` och
`2023-tesla`. Städa gärna dubbletterna i `EventCard.jsx` och `Modal.jsx` när du ändå
är i de filerna.
