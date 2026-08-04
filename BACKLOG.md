# Backlog

Den fullständiga listan med allt avklarat står i `to-do-list.md`. Här ligger bara
det som är öppet.

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
