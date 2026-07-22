import json
import shutil
from datetime import datetime

INPUT_FILE = "../english_app_dataset.json"
BACKUP = f"../english_app_dataset_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

shutil.copy2(INPUT_FILE, BACKUP)
print(f"Total sebelum: {len(data)}")
print(f"Backup: {BACKUP}")

# ============================================================
# NAMA ORANG YANG HARUS DIHAPUS (75)
# ============================================================
names_to_remove = {
    "clinton", "davis", "houston", "keith", "blair", "barnes", "dana",
    "elliott", "elliot", "barrett", "carmen", "fiona", "harriet", "helena",
    "anita", "gerry", "danielle", "clive", "katrina", "carnegie", "evelyn",
    "benson", "elaine", "donovan", "juliet", "cheryl", "agnes", "isabel",
    "denise", "claudia", "baxter", "cory", "audrey", "amelia", "barney",
    "bryce", "dalton", "briggs", "bauer", "choi", "ling", "bert",
    "guinness", "isabella", "cassidy", "eliza", "gail", "ida", "kramer",
    "heidi", "carla", "elsa", "boone", "beckett", "beatrice", "beethoven",
    "hannibal", "jang", "bianca", "carly", "chun", "ethel", "gabrielle",
    "darcy", "edna", "darryl", "donny", "gladys", "kira", "gigi", "hilda",
    "gretchen", "cleo", "jeong", "leibniz",
}

# ============================================================
# INTERJEKSI YANG HARUS DIHAPUS (14)
# ============================================================
interjections_to_remove = {
    "hum", "aha", "chu", "erm", "agh", "ahem",
    "groans", "murmur", "grunts", "beeps", "growls", "gunshot", "gunshots",
}

# ============================================================
# FIX 7 KATA YANG ARTINYA MASIH ENGLISH
# ============================================================
meaning_fixes = {
    "runner": "Pelari",
    "dozens": "Lusin",
    "harbour": "Pelabuhan",
    "explosives": "Bahan peledak",
    "colt": "Anak kuda jantan",
    "salsa": "Salsa (saus)",
    "sonnet": "Sonnet (puisi 14 baris)",
}

# ============================================================
# PROSES
# ============================================================
all_remove = names_to_remove | interjections_to_remove
removed = []
fixed = []
kept = []

for entry in data:
    word = entry.get("word", "").strip().lower()
    
    if word in all_remove:
        removed.append(entry["word"])
        continue
    
    if word in meaning_fixes:
        entry["meaning_id"] = meaning_fixes[word]
        fixed.append(f"{entry['word']} -> {meaning_fixes[word]}")
    
    kept.append(entry)

# Simpan
with open(INPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(kept, f, indent=2, ensure_ascii=False)

print(f"\n{'='*60}")
print(f"Total sesudah: {len(kept)}")
print(f"Dihapus: {len(removed)} kata")
print(f"Diperbaiki: {len(fixed)} kata")
print(f"{'='*60}")

print(f"\n--- DIHAPUS ({len(removed)}) ---")
for w in sorted(removed):
    print(f"  - {w}")

print(f"\n--- DIPERBAIKI ({len(fixed)}) ---")
for w in sorted(fixed):
    print(f"  - {w}")

print(f"\nFile: {INPUT_FILE}")
