# Backlog

## Klart

- [x] Projektstruktur, Tailwind-tema, mappstruktur och 56 händelser i `events.json`.
- [x] `Timeline`, `EventCard`, `Modal` och `EpochGroup` byggda.
- [x] Tre epoker definierade och namngivna.
- [x] Wikipedia-länkar, LO Play-videor och podcastavsnittet "Vi bygger landet".
- [x] Bildstöd i kort och modal, med `imgSrc()` som klarar Vite base-URL.
- [x] Nedladdningsskript för bilder skrivet och kört, 27 av 56 har bild.
- [x] Modal-tillgänglighet: `role="dialog"`, fokus på stängknappen, scroll-lock.
- [x] Fem flaggade länkar granskade 2026-07-21, alla fungerar i riktig webbläsare.
- [x] Bildfilnamn med icke-ASCII-tecken åtgärdade.

## Bilder

- [ ] Lägg till `image`-fält för de 29 händelser som saknar bild. Prioritera
  `1917-seskaro`, `1974-las-fml` och `2023-tesla`.
- [ ] Granska de nedladdade bilderna och ersätt felaktiga manuellt.

## Innehåll

- [ ] Hitta fler poddavsnitt, till exempel Historiepodden om Seskaröupproret.
- [ ] Fler händelser i `events.json`.

## Funktioner

- [ ] Filtrering mellan Sverige och världen.
- [ ] Sökfunktion.
- [ ] SVG-ikoner om emojin visar sig otillräcklig.

## Städning

- [ ] `imgSrc()` och `ICONS` är duplicerade i `EventCard.jsx` och `Modal.jsx`.
  Bryt ut till en delad fil när du ändå är där.
- [ ] Hårdkodade strängar finns i `App.jsx` och `Modal.jsx` trots att `project.md`
  säger motsatsen. Lös motsägelsen, antingen i koden eller i dokumentet.
