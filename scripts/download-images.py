"""
Kör från projektets rot:  python scripts/download-images.py

Kräver:  pip install Pillow requests

Hämtar bilder för varje händelse via flera strategier, i tur och ordning:
  1. Manuell Commons-fil (bara för fall där automatiken väljer fel bild)
  2. sv.wikipedia pageimages-API, Wikipedias egen "huvudbild" för artikeln
  3. sv.wikipedia, alla bilder som faktiskt förekommer i artikeln (prop=images),
     i den ordning de nämns, med ikoner/loggor/kartor/små bilder bortfiltrerade
  4. Samma två steg (2+3) mot en.wikipedia, för händelser med en EN_WIKI-post

Steg 3 är den nya, smartare delen: istället för att bara lita på Wikipedias
auto-vald "sidbild" (som ofta saknas) letar den upp riktiga foton som redan
ligger inbäddade i artikeln, samma sätt som att öppna artikeln och ta första
rimliga bilden, fast automatiskt.

Konverterar till WebP (max 800 px bred) och sparar i public/images/.
Uppdaterar src/data/events.json med image-fältet.
"""

import json, requests, os, io, time, sys, urllib.parse
from PIL import Image
from pathlib import Path

# Windows-konsolen är ofta cp1252 och kraschar på ✓/→ annars.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except AttributeError:
    pass

ROOT       = Path(__file__).parent.parent
EVENTS     = ROOT / "src" / "data" / "events.json"
IMAGES_DIR = ROOT / "public" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {"User-Agent": "ArbetrorrelseTidslinje/1.0 (educational, non-commercial)"}

# Filnamnsmönster som nästan alltid är ikoner/loggor/kartor/vapen, inte foton.
SKIP_PATTERNS = [
    "logo", "icon", "symbol", "flag_of", "ambox", "nuvola", "crystal",
    "disambig", "edit-icon", "padlock", "question_book", "oojs",
    "commons-logo", "wiktionary", "wikisource", "wikidata", "folder",
    "merge-symbol", "portal", "stub", "pd-icon", "cc-by", "gnu-",
    "loudspeaker", "sound-icon", "_map", "map_of", "locator", "wappen",
    "coat_of_arms", "crest", "signature",
]
MIN_WIDTH = 200

# ── Manuella overrides, handplockade Commons-filer ───────────────────────
# Används när automatiken väljer fel bild eller inte hittar någon alls. De
# flesta av dessa händelser är lagar, och lagartiklar på Wikipedia saknar
# nästan alltid foton, så bilden måste väljas för hand.
#
# Format: event-id → {"file": Commons-filnamn utan "File:", "caption": vad
# bilden faktiskt föreställer}. Bildtexten är obligatorisk: flera av bilderna
# är tidstypiska illustrationer snarare än foton av själva händelsen, och då
# måste läsaren kunna se vad hen tittar på.
#
# Alternativt "url" i stället för "file", för bilder som inte ligger på Commons
# (Digitalt museum, Stockholmskällan). Då finns ingen metadata att slå upp, så
# posten måste själv bära "by" (upphovsman och licens) och "source" (objektets
# sida). Licensen är kontrollerad för hand på källsidan innan posten skrevs.
#
# Valfritt "crop": (vänster, topp, höger, botten) som andelar av bildens bredd
# och höjd. Används när Commons-filen är en oputsad skanning med negativram och
# arkivnummer, eller när motivet är litet i en stor bild. Beskärningen ligger
# här och inte som en handredigerad fil, så att en ny körning ger samma resultat.
MANUAL = {
    "1846-typograferna": {
        "file": "Case department at SvD.jpg",
        "caption": "Sättare i Svenska Dagbladets sätteri i Stockholm, 1904",
    },
    "1900-barnsbord": {
        "file": "Arbeterska Vänersborgs tändstickafabrik.jpg",
        "caption": "Arbeterska vid Vänersborgs tändsticksfabrik, omkring 1900",
    },
    # De två bilder som saknade bildtext ända tills någon faktiskt tittade på
    # dem. Båda kom ursprungligen från wiki-automatiken, inte härifrån, men
    # bildtexten hör hemma här: skrivs den bara i events.json försvinner den
    # den dag filen laddas ner på nytt, eftersom imageCredit skrivs över helt.
    #
    # 1890-huset är granskningens värsta fynd så här långt. Posten handlar om
    # invigningen i Kristianstad 1890, men bilden är ett modernt
    # förstamajmöte i Stockholm. Det är samma sorts fel som redan har rensats
    # bort en gång (Svenskt Näringslivs hus från 2012 på SAF 1902). Här räddas
    # den av bildtexten i stället för att tas bort, eftersom den långa texten
    # faktiskt handlar om rörelsen som växte och inte bara om invigningen.
    # Byt ut den om ett foto på huset i Kristianstad dyker upp.
    # Bytt 2026-09-08 från ett modernt förstamajmöte till ett periodfoto. Inget
    # fritt foto av huset i Kristianstad finns; Stockholms Folkets hus från 1902
    # är samma rörelse och samma tid.
    "1890-folkets-hus": {
        "file": "Gamla folkets hus.jpg",
        "caption": "Folkets hus på Barnhusgatan i Stockholm 1902, tolv år efter det första i Kristianstad",
    },
    # Kom från wiki-automatiken med Commons engelska beskrivning som bildtext.
    "1908-amalthea": {
        "file": "Amalthea-1908.jpg",
        "caption": "S/S Amalthea i Malmö hamn 1908, med hålet efter sprängningen",
    },
    "1902-saf": {
        "file": "Saf-huset.jpg",
        "caption": "SAF:s hus på Blasieholmen i Stockholm, tidigt 1900-tal",
    },
    # Arbetsdomstolen har sitt säte i Ryningska palatset, Stora Nygatan 2 A.
    "1929-arbetsdomstolen": {
        "file": "Stora Nygatan 2b, Gamla Stan, Stockholm.jpg",
        "caption": "Porten till Ryningska palatset på Stora Nygatan i Stockholm, där Arbetsdomstolen har sitt säte",
        "crop": (0.0, 0.2, 1.0, 0.95),
    },
    "1962-forskola": {
        "url": "https://dms-cf-01.dimu.org/image/032wYWGgDX7s?dimension=1200x1200",
        "by": "Örebro Kuriren, Örebro läns museum, Public domain",
        "source": "https://digitaltmuseum.se/021016194818",
        "caption": "Barndaghem i Örebro, omkring 1968",
    },
    "1931-adalen": {
        "file": "1led0513adalen.jpg",
        "caption": "Demonstrationståg med fackliga fanor på väg genom Ådalen",
    },
    # Inget fritt foto från Seskarö 1917 finns. Det här är samma protestvåg,
    # en månad tidigare, och bildtexten säger rakt ut var bilden är tagen.
    "1917-seskaro": {
        "file": "Protesterande mödrar till Mjölcentralen Axel Malmström.JPG",
        "caption": "Protesterande mödrar på väg till Mjölkcentralen i Stockholm, 27 april 1917",
    },
    "1919-8timmar": {
        "file": "TM.ETB 849 Rösträttsdemonstration i Trelleborg(?).jpg",
        "caption": "Demonstration i Trelleborg för rösträtt och åtta timmars arbetsdag, före 1918",
    },
    # ABF-huset på Sveavägen låg bakom en kyrkogård i bild; en studiecirkel tio
    # år efter bildandet är både rätt motiv och rätt tid. Ramen beskärs bort.
    "1912-abf": {
        "url": "https://dms-cf-01.dimu.org/image/019EBsm2Kg5pg?dimension=1200x1200",
        "by": "E. Wijgård, Västmanlands läns museum, Public domain",
        "source": "https://digitaltmuseum.se/0210111931767",
        "caption": "ABF:s studiecirkel på Arosgården i Västerås 1922",
        "crop": (0.03, 0.04, 0.97, 0.96),
    },
    # sv-wiki-artikeln om Socialdemokraterna har regeringen Andersson 2021 som
    # sidbild, vilket blir absurt på en post om partiets bildande 1889.
    "1889-sap": {
        "file": "Hjalmar branting stor bild.jpg",
        "caption": "Hjalmar Branting, en av grundarna och partiets förste ledare",
    },
    # Decemberkompromissen slöts mellan LO och SAF. Inget foto från själva
    # uppgörelsen finns fritt. LO:s ordförande i ett riksdagsporträtt från just
    # 1906 ersatte 2026-09-08 ett urklipp av SAF:s von Sydow som visade sig vara
    # från 1890-talet trots filnamnets "1936". Beskärs till porträttet.
    "1906-december": {
        "file": "Riksdagsmän 1906 Lindqvist Herman 18630709-.jpg",
        "caption": "Herman Lindqvist, LO:s ordförande 1900 till 1912, i riksdagsporträtt från 1906",
        "crop": (0.19, 0.29, 0.84, 0.72),
    },
    # Flygfotot över Axamosjön var innehållslöst vid 64 px. Nordiska museets
    # färgbild har en inbränd kreditrad nederst som beskärs bort.
    "1951-3veckor": {
        "file": "Två unga kvinnor i baddräkt på strand. Malen, Båstad, Skåne - Nordiska museet - NMA.0034002.jpg",
        "caption": "Badgäster på stranden vid Malen i Båstad, mitten av 1950-talet",
        "crop": (0.0, 0.0, 1.0, 0.965),
    },
    "1959-atp": {
        "file": "Tage Erlander, Olof Palme och Ingvar Carlsson på Studentafton i Lund.jpg",
        "caption": "Tage Erlander, Olof Palme och Ingvar Carlsson i Lund 1959",
    },
    "1960-kvinnoloner": {
        "file": "Tekoindustri. Kvinnor syr handskar i Laholm - Nordiska museet - NMA.0029900.jpg",
        "caption": "Kvinnor syr handskar i tekoindustrin i Laholm, omkring 1955 till 1960",
    },
    # Negativskanning med svart ram och handskrivet arkivnummer i överkanten.
    # Beskärningen tar bort ramen och centrerar tältet, som annars är litet.
    "1963-4veckor": {
        "file": "NMAx.0087186.jpg",
        "caption": "Tältcamping på en klippäng i Sverige 1957",
        "crop": (0.166, 0.358, 0.791, 0.755),
    },
    "1966-offentliga": {
        "file": "Agreement-between-TCO-and-SACO-352106734844.jpg",
        "caption": "TCO:s delegation granskar slutbudet i avtalet för kommunalanställda, 1962",
    },
    "1971-arbetstid": {
        "file": "Siroccoverkstaden 1966.jpg",
        "caption": "Verkstadsgolvet i Atlas Copcos Siroccoverkstad i Nacka, 1966",
    },
    # Förstamajbilden från 1973 visade Palme i profil, oigenkännlig i miniatyr.
    # Nederländska Nationaal Archief har ett CC0-foto från september 1974, samma
    # år som LAS trädde i kraft. Beskärs så att Palme hamnar i mitten.
    "1974-las-fml": {
        "file": "Premier Den Uyl (links) spreekt met premier Palme van Zweden op ambassade in Den, Bestanddeelnr 927-4474.jpg",
        "caption": "Statsminister Olof Palme i september 1974, året LAS trädde i kraft",
        "crop": (0.42, 0.0, 0.92, 1.0),
    },
    # Semesterårens bilder är illustrationer, inte dokumentation, och måste
    # skilja sig från varandra, annars ser tidslinjen ut att upprepa sig.
    # Därför bara ett stugmotiv: 1978 får det tidstypiska 70-talsfotot.
    "1978-5veckor": {
        "url": "https://dms-cf-01.dimu.org/image/019EBtjzmCe4z?dimension=1600x1600",
        "by": "Gunlög Enhörning, Örebro stadsarkiv, CC BY 4.0",
        "source": "https://digitaltmuseum.se/0210112512517",
        "caption": "Campingplatsen vid Gustavsvik i Örebro 1974",
        "crop": (0.0, 0.2, 0.62, 0.93),
    },
    # Commons enda bild dominerades av Grand Hôtel. Museets arkivpost daterar
    # fotot till maj 1980, alltså mitt i konflikten.
    "1980-storlockout": {
        "url": "https://dms-cf-01.dimu.org/image/019EGLCGG8gY9?dimension=1600x1600",
        "by": "Sven-Erik Gren, Dalarnas museum, CC BY 4.0",
        "source": "https://digitaltmuseum.se/0210114809710",
        "caption": "Strejkaffisch på grinden till Kvarnsvedens pappersbruk i Borlänge under storkonflikten i maj 1980",
    },
    "1983-lontagarfonder": {
        "file": "Rudolf-Meidner-143458166346.jpg",
        "caption": "Ekonomen Rudolf Meidner, mannen bakom löntagarfondsförslaget, 1966",
    },
    "1985-kreditreglering": {
        "file": "Riksbankshuset April 2015.jpg",
        "caption": "Riksbankens huvudkontor i Stockholm, där utlåningstaket avskaffades 1985",
    },
    "1991-27dagar": {
        "file": "Nybrostrand beach 20130717 008F (9313937352).jpg",
        "caption": "Badstrand vid Nybrostrand utanför Ystad",
    },
    "2007-lex-laval": {
        "file": "European Court of Justice (ECJ) in Luxembourg with flags 0017 (1674479483).jpg",
        "caption": "EU-domstolen i Luxemburg, som avgjorde Lavalmålet i december 2007",
    },
    "2007-a-kassa": {
        "file": "Fredrik Reinfeldt (3994691715).jpg",
        "caption": "Statsminister Fredrik Reinfeldt 2009",
    },
    "2007-ava": {
        "file": "Littorin.jpg",
        "caption": "Sven Otto Littorin, arbetsmarknadsminister när allmän visstid infördes",
    },
    "2015-huvudentreprenad": {
        "file": "Man working with a jackhammer in Lysekil.jpg",
        "caption": "Byggnadsarbetare med tryckluftshammare i Lysekil 2022",
    },
    "2016-hamnkonflikten": {
        "file": "2015-07-02 ANNA SIRKKA im Hafen von Göteborg RB1507.jpg",
        "caption": "Fartyg vid APM Terminals i Göteborgs hamn 2015, året före konflikten",
    },
    "2019-strejkratt": {
        "file": "Assembly hall of the Riksdag Tour 1 Wikimania 2019 02.jpg",
        "caption": "Riksdagens plenisal, fotograferad i augusti 2019",
    },
    # Inga fria foton från själva Teslastrejken finns. Butiken är det närmaste
    # man kommer Teslas svenska verksamhet, och bildtexten döljer inte det.
    "2023-tesla": {
        "file": "Goteborg salon Tesla 1.jpg",
        "caption": "Teslas butik i Göteborg 2016. Strejken gällde Teslas svenska verksamhet",
    },
}

# ── Händelser som ska lämnas utan bild ────────────────────────────────────
# Genomsökta för hand utan att någon fri och relevant bild hittades. Utan den
# här listan gissar automatiken om varje gång: Timbro-artikeln gav ett porträtt
# av John Locke, och "världens mest jämlika land" gav en Gini-karta från 2014.
# En felaktig bild är sämre än ingen bild alls.
NO_AUTO_IMAGE = {
    # Genomsökt igen 2026-09-08 (Commons, Digitalt museum, Stockholmskällan,
    # Arbetarrörelsens arkiv på Flickr). Det som fanns var CC BY-NC eller fel tid.
    "1968-komvux":   "Uppsala-Bild har periodfoton av vuxenutbildning, alla CC BY-NC-ND; Commons har bara moderna skolhus",
    "1976-mbl":      "ingen fri bild av Ingemund Bengtsson från 1974-76; en andra Palmebild bredvid LAS 1974 vore upprepning",
    "1978-timbro":   "inget foto av Sture Eskilsson finns fritt, Commons Timbro-kategori är debattbilder från 2014",
    "1983-jamlikt":  "abstrakt händelse, varje bild vore godtycklig",
    "1994-2dagar":   "inget fritt foto från krisåren 1992-94 (Bildt, Carlsson, Dennis); Riksbankshuset är redan använt på 1985",
    "2000-medling":  "enda Commons-bilden av Drottninggatan 89 domineras av SBAB:s och Boolis logotyper",
    # Nya händelser 2026-09-08. Spärrade tills bilden är vald för hand: utan
    # spärr hämtar automatiken artikelns sidbild, och det var så en länskarta
    # och ett daghem i Afghanistan hamnade i tidslinjen förra gången.
    **{eid: "ny händelse, bild inte handplockad ännu" for eid in (
        "1890-forsta-maj", "1899-akarpslagen", "1902-storstrejken", "1919-ilo",
        "1928-kollektivavtalslagen", "1936-forhandlingsratt", "1938-semesterlagen",
        "1944-tco", "1971-saco-konflikten", "1974-foraldraforsakring",
        "1977-arbetsmiljolagen", "1997-industriavtalet", "2022-nya-las",
    )},
}

# ── Alternativa engelska Wikipedia-artiklar för events med svag sv-wiki ───
EN_WIKI = {
    "1879-sundsvall":    "1879_Sundsvall_strike",
    "1889-sap":          "Swedish_Social_Democratic_Party",
    "1898-lo":           "Swedish_Trade_Union_Confederation",
    "1906-december":     "December_Compromise",
    "1908-amalthea":     "Amalthea_bombing",
    "1909-storstrejk":   "1909_Swedish_general_strike",
    "1912-abf":          "Arbetarnas_Bildningsförbund",
    "1914-ww1":          "World_War_I",
    "1917-ryska-rev":    "Russian_Revolution",
    "1918-finska-inb":   "Finnish_Civil_War",
    "1919-rostratt":     "Women%27s_suffrage_in_Sweden",
    "1929-borskrasch":   "Wall_Street_Crash_of_1929",
    "1931-adalen":       "Ådalen_shootings",
    "1932-sap-makten":   "Per_Albin_Hansson",
    "1938-saltsjobad":   "Saltsjöbaden_Agreement",
    "1939-ww2":          "World_War_II",
    "1959-atp":          "Allmän_tilläggspension",
    "1969-gruvstrejk":   "1969%E2%80%931970_Swedish_miners%27_strike",
    "1971-arbetstid":    "Working_time",
    "1974-las-fml":      "Employment_Protection_Act_(Sweden)",
    "1976-mbl":          "Co-determination",
    "1983-lontagarfonder": "Meidner_plan",
    "1986-palme":        "Olof_Palme",
    "1989-berlinmuren":  "Fall_of_the_Berlin_Wall",
    "2007-lex-laval":    "Laval_case",
    "2007-a-kassa":      "Unemployment_benefits",
}

# ─────────────────────────────────────────────────────────────────────────

def commons_url(filename, width=800):
    """Direktlänk till en Commons-fil, via API:et.

    Den självklara vägen, Special:FilePath, är en wikisida som redirectar till
    mediaservern, och wikifronten stryps betydligt hårdare än
    upload.wikimedia.org. Vid en skur av hämtningar svarade FilePath 429 på
    varenda bild medan API-anropen gick igenom som vanligt. Därför slås den
    riktiga mediaadressen upp via API:et istället, och nedladdningen sker
    direkt mot mediaservern som är CDN-cachad."""
    fn = filename.replace(" ", "_")
    r = api_get(
        "https://commons.wikimedia.org/w/api.php",
        {"action": "query", "titles": f"File:{fn}", "prop": "imageinfo",
         "iiprop": "url", "iiurlwidth": width, "format": "json"},
    )
    if r is not None:
        for page in r.json().get("query", {}).get("pages", {}).values():
            info = page.get("imageinfo")
            if info:
                # thumburl är nedskalad redan hos Wikimedia; originalet kan vara
                # tiotals megapixlar och är onödigt att dra hem.
                return info[0].get("thumburl") or info[0]["url"]
    # Faller tillbaka på den gamla vägen om API:et inte svarar.
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(fn)}"

def is_probably_icon(filename):
    # Filnamn kommer hit i två former: med mellanslag från artikellistan
    # (prop=images ger wikititlar) och med understreck från URL:er. Mönstren
    # nedan är skrivna med understreck, så utan den här normaliseringen slog
    # hälften av dem aldrig till, det var så en länskarta hamnade på ABF.
    lower = filename.lower().replace(" ", "_")
    if lower.endswith(".svg") or lower.endswith(".gif"):
        return True
    return any(p in lower for p in SKIP_PATTERNS)

def api_get(url, params, retries=5):
    """GET med enkel backoff mot 429/5xx, MediaWiki-API:et är flaggigt
    under skurar av förfrågningar, men brukar svara normalt efter en paus.

    Backoffen börjar på 5s och dubblas: en hel körning tar runt en minut i
    normalfallet, men när Wikimedia väl har strypt IP:n räcker inte några
    sekunders väntan, och då är det bättre att skriptet väntar ut det än att
    det rapporterar tomt resultat som om bilderna inte fanns."""
    wait = 5
    for attempt in range(retries):
        try:
            r = requests.get(url, params=params, headers=HEADERS, timeout=12)
        except Exception as e:
            print(f"    nätverksfel: {e}")
            return None
        if r.status_code == 200:
            return r
        if r.status_code in (429, 500, 502, 503) and attempt < retries - 1:
            print(f"    HTTP {r.status_code}, väntar {wait}s och försöker igen")
            time.sleep(wait)
            wait *= 2
            continue
        print(f"    HTTP {r.status_code}")
        return None
    return None

def wiki_pageimage(lang, article):
    """Wikipedias egen auto-valda 'sidbild', om den finns."""
    r = api_get(
        f"https://{lang}.wikipedia.org/w/api.php",
        {"action": "query", "titles": article, "redirects": 1,
         "prop": "pageimages", "pithumbsize": 800, "format": "json"},
    )
    if r is None:
        return None
    pages = r.json()["query"]["pages"]
    for page in pages.values():
        if "thumbnail" in page:
            return page["thumbnail"]["source"]
    return None

def wiki_article_images(lang, article, limit=10):
    """Bilder som faktiskt förekommer i artikeln, i nämnd ordning."""
    r = api_get(
        f"https://{lang}.wikipedia.org/w/api.php",
        {"action": "query", "titles": article, "redirects": 1,
         "prop": "images", "imlimit": 50, "format": "json"},
    )
    if r is None:
        return []
    pages = r.json()["query"]["pages"]
    names = []
    for page in pages.values():
        for img in page.get("images", []):
            name = img["title"].split(":", 1)[-1]
            if not is_probably_icon(name):
                names.append(name)
    return names[:limit]

def best_photo_url(filenames):
    """Slår upp riktiga mått/mime för kandidaterna (via Commons imageinfo)
    och returnerar URL:en för första som är ett tillräckligt stort foto."""
    if not filenames:
        return None
    titles = "|".join(f"File:{f}" for f in filenames)
    r = api_get(
        "https://commons.wikimedia.org/w/api.php",
        {"action": "query", "titles": titles,
         "prop": "imageinfo", "iiprop": "url|size|mime", "format": "json"},
    )
    if r is not None:
        pages = r.json()["query"]["pages"]
        by_name = {}
        for page in pages.values():
            info = page.get("imageinfo")
            if info:
                key = page["title"].split(":", 1)[-1].replace(" ", "_")
                by_name[key] = info[0]
        for name in filenames:
            info = by_name.get(name.replace(" ", "_"))
            if not info:
                continue
            if info.get("mime") not in ("image/jpeg", "image/png"):
                continue
            if info.get("width", 0) < MIN_WIDTH:
                continue
            return info["url"]
    return None

def commons_filename(img_url):
    """Plockar ut Commons-filnamnet ur en bild-URL. Både thumbnails
    (.../thumb/a/ab/Namn.jpg/800px-Namn.jpg) och original (.../a/ab/Namn.jpg)
    pekar på samma fil, och det är filnamnet som identifierar den på Commons."""
    path = urllib.parse.urlparse(img_url).path
    if "/thumb/" in path:
        path = path.rsplit("/", 1)[0]          # kasta thumbnail-delen
    return urllib.parse.unquote(path.rsplit("/", 1)[-1])

def commons_credit(img_url, caption=None):
    """Hämtar upphovsman och licens från Commons.

    Nästan alla bilder här är CC BY eller CC BY-SA, och de licenserna KRÄVER
    att upphovsmannen namnges där bilden visas. Utan det här fältet bryter
    sajten mot licensen, så en bild utan credit läggs hellre inte till alls.
    """
    filename = commons_filename(img_url)
    r = api_get(
        "https://commons.wikimedia.org/w/api.php",
        {"action": "query", "titles": f"File:{filename}", "prop": "imageinfo",
         "iiprop": "extmetadata",
         "iiextmetadatafilter": "LicenseShortName|Artist|ImageDescription",
         "format": "json"},
    )
    if r is None:
        return None
    for page in r.json().get("query", {}).get("pages", {}).values():
        info = page.get("imageinfo")
        if not info:
            continue
        meta = info[0].get("extmetadata", {})
        artist = tidy_artist(html_to_text(meta.get("Artist", {}).get("value", "")))
        license_ = html_to_text(meta.get("LicenseShortName", {}).get("value", ""))

        # Commons-beskrivningen skrivs nästan alltid på engelska och sajten är
        # på svenska, så den sparas inte, den skrivs bara ut som stöd när en
        # svensk bildtext ska formuleras för hand.
        desc = html_to_text(meta.get("ImageDescription", {}).get("value", ""))
        if desc and not caption:
            print(f"    commons säger: {desc[:120]}")

        return {
            "caption": caption or "",
            "by": ", ".join(p for p in (artist, license_) if p),
            "source": f"https://commons.wikimedia.org/wiki/File:{urllib.parse.quote(filename)}",
        }
    return None

def tidy_artist(artist):
    """Commons dubblerar ofta upphovsmannen ("Unknown author Unknown author"),
    eftersom fältet innehåller både en länktext och en synlig etikett. Städas
    här så att crediten går att läsa."""
    import re
    if not artist:
        return "Okänd upphovsman"
    doubled = re.fullmatch(r"(.+?)\s*\1", artist)
    if doubled:
        artist = doubled.group(1).strip()
    return {"Unknown author": "Okänd upphovsman",
            "Unknown photographer": "Okänd fotograf"}.get(artist, artist)

def html_to_text(value):
    """extmetadata levererar HTML (länkar, <span>, &amp;). Kortet och modalen
    renderar ren text, så taggarna måste bort innan värdet sparas."""
    import re, html
    text = re.sub(r"<[^>]*>", " ", value or "")
    return re.sub(r"\s+", " ", html.unescape(text)).strip()

def find_image(lang, article):
    """Steg 2+3 för ett givet språk: pageimage, annars bästa artikelbild."""
    url = wiki_pageimage(lang, article)
    # Wikipedias auto-valda sidbild gick tidigare rakt igenom utan att passera
    # ikonfiltret, alla kontroller låg i den andra grenen. Då hämtades en
    # världskarta över Gini-index till "Sverige, världens mest jämlika land":
    # pageimages levererar en färdigrenderad PNG av en SVG, så varken
    # SVG-spärren eller "_map"-mönstret fick något att bita i.
    if url and is_probably_icon(commons_filename(url)):
        print(f"    pageimage bortfiltrerad: {commons_filename(url)}")
        url = None
    if url:
        return url, "pageimages"
    candidates = wiki_article_images(lang, article)
    url = best_photo_url(candidates)
    if url:
        return url, "artikelbild"
    return None, None

def sv_article(wiki_url):
    if "sv.wikipedia.org/wiki/" in wiki_url:
        # Wiki-URL:er i events.json är ofta procentkodade (Ådalen → %C3%85dalen).
        # Måste avkodas innan de skickas som titles=, annars dubbelkodas de.
        return urllib.parse.unquote(wiki_url.split("/wiki/")[-1])
    return None

def save_webp(img_url, out_path, max_w=800, crop=None):
    try:
        wait = 5
        attempts = 5
        for attempt in range(attempts):
            r = requests.get(img_url, headers=HEADERS, timeout=20, allow_redirects=True)
            if r.status_code == 200:
                break
            if r.status_code in (429, 500, 502, 503) and attempt < attempts - 1:
                print(f"    HTTP {r.status_code}, väntar {wait}s och försöker igen")
                time.sleep(wait)
                wait *= 2
                continue
            print(f"    HTTP {r.status_code}")
            return False
        ct = r.headers.get("content-type", "")
        if "svg" in ct:
            print("    SVG -> hoppar")
            return False
        img = Image.open(io.BytesIO(r.content))
        if getattr(img, "format", "") == "SVG":
            return False
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            img = bg
        elif img.mode not in ("RGB",):
            img = img.convert("RGB")
        if crop:
            l, t, r, b = crop
            img = img.crop((int(l * img.width), int(t * img.height),
                            int(r * img.width), int(b * img.height)))
        if img.width > max_w:
            img = img.resize(
                (max_w, int(img.height * max_w / img.width)), Image.LANCZOS
            )
        img.save(out_path, "WEBP", quality=82)
        kb = os.path.getsize(out_path) // 1024
        print(f"    OK  {img.width}x{img.height}px  {kb} KB  ->  {out_path.name}")
        return True
    except Exception as e:
        print(f"    fel: {e}")
    return False

# ─────────────────────────────────────────────────────────────────────────

def resolve_image(ev):
    """Alla fyra strategierna i tur och ordning. Returnerar (url, bildtext).
    Bildtexten finns bara för handplockade bilder, för de automatiskt hittade
    hämtas den ur Commons-beskrivningen istället.

    Egen funktion för att backfill-skriptet ska kunna köra exakt samma
    upplösning igen och på så vis kunna belägga varifrån en redan nedladdad
    bild kom."""
    eid = ev["id"]

    if eid in NO_AUTO_IMAGE:
        print(f"    lämnas utan bild: {NO_AUTO_IMAGE[eid]}")
        return None, None

    # 1. Manuell Commons-fil. En bild som ska beskäras hämtas i högre upplösning,
    # annars blir utsnittet uppskalat och suddigt.
    if eid in MANUAL:
        if "url" in MANUAL[eid]:
            print(f"    MANUAL (extern källa): {MANUAL[eid]['source']}")
            return MANUAL[eid]["url"], MANUAL[eid]["caption"]
        print(f"    MANUAL: {MANUAL[eid]['file']}")
        width = 2400 if MANUAL[eid].get("crop") else 800
        return commons_url(MANUAL[eid]["file"], width), MANUAL[eid]["caption"]

    # 2+3. sv.wikipedia, pageimage, sedan artikelns egna bilder
    wiki_url = next(
        (l["url"] for l in ev.get("links", [])
         if l["type"] == "wiki" and "sv.wikipedia.org/wiki/" in l["url"]),
        None,
    )
    if wiki_url:
        url, method = find_image("sv", sv_article(wiki_url))
        if url:
            print(f"    sv-wiki ({method}): {url[:70]}...")
            return url, None

    # 4. en.wikipedia, samma två steg
    if eid in EN_WIKI:
        url, method = find_image("en", EN_WIKI[eid])
        if url:
            print(f"    en-wiki ({method}): {url[:70]}...")
            return url, None

    return None, None


def main():
    with open(EVENTS, encoding="utf-8") as f:
        events = json.load(f)

    ok = skip = fail = 0

    for ev in events:
        eid = ev["id"]
        out = IMAGES_DIR / f"{eid}.webp"

        # Redan klar
        if out.exists():
            if "image" not in ev:
                ev["image"] = f"images/{eid}.webp"
            print(f"{eid}  ->  redan klar")
            skip += 1
            continue

        print(f"\n{eid}")
        img_url, caption = resolve_image(ev)

        if not img_url:
            print("    ingen bild hittad")
            fail += 1
            continue

        if not save_webp(img_url, out, crop=MANUAL.get(eid, {}).get("crop")):
            fail += 1
            continue

        manual = MANUAL.get(eid, {})
        if "url" in manual:
            # Ingen Commons-metadata att hämta: posten bär sin egen credit.
            credit = {"caption": caption, "by": manual["by"], "source": manual["source"]}
        else:
            credit = commons_credit(img_url, caption)
        if not credit:
            # Licensen kräver namngivning. Kan vi inte belägga upphovsmannen
            # publicerar vi inte bilden, filen flyttas undan för manuell koll.
            print("    INGEN CREDIT, bilden används inte")
            out.rename(out.with_suffix(".webp.orphan"))
            fail += 1
            continue

        ev["image"] = f"images/{eid}.webp"
        ev["imageCredit"] = credit
        print(f"    credit: {credit['by']}")
        ok += 1
        time.sleep(0.5)   # Commons svarar med 429 om man skurar för hårt

    with open(EVENTS, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*52}")
    print(f"  {ok} nya bilder sparade")
    print(f"  {skip} hoppades över (fanns redan)")
    print(f"  {fail} misslyckades / saknar bild")
    print(f"  events.json uppdaterad")


if __name__ == "__main__":
    main()
