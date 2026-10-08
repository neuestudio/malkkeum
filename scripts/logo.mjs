// 로고 락업(Malkkeum + RECIPE)을 글자 윤곽선(path)으로 만든 SVG와 인쇄용 PDF, SNS용 PNG를 brand/logo/에 만든다.
// 로고 비율이 바뀌었을 때만 실행: FONT_DIR=<폰트 폴더> node scripts/logo.mjs
// 필요한 폰트: InstrumentSerif-Italic.ttf (Google Fonts), Pretendard-SemiBold.otf (Pretendard 1.3.9)
// 필요한 패키지: opentype.js (OPENTYPE_PATH로 위치 지정 가능), playwright-core
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';

const require = createRequire(import.meta.url);
const opentype = require(process.env.OPENTYPE_PATH ?? 'opentype.js');
const FONT_DIR = process.env.FONT_DIR ?? 'fonts';
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = 'brand/logo';

const serif = opentype.loadSync(path.join(FONT_DIR, 'InstrumentSerif-Italic.ttf'));
const sans = opentype.loadSync(path.join(FONT_DIR, 'Pretendard-SemiBold.otf'));

const C = { ink: '#2A211A', cream: '#F7F4EA', paper: '#FFFDF7', sage: '#B7C4A4', sageDeep: '#56654A', white: '#FFFFFF' };

// 사이트 헤더와 같은 비율: 워드마크 28px · RECIPE 7.5px · 간격 8px · 자간 워드마크 -0.01em, RECIPE 0.18em
const W = 200; // 워드마크 글자 크기 (SVG 단위)
const R = W * (7.5 / 28);
const GAP = W * (8 / 28);

// 글자를 한 자씩 놓으며 자간·커닝을 적용한 path를 만든다
function textPath(font, text, x, y, size, tracking) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(text);
  const out = new opentype.Path();
  let cx = x;
  glyphs.forEach((g, i) => {
    out.extend(g.getPath(cx, y, size));
    cx += g.advanceWidth * scale;
    if (i < glyphs.length - 1) cx += font.getKerningValue(g, glyphs[i + 1]) * scale + tracking * size;
  });
  return out;
}

const word = textPath(serif, 'Malkkeum', 0, 0, W, -0.01);
const wb = word.getBoundingBox();
const recipe = textPath(sans, 'RECIPE', wb.x2 + GAP, 0, R, 0.18);
const rb = recipe.getBoundingBox();

// 보호 영역: 대문자 M 높이의 절반
const capH = (serif.charToGlyph('M').getBoundingBox().y2 / serif.unitsPerEm) * W;
const PAD = Math.round(capH / 2);
const x1 = Math.min(wb.x1, rb.x1), y1 = Math.min(wb.y1, rb.y1), x2 = Math.max(wb.x2, rb.x2), y2 = Math.max(wb.y2, rb.y2);
const vb = { x: x1 - PAD, y: y1 - PAD, w: x2 - x1 + PAD * 2, h: y2 - y1 + PAD * 2 };
const d = (p) => p.toPathData(2);

const variants = [
  { name: 'malkkeum-recipe-primary', label: '기본 · 밝은 배경', word: C.ink, recipe: C.sageDeep, bg: C.cream },
  { name: 'malkkeum-recipe-reverse', label: '반전 · 어두운 배경', word: C.cream, recipe: C.cream, recipeOpacity: 0.75, bg: C.ink },
  { name: 'malkkeum-recipe-on-sage', label: '세이지 배경', word: C.ink, recipe: C.ink, bg: C.sage },
  { name: 'malkkeum-recipe-mono-black', label: '단색 검정 · 1도 인쇄', word: '#000000', recipe: '#000000', bg: C.white },
  { name: 'malkkeum-recipe-mono-white', label: '단색 흰색 · 사진 위', word: C.white, recipe: C.white, bg: '#6B6B6B' },
];

const svg = (v, { bg = false } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x.toFixed(2)} ${vb.y.toFixed(2)} ${vb.w.toFixed(2)} ${vb.h.toFixed(2)}" width="${Math.round(vb.w)}" height="${Math.round(vb.h)}" role="img" aria-label="Malkkeum Recipe">
  <title>Malkkeum Recipe</title>${bg ? `\n  <rect x="${vb.x.toFixed(2)}" y="${vb.y.toFixed(2)}" width="${vb.w.toFixed(2)}" height="${vb.h.toFixed(2)}" fill="${v.bg}"/>` : ''}
  <path fill="${v.word}" d="${d(word)}"/>
  <path fill="${v.recipe}"${v.recipeOpacity ? ` fill-opacity="${v.recipeOpacity}"` : ''} d="${d(recipe)}"/>
</svg>
`;

const symbol = (size = 64) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="Malkkeum Recipe symbol">
  <rect width="64" height="64" rx="14" fill="${C.sage}"/>
  <rect x="22" y="22" width="20" height="20" fill="${C.ink}" transform="rotate(45 32 32)"/>
</svg>
`;

for (const dir of ['svg', 'pdf', 'png', 'sns']) fs.mkdirSync(path.join(OUT, dir), { recursive: true });
for (const v of variants) fs.writeFileSync(path.join(OUT, 'svg', `${v.name}.svg`), svg(v));
fs.writeFileSync(path.join(OUT, 'svg', 'malkkeum-recipe-symbol.svg'), symbol());

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage();
const inline = (s) => s.replace(/ width="\d+" height="\d+"/, ' width="100%" height="100%"');

// 인쇄용 PDF: 벡터 그대로, 로고 폭 100mm + 보호 영역
const mmW = 100, mmH = (mmW * vb.h) / vb.w;
for (const v of variants.filter((v) => !v.name.endsWith('mono-white'))) {
  await page.setContent(`<style>@page{size:${mmW}mm ${mmH.toFixed(2)}mm;margin:0}html,body{margin:0}svg{display:block;width:${mmW}mm;height:${mmH.toFixed(2)}mm}</style>${inline(svg(v))}`);
  await page.pdf({ path: path.join(OUT, 'pdf', `${v.name}.pdf`), width: `${mmW}mm`, height: `${mmH.toFixed(2)}mm`, printBackground: true, pageRanges: '1' });
}

// 투명 배경 PNG: 폭 3000px (A4 폭 인쇄 시 약 300dpi)
for (const v of variants) {
  const pw = 3000, ph = Math.round((pw * vb.h) / vb.w);
  await page.setViewportSize({ width: pw, height: ph });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${pw}px;height:${ph}px}</style>${inline(svg(v))}`);
  await page.screenshot({ path: path.join(OUT, 'png', `${v.name}-3000.png`), omitBackground: true });
}

// SNS: 프로필 3종(원형으로 잘려도 들어가게 폭 84% 이내), 커버 1500×500
const lock = (v, widthPct) => `<div style="width:${widthPct}%">${inline(svg(v))}</div>`;
const sns = [
  { file: 'profile-symbol-1080.png', w: 1080, h: 1080, body: `<div style="width:100%;height:100%;background:${C.sage};display:grid;place-items:center"><div style="width:300px;height:300px;background:${C.ink};transform:rotate(45deg)"></div></div>` },
  { file: 'profile-lockup-1080.png', w: 1080, h: 1080, body: `<div style="width:100%;height:100%;background:${C.cream};display:grid;place-items:center">${lock(variants[0], 84)}</div>` },
  { file: 'profile-lockup-reverse-1080.png', w: 1080, h: 1080, body: `<div style="width:100%;height:100%;background:${C.ink};display:grid;place-items:center">${lock(variants[1], 84)}</div>` },
  { file: 'cover-1500x500.png', w: 1500, h: 500, body: `<div style="width:100%;height:100%;background:${C.cream};display:grid;place-items:center">${lock(variants[0], 44)}</div>` },
];
for (const s of sns) {
  await page.setViewportSize({ width: s.w, height: s.h });
  await page.setContent(`<style>html,body{margin:0;width:${s.w}px;height:${s.h}px}svg{display:block}</style>${s.body}`);
  await page.screenshot({ path: path.join(OUT, 'sns', s.file) });
}

// 한눈에 보는 시트 (검수용)
const cards = variants
  .map((v) => `<figure><div style="background:${v.bg}">${inline(svg(v))}</div><figcaption>${v.label}<br><code>${v.name}</code></figcaption></figure>`)
  .join('');
fs.writeFileSync(
  path.join(OUT, 'overview.html'),
  `<!doctype html><meta charset="utf-8"><title>Malkkeum Recipe Logo</title><style>body{margin:40px;background:${C.paper};font:14px -apple-system,sans-serif;color:${C.ink}}main{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}figure{margin:0}figure div{padding:40px 48px;border:1px solid #E3DDCF}figcaption{margin-top:8px;color:#736D66}</style><main>${cards}<figure><div style="background:${C.cream}">${symbol(96)}</div><figcaption>심볼 · 파비콘·앱 아이콘<br><code>malkkeum-recipe-symbol</code></figcaption></figure></main>`,
);
await page.setViewportSize({ width: 1200, height: 900 });
await page.goto('file://' + path.resolve(OUT, 'overview.html'));
await page.screenshot({ path: path.join(OUT, 'overview.png'), fullPage: true });

await browser.close();
console.log(`✓ ${OUT}  (viewBox ${vb.w.toFixed(0)}×${vb.h.toFixed(0)}, RECIPE ${R.toFixed(1)} / 워드마크 ${W})`);
