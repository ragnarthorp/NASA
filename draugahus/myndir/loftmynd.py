# Býr til loftmynd af ímynduðu landsvæði (strönd, vötn, mosi, hraun, jökull) með skyggingu.
import numpy as np
from PIL import Image, ImageFilter
import sys
rng = np.random.default_rng(1402)
N = 960

def lag(n):
    a = rng.random((n, n)).astype(np.float32)
    return np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((N, N), Image.BICUBIC), dtype=np.float32) / 255

h = sum(lag(s) * w for s, w in [(4, 1.0), (8, .5), (16, .25), (32, .13), (64, .07), (128, .035)])
h = (h - h.min()) / (h.max() - h.min())
# Land rís til norðausturs, sjór í suðvestri
yy, xx = np.mgrid[0:N, 0:N] / N
h = h * 0.75 + (xx * 0.25 + (1 - yy) * 0.25)
h = (h - h.min()) / (h.max() - h.min())

# Skygging (ljós úr norðvestri)
gy, gx = np.gradient(h * 60)
skuggi = np.clip(0.75 + (-gx - gy) * 0.9, 0.35, 1.35)

def blanda(a, b, t):
    t = np.clip(t, 0, 1)[..., None]
    return np.array(a) * (1 - t) + np.array(b) * t

img = np.zeros((N, N, 3), np.float32)
sjor = h < 0.40
img[:] = blanda([18, 52, 78], [52, 108, 128], (h - 0.15) / 0.25)
strond = (h >= 0.40) & (h < 0.43)
img[strond] = blanda([58, 54, 50], [82, 76, 66], (h - 0.40) / 0.03)[strond]
mosi = (h >= 0.43) & (h < 0.62)
img[mosi] = blanda([92, 118, 62], [118, 128, 78], (h - 0.43) / 0.19)[mosi]
hraun = (h >= 0.62) & (h < 0.78)
img[hraun] = blanda([92, 84, 72], [70, 64, 60], (h - 0.62) / 0.16)[hraun]
jokull = h >= 0.78
img[jokull] = blanda([214, 222, 228], [244, 248, 250], (h - 0.78) / 0.22)[jokull]
# Smá vötn á láglendi
vatn = lag(10)
vatnamask = (vatn > 0.80) & (h > 0.45) & (h < 0.6)
img[vatnamask] = [40, 92, 120]
img[~sjor & ~vatnamask] *= skuggi[~sjor & ~vatnamask][..., None]
# Áferð
img += (rng.random((N, N, 1)) - 0.5) * 10
im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.SMOOTH)
im.save(sys.argv[1], quality=80, optimize=True)
print('ok', N)
