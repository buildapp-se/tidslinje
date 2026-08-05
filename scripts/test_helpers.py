"""Snabbkoll på textparsningen i download-images.py.  Kör:  python scripts/test_helpers.py

Bara de två funktioner som faktiskt kan gå sönder tyst: filnamnsutvinningen ur
en Commons-URL (fel filnamn = credit på fel bild) och städningen av
upphovsmansfältet. Nätverksdelarna testas inte, dem ser man direkt när de fallerar.
"""
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "dl", Path(__file__).parent / "download-images.py"
)
dl = importlib.util.module_from_spec(spec)
spec.loader.exec_module(spec and dl)

# Thumbnail och original ska ge samma filnamn, och procentkodning ska avkodas.
assert dl.commons_filename(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Olof_Palme.jpg/800px-Olof_Palme.jpg"
) == "Olof_Palme.jpg"
assert dl.commons_filename(
    "https://upload.wikimedia.org/wikipedia/commons/a/a5/Olof_Palme.jpg"
) == "Olof_Palme.jpg"
assert dl.commons_filename(
    "https://upload.wikimedia.org/wikipedia/commons/a/a5/Sm%C3%A5.jpg"
) == "Små.jpg"

# Commons dubblerar ofta upphovsmannen — en gång räcker.
assert dl.tidy_artist("Unknown author Unknown author") == "Okänd upphovsman"
assert dl.tidy_artist("Xauxa Xauxa") == "Xauxa"
assert dl.tidy_artist("Viktor Bulla") == "Viktor Bulla"
assert dl.tidy_artist("") == "Okänd upphovsman"
# Får inte kapa namn som råkar bestå av två lika långa delar.
assert dl.tidy_artist("Anna Andersson") == "Anna Andersson"

assert dl.html_to_text("<a href='#'>Jan  Norrman</a> &amp; co") == "Jan Norrman & co"

# Datakontroll: bildfilen döps efter händelsens id, så ett id med å/ä/ö ger ett
# filnamn med å/ä/ö — vilket har brutit renderingen förut. Id:t "1919-rösträtt"
# gjorde dessutom att skriptet aldrig hittade den redan nedladdade
# "1919-rostratt.webp" och laddade ner den om och om igen.
import json
events = json.loads((Path(__file__).parent.parent / "src/data/events.json").read_text("utf-8"))
for ev in events:
    assert ev["id"].isascii(), f"id måste vara ren ASCII: {ev['id']}"
    if ev.get("image", "").startswith("images/"):
        assert ev["image"] == f"images/{ev['id']}.webp", \
            f"bildnamn måste följa id: {ev['id']} har {ev['image']}"
    credit = ev.get("imageCredit")
    if credit:
        assert credit.get("by") and credit.get("source"), \
            f"credit utan upphovsman eller källa: {ev['id']}"
    # En bild utan credit får inte publiceras — licenserna kräver namngivning.
    assert not (ev.get("image") and not credit), f"bild utan credit: {ev['id']}"

print(f"alla kontroller OK ({len(events)} händelser)")
