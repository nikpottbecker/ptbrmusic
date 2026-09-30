#!/usr/bin/env python3
"""Original 8-s house loop with audible sidechain pumping (no samples, no rights issues).
Usage: python3 audio.py out.wav [seed]
Seed picks key/chord voicing and hat pattern so reels don't all sound identical."""
import sys, wave, numpy as np

out = sys.argv[1] if len(sys.argv) > 1 else 'loop.wav'
seed = int(sys.argv[2]) if len(sys.argv) > 2 else 0
rng = np.random.default_rng(seed)
SR, BPM, SECS = 44100, 124, 8.0
beat = 60 / BPM
n = int(SR * SECS)
t = np.arange(n) / SR
mix = np.zeros(n)

def env(length, attack, decay):
    x = np.arange(length) / SR
    e = np.minimum(1, x / max(attack, 1e-4)) * np.exp(-x / decay)
    return e

# kick: pitch-swept sine on every beat
klen = int(0.35 * SR)
kt = np.arange(klen) / SR
kfreq = 45 + 110 * np.exp(-kt * 28)
kick = np.sin(2 * np.pi * np.cumsum(kfreq) / SR) * env(klen, 0.002, 0.14)
beats = np.arange(0, SECS, beat)
for b in beats:
    i = int(b * SR); j = min(n, i + klen); mix[i:j] += 0.9 * kick[: j - i]

# sidechain envelope (duck after every kick)
sc = np.ones(n)
for b in beats:
    i = int(b * SR); L = int(beat * SR)
    x = np.arange(min(L, n - i)) / SR
    sc[i:i + len(x)] = np.minimum(sc[i:i + len(x)], 1 - 0.85 * np.exp(-x / 0.11))

# pad chord (minor 7th), key chosen by seed, pumped by sidechain
roots = [110.0, 116.54, 123.47, 130.81, 98.0, 103.83]  # A, A#, B, C, G, G#
root = roots[seed % len(roots)]
ratios = [1, 1.1892, 1.4983, 1.7818] if seed % 2 == 0 else [1, 1.1892, 1.4983, 2.0]
pad = np.zeros(n)
for r in ratios:
    for det in (-0.004, 0.004):
        f = root * 2 * r * (1 + det)
        pad += np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sin(2 * np.pi * f * t) * 0.5
# simple low-pass (one-pole) to soften the saw/square edge
alpha = 0.06
lp = np.zeros(n); acc = 0.0
for k in range(n):
    acc += alpha * (pad[k] - acc); lp[k] = acc
mix += 0.16 * lp / np.max(np.abs(lp)) * sc

# sub bass on offbeats
blen = int(beat * 0.45 * SR)
bass = np.sin(2 * np.pi * root / 2 * np.arange(blen) / SR) * env(blen, 0.005, 0.12)
for b in beats:
    i = int((b + beat / 2) * SR); j = min(n, i + blen)
    if i < n: mix[i:j] += 0.35 * bass[: j - i]

# hats: offbeat open hat + optional 16th closed hats
hlen = int(0.06 * SR)
noise = rng.standard_normal(hlen)
hp = np.diff(np.diff(np.concatenate([[0, 0], noise])))  # 2nd-order difference = brighter, thinner hat
hp = hp / np.max(np.abs(hp))
for b in beats:
    i = int((b + beat / 2) * SR); j = min(n, i + hlen)
    if i < n: mix[i:j] += 0.035 * hp[: j - i] * env(hlen, 0.001, 0.03)[: j - i]
    if seed % 3 != 0:
        for q in (0.25, 0.75):
            i2 = int((b + beat * q) * SR); j2 = min(n, i2 + hlen // 2)
            if i2 < n: mix[i2:j2] += 0.015 * hp[: j2 - i2] * env(hlen // 2, 0.001, 0.012)[: j2 - i2]

# fade in/out, normalise
fade = int(0.25 * SR)
mix[:fade] *= np.linspace(0, 1, fade); mix[-fade:] *= np.linspace(1, 0, fade)
mix = mix / np.max(np.abs(mix)) * 0.85
pcm = (mix * 32767).astype(np.int16)
stereo = np.column_stack([pcm, pcm]).ravel()
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(stereo.tobytes())
print('audio', out)
