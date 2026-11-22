from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import sys

D = "/usr/share/fonts/truetype/"
for n, f in [("S", "dejavu/DejaVuSans"), ("SB", "dejavu/DejaVuSans-Bold"),
             ("MI", "liberation/LiberationSerif-Italic"), ("MB", "liberation/LiberationSerif-BoldItalic")]:
    pdfmetrics.registerFont(TTFont(n, D + f + ".ttf"))
W, H = A4
OUT = sys.argv[1]
c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("Æfingadæmi – veldi og rætur")
INK, GREY, TINT, LINE = (0.1, 0.1, 0.1), (0.45, 0.45, 0.45), (0.93, 0.93, 0.93), (0.75, 0.75, 0.75)
L, R = 12 * mm, W - 12 * mm
sw = pdfmetrics.stringWidth

def math(x, y, s, size=11, bold=False, draw=True, col=INK):
    if draw: c.setFillColorRGB(*col)
    i = 0
    while i < len(s):
        ch = s[i]
        if ch in "^_" and i + 1 < len(s):
            if s[i + 1] == "{": j = s.index("}", i); grp = s[i + 2:j]; i = j
            else: grp = s[i + 1]; i += 1
            dy = size * 0.42 if ch == "^" else -size * 0.18
            for g in grp:
                f = ("MB" if bold else "MI") if g.isalpha() else ("SB" if bold else "S")
                if draw: c.setFont(f, size * 0.64); c.drawString(x, y + dy, g)
                x += sw(g, f, size * 0.64)
        else:
            f = ("MB" if bold else "MI") if ch.isalpha() else ("SB" if bold else "S")
            if draw: c.setFont(f, size); c.drawString(x, y, ch)
            x += sw(ch, f, size)
        i += 1
    if draw: c.setFillColorRGB(*INK)
    return x
def mw(s, size=11, bold=False): return math(0, 0, s, size, bold, draw=False)
def text(x, y, s, f="S", size=9, col=INK):
    c.setFillColorRGB(*col); c.setFont(f, size); c.drawString(x, y, s); c.setFillColorRGB(*INK)
    return x + sw(s, f, size)

# ---------- uppsetningarvél (úr hjálparkóða) ----------
def asc1(it, s):
    if isinstance(it, str): return (0.98 if "^" in it else 0.76) * s
    t = it[0]
    if t == "e": return 1.22 * s
    if t == "r": return asc(it[2], s) + 0.16 * s
    if t == "f": return 0.42 * s + desc(it[1], s) + asc(it[1], s)
    if t == "P": return 1.0 * s
    if t == "sup": return 1.1 * s
    return 0.76 * s
def desc1(it, s):
    if isinstance(it, str) or it[0] in ("e", "sup"): return 0.22 * s
    t = it[0]
    if t == "r": return desc(it[2], s) + 0.1 * s
    if t == "f": return asc(it[2], s) - 0.22 * s + desc(it[2], s)
    if t == "P": return 0.45 * s
    return 0
def asc(items, s): return max([asc1(i, s) for i in items] + [0.76 * s])
def desc(items, s): return max([desc1(i, s) for i in items] + [0.22 * s])
def RR(x, y, items, s, bold=False, draw=True):
    for it in items:
        if isinstance(it, str): x = math(x, y, it, s, bold, draw); continue
        t = it[0]
        if t == "sp": x += it[1]
        elif t == "P":
            if draw: c.setFont("S", s * 1.45); c.drawString(x, y - s * 0.22, it[1])
            x += sw(it[1], "S", s * 1.45)
        elif t == "sup":
            if draw: c.setFont("S", s * 0.64); c.drawString(x + 1, y + s * 0.75, it[1])
            x += sw(it[1], "S", s * 0.64) + 2
        elif t == "e":
            x = math(x, y, it[1], s, bold, draw)
            es, ly = 0.62 * s, y + 0.62 * s
            nw, dw = mw(it[2], es, bold), mw(it[3], es, bold); w = max(nw, dw) + 2
            if draw:
                math(x + 1 + (w - nw) / 2, ly + es * 0.22, it[2], es, bold)
                math(x + 1 + (w - dw) / 2, ly - es * 0.82, it[3], es, bold)
                c.setLineWidth(max(0.5, s / 24)); c.line(x + 1, ly, x + 1 + w, ly)
            x += w + 2
        elif t == "r":
            idx, inner = it[1], it[2]; k = s / 13
            cx = x + (12.5 if idx else 10) * k; w = RR(0, 0, inner, s, bold, False)
            top, bot = y + asc(inner, s) + 0.1 * s, y - desc(inner, s); y0 = bot + (top - bot) * 0.38
            if draw:
                c.setLineWidth(k * (1.35 if bold else 1))
                p = c.beginPath(); p.moveTo(cx - 9 * k, y0); p.lineTo(cx - 7 * k, y0 + 1.5 * k)
                p.lineTo(cx - 4.5 * k, bot); p.lineTo(cx - 2 * k, top); p.lineTo(cx + w + 2 * k, top); c.drawPath(p)
                if idx: text(cx - 10.8 * k, y0 + 3.2 * k, str(idx), "SB" if bold else "S", s * 0.5)
                RR(cx, y, inner, s, bold, True)
            x = cx + w + 3 * k
        elif t == "f":
            num, den = it[1], it[2]
            nw, dw = RR(0, 0, num, s, bold, False), RR(0, 0, den, s, bold, False)
            w = max(nw, dw) + 0.4 * s; ly = y + 0.32 * s
            if draw:
                RR(x + (w - nw) / 2, ly + 0.1 * s + desc(num, s), num, s, bold)
                RR(x + (w - dw) / 2, ly - 0.1 * s - asc(den, s), den, s, bold)
                c.setLineWidth(max(0.8, s / 14)); c.line(x, ly, x + w, ly)
            x += w
    return x

def remind(x, y, parts, size=9):
    c.setFillColorRGB(*INK); c.circle(x + 5, y + 2.8, 5, stroke=0, fill=1)
    c.setFillColorRGB(1, 1, 1); c.setFont("SB", 8); c.drawCentredString(x + 5, y + 0.1, "!")
    c.setFillColorRGB(*INK); x += 14
    for k, s in parts:
        x = (math(x, y, s, size + 1) + 1) if k == "m" else (text(x, y, s, "SB" if k == "b" else "S", size) + 1)
    return x

def dots(x, y, n):
    for i in range(3):
        c.setLineWidth(0.8)
        c.circle(x + i * 3.4 * mm, y, 1.2 * mm, stroke=1, fill=1 if i < n else 0)

# ---------- efni ----------
fr = lambda a, b: ("f", a, b)
rt = lambda i, a: ("r", i, a)
SECT = [
 ("A", "Sami stofn margfaldaður", "V1", [("b", "Tölur saman, stafir saman. "), ("t", "Veldisvísarnir leggjast saman. Stakur stafur: "), ("m", "x = x^1")], "2-1 Sami stofn margfaldaður", [
   (1, ["x^4 · x^5"], ["x^9"]), (2, ["4a^3 · 5a^2"], ["20a^5"]), (3, ["2x^2y · 3xy^4"], ["6x^3y^5"])]),
 ("B", "Veldi af veldi og svigar", "V5 · V3", [("b", "Veldið fer á hvern þátt, líka töluna: "), ("m", "(2a)^3 = 8a^3"), ("t", ", ekki "), ("m", "2a^3")], "2-2 og 2-3", [
   (1, ["(y^3)^5"], ["y^{15}"]), (2, ["(2a^4)^3"], ["8a^{12}"]), (3, ["x^3(3x^2y^4)^2"], ["9x^7y^8"])]),
 ("C", "Mínus og brot í sviga", "V3", [("b", "Mínus í sléttu veldi → plús. "), ("t", "Brot: bæði teljari og nefnari fá veldið.")], "2-5 Mínus og brot í sviga", [
   (1, ["(−2x)^3"], ["−8x^3"]), (2, ["(−3a^2)^2"], ["9a^4"]), (3, ["16x^2", ("P", "("), "−", fr(["1"], ["4"]), "x^3", ("P", ")"), ("sup", "2")], ["x^8"])]),
 ("D", "Deiling", "V2", [("b", "Fleiri uppi → afgangurinn uppi. "), ("t", "Fleiri niðri → afgangurinn niðri. Má skrifa út og strika yfir pör.")], "2-4 Deiling: uppi og niðri", [
   (1, [fr(["a^9"], ["a^4"])], ["a^5"]), (2, [fr(["x^3y^7"], ["x^5y^2"])], [fr(["y^5"], ["x^2"])]), (3, [fr(["15a^6b^2"], ["5a^2b^6"])], [fr(["3a^4"], ["b^4"])])]),
 ("E", "Veldið 0 og neikvæð veldi", "V6", [("m", "a^0 = 1"), ("t", ", ekki 0. "), ("b", "Mínus-veldi → hinum megin við strikið, "), ("t", "með jákvæðu veldi.")], "3-1 og 3-2", [
   (1, ["7x^0"], ["7"]), (2, ["5a^{−3}"], [fr(["5"], ["a^3"])]), (3, [fr(["x^{−2}y^4"], ["x^3y^{−1}"])], [fr(["y^5"], ["x^5"])])]),
 ("F", "n í veldisvísinum", "V1 · V2", [("b", "SVIGI utan um það sem er dregið frá: "), ("m", "−(n + 2) = −n − 2")], "3-3 n í veldisvísinum", [
   (1, ["a^{n+4} · a^{2n−1}"], ["a^{3n+3}"]), (2, [fr(["x^{4n+3}"], ["x^{2n+1}"])], ["x^{2n+2}"]), (3, [fr(["(a^{3n})^2"], ["(−a^{n+2})^2"])], ["a^{4n−4}"])]),
 ("G", "Rætur", "R1", [("b", "Fullþáttaðu undir rótinni. "), ("t", "√ → par sendir eitt út, ∛ → þrennd sendir eitt út. Stakir verða eftir inni.")], "4-2 FACT og rætur", [
   (1, [rt(None, ["49x^6"])], ["7x^3"]), (2, [rt("3", ["27a^9"])], ["3a^3"]), (3, [fr([rt(None, ["36x^8"])], [rt(None, ["4x^2"])])], ["3x^3"])]),
 ("H", "Brotin veldi", "R1 · V1", [("b", "Veldið uppi, rótarvísirinn niðri. "), ("t", "Samnefna áður en brot eru lögð saman.")], "4-1 og 4-3", [
   (1, [("e", "x", "1", "2"), " · ", ("e", "x", "1", "4")], [("e", "x", "3", "4")]), (2, [("e", "(8x^6)", "1", "3")], ["2x^2"]), (3, [rt(None, ["x"]), " · ", rt("3", ["x^2"])], [("e", "x", "7", "6")])]),
 ("I", "Allt saman", "", [("b", "Röðin: "), ("t", "① rætur  ② svigar  ③ sami stofn  ④ mínus-veldi í nefnara")], "4-5 Allt saman og 5 Prófaðu þig", [
   (2, [fr(["(a^2b)^3"], ["a^4b^5"])], [fr(["a^2"], ["b^2"])]), (3, [fr([rt("3", ["2x^4"]), " · ", rt("3", ["4x^2"])], [rt(None, ["x"])])], ["2", ("e", "x", "3", "2")])]),
]

# ---------- síður ----------
page = [0]; y = [0]
TOP, BOT = H - 14 * mm, 16 * mm
def footer():
    text(L, 9 * mm, "Æfingadæmi · Veldi og rætur · STÆ2AH kafli 5", "S", 7.5, GREY)
    s = f"bls. {page[0]}"; text(R - sw(s, "S", 8), 9 * mm, s, "S", 8, GREY)
def newpage(first=False, cont=True):
    if not first: footer(); c.showPage()
    page[0] += 1; y[0] = TOP
    if not first and cont:
        text(L, y[0] - 2 * mm, "Æfingadæmi – veldi og rætur (frh.)", "SB", 10)
        c.setStrokeColorRGB(*LINE); c.setLineWidth(0.5); c.line(L, y[0] - 4.5 * mm, R, y[0] - 4.5 * mm); c.setStrokeColorRGB(*INK)
        y[0] -= 10 * mm

newpage(first=True)
text(L, y[0] - 4 * mm, "Æfingadæmi – veldi og rætur", "SB", 15)
text(L, y[0] - 10 * mm, "– einfaldaðu og gefðu svarið með jákvæðum veldum, án rótarmerkja", "S", 10, GREY)
text(R - 70 * mm, y[0] - 4 * mm, "Nafn:", "SB", 9.5); c.setStrokeColorRGB(*LINE); c.line(R - 58 * mm, y[0] - 4.5 * mm, R, y[0] - 4.5 * mm); c.setStrokeColorRGB(*INK)
yy = y[0] - 15 * mm
c.setFillColorRGB(*TINT); c.roundRect(L, yy - 21 * mm, R - L, 21 * mm, 4, stroke=0, fill=1); c.setFillColorRGB(*INK)
text(L + 4 * mm, yy - 5.5 * mm, "VINNURÖÐ – ALLTAF SÖMU FJÖGUR SKREF", "S", 7.5, GREY)
xx = L + 4 * mm
for a, b in [("①", "rætur → brotin veldi"), ("②", "svigar → veldið á allt"), ("③", "sami stofn saman"), ("④", "mínus-veldi → í nefnara")]:
    xx = text(xx, yy - 12 * mm, a + " ", "SB", 11); xx = text(xx, yy - 12 * mm, b, "SB", 9.5) + 4.5 * mm
text(L + 4 * mm, yy - 18 * mm, "Eitt skref í línu. Merktu ● hve erfitt dæmið er. Svörin eru aftast: hyldu þau á meðan þú reiknar.", "S", 8.5, GREY)
y[0] = yy - 27 * mm

BLOCK = 66 * mm
num = [0]
ANS = []
for code, title, ref, rem, web, probs in SECT:
    if y[0] - (14 * mm + BLOCK) < BOT: newpage()
    # kafla-haus
    yt = y[0]
    c.setFillColorRGB(*INK); c.roundRect(L, yt - 5 * mm, 7 * mm, 7 * mm, 1.5, stroke=0, fill=1)
    c.setFillColorRGB(1, 1, 1); c.setFont("SB", 11); c.drawCentredString(L + 3.5 * mm, yt - 3.2 * mm, code); c.setFillColorRGB(*INK)
    e = text(L + 10 * mm, yt - 3.2 * mm, title, "SB", 12.5)
    if ref:
        rw = sw(ref, "SB", 8) + 4 * mm
        c.setLineWidth(0.8); c.roundRect(e + 4 * mm, yt - 4.6 * mm, rw, 5 * mm, 1.2, stroke=1, fill=0)
        text(e + 6 * mm, yt - 3.3 * mm, ref, "SB", 8)
    text(R - sw("vefur: " + web, "S", 7.5), yt - 3.2 * mm, "vefur: " + web, "S", 7.5, GREY)
    remind(L, yt - 11 * mm, rem)
    y[0] = yt - 16 * mm
    for lvl, prob, ans in probs:
        if y[0] - BLOCK < BOT: newpage()
        num[0] += 1; n = num[0]
        y0 = y[0]
        c.setLineWidth(0.9); c.setStrokeColorRGB(*INK)
        c.roundRect(L, y0 - BLOCK + 3 * mm, R - L, BLOCK - 3 * mm, 3, stroke=1, fill=0)
        text(L + 3 * mm, y0 - 7 * mm, f"Dæmi {n}", "SB", 10)
        dots(L + 4.5 * mm, y0 - 11.5 * mm, lvl)
        base = y0 - 15 * mm
        hgt = asc(prob, 18)
        base = min(base, y0 - 5 * mm - hgt)
        RR(L + 27 * mm, base, prob, 18)
        # spássía: rétt
        mx = R - 24 * mm
        c.setLineWidth(0.8); c.rect(mx, y0 - 9 * mm, 3.8 * mm, 3.8 * mm, stroke=1, fill=0); text(mx + 5.5 * mm, y0 - 8.2 * mm, "Rétt", "S", 8.5)
        c.rect(mx, y0 - 15 * mm, 3.8 * mm, 3.8 * mm, stroke=1, fill=0); text(mx + 5.5 * mm, y0 - 14.2 * mm, "Rangt", "S", 8.5)
        # skriflínur
        c.setStrokeColorRGB(*LINE); c.setLineWidth(0.5)
        ly = y0 - 24 * mm
        while ly > y0 - BLOCK + 6 * mm:
            text(L + 5 * mm, ly + 1.2 * mm, "=", "S", 11, (0.7, 0.7, 0.7))
            c.line(L + 11 * mm, ly, R - 4 * mm, ly); ly -= 11 * mm
        c.setStrokeColorRGB(*INK)
        ANS.append((n, code, prob, ans, web))
        y[0] = y0 - BLOCK - 2 * mm

# ---------- svör ----------
footer(); c.showPage(); page[0] += 1
y0 = TOP
text(L, y0 - 4 * mm, "Svör", "SB", 15)
text(L + 18 * mm, y0 - 4 * mm, "– berðu saman eftir að þú ert búin(n). Ef svarið er rangt: æfðu atriðið á vefnum.", "S", 9.5, GREY)
yy = y0 - 12 * mm
colw = (R - L) / 2
rowh = 15 * mm
c.setFont("S", 7.5)
for i, (n, code, prob, ans, web) in enumerate(ANS):
    col, row = i // 13, i % 13
    x = L + col * colw; yb = yy - row * rowh
    c.setStrokeColorRGB(*LINE); c.setLineWidth(0.4); c.line(x, yb - rowh + 2 * mm, x + colw - 4 * mm, yb - rowh + 2 * mm); c.setStrokeColorRGB(*INK)
    text(x, yb - 7 * mm, f"{n}", "SB", 10)
    text(x + 7 * mm, yb - 7 * mm, code, "S", 7.5, GREY)
    bx = x + 13 * mm
    RR(bx, yb - 8.5 * mm, ans, 14, bold=True)
    text(x + colw - 4 * mm - sw("→ " + web.split(" ")[0], "S", 7), yb - 7 * mm, "→ " + web.split(" ")[0], "S", 7, GREY)
footer()
c.save()
print("pages", page[0])
