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

## Bilder

- [ ] Hitta bild till de nio händelser som saknar en. Commons är genomsökt utan
      resultat, så det krävs en annan fri källa (Arbetarrörelsens arkiv,
      Digitalt museum, Nordiska museet). Skälen står i `NO_AUTO_IMAGE` i
      `scripts/download-images.py`. Viktigast: `1902-saf`, `1962-forskola`,
      `1976-mbl`.
- [ ] Bildtext till `1890-folkets-hus` och `1931-adalen`. Kräver att någon tittar
      på bilderna och avgör vad de föreställer.
- [ ] Överväg att visa bildkredit även vid kortens miniatyrbilder, inte bara i
      modalen.
- [ ] Kontrollera att de 20 nya bilderna ser rimliga ut i verklig rendering. De
      är valda utifrån filsidans beskrivning, inte utifrån hur de ser ut i kortet.

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
