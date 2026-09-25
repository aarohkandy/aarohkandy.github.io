# Renders ../index.html from copy.json + home.html. Not published (Jekyll skips _src/).
# Usage (from live-site/):  python3 _src/render.py _src/copy.json index.html > _src/nav-selector.txt
import json, html, sys
d = json.load(open(sys.argv[1])); out = sys.argv[2]
KEEP = ["yc startup", "founders inc", "250 lb", "9,000+ students", "200+ schools", "pacific northwest", "world championship", "14,030 times", "6-DOF simulator"]
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
nav = "\n".join(f'<a href="#{i}">{i}</a>' for i in d["order"])
secs = "\n\n".join(f'<section id="{i}"><h2 class="head">{e(d["projects"][i]["header"])}</h2>\n<p class="para">{e(d["projects"][i]["paragraph"])}</p></section>' for i in d["order"])
every = "\n".join(f'<li><a href="#{i}">{e(d["projects"][i]["header"])}</a></li>' for i in d["order"])
page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Aaroh Kandhare</title>
<meta name="description" content="Aaroh Kandhare. {html.escape(d["projects"][d["order"][0]]["header"])}. {html.escape(d["projects"][d["order"][1]]["header"])}. Bellevue, Washington.">
<link rel="stylesheet" href="site.css">
</head>
<body>
<canvas id="bg" aria-hidden="true"></canvas>

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

{open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'home.html')).read()}
<script src="menu.js"></script>
<script src="bg.js"></script>
</body>
</html>
'''
open(out, "w").write(page)
ids = d["order"] + ["everything", "contact"]
print(",".join(f'body:has(#{i}:target) a[href="#{i}"]' for i in ids))
