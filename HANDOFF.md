---
schemaVersion: 1
status: active
currentGoal: Fylla ut tidslinjens innehåll så att fler händelser har bild och källa
nextAction: Hitta bild till de nio händelser som fortfarande saknar en, i första hand 1902-saf, 1962-forskola och 1976-mbl
blockers: []
reviewedAt: 2026-08-05
---

# Handoff: tidslinje

## Läget

Sajten är live och fungerar. Innehållsarbetet har tagit ett stort steg: 47 av 56
händelser har bild (var 27), alla 56 har minst en källänk (var 50), och varje
publicerad bild har numera en angiven upphovsman.

Arkitektur och konventioner står i `CONTEXT.md`, arbetslistan i `BACKLOG.md`.

## Recent work

- **Bilder till 20 nya händelser.** Kurerade för hand från Wikimedia Commons,
  eftersom de flesta av dem är lagar och lagartiklar på Wikipedia saknar foton.
  Valen ligger i `MANUAL` i `scripts/download-images.py` med bildtext.
- **Bildkredit på alla bilder.** Nytt fält `imageCredit` med `caption`, `by` och
  `source`. Modalen visar det som `<figcaption>` med länk till Commons filsida.
  Bilderna är nästan alla CC BY eller CC BY-SA och de licenserna kräver att
  upphovsmannen namnges, vilket sajten inte gjorde tidigare.
- **Källänkar till sex händelser** som helt saknade det. Nu har alla 56 en källa.
- **Tre sakfel rättade i texterna:** Timbro grundades av SAF, inte av Svenskt
  Näringsliv som bildades först 2001. Huvudentreprenörsansvaret kom 2015 via
  Byggavtalet, lagen (2018:1472) först 2018. Båda stod fel i `events.json`.
- **Fyra buggar i `scripts/download-images.py`:**
  - `is_probably_icon()` jämförde mot mönster med understreck, men filnamn från
    artikellistan kommer med mellanslag. Halva `SKIP_PATTERNS` var därför död
    kod, och en länskarta hamnade som bild på ABF.
  - `find_image()` returnerade Wikipedias auto-valda sidbild helt ofiltrerad.
    Alla kontroller låg i den andra grenen.
  - Nedladdning via `Special:FilePath` gav 429 genomgående. Wikimedia stryper
    wikifronten hårdare än mediaservern; adressen slås nu upp via API:et.
  - Backoffen var för kort för att rida ut en riktig strypning.
- **`id` `1919-rösträtt` bytt till `1919-rostratt`.** Bildfilen döps efter id:t,
  så det icke-ASCII-id:t gjorde att skriptet aldrig hittade den redan
  nedladdade filen och laddade ner den på nytt varje körning.
- **`imgSrc()` och länkikonerna** utbrutna ur `EventCard.jsx` och `Modal.jsx`
  till `src/shared.jsx` (stod som dubblett i båda).
- **`scripts/test_helpers.py`** tillagt: kontrollerar textparsningen och
  datainvarianterna, bland annat att ingen bild publiceras utan credit.

## Verification

- `python scripts/test_helpers.py` — alla kontroller OK, 56 händelser.
- `npm run build` — bygger utan fel.
- Modalen granskad i webbläsare mot `npm run preview`: bildtext och klickbar
  kreditlänk renderas, noll fel eller varningar i konsolen.
- Kreditens ursprung är belagt, inte gissat: för de 27 gamla bilderna kördes
  samma upplösning om, bilden hämtades på nytt och kodades om med identiska
  inställningar. Bara de som blev byte-identiska med filen på disk fick credit.

## Unresolved details

- **Nio händelser saknar bild**, var och en med dokumenterat skäl i
  `NO_AUTO_IMAGE`: `1902-saf`, `1929-arbetsdomstolen`, `1962-forskola`,
  `1968-komvux`, `1976-mbl`, `1978-timbro`, `1983-jamlikt`, `1994-2dagar`,
  `2000-medling`. Commons saknar helt enkelt fria, relevanta och tidsmässigt
  rimliga bilder för dem. Tre av dem hade tidigare en bild som togs bort för
  att den var direkt missvisande (Svenskt Näringslivs hus från 2012 för SAF
  1902, ett USAID-foto av ett daghem i Afghanistan för svensk förskola).
- **Tio bilder byttes ut** för att deras ursprung inte gick att belägga.
  Wikipedia-artiklarna har bytt huvudbild sedan de laddades ner första gången.
  De nya bilderna kommer från samma upplösning och är creditade.
- **Två bilder saknar bildtext**, `1890-folkets-hus` och `1931-adalen`. Filnamnen
  (`1maj_085.jpg`, `1led0513adalen.jpg`) säger inte vad de föreställer, och en
  påhittad bildtext är sämre än ingen. Kreditraden visas ändå.
- **Bildtexten visas bara i modalen**, inte på kortens miniatyrbilder.
- `1901-forlossning` är daterad till 1901, men lagen är från 17 oktober 1900 och
  trädde i kraft året därpå. Källan säger 1900. Årtalet kan behöva justeras.
- Hårdkodade strängar i `App.jsx` och `Modal.jsx` står fortfarande i konflikt med
  vad dokumentationen påstår.

## Resume here

Nästa steg är de nio bildlösa händelserna. `1902-saf`, `1962-forskola` och
`1976-mbl` är de som stör mest, eftersom de är centrala poster. Commons räckte
inte, så det behövs en annan fri källa: Arbetarrörelsens arkiv och bibliotek,
Digitalt museum eller Nordiska museet. Lägg in fyndet i `MANUAL` i
`scripts/download-images.py` och kör `python scripts/download-images.py`.
