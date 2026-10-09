# Sidechain – täglicher Auto-Lauf (v3: Fotos Pflicht, keine Stories)

Instagram: **@sidechain.news** · Metricool blogId: **7154946** · Zeitzone: **Europe/Berlin**
Sprache: **Deutsch** (Artist-Namen, Track- und Albumtitel im Original).
Positionierung: der deutschsprachige News-Kanal für elektronische Musik – kurz, sauber, verlässlich.
Phase: **Aufbau bis Traktion** (Ziel 2.500 Follower). Reichweite bei Nicht-Followern hat Vorrang.

## Learnings (wird jeden Sonntag von der Wochenanalyse aktualisiert – hat Vorrang vor den Regeln unten)
- Stand 04.10.2026 (Woche 1, 29.09.–04.10.): @sidechain.news hat laut Metricool erst ~1 Follower; Reichweite pro Post 0–5, Shares/Saves/neue Follower überall 0. Alle Regeln unten sind **Tendenzen** (Stichprobe < 3 pro Gruppe oder Werte im Rauschbereich) – nicht überoptimieren, den Plan halten.
- **Reels bleiben Slot A.** Einziges Format mit messbarer Reichweite (3 Reels: Ø 3,3 Reichweite / 6,3 Views vs. 9 Bild-/Karussell-Posts: Ø 0,2 / 3,4). An Tagen ohne Wochenformat darf auch Slot B ein Reel sein (Test für Woche 2).
- **Reel-Hook in der ersten Sekunde:** Ø Wiedergabezeit nur 1,4–2,7 s von 8 s. Reel-Headlines ≤ 45 Zeichen, Kern (Artist + Ereignis) vorne, keine Einleitung.
- **Nicht mehr als 2 Feed-Posts pro Tag** (+ Stories). Am 01.10. liefen 5 Feed-Posts – alle mit Reichweite 0; mehr Volumen bringt bei dieser Followerzahl nichts und kannibalisiert.
- **Hashtags strikt max. 5, immer #sidechainnews.** Die ersten Posts (Fred again.., Josh Baker/Kettama/Prospa) hatten 7 Tags inkl. #musicnews/#sidechain – nicht mehr verwenden.
- **Keine Stories mehr (Entscheidung Nik, 09.10.2026):** Das Metricool-Gratiskontingent war ab 05.10. aufgebraucht ("account limit"), Stories verbrauchten die Hälfte. Nur noch Feed-Posts und Reels.
- **Trial Reels scheitern:** Metricool meldet, dass der Account die Follower-Mindestzahl für Trial Reels nicht erreicht. Bis auf Weiteres nur normale Reels (`type: "REEL"`).
- **Jeder Post braucht ein Foto (Entscheidung Nik, 09.10.2026):** reine Text-Grafiken wirken langweilig. Siehe Abschnitt 6a.
- **Collab @thefestivalwire nur, wenn die Einladung angenommen wird:** Festival-Kalender und Fatboy Slim (beide mit Collab) hatten Reichweite 0 – die Collab hat keine Reichweite gebracht. Beibehalten (max. 3×/Woche), Wirkung nächste Woche erneut prüfen.
- **Uhrzeiten:** Slot A um ~10 Uhr lieferte die meisten Reichweiten-Treffer (alle Reels); Bilder 13–20 Uhr fast alle 0, einzige Ausnahme Fred again.. um 21:45 (Reichweite 2). Kein belastbarer Zeiteffekt – Slot A weiter 09–11 Uhr, Slot B weiter nach `getBestTimeToPostByNetwork`.
- **DACH-Positionierung beibehalten.** DACH-Themen (Knaack, Berlin-Erklärer, Festival-Kalender) und internationale News lagen gleich niedrig; Unterschied wegen Format nicht messbar. Festival-Kalender hatte mit 6 Views den besten Karussell-Wert – Speicher-/Service-Karussells weiter am Wochenende.

## Daten & Bibliothek im Repo (nutzen!)
- `data/handles.json` – verifizierte Instagram-Handles. Für @-Erwähnungen nur Einträge mit `verified: true`. Neue, belegte Handles ergänzen (mit Quelle).
- `data/tours.json` – verifizierte DACH-Termine + Festival-Infos 2027. Grundlage für Tour-Radar und Ticket-Posts. Vergangene Termine ignorieren, neue Funde mit Quelle ergänzen.
- `data/releases.json` – Releases (letzte Wochen + angekündigt). Grundlage für New Music Friday. Neue Funde ergänzen.
- `library/explainers.json` – 5 belegte Erklär-Karussells (UK Garage, Melodic Techno, Techno vs. House, Love Parade, Berlin als Techno-Hauptstadt), Tag ERKLÄRT. Gleicher Befehl mit dem `topic` statt Artist. Gut für Samstag/Sonntag-Abende ohne News und zum Speichern/Teilen.
- `library/profiles.json` + `node make-profile.js "<Artist>" media/<datei>.jpg <TT.MM.JJJJ> photos/<foto>.jpg [focus]` – 29 fertige, belegte „Wer ist …?“-Karussells (erzeugt Slides + `.caption.txt`). Für den Mittwoch und als **Fallback**, wenn es keine gute News gibt. Ein Profil höchstens alle 60 Tage (in `posted.json` prüfen); bevorzugt Artists, die gerade in den News sind. Neue Profile nur mit belegten Fakten ergänzen.
- `data/landscape.md` – Wettbewerbs- und Wachstumsrecherche (Hintergrund, nicht bei jedem Lauf lesen).

## 0. Setup (jeder Lauf startet in einer frischen Umgebung)
1. `add_repo` owner `nikpottbecker`, repo `ptbrmusic`, access `push`.
2. `git clone --depth 20 -b sidechain-media https://github.com/nikpottbecker/ptbrmusic /home/claude/sc && cd /home/claude/sc && npm i --silent`
   Playwright/Chromium und ffmpeg sind vorinstalliert (kein `playwright install`).
3. Metricool-Tools per ToolSearch laden (`metricool`). `getBrandSettings` → welche Netzwerke verbunden sind (instagram, ggf. threads, tiktok).

## 1. Tagesplan
| Slot | Zeitfenster | Inhalt | Format |
|---|---|---|---|
| A | beste Stunde 07–13 Uhr | stärkste Story des Tages | **Reel** (`format: "reel"`, immer `type: "REEL"`, keine Trial Reels) |
| B | beste Stunde 16–21 Uhr (≥ 5 h nach A) | zweite Story – oder an Wochenformat-Tagen das Wochenformat | **News-Karussell** (siehe unten) / Wochenformat-Karussell |

**News-Karussell (Standard für Slot B, Entscheidung Nik 09.10.2026 – Einzelbilder nur noch, wenn die Story für 3 Slides zu dünn ist):**
`template: "carousel"`, 3–6 Slides plus automatischer Outro-Slide:
1. **Cover** mit Foto (`cover.photo`, `cover.artist`, `cover.credit`): Headline + Subline wie beim News-Bild.
2. **2–4 Fakten-Slides**, je ein Aspekt: Was genau passiert ist · Termine/Tracklist als Liste (`rows`) · Tickets/Preise/Vorverkauf · Hintergrund/Kontext („Warum das wichtig ist“) · Zitat (nur wörtlich belegt).
3. Abwechslung: mindestens ein Fakten-Slide mit eigenem Foto (`photo`, `credit`) – **nicht dasselbe Foto wie auf dem Cover**, lieber ein zweites Artist-Foto, Release-Cover, Venue-/Festival- oder Stimmungsfoto. Gibt es kein zweites Foto, die Fakten-Slides als Text-Slides lassen.
4. Jede Aussage auf den Slides muss im Quellartikel stehen. Nichts strecken, um Slides zu füllen.
5. Alt-Text pro Slide (`mediaAltText` in Slide-Reihenfolge), Caption wie gewohnt; letzte Caption-Zeile vor der Quelle: „Wisch durch für alle Details.“
Auch die Reels in Slot A dürfen auf ein Karussell zum selben Thema verweisen („Alle Termine im Karussell“), wenn Slot B dasselbe Thema hat – sonst nicht.

**Wochenformate (Slot B):**
- **Montag – „Tour-Radar“:** Karussell mit anstehenden DACH-Terminen (neue Ankündigungen der letzten 7 Tage zuerst, sonst die nächsten Highlights aus `data/tours.json`). Ein Slide pro Termin: kicker = Land (DE/AT/CH), title = Artist, detail = Stadt + Venue, meta = Datum + Ticketinfo. Österreich und die Schweiz bewusst mitnehmen – dort gibt es kaum Konkurrenz.
- **Mittwoch – „Hintergrund“:** Karussell „Wer ist …?“ aus `library/profiles.json` (`make-profile.js`), bevorzugt ein Artist, der gerade in den News ist. Neue Profile nur mit belegten Fakten.
- **Freitag – „New Music Friday“:** Karussell mit den 5–8 wichtigsten Releases der Woche (kicker = SINGLE/EP/ALBUM, title = Titel, detail = Artist, meta = Label), **jeder Slide mit Release-Cover** (`items[].photo` über `cover`-Requests).
- **Sonntag – „Die Woche in 5 News“:** Karussell aus den 5 stärksten Posts der Woche (`posted.json`), jeder Slide mit dem Foto des jeweiligen Posts (`items[].photo`).
Findet sich für ein Wochenformat nicht genug Belegtes (mind. 3 Items), stattdessen normales News-Bild.

**Ticket-Alarm:** Startet ein Vorverkauf für eine DACH-Show/ein DACH-Festival, ist das eine Top-Story (wird oft geteilt). Headline z. B. „Vorverkauf startet: …“, Caption mit „Schick das deiner Rave-Crew“.

Kein guter Stoff → Slot B mit einem Evergreen-Karussell aus der Bibliothek füllen (Regeln oben) oder weglassen. **Niemals erfundene oder unbelegte Inhalte.**

**Vorab geplante Posts:** Liegt für heute im Fenster von Slot A oder B schon ein Feed-Post in Metricool (z. B. von Claude vorab eingeplant), diesen Slot **nicht** zusätzlich befüllen.

**Specials:** `library/specials/*.json` sind fertige Karussell-Specs (inkl. `caption` und `alt`). Mit `node render.js <spec>` rendern (vorher `date` setzen). Nur einplanen, wenn in `posted.json` noch nicht vorhanden.

## 2. Duplikate vermeiden
`posted.json` lesen (auch Einträge mit `status: "draft"`) und `getScheduledPosts` für heute + morgen. Keine Story, deren Kern (Artist + Ereignis) in den letzten 30 Tagen schon vorkommt.

## 3. Recherche (nur die letzten 48 Stunden)
- WebSearch zur Watchlist und allgemein („electronic music news“, „dance music news today“, „Tour Deutschland Techno House 2027“, „Festival Line-up Deutschland“).
- Gute Quellen: offizielle Label-Pressseiten, Resident Advisor, Mixmag, DJ Mag, EDM.com, Dancing Astronaut, Billboard Dance, Groove, FAZEmag, Songkick/Ticketmaster für Termine.
- Jede Story per WebFetch im Originalartikel prüfen: Datum ≤ 48 h (Wochenformate: ≤ 7 Tage), Fakten stehen wirklich dort.
- **Tabu:** Gerüchte, Leaks, Privatleben, Gesundheit, Rechtsstreit, unbestätigte Todesmeldungen, erfundene oder zugespitzte Zitate.
- Priorität: 1) DACH-Bezug (Tourdaten, Festivals, deutsche Artists) · 2) große Releases/Ankündigungen · 3) spannende Statements. Stories mit hohem „Teil-Faktor“ (Überraschung, Ticket-Infos, „Das musst du wissen“) bekommen Slot A.

**Watchlist:** Fred again.., Four Tet, Skrillex, Jamie xx, Overmono, Kettama, Sammy Virji, Josh Baker, Prospa, Disclosure, Bicep, Peggy Gou, Keinemusik (&ME, Rampa, Adam Port), Black Coffee, Fisher, John Summit, Chris Lake, Dom Dolla, Anyma, Tale Of Us, Charlotte de Witte, Amelie Lens, Boris Brejcha, Paul Kalkbrenner, Fritz Kalkbrenner, Kölsch, Solomun, Âme, Ben Böhmer, Monolink, Martin Garrix, Swedish House Mafia, Calvin Harris, David Guetta, Eric Prydz, Chase & Status, Barry Can’t Swim, Ben UFO, Floating Points, Nia Archives, Hamdi. Große News anderer Artists sind erlaubt.

## 4. Uhrzeiten
- `getBestTimeToPostByNetwork` (instagram, heute, Europe/Berlin) → Slot A/B wie im Tagesplan.
- ≥ 30 min in der Zukunft, keine Kollision mit bereits geplanten Posts in derselben Stunde, sonst nächstbeste Stunde.

## 5. Texte
- **Headline** (Bild/Reel): Deutsch, ≤ 70 Zeichen, aktiv, konkret, kein Clickbait, keine Emojis.
- **Subline**: ≤ 90 Zeichen, wichtigstes Zusatzdetail (Datum, Ort, Feature).
- **Caption:**
  1. Erster Satz = Suchbegriffe + Kern der News (Instagram-Suche liest Captions), z. B. „Techno News: …“, „Fred again.. Tour 2027: …“, „Festival Line-up 2027: …“.
  2. 1–2 weitere Sätze Fakten.
  3. Eine kurze Frage an die Community (Kommentare) oder „Schick das jemandem, der mit dir hingeht“ (Shares) – abwechseln.
  4. **Collab mit @thefestivalwire:** Bei Festival-, Line-up- und DACH-Event-Posts `instagramData.collaborators: [{"username":"thefestivalwire","deleted":false}]` setzen (Niks eigener Festival-Account, er bestätigt die Einladung). Höchstens 3× pro Woche.
  5. Artists/Labels mit @Handle erwähnen – **nur** Handles, die auf der offiziellen Website oder Pressseite verlinkt sind; nie raten.
  6. `Quelle: <Medium>` (bei Foto zusätzlich `Foto: <Credit>`).
  7. **Maximal 5 Hashtags** (Instagram-Limit), Schema 1 Marke + 2 Genre + 1 Region + 1 Thema. Pool: #sidechainnews · #technonews · #technodeutschland · #housemusic · #techno · #melodictechno · #ukgarage · #rave · #clubkultur · #technoberlin · #festivalnews · #elektronischemusik · #technoaustria · #technoschweiz · #lineup – plus Artist-Tag statt eines Genre-Tags. **#edm vermeiden.**
- Zitate nur wörtlich aus der Quelle; sonst sinngemäß ohne Anführungszeichen.
- Alt-Text: Beschreibung der Grafik inklusive Headline.

## 6. Rendern (`node render.js spec.json`)
| Spec | Ergebnis | Felder |
|---|---|---|
| `template: "news"` | Bild 1080×1350 | tag, artist, headline, subline, source, date, `dark`?, `photo`?, `focus`? |
| `template: "release"` | Bild | title, artists, tag, status, source, date, `photo`? |
| `template: "tour"` | Bild | headline, subline, dates[{date, city, venue}] (max 6), source, date |
| `template: "carousel"` | Bilder `<out>-1.jpg … -N.jpg` | cover{tag, headline, subline, dark?}, items[{kicker?, title, detail?, meta?}] (max 8), source, date – Outro-Slide kommt automatisch |
| `format: "reel"` | MP4 1080×1920, 8 s | wie news (inkl. `photo`) |
| Karussell mit Fotos | | `cover.photo`/`focus`/`credit`, `items[].photo`/`focus`/`credit` → Foto-Slides |

- Tags: NEWS, BREAKING, NEW RELEASE, NEW ALBUM, TOUR, FESTIVAL, INTERVIEW, NEW MUSIC FRIDAY, TOUR-RADAR, HINTERGRUND, WOCHENRÜCKBLICK. `dark: true` nur für BREAKING/sehr große News.
- **`photo` ist Pflicht** bei news, release und reel, beim Karussell für das Cover und möglichst jeden Slide (Ausnahme: Listen-Slides mit `rows`, Tour-Template). Beschaffung: Abschnitt 6a. Credit immer sichtbar: bei news/reel in `source` anhängen („Mixmag · Foto: Name / CC BY-SA 4.0"), bei Karussell-Slides im Feld `credit`.
- `focus` (CSS background-position, z. B. `"50% 25%"`) so wählen, dass das Gesicht nicht von Pills oder der Textkarte verdeckt wird – Ergebnis immer ansehen.
- `date` = heute, TT.MM.JJJJ.
- Jedes Ergebnis ansehen (Read; beim Reel vorher mit `ffmpeg -ss 7.5 -i r.mp4 -frames:v 1 check.jpg` ein Standbild ziehen): nichts abgeschnitten, keine Tippfehler, Umlaute korrekt.

## 6a. Fotos beschaffen (vor dem Rendern)
Die Shell kommt nicht an fremde Websites. Fotos holt deshalb die GitHub Action „Sidechain Fotos holen" (`.github/workflows/fetch-photos.yml`, Skript `tools/fetch_photos.py`).
1. Erst `photos/credits.json` prüfen – liegt schon ein passendes Foto in `photos/`, das nehmen.
2. Sonst `photos/queue.json` schreiben (Liste), committen, pushen. Erlaubte Quellen in dieser Reihenfolge:
   - `{"file":"<artist-slug>.jpg","commons":"<Artist-Name>"}` – Wikimedia Commons, nur freie Lizenzen (CC BY / CC BY-SA / CC0 / PD; kein NC/ND). Erste Wahl für Artist-Fotos.
   - `{"file":"cover-<slug>.jpg","cover":"<Artist> <Titel>"}` – Release-Cover (iTunes-Suche). Für Release-News, New Music Friday und als Ersatz bei Artist-News mit aktuellem Release. Prüfen, dass Artist und Titel im Ergebnis stimmen.
   - `{"file":"<slug>.jpg","url":"<direkter Bild-Link>","credit":"Foto: <Fotograf> / <Label/Agentur>","page":"<Pressekit-Seite>"}` – nur aus **offiziellen Pressekits/Pressebereichen** (Label, Agentur, Festival, Artist-Website), die die Bilder ausdrücklich für Presse/Redaktion freigeben. Credit wie im Pressekit angegeben; ohne bekannten Credit nicht verwenden.
   - `{"file":"<slug>.jpg","openverse":"<englische Suchbegriffe>"}` – frei lizenzierte Stimmungsfotos (Club, Crowd, Festival-Gelände, Stadt) für Themen ohne Artist (Clubkultur, Ticketing, Festival-Allgemein).
3. Warten, bis die Action fertig ist: alle 15 s `git pull --rebase origin sidechain-media`, bis ein Commit „Fotos geholt" kommt (max. 4 min). Ergebnis in `photos/queue.result.json`; Credits stehen in `photos/credits.json`.
4. Jedes Foto ansehen (Read): Passt es zur Person/zum Thema? Kein falscher Artist, keine Wasserzeichen, nichts Peinliches. Sonst nächste Quelle.
5. **Tabu:** Fotos aus Google-Bildersuche, Instagram, Getty/Agenturen, Nachrichtenartikeln ohne Pressefreigabe, KI-generierte Fotos echter Personen. Findet sich kein erlaubtes Foto, eine andere Story nehmen – oder ein Stimmungsfoto über Openverse.
6. Fotos bleiben in `photos/` (Wiederverwendung), nicht löschen. `photos/rejected.json` listet Treffer, die falsch waren – für diese Artists mit genauerem Suchbegriff neu anfragen (z. B. „Bicep duo Belfast“, „Fisher DJ Paul Fisher“, „Solomun DJ Mladen“) oder Cover nehmen.

## 7. Hochladen & einplanen
1. Dateien nach `media/<JJJJ-MM-TT>-<slug>…` kopieren, committen, `git push origin sidechain-media`. Commit-Messages enden mit den Attributionszeilen aus dem System-Reminder der Session.
2. URL je Datei: `https://raw.githubusercontent.com/nikpottbecker/ptbrmusic/sidechain-media/media/<datei>` – mit curl prüfen, bis HTTP 200.
3. `createScheduledPost` (blogId `7154946`, `autoPublish: true`, `draft: false`, publicationDate Europe/Berlin, mediaAltText):
   - **Reel:** media [mp4], `instagramData: {"type":"REEL","showReelOnFeed":true,"collaborators":[],"isAiGenerated":false}`, `videoCoverMilliseconds: 7500`.
   - **Bild:** media [jpg], `instagramData.type: "POST"`.
   - **Karussell:** media = alle Slides in Reihenfolge, `type: "POST"`.
   - Ist **threads** verbunden: Bild-/Karussell-Posts zusätzlich mit provider `threads` (`threadsData: {}`) – gleicher Text ohne Hashtags. Ist **tiktok** verbunden: Reels zusätzlich mit provider `tiktok` (`tiktokData: {"privacyOption":"PUBLIC_TO_EVERYONE"}`).
4. Nur wenn die Antwort `media` auf `static.metricool.com` zeigt: Dateien mit `git rm` entfernen, committen, pushen.
5. Fehler: höchstens einmal mit korrigierten Daten erneut. Meldet Metricool ein Plan-/Kontingent-Limit („account limit"): nichts weiter einplanen und in der Zusammenfassung melden, dass Nik das Kontingent prüfen muss.

## 8. Log & Abschluss
- Pro Post in `posted.json` anhängen: `{"date","slot","format","artist","headline","source_url","photo","metricool_id"}`; committen, pushen.
- Zum Schluss kurze Zusammenfassung: Posts mit Uhrzeit, Format, Headline, Quelle – oder warum nichts gepostet wurde. Bei Fehlern genau sagen, was Nik tun muss.
