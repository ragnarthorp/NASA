#!/usr/bin/env python3
"""Útdráttur texta úr „Ódysseifskviða – endursögn“ (PDF) í skipulögð textagögn.

Keyrsla (úr möppunni odysseifskvida/):

    python3 tools/extract.py

Les  heimild/Odysseifskvida-endursogn.pdf  (óbreytt frumskjal) og skrifar:

    data/odysseifskvida.json      skipulögð textagögn (frumgögn)
    data/odysseifskvida.js        sömu gögn sem  window.ODY_TEXT = …  (svo vefurinn virki líka af file://)
    data/utdrattur-skyrsla.md     yfirlit: kaflar, síður, slepptir myndatextar og óvissuatriði til yfirferðar

Hlutverk texta eru greind eftir leturgerð og stærð (staðfest með skoðun skjalsins):

    CormorantGaramond Bold 10        yfirfyrirsögn („FYRSTI ÞÁTTUR“, „FORMÁLI“ …)
    CormorantGaramond Bold 25/36/40  kaflaheiti / titill
    CormorantGaramond Bold 14        undirfyrirsögn („Myndir“ – upphaf myndaskrár, sleppt)
    CormorantGaramond Bold 11.4      rómverskar tölur í efnisyfirliti
    EBGaramond Regular 10.4–12       meginmál
    EBGaramond Italic 12.8           inndregin tilvitnun (þýðing Sveinbjarnar Egilssonar)
    EBGaramond Regular 9.4           heimildarlína tilvitnunar
    EBGaramond Italic 9.6            myndatexti (sleppt)
    EBGaramond SemiBold/Regular 11.4 nafnalisti „Helstu nöfn“ (síða 49) / efnisyfirlit (síða 3)
    Times-Roman 9.5                  prentað síðunúmer (geymt sem lýsigögn, ekki í lestrartexta)

Ekkert er umorðað. Línur sem brotna vegna síðubreiddar eru sameinaðar með bili. Bandstrik/þankastrik
í línulok eru varðveitt; óvissa er skráð í skýrsluna.
"""
import hashlib
import json
import os
import re
import sys
import unicodedata

import pdfplumber

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'heimild', 'Odysseifskvida-endursogn.pdf')
OUT_JSON = os.path.join(ROOT, 'data', 'odysseifskvida.json')
OUT_JS = os.path.join(ROOT, 'data', 'odysseifskvida.js')
OUT_REPORT = os.path.join(ROOT, 'data', 'utdrattur-skyrsla.md')

DOC_ID = 'odysseifskvida-endursogn'
DATA_FORMAT = 1

ORDINALS = [
    'FYRSTI', 'ANNAR', 'ÞRIÐJI', 'FJÓRÐI', 'FIMMTI', 'SJÖTTI', 'SJÖUNDI', 'ÁTTUNDI', 'NÍUNDI', 'TÍUNDI',
    'ELLEFTI', 'TÓLFTI', 'ÞRETTÁNDI', 'FJÓRTÁNDI', 'FIMMTÁNDI', 'SEXTÁNDI', 'SEYTJÁNDI', 'ÁTJÁNDI',
    'NÍTJÁNDI', 'TUTTUGASTI', 'TUTTUGASTI OG FYRSTI', 'TUTTUGASTI OG ANNAR', 'TUTTUGASTI OG ÞRIÐJI',
    'TUTTUGASTI OG FJÓRÐI',
]


def roman(n):
    out = ''
    for v, s in [(10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]:
        while n >= v:
            out += s
            n -= v
    return out


def role_of(ch, pno):
    font = ch['fontname'].split('+')[-1]
    size = round(ch['size'], 1)
    if font.startswith('Times'):
        return 'pagenum'
    if font.startswith('CormorantGaramond'):
        if size == 10.0:
            return 'kicker'
        if size >= 24:
            return 'title'
        if size == 14.0 and 'SemiBold' in font:
            return 'subtitle'
        if size == 14.0:
            return 'subheading'
        if size == 11.4:
            return 'toc'
    if font == 'EBGaramond-Italic':
        if size >= 12:
            return 'quote'
        return 'caption'
    if font in ('EBGaramond-Regular', 'EBGaramond-SemiBold'):
        if pno == 3 and size == 11.4:
            return 'toc'
        if size == 11.4:
            return 'name'
        if size == 9.4:
            return 'source'
        if pno <= 2:
            return 'subtitle'
        if size >= 10.4:
            return 'body'
    return 'unknown'


def norm(s):
    s = unicodedata.normalize('NFC', s)
    return re.sub(r'[ \t ]+', ' ', s).strip()


def page_lines(page, pno):
    """Línur síðunnar, flokkaðar eftir hlutverki. Hver lína: dict(role, text, top, x0, x1, size, chars)."""
    roles = {}
    for ch in page.chars:
        roles.setdefault(role_of(ch, pno), []).append(ch)
    lines = []
    for role, chars in roles.items():
        ids = set(id(c) for c in chars)
        sub = page.filter(lambda o, ids=ids: o.get('object_type') != 'char' or id(o) in ids)
        for l in sub.extract_text_lines(return_chars=True, strip=True):
            if not l['text'].strip():
                continue
            lines.append({
                'role': role, 'text': norm(l['text']), 'top': l['top'], 'x0': l['x0'], 'x1': l['x1'],
                'size': round(l['chars'][0]['size'], 1), 'chars': l['chars'],
            })
    lines.sort(key=lambda l: (round(l['top'], 0), l['x0']))
    return lines


def join_lines(prev, nxt, notes, where):
    """Sameinar tvær línur sem brotnuðu vegna síðubreiddar."""
    if prev.endswith('–') and re.search(r'\d–$', prev) and re.match(r'\d', nxt):
        notes.append(f'{where}: talnabil brotnaði í línulok („…{prev[-12:]}“ + „{nxt[:12]}…“); sameinað án bils.')
        return prev + nxt
    if prev.endswith('-'):
        notes.append(f'{where}: bandstrik í línulok („…{prev[-12:]}“); varðveitt og sameinað án bils.')
        return prev + nxt
    return prev + ' ' + nxt


SENTENCE_END = tuple('.!?:“"…)')


def main():
    if not os.path.exists(SRC):
        sys.exit('Frumskjal fannst ekki: ' + SRC)
    raw = open(SRC, 'rb').read()
    sha = hashlib.sha256(raw).hexdigest()
    pdf = pdfplumber.open(SRC)
    npages = len(pdf.pages)
    uncertain = []
    dropped_captions = []
    printed = {}

    # 1) línur hverrar síðu
    pages = []
    for i, page in enumerate(pdf.pages):
        pno = i + 1
        lines = page_lines(page, pno)
        nums = [l for l in lines if l['role'] == 'pagenum']
        if nums:
            txt = ''.join(l['text'] for l in nums).strip()
            if re.fullmatch(r'\d+', txt) and int(txt) == pno:
                printed[pno] = int(txt)
            else:
                uncertain.append(f'PDF-síða {pno}: prentað síðunúmer „{txt}“ passar ekki við PDF-síðu; ekki notað.')
        unknown = [l for l in lines if l['role'] == 'unknown']
        for l in unknown:
            uncertain.append(f'PDF-síða {pno}: óþekkt leturgerð í línu „{l["text"][:50]}“ – sleppt.')
        for l in lines:
            if l['role'] == 'caption':
                dropped_captions.append((pno, l['text']))
        pages.append({'pno': pno, 'lines': [l for l in lines if l['role'] not in ('pagenum', 'unknown')],
                      'images': [(im['top'], im['bottom']) for im in page.images]})

    # 2) efnisyfirlit (síða 3): tveir dálkar, lesnir hvor fyrir sig (ekki sem lína þvert yfir síðuna)
    toc = []
    p3 = pdf.pages[2]
    for left in (True, False):
        sub = p3.filter(lambda o, left=left: o.get('object_type') != 'char' or (
            role_of(o, 3) == 'toc' and ((o['x0'] < 200) == left)))
        cur = None
        for l in sub.extract_text_lines(strip=True):
            t = norm(l['text'])
            m = re.match(r'^([IVXL]+)\s+(.*)$', t)
            if m:
                cur = {'numeral': m.group(1), 'title': m.group(2)}
                toc.append(cur)
            elif cur and t:
                cur['title'] += ' ' + t
    toc.sort(key=lambda e: roman_to_int(e['numeral']))

    # 3) kaflar og textaeiningar
    sections = []
    cur = None
    open_block = None  # síðasta eining sem gæti haldið áfram á næstu síðu

    def new_section(sid, kind, kicker, title, pno, number=None):
        s = {'id': sid, 'kind': kind, 'number': number, 'numeral': roman(number) if number else None,
             'kicker': kicker, 'title': title, 'pdfPageStart': pno, 'pdfPageEnd': pno, 'units': []}
        sections.append(s)
        return s

    def add_unit(sec, utype, text, pno, line, extra=None):
        u = {'type': utype, 'text': text, 'pages': [{'offset': 0, 'pdfPage': pno, 'printedPage': printed.get(pno)}],
             '_last': line, '_lines': [line]}
        if extra:
            u.update(extra)
        sec['units'].append(u)
        sec['pdfPageEnd'] = max(sec['pdfPageEnd'], pno)
        return u

    def extend_unit(u, line, pno, where):
        if pno != u['pages'][-1]['pdfPage']:
            sep_text = join_lines(u['text'], line['text'], uncertain, where)
            offset = len(sep_text) - len(line['text'])
            u['pages'].append({'offset': offset, 'pdfPage': pno, 'printedPage': printed.get(pno)})
            u['text'] = sep_text
        else:
            u['text'] = join_lines(u['text'], line['text'], uncertain, where)
        u['_last'] = line
        u['_lines'].append(line)

    def line_is_full(u, line):
        width = max(l['x1'] for l in u['_lines'])
        right = max(width, 360.0)
        return line['x1'] >= right - 22

    in_myndaskra = False
    for page in pages:
        pno = page['pno']
        lines = page['lines']
        if pno == 3:
            continue  # efnisyfirlit – vefurinn býr til sitt eigið úr staðfestum kaflaheitum
        prev = None  # síðasta lína (sama síða) sem tilheyrir lestrartexta
        kicker_lines = [l for l in lines if l['role'] == 'kicker']
        title_lines = [l for l in lines if l['role'] == 'title']
        if pno in (1, 2):
            if pno == 1:
                cur = new_section('titill', 'titill', kicker_lines[0]['text'] if kicker_lines else None,
                                  ' '.join(l['text'] for l in title_lines), pno)
            for l in lines:
                if l['role'] in ('subtitle',):
                    if prev is not None and prev['role'] == 'subtitle' and l['top'] - prev['top'] < l['size'] * 1.6 and prev['size'] == l['size']:
                        extend_unit(cur['units'][-1], l, pno, f'PDF-síða {pno}')
                    else:
                        add_unit(cur, 'titill', l['text'], pno, l)
                    prev = l
                elif l['role'] == 'title' and pno == 2:
                    add_unit(cur, 'titill', l['text'], pno, l)
                    prev = l
            continue

        if kicker_lines and title_lines:
            kicker = ' '.join(l['text'] for l in kicker_lines)
            title = ' '.join(l['text'] for l in title_lines)
            open_block = None
            in_myndaskra = False
            if kicker.endswith('ÞÁTTUR'):
                word = kicker[:-len('ÞÁTTUR')].strip()
                if word not in ORDINALS:
                    sys.exit(f'Óþekkt raðtala í yfirfyrirsögn á síðu {pno}: {kicker}')
                n = ORDINALS.index(word) + 1
                cur = new_section(f'thattur-{n:02d}', 'thattur', kicker, title, pno, n)
            elif kicker == 'FORMÁLI':
                cur = new_section('formali', 'formali', kicker, title, pno)
            elif kicker == 'TIL UPPRIFJUNAR':
                cur = new_section('nofn', 'nofn', kicker, title, pno)
            elif kicker == 'UM BÓKINA':
                cur = new_section('um-bokina', 'um-bokina', kicker, title, pno)
            else:
                sys.exit(f'Óþekkt kaflategund á síðu {pno}: {kicker}')
        elif cur is None:
            sys.exit(f'Texti á síðu {pno} án kafla')

        content = [l for l in lines if l['role'] in ('body', 'quote', 'source', 'name', 'subheading', 'caption')]
        for l in content:
            if l['role'] == 'subheading':
                # „Myndir“ í „Texti og myndir“: myndaskráin er utan umfangs
                in_myndaskra = True
                uncertain_note = f'PDF-síða {pno}: undirfyrirsögnin „{l["text"]}“ og myndaskráin sem fylgir eru slepptar (myndaskrá er utan umfangs).'
                if uncertain_note not in uncertain:
                    uncertain.append(uncertain_note)
                open_block = None
                continue
            if in_myndaskra:
                dropped_captions.append((pno, '[myndaskrá] ' + l['text']))
                continue
            if l['role'] == 'caption':
                # myndatexti rýfur ekki efnisgrein; hann er einfaldlega ekki lestrartexti
                continue
            role = l['role']
            utype = {'body': 'efnisgrein', 'quote': 'tilvitnun', 'source': 'heimild', 'name': 'nafn'}[role]
            gap_limit = l['size'] * 1.6
            same_page_cont = (prev is not None and prev['role'] == role and l['top'] - prev['top'] <= gap_limit
                              and open_block is not None and open_block['type'] == utype)
            if same_page_cont:
                extend_unit(open_block, l, pno, f'PDF-síða {pno}')
                prev = l
                continue
            cross = (prev is None and open_block is not None and open_block['type'] == utype
                     and open_block['pages'][-1]['pdfPage'] == pno - 1)
            # mynd á miðri síðu milli tveggja lína sama hlutverks: sama mat og við síðuskil
            img_between = (prev is not None and prev['role'] == role and open_block is not None
                           and open_block['type'] == utype and utype == 'efnisgrein'
                           and any(prev['top'] < top < l['top'] for top, _ in page['images']))
            if img_between:
                last = open_block['_last']
                cont = line_is_full(open_block, last) and not last['text'].endswith(SENTENCE_END)
                uncertain.append(f'PDF-síða {pno}: mynd rýfur meginmál; túlkað sem '
                                 + ('framhald sömu efnisgreinar.' if cont else 'ný efnisgrein.'))
                if cont:
                    extend_unit(open_block, l, pno, f'PDF-síða {pno}')
                    prev = l
                    continue
            if cross:
                last = open_block['_last']
                full = line_is_full(open_block, last)
                ended = last['text'].endswith(SENTENCE_END)
                lower = l['text'][:1].islower() or l['text'][:1] in '…,;'
                if utype == 'tilvitnun':
                    cont = not last['text'].endswith('“')
                elif utype == 'heimild':
                    cont = False
                elif full and not ended:
                    cont = True
                elif full and ended:
                    cont = lower
                    uncertain.append(
                        f'Síðuskil {pno - 1}→{pno} ({cur["id"]}): síðasta lína fyllir línuna og endar á „{last["text"][-1]}“; '
                        f'næsta síða byrjar á „{l["text"][:30]}…“. Túlkað sem '
                        + ('framhald sömu efnisgreinar.' if cont else 'ný efnisgrein.'))
                else:
                    cont = False
                if cont:
                    extend_unit(open_block, l, pno, f'Síðuskil {pno - 1}→{pno}')
                    prev = l
                    continue
            extra = None
            if utype == 'nafn':
                term = ''.join(c['text'] for c in l['chars'] if 'SemiBold' in c['fontname'])
                term_norm = norm(term)
                idx = l['text'].find(':')
                if idx < 0 or norm(l['text'][:idx + 1]).replace(' ', '') != term_norm.replace(' ', ''):
                    uncertain.append(f'PDF-síða {pno}: heiti nafnafærslu óljóst í „{l["text"][:40]}“.')
                extra = {'termLength': idx + 1 if idx >= 0 else 0}
            open_block = add_unit(cur, utype, l['text'], pno, l, extra)
            prev = l

    # 4) tengja heimildarlínur við tilvitnanir, númera, auðkenni
    for s in sections:
        n = 0
        prev_u = None
        for u in s['units']:
            n += 1
            u['n'] = n
            u['id'] = f'{s["id"]}-{n:03d}'
            u['text'] = unicodedata.normalize('NFC', u['text'])
            u['hash'] = hashlib.sha1(u['text'].encode('utf-8')).hexdigest()[:12]
            if u['type'] == 'heimild':
                if prev_u is None or prev_u['type'] != 'tilvitnun':
                    uncertain.append(f'{u["id"]}: heimildarlína án tilvitnunar á undan.')
                else:
                    u['quoteId'] = prev_u['id']
                    prev_u['sourceId'] = u['id']
            if u['type'] == 'tilvitnun' and not (u['text'].startswith('„') and u['text'].endswith('“')):
                uncertain.append(f'{u["id"]}: tilvitnun byrjar/endar ekki á gæsalöppum: „{u["text"][:30]}…{u["text"][-20:]}“')
            del u['_last']
            del u['_lines']
            prev_u = u

    # 5) sannprófun
    chapters = [s for s in sections if s['kind'] == 'thattur']
    problems = []
    if len(chapters) != 24:
        problems.append(f'Fjöldi þátta er {len(chapters)}, ekki 24.')
    for i, c in enumerate(chapters):
        if c['number'] != i + 1:
            problems.append(f'Þáttur {c["id"]} er ekki í réttri röð.')
    if len(toc) != 24:
        problems.append(f'Efnisyfirlit hefur {len(toc)} færslur, ekki 24.')
    for e in toc:
        n = roman_to_int(e['numeral'])
        c = next((c for c in chapters if c['number'] == n), None)
        if not c:
            problems.append(f'Efnisyfirlit: {e["numeral"]} finnst ekki sem kafli.')
        elif norm(e['title']) != norm(c['title']):
            problems.append(f'Efnisyfirlit og kaflaheiti stemma ekki: {e["numeral"]} „{e["title"]}“ ≠ „{c["title"]}“.')
        else:
            c['tocConfirmed'] = True
    for s in sections:
        for u in s['units']:
            if not u['text']:
                problems.append(f'{u["id"]}: tóm eining.')
    for need in ('formali', 'nofn', 'um-bokina'):
        if not any(s['id'] == need for s in sections):
            problems.append(f'Kafli {need} vantar.')
    if problems:
        print('\n'.join(problems), file=sys.stderr)
        sys.exit('Sannprófun mistókst.')

    meta = pdf.metadata or {}
    data = {
        'format': 'odysseifskvida-textagogn',
        'formatVersion': DATA_FORMAT,
        'document': {
            'id': DOC_ID,
            'version': 'sha256-' + sha[:16],
            'sha256': sha,
            'title': norm(meta.get('Title', 'Ódysseifskviða – endursögn')),
            'subject': norm(meta.get('Subject', '')),
            'sourceFile': 'heimild/Odysseifskvida-endursogn.pdf',
            'pdfPages': npages,
        },
        'printedPagesConfirmed': sorted(printed),
        'sections': sections,
    }
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    js = json.dumps(data, ensure_ascii=False, indent=1)
    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        f.write(js + '\n')
    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('/* Myndað af tools/extract.py – ekki breyta handvirkt. */\n')
        f.write('window.ODY_TEXT = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')

    # 6) skýrsla
    r = ['# Útdráttarskýrsla', '',
         f'- Frumskjal: `{data["document"]["sourceFile"]}` ({npages} PDF-síður)',
         f'- SHA-256: `{sha}`',
         f'- Útgáfa textagagna: `{data["document"]["version"]}`',
         f'- Prentuð síðunúmer staðfest (jöfn PDF-síðu) á síðum: {fmt_ranges(sorted(printed))}',
         f'- Síður án prentaðs númers: {fmt_ranges([p for p in range(1, npages + 1) if p not in printed]) or "engar"}',
         '- Efnisyfirlit (PDF-síða 3) er tvídálka; það var lesið dálk fyrir dálk og borið saman við kaflaheiti. '
         + ('Öll 24 heiti stemma.' if all(c.get('tocConfirmed') for c in chapters) else 'ATH: ósamræmi!'),
         '', '## Kaflar', '', '| Auðkenni | Heiti | PDF-síður | Einingar | Efnisgr. | Tilvitn. | Heimildarl. | Nöfn |',
         '|---|---|---|---|---|---|---|---|']
    for s in sections:
        cnt = lambda t: sum(1 for u in s['units'] if u['type'] == t)
        label = (f'{s["numeral"]}. ' if s['numeral'] else '') + s['title']
        r.append(f'| `{s["id"]}` | {label} | {s["pdfPageStart"]}–{s["pdfPageEnd"]} | {len(s["units"])} | '
                 f'{cnt("efnisgrein")} | {cnt("tilvitnun")} | {cnt("heimild")} | {cnt("nafn")} |')
    r += ['', '## Einingar sem ná yfir síðuskil', '']
    for s in sections:
        for u in s['units']:
            if len(u['pages']) > 1:
                pg = ', '.join(f'síða {p["pdfPage"]} frá staf {p["offset"]}' for p in u['pages'])
                r.append(f'- `{u["id"]}` ({u["type"]}): {pg} – „…{u["text"][u["pages"][1]["offset"] - 25:u["pages"][1]["offset"] + 25]}…“')
    r += ['', '## Óvissa til yfirferðar', '']
    r += [f'- {x}' for x in uncertain] or ['- Engin.']
    r += ['', '## Myndatextar og myndaskrá sem var sleppt', '']
    r += [f'- PDF-síða {p}: {t}' for p, t in dropped_captions]
    with open(OUT_REPORT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(r) + '\n')
    total = sum(len(s['units']) for s in sections)
    print(f'Kaflar: {len(sections)} (þar af {len(chapters)} þættir), einingar: {total}, óvissuatriði: {len(uncertain)}')
    print('Skrifað:', os.path.relpath(OUT_JSON, ROOT), os.path.relpath(OUT_JS, ROOT), os.path.relpath(OUT_REPORT, ROOT))


def roman_to_int(s):
    vals = {'I': 1, 'V': 5, 'X': 10, 'L': 50}
    total = 0
    for i, c in enumerate(s):
        v = vals[c]
        if i + 1 < len(s) and vals[s[i + 1]] > v:
            total -= v
        else:
            total += v
    return total


def fmt_ranges(nums):
    out = []
    for n in nums:
        if out and out[-1][1] == n - 1:
            out[-1][1] = n
        else:
            out.append([n, n])
    return ', '.join(f'{a}–{b}' if a != b else str(a) for a, b in out)


if __name__ == '__main__':
    main()
