# Project context

## Product intent

En visuell tidslinje över svensk arbetarrörelse och arbetsrätt, med länkar vidare
till Wikipedia, LO Play och poddavsnitt. Den ska gå att bläddra i, inte läsas som
en artikel.

## Architecture

- React med Vite och Tailwind, byggs och serveras som statisk sajt via GitHub Pages
  under `buildapp.se/tidslinje/`.
- Innehållet ligger i `src/data/events.json`. Där finns 56 händelser fördelade på
  tre epoker.
- Fyra komponenter: `Timeline` hämtar och sorterar, `EventCard` visar kortet i tre
  storlekar, `Modal` visar lång text och stor bild, `EpochGroup` grupperar per epok.
- `imgSrc()` hanterar Vite base-URL så att bilder fungerar både lokalt och under
  GitHub Pages underkatalog.

## Constraints

- Bildfilnamn måste vara ren ASCII. Å, ä och ö har orsakat renderingsproblem förut.
- `vite.config.js` har en `base` som måste matcha reponamnet, annars bryts alla
  relativa sökvägar i produktion.
- Ingen backend. All data är statisk JSON i bygget.

## Important decisions

- Innehåll ligger i JSON, inte i komponenter, så att en händelse kan läggas till
  utan att röra kod.
- Epokerna är tre och namngivna, vilket styr både gruppering och layout.
- Alternerande vänster och höger på desktop, men allt till höger på mobil.
- Emoji används som ikoner för podcast, video och wiki. SVG är ett senare val om
  emojin visar sig otillräcklig.

## Environments and operations

`git push` till `main` bygger och driftsätter via GitHub Pages. Ingen backend,
inga hemligheter, inga migreringar. Den fullständiga arbetslistan står i
`to-do-list.md`.
