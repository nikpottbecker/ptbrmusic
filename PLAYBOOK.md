# Sidechain – täglicher Auto-Lauf

Instagram: **@sidechain.news** · Metricool brand/blogId: **7154946** · Zeitzone: **Europe/Berlin**
Sprache: **Deutsch** (Artist-Namen, Track- und Albumtitel bleiben im Original).
Positionierung: der deutschsprachige News-Kanal für elektronische Musik – kurz, sauber, verlässlich.

## 0. Setup (jeder Lauf startet in einer frischen Umgebung)
1. `add_repo` owner `nikpottbecker`, repo `ptbrmusic`, access `push`.
2. `git clone --depth 20 -b sidechain-media https://github.com/nikpottbecker/ptbrmusic /home/claude/sc && cd /home/claude/sc && npm i --silent`
   Playwright/Chromium ist vorinstalliert (kein `playwright install`).
3. Metricool-Tools per ToolSearch laden (`metricool`).

## 1. Duplikate vermeiden
`posted.json` lesen. Keine Story posten, deren Kern (Artist + Ereignis) dort in den letzten 30 Tagen schon vorkommt.
Außerdem `getScheduledPosts` für heute und morgen prüfen (bereits eingeplante Posts zählen mit).

## 2. Recherche (nur die letzten 48 Stunden)
- WebSearch zu den Artists der Watchlist und allgemein („electronic music news“, „dance music news today“, „neue Tour Deutschland Techno/House“).
- Gute Quellen: offizielle Label-Pressseiten (z. B. press.atlanticrecords.com), Resident Advisor, Mixmag, DJ Mag, EDM.com, Dancing Astronaut, Billboard Dance, Groove, FAZEmag, Songkick/Ticketmaster für Termine.
- Jede Story per WebFetch im Originalartikel prüfen: Datum ≤ 48 h, Fakten stehen wirklich dort.
- **Tabu:** Gerüchte, Leaks, Privatleben, Gesundheit, Rechtsstreit, Todesmeldungen ohne Bestätigung durch mehrere große Medien, erfundene oder zugespitzte Zitate.

**Watchlist:** Fred again.., Four Tet, Skrillex, Jamie xx, Overmono, Kettama, Sammy Virji, Disclosure, Bicep, Peggy Gou, Keinemusik (&ME, Rampa, Adam Port), Black Coffee, Fisher, John Summit, Chris Lake, Dom Dolla, Anyma, Tale Of Us, Charlotte de Witte, Amelie Lens, Boris Brejcha, Paul Kalkbrenner, Fritz Kalkbrenner, Kölsch, Solomun, Âme, Ben Böhmer, Monolink, Martin Garrix, Swedish House Mafia, Calvin Harris, Eric Prydz, Chase & Status, Barry Can’t Swim, Ben UFO, Floating Points, Nia Archives, Hamdi. Große Neuigkeiten anderer Artists sind erlaubt.

## 3. Auswahl
- **Ziel: 2 Posts pro Tag.** Nur 1 wirklich gute Story → 1 Post. Keine → **kein Post** (niemals Füllmaterial).
- Priorität: 1) Deutschland/Österreich/Schweiz-Bezug (Tourdaten, Festivals, deutsche Artists) · 2) große Releases/Ankündigungen · 3) spannende Statements/Hintergründe.
- **Freitag:** Post 1 ist der wichtigste Release der Woche (New Music Friday, Template `release`).

## 4. Uhrzeiten
- `getBestTimeToPostByNetwork` (instagram, heute 00:00–23:59, Europe/Berlin).
- Post A: beste Stunde zwischen 07 und 13 Uhr. Post B: beste Stunde zwischen 16 und 21 Uhr. Mindestens 5 h Abstand.
- Zeitpunkt muss ≥ 30 min in der Zukunft liegen und darf nicht mit einem bereits geplanten Post in derselben Stunde kollidieren – sonst die nächstbeste Stunde.
- Die wichtigere Story bekommt den stärkeren Slot.

## 5. Texte
- **Headline** (aufs Bild): Deutsch, ≤ 70 Zeichen, aktiv, konkret, kein Clickbait, keine Emojis. Muster: „Four Tet kündigt neues Album an“.
- **Subline**: ≤ 90 Zeichen, wichtigstes Zusatzdetail (Datum, Ort, Feature).
- **Caption:**
  1. 2–3 Sätze Fakten (Wer, Was, Wann, Wo).
  2. Eine kurze Frage an die Community.
  3. `Quelle: <Medium>` (bei Foto zusätzlich `Foto: <Credit>`).
  4. 5–8 Hashtags: Artist (#fredagain), Genre (#techno #housemusic …), #elektronischemusik #musicnews #sidechain, bei DE-Bezug z. B. #technodeutschland.
- Zitate nur wörtlich aus der Quelle; sonst sinngemäß ohne Anführungszeichen.
- Alt-Text: Beschreibung der Grafik inklusive Headline.

## 6. Grafik rendern
Spec als JSON schreiben und `node render.js spec.json` ausführen. Format 1080 × 1350.

| template | wann | Felder |
|---|---|---|
| `news` | Standard | tag, artist, headline, subline, source, date, optional `dark: true` |
| `news` + `photo` | nur wenn in `photos/` ein passendes Foto liegt | + photo (Pfad), focus (CSS background-position, z. B. "40% 20%"), source = Foto-Credit |
| `release` | Single/Album/EP | title, artists, tag ("NEW RELEASE"/"NEW ALBUM"/"NEW EP"), status ("Out now"/"Ab <Datum>"), source, date |
| `tour` | ≥ 2 bekannte Termine (DACH zuerst, max. 6) | headline, subline, dates [{date, city, venue}], source, date |

- Tags: NEWS, BREAKING, NEW RELEASE, NEW ALBUM, TOUR, FESTIVAL, INTERVIEW. `dark: true` nur für BREAKING/sehr große News.
- Pressefotos können aus der Cloud-Umgebung nicht heruntergeladen werden → ohne Foto die Typo-Karte nutzen.
- `date` = heutiges Datum TT.MM.JJJJ.
- Fertiges JPEG mit dem Read-Tool ansehen: nichts abgeschnitten, keine Tippfehler, Umlaute korrekt. Sonst korrigieren und neu rendern.

## 7. Hochladen & einplanen
1. Bild nach `media/<JJJJ-MM-TT>-<slug>.jpg` kopieren, committen, `git push origin sidechain-media`.
   Commit-Messages enden mit den Attributionszeilen aus dem System-Reminder der Session.
2. URL: `https://raw.githubusercontent.com/nikpottbecker/ptbrmusic/sidechain-media/media/<datei>` – mit curl prüfen, bis HTTP 200.
3. `createScheduledPost`: blogId `7154946`, `autoPublish: true`, `draft: false`, providers `[{"network":"instagram"}]`, `instagramData: {"type":"POST","collaborators":[],"showReelOnFeed":true,"isAiGenerated":false}`, media = [URL], mediaAltText, publicationDate mit Europe/Berlin.
4. Nur wenn die Antwort `media` auf `static.metricool.com` zeigt: Datei mit `git rm` entfernen, committen, pushen. Zeigt sie noch auf GitHub, Datei liegen lassen und im Log vermerken.
5. Bei einem Metricool-Fehler höchstens einmal mit korrigierten Daten erneut versuchen, sonst Story überspringen.

## 8. Log & Abschluss
- Pro Post in `posted.json` anhängen: `{"date","slot","artist","headline","source_url","template","metricool_id"}`; committen, pushen.
- Zum Schluss eine kurze Zusammenfassung: welche Posts, um wie viel Uhr, welche Quellen – oder warum heute nichts gepostet wurde.
