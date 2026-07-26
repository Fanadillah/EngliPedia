#!/bin/bash
# Generate 11 sound effects for English App (very simple approach)
OUTPUT_DIR="/c/TATA/Coding/APP English/english-app/public/sounds"
mkdir -p "$OUTPUT_DIR"

gen() {
  local name="$1"
  local cmd="$2"
  echo "Generating $name..."
  eval ffmpeg -y -hide_banner -loglevel error $cmd "$OUTPUT_DIR/$name" || echo "FAILED: $name"
}

# 1. correct.mp3 — Two ascending tones (simple concat)
gen "correct.mp3" \
  "-f lavfi -i 'aevalsrc=sin(2*PI*523*t):d=0.2|sin(2*PI*659*t):d=0.2' -filter_complex '[0]acrossfade=d=0.05,afade=t=out:st=0.33:d=0.12,volume=0.7'"

# 2. wrong.mp3 — Low drone descending
gen "wrong.mp3" \
  "-f lavfi -i 'aevalsrc=sin(2*PI*200*t):d=0.4,afade=t=out:st=0.25:d=0.15,volume=0.5'"

# 3. xp-earn.mp3 — Magical sparkle
gen "xp-earn.mp3" \
  "-f lavfi -i 'aevalsrc=sin(2*PI*1200*t):d=0.05|sin(2*PI*1800*t):d=0.05' -filter_complex '[0]apad=pad_dur=0.15,afade=t=out:st=0.15:d=0.15,volume=0.55'"

# 4. streak.mp3 — Energy
gen "streak.mp3" \
  "-f lavfi -i 'aevalsrc=sin(2*PI*200*t):d=0.3|sin(2*PI*400*t):d=0.2' -filter_complex '[0]acrossfade=d=0.05,afade=t=out:st=0.4:d=0.2,volume=0.65'"

# 5. achievement.mp3 — Triumphant C chord
gen "achievement.mp3" \
  "-f lavfi -i 'aevalsrc=sin(2*PI*392*t):d=0.1|sin(2*PI*523*t):d=0.1|sin(2*PI*659*t):d=0.5' -filter_complex '[0]acrossfade=d=0.03,afade=t=out:st=0.65:d=0.2,volume=0.7'"

# 6. level-up.mp3 — Ascending arpeggio
gen "level-up.mp3" \
  "-f lavfi -i 'aevalsrc=sin(2*PI*262*t):d=0.1|sin(2*PI*330*t):d=0.1|sin(2*PI*392*t):d=0.1|sin(2*PI*523*t):d=0.5' -filter_complex '[0]acrossfade=d=0.03,afade=t=out:st=1.2:d=0.3,volume=0.7'"

# 7. tap.mp3 — Soft click
gen "tap.mp3" \
  "-f lavfi -i 'anoisesrc=d=0.15:c=white:a=0.5,afade=t=out:st=0.1:d=0.05,volume=0.3'"

# 8. flip.mp3 — Card flip
gen "flip.mp3" \
  "-f lavfi -i 'anoisesrc=d=0.2:c=brown:a=0.4,afade=t=out:st=0.15:d=0.05,volume=0.35'"

# 9. swipe.mp3 — Whoosh
gen "swipe.mp3" \
  "-f lavfi -i 'anoisesrc=d=0.3:c=pink:a=0.6,afade=t=out:st=0.2:d=0.1,volume=0.35'"

# 10. session-done.mp3 — Completion jingle
gen "session-done.mp3" \
  "-f lavfi -i 'aevalsrc=sin(2*PI*440*t):d=0.12|sin(2*PI*554*t):d=0.12|sin(2*PI*659*t):d=0.12|sin(2*PI*880*t):d=0.4' -filter_complex '[0]acrossfade=d=0.03,afade=t=out:st=0.8:d=0.2,volume=0.7'"

# 11. page-transition.mp3 — Subtle swoosh
gen "page-transition.mp3" \
  "-f lavfi -i 'anoisesrc=d=0.2:c=pink:a=0.3,afade=t=out:st=0.12:d=0.08,volume=0.2'"

echo ""
echo "=== All sounds generated ==="
ls -lh "$OUTPUT_DIR/"
