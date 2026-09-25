# Builds a page from copy.json (project headers/paragraphs + nav order) and a home fragment.
# Not published: Jekyll skips folders that start with "_".
#
#   python3 _src/render.py                       # rebuild the real site: index.html (+ nav highlight rule in site.css)
#   python3 _src/render.py --home _src/variants/ledger/home.html --css _src/variants/ledger/v.css \
#       --root ../../ --out _variants/ledger/index.html      # build a variant preview
import argparse, html, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
ap = argparse.ArgumentParser()
ap.add_argument('--copy', default=os.path.join(HERE, 'copy.json'))
ap.add_argument('--home', default=os.path.join(HERE, 'home.html'))
ap.add_argument('--css', default=None, help='extra stylesheet, linked after site.css')
ap.add_argument('--root', default='', help='prefix for site.css / assets / scripts (e.g. ../../ for a variant)')
ap.add_argument('--out', default=os.path.join(SITE, 'index.html'))
a = ap.parse_args()

d = json.load(open(a.copy))
KEEP = ["yc startup", "founders inc", "250 lb", "9,000+ students", "200+ schools", "pacific northwest",
        "world championship", "14,030 times", "6-DOF simulator"]

def e(t):
    """Escape, then keep names, hyphenated words and '@ next-word' from breaking across lines."""
    words = t.split(" "); groups = []; i = 0
    while i < len(words):
        for k in sorted(KEEP, key=len, reverse=True):
            n = len(k.split(" "))
            if " ".join(words[i:i + n]).lower().rstrip(".,") == k:
                groups.append(words[i:i + n]); i += n; break
        else:
            groups.append([words[i]]); i += 1
    out = []; j = 0
    while j < len(groups):
        g = groups[j]
        if g == ["@"] and j + 1 < len(groups): g = g + groups[j + 1]; j += 1
        txt = html.escape(" ".join(g))
        out.append(f'<span class="nw">{txt}</span>' if len(g) > 1 or "-" in txt else txt); j += 1
    return " ".join(out)

r = a.root
home = open(a.home).read().replace('src="assets/', f'src="{r}assets/')
extra_css = f'\n<link rel="stylesheet" href="{os.path.relpath(a.css, os.path.dirname(a.out))}">' if a.css else ''
nav = "\n".join(f'<a href="#{i}">{i}</a>' for i in d["order"])
secs = "\n\n".join(f'<section id="{i}"><h2 class="head">{e(d["projects"][i]["header"])}</h2>\n'
                   f'<p class="para">{e(d["projects"][i]["paragraph"])}</p></section>' for i in d["order"])
every = "\n".join(f'<li><a href="#{i}">{e(d["projects"][i]["header"])}</a></li>' for i in d["order"])
first, second = (html.escape(d["projects"][d["order"][k]]["header"]) for k in (0, 1))

page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Aaroh Kandhare</title>
<meta name="description" content="Aaroh Kandhare. {first}. {second}. Bellevue, Washington.">
<link rel="stylesheet" href="{r}site.css">{extra_css}
</head>
<body>
<canvas id="bg" aria-hidden="true"></canvas>

<p class="reach" aria-label="Contact"><a href="mailto:aarohkandy@gmail.com">email</a><a href="tel:+14256230392">call</a><a href="https://cal.com/aaroh-kandhare-vem6pg/talk">book a call</a></p>

<nav aria-label="Site">
<details class="menu" open>
<summary>menu</summary>
<div class="links">
<a class="me" href="#">main</a>
{nav}
<a href="#everything">everything</a>
<a href="#contact">contact</a>
</div>
</details>
</nav>

{secs}

<section id="everything"><h2 class="head">everything</h2>
<ul class="all">
{every}
</ul></section>

<section id="contact"><h2 class="sr">contact</h2>
<div class="boxes">
<a class="box" href="mailto:aarohkandy@gmail.com"><b>email</b><span>aarohkandy@gmail.com</span></a>
<a class="box" href="tel:+14256230392"><b>call</b><span>425-623-0392</span></a>
<a class="box" href="https://cal.com/aaroh-kandhare-vem6pg/talk"><b>book a call</b><span>pick a time</span></a>
</div></section>

{home}
<script src="{r}menu.js"></script>
<script src="{r}bg.js"></script>
</body>
</html>
'''
os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
open(a.out, "w").write(page)

# Keep the "current section lights up its nav link" rule in site.css in sync with the nav order.
if not a.css:
    css_path = os.path.join(SITE, 'site.css'); css = open(css_path).read()
    sel = ",".join(f'body:has(#{i}:target) a[href="#{i}"]' for i in d["order"] + ["everything", "contact"])
    new = re.sub(r'body:has\(#[a-z]+:target\) a\[href="#[a-z]+"\][^{]*\{color:var\(--ink\)\}', sel + '{color:var(--ink)}', css, count=1)
    if new != css: open(css_path, 'w').write(new)
print('wrote', os.path.relpath(a.out, SITE))
