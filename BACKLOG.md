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

- [ ] Hitta bild till de nio händelser som saknar en. Commons är genomsökt utan
      resultat, så det krävs en annan fri källa (Arbetarrörelsens arkiv,
      Digitalt museum, Nordiska museet). Skälen står i `NO_AUTO_IMAGE` i
      `scripts/download-images.py`. Viktigast: `1902-saf`, `1962-forskola`,
      `1976-mbl`.
- [ ] Ersätt bilden på `1890-folkets-hus`. Den föreställer ett modernt
      förstamajmöte i Stockholm, medan posten handlar om invigningen i
      Kristianstad 1890. Bildtexten säger nu rakt ut vad bilden är, men ett foto
      på huset i Kristianstad vore rätt bild.
- [ ] **Beskär bort negativramen på `1963-4veckor`.** Filen är en oputsad
      negativskanning: tjock svart ram och ett handskrivet arkivnummer `1-2886`
      tvärs över överkanten. Det ser ut som en trasig bild, inte som ett foto.
      Beskärningen räcker; motivet i sig är rätt, om än litet.
- [ ] **Byt bild på `1978-5veckor`.** Den är mörk och lågkontrastig och läses som
      ett uthus med en svart gapande öppning, inte som en sommarstuga. Kortets
      kvadratiska beskärning träffar nästan bara skuggan.
- [ ] **Byt bild på `1912-abf`.** Förgrunden är en kyrkogård med gravstenar och
      ett stenkors; ABF-huset står i bakgrunden. En centrerad 64 px-beskärning
      landar på en gul länga och träd, alltså inte på ABF alls.
- [ ] **Byt bild eller bildtext på `1980-storlockout`.** Bildtexten lovar en
      förstamajdemonstration utanför SAF, men bilden domineras av Grand Hôtel med
      svenska flaggor och en tom asfaltsyta. Demonstrationen syns knappt.
- [ ] Överväg `1951-3veckor`. Ett svartvitt flygfoto över sjö och skog utan
      människor säger ingenting om semester och blir en mörk fläck vid 64 px.
      Inte missvisande, bara innehållslöst.
- [ ] Titta en gång till på tre till: `1974-las-fml` (Palme står i profil bortvänd
      och är oigenkännlig i miniatyr, och inget i bilden säger demonstration),
      `2015-huvudentreprenad` (spårvägsunderhåll snarare än byggarbetsplats, och en
      korvreklam med pris syns tydligt i bild) och `1906-december` (fotot ser ut att
      vara från sekelskiftet, inte 1936 som källfilnamnet påstår).
- [ ] Överväg att visa bildkredit även vid kortens miniatyrbilder, inte bara i
      modalen.

## Innehåll

- [ ] Kontrollera årtalet för `1901-forlossning`. Lagen är från 1900 och trädde i
      kraft 1901.
- [ ] Hitta fler poddavsnitt. Historiepodden om Seskaröupproret är redan inlagd.
- [ ] Fler händelser i `events.json`.

## Funktioner

- [ ] SVG-ikoner om emojin visar sig otillräcklig.
- [ ] Överväg om sökningen ska visa vilket fält som gav träffen. I dag ser man
      inte varför Saltsjöbadsavtalet dyker upp på `semester`; svaret står i den
      långa texten, som bara syns i modalen.

## Städning

- [ ] Händelsetexterna i `events.json` använder tankstreck genomgående, till
      exempel "Typografernas förening i Stockholm grundas — Sveriges äldsta
      kända fackförening". Husregeln för svensk text är komma, kolon eller ny
      mening i stället. Ändringen rör 56 poster och är ren redigering, inte kod.

## Captured

- [ ] [P2] [Wish] Bygga en funktion för tidslinjen. lägga till i tidslinjen ett spel som liknar spelet Hittster där man lägger kort för eller efter ett annat kort om det är för eller efter i tidslinjen.
