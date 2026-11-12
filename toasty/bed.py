"""Original accompaniment for Toasty the Toaster's Happy Hum.

The vocal is the lyric edit of Toast8. He sings freely, around 101 Hz,
between G and G sharp, so the band is tuned to that note and the chords
follow the lines instead of a click. The progression is the songwriting
guide's home set, I IV V iii, played on ukulele, guitar and a piano
with one string a little sharp.

Run from this folder: py -3 bed.py
Writes audio/happy-hum-bed.m4a and audio/happy-hum-mix.m4a.
"""

import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
VOCAL = ROOT / "audio" / "toast8-lyrics.m4a"
BED_PATH = ROOT / "audio" / "happy-hum-bed.m4a"
MIX_PATH = ROOT / "audio" / "happy-hum-mix.m4a"

SR = 44100
TONIC_HZ = 101.0  # measured center of the lyric vocal
TARGET_BPM = 106

KEEPS = [
    (0.0, 5.08),
    (10.12, 54.15),
    (59.42, 99.20),
    (107.18, 138.18),
    (143.45, 170.365333),
]

# master time on Toast8, chord, feel. Times are sung lines, never the studio talk.
EVENTS = [
    (10.22, "I", "chuck"),
    (10.98, "I", "chuck"),
    (11.82, "I", "hit"),
    (13.24, "I", "groove"),
    (15.24, "IV", "groove"),
    (18.00, "V", "groove"),
    (20.70, "iii", "groove"),
    (22.96, "I", "groove"),
    (24.22, "IV", "groove"),
    (26.70, "V", "groove"),
    (28.40, "iii", "groove"),
    (30.84, "IV", "groove"),
    (32.20, "I", "groove"),
    (35.40, "V", "groove"),
    (37.22, "iii", "groove"),
    (39.22, "IV", "groove"),
    (40.90, "I", "groove"),
    (42.60, "V", "groove"),
    (44.54, "iii", "groove"),
    (46.16, "I", "groove"),
    (50.80, "IV", "groove"),
    (53.40, "V", "groove"),
    (59.54, "I", "groove"),
    (62.16, "IV", "groove"),
    (63.54, "V", "groove"),
    (66.98, "iii", "groove"),
    (67.92, "I", "groove"),
    (70.24, "IV", "groove"),
    (71.82, "V", "groove"),
    (73.32, "iii", "groove"),
    (75.26, "V", "groove"),
    (76.72, "I", "hit"),
    (78.12, "IV", "groove"),
    (80.10, "I", "hit"),
    (82.76, "iii", "soft"),
    (86.38, "IV", "soft"),
    (88.74, "V", "soft"),
    (90.66, "iii", "soft"),
    (93.08, "IV", "soft"),
    (95.06, "V", "soft"),
    (96.90, "I", "hit"),
    (97.50, "I", "groove"),
    (107.30, "IV", "groove"),
    (110.64, "I", "groove"),
    (113.20, "V", "groove"),
    (115.10, "iii", "groove"),
    (116.96, "IV", "groove"),
    (119.30, "I", "groove"),
    (121.24, "V", "groove"),
    (122.88, "iii", "groove"),
    (127.94, "I", "groove"),
    (129.78, "IV", "groove"),
    (131.34, "V", "groove"),
    (132.22, "iii", "groove"),
    (134.90, "I", "groove"),
    (143.56, "I", "groove"),
    (145.12, "IV", "groove"),
    (146.68, "V", "groove"),
    (148.30, "iii", "groove"),
    (149.96, "I", "groove"),
    (153.16, "IV", "groove"),
    (159.02, "I", "wide"),
    (163.50, "I", "bell"),
    (166.86, "I", "end"),
]

CHORDS = {
    "I": (0, 4, 7),
    "IV": (5, 9, 0),
    "V": (7, 11, 2),
    "iii": (4, 7, 11),
}


def edit_time(master):
    acc = 0.0
    for a, b in KEEPS:
        if a - 1e-6 <= master <= b + 1e-6:
            return acc + (master - a)
        acc += b - a
    raise ValueError("lyric time falls in a cut: %s" % master)


def hz(semi):
    return TONIC_HZ * (2.0 ** (semi / 12.0))


def load_vocal():
    raw = subprocess.check_output([
        "ffmpeg", "-v", "error", "-i", str(VOCAL),
        "-ac", "1", "-ar", str(SR), "-f", "f32le", "-",
    ])
    vocal = np.frombuffer(raw, dtype=np.float32).copy()
    # A gentle lift. The memo is quiet, and the peaks get tucked in later.
    vocal *= 2.4
    vocal = np.tanh(vocal / 0.85) * 0.85
    return vocal


def karplus(freq, n, decay, rng):
    period = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, period).astype(np.float32)
    out = np.empty(n, dtype=np.float32)
    idx = 0
    for i in range(n):
        nxt = idx + 1 if idx + 1 < period else 0
        sample = buf[idx]
        out[i] = sample
        buf[idx] = decay * 0.5 * (buf[idx] + buf[nxt])
        idx = nxt
    fade = int(0.004 * SR)
    out[:fade] *= np.linspace(0, 1, fade, dtype=np.float32)
    return out


class Band:
    def __init__(self, n):
        self.n = n
        self.L = np.zeros(n, dtype=np.float32)
        self.R = np.zeros(n, dtype=np.float32)
        self.rng = np.random.default_rng(8)
        self.bank = {}

    def tone(self, semi, kind):
        key = (round(semi, 2), kind)
        if key not in self.bank:
            if kind == "piano":
                self.bank[key] = self.piano(hz(semi))
            elif kind == "piano-sharp":
                self.bank[key] = self.piano(hz(semi) * (2.0 ** (13 / 1200)))
            else:
                decay = 0.9962 if kind == "uke" else 0.9976
                self.bank[key] = karplus(hz(semi), int(1.35 * SR), decay, self.rng)
        return self.bank[key]

    def piano(self, freq):
        n = int(1.5 * SR)
        t = np.arange(n, dtype=np.float32) / SR
        y = np.zeros(n, dtype=np.float32)
        for p, amp, dec in (
            (1, 1.0, 1.5), (2, 0.45, 2.1), (3, 0.22, 2.8),
            (4, 0.12, 3.4), (5, 0.06, 4.2),
        ):
            y += amp * np.sin(2 * np.pi * freq * p * t) * np.exp(-t * dec)
        noise = self.rng.uniform(-1, 1, n).astype(np.float32) * np.exp(-t * 70) * 0.18
        env = np.minimum(1, t / 0.006) 
        return ((y * 0.22 + noise) * env).astype(np.float32)

    def add(self, t, wave, amp, pan=0.0, dur=None, decay=None):
        if amp <= 0 or t < 0 or t >= self.n / SR:
            return
        i = int(t * SR)
        clip = wave
        if dur is not None:
            m = min(len(clip), int(dur * SR))
            clip = clip[:m].copy()
            tail = int(0.03 * SR)
            if m > tail:
                clip[-tail:] *= np.linspace(1, 0, tail, dtype=np.float32)
        if decay is not None:
            env = np.exp(-np.arange(len(clip), dtype=np.float32) / SR * decay)
            clip = clip * env
        m = min(len(clip), self.n - i)
        if m <= 0:
            return
        angle = (pan + 1) * np.pi / 4
        self.L[i:i + m] += clip[:m] * amp * np.cos(angle) * np.sqrt(2)
        self.R[i:i + m] += clip[:m] * amp * np.sin(angle) * np.sqrt(2)

    def uke(self, chord):
        tones = CHORDS[chord]
        notes = []
        for tone in tones:
            semi = 24 + tone
            while semi > 36:
                semi -= 12
            notes.append(semi)
        notes.append(notes[0] + 12)
        return notes

    def strum(self, t, chord, amp, spread=0.011, dur=0.55):
        pans = (-0.28, -0.1, 0.1, 0.28)
        for i, semi in enumerate(self.uke(chord)):
            self.add(t + i * spread, self.tone(semi, "uke"), amp, pans[i], dur=dur)

    def guitar(self, t, chord, amp):
        root = CHORDS[chord][0]
        for semi, pan in ((12 + root, -0.12), (12 + CHORDS[chord][2], 0.12)):
            self.add(t, self.tone(semi, "guitar"), amp, pan, dur=0.7)

    def keys(self, t, chord, amp):
        for tone in CHORDS[chord]:
            semi = 12 + tone
            third = tone == CHORDS[chord][1]
            gain = amp * (0.62 if third else 1)
            self.add(t, self.tone(semi, "piano"), gain, 0, decay=1.6)
            self.add(t, self.tone(semi, "piano-sharp"), gain * 0.55, 0, decay=1.6)

    def bass(self, t, semi, amp):
        n = int(0.45 * SR)
        tt = np.arange(n, dtype=np.float32) / SR
        f = hz(semi)
        # A short slide into the note, the way a finger lands.
        glide = f * (1 - 0.04 * np.exp(-tt * 60))
        phase = 2 * np.pi * np.cumsum(glide) / SR
        y = (np.sin(phase) * 0.85 + np.sin(2 * phase) * 0.28) * np.exp(-tt * 3.2)
        y[: int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR), dtype=np.float32)
        self.add(t, y.astype(np.float32), amp, 0)

    def kick(self, t, amp):
        n = int(0.18 * SR)
        tt = np.arange(n, dtype=np.float32) / SR
        f = 48 + 70 * np.exp(-tt * 28)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14)
        self.add(t, y.astype(np.float32), amp, 0)

    def shaker(self, t, amp):
        n = int(0.045 * SR)
        y = self.rng.uniform(-1, 1, n).astype(np.float32)
        y = np.diff(y, prepend=0)
        tt = np.arange(n, dtype=np.float32) / SR
        y *= np.exp(-tt * 55) * np.minimum(1, tt / 0.004)
        self.add(t, y, amp, 0.15 if (int(t * 10) % 2) else -0.15)

    def bell(self, t):
        n = int(1.8 * SR)
        tt = np.arange(n, dtype=np.float32) / SR
        y = np.sin(2 * np.pi * hz(36) * tt) * np.exp(-tt * 2.2)
        y += 0.45 * np.sin(2 * np.pi * hz(43) * tt) * np.exp(-tt * 2.8)
        y += 0.2 * np.sin(2 * np.pi * hz(48) * tt) * np.exp(-tt * 3.4)
        y[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR), dtype=np.float32)
        self.add(t, y.astype(np.float32), 0.22, 0)

    def stab(self, t, chord):
        for semi in self.uke(chord):
            self.add(t, self.tone(semi, "uke"), 0.16, 0, dur=0.22)
        self.keys(t, chord, 0.09)
        self.bass(t, 12 + CHORDS[chord][0], 0.2)
        self.kick(t, 0.28)


def schedule(end):
    rows = []
    for master, chord, feel in EVENTS:
        rows.append((edit_time(master), chord, feel, master))
    rows.sort()
    for i, (t, chord, feel, master) in enumerate(rows):
        nxt = rows[i + 1][0] if i + 1 < len(rows) else end
        print("%6.2f  %-4s %-6s  span %4.2fs  (master %6.2f)" % (t, chord, feel, nxt - t, master))
    return rows


def beats_for(dur, feel):
    if dur < 0.35 or feel in ("hit", "chuck", "bell", "end"):
        return []
    # Pick a whole number of steps whose pace stays near a walk.
    best = None
    for n in range(1, 12):
        bpm = 60.0 * n / dur
        if not 92 <= bpm <= 120:
            continue
        rank = abs(bpm - TARGET_BPM)
        if best is None or rank < best[0]:
            best = (rank, n)
    n = best[1] if best else 1
    step = dur / n
    return [i * step for i in range(n)]


def render(vocal):
    band = Band(len(vocal))
    # Title card: one quiet piano chord before the count-in.
    band.keys(3.05, "I", 0.035)
    band.bass(3.05, 12, 0.06)

    rows = schedule(len(vocal) / SR)
    rng = band.rng
    for i, (t, chord, feel, _master) in enumerate(rows):
        nxt = rows[i + 1][0] if i + 1 < len(rows) else len(vocal) / SR
        root = 12 + CHORDS[chord][0]
        fifth = 12 + CHORDS[chord][2]
        if feel == "chuck":
            band.strum(t, chord, 0.07, dur=0.4)
        elif feel == "hit":
            band.stab(t, chord)
        elif feel == "bell":
            band.bell(t)
        elif feel == "end":
            band.strum(t, chord, 0.08, spread=0.045, dur=1.4)
            band.keys(t, chord, 0.07)
            band.bass(t, root, 0.16)
        else:
            steps = beats_for(nxt - t, feel)
            for b, off in enumerate(steps):
                when = t + off + float(rng.uniform(-0.008, 0.008))
                swing = (nxt - t) / max(1, len(steps)) * 0.08
                if b % 2 == 1:
                    when += swing
                if feel == "soft":
                    if b == 0:
                        band.keys(when, chord, 0.04)
                        band.strum(when, chord, 0.045, spread=0.02, dur=0.8)
                        band.bass(when, root, 0.08)
                    elif b % 2 == 0:
                        band.shaker(when, 0.025)
                elif feel == "wide":
                    if b % 2 == 0:
                        band.keys(when, chord, 0.06)
                        band.bass(when, root if b % 4 == 0 else fifth, 0.12)
                        band.strum(when, chord, 0.05, dur=0.8)
                else:
                    if b % 2 == 0:
                        band.bass(when, root if b % 4 == 0 else fifth, 0.15)
                        band.kick(when, 0.16 if b % 4 == 0 else 0.1)
                        if b == 0:
                            band.keys(when, chord, 0.045)
                    else:
                        band.strum(when, chord, 0.075)
                        band.guitar(when, chord, 0.05)
                        band.shaker(when, 0.055)
    bed = np.stack([band.L, band.R], axis=1)

    # Duck the band a little wherever he is singing, so the words stay in front.
    env = np.abs(vocal)
    win = int(0.03 * SR)
    kernel = np.ones(win, dtype=np.float32) / win
    env = np.convolve(env, kernel, mode="same")
    level = np.quantile(env[env > 0.01], 0.7) if np.any(env > 0.01) else 0.05
    duck = 1 - 0.38 * np.clip(env / level, 0, 1)
    bed *= duck[:, None].astype(np.float32)

    groove = bed[int(12 * SR):int(140 * SR)]
    vocal_bit = vocal[int(12 * SR):int(140 * SR)]
    bed_rms = float(np.sqrt(np.mean(groove ** 2)))
    vocal_rms = float(np.sqrt(np.mean(vocal_bit ** 2)))
    if bed_rms > 1e-6:
        bed *= (0.62 * vocal_rms) / bed_rms
    # Rumble under the bass, gone. Leave the note itself.
    w = int(SR / 55)
    if w > 8:
        c = np.cumsum(bed, axis=0)
        moving = (c[w:] - c[:-w]) / w
        bed = bed.copy()
        bed[w:] -= moving.astype(np.float32)

    mix_l = vocal + bed[:, 0]
    mix_r = vocal + bed[:, 1]
    mix = np.stack([mix_l, mix_r], axis=1)
    peak = float(np.max(np.abs(mix)))
    if peak > 0.98:
        mix *= 0.98 / peak
        bed *= 0.98 / peak
    print("vocal rms %6.4f   bed rms %6.4f   mix peak %.3f" % (
        vocal_rms, float(np.sqrt(np.mean(bed[int(12 * SR):int(140 * SR)] ** 2))), peak))
    return bed, mix


def write_m4a(path, stereo):
    pcm = np.clip(stereo, -1, 1)
    pcm = (pcm * 32767).astype("<i2").tobytes()
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "pipe:0",
        "-c:a", "aac", "-b:a", "192k", str(path),
    ], input=pcm, check=True)


def main():
    vocal = load_vocal()
    if "--plan" in sys.argv:
        schedule(len(vocal) / SR)
        return
    bed, mix = render(vocal)
    write_m4a(BED_PATH, bed)
    write_m4a(MIX_PATH, mix)
    print(BED_PATH)
    print(MIX_PATH)


if __name__ == "__main__":
    main()
