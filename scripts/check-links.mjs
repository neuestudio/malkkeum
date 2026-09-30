// 빌드 결과(dist)의 모든 내부 링크가 실제 파일로 이어지는지 검사한다. 깨진 링크가 있으면 빌드 실패.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const broken = [];

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
    if (href.startsWith('//')) continue;
    const target = join(DIST, href);
    const ok = href === '/' || existsSync(target) || existsSync(join(target, 'index.html'));
    if (!ok) broken.push(`${file.slice(DIST.length)} → ${href}`);
  }
}

if (broken.length) {
  console.error(`깨진 내부 링크 ${broken.length}개:\n  ${[...new Set(broken)].join('\n  ')}`);
  process.exit(1);
}
console.log(`내부 링크 검사 통과 (${pages.length}개 페이지)`);
