#!/usr/bin/env python3
"""Sidechain photo fetcher – runs in GitHub Actions (open internet).

Reads photos/queue.json, a list of requests:
  {"file": "paul-kalkbrenner.jpg", "commons": "Paul Kalkbrenner"}            # Wikimedia Commons, freie Lizenz
  {"file": "bicep-air.jpg", "cover": "Bicep Air"}                            # Release-Cover (iTunes-Suche)
  {"file": "club.jpg", "openverse": "techno club crowd"}                     # freie Lizenz (Flickr u. a. via Openverse)
  {"file": "x.jpg", "url": "https://…", "credit": "Foto: Name / Label"}       # Pressekit-Foto (Credit Pflicht)

Writes the image (max 1600 px, JPEG) to photos/<file>, records credit + license in
photos/credits.json, and writes photos/queue.result.json with per-request status.
The queue is emptied afterwards.
"""
import json, os, re, sys, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PH = os.path.join(ROOT, "photos")
UA = "sidechain-news-bot/1.0 (https://github.com/nikpottbecker/ptbrmusic)"
OK_LICENSES = re.compile(r"^(cc0|cc[- ]by(?![- ]?nc)(?![- ]?nd)[\w.\- ]*|public domain|pdm|cc-pdm)", re.I)


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        data = r.read()
    return data if binary else json.loads(data)


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def commons(query):
    q = urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search", "gsrnamespace": 6,
        "gsrsearch": f"{query} filetype:bitmap", "gsrlimit": 15, "prop": "imageinfo",
        "iiprop": "url|size|extmetadata|mime", "iiurlwidth": 1600})
    pages = (get("https://commons.wikimedia.org/w/api.php?" + q).get("query") or {}).get("pages") or {}
    words = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 2]
    best = None
    for p in sorted(pages.values(), key=lambda p: p.get("index", 99)):
        ii = (p.get("imageinfo") or [{}])[0]
        meta = ii.get("extmetadata") or {}
        lic = strip_html((meta.get("LicenseShortName") or {}).get("value"))
        title = p.get("title", "").lower()
        if ii.get("mime") != "image/jpeg" or min(ii.get("width", 0), ii.get("height", 0)) < 800:
            continue
        if not OK_LICENSES.match(lic):
            continue
        if words and not all(w in title for w in words[:2]):  # Dateiname muss den Artist enthalten
            continue
        author = strip_html((meta.get("Artist") or {}).get("value")) or "Wikimedia Commons"
        best = {"src": ii.get("thumburl") or ii["url"], "credit": f"Foto: {author[:60]} / {lic}",
                "license": lic, "page": ii.get("descriptionurl")}
        break
    return best


def cover(query):
    q = urllib.parse.urlencode({"term": query, "entity": "album", "limit": 5, "country": "DE"})
    res = get("https://itunes.apple.com/search?" + q).get("results") or []
    if not res:
        return None
    r = res[0]
    return {"src": r["artworkUrl100"].replace("100x100bb", "1400x1400bb"),
            "credit": f"Cover: {r.get('collectionName')} – {r.get('artistName')}",
            "license": "Release-Cover (redaktionelle Nutzung)", "page": r.get("collectionViewUrl")}


def openverse(query):
    q = urllib.parse.urlencode({"q": query, "license_type": "commercial,modification", "page_size": 20,
                                "aspect_ratio": "tall,square,wide", "size": "large", "mature": "false"})
    for r in get("https://api.openverse.org/v1/images/?" + q).get("results") or []:
        if min(r.get("width") or 0, r.get("height") or 0) < 900:
            continue
        lic = f"CC {str(r.get('license', '')).upper()} {r.get('license_version') or ''}".strip()
        if r.get("license") in ("pdm", "cc0"):
            lic = "Public Domain" if r["license"] == "pdm" else "CC0"
        return {"src": r["url"], "credit": f"Foto: {(r.get('creator') or 'unbekannt')[:60]} / {lic}",
                "license": lic, "page": r.get("foreign_landing_url")}
    return None


def save(src, file):
    import io
    from PIL import Image, ImageOps
    im = ImageOps.exif_transpose(Image.open(io.BytesIO(get(src, binary=True)))).convert("RGB")
    im.thumbnail((1600, 1600))
    im.save(os.path.join(PH, file), "JPEG", quality=88)
    return im.size


def main():
    qf = os.path.join(PH, "queue.json")
    queue = json.load(open(qf)) if os.path.exists(qf) else []
    cf = os.path.join(PH, "credits.json")
    credits = json.load(open(cf)) if os.path.exists(cf) else {}
    results = []
    for req in queue:
        file = re.sub(r"[^a-z0-9._-]", "-", req.get("file", "").lower())
        if not file.endswith(".jpg"):
            file += ".jpg"
        try:
            if req.get("url"):
                if not req.get("credit"):
                    raise ValueError("url ohne credit")
                hit = {"src": req["url"], "credit": req["credit"], "license": req.get("license", "Pressefoto"),
                       "page": req.get("page", req["url"])}
            elif req.get("commons"):
                hit = commons(req["commons"])
            elif req.get("cover"):
                hit = cover(req["cover"])
            elif req.get("openverse"):
                hit = openverse(req["openverse"])
            else:
                raise ValueError("unbekannter Request-Typ")
            if not hit:
                results.append({"file": file, "status": "not_found", "request": req})
                continue
            w, h = save(hit["src"], file)
            credits[file] = {k: hit[k] for k in ("credit", "license", "page")}
            results.append({"file": file, "status": "ok", "size": f"{w}x{h}", **credits[file]})
        except Exception as e:  # noqa
            results.append({"file": file, "status": "error", "error": str(e)[:200], "request": req})
    json.dump(credits, open(cf, "w"), ensure_ascii=False, indent=1)
    json.dump(results, open(os.path.join(PH, "queue.result.json"), "w"), ensure_ascii=False, indent=1)
    json.dump([], open(qf, "w"))
    print(json.dumps(results, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    sys.exit(main())
