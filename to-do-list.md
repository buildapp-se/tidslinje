# To-do

## Setup
- [x] Projektfiler skapade (ersätter `npm create vite@latest`)
- [x] Tailwind CSS konfigurerat (tailwind.config.js + postcss.config.js + index.css)
- [x] Mappstruktur skapad (`components/`, `data/`)
- [x] `src/data/events.json` skapad, nu 56 händelser
- [x] GitHub Pages konfigurerat i `vite.config.js` — **OBS: byt `base` till ditt repo-namn**

## Komponenter
- [x] `Timeline.jsx` — hämtar JSON, sorterar händelser, renderar listan
- [x] `EventCard.jsx` — tre storlekar, ikonindikationer, thumbnail-stöd
- [x] `Modal.jsx` — lång text, länkikoner, stor bild högst upp, stängs med klick utanför / Escape
- [x] `EpochGroup.jsx` — grupperar kort per epok, alternerande layout

## Design
- [x] Tailwind-tema med `#B0342B` som accentfärg
- [x] Vertikal tidslinje-linje
- [x] Alternerande vänster/höger på desktop, höger på mobil
- [x] Ikoner för podcast / video / wiki (emoji)

## Epoker
- [x] Tre epoker definierade och namngivna

## Länkar
- [x] Svenska Wikipedia-länkar tillagda
- [x] LO Play-videor tillagda (Sundsvallsstrejken, Amalthea, Ådalen, Saltsjöbaden)
- [x] Podcast "Vi bygger landet" (LO) tillagd
- [ ] **Granska 5 flaggade länkar manuellt i webbläsare** (2026-07-06-audit): 3 sverigesradio.se gav 403 (troligen bot-block), 2 lo.se Play-länkar (Ådalen, Saltsjöbaden) timeoutade. Resten av 71 länkar såg friska ut vid stickprov.
- [ ] **Hitta fler podcasts** — t.ex. Historiepodden om Seskaröupproret, och andra relevanta avsnitt

## Bilder
- [x] `EventCard.jsx` visar 64×64px thumbnail (höger om titel, large/medium)
- [x] `Modal.jsx` visar stor bild (208px hög, full bredd) högst upp
- [x] `imgSrc()` hanterar Vite base-URL korrekt för GitHub Pages
- [x] Nedladdningsskript skapat och kört: `scripts/download-images.py` — 27 av 56 händelser har bild
- [x] Bildfilnamn med icke-ASCII tecken hittat och åtgärdat (`1919-rösträtt.webp` → `1919-rostratt.webp`, 2026-07-06)
- [ ] Granska nedladdade bilder och ersätt felaktiga manuellt
- [ ] Lägg till `image`-fält manuellt för resterande 29 händelser utan bild (prio: 1917-seskaro, 1974-las-fml, 2023-tesla)

## Senare
- [ ] Filtrering Sverige / världen
- [ ] Sökfunktion
- [ ] Fler händelser läggs till i JSON
- [ ] SVG-ikoner (ersätt emoji om det behövs)

## Övrigt (från audit 2026-07-06)
- [ ] `project.md` säger inga hårdkodade strängar, men App.jsx (tagline) och Modal.jsx (`LINK_LABEL`, "Stäng") har det — lös vid tillfälle, inte akut
- [ ] `imgSrc()` och `ICONS` är duplicerade i EventCard.jsx och Modal.jsx — extrahera till en delad fil när man ändå är där

## Gjort ✅
- Projektstruktur, alla 14 filer skapade
- 56 händelser inlagda i events.json, fördelade på tre epoker
- Wikipedia-länkar, LO Play-videor och podcastavsnitt tillagda
- Bildstöd implementerat i EventCard och Modal
- Nedladdningsskript för bilder klart och kört
- Modal-tillgänglighet: `role="dialog"`, fokus på stängknapp vid öppning, scroll-lock (2026-07-06)
- package.json-version synkad med version.txt (0.6.1, 2026-07-06)
