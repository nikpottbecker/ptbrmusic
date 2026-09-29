# Sidechain – täglicher Auto-Lauf (v2)

Instagram: **@sidechain.news** · Metricool blogId: **7154946** · Zeitzone: **Europe/Berlin**
Sprache: **Deutsch** (Artist-Namen, Track- und Albumtitel im Original).
Positionierung: der deutschsprachige News-Kanal für elektronische Musik – kurz, sauber, verlässlich.
Phase: **Aufbau bis Traktion** (Ziel 2.500 Follower). Reichweite bei Nicht-Followern hat Vorrang.

## Learnings (wird jeden Sonntag von der Wochenanalyse aktualisiert – hat Vorrang vor den Regeln unten)
- Noch keine Daten. Erste Auswertung am Sonntag, 04.10.2026.

## Daten & Bibliothek im Repo (nutzen!)
- `data/handles.json` – verifizierte Instagram-Handles. Für @-Erwähnungen nur Einträge mit `verified: true`. Neue, belegte Handles ergänzen (mit Quelle).
- `data/tours.json` – verifizierte DACH-Termine + Festival-Infos 2027. Grundlage für Tour-Radar und Ticket-Posts. Vergangene Termine ignorieren, neue Funde mit Quelle ergänzen.
- `data/releases.json` – Releases (letzte Wochen + angekündigt). Grundlage für New Music Friday. Neue Funde ergänzen.
- `library/profiles.json` + `node make-profile.js "<Artist>" media/<datei>.jpg <TT.MM.JJJJ>` – 12 fertige, belegte „Wer ist …?“-Karussells (erzeugt Slides + `.caption.txt`). Für den Mittwoch und als **Fallback**, wenn es keine gute News gibt. Ein Profil höchstens alle 60 Tage (in `posted.json` prüfen); bevorzugt Artists, die gerade in den News sind. Neue Profile nur mit belegten Fakten ergänzen.
- `data/landscape.md` – Wettbewerbs- und Wachstumsrecherche (Hintergrund, nicht bei jedem Lauf lesen).

## 0. Setup (jeder Lauf startet in einer frischen Umgebung)
1. `add_repo` owner `nikpottbecker`, repo `ptbrmusic`, access `push`.
2. `git clone --depth 20 -b sidechain-media https://github.com/nikpottbecker/ptbrmusic /home/claude/sc && cd /home/claude/sc && npm i --silent`
   Playwright/Chromium und ffmpeg sind vorinstalliert (kein `playwright install`).
3. Metricool-Tools per ToolSearch laden (`metricool`). `getBrandSettings` → welche Netzwerke verbunden sind (instagram, ggf. threads, tiktok).

## 1. Tagesplan
| Slot | Zeitfenster | Inhalt | Format |
|---|---|---|---|
| A | beste Stunde 07–13 Uhr | stärkste Story des Tages | **Reel** (`format: "reel"`) – Di/Do/Sa als **Trial Reel** (`instagramData.type: "TRIAL_REEL"`, wird zuerst Nicht-Followern gezeigt), sonst normales Reel |
| B | beste Stunde 16–21 Uhr (≥ 5 h nach A) | zweite Story – oder an Wochenformat-Tagen das Karussell | News-Bild / Karussell |
| Story | je 60 min nach A und B | dieselbe News als Story | `format: "story"` |

**Wochenformate (Slot B):**
- **Montag – „Tour-Radar“:** Karussell mit anstehenden DACH-Terminen (neue Ankündigungen der letzten 7 Tage zuerst, sonst die nächsten Highlights aus `data/tours.json`). Ein Slide pro Termin: kicker = Land (DE/AT/CH), title = Artist, detail = Stadt + Venue, meta = Datum + Ticketinfo. Österreich und die Schweiz bewusst mitnehmen – dort gibt es kaum Konkurrenz.
- **Mittwoch – „Hintergrund“:** Karussell „Wer ist …?“ aus `library/profiles.json` (`make-profile.js`), bevorzugt ein Artist, der gerade in den News ist. Neue Profile nur mit belegten Fakten.
- **Freitag – „New Music Friday“:** Karussell mit den 5–8 wichtigsten Releases der Woche (kicker = SINGLE/EP/ALBUM, title = Titel, detail = Artist, meta = Label).
- **Sonntag – „Die Woche in 5 News“:** Karussell aus den 5 stärksten Posts der Woche (`posted.json`).
Findet sich für ein Wochenformat nicht genug Belegtes (mind. 3 Items), stattdessen normales News-Bild.

**Ticket-Alarm:** Startet ein Vorverkauf für eine DACH-Show/ein DACH-Festival, ist das eine Top-Story (wird oft geteilt). Headline z. B. „Vorverkauf startet: …“, Caption mit „Schick das deiner Rave-Crew“.

Kein guter Stoff → Slot B mit einem Evergreen-Karussell aus der Bibliothek füllen (Regeln oben) oder weglassen. **Niemals erfundene oder unbelegte Inhalte.**

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
  4. Artists/Labels mit @Handle erwähnen – **nur** Handles, die auf der offiziellen Website oder Pressseite verlinkt sind; nie raten.
  5. `Quelle: <Medium>` (bei Foto zusätzlich `Foto: <Credit>`).
  6. **Maximal 5 Hashtags** (Instagram-Limit), Schema 1 Marke + 2 Genre + 1 Region + 1 Thema. Pool: #sidechainnews · #technonews · #technodeutschland · #housemusic · #techno · #melodictechno · #ukgarage · #rave · #clubkultur · #technoberlin · #festivalnews · #elektronischemusik · #technoaustria · #technoschweiz · #lineup – plus Artist-Tag statt eines Genre-Tags. **#edm vermeiden.**
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
| `format: "story"` | Bild 1080×1920 | wie news |

- Tags: NEWS, BREAKING, NEW RELEASE, NEW ALBUM, TOUR, FESTIVAL, INTERVIEW, NEW MUSIC FRIDAY, TOUR-RADAR, HINTERGRUND, WOCHENRÜCKBLICK. `dark: true` nur für BREAKING/sehr große News.
- `photo` nur, wenn in `photos/` ein passendes Foto liegt (Dateiname = artist_credit.jpg); Credit in `source`.
- `date` = heute, TT.MM.JJJJ.
- Jedes Ergebnis ansehen (Read; beim Reel vorher mit `ffmpeg -ss 7.5 -i r.mp4 -frames:v 1 check.jpg` ein Standbild ziehen): nichts abgeschnitten, keine Tippfehler, Umlaute korrekt.

## 7. Hochladen & einplanen
1. Dateien nach `media/<JJJJ-MM-TT>-<slug>…` kopieren, committen, `git push origin sidechain-media`. Commit-Messages enden mit den Attributionszeilen aus dem System-Reminder der Session.
2. URL je Datei: `https://raw.githubusercontent.com/nikpottbecker/ptbrmusic/sidechain-media/media/<datei>` – mit curl prüfen, bis HTTP 200.
3. `createScheduledPost` (blogId `7154946`, `autoPublish: true`, `draft: false`, publicationDate Europe/Berlin, mediaAltText):
   - **Reel:** media [mp4], `instagramData: {"type":"REEL","showReelOnFeed":true,"collaborators":[],"isAiGenerated":false}`, `videoCoverMilliseconds: 7500`.
   - **Bild:** media [jpg], `instagramData.type: "POST"`.
   - **Karussell:** media = alle Slides in Reihenfolge, `type: "POST"`.
   - **Story:** media [story.jpg], `type: "STORY"`, **kein** `text`.
   - Ist **threads** verbunden: Bild-/Karussell-Posts zusätzlich mit provider `threads` (`threadsData: {}`) – gleicher Text ohne Hashtags. Ist **tiktok** verbunden: Reels zusätzlich mit provider `tiktok` (`tiktokData: {"privacyOption":"PUBLIC_TO_EVERYONE"}`).
4. Nur wenn die Antwort `media` auf `static.metricool.com` zeigt: Dateien mit `git rm` entfernen, committen, pushen.
5. Fehler: höchstens einmal mit korrigierten Daten erneut. Meldet Metricool ein Plan-/Kontingent-Limit: zuerst Stories weglassen, dann Slot B – und in der Zusammenfassung melden.

## 8. Log & Abschluss
- Pro Post in `posted.json` anhängen: `{"date","slot","format","artist","headline","source_url","metricool_id"}`; committen, pushen.
- Zum Schluss kurze Zusammenfassung: Posts mit Uhrzeit, Format, Headline, Quelle – oder warum nichts gepostet wurde. Bei Fehlern genau sagen, was Nik tun muss.
