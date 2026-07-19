"""
Translate example sentences to Indonesian with auto-save
Saves every 100 words so progress is not lost on timeout
"""

import json
import time
import os
from deep_translator import GoogleTranslator

translator = GoogleTranslator(source='en', target='id')

dataset_path = r'C:\TATA\Coding\APP English\english_app_dataset.json'

with open(dataset_path, 'r', encoding='utf-8') as f:
    words = json.load(f)

print(f'Loaded {len(words)} words')

# Find words needing translation
to_translate = []
for i, w in enumerate(words):
    ex = (w.get('examples') or [''])[0]
    already_done = w.get('example_id', '')
    if ex and len(ex) > 5 and not already_done:
        to_translate.append(i)

print(f'Words needing translation: {len(to_translate)}')

translated = 0
errors = 0
skipped = 0

for count, idx in enumerate(to_translate):
    w = words[idx]
    ex = w['examples'][0]

    try:
        result = translator.translate(ex)
        if result:
            words[idx]['example_id'] = result
            translated += 1
        else:
            words[idx]['example_id'] = ''
            skipped += 1
    except Exception as e:
        words[idx]['example_id'] = ''
        errors += 1
        if '429' in str(e) or 'Too Many' in str(e):
            print(f'  Rate limited at {count}, waiting 10s...')
            time.sleep(10)

    # Auto-save every 100 words
    if (count + 1) % 100 == 0:
        with open(dataset_path, 'w', encoding='utf-8') as f:
            json.dump(words, f, ensure_ascii=False, indent=2)
        print(f'  [{count+1}/{len(to_translate)}] Saved! ({translated} ok, {errors} err)')

    time.sleep(0.08)

# Final save
with open(dataset_path, 'w', encoding='utf-8') as f:
    json.dump(words, f, ensure_ascii=False, indent=2)

print(f'\n=== DONE ===')
print(f'Translated: {translated}')
print(f'Errors: {errors}')
print(f'Skipped: {skipped}')

# Verify
done = [w for w in words if w.get('example_id') and len(w.get('example_id', '')) > 3]
print(f'Total with translations: {len(done)}')
