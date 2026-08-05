"""
Kör från projektets rot:  python scripts/download-images.py

Kräver:  pip install Pillow requests

Hämtar bilder för varje händelse via flera strategier, i tur och ordning:
  1. Manuell Commons-fil (bara för fall där automatiken väljer fel bild)
  2. sv.wikipedia pageimages-API — Wikipedias egen "huvudbild" för artikeln
  3. sv.wikipedia — alla bilder som faktiskt förekommer i artikeln (prop=images),
     i den ordning de nämns, med ikoner/loggor/kartor/små bilder bortfiltrerade
  4. Samma två steg (2+3) mot en.wikipedia, för händelser med en EN_WIKI-post

Steg 3 är den nya, smartare delen: istället för att bara lita på Wikipedias
auto-vald "sidbild" (som ofta saknas) letar den upp riktiga foton som redan
ligger inbäddade i artikeln — samma sätt som att öppna artikeln och ta första
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

# Filnamnsmönster som nästan alltid är ikoner/loggor/kartor/vapen — inte foton.
SKIP_PATTERNS = [
    "logo", "icon", "symbol", "flag_of", "ambox", "nuvola", "crystal",
    "disambig", "edit-icon", "padlock", "question_book", "oojs",
    "commons-logo", "wiktionary", "wikisource", "wikidata", "folder",
    "merge-symbol", "portal", "stub", "pd-icon", "cc-by", "gnu-",
    "loudspeaker", "sound-icon", "_map", "map_of", "locator", "wappen",
    "coat_of_arms", "crest", "signature",
]
MIN_WIDTH = 200

# ── Manuella overrides — handplockade Commons-filer ───────────────────────
# Används när automatiken väljer fel bild eller inte hittar någon alls. De
# flesta av dessa händelser är lagar, och lagartiklar på Wikipedia saknar
# nästan alltid foton, så bilden måste väljas för hand.
#
# Format: event-id → {"file": Commons-filnamn utan "File:", "caption": vad
# bilden faktiskt föreställer}. Bildtexten är obligatorisk: flera av bilderna
# är tidstypiska illustrationer snarare än foton av själva händelsen, och då
# måste läsaren kunna se vad hen tittar på.
MANUAL = {
    "1846-typograferna": {
        "file": "Case department at SvD.jpg",
        "caption": "Sättare i Svenska Dagbladets sätteri i Stockholm, 1904",
    },
    "1901-forlossning": {
        "file": "Arbeterska Vänersborgs tändstickafabrik.jpg",
        "caption": "Arbeterska vid Vänersborgs tändsticksfabrik, omkring 1900",
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
    # Artikelbilden blev en länskarta innan mönsterfiltret lagade sig. Huset är
    # modernt men det är faktiskt ABF:s, till skillnad från kartan.
    "1912-abf": {
        "file": "ABF-huset.jpg",
        "caption": "ABF-huset på Sveavägen i Stockholm",
    },
    # sv-wiki-artikeln om Socialdemokraterna har regeringen Andersson 2021 som
    # sidbild, vilket blir absurt på en post om partiets bildande 1889.
    "1889-sap": {
        "file": "Hjalmar branting stor bild.jpg",
        "caption": "Hjalmar Branting, en av grundarna och partiets förste ledare",
    },
    # Decemberkompromissen slöts mellan LO och SAF. Inget foto från själva
    # uppgörelsen finns fritt, så arbetsgivarsidans ledande man får stå för
    # den — bildtexten säger vem han är så att det inte läses som en LO-bild.
    "1906-december": {
        "file": "Hjalmar von Sydow 1936.JPG",
        "caption": "Hjalmar von Sydow, SAF:s verkställande direktör från 1907",
    },
    "1951-3veckor": {
        "file": "Axamosjön 1956.jpg",
        "caption": "Badplatsen vid Axamosjön utanför Jönköping, 1956",
    },
    "1959-atp": {
        "file": "Tage Erlander, Olof Palme och Ingvar Carlsson på Studentafton i Lund.jpg",
        "caption": "Tage Erlander, Olof Palme och Ingvar Carlsson i Lund 1959",
    },
    "1960-kvinnoloner": {
        "file": "Tekoindustri. Kvinnor syr handskar i Laholm - Nordiska museet - NMA.0029900.jpg",
        "caption": "Kvinnor syr handskar i tekoindustrin i Laholm, omkring 1955 till 1960",
    },
    "1963-4veckor": {
        "file": "NMAx.0087186.jpg",
        "caption": "Tältcamping på en klippäng i Sverige 1957",
    },
    "1966-offentliga": {
        "file": "Agreement-between-TCO-and-SACO-352106734844.jpg",
        "caption": "TCO:s delegation granskar slutbudet i avtalet för kommunalanställda, 1962",
    },
    "1971-arbetstid": {
        "file": "Siroccoverkstaden 1966.jpg",
        "caption": "Verkstadsgolvet i Atlas Copcos Siroccoverkstad i Nacka, 1966",
    },
    "1974-las-fml": {
        "file": "Palme 1973.jpg",
        "caption": "Olof Palme vid förstamajdemonstrationen på Norra Bantorget 1973",
    },
    # Semesterårens bilder är illustrationer, inte dokumentation, och måste
    # skilja sig från varandra — annars ser tidslinjen ut att upprepa sig.
    # Därför bara ett stugmotiv: 1978 får det tidstypiska 70-talsfotot.
    "1978-5veckor": {
        "file": "Stora bygärde, sommarstuga, byggd 1962.jpg",
        "caption": "Svensk sommarstuga fotograferad på 1970-talet",
    },
    "1980-storlockout": {
        "file": "Storkonflikten 1980, demonstration 1 maj.jpg",
        "caption": "Förstamajdemonstration utanför SAF:s huvudkontor under storkonflikten 1980",
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
        "file": "Construction workers at a site on Södra Hamngatan, Gothenburg.jpg",
        "caption": "Byggarbetsplats i centrala Göteborg 2023",
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
    "1902-saf":      "sidbilden är Näringslivets hus 2012, men Svenskt Näringsliv bildades 2001, inte SAF 1902",
    "1962-forskola": "sv-wiki gav ett USAID-foto av ett daghem i Afghanistan, inget svenskt periodfoto finns",
    "1929-arbetsdomstolen": "Commons har bara utländska arbetsdomstolar, inte den svenska",
    "1968-komvux":   "inget periodfoto av svensk vuxenutbildning finns fritt",
    "1976-mbl":      "inga svenska politik- eller arbetsplatsfoton från mitten av 70-talet",
    "1978-timbro":   "bara logotyper och bilder på Svenskt Näringsliv, som bildades först 2001",
    "1983-jamlikt":  "abstrakt händelse, enda kandidaterna var 25-40 år yngre än den",
    "1994-2dagar":   "skulle bli ett andra sommarstugemotiv, upprepning i tidslinjen",
    "2000-medling":  "Commons har bara grannfastigheterna till myndighetens adress",
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

def commons_url(filename):
    """Direktlänk till en Commons-fil, via API:et.

    Den självklara vägen, Special:FilePath, är en wikisida som redirectar till
    mediaservern — och wikifronten stryps betydligt hårdare än
    upload.wikimedia.org. Vid en skur av hämtningar svarade FilePath 429 på
    varenda bild medan API-anropen gick igenom som vanligt. Därför slås den
    riktiga mediaadressen upp via API:et istället, och nedladdningen sker
    direkt mot mediaservern som är CDN-cachad."""
    fn = filename.replace(" ", "_")
    r = api_get(
        "https://commons.wikimedia.org/w/api.php",
        {"action": "query", "titles": f"File:{fn}", "prop": "imageinfo",
         "iiprop": "url", "iiurlwidth": 800, "format": "json"},
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
    # hälften av dem aldrig till — det var så en länskarta hamnade på ABF.
    lower = filename.lower().replace(" ", "_")
    if lower.endswith(".svg") or lower.endswith(".gif"):
        return True
    return any(p in lower for p in SKIP_PATTERNS)

def api_get(url, params, retries=5):
    """GET med enkel backoff mot 429/5xx — MediaWiki-API:et är flaggigt
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
            print(f"    HTTP {r.status_code} — väntar {wait}s och försöker igen")
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
        # på svenska, så den sparas inte — den skrivs bara ut som stöd när en
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
    # ikonfiltret — alla kontroller låg i den andra grenen. Då hämtades en
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
        # Måste avkodas innan de skickas som titles= — annars dubbelkodas de.
        return urllib.parse.unquote(wiki_url.split("/wiki/")[-1])
    return None

def save_webp(img_url, out_path, max_w=800):
    try:
        wait = 5
        attempts = 5
        for attempt in range(attempts):
            r = requests.get(img_url, headers=HEADERS, timeout=20, allow_redirects=True)
            if r.status_code == 200:
                break
            if r.status_code in (429, 500, 502, 503) and attempt < attempts - 1:
                print(f"    HTTP {r.status_code} — väntar {wait}s och försöker igen")
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
    Bildtexten finns bara för handplockade bilder — för de automatiskt hittade
    hämtas den ur Commons-beskrivningen istället.

    Egen funktion för att backfill-skriptet ska kunna köra exakt samma
    upplösning igen och på så vis kunna belägga varifrån en redan nedladdad
    bild kom."""
    eid = ev["id"]

    if eid in NO_AUTO_IMAGE:
        print(f"    lämnas utan bild: {NO_AUTO_IMAGE[eid]}")
        return None, None

    # 1. Manuell Commons-fil
    if eid in MANUAL:
        print(f"    MANUAL: {MANUAL[eid]['file']}")
        return commons_url(MANUAL[eid]["file"]), MANUAL[eid]["caption"]

    # 2+3. sv.wikipedia — pageimage, sedan artikelns egna bilder
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

    # 4. en.wikipedia — samma två steg
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

        if not save_webp(img_url, out):
            fail += 1
            continue

        credit = commons_credit(img_url, caption)
        if not credit:
            # Licensen kräver namngivning. Kan vi inte belägga upphovsmannen
            # publicerar vi inte bilden — filen flyttas undan för manuell koll.
            print("    INGEN CREDIT — bilden används inte")
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
