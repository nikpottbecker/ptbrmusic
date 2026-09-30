#!/usr/bin/env node
// Sidechain renderer · node render.js spec.json
//
// Feed (1080×1350 JPEG):
//   template "news"    – tag, artist, headline, subline, source, date, dark?, photo?, focus?
//   template "release" – title, artists, tag, status, source, date, photo?
//   template "tour"    – headline, subline, dates[{date,city,venue}], source, date
// Carousel (1080×1350 JPEGs, out-1.jpg … out-N.jpg):
//   template "carousel" – cover{tag, headline, subline, dark?}, items[{kicker?, title, detail?, meta?}], source, date
//   Slides: cover + one slide per item (max 8) + outro. An item with rows[{date,name,detail}] (max 6) becomes a list slide. Metricool media = all files in order.
// Vertical (1080×1920):
//   format "reel"  → MP4, 8 s, 30 fps, animated (same fields as news, photo optional)
//   format "story" → JPEG, static final frame of the reel layout
//
// out: output path (".jpg" / ".mp4"; carousel uses it as prefix)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const dir = __dirname;
const font = path.join(dir, 'node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2');
const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fileUrl = p => 'file://' + path.resolve(p);
const size = (text = '', steps) => { const n = text.length; for (const [max, px] of steps) if (n <= max) return px; return steps[steps.length - 1][1]; };

const WAVE = (c, w = 26, h = 14, sw = 20) => `<svg width="${w}" height="${h}" viewBox="0 0 230 120" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M10 100 L10 20 Q40 100 70 100 L70 20 Q100 100 130 100 L130 20 Q160 100 190 100 L190 20 Q205 70 220 100"/></svg>`;
const brand = `<div class="pill brand"><div class="dot">${WAVE('#fff')}</div><span>sidechain</span></div>`;

const css = `
@font-face{font-family:G;src:url(${fileUrl(font)});font-weight:100 900}
*{box-sizing:border-box}
body{margin:0;font-family:G,sans-serif;color:#111}
.root{width:1080px;height:1350px;position:relative;overflow:hidden}
.v{width:1080px;height:1920px;position:relative;overflow:hidden}
.pill{background:#fff;color:#111;border-radius:999px;font-size:22px;font-weight:500;padding:14px 26px}
.brand{padding:9px 26px 9px 9px;display:flex;align-items:center;gap:12px}
.brand span{font-size:25px;font-weight:800;letter-spacing:-.04em}
.dot{width:42px;height:42px;border-radius:50%;background:#111;display:flex;align-items:center;justify-content:center}
.top{display:flex;justify-content:space-between;align-items:center}
.tag{align-self:flex-start;background:#111;color:#fff;border-radius:999px;padding:10px 22px;font-size:22px;font-weight:600;letter-spacing:.08em}
h1{margin:0;font-weight:700;line-height:1.02;letter-spacing:-.035em}
.sub{margin:0;font-size:32px;line-height:1.35;color:#4a4a46}
.foot{display:flex;justify-content:space-between;border-top:1px solid #e4e4e0;padding-top:22px;font-size:22px;color:#62625d}
/* reel animation */
@keyframes up{from{transform:translateY(60px);opacity:0}to{transform:none;opacity:1}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes pop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.06);opacity:1}100%{transform:scale(1)}}
@keyframes zoom{from{transform:scale(1)}to{transform:scale(1.1)}}
@keyframes bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.a-up{animation:up .55s cubic-bezier(.2,.7,.2,1) both}
.a-fade{animation:fade .6s ease both}
.a-pop{animation:pop .45s ease-out both}
.w{display:inline-block}
`;

// ---------- feed ----------
function newsPhoto(s) {
  const fs_ = size(s.headline, [[40, 80], [60, 74], [80, 66], [999, 58]]);
  return `<div class="root" style="background:#111 url('${fileUrl(s.photo)}') ${s.focus || '50% 25%'}/cover no-repeat">
<div class="top" style="position:absolute;top:48px;left:48px;right:48px">${brand}<div class="pill">${esc(s.artist)}</div></div>
<div style="position:absolute;left:40px;right:40px;bottom:40px;background:#fff;border-radius:44px;padding:52px 56px 44px;display:flex;flex-direction:column;gap:24px">
<div class="tag">${esc(s.tag || 'NEWS')}</div>
<h1 style="font-size:${fs_}px">${esc(s.headline)}</h1>
${s.subline ? `<p class="sub" style="font-size:30px">${esc(s.subline)}</p>` : ''}
<div class="foot"><span>${esc(s.source)}</span><span>${esc(s.date)}</span></div>
</div></div>`;
}

function theme(dark) {
  return dark
    ? { bg: '#0f0f0f', fg: '#fff', muted: '#b8b8b2', line: '#2e2e2b', foot: '#9a9a94', tagStyle: 'background:#fff;color:#111', pill: '' }
    : { bg: '#f2f2ef', fg: '#111', muted: '#4a4a46', line: '#dcdcd7', foot: '#62625d', tagStyle: '', pill: 'background:#fff' };
}

function newsType(s) {
  const t = theme(!!s.dark);
  const fs_ = size(s.headline, [[30, 124], [45, 110], [65, 96], [85, 84], [999, 74]]);
  return `<div class="root" style="background:${t.bg};color:${t.fg};padding:64px;display:flex;flex-direction:column">
<div class="top">${brand}${s.artist ? `<div class="pill" style="${t.pill}">${esc(s.artist)}</div>` : ''}</div>
<div style="flex-grow:1;display:flex;flex-direction:column;justify-content:center;gap:36px">
<div class="tag" style="${t.tagStyle}">${esc(s.tag || 'NEWS')}</div>
<h1 style="font-size:${fs_}px;line-height:.98;letter-spacing:-.045em">${esc(s.headline)}</h1>
${s.subline ? `<p class="sub" style="color:${t.muted};font-size:36px;max-width:900px">${esc(s.subline)}</p>` : ''}
</div>
<div class="foot" style="border-color:${t.line};color:${t.foot}"><span>${esc(s.source)}</span><span>${esc(s.date)}</span></div>
</div>`;
}

function release(s) {
  const title = s.title || s.headline;
  const cover = s.photo ? `<div style="align-self:center;width:700px;height:700px;border-radius:36px;background:#222 url('${fileUrl(s.photo)}') center/cover"></div>` : '';
  const fs_ = s.photo ? size(title, [[20, 96], [35, 80], [999, 66]]) : size(title, [[16, 150], [28, 124], [45, 100], [999, 82]]);
  return `<div class="root" style="background:#0f0f0f;color:#fff;padding:56px;display:flex;flex-direction:column;gap:40px">
<div class="top">${brand}<div class="pill" style="background:transparent;color:#c9c9c4;border:1px solid #3a3a37">${esc(s.status || 'Out now')}</div></div>
${cover}
<div style="flex-grow:1;display:flex;flex-direction:column;justify-content:${s.photo ? 'flex-end' : 'center'};gap:22px">
<div class="tag" style="background:#fff;color:#111">${esc(s.tag || 'NEW RELEASE')}</div>
<h1 style="font-size:${fs_}px;line-height:.98;letter-spacing:-.045em">${esc(title)}</h1>
<p class="sub" style="color:#b8b8b2;font-size:38px">${esc(s.artists || s.artist)}</p>
</div>
<div class="foot" style="border-color:#2e2e2b;color:#9a9a94"><span>${esc(s.source)}</span><span>${esc(s.date)}</span></div>
</div>`;
}

function tour(s) {
  const rows = (s.dates || []).slice(0, 6).map((d, i, a) => `
<div style="display:flex;align-items:center;gap:28px;padding:24px 0;${i < a.length - 1 ? 'border-bottom:1px solid #e4e4e0' : ''}">
<div style="width:180px;flex-shrink:0;background:#111;color:#fff;border-radius:999px;padding:12px 0;text-align:center;font-size:24px;font-weight:600">${esc(d.date)}</div>
<div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:36px;font-weight:700;letter-spacing:-.02em">${esc(d.city)}</span><span style="font-size:24px;color:#62625d">${esc(d.venue || '')}</span></div>
</div>`).join('');
  const fs_ = size(s.headline, [[22, 108], [34, 88], [999, 72]]);
  return `<div class="root" style="background:#f2f2ef;padding:48px;display:flex;flex-direction:column;gap:32px">
<div class="top">${brand}<div class="tag" style="align-self:auto">${esc(s.tag || 'TOUR')}</div></div>
<div style="display:flex;flex-direction:column;gap:14px;padding:8px 8px 0">
<h1 style="font-size:${fs_}px;line-height:.95;letter-spacing:-.045em;font-weight:800">${esc(s.headline)}</h1>
${s.subline ? `<p class="sub">${esc(s.subline)}</p>` : ''}
</div>
<div style="background:#fff;border-radius:44px;padding:12px 40px;display:flex;flex-direction:column">${rows}</div>
<div style="margin-top:auto;display:flex;justify-content:space-between;padding:0 8px;font-size:22px;color:#62625d"><span>${esc(s.source)}</span><span>${esc(s.date)}</span></div>
</div>`;
}

// ---------- carousel ----------
function slideItem(s, it, i, n) {
  const fs_ = size(it.title, [[18, 104], [30, 88], [48, 72], [999, 60]]);
  return `<div class="root" style="background:#f2f2ef;padding:64px;display:flex;flex-direction:column">
<div class="top">${brand}<div class="pill" style="background:#fff">${i} / ${n}</div></div>
<div style="flex-grow:1;display:flex;flex-direction:column;justify-content:center;gap:28px">
<div style="font-size:180px;font-weight:800;letter-spacing:-.06em;line-height:.8;color:#111">${String(i).padStart(2, '0')}</div>
${it.kicker ? `<div class="tag">${esc(it.kicker)}</div>` : ''}
<h1 style="font-size:${fs_}px;line-height:.98;letter-spacing:-.045em">${esc(it.title)}</h1>
${it.detail ? `<p class="sub" style="font-size:36px">${esc(it.detail)}</p>` : ''}
${it.meta ? `<div style="background:#fff;border-radius:28px;padding:22px 28px;font-size:28px;font-weight:600;align-self:flex-start">${esc(it.meta)}</div>` : ''}
</div>
<div class="foot" style="border-color:#dcdcd7"><span>${esc(s.source)}</span><span>Weiter wischen →</span></div>
</div>`;
}

function slideList(s, it, i, n) {
  const rows = (it.rows || []).slice(0, 6).map((d, k, a) => `
<div style="display:flex;align-items:center;gap:28px;flex-grow:1;${k < a.length - 1 ? 'border-bottom:1px solid #e4e4e0' : ''}">
<div style="width:240px;flex-shrink:0;background:#111;color:#fff;border-radius:999px;padding:14px 0;text-align:center;font-size:${a.length > 4 ? 24 : 27}px;font-weight:600">${esc(d.date)}</div>
<div style="display:flex;flex-direction:column;gap:6px;min-width:0"><span style="font-size:${a.length > 4 ? 38 : 46}px;font-weight:700;letter-spacing:-.025em;line-height:1.05">${esc(d.name)}</span><span style="font-size:${a.length > 4 ? 25 : 28}px;color:#62625d">${esc(d.detail || '')}</span></div>
</div>`).join('');
  return `<div class="root" style="background:#f2f2ef;padding:56px;display:flex;flex-direction:column;gap:28px">
<div class="top">${brand}<div class="pill" style="background:#fff">${i} / ${n}</div></div>
<div style="display:flex;flex-direction:column;gap:12px;padding:0 8px">
${it.kicker ? `<div class="tag">${esc(it.kicker)}</div>` : ''}
<h1 style="font-size:72px;line-height:.98;letter-spacing:-.045em;font-weight:800">${esc(it.title)}</h1>
</div>
<div style="background:#fff;border-radius:40px;padding:12px 36px;display:flex;flex-direction:column;flex-grow:1">${rows}</div>
<div class="foot" style="border-color:#dcdcd7"><span>${esc(s.source)}</span><span>Weiter wischen →</span></div>
</div>`;
}

function slideOutro() {
  return `<div class="root" style="background:#0f0f0f;color:#fff;padding:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:48px;text-align:center">
<div style="width:300px;height:300px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center">${WAVE('#111', 190, 100, 16)}</div>
<h1 style="font-size:96px;line-height:1;letter-spacing:-.045em">Nichts mehr verpassen.</h1>
<p class="sub" style="color:#b8b8b2;font-size:38px;max-width:820px">Folge @sidechain.news für tägliche News aus der elektronischen Musik.</p>
<div style="background:#fff;color:#111;border-radius:999px;padding:18px 36px;font-size:30px;font-weight:700">Speichern &amp; teilen</div>
</div>`;
}

// ---------- vertical (reel / story) ----------
function vertical(s, animate) {
  const t = theme(!!s.dark);
  const A = (cls, delay) => animate ? `class="${cls}" style="animation-delay:${delay}s` : 'style="';
  const words = esc(s.headline).split(' ');
  const hs = size(s.headline, [[30, 128], [45, 112], [65, 98], [85, 86], [999, 76]]);
  const head = words.map((w, i) => `<span ${animate ? `class="w a-up" style="animation-delay:${(0.55 + i * 0.07).toFixed(2)}s"` : 'class="w"'}>${w}</span>`).join(' ');
  const after = 0.55 + words.length * 0.07 + 0.25;
  const photo = s.photo
    ? `<div style="position:absolute;inset:0 0 1100px 0;overflow:hidden"><div ${animate ? 'style="position:absolute;inset:0;animation:zoom 8s linear both;' : 'style="position:absolute;inset:0;'}background:#111 url('${fileUrl(s.photo)}') ${s.focus || '50% 25%'}/cover"></div></div>`
    : '';
  const bg = s.photo ? '#fff' : t.bg, fg = s.photo ? '#111' : t.fg, muted = s.photo ? '#4a4a46' : t.muted;
  return `<div class="v" style="background:${bg};color:${fg}">
${photo}
<div style="position:absolute;top:72px;left:64px;right:64px" class="top"><div ${A('a-fade', 0.05)}">${brand}</div>${s.artist ? `<div ${A('a-fade', 0.15)}"><div class="pill" style="${s.photo ? '' : t.pill}">${esc(s.artist)}</div></div>` : ''}</div>
<div class="fit" style="position:absolute;left:64px;right:160px;${s.photo ? 'top:860px;bottom:530px' : 'top:180px;bottom:530px'};display:flex;flex-direction:column;justify-content:center;gap:36px">
<div ${A('a-pop', 0.3)};align-self:flex-start"><div class="tag" style="${s.photo ? '' : t.tagStyle}">${esc(s.tag || 'NEWS')}</div></div>
<h1 style="font-size:${s.photo ? Math.round(hs * 0.78) : hs}px;line-height:1;letter-spacing:-.045em">${head}</h1>
${s.subline ? `<p ${A('a-fade', after.toFixed(2))};margin:0;font-size:40px;line-height:1.35;color:${muted}">${esc(s.subline)}</p>` : ''}
</div>
<div ${A('a-fade', (after + 0.4).toFixed(2))};position:absolute;left:64px;right:160px;bottom:470px;display:flex;justify-content:space-between;font-size:26px;color:${s.photo ? '#62625d' : t.foot}"><span>${esc(s.source)}</span><span>${esc(s.date)}</span></div>
<div style="position:absolute;left:64px;right:160px;bottom:430px;height:6px;border-radius:3px;background:${s.photo ? '#e4e4e0' : t.line};overflow:hidden"><div style="height:100%;background:${fg};transform-origin:left;${animate ? 'animation:bar 8s linear both' : ''}"></div></div>
</div>`;
}

// ---------- run ----------
async function shoot(page, html, out, w, h) {
  const tmp = path.join(dir, '.render.html');
  fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`);
  await page.setViewportSize({ width: w, height: h });
  await page.goto(fileUrl(tmp));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  for (let i = 0; i < 12; i++) { // overflow guard
    const over = await page.evaluate(H => [...document.body.querySelectorAll('*')].some(el => el.getBoundingClientRect().bottom > H + 1) || [...document.querySelectorAll('.fit')].some(el => el.scrollHeight > el.clientHeight + 1), h);
    if (!over) break;
    await page.evaluate(() => { const e = document.querySelector('h1'); e.style.fontSize = (parseFloat(getComputedStyle(e).fontSize) * 0.92) + 'px'; });
  }
  if (out) await page.screenshot({ path: out, type: 'jpeg', quality: 88 });
  return tmp;
}

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage();
  const out = spec.out || 'post.jpg';
  const done = [];
  if (spec.format === 'reel') {
    const tmp = await shoot(page, vertical(spec, true), null, 1080, 1920);
    const fdir = path.join(dir, '.frames'); fs.rmSync(fdir, { recursive: true, force: true }); fs.mkdirSync(fdir);
    await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
    const fps = 30, secs = 8;
    for (let f = 0; f < fps * secs; f++) {
      await page.evaluate(ms => document.getAnimations().forEach(a => { a.currentTime = ms; }), (f / fps) * 1000);
      await page.screenshot({ path: path.join(fdir, `f${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
    }
    // original generated audio (audio.py) unless spec.audio === false
    const wav = path.join(dir, '.reel.wav');
    let audioIn = ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100'];
    if (spec.audio !== false && fs.existsSync(path.join(dir, 'audio.py'))) {
      const seed = [...String(spec.headline || '')].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100000, 7);
      try { execFileSync('python3', [path.join(dir, 'audio.py'), wav, String(seed)]); audioIn = ['-i', wav]; } catch (e) { console.error('audio.py failed, silent reel'); }
    }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(fdir, 'f%04d.jpg'),
      ...audioIn, '-shortest',
      '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '20', '-r', String(fps),
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out]);
    fs.rmSync(fdir, { recursive: true, force: true }); fs.unlinkSync(tmp); fs.rmSync(wav, { force: true });
    done.push(out);
  } else if (spec.format === 'story') {
    fs.unlinkSync(await shoot(page, vertical(spec, false), out, 1080, 1920)); done.push(out);
  } else if (spec.template === 'carousel') {
    const base = out.replace(/\.jpg$/i, '');
    const items = (spec.items || []).slice(0, 8);
    const slides = [newsType({ ...spec.cover, artist: spec.cover.artist || '', source: spec.source, date: spec.date })]
      .concat(items.map((it, i) => it.rows ? slideList(spec, it, i + 1, items.length) : slideItem(spec, it, i + 1, items.length)), [slideOutro()]);
    for (let i = 0; i < slides.length; i++) {
      const f = `${base}-${i + 1}.jpg`;
      fs.unlinkSync(await shoot(page, slides[i], f, 1080, 1350)); done.push(f);
    }
  } else {
    const html = spec.template === 'release' ? release(spec) : spec.template === 'tour' ? tour(spec) : spec.photo ? newsPhoto(spec) : newsType(spec);
    fs.unlinkSync(await shoot(page, html, out, 1080, 1350)); done.push(out);
  }
  await b.close();
  console.log('rendered', done.join(' '));
})();
