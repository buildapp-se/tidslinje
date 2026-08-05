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

- [ ] Filtrering mellan Sverige och världen.
- [ ] Sökfunktion.
- [ ] SVG-ikoner om emojin visar sig otillräcklig.

## Städning

- [ ] Hårdkodade strängar finns i `App.jsx` och `Modal.jsx` trots att
      dokumentationen säger motsatsen. Lös motsägelsen, antingen i koden eller i
      dokumentet.
