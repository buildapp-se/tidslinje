# Backlog

## Klart

- [x] Projektstruktur, Tailwind-tema, mappstruktur och 56 händelser i `events.json`.
- [x] `Timeline`, `EventCard`, `Modal` och `EpochGroup` byggda.
- [x] Tre epoker definierade och namngivna.
- [x] Wikipedia-länkar, LO Play-videor och podcastavsnittet "Vi bygger landet".
- [x] Bildstöd i kort och modal, med `imgSrc()` som klarar Vite base-URL.
- [x] Nedladdningsskript för bilder skrivet och kört.
- [x] Modal-tillgänglighet: `role="dialog"`, fokus på stängknappen, scroll-lock.
- [x] Fem flaggade länkar granskade 2026-07-21, alla fungerar i riktig webbläsare.
- [x] Bildfilnamn med icke-ASCII-tecken åtgärdade.
- [x] Bild till 20 nya händelser, handplockade från Commons. 47 av 56 har bild.
- [x] Källänk till de sex händelser som saknade det. Alla 56 har nu källa.
- [x] Bildkredit (`imageCredit`) på samtliga publicerade bilder, visas i modalen.
- [x] `imgSrc()` och `ICONS` utbrutna till `src/shared.jsx`.
- [x] `id` `1919-rösträtt` bytt till ASCII, så filnamn och id följs åt igen.
- [x] Sakfel rättade: Timbro grundades av SAF, huvudentreprenörsansvaret kom
      2015 via kollektivavtal och först 2018 via lag.
- [x] Fritextsökning och filtrering mellan Sverige och världen. Matchar år,
      titel, texter och taggar, tål att å, ä och ö skrivs som a och o, och har
      egen kontroll i `scripts/test_search.js`.
- [x] Motsägelsen om hårdkodade strängar utredd och löst i `CONTEXT.md`: regeln
      om innehåll i JSON gäller händelserna, inte gränssnittets egna strängar.
- [x] Samtliga 26 handplockade bilder granskade genom att faktiskt öppna filerna.
      17 är OK, 4 bör bytas och 5 är tveksamma. Fynden ligger som egna punkter
      under `Bilder`.
- [x] Bildtext till `1890-folkets-hus` och `1931-adalen`, skriven efter att någon
      tittat på bilderna. Texterna ligger i `MANUAL` i `download-images.py`, inte
      bara i `events.json`, eftersom `imageCredit` skrivs över helt vid en ny
      nedladdning.

## Bilder

- [x] Bild till `1902-saf` (SAF:s hus på Blasieholmen, tidigt 1900-tal),
      `1962-forskola` (daghem i Örebro omkring 1968, Örebro läns museum) och
      `1929-arbetsdomstolen` (porten till Ryningska palatset, AD:s säte).
      Hittade 2026-09-08 på Commons och Digitalt museum, licens kontrollerad på
      källsidan. Skriptet tar nu även bilder utanför Commons (`url` i `MANUAL`).
- [ ] Sex händelser saknar fortfarande bild, skäl i `NO_AUTO_IMAGE`:
      `1968-komvux` (allt periodmaterial är CC BY-NC-ND), `1976-mbl` (ingen fri
      bild av Ingemund Bengtsson 1974-76), `1978-timbro` (inget foto av Sture
      Eskilsson), `1983-jamlikt`, `1994-2dagar` (inget fritt krisfoto 1992-94),
      `2000-medling` (enda bilden av adressen är SBAB-reklam). Genomsökt:
      Commons, Digitalt museum, Stockholmskällan, Arbetarrörelsens arkiv på
      Flickr.
- [x] `1890-folkets-hus` bytt från det moderna förstamajmötet till Folkets hus
      på Barnhusgatan i Stockholm 1902 (Stadsmuseet, PD). Inget fritt foto av
      huset i Kristianstad finns; Halmstads Folkets hus 1905 (CC0) är det enda
      andra periodfotot och sämre i miniatyr.
- [x] `1963-4veckor` beskuren 2026-09-08: ram och arkivnummer borta, tältet
      centrerat. Beskärningen ligger som `crop` i `MANUAL` i nedladdningsskriptet
      och hämtas i högre upplösning, så en ny körning ger samma bild.
- [x] `1978-5veckor`: campingplatsen vid Gustavsvik 1974 i färg (Örebro
      stadsarkiv, CC BY), beskuren mot tält och bil.
- [x] `1912-abf`: ABF:s studiecirkel i Västerås 1922 (Västmanlands läns museum,
      PD). Rätt motiv och tio år efter bildandet, i stället för det moderna huset.
- [x] `1980-storlockout`: strejkaffisch på grinden till Kvarnsvedens pappersbruk,
      daterad maj 1980 av Dalarnas museum (CC BY). Enda fria konfliktfotot från
      1980 som hittades.
- [x] `1951-3veckor`: Gunnar Lundhs färgbild från stranden i Båstad, mitten av
      1950-talet (Nordiska museet, CC BY 4.0), inbränd kreditrad bortbeskuren.
- [x] `1974-las-fml`: Palme i september 1974 (Nationaal Archief, CC0), beskuren
      så att han står i mitten och vänd mot kameran.
- [x] `2015-huvudentreprenad`: byggnadsarbetare med tryckluftshammare i Lysekil
      2022 (CC BY-SA 4.0), utan reklam i bild.
- [x] `1906-december`: von Sydow-bilden var ett tidningsurklipp från 1890-talet
      trots filnamnets 1936 (källan är Lindorms bok från 1936). Ersatt med LO:s
      ordförande Herman Lindqvist i riksdagsporträtt från just 1906 (CC0).
- [x] Bildkredit på kortens miniatyrer som `title`-tooltip (2026-09-08). Synlig
      text får inte plats vid 64 px, och den fulla krediten med källänk står i
      modalen ett klick bort.

## Innehåll

- [x] `1901-forlossning` rättad till `1900-barnsbord` (2026-09-08). Lagen om
      minderårigas och kvinnors arbete i industrin utfärdades 17 oktober 1900
      (SFS 1900:75) och var ett förbud för arbetsgivaren att sysselsätta kvinnan
      fyra veckor efter barnsbörd, inte en rätt till ledighet. Belagt i
      Stjernstedt 1904 (Gutenberg) och motion 1908:4; ikraftträdandet 1901 är
      troligt men obelagt, därför året då lagen utfärdades.
- [x] 15 poddavsnitt tillagda 2026-09-08 (Historiepodden, Vi bygger landet, P3
      Dokumentär, Vetenskapsradion Historia, Dagens Arbete, Fack You, Förändra).
      Bara avsnitt om just händelsen. Ingen träff hittades för 18 poster, bland
      dem 1846, 1898, 1902-saf, 1912, 2007 (alla tre) och 2019.
- [x] 13 händelser tillagda 2026-09-08, alla faktakontrollerade mot källorna i
      posten: 1890 första maj, 1899 Åkarpslagen, 1902 politiska storstrejken,
      1919 ILO, 1928 kollektivavtalslagen, 1936 förenings- och förhandlingsrätt,
      1938 semesterlagen, 1944 TCO, 1971 Saco-konflikten, 1974
      föräldraförsäkringen, 1977 arbetsmiljölagen, 1997 Industriavtalet, 2022
      nya LAS. Sakfel rättat på vägen: Saltsjöbadsavtalet innehöll ingen
      semester, det var 1938 års semesterlag.
- [ ] Fler kandidater med verifierade fakta men utan skriven text: 1955 allmän
      sjukförsäkring, 1913 folkpension, 1945 metallstrejken, 1979
      jämställdhetslagen, 1995 EU-medlemskap, 2003 kommunalstrejken, 2009
      diskrimineringslagen, 1973 styrelserepresentation.
- [ ] Bild till de 13 nya händelserna. De står i `NO_AUTO_IMAGE` tills någon
      valt bild för hand, så att skriptet inte hämtar en slumpad sidbild.

## Funktioner

- [x] SVG-ikoner för podcast och video i `icons.jsx` (2026-09-08). Emojin var
      otillräcklig: färgglad och olika stor per plattform bredvid den svarta
      W-ikonen, och den följde inte länkens hover-färg.
- [x] Sökträffar visar varför kortet är med: när sökordet inte syns i år, titel
      eller kort text visar kortet den mening ur den långa texten som innehåller
      det, annars taggen (`matchHint` i `src/search.js`, kontrollerad i
      `test_search.js`). Byggt 2026-09-08.

## Städning

- [x] Tankstrecken i `events.json` (38 rader, 45 tecken) ersatta med komma,
      kolon, parentes eller ny mening, bedömda per mening 2026-09-08. Även
      ingressen i `App.jsx`. Kvar finns bara bindestreck i intervall (1914–1918).

## Captured

- [ ] [P2] [Wish] Bygga en funktion för tidslinjen. lägga till i tidslinjen ett spel som liknar spelet Hittster där man lägger kort för eller efter ett annat kort om det är för eller efter i tidslinjen.

## Granskning 2026-09-16

Fynd från cockpitens granskningskolumner (Lighthouse mobil, W3C, UX-skript, headers, TLS, OWASP). Mätvärdena står under `## Audits` i CONTEXT.md.

- [ ] `[P2]` Lighthouse: färgkontrast under 4,5:1 någonstans på startsidan (a11y 96). Kör om Lighthouse i DevTools för att se vilka element.
- [ ] `[P3]` UX, Fitts: filterchipsen Alla, Sverige, Världen är 34 px och sökfältet 38 px, konventionen är 44 px.
