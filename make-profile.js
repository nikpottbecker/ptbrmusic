#!/usr/bin/env node
// Evergreen-Karussell aus library/profiles.json: node make-profile.js "<Artist>" <out-prefix.jpg> <TT.MM.JJJJ>
// Schreibt <out-prefix>.spec.json und <out-prefix>.caption.txt und rendert die Slides.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [artist, out = 'profile.jpg', date = ''] = process.argv.slice(2);
const lib = JSON.parse(fs.readFileSync(path.join(__dirname, 'library/profiles.json'), 'utf8'));
const p = lib.find(x => x.artist.toLowerCase() === String(artist).toLowerCase());
if (!p) { console.error('Nicht in library/profiles.json:', artist, '\nVerfügbar:', lib.map(x => x.artist).join(', ')); process.exit(1); }
const hosts = [...new Set(p.slides.map(s => new URL(s.source_url).hostname.replace(/^www\.|^en\./, '')))];
const spec = { template: 'carousel', cover: { tag: 'HINTERGRUND', headline: p.cover_headline, subline: p.cover_subline, artist: p.artist },
  items: p.slides.map(s => ({ title: s.title, detail: s.detail })), source: 'Quellen: ' + hosts.slice(0, 3).join(', '), date, out };
const base = out.replace(/\.jpg$/i, '');
fs.writeFileSync(base + '.spec.json', JSON.stringify(spec, null, 1));
fs.writeFileSync(base + '.caption.txt', p.caption + '\n\nQuellen: ' + p.sources.join(' · ') + '\n');
execFileSync('node', [path.join(__dirname, 'render.js'), base + '.spec.json'], { stdio: 'inherit' });
