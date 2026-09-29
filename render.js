#!/usr/bin/env node
// Sidechain post renderer: node render.js spec.json
// spec: { template: "news"|"release"|"tour", out, tag, artist, headline, subline,
//         source, date, photo?, dark?, title?, artists?, dates?: [{date, city, venue}] }
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const dir = __dirname;
const font = path.join(dir, 'node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2');
const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fileUrl = p => 'file://' + path.resolve(p);

const WAVE = (c) => `<svg width="26" height="14" viewBox="0 0 230 120" fill="none" stroke="${c}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"><path d="M10 100 L10 20 Q40 100 70 100 L70 20 Q100 100 130 100 L130 20 Q160 100 190 100 L190 20 Q205 70 220 100"/></svg>`;
const brand = `<div class="pill brand"><div class="dot">${WAVE('#fff')}</div><span>sidechain</span></div>`;

function size(text, steps) {
  const n = text.length;
  for (const [max, px] of steps) if (n <= max) return px;
  return steps[steps.length - 1][1];
}

const css = `
@font-face{font-family:G;src:url(${fileUrl(font)});font-weight:100 900}
*{box-sizing:border-box}
body{margin:0;font-family:G,sans-serif;color:#111}
.root{width:1080px;height:1350px;position:relative;overflow:hidden}
.pill{background:#fff;color:#111;border-radius:999px;font-size:22px;font-weight:500;padding:14px 26px}
.brand{padding:9px 26px 9px 9px;display:flex;align-items:center;gap:12px}
.brand span{font-size:25px;font-weight:800;letter-spacing:-.04em}
.dot{width:42px;height:42px;border-radius:50%;background:#111;display:flex;align-items:center;justify-content:center}
.top{display:flex;justify-content:space-between;align-items:center}
.tag{align-self:flex-start;background:#111;color:#fff;border-radius:999px;padding:10px 22px;font-size:22px;font-weight:600;letter-spacing:.08em}
h1{margin:0;font-weight:700;line-height:1.02;letter-spacing:-.035em}
.sub{margin:0;font-size:32px;line-height:1.35;color:#4a4a46}
.foot{display:flex;justify-content:space-between;border-top:1px solid #e4e4e0;padding-top:22px;font-size:22px;color:#62625d}
`;

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

function newsType(s) {
  const dark = !!s.dark;
  const bg = dark ? '#0f0f0f' : '#f2f2ef', fg = dark ? '#fff' : '#111', muted = dark ? '#b8b8b2' : '#4a4a46', line = dark ? '#2e2e2b' : '#dcdcd7', foot = dark ? '#9a9a94' : '#62625d';
  const fs_ = size(s.headline, [[30, 124], [45, 110], [65, 96], [85, 84], [999, 74]]);
  return `<div class="root" style="background:${bg};color:${fg};padding:64px;display:flex;flex-direction:column">
<div class="top">${brand}<div class="pill" style="${dark ? '' : 'background:#fff'}">${esc(s.artist)}</div></div>
<div style="flex-grow:1;display:flex;flex-direction:column;justify-content:center;gap:36px">
<div class="tag" style="${dark ? 'background:#fff;color:#111' : ''}">${esc(s.tag || 'NEWS')}</div>
<h1 style="font-size:${fs_}px;line-height:.98;letter-spacing:-.045em">${esc(s.headline)}</h1>
${s.subline ? `<p class="sub" style="color:${muted};font-size:36px;max-width:900px">${esc(s.subline)}</p>` : ''}
</div>
<div class="foot" style="border-color:${line};color:${foot}"><span>${esc(s.source)}</span><span>${esc(s.date)}</span></div>
</div>`;
}

function release(s) {
  const title = s.title || s.headline;
  const cover = s.photo
    ? `<div style="align-self:center;width:700px;height:700px;border-radius:36px;background:#222 url('${fileUrl(s.photo)}') center/cover"></div>` : '';
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

const body = spec.template === 'release' ? release(spec)
  : spec.template === 'tour' ? tour(spec)
  : spec.photo ? newsPhoto(spec) : newsType(spec);

(async () => {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;
  const tmp = path.join(dir, '.render.html');
  fs.writeFileSync(tmp, html);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.goto(fileUrl(tmp));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  // overflow guard: shrink headline until the page fits
  for (let i = 0; i < 12; i++) {
    const over = await p.evaluate(() => {
      const r = document.querySelector('.root');
      return [...r.querySelectorAll('*')].some(el => el.getBoundingClientRect().bottom > 1350 + 1);
    });
    if (!over) break;
    await p.evaluate(() => { const h = document.querySelector('h1'); h.style.fontSize = (parseFloat(getComputedStyle(h).fontSize) * 0.92) + 'px'; });
  }
  await p.screenshot({ path: spec.out || 'post.jpg', type: 'jpeg', quality: 88 });
  await b.close();
  fs.unlinkSync(tmp);
  console.log('rendered', spec.out || 'post.jpg');
})();
