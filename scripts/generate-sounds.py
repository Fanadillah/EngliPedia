#!/usr/bin/env python3
"""Generate all 11 sound effects as WAV files, then convert to MP3 via ffmpeg."""

import struct
import math
import subprocess
import os
import sys

OUTPUT_DIR = r"C:\TATA\Coding\APP English\english-app\public\sounds"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLE_RATE = 44100

def write_wav(path, samples):
    """Write 16-bit mono WAV file."""
    # Normalize to [-1, 1]
    max_val = max(abs(s) for s in samples) or 1.0
    normalized = [s / max_val for s in samples]
    
    with open(path, "wb") as f:
        data_size = len(normalized) * 2
        # RIFF header
        f.write(b"RIFF")
        f.write(struct.pack("<I", 36 + data_size))
        f.write(b"WAVE")
        # fmt chunk
        f.write(b"fmt ")
        f.write(struct.pack("<I", 16))  # chunk size
        f.write(struct.pack("<H", 1))   # PCM
        f.write(struct.pack("<H", 1))   # mono
        f.write(struct.pack("<I", SAMPLE_RATE))
        f.write(struct.pack("<I", SAMPLE_RATE * 2))  # byte rate
        f.write(struct.pack("<H", 2))   # block align
        f.write(struct.pack("<H", 16))  # bits per sample
        # data chunk
        f.write(b"data")
        f.write(struct.pack("<I", data_size))
        for s in normalized:
            val = max(-32768, min(32767, int(s * 32767)))
            f.write(struct.pack("<h", val))

def sine_wave(freq, duration, amplitude=0.7):
    """Generate sine wave samples."""
    n = int(SAMPLE_RATE * duration)
    return [amplitude * math.sin(2 * math.pi * freq * i / SAMPLE_RATE) for i in range(n)]

def noise_wave(duration, amplitude=0.5, color="white"):
    """Generate noise samples."""
    import random
    n = int(SAMPLE_RATE * duration)
    if color == "white":
        return [amplitude * (random.random() * 2 - 1) for _ in range(n)]
    elif color == "pink":
        samples = []
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0
        for _ in range(n):
            white = random.random() * 2 - 1
            b0 = 0.99886 * b0 + white * 0.0555179
            b1 = 0.99332 * b1 + white * 0.0750759
            b2 = 0.96900 * b2 + white * 0.1538520
            b3 = 0.86650 * b3 + white * 0.3104856
            b4 = 0.55000 * b4 + white * 0.5329522
            b5 = -0.7616 * b5 - white * 0.0168980
            pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
            b6 = white * 0.115926
            samples.append(amplitude * pink)
        return samples
    elif color == "brown":
        samples = []
        val = 0.0
        for _ in range(n):
            val += (random.random() * 2 - 1) * 0.02
            if val > 1: val = 1
            if val < -1: val = -1
            samples.append(amplitude * val)
        return samples

def apply_fade(samples, fade_in=0.0, fade_out=0.0, sample_rate=SAMPLE_RATE):
    """Apply fade in/out envelopes."""
    result = list(samples)
    n = len(result)
    if fade_in > 0:
        fi_samples = int(fade_in * sample_rate)
        for i in range(min(fi_samples, n)):
            result[i] *= i / fi_samples
    if fade_out > 0:
        fo_samples = int(fade_out * sample_rate)
        for i in range(min(fo_samples, n)):
            result[n - 1 - i] *= i / fo_samples
    return result

def mix(*tracks):
    """Mix multiple tracks together (sum, then normalize)."""
    max_len = max(len(t) for t in tracks) if tracks else 0
    result = [0.0] * max_len
    for track in tracks:
        for i, s in enumerate(track):
            result[i] += s
    return result

def pad(samples, total_duration):
    """Pad with zeros to total_duration."""
    n = int(SAMPLE_RATE * total_duration)
    if len(samples) >= n:
        return samples[:n]
    return samples + [0.0] * (n - len(samples))

# ============================================================
# Generate each sound
# ============================================================

sounds = {}

# 1. correct.mp3 — Two ascending tones with overlap
correct_t1 = sine_wave(523, 0.18)  # C5
correct_t2 = sine_wave(659, 0.28)  # E5
correct = [0.0] * int(SAMPLE_RATE * 0.02) + correct_t1[:int(SAMPLE_RATE*0.08)]
correct = mix(correct, [0.0]*int(SAMPLE_RATE*0.1) + correct_t2)
correct = apply_fade(correct, fade_in=0.005, fade_out=0.08)
correct = pad(correct, 0.45)
sounds["correct"] = correct

# 2. wrong.mp3 — Low descending buzz
wrong = sine_wave(180, 0.35, amplitude=0.5)
wrong = apply_fade(wrong, fade_in=0.02, fade_out=0.1)
wrong = pad(wrong, 0.4)
sounds["wrong"] = wrong

# 3. xp-earn.mp3 — Sparkle: three high tones
xp1 = sine_wave(1200, 0.06, amplitude=0.5)
xp2 = sine_wave(1800, 0.06, amplitude=0.5)
xp3 = sine_wave(2400, 0.2, amplitude=0.5)
xp = [0.0]*int(SAMPLE_RATE*0.02) + xp1
xp = mix(xp, [0.0]*int(SAMPLE_RATE*0.08) + xp2)
xp = mix(xp, [0.0]*int(SAMPLE_RATE*0.16) + xp3)
xp = apply_fade(xp, fade_in=0.005, fade_out=0.12)
xp = pad(xp, 0.55)
sounds["xp-earn"] = xp

# 4. streak.mp3 — Rising energy
str1 = sine_wave(200, 0.3, amplitude=0.5)
str2 = sine_wave(400, 0.25, amplitude=0.4)
str3 = sine_wave(600, 0.2, amplitude=0.3)
streak = mix(str1, [0.0]*int(SAMPLE_RATE*0.1) + str2)
streak = mix(streak, [0.0]*int(SAMPLE_RATE*0.2) + str3)
streak = apply_fade(streak, fade_in=0.01, fade_out=0.15)
streak = pad(streak, 0.7)
sounds["streak"] = streak

# 5. achievement.mp3 — Triumphant C-E-G
ach1 = sine_wave(392, 0.15, amplitude=0.5)  # G4
ach2 = sine_wave(523, 0.15, amplitude=0.5)  # C5
ach3 = sine_wave(659, 0.5, amplitude=0.5)   # E5
achievement = [0.0]*int(SAMPLE_RATE*0.02) + ach1
achievement = mix(achievement, [0.0]*int(SAMPLE_RATE*0.06) + ach2)
achievement = mix(achievement, [0.0]*int(SAMPLE_RATE*0.12) + ach3)
achievement = apply_fade(achievement, fade_in=0.005, fade_out=0.2)
achievement = pad(achievement, 0.9)
sounds["achievement"] = achievement

# 6. level-up.mp3 — Ascending arpeggio C4-E4-G4-C5
lv1 = sine_wave(262, 0.1, amplitude=0.5)  # C4
lv2 = sine_wave(330, 0.1, amplitude=0.5)  # E4
lv3 = sine_wave(392, 0.1, amplitude=0.5)  # G4
lv4 = sine_wave(523, 0.5, amplitude=0.5)  # C5
lv = [0.0]*int(SAMPLE_RATE*0.01) + lv1
lv = mix(lv, [0.0]*int(SAMPLE_RATE*0.08) + lv2)
lv = mix(lv, [0.0]*int(SAMPLE_RATE*0.16) + lv3)
lv = mix(lv, [0.0]*int(SAMPLE_RATE*0.24) + lv4)
lv = apply_fade(lv, fade_in=0.005, fade_out=0.25)
lv = pad(lv, 1.3)
sounds["level-up"] = lv

# 7. tap.mp3 — Soft click
tap = noise_wave(0.12, amplitude=0.4, color="white")
tap = apply_fade(tap, fade_in=0.002, fade_out=0.05)
tap = pad(tap, 0.15)
sounds["tap"] = tap

# 8. flip.mp3 — Card flip
flip = noise_wave(0.18, amplitude=0.35, color="brown")
flip = apply_fade(flip, fade_in=0.005, fade_out=0.06)
flip = pad(flip, 0.22)
sounds["flip"] = flip

# 9. swipe.mp3 — Whoosh
swipe_noise = noise_wave(0.25, amplitude=0.5, color="pink")
swipe_freq = sine_wave(800, 0.25, amplitude=0.3)
swipe = mix(swipe_noise, swipe_freq)
swipe = apply_fade(swipe, fade_in=0.01, fade_out=0.08)
swipe = pad(swipe, 0.3)
sounds["swipe"] = swipe

# 10. session-done.mp3 — Completion jingle
sd1 = sine_wave(440, 0.12, amplitude=0.5)   # A4
sd2 = sine_wave(554, 0.12, amplitude=0.5)   # Db5
sd3 = sine_wave(659, 0.12, amplitude=0.5)   # E5
sd4 = sine_wave(880, 0.45, amplitude=0.5)   # A5
sd = [0.0]*int(SAMPLE_RATE*0.02) + sd1
sd = mix(sd, [0.0]*int(SAMPLE_RATE*0.1) + sd2)
sd = mix(sd, [0.0]*int(SAMPLE_RATE*0.18) + sd3)
sd = mix(sd, [0.0]*int(SAMPLE_RATE*0.26) + sd4)
sd = apply_fade(sd, fade_in=0.005, fade_out=0.2)
sd = pad(sd, 0.95)
sounds["session-done"] = sd

# 11. page-transition.mp3 — Subtle swoosh
pt = noise_wave(0.18, amplitude=0.25, color="pink")
pt = apply_fade(pt, fade_in=0.005, fade_out=0.08)
pt = pad(pt, 0.2)
sounds["page-transition"] = pt

# Write all WAV files and convert to MP3
ffmpeg_path = r"C:\Users\ILHAM\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"

for name, samples in sounds.items():
    wav_path = os.path.join(OUTPUT_DIR, f"{name}.wav")
    mp3_path = os.path.join(OUTPUT_DIR, f"{name}.mp3")
    print(f"Writing {name}... ({len(samples)} samples)")
    write_wav(wav_path, samples)
    # Convert to MP3
    result = subprocess.run(
        [ffmpeg_path, "-y", "-hide_banner", "-loglevel", "error",
         "-i", wav_path, "-codec:a", "libmp3lame", "-b:a", "128k", mp3_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  ERROR converting {name}: {result.stderr}")
    else:
        size = os.path.getsize(mp3_path)
        print(f"  -> {mp3_path} ({size} bytes)")
    os.remove(wav_path)

print("\n=== Done! ===")
