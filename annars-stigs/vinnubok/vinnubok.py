from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import sys, json, os
PREV=json.load(open("toc.json")) if os.path.exists("toc.json") else {"toc":[0]*7,"grid":0}

D = "/usr/share/fonts/truetype/"
for n, f in [("S", "dejavu/DejaVuSans"), ("SB", "dejavu/DejaVuSans-Bold"),
             ("MI", "liberation/LiberationSerif-Italic"), ("MB", "liberation/LiberationSerif-BoldItalic"),
             ("SR", "dejavu/DejaVuSerif")]:
    pdfmetrics.registerFont(TTFont(n, D + f + ".ttf"))
W, H = A4
OUT = sys.argv[1] if len(sys.argv) > 1 else "vinnubok.pdf"
c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("Vinnubók – Annars stigs jöfnur")
INK, GREY, TINT, LINE = (0.1, 0.1, 0.1), (0.45, 0.45, 0.45), (0.93, 0.93, 0.93), (0.72, 0.72, 0.72)
L = 12 * mm
R = W - 12 * mm
MARG = 31 * mm               # spássía fyrir mat
CR = R - MARG - 4 * mm        # hægri brún efnis
TOP = H - 22 * mm
BOT = 16 * mm
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

def text(x, y, s, f="S", size=10, col=INK):
    c.setFillColorRGB(*col); c.setFont(f, size); c.drawString(x, y, s); c.setFillColorRGB(*INK)
    return x + sw(s, f, size)

def wrap(s, f, size, width):
    words, lines, cur = s.split(" "), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if sw(t, f, size) > width and cur: lines.append(cur); cur = w
        else: cur = t
    if cur: lines.append(cur)
    return lines

def box(x, y, w, h=11 * mm, label=None, thick=False):
    c.setLineWidth(1.4 if thick else 0.8); c.setFillColorRGB(1, 1, 1); c.setStrokeColorRGB(*INK)
    c.roundRect(x, y - h * 0.3, w, h, 2, stroke=1, fill=1); c.setFillColorRGB(*INK)
    if label: math(x + (w - mw(label, 7)) / 2, y - h * 0.3 - 8, label, 7, col=GREY)
    return x + w

def checkbox(x, y, s=4 * mm):
    c.setLineWidth(0.9); c.rect(x, y - 0.6 * mm, s, s, stroke=1, fill=0); return x + s

def radical(x, y, s, size):
    k = size / 13; w = mw(s, size); cx = x + 10 * k
    math(cx, y, s, size)
    top = y + size * 0.98
    c.setLineWidth(k)
    p = c.beginPath(); p.moveTo(cx - 9*k, y + 4*k); p.lineTo(cx - 7*k, y + 5.5*k); p.lineTo(cx - 4.5*k, y - 2*k)
    p.lineTo(cx - 2*k, top); p.lineTo(cx + w + 2*k, top); c.drawPath(p)
    return cx + w + 3 * k

# ---------- uppsetning á síðu ----------
class Doc:
    page = 0; y = TOP; head = ""; sub = ""
doc = Doc()

def footer():
    text(L, 9 * mm, "Vinnubók · Annars stigs jöfnur · STÆ2AH kafli 7", "S", 7.5, GREY)
    s = f"bls. {doc.page}"; text(R - sw(s, "S", 8), 9 * mm, s, "S", 8, GREY)

def running_head():
    if not doc.head: return
    c.setFillColorRGB(*INK); c.rect(L, H - 15 * mm, 3.2 * mm, 3.2 * mm, stroke=0, fill=1)
    e = text(L + 5.5 * mm, H - 15 * mm + 0.4 * mm, doc.head, "SB", 9)
    text(e + 6, H - 15 * mm + 0.4 * mm, doc.sub, "S", 8, GREY)
    c.setStrokeColorRGB(*LINE); c.setLineWidth(0.5); c.line(L, H - 17 * mm, R, H - 17 * mm); c.setStrokeColorRGB(*INK)
    # spássíuheiti
    if not doc.head.startswith(("6.", "Glós")): text(R - MARG + 1 * mm, H - 15 * mm + 0.4 * mm, "Hvernig gekk?", "S", 7.5, GREY)

def new_page(first=False):
    if not first:
        footer(); c.showPage()
    doc.page += 1; doc.y = TOP
    running_head()

def need(h):
    if doc.y - h < BOT: new_page()

def space(h): doc.y -= h

def rate(ytop):
    """Matskvarði á spássíu: auðvelt ○○○○○ erfitt."""
    x0 = R - MARG + 1 * mm
    text(x0, ytop - 3 * mm, "auðvelt", "S", 6.5, GREY)
    s = "erfitt"; text(R - sw(s, "S", 6.5), ytop - 3 * mm, s, "S", 6.5, GREY)
    c.setLineWidth(0.8)
    step = (MARG - 2 * mm) / 5
    for i in range(5):
        c.circle(x0 + step * (i + 0.5), ytop - 8 * mm, 2.1 * mm, stroke=1, fill=0)
    c.setStrokeColorRGB(*LINE); c.setLineWidth(0.4)
    c.line(R - MARG - 2 * mm, ytop + 2 * mm, R - MARG - 2 * mm, ytop - 14 * mm); c.setStrokeColorRGB(*INK)

def part(n, title, web):
    """Nýr hluti byrjar alltaf á nýrri síðu."""
    doc.head = f"{n}. {title}"; doc.sub = f"Vefur: hluti {n}"
    if doc.y < TOP - 1: new_page()
    y = doc.y
    c.setFillColorRGB(*INK); c.roundRect(L, y - 14 * mm, R - L, 16 * mm, 4, stroke=0, fill=1)
    c.setFillColorRGB(1, 1, 1); c.setFont("SB", 22); c.drawString(L + 5 * mm, y - 9.5 * mm, str(n))
    c.setFont("SB", 16); c.drawString(L + 16 * mm, y - 6.5 * mm, title)
    c.setFont("S", 9); c.drawString(L + 16 * mm, y - 11.5 * mm, web)
    c.setFillColorRGB(*INK)
    doc.y = y - 22 * mm

def item(num, title, sub=""):
    need(34 * mm)
    y = doc.y
    c.setFillColorRGB(*INK); c.roundRect(L, y - 4.2 * mm, 12 * mm, 6.5 * mm, 1.5, stroke=0, fill=1)
    c.setFillColorRGB(1, 1, 1); c.setFont("SB", 9.5); c.drawCentredString(L + 6 * mm, y - 2.3 * mm, num); c.setFillColorRGB(*INK)
    e = text(L + 15 * mm, y - 2.3 * mm, title, "SB", 12.5)
    if sub: text(L + 15 * mm, y - 7.5 * mm, sub, "S", 8.5, GREY)
    rate(y + 1 * mm)
    doc.y = y - (15 * mm if sub else 10 * mm)

def para(s, size=10, f="S", col=INK, width=None):
    width = width or (CR - L)
    for ln in wrap(s, f, size, width):
        need(size * 0.5 * mm)
        text(L, doc.y, ln, f, size, col); doc.y -= size * 0.48 * mm
    doc.y -= 1.5 * mm

def lines(n, gap=11 * mm, x0=None, x1=None):
    x0 = x0 or L; x1 = x1 or CR
    for _ in range(n):
        need(gap)
        doc.y -= gap
        c.setStrokeColorRGB(*LINE); c.setLineWidth(0.5); c.line(x0, doc.y, x1, doc.y); c.setStrokeColorRGB(*INK)
    doc.y -= 4 * mm

def q(s, n=2, gap=11 * mm):
    """Spurning með skriflínum."""
    ls = wrap(s, "SB", 10.5, CR - L - 7 * mm)
    need(len(ls) * 5.5 * mm + gap + 2 * mm)
    c.setFont("SB", 10.5); text(L, doc.y, "▸", "SB", 10.5)
    for ln in ls:
        text(L + 5 * mm, doc.y, ln, "SB", 10.5); doc.y -= 5.2 * mm
    doc.y += 2 * mm
    lines(n, gap)

def row(parts, h=20 * mm, x=None, size=15):
    """Lína með texta, stærðfræði, reitum og auðum línum. parts: (tegund, ...)"""
    top = 16 * mm if any(p[0] == "frac" for p in parts) else 9 * mm
    h = max(h, top + 4 * mm)
    need(h + 2 * mm)
    y = doc.y - top
    x = x or L
    for p in parts:
        t = p[0]
        if t == "t": x = text(x, y, p[1], p[2] if len(p) > 2 else "S", p[3] if len(p) > 3 else 10.5) + 2
        elif t == "m": x = math(x, y, p[1], p[2] if len(p) > 2 else size) + 3
        elif t == "box": x = box(x, y, p[1] * mm, (p[3] if len(p) > 3 else 11) * mm, p[2] if len(p) > 2 else None) + 3
        elif t == "ln":
            c.setStrokeColorRGB(*LINE); c.setLineWidth(0.6); c.line(x, y - 1.5 * mm, x + p[1] * mm, y - 1.5 * mm); c.setStrokeColorRGB(*INK)
            x += p[1] * mm + 3
        elif t == "sp": x += p[1] * mm
        elif t == "cb":
            x = checkbox(x, y) + 2; x = text(x, y, p[1], "S", 10) + 5 * mm
        elif t == "g": x = text(x, y, p[1], "S", p[2] if len(p) > 2 else 8.5, GREY) + 2
        elif t == "frac":   # tómt brot: reitur yfir reit
            w = p[1] * mm
            c.setLineWidth(0.8); c.setFillColorRGB(1, 1, 1)
            c.roundRect(x, y + 3.5 * mm, w, 10 * mm, 2, stroke=1, fill=1)
            c.roundRect(x, y - 10.5 * mm, w, 10 * mm, 2, stroke=1, fill=1)
            c.setFillColorRGB(*INK); c.setLineWidth(1.3); c.line(x - 2 * mm, y + 1.7 * mm, x + w + 2 * mm, y + 1.7 * mm)
            if len(p) > 2:
                math(x + w + 3 * mm, y + 6 * mm, p[2], 7, col=GREY); math(x + w + 3 * mm, y - 8 * mm, p[3], 7, col=GREY)
            x += w + 4 * mm
    doc.y = y - max(h - top, 9 * mm)
    return x

def formula(ref, label, parts, h=19 * mm, size=15):
    """Grár formúlureitur með merki (A1, Þ1 …). parts eins og í row."""
    need(h + 4 * mm)
    y = doc.y
    c.setFillColorRGB(*TINT); c.roundRect(L, y - h, CR - L, h, 4, stroke=0, fill=1); c.setFillColorRGB(*INK)
    if ref:
        c.roundRect(L + 3 * mm, y - 7 * mm, sw(ref, "SB", 8.5) + 4 * mm, 5 * mm, 1.2, stroke=0, fill=1)
        text(L + 5 * mm, y - 5.6 * mm, ref, "SB", 8.5, (1, 1, 1))
    text(L + (sw(ref, "SB", 8.5) + 9 * mm if ref else 4 * mm), y - 5.6 * mm, label, "S", 8, GREY)
    doc.y = y - 6 * mm
    row(parts, h - 8 * mm, L + 6 * mm, size)
    doc.y = y - h - 5 * mm

def remind(parts, size=9):
    need(9 * mm)
    x, y = L, doc.y - 4 * mm
    c.setFillColorRGB(*INK); c.circle(x + 5, y + 2.8, 5, stroke=0, fill=1)
    c.setFillColorRGB(1, 1, 1); c.setFont("SB", 8); c.drawCentredString(x + 5, y + 0.1, "!")
    c.setFillColorRGB(*INK); x += 14
    for k, s in parts:
        x = math(x, y, s, size + 1) + 1 if k == "m" else text(x, y, s, "SB" if k == "b" else "S", size) + 1
    doc.y -= 10 * mm

def grid(x, ytop, w, h, label, xr=(-5, 5), yr=(-4, 6), extra=None):
    """Hnitakerfi til að teikna í."""
    gx, gy = w / (xr[1] - xr[0]), h / (yr[1] - yr[0])
    sx = lambda v: x + (v - xr[0]) * gx
    sy = lambda v: ytop - h + (v - yr[0]) * gy
    c.setStrokeColorRGB(0.85, 0.85, 0.85); c.setLineWidth(0.35)
    for v in range(xr[0], xr[1] + 1): c.line(sx(v), sy(yr[0]), sx(v), sy(yr[1]))
    for v in range(yr[0], yr[1] + 1): c.line(sx(xr[0]), sy(v), sx(xr[1]), sy(v))
    c.setStrokeColorRGB(*INK); c.setLineWidth(1.3); c.line(sx(xr[0]), sy(0), sx(xr[1]), sy(0))
    c.setLineWidth(0.9); c.line(sx(0), sy(yr[0]), sx(0), sy(yr[1]))
    for v in range(xr[0], xr[1] + 1):
        if v and v % 2 == 0:
            s = str(v).replace("-", "−"); text(sx(v) - sw(s, "S", 6.5) / 2, sy(0) - 3 * mm, s, "S", 6.5, GREY)
    math(sx(xr[1]) - 3 * mm, sy(0) + 1.5 * mm, "x", 9); math(sx(0) + 1.5 * mm, sy(yr[1]) - 3 * mm, "y", 9)
    c.setLineWidth(1); c.roundRect(x, ytop - h, w, h, 2, stroke=1, fill=0)
    text(x + w / 2 - sw(label, "SB", 9.5) / 2, ytop + 2.5 * mm, label, "SB", 9.5)
    return sx, sy

# =====================================================================
# Forsíða
new_page(first=True)
y = TOP
c.setFillColorRGB(*INK); c.rect(L, y - 2 * mm, 6 * mm, 6 * mm, stroke=0, fill=1)
text(L + 9 * mm, y - 1 * mm, "STÆ2AH · KAFLI 7", "SB", 9, GREY)
text(L, y - 16 * mm, "Vinnubók", "SB", 30)
text(L, y - 27 * mm, "Annars stigs jöfnur", "SB", 20)
text(L, y - 35 * mm, "– fylgir æfingarvefnum, hluta 1 til 6", "S", 11, GREY)
doc.y = y - 48 * mm
row([("t", "Nafn:", "SB", 11), ("ln", 85), ("sp", 6), ("t", "Dags.:", "SB", 11), ("ln", 40)], h=14 * mm)
doc.y -= 6 * mm
c.setFillColorRGB(*TINT); c.roundRect(L, doc.y - 74 * mm, R - L, 74 * mm, 4, stroke=0, fill=1); c.setFillColorRGB(*INK)
yy = doc.y - 8 * mm
text(L + 6 * mm, yy, "Svona notarðu vinnubókina", "SB", 12.5); yy -= 9 * mm
for a, b in [("1.", "Hafðu vefinn opinn við hliðina. Hver kafli hér heitir það sama og hluti á vefnum."),
             ("2.", "Þegar þú klárar atriði á vefnum: svaraðu spurningunum hér, með þínum eigin orðum."),
             ("3.", "Skrifaðu stórt. Það er nóg pláss. Notaðu frekar auka blað en að þrengja."),
             ("4.", "Merktu á spássíuna hvernig gekk að skilja: hringur lengst til vinstri = auðvelt,"),
             ("",   "lengst til hægri = erfitt. Þá sérðu hvað þú átt að skoða aftur fyrir prófið."),
             ("5.", "Gráu reitirnir eru formúlur. Fylltu þær inn með því að skoða formúlublaðið."),
             ("6.", "Aftast er pláss fyrir sjálfsprófið (hluti 6) og fyrir glósublaðið þitt.")]:
    text(L + 6 * mm, yy, a, "SB", 10.5); text(L + 13 * mm, yy, b, "S", 10.5); yy -= 7.5 * mm
# dæmi um matskvarða
doc.y -= 82 * mm
text(L, doc.y, "Matskvarðinn á spássíunni lítur svona út:", "S", 10)
ex_x = L + 80 * mm
save = (R, MARG)
c.saveState(); c.translate(ex_x - (R - MARG + 1 * mm), 0); rate(doc.y + 4 * mm); c.restoreState()
c.setLineWidth(1.2)
cx = ex_x + (MARG - 2 * mm) / 5 * 1.5; c.circle(cx, doc.y + 4 * mm - 8 * mm, 2.1 * mm, stroke=0, fill=1)
text(ex_x + MARG + 4 * mm, doc.y - 4 * mm, "← fyllt inn: frekar auðvelt", "S", 9, GREY)
doc.y -= 24 * mm
text(L, doc.y, "Efnisyfirlit", "SB", 12.5); doc.y -= 9 * mm
TOC = [("1", "Hvað er annars stigs jafna?"), ("2", "Raðaðu á staðalform"), ("3", "A, B og C"),
       ("4", "Lausnarformúlan"), ("5", "Styttri leiðir"), ("6", "Prófaðu þig (sjálfsprófið)"), ("", "Glósublaðið mitt")]
toc_y = doc.y
for a, b in TOC:
    text(L, doc.y, a, "SB", 11); text(L + 8 * mm, doc.y, b, "S", 11)
    c.setStrokeColorRGB(*LINE); c.setDash(1, 2); c.line(L + 8 * mm + sw(b, "S", 11) + 3, doc.y, R - 20 * mm, doc.y); c.setDash()
    c.setStrokeColorRGB(*INK)
    pg = PREV["toc"][TOC.index((a, b))]
    if pg: text(R - 12 * mm, doc.y, str(pg), "SB", 11)
    doc.y -= 8 * mm
TOC_PAGES = []

# =====================================================================
part(1, "Hvað er annars stigs jafna?", "Vefur: Einkennið er x² · Af hverju tvær lausnir? · 0, 1 eða 2 lausnir · Þekktu hana í sjón")
TOC_PAGES.append(doc.page)
item("1.1", "Einkennið er x²", "Vefur: Einkennið er x²")
q("Hvert er hæsta veldið af x í annars stigs jöfnu?", 1)
para("Staðalformið er á formúlublaðinu (A1). Skrifaðu það í reitinn:", 10, "S", GREY)
formula("A1", "staðalform", [("box", 60, "skrifaðu staðalformið", 12), ("m", " = 0", 16)], h=30 * mm)
q("Hvaða eina gildi má A EKKI hafa?", 1)
q("Af hverju ekki? Hvað gerist þá við jöfnuna?", 3)
q("B og C mega vera 0. Skrifaðu jöfnu þar sem B = 0, og aðra þar sem C = 0.", 2)
remind([("b", "Gildra: "), ("t", "x² verður að standa eftir. "), ("m", "2x^2 + x = 2x^2 − 4"), ("t", " er ekki annars stigs.")])

item("1.2", "Af hverju tvær lausnir?", "Vefur: x² = k með sleða")
row([("m", "x^2 = 9"), ("t", "  →  "), ("m", "x = "), ("box", 18), ("t", " eða "), ("m", "x = "), ("box", 18)])
q("Af hverju virkar líka mínustalan? Skrifaðu margföldunina.", 2)
row([("m", "x^2 = 0"), ("t", "  →  "), ("m", "x = "), ("box", 18), ("sp", 6), ("t", "Fjöldi lausna:"), ("box", 14)])
row([("m", "x^2 = −9"), ("t", "  →  "), ("box", 50, "lausn?"), ("sp", 2)])
q("Af hverju hefur x² = −9 enga lausn?", 2)

item("1.3", "0, 1 eða 2 lausnir", "Vefur: fleygbogi með sleðum fyrir A, B og C")
row([("t", "Lausnir jafnunnar eru þar sem fleygboginn"), ("ln", 50), ("t", "x-ásinn.")], h=13 * mm)
para("Teiknaðu fleygboga í hvert hnitakerfi. Merktu núllstöðvarnar með punkti.", 10, "S", GREY)
need(80 * mm)
gw, gh, gap = 46 * mm, 52 * mm, 5 * mm
yt = doc.y - 6 * mm
GRID_PAGE = doc.page
for i, lab in enumerate(["2 núllstöðvar", "1 núllstöð", "engin núllstöð"]):
    gx = L + i * (gw + gap)
    grid(gx, yt, gw, gh, lab)
    # reitur fyrir D (fyllt út í hluta 4)
    text(gx, yt - gh - 6 * mm, "D", "MI", 11)
    box(gx + 5 * mm, yt - gh - 6 * mm, 12 * mm, 9 * mm)
    text(gx + 19 * mm, yt - gh - 6 * mm, "0", "S", 11)
    text(gx + 23 * mm, yt - gh - 6 * mm, "(fylltu inn í hluta 4)", "S", 6.5, GREY)
doc.y = yt - gh - 14 * mm
row([("t", "A ræður hvort fleygboginn opnast"), ("ln", 28), ("t", "eða"), ("ln", 28), (".",)] if False else
    [("t", "Ef A > 0 opnast fleygboginn"), ("ln", 30), ("t", "Ef A < 0 opnast hann"), ("ln", 30)], h=13 * mm)
need(70 * mm)
yt = doc.y - 6 * mm
grid(L, yt, 70 * mm, 55 * mm, "Opnast niður og hefur 2 núllstöðvar")
c.setFont("S", 9)
tx = L + 76 * mm
for k, s in enumerate(["Hér er A:", "○ jákvætt", "○ neikvætt", "", "Hvaða tala (C) segir hvar", "boginn sker y-ásinn?", ""]):
    text(tx, yt - 6 * mm - k * 6 * mm, s, "S", 10)
c.setStrokeColorRGB(*LINE); c.line(tx, yt - 46 * mm, CR, yt - 46 * mm); c.setStrokeColorRGB(*INK)
doc.y = yt - 62 * mm

item("1.4", "Þekktu hana í sjón", "Vefur: þrjú stig – augljóst, x² hverfur, falið í sviga")
para("Er þetta annars stigs jafna? Hakaðu við og skrifaðu af hverju. Margfaldaðu upp úr svigum ef þarf.", 10, "S", GREY)
for eq in ["x^2 − 3x = 4", "5x − 2 = x", "x^2 + 2x = x^2 − 1", "x(x + 2) = 3", "(x − 1)^2 = x^2", "3x^2 = 12"]:
    need(17 * mm)
    y = doc.y - 8 * mm
    math(L, y, eq, 15)
    checkbox(L + 52 * mm, y); text(L + 57 * mm, y, "Já", "S", 10)
    checkbox(L + 67 * mm, y); text(L + 72 * mm, y, "Nei", "S", 10)
    text(L + 83 * mm, y + 4 * mm, "af hverju:", "S", 7, GREY)
    c.setStrokeColorRGB(*LINE); c.line(L + 83 * mm, y - 2 * mm, CR, y - 2 * mm); c.setStrokeColorRGB(*INK)
    doc.y -= 16 * mm
q("Hvenær hverfur x²? Skrifaðu dæmi.", 2)
q("Hvernig getur x² falist í sviga? Skrifaðu dæmi.", 2)

# =====================================================================
part(2, "Raðaðu á staðalform", "Vefur: algebruvélin – færa yfir =, sameina, raða, svigar, mínus, Þ1/Þ2, tveir svigar, A mínus")
TOC_PAGES.append(doc.page)
item("2.1", "Færðu yfir =", "Vefur: Svona virkar vélin · Færðu yfir =")
row([("t", "Þegar liður fer yfir = þá"), ("ln", 60)], h=13 * mm)
row([("m", "+5x"), ("t", " yfir =  verður  "), ("box", 24), ("sp", 10), ("m", "−8"), ("t", " yfir =  verður  "), ("box", 24)])
q("Af hverju breytist formerkið? (Hvað gerirðu í raun við báðar hliðar?)", 2)

item("2.2", "Sameina líka liði og raða", "Vefur: Sameinaðu líka liði · Raðaðu eftir veldum")
q("Hvað eru „líkir liðir“? Nefndu dæmi.", 2)
row([("m", "3x^2 − x^2 = "), ("box", 26), ("sp", 8), ("m", "2x − 5x = "), ("box", 26)])
row([("t", "Röðin á staðalformi:"), ("box", 22, "fremst"), ("t", "→"), ("box", 22, "svo"), ("t", "→"), ("box", 22, "síðast")])
q("Hvað gerirðu ef allt endar hægra megin, t.d. 12 = x² + x?", 2)

item("2.3", "Svigar", "Vefur: Margfaldaðu inn í sviga · Mínus fyrir framan sviga")
row([("m", "3(x^2 − 2) = "), ("box", 55)])
row([("m", "x(x + 6) = "), ("box", 55)])
row([("m", "−(x − 3) = "), ("box", 55)])
remind([("b", "Mínus fyrir framan sviga: "), ("t", "snýr "), ("b", "öllum "), ("t", "formerkjunum inni, ekki bara því fyrsta.")])
q("Hvernig útskýrirðu það með eigin orðum?", 2)

item("2.4", "Svigi í öðru veldi og tveir svigar", "Vefur: Svigi í öðru veldi · Tveir svigar")
para("Skrifaðu reglurnar af formúlublaðinu í reitina:", 10, "S", GREY)
formula("Þ1", "ferningsregla, summa", [("m", "(a + b)^2 = "), ("box", 80)], h=26 * mm)
formula("Þ2", "ferningsregla, mismunur", [("m", "(a − b)^2 = "), ("box", 80)], h=26 * mm)
formula("Þ3", "samokaregla", [("m", "(a + b)(a − b) = "), ("box", 70)], h=26 * mm)
row([("m", "(x + 4)^2 = "), ("box", 70)])
row([("t", "Algeng villa:"), ("m", "(x + 4)^2 = x^2 + 16"), ("t", " Hvað vantar?"), ("box", 30)], size=13)
row([("m", "(x + 2)(x − 5)"), ("t", ": hve margar margfaldanir?"), ("box", 16)])
row([("m", "(x + 2)(x − 5) = "), ("box", 80)])

item("2.5", "Þegar A er mínus", "Vefur: Þegar A er mínus")
row([("t", "Ef x²-liðurinn er mínus:"), ("ln", 70)], h=13 * mm)
row([("m", "−x^2 + 4x − 3 = 0"), ("t", "  ·(−1)  →  "), ("box", 60)])

item("2.6", "Röðin mín", "Vefur: Allt saman")
para("Skrifaðu skrefin sem þú notar alltaf, í réttri röð:", 10, "S", GREY)
for k in range(1, 6):
    row([("t", f"{k}.", "SB", 12), ("ln", 120)], h=12 * mm)
para("Æfðu röðina á einu dæmi. Eitt skref í línu:", 10, "S", GREY)
need(20 * mm)
row([("t", "Jafnan:", "SB", 10.5), ("m", "(x + 1)^2 = 3(x + 3)", 16)])
for lab in ["Svigar burt", "Allt yfir", "Sameina", "Raða", "Staðalform"]:
    need(15 * mm)
    text(L, doc.y - 8 * mm, lab, "S", 8.5, GREY)
    c.setStrokeColorRGB(*LINE); c.line(L + 25 * mm, doc.y - 10 * mm, CR, doc.y - 10 * mm); c.setStrokeColorRGB(*INK)
    doc.y -= 14 * mm
doc.y -= 4 * mm
q("Mín helsta gildra í þessum hluta:", 2)

# =====================================================================
part(3, "A, B og C", "Vefur: Hvað eru A, B og C? · Lestu af · Liður sem vantar · Raðaðu fyrst, lestu svo af")
TOC_PAGES.append(doc.page)
item("3.1", "Hvað eru A, B og C?", "Vefur: Hvað eru A, B og C?")
row([("m", "A"), ("t", " er"), ("ln", 95)], h=13 * mm)
row([("m", "B"), ("t", " er"), ("ln", 95)], h=13 * mm)
row([("m", "C"), ("t", " er"), ("ln", 95)], h=13 * mm)
q("Af hverju verður jafnan að vera = 0 áður en þú lest af?", 2)

item("3.2", "Fjórar reglur", "Vefur: reglurnar á ✓/✗-forminu")
row([("m", "−7x"), ("t", " → "), ("m", "B = "), ("box", 20), ("sp", 10), ("m", "x"), ("t", " → "), ("m", "B = "), ("box", 20), ("sp", 10), ("m", "−x"), ("t", " → "), ("m", "B = "), ("box", 20)])
row([("t", "Enginn x-liður →"), ("m", "B = "), ("box", 20)])
row([("m", "5 − 3x + x^2 = 0"), ("t", " → "), ("m", "A = "), ("box", 18), ("m", "B = "), ("box", 18), ("m", "C = "), ("box", 18)])
remind([("b", "Mundu: "), ("t", "stafurinn fylgir veldinu, ekki sætinu. Mínusinn fylgir stuðlinum.")])

item("3.3", "Lestu af", "Vefur: Lestu af · Liður sem vantar")
for eq in ["x^2 + 6x + 5 = 0", "2x^2 − x − 3 = 0", "−x^2 + 9 = 0", "4x^2 − 3x = 0", "7 − 2x + x^2 = 0"]:
    need(20 * mm)
    math(L, doc.y - 9 * mm, eq, 15)
    row([("m", "A = "), ("box", 17), ("m", "B = "), ("box", 17), ("m", "C = "), ("box", 17)], x=L + 58 * mm, h=19 * mm)

item("3.4", "Raðaðu fyrst, lestu svo af", "Vefur: Raðaðu fyrst, lestu svo af")
row([("t", "Jafnan:", "SB", 10.5), ("m", "6 − x = x^2", 16)])
lines(3, 13 * mm)
row([("m", "A = "), ("box", 18), ("m", "B = "), ("box", 18), ("m", "C = "), ("box", 18)])
q("Breytast A, B og C ef ég margfalda með (−1)? Skiptir það máli?", 2)

# =====================================================================
part(4, "Lausnarformúlan", "Vefur: Frá A, B og C til lausna · Reiknaðu D · Lausnarformúlan · Ein lausn eða engin · Allt saman")
TOC_PAGES.append(doc.page)
item("4.1", "Formúlurnar", "Vefur: Frá A, B og C til lausna")
para("Skrifaðu formúlurnar af formúlublaðinu í reitina. Skrifaðu stórt.", 10, "S", GREY)
formula("A2", "aðgreinir", [("m", "D = "), ("box", 80)], h=28 * mm, size=18)
need(42 * mm)
formula("A3", "lausnarformúla", [("m", "x = ", 20), ("frac", 70, "teljari", "nefnari")], h=44 * mm)
para("Hvað þýðir hver hluti formúlunnar?", 10.5, "SB")
for lab in ["−B", "±", "√D", "2A"]:
    need(14 * mm)
    math(L + 2 * mm, doc.y - 8 * mm, lab, 16)
    c.setStrokeColorRGB(*LINE); c.line(L + 18 * mm, doc.y - 10 * mm, CR, doc.y - 10 * mm); c.setStrokeColorRGB(*INK)
    doc.y -= 14 * mm
remind([("b", "Deilt er með 2A undir "), ("b", "öllu "), ("t", "strikinu, líka −B.")])

item("4.2", "Hvað segir D?", "Vefur: Reiknaðu D · Hvað segir D?")
for s in ["D > 0", "D = 0", "D < 0"]:
    row([("m", s, 16), ("t", " → "), ("box", 16), ("t", "lausnir.  Af hverju?"), ("ln", 62)], h=15 * mm)
remind([("b", f"Farðu aftur á bls. {PREV['grid']} "), ("t", f"og fylltu inn D > 0, D = 0 og D < 0 undir hnitakerfin.")])

item("4.3", "Reiknaðu D í réttri röð", "Vefur: Reiknaðu D í réttri röð")
row([("t", "Röð aðgerða:"), ("t", "①", "SB", 12), ("ln", 26), ("t", "②", "SB", 12), ("ln", 26), ("t", "③", "SB", 12), ("ln", 26)], h=13 * mm)
row([("t", "Dæmi:", "SB", 10.5), ("m", "x^2 − 2x − 8 = 0", 16)])
row([("m", "D = ( "), ("box", 18, "B"), ("m", " )^2 − 4 · ( "), ("box", 18, "A"), ("m", " ) · ( "), ("box", 18, "C"), ("m", " )")], h=17 * mm)
for lab in ["① veldið", "② 4 · A · C", "③ mínus mínus?", "④ D ="]:
    row([("g", lab, 9), ("sp", 4), ("ln", 110)], h=12 * mm)
q("Hvar gerði ég villu síðast þegar ég reiknaði D?", 2)

need(175 * mm)
item("4.4", "Lausnarformúlan, skref fyrir skref", "Vefur: Lausnarformúlan · A ≠ 1 og liður sem vantar")
def solve_template(eq=None):
    need(150 * mm)
    if eq: row([("t", "Jafnan:", "SB", 10.5), ("m", eq, 17)])
    else: row([("t", "Jafnan:", "SB", 10.5), ("ln", 110)], h=14 * mm)
    row([("g", "1  Stuðlar", 9), ("sp", 6), ("m", "A = "), ("box", 18), ("m", "B = "), ("box", 18), ("m", "C = "), ("box", 18)])
    row([("g", "2  D", 9), ("sp", 13), ("m", "D = ( "), ("box", 16, "B"), ("m", " )^2 − 4 · ( "), ("box", 16, "A"), ("m", " ) · ( "), ("box", 16, "C"), ("m", " ) = "), ("box", 18, "D", 11)], h=17 * mm, size=14)
    row([("g", "3  Fjöldi", 9), ("sp", 6), ("cb", "D > 0: tvær"), ("cb", "D = 0: ein"), ("cb", "D < 0: engin – búið!")], h=12 * mm)
    row([("g", "4  √D", 9), ("sp", 11), ("m", "√D = "), ("box", 22)])
    need(34 * mm)
    row([("g", "5  Inn í A3", 9), ("sp", 3), ("m", "x = ", 18), ("frac", 52), ("m", " = ", 18), ("frac", 40)], h=30 * mm)
    row([("g", "6  Lausnir", 9), ("sp", 4), ("m", "x_1 = "), ("box", 26, None, 12), ("sp", 6), ("m", "x_2 = "), ("box", 26, None, 12)], h=16 * mm)
    row([("g", "7  Prófun", 9), ("sp", 5), ("ln", 112)], h=13 * mm)
    row([("sp", 23), ("ln", 112)], h=11 * mm)
    row([("sp", 23), ("ln", 112)], h=11 * mm)
    need(20 * mm); y = doc.y - 9 * mm
    text(L, y, "Svar:", "SB", 11); box(L + 23 * mm, y, 90 * mm, 12 * mm, thick=True)
    doc.y = y - 12 * mm
solve_template("x^2 − 2x − 15 = 0")
remind([("b", "−B "), ("t", "snýr formerkinu: B = −2 gefur −B = 2.  "), ("b", "Prófun: "), ("t", "settu lausnina inn, út á að koma 0.")])
need(175 * mm)
item("4.5", "Eitt dæmi af vefnum", "Vefur: veldu dæmi úr Ein lausn eða engin, eða Allt saman")
solve_template()

# =====================================================================
part(5, "Styttri leiðir", "Vefur: Hvenær má stytta sér leið? · Vantar C · Vantar B · Ágiskun (Þ4) · Hvaða leið er styst?")
TOC_PAGES.append(doc.page)
item("5.1", "Hvenær má stytta sér leið?", "Vefur: Hvenær má stytta sér leið?")
row([("t", "Lausnarformúlan virkar"), ("ln", 50), ("t", ". Styttri leiðir eru")], h=13 * mm)
row([("ln", 70), ("t", "– ef ég er í vafa nota ég"), ("ln", 40)], h=13 * mm)
formula("", "Núllreglan", [("m", "a · b = 0  →  "), ("box", 80)], h=26 * mm)
q("Af hverju virkar núllreglan? (Hvaða tölur gefa 0 þegar þær eru margfaldaðar?)", 2)
q("Af hverju virkar núllreglan EKKI á x(x − 5) = 6?", 2)

item("5.2", "Vantar C: x út fyrir sviga", "Vefur: Vantar C")
row([("m", "x^2 − 6x = 0"), ("t", " → "), ("m", "x("), ("box", 30), ("m", ") = 0"), ("t", " → "), ("m", "x = "), ("box", 14), ("t", "eða"), ("m", "x = "), ("box", 14)], size=14)
row([("t", "Gildra: ef ég deili báðum megin með x, þá"), ("ln", 55)], h=13 * mm)
row([("m", "3x^2 + 12x = 0"), ("t", " → "), ("ln", 95)], h=15 * mm)

item("5.3", "Vantar B: x² = tala", "Vefur: Vantar B")
row([("m", "2x^2 − 18 = 0"), ("t", " → "), ("m", "x^2 = "), ("box", 18), ("t", " → "), ("m", "x = ± "), ("box", 18)])
row([("t", "Ég má ekki gleyma"), ("box", 14), ("t", "fyrir framan rótina."), ("sp", 4), ("t", "Ef x² = neikvæð tala:"), ("ln", 32)], h=15 * mm)
row([("m", "x^2 + 16 = 0"), ("t", " → "), ("ln", 95)], h=15 * mm)

item("5.4", "Ágiskun (Þ4)", "Vefur: Ágiskun (Þ4)")
formula("Þ4", "ágiskunarreglan", [("m", "x^2 + bx + c = (x + r)(x + s)"), ("sp", 3), ("t", "þar sem"), ("m", "r · s = "), ("box", 12), ("m", "r + s = "), ("box", 12)], h=26 * mm, size=14)
row([("t", "Dæmi:", "SB", 10.5), ("m", "x^2 + 5x + 6 = 0", 16), ("t", "   Pör sem gefa 6 (margfeldi) og summa þeirra:")])
need(30 * mm)
yt = doc.y - 2 * mm
for k in range(4):
    bx = L + k * 37 * mm
    c.setLineWidth(0.8); c.roundRect(bx, yt - 24 * mm, 33 * mm, 24 * mm, 2, stroke=1, fill=0)
    text(bx + 3 * mm, yt - 6 * mm, "par:", "S", 7, GREY); text(bx + 3 * mm, yt - 16 * mm, "summa:", "S", 7, GREY)
    c.setStrokeColorRGB(*LINE); c.line(bx + 3 * mm, yt - 12 * mm, bx + 30 * mm, yt - 12 * mm); c.setStrokeColorRGB(*INK)
doc.y = yt - 30 * mm
row([("m", "(x + "), ("box", 14), ("m", ")(x + "), ("box", 14), ("m", ") = 0  →  x = "), ("box", 14), ("t", "eða"), ("m", "x = "), ("box", 14)])
remind([("b", "Formerkið snýst í lokin: "), ("m", "x + 3 = 0"), ("t", " → "), ("m", "x = −3"), ("t", ", ekki 3.")])

need(75 * mm)
item("5.5", "Hvaða leið er styst?", "Vefur: Hvaða leið er styst?")
para("Hakaðu við stystu leiðina:", 10, "S", GREY)
for eq in ["x^2 − 8x = 0", "x^2 − 36 = 0", "x^2 + 7x + 12 = 0", "2x^2 + 3x − 5 = 0"]:
    need(14 * mm)
    y = doc.y - 7 * mm
    math(L, y, eq, 14)
    xx = L + 48 * mm
    for lab in ["x út", "x² = tala", "Þ4", "formúla"]:
        checkbox(xx, y); xx = text(xx + 5 * mm, y, lab, "S", 9.5) + 5 * mm
    doc.y -= 13 * mm

# =====================================================================
part(6, "Prófaðu þig", "Vefur: Próf á blaði – búðu til próf á vefnum, leystu hér, merktu svo á vefnum")
TOC_PAGES.append(doc.page)
row([("t", "Dags.:", "SB", 10.5), ("ln", 40), ("sp", 4), ("t", "Fjöldi dæma:", "SB", 10.5), ("box", 14), ("sp", 4), ("t", "Erfiðleiki:", "SB", 10.5), ("ln", 30)], h=14 * mm)
para("Skrifaðu jöfnuna af vefnum í reitinn og leystu hana fyrir neðan. Eitt skref í línu. Merktu svo hér og á vefnum hvort þú fékkst rétt.", 10, "S", GREY)
def test_block(n):
    hh = 126 * mm
    need(hh)
    y0 = doc.y
    c.setLineWidth(1); c.roundRect(L, y0 - hh + 4 * mm, CR - L, hh - 4 * mm, 4, stroke=1, fill=0)
    c.setFillColorRGB(*INK); c.roundRect(L + 4 * mm, y0 - 11 * mm, 9 * mm, 7 * mm, 1.5, stroke=0, fill=1)
    c.setFillColorRGB(1, 1, 1); c.setFont("SB", 11); c.drawCentredString(L + 8.5 * mm, y0 - 8.8 * mm, str(n)); c.setFillColorRGB(*INK)
    text(L + 16 * mm, y0 - 8.8 * mm, "Jafnan:", "SB", 10)
    c.setStrokeColorRGB(*LINE); c.line(L + 31 * mm, y0 - 10 * mm, CR - 4 * mm, y0 - 10 * mm)
    yy = y0 - 23 * mm
    for k in range(8):
        c.line(L + 6 * mm, yy, CR - 4 * mm, yy); yy -= 10.5 * mm
    c.setStrokeColorRGB(*INK)
    text(L + 6 * mm, y0 - hh + 12 * mm, "Svar:", "SB", 10.5)
    box(L + 20 * mm, y0 - hh + 12 * mm, 70 * mm, 11 * mm, thick=True)
    # spássía: rétt / rangt / hvar
    mx = R - MARG + 1 * mm
    text(mx, y0 - 6 * mm, "Fékk ég rétt?", "SB", 8)
    checkbox(mx, y0 - 14 * mm); text(mx + 6 * mm, y0 - 14 * mm, "Rétt", "S", 9)
    checkbox(mx, y0 - 22 * mm); text(mx + 6 * mm, y0 - 22 * mm, "Rangt", "S", 9)
    text(mx, y0 - 33 * mm, "Fór út af í:", "S", 7.5, GREY)
    c.setStrokeColorRGB(*LINE)
    for k in range(3): c.line(mx, y0 - 42 * mm - k * 9 * mm, R, y0 - 42 * mm - k * 9 * mm)
    c.setStrokeColorRGB(*INK)
    doc.y = y0 - hh - 2 * mm
for n in range(1, 11):
    test_block(n)

need(200 * mm)
if doc.y < TOP - 1: new_page()
doc.y -= 6 * mm
text(L, doc.y, "Niðurstöður sjálfsprófsins", "SB", 15); doc.y -= 12 * mm
row([("t", "Rétt:", "SB", 12), ("box", 16), ("t", "af", "S", 12), ("box", 16)], h=16 * mm)
q("Það sem vefurinn segir að ég þurfi að æfa:", 4, 12 * mm)
q("Það sem gekk vel:", 2, 12 * mm)
q("Næst ætla ég að passa sérstaklega:", 3, 12 * mm)
q("Atriði þar sem ég merkti „erfitt“ á spássíuna og ætla að skoða aftur:", 3, 12 * mm)

# =====================================================================
doc.head = "Glósublaðið mitt"; doc.sub = "drög að A4-blaðinu sem má hafa í prófinu"
new_page()
TOC_PAGES.append(doc.page)
doc.y -= 6 * mm
text(L, doc.y, "Glósublaðið mitt – drög", "SB", 15); doc.y -= 8 * mm
para("Í prófinu má hafa eitt A4-glósublað. Skrifaðu hér það sem ÞÚ þarft að muna. Byrjaðu á atriðunum sem þú merktir erfið. Góð glósa: einkenni → aðferð → gildra → smádæmi.", 10, "S", GREY)
for t in ["Röðin mín (raða → A, B, C → D → x)", "Gildrur með formerki", "Styttri leiðir: hvernig þekki ég þær?", "Annað sem ég gleymi"]:
    need(60 * mm)
    text(L, doc.y - 4 * mm, t, "SB", 11.5); doc.y -= 6 * mm
    lines(4, 12 * mm, L, R)

while doc.y - 12 * mm > BOT + 4 * mm:
    doc.y -= 12 * mm
    c.setStrokeColorRGB(*LINE); c.setLineWidth(0.5); c.line(L, doc.y, R, doc.y); c.setStrokeColorRGB(*INK)
footer()
# efnisyfirlit: blaðsíðutöl (síða 1 er þegar teiknuð, skrifum á eftir með nýrri síðu ekki hægt) –
c.save()
json.dump({"toc":TOC_PAGES,"grid":GRID_PAGE},open("toc.json","w"))
print("pages", doc.page, "toc", TOC_PAGES, GRID_PAGE)
