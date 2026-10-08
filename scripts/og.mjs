// 기본 공유 이미지(OG, 1200×630)를 만든다. 로고나 문구가 바뀌었을 때만 실행: node scripts/og.mjs
// 글 상세 페이지는 대표 이미지를 공유 이미지로 쓰므로 여기서 만들지 않는다.
import { chromium } from 'playwright-core';

const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const variants = [
  { file: 'public/og-default.png', lang: 'ko', label: '말끔레시피', lines: ['어려운 청소도', '순서만 알면 말끔하게.'] },
  { file: 'public/og-default-en.png', lang: 'en', label: 'Malkkeum Recipe', lines: ['Every cleaning job,', 'step by step.'] },
];

const html = ({ lang, label, lines }) => `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #f7f4ea; color: #2a211a; font-family: 'Pretendard Variable', sans-serif;
    padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between; word-break: keep-all; }
  .label { display: flex; align-items: center; gap: 14px; font-size: 20px; font-weight: 700; letter-spacing: .02em; }
  .label::before { content: ''; width: 13px; height: 13px; background: #b7c4a4; transform: rotate(45deg); }
  h1 { font-size: 66px; line-height: 1.22; font-weight: 600; letter-spacing: -.03em; }
  h1 span { display: block; color: #736d66; }
  .row { display: flex; justify-content: space-between; align-items: flex-end; }
  .mark { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 112px; line-height: .8; letter-spacing: -.01em; }
  .mark small { font-family: 'Pretendard Variable', sans-serif; font-style: normal; font-size: 22px; font-weight: 600;
    letter-spacing: .24em; text-transform: uppercase; color: #56654a; margin-left: 14px; }
  .host { font-size: 20px; color: #736d66; }
</style></head>
<body>
  <p class="label">${label}</p>
  <h1>${lines[0]}<span>${lines[1]}</span></h1>
  <div class="row"><p class="mark">Malkkeum<small>Recipe</small></p><p class="host">malkkeumi.com</p></div>
</body></html>`;

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const v of variants) {
  await page.setContent(html(v), { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: v.file });
  console.log('✓', v.file);
}
await browser.close();
