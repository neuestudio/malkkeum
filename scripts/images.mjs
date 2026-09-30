// images-src/<종류>/<slug>.(png|jpg|jpeg|webp) → public/images/<종류>/<slug>.webp (1600px) + <slug>-800.webp
// 사용: npm run images          (새로 바뀐 이미지만 변환)
//       npm run images -- --all (전부 다시 변환)
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const SRC = 'images-src';
const OUT = 'public/images';
const KINDS = ['guides', 'magazine', 'picks', 'products'];
const force = process.argv.includes('--all');

// 콘텐츠 slug 목록 (파일 이름이 틀렸는지 확인하려고)
const slugs = (kind) =>
  existsSync(`src/content/${kind}/ko`) ? readdirSync(`src/content/${kind}/ko`).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : [];

let made = 0;
const unknown = [];
const missing = {};

for (const kind of KINDS) {
  const known = slugs(kind);
  const dir = join(SRC, kind);
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(OUT, kind), { recursive: true });
  const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  const have = new Set();

  for (const f of files) {
    const slug = parse(f).name;
    if (!known.includes(slug)) {
      unknown.push(`${kind}/${f}`);
      continue;
    }
    have.add(slug);
    const input = join(dir, f);
    const big = join(OUT, kind, `${slug}.webp`);
    const small = join(OUT, kind, `${slug}-800.webp`);
    if (!force && existsSync(big) && statSync(big).mtimeMs > statSync(input).mtimeMs) continue;
    await sharp(input).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(big);
    await sharp(input).rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 78 }).toFile(small);
    made++;
    console.log(`✓ ${kind}/${slug}`);
  }
  const lack = known.filter((s) => !have.has(s) && !existsSync(join(OUT, kind, `${s}.webp`)));
  if (lack.length) missing[kind] = lack;
}

console.log(`\n변환 ${made}개`);
if (unknown.length) console.log(`\n⚠ 글과 이름이 맞지 않아 건너뜀 (파일 이름을 slug로 바꿔 주세요):\n  ${unknown.join('\n  ')}`);
const total = Object.values(missing).flat().length;
if (total) {
  console.log(`\n아직 이미지가 없는 글 ${total}개:`);
  for (const [k, list] of Object.entries(missing)) console.log(`  ${k}: ${list.join(', ')}`);
} else console.log('모든 글에 이미지가 있어요.');
