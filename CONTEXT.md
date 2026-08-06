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
- `src/shared.jsx` håller det som kort och modal måste vara överens om: `imgSrc()`
  som hanterar Vite base-URL, och länkikonerna. Låg tidigare som dubbletter i båda
  komponenterna.
- `src/search.js` innehåller `filterEvents()`, alltså fritextsökningen och
  områdesfiltret. Filen är ren JavaScript utan JSX och utan Vite-beroenden, just
  för att `node scripts/test_search.js` ska kunna köra den utan testramverk.
  `Timeline` äger sökläget och filtrerar innan händelserna delas per epok, så en
  epok utan träffar försvinner av sig själv.
- `scripts/download-images.py` hämtar och konverterar bilder samt skriver
  `image` och `imageCredit` i `events.json`. `scripts/test_helpers.py` kontrollerar
  skriptets textparsning och datafilens invarianter.

## Constraints

- Händelsens `id` måste vara ren ASCII. Bildfilen döps efter id:t, och å, ä och ö
  har orsakat renderingsproblem förut. Ett id med icke-ASCII gör dessutom att
  nedladdningsskriptet aldrig hittar den redan hämtade filen.
- Varje publicerad bild måste ha `imageCredit`. Bilderna kommer från Wikimedia
  Commons och är nästan alltid CC BY eller CC BY-SA, vilket kräver att
  upphovsmannen namnges. Kan upphovsmannen inte beläggas publiceras inte bilden.
- Hellre ingen bild än en missvisande. En bild som föreställer fel organisation,
  fel land eller fel årtionde gör tidslinjen otillförlitlig.
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
Filnamnet är alltid `images/{id}.webp`.

**Bildkredit:** följer med varje `image` och visas som bildtext i modalen.

```json
"imageCredit": {
  "caption": "Vad bilden faktiskt föreställer, på svenska",
  "by": "Upphovsman, Licens",
  "source": "https://commons.wikimedia.org/wiki/File:..."
}
```

`caption` kan vara tom när motivet inte går att fastställa, men `by` och `source`
måste finnas. Bildtexten skrivs på svenska och ska vara ärlig: många bilder är
tidstypiska illustrationer, inte foton av själva händelsen.

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
  utan att röra kod. Regeln gäller **händelserna**, inte gränssnittets egna
  strängar. Rubrik, ingress, sökfältets etikett och knapptexter står i
  komponenterna, och ska göra det: sajten har ett språk och ingen översättning,
  så ett strängregister vore ett extra led utan mottagare.
- Epokerna är tre och namngivna, vilket styr både gruppering och layout.
- Alternerande vänster och höger på desktop, men allt till höger på mobil.
- Emoji används som ikoner för podcast, video och wiki. SVG är ett senare val om
  emojin visar sig otillräcklig. Wiki-ikonen är dock redan egen SVG i
  `src/components/icons.jsx`.
- Inga UI-bibliotek utöver Tailwind.
- `persons`-fältet finns i JSON men ingen personsida byggs.
- Sökningen matchar år, titel, kort text, lång text och taggar. Den normaliserar
  bort diakriter, så `jamstalldhet` hittar `jämställdhet`. Flera sökord smalnar
  av träffmängden i stället för att vidga den.
- Sökläget lever bara i komponentens `useState`. Ingen URL-parameter och ingen
  `localStorage`: en delad länk ska visa hela tidslinjen, inte någon annans
  filtrering.
- Projektet är både ett lärprojekt och en riktig publicering. Begriplighet
  prioriteras över snabbhet.

## Environments and operations

Driftsättning är två separata steg, och `git push` är inte ett av dem:

1. `git push` till `main` sparar källkoden. Det driftsätter ingenting.
2. `npm run deploy` bygger med `--mode gh` och pushar `dist/` till grenen
   `gh-pages`, som är den GitHub Pages faktiskt serverar.

`npm test` kör båda kontrollerna: `node scripts/test_search.js` för sökningen och
`python scripts/test_helpers.py` för datafilen och nedladdningsskriptet. Inget
testramverk är installerat, och behövs inte för två filer med `assert`.

Sajten ligger på `buildapp.se/tidslinje/`. Ingen backend, inga hemligheter, inga
migreringar. Arbetslistan står i `BACKLOG.md` och läget i `HANDOFF.md`.
