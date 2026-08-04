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

## Epoker

Namnges och definieras i `Timeline.jsx` i konstanten `EPOCHS`.

| Slug | Titel | År |
|---|---|---|
| `informera-och-agitera` | Informera och agitera | 1846-1931 |
| `folkhemmet-och-valfardsstaten` | Folkhemmet och välfärdsstaten | 1932-1983 |
| `forvaltande` | Förvaltande | 1985-2026 |

## Datamodell

Datafilen är `src/data/events.json` och redigeras för hand i en texteditor.

```json
{
  "id": "1898-lo",
  "year": 1898,
  "title": "LO bildas",
  "epoch": "informera-och-agitera",
  "country": "sverige",
  "size": "large",
  "short": "Kort beskrivning, visas på kortet",
  "long": "Lång text, visas i modalen",
  "tags": ["organisation", "bildande"],
  "persons": [],
  "links": [
    { "type": "podcast", "url": "https://..." },
    { "type": "video", "url": "https://..." },
    { "type": "wiki", "url": "https://..." }
  ]
}
```

| Fält | Värden |
|---|---|
| `size` | `large`, `medium`, `small` |
| `country` | `sverige`, `världen` |
| `links[].type` | `podcast`, `video`, `wiki` |
| `epoch` | se epoktabellen ovan |

**Bildregel:** börjar `image` med `http` tolkas det som extern URL, annars som
`public/images/{image}`. Fältet är valfritt och utelämnas när ingen bild finns.

## Design

- Accentfärg dämpad tegelröd `#B0342B`, definierad som `accent` i `tailwind.config.js`.
- Bakgrund varm krämvit `#EFEBE4` (`cream`), kort i vitt (`paper`).
- Loggan är inline SVG i `src/components/Logo.jsx`, horisontell variant.
- Typografi i loggan: Fraunces serif 500 och Archivo versal grotesk 800, laddade
  via Google Fonts i `index.html`.
- Tre kortstorlekar styrda per händelse i JSON. Modal öppnas vid klick på kort.

## Målgrupp

Fackmedlemmar, kursdeltagare i fackliga kurser och fackligt nyfikna. De kan
kontexten och behöver inte grunderna förklarade.

## Important decisions

- Innehåll ligger i JSON, inte i komponenter, så att en händelse kan läggas till
  utan att röra kod.
- Epokerna är tre och namngivna, vilket styr både gruppering och layout.
- Alternerande vänster och höger på desktop, men allt till höger på mobil.
- Emoji används som ikoner för podcast, video och wiki. SVG är ett senare val om
  emojin visar sig otillräcklig. Wiki-ikonen är dock redan egen SVG i
  `src/components/icons.jsx`.
- Inga UI-bibliotek utöver Tailwind.
- `persons`-fältet finns i JSON men ingen personsida byggs. Filtrering på `country`
  och sökning på `tags` är förberedda i datat men inte byggda.
- Projektet är både ett lärprojekt och en riktig publicering. Begriplighet
  prioriteras över snabbhet.

## Environments and operations

`git push` till `main` bygger och driftsätter via GitHub Pages. Ingen backend,
inga hemligheter, inga migreringar. Den fullständiga arbetslistan står i
`to-do-list.md`.
