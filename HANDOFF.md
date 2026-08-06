---
schemaVersion: 1
status: active
currentGoal: Fylla ut tidslinjens innehåll så att fler händelser har bild och källa
nextAction: Granska de 26 handplockade bilderna mot sina bildtexter genom att faktiskt titta på filerna i public/images, och notera vilka som är missvisande eller oläsliga i kortets 64 px-beskärning
blockers: []
reviewedAt: 2026-08-06
---

# Handoff: tidslinje

## Sökning och områdesfilter, 2026-08-06

Båda punkterna under **Funktioner** i backloggen är byggda. `CONTEXT.md` sa att
de var "förberedda i datat men inte byggda"; nu är läsvägen byggd och datat är
orört.

- **Matchningen ligger i `src/search.js`**, inte i komponenten. Filen är ren
  JavaScript utan JSX och utan `import.meta.env`, vilket är hela poängen: då kan
  `node scripts/test_search.js` importera den utan testramverk, precis som
  `scripts/test_helpers.py` kontrollerar nedladdningsskriptet. `npm test` kör båda.
- **Diakriter normaliseras bort**, så `adalen` hittar `Skotten i Ådalen`. Den som
  söker snabbt skriver sällan å, ä och ö.
- **Flera sökord smalnar av**, de vidgar inte. `strejk 1909` ska ge storstrejken,
  inte allt om strejker plus allt från 1909.
- **Året är sökbart**, inte bara texten.
- Sökläget lever bara i `useState`. Ingen URL-parameter och ingen `localStorage`,
  så en delad länk visar hela tidslinjen och inte någon annans filtrering.

**Motsägelsen om hårdkodade strängar är löst i dokumentet, inte i koden.** Regeln
"innehåll i JSON, inte i komponenter" gäller händelserna. Rubrik, ingress och
knapptexter hör hemma i komponenterna: sajten har ett språk och ingen
översättning, så ett strängregister vore ett extra led utan mottagare. Det står
nu uttryckligen i `CONTEXT.md` i stället för att lämnas åt läsaren att gissa.

### Verifierat 2026-08-06

- `npm test`: båda kontrollerna gröna, 56 händelser.
- `npm run build`: bygger utan fel.
- Kontrollerat i Chrome mot `npm run preview`, både 1440 px och emulerade 390 px:
  `semester` gav `6 av 56 händelser` och epok 1 försvann helt, `semester` plus
  `Världen` gav tomläget med en fungerande rensknapp, `adalen` gav 2 träffar och
  kortet gick att öppna i modalen som vanligt. `document.scrollWidth` är 390 vid
  390 px, alltså ingen vågrät rullning. Noll konsolmeddelanden efter att
  `name`-attributet lades på sökfältet; utan det klagade Chrome på fältet.

### Inte gjort, och varför

Två backlogpunkter påbörjades men avbröts av en användningsgräns i sessionen, inte
av något i projektet:

- **Årtalet för `1901-forlossning`** är fortfarande okontrollerat. Frågan är inte
  bara 1900 mot 1901 utan om "rätt till ledighet" ens är rätt beskrivning: 1900
  års lag är formulerad som ett **förbud för arbetsgivaren** att sysselsätta en
  kvinna de första veckorna efter förlossning. Kontrollera det innan årtalet
  ändras, annars rättas fel sak.
- **De 26 handplockade bilderna** är fortfarande inte granskade i verklig
  rendering. De valdes utifrån Commons filsidas beskrivning, inte utifrån hur de
  ser ut. Två saker ska bedömas: om motivet stämmer med bildtexten, och om det
  håller i kortets kvadratiska 64 px-beskärning, där ett porträtt lätt kapas.

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

**Börja med bildgranskningen**, den är billigast och skyddar det som gör
tidslinjen trovärdig: öppna de 26 filerna i `public/images` som listas i `MANUAL`
i `scripts/download-images.py` och jämför med bildtexten. Det kräver ingen ny
källa, bara att någon faktiskt tittar.

Därefter de nio bildlösa händelserna. `1902-saf`, `1962-forskola` och
`1976-mbl` är de som stör mest, eftersom de är centrala poster. Commons räckte
inte, så det behövs en annan fri källa: Arbetarrörelsens arkiv och bibliotek,
Digitalt museum eller Nordiska museet. Lägg in fyndet i `MANUAL` i
`scripts/download-images.py` och kör `python scripts/download-images.py`.
