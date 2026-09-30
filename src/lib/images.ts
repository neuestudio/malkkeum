import { existsSync } from 'node:fs';

// 이미지 규칙: public/images/<종류>/<slug>.webp (+ 작은 버전 <slug>-800.webp)
// npm run images 가 images-src/ 의 원본을 이 위치로 변환해 준다.
// 글 frontmatter에 heroImage를 직접 적으면 그게 우선한다.
export type ImageKind = 'guides' | 'magazine' | 'picks' | 'products';
export type Img = { src?: string; srcset?: string };

export function imageOf(kind: ImageKind, slug: string, explicit?: string): Img {
  if (explicit) return { src: explicit };
  const base = `/images/${kind}/${slug}`;
  if (!existsSync(`public${base}.webp`)) return {};
  const small = existsSync(`public${base}-800.webp`);
  return { src: `${base}.webp`, srcset: small ? `${base}-800.webp 800w, ${base}.webp 1600w` : undefined };
}
