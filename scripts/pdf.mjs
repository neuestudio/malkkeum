// dist/<lang>/sheets/<slug>/ 페이지를 A4 PDF로 만들어 dist/pdf/<lang>-<slug>.pdf 에 저장한다.
// 빌드(npm run build) 중에 자동 실행된다. 컴퓨터에 설치된 Chrome을 쓴다.
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from 'playwright-core';

const DIST = 'dist';
const CHROME =
  process.env.CHROME_PATH ||
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);

const sheets = [];
for (const lang of readdirSync(DIST)) {
  const dir = join(DIST, lang, 'sheets');
  if (existsSync(dir) && statSync(dir).isDirectory()) for (const slug of readdirSync(dir)) sheets.push({ lang, slug });
}
if (!sheets.length) process.exit(0);
if (!CHROME) {
  console.error('PDF를 만들려면 Chrome이 필요해요. 설치하거나 CHROME_PATH 환경변수로 위치를 알려주세요.');
  process.exit(1);
}

// dist를 잠깐 서버로 띄워서 절대경로(/_astro/…)가 그대로 동작하게 한다
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };
const server = createServer((req, res) => {
  let p = join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': types[extname(p)] ?? 'application/octet-stream' }).end(readFileSync(p));
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch({ executablePath: CHROME });
mkdirSync(join(DIST, 'pdf'), { recursive: true });
for (const { lang, slug } of sheets) {
  const page = await browser.newPage();
  await page.goto(`${base}/${lang}/sheets/${slug}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const scale = await page.evaluate(() => window.fitSheet());
  const out = join(DIST, 'pdf', `${lang}-${slug}.pdf`);
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  const pages = (readFileSync(out, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`PDF ✓ ${lang}/${slug} (${pages}쪽, 배율 ${scale})`);
  if (pages > 1) console.warn(`  ⚠ 한 장을 넘어요. 항목을 줄여 주세요.`);
  await page.close();
}
await browser.close();
server.close();
