---
schemaVersion: 1
status: active
currentGoal: Tidslinjen är komplett nog att användas i kurs, 69 händelser varav 50 med bild, alla med källa
nextAction: Patrik säger ja eller nej till batchen 2026-09-08 (13 nya händelser, 11 bildbyten, sökledtråd, SVG-ikoner). Sedan bild till de 13 nya händelserna, de står spärrade i NO_AUTO_IMAGE
blockers: []
reviewedAt: 2026-09-16
---

# Handoff: tidslinje

## 2026-09-16: granskningsbatchen

Filterchips, sökfält och sidfotens länk 44 px (`fdeef73`), dämpad text mörkare
(`a202cff`, `66f38d0`: gray-500 gav 4,06 mot sidans bakgrund, gray-600 håller).
Tester gröna, byggt, deployat med `npm run deploy`, mätt live: Lighthouse a11y
100, 0 ytor under 44 px.

## Hela backloggen genomarbetad, 2026-09-08

Chunk-läge på Patriks uppdrag: allt i `BACKLOG.md` en punkt i taget, en commit
per punkt, sju commits `e088389` till `2cb21fd`. Fyra researchagenter gjorde
faktakoll, poddsökning, händelseförslag och bildsökning; varje bild är öppnad
och tittad på innan den togs in, varje ny länk HTTP-kontrollerad.

**Städning.** 38 rader med tankstreck i `events.json` omskrivna per mening
(komma, kolon, parentes eller ny mening, aldrig mekaniskt). Även ingressen i
`App.jsx` och kommentarerna i `download-images.py`.

**Funktioner.** Kortet visar varför det matchar sökningen när ordet inte syns i
år, titel eller kort text: den mening i långtexten som innehåller ordet, annars
taggen (`matchHint` i `src/search.js`, testad). SVG-ikoner för podd och video i
`icons.jsx`; emojin var färgglad, olika stor per plattform och följde inte
hover-färgen bredvid det svarta W:et. Bildkredit som `title`-tooltip på
miniatyrerna.

**Innehåll.** `1901-forlossning` blev `1900-barnsbord`: lagen om minderårigas
och kvinnors arbete i industrin utfärdades 17 oktober 1900 (SFS 1900:75) och
var ett förbud för arbetsgivaren att sysselsätta kvinnan fyra veckor efter
barnsbörd, inte en rätt till ledighet. Belagt i Stjernstedt 1904 och motion
1908:4; ikraftträdandet 1901 är troligt men obelagt. 13 nya händelser
(1890 första maj, 1899 Åkarpslagen, 1902 politiska storstrejken, 1919 ILO,
1928 kollektivavtalslagen, 1936 förenings- och förhandlingsrätt, 1938
semesterlagen, 1944 TCO, 1971 Saco-konflikten, 1974 föräldraförsäkringen,
1977 arbetsmiljölagen, 1997 Industriavtalet, 2022 nya LAS), varje sakuppgift
kontrollerad mot källan i posten; obelagda detaljer ströks (Sveriges
ILO-inträde, föräldrapenningens procentsats, riksdagens exakta beslutsdag
2022). 15 poddavsnitt, bara avsnitt om just händelsen. Sakfel rättat:
Saltsjöbadsavtalet innehöll ingen semester, det var 1938 års semesterlag.

**Bilder.** `1963-4veckor` beskuren (ram och arkivnummer borta). Tre bildlösa
fick bild: `1902-saf` (SAF-huset, tidigt 1900-tal), `1962-forskola` (daghem i
Örebro 1968), `1929-arbetsdomstolen` (porten till Ryningska palatset). Åtta
byten: `1890-folkets-hus` (Stockholm 1902 i stället för modernt möte),
`1978-5veckor` (camping 1974 i färg), `1912-abf` (studiecirkel 1922),
`1980-storlockout` (strejkaffisch daterad maj 1980), `1951-3veckor` (Båstad
1950-tal), `1974-las-fml` (Palme 1974, vänd mot kameran), `2015-huvudentreprenad`
(Lysekil 2022, utan reklam), `1906-december` (Herman Lindqvist 1906; von
Sydow-urklippet var från 1890-talet trots filnamnets 1936). Skriptet tar nu
källor utanför Commons (`url` plus egen `by` och `source` i `MANUAL`, licensen
kontrollerad för hand på Digitalt museum) och reproducerbar beskärning
(`crop` som andelar, hämtas i 2400 px).

**Val tagna åt Patrik.** (1) 1900 i stället för 1901, eftersom bara
utfärdandedatumet är belagt. (2) Semesterfelet i Saltsjöbadsposten rättat utan
att fråga, det var ett sakfel i publicerad text. (3) `1976-mbl` lämnad utan
bild: enda fria kandidaten var en andra Palmebild från 1974, bredvid LAS. (4)
SVG-ikoner byggda, bedömningen var att emojin var otillräcklig. (5) Kredit på
miniatyr som tooltip, inte synlig text. (6) De 13 nya händelserna spärrade i
`NO_AUTO_IMAGE` tills någon valt bild för hand.

**Verifierat 2026-09-08.** `npm test` grönt (69 händelser), `npm run build`
grönt, sökledtråd och ikoner kontrollerade i Chromium mot `npm run preview`
med noll konsolmeddelanden, alla 33 nya länkar svarar 200, licens läst på
källsidan för alla elva nya bilder.

## Web Analytics i policyn, 2026-08-27

Cloudflare-zonen `buildapp.se` injicerar nu `beacon.min.js` (Web Analytics,
cookiefri) i all HTML, även `/tidslinje/`. `public/integritet.html` version 1.1
beskriver det: ny punkt under uppgifter, rättslig grund, cookieavsnittet
omskrivet. Deployat med `npm run deploy`. Inställningen ligger i Cloudflare-
dashboarden för buildapp-se, inte i det här repot.

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

### Bildgranskningen är gjord, och den hittade fyra riktiga fel

Samtliga 26 handplockade bilder är nu öppnade och tittade på, inte bara lästa som
filbeskrivningar. **17 är OK, 4 bör bytas och 5 är tveksamma.** Varje fynd ligger
som en egen punkt i `BACKLOG.md`. De tre värsta är kontrollerade en gång till:

1. **`1963-4veckor` är en oputsad negativskanning.** Tjock svart ram och ett
   handskrivet arkivnummer `1-2886` tvärs över överkanten. Det här är det enda
   fyndet som får sajten att se **trasig** ut snarare än fel, och det är också det
   billigaste att rätta: motivet är rätt, bara ramen ska bort.
2. **`1978-5veckor` föreställer inte en sommarstuga.** Mörk, lågkontrastig bild av
   vad som läses som ett uthus med en svart gapande öppning. Kortets kvadratiska
   beskärning träffar nästan bara skuggan.
3. **`1912-abf` är i praktiken en kyrkogårdsbild.** Gravstenar och ett stenkors
   fyller förgrunden, ABF-huset står bakom. En centrerad 64 px-beskärning landar
   på en gul länga och några träd, alltså inte på ABF.

Den fjärde är `1980-storlockout`, där bildtexten lovar en förstamajdemonstration
utanför SAF men bilden domineras av Grand Hôtel och en tom asfaltsyta.

**Lärdomen är densamma som förra gången någon mätte i stället för att lita på en
bock:** bilderna valdes utifrån vad Commons filsida *skrev*, och en filsida kan
vara helt korrekt om vad bilden föreställer utan att bilden fungerar som
illustration. Ramar, arkivnummer, avstånd till motivet och den kvadratiska
beskärningen syns inte i någon beskrivning.

### Bildtext till de två som saknade den

`1890-folkets-hus` och `1931-adalen` har nu bildtext, skriven efter att ha tittat
på bilderna:

- `1931-adalen` visar ett långt demonstrationståg med fackliga fanor på en grusväg
  genom en dalgång, med åskådare på en plöjd åker. Bildtexten säger just det och
  inget mer; inget datum är påhittat.
- **`1890-folkets-hus` var ett fynd i sig.** Posten handlar om invigningen i
  Kristianstad 1890, men bilden är ett **modernt förstamajmöte i Stockholm**,
  framför Folkets Hus och Dansens Hus. Det är samma sorts fel som redan rensats
  bort en gång, när Svenskt Näringslivs hus från 2012 låg på SAF 1902. Här är den
  behållen men avväpnad: bildtexten säger rakt ut att bilden är senare än huset i
  Kristianstad, och den långa texten handlar faktiskt om rörelsen som växte. Ett
  foto på huset i Kristianstad vore ändå rätt bild, och det står i backloggen.

Båda bildtexterna ligger i `MANUAL` i `scripts/download-images.py`, inte bara i
`events.json`. Skälet är konkret: `main()` hoppar över en händelse vars `.webp`
redan finns, men laddas filen någon gång ner på nytt skrivs `imageCredit` över i
sin helhet med `caption or ""`, och en bildtext som bara stod i JSON vore borta.

### Inte gjort, och varför

- **Årtalet för `1901-forlossning`** är fortfarande okontrollerat, och det beror
  på saknad nätåtkomst i sessionen, inte på projektet. Frågan är inte bara 1900
  mot 1901 utan om "rätt till ledighet" ens är rätt beskrivning: lagen från 1900
  ska enligt uppgift vara formulerad som ett **förbud för arbetsgivaren** att
  sysselsätta en kvinna de första veckorna efter förlossning. Belägg det mot
  riksdagen.se eller SFS innan årtalet ändras, annars rättas fel sak. **Gissa
  inte** på minnet; det här är en publicerad faktapost.
- **Själva bildbytena är inte gjorda.** Granskningen pekar ut vilka som ska bytas,
  men att välja en ersättare kräver Commons och därmed nätåtkomst. Beskärningen av
  `1963-4veckor` kräver bara bildverktyg och är den enda som går att göra utan att
  leta ny bild.

## Läget

Sajten är live och fungerar. 69 händelser, 50 med bild, alla med minst en
källänk, 33 med poddavsnitt, och varje publicerad bild har angiven upphovsman
och licens. Siffrorna gällde 2026-09-08.

Arkitektur och konventioner står i `CONTEXT.md`, arbetslistan i `BACKLOG.md`.

## Recent work

**2026-08-27: integritetspolicy, sajten saknade informationsplikt.**

- Ny `public/integritet.html`, statisk sida i sajtens palett (cream, ink, accent)
  med Fraunces och Archivo och samma inline-logga som appen. Ligger i `public/`
  så Vite kopierar den rakt till `dist/`, ingen React-route behövdes.
- Sidfot med länk tillagd i `src/App.jsx`, appen hade ingen sidfot alls.
- Sajten är den enda av projekten som inte lagrar något alls på besökarens enhet:
  ingen `localStorage`, inga cookies. Policyn säger det rakt ut.
- `npm run build:gh` grönt, `npm test` grönt (56 händelser).


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

- `python scripts/test_helpers.py`: alla kontroller OK, 56 händelser.
- `npm run build`: bygger utan fel.
- Modalen granskad i webbläsare mot `npm run preview`: bildtext och klickbar
  kreditlänk renderas, noll fel eller varningar i konsolen.
- Kreditens ursprung är belagt, inte gissat: för de 27 gamla bilderna kördes
  samma upplösning om, bilden hämtades på nytt och kodades om med identiska
  inställningar. Bara de som blev byte-identiska med filen på disk fick credit.

## Unresolved details

- **Sex händelser saknar bild** med dokumenterat skäl i `NO_AUTO_IMAGE`:
  `1968-komvux`, `1976-mbl`, `1978-timbro`, `1983-jamlikt`, `1994-2dagar`,
  `2000-medling`. Commons, Digitalt museum, Stockholmskällan och
  Arbetarrörelsens arkiv på Flickr är genomsökta 2026-09-08; det som fanns var
  CC BY-NC eller fel årtionde.
- **De 13 nya händelserna saknar bild** och är spärrade i `NO_AUTO_IMAGE` så
  att skriptet inte hämtar en slumpad sidbild.
- **Inget fritt foto av Folkets hus i Kristianstad** finns; posten visar
  Stockholms Folkets hus 1902 med ärlig bildtext.
- **Åtta händelsekandidater** med verifierade fakta men utan skriven text står
  i `BACKLOG.md` under Innehåll.

## Resume here

Vänta på Patriks ja eller nej till batchen 2026-09-08 (se "Val tagna åt Patrik"
överst). Sedan: bild till de 13 nya händelserna, en i taget, samma metod som
2026-09-08: leta på Commons och Digitalt museum, öppna bilden och titta,
kontrollera licensen på källsidan, lägg posten i `MANUAL` (med `url`, `by` och
`source` om den inte ligger på Commons), ta bort id:t ur `NO_AUTO_IMAGE` och
kör `python scripts/download-images.py`.

## Granskning 2026-09-16

Cross-project audit run from elwyn-dash (session 5 in the daily note). Results written to `## Audits` in CONTEXT.md, findings appended to BACKLOG.md under `## Granskning 2026-09-16`. Headers on buildapp.se and the TLS grade are zone-level and are fixed once in Cloudflare, not here.
