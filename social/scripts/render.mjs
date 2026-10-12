// 말끔레시피 카드뉴스 렌더링
// 사용법: node social/scripts/render.mjs social/posts/<폴더>
// <폴더>/slides.json → <폴더>/slides/01.png … + contact-sheet.png (1080×1350)
// 표지 사진은 slides.json의 image에 사이트 이미지 경로(public/ 기준, 예: /images/guides/microwave.webp)를 적는다.
import { chromium } from 'playwright-core';
import { readFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const social = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.resolve(social, '../public');
const dir = path.resolve(process.argv[2] || '');
const jsonPath = path.join(dir, 'slides.json');
if (!process.argv[2] || !existsSync(jsonPath)) {
  console.error('사용법: node social/scripts/render.mjs social/posts/<폴더>  (slides.json 필요)');
  process.exit(1);
}

const data = JSON.parse(await readFile(jsonPath, 'utf8'));
for (const s of data.slides) if (s.image?.startsWith('/')) s.image = pathToFileURL(path.join(publicDir, s.image)).href;

const outDir = path.join(dir, 'slides');
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(pathToFileURL(path.join(social, 'templates/cardnews.html')).href, { waitUntil: 'load' });
await page.evaluate((d) => window.render(d), data);
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});

const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"|'/g, '')));
const missing = ['Pretendard', 'Instrument Serif'].filter((f) => !loaded.includes(f));
if (missing.length) console.warn(`⚠ 폰트 로드 실패: ${missing.join(', ')}`);

// 넘침 검사: 하단 로고 줄(아래 150px)을 침범하거나 오른쪽 여백을 넘는 글
const overflow = await page.evaluate(() =>
  [...document.querySelectorAll('.slide')].flatMap((s) => {
    const r = s.getBoundingClientRect();
    const bad = [...s.querySelectorAll('h1,h2,p:not(.pg),li,.step,dd,.save')].filter((e) => {
      if (e.closest('.foot') || e.closest('.big')) return false;
      const b = e.getBoundingClientRect();
      return b.bottom > r.bottom - 150 || b.right > r.right - 60;
    });
    return bad.length ? [Number(s.dataset.i)] : [];
  }),
);

const slides = await page.$$('.slide');
for (const [i, el] of slides.entries()) await el.screenshot({ path: path.join(outDir, `${String(i + 1).padStart(2, '0')}.png`) });

await page.addStyleTag({ content: '#root{display:grid;grid-template-columns:repeat(4,1080px);gap:40px;padding:40px;width:max-content;zoom:.25;background:#ccc}' });
await page.setViewportSize({ width: 1200, height: 800 });
await page.locator('#root').screenshot({ path: path.join(dir, 'contact-sheet.png') });
await browser.close();

console.log(`✓ ${slides.length}장 → ${path.relative(process.cwd(), outDir)}/`);
if (overflow.length) {
  console.warn(`⚠ 넘침 의심 슬라이드: ${overflow.join(', ')}`);
  process.exitCode = 2;
}
