import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 파일 위치: src/content/<컬렉션>/<언어>/<slug>.md
// 같은 글의 번역본은 언어 폴더만 다르고 파일명(slug)이 같다 → hreflang 연결 기준

const date = z.coerce.date();
// 이미지 파일이 아직 없으면 비워 둔다. 비어 있으면 톤 맞춘 자리표시 이미지가 나온다.
const image = z.string().optional();

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string().min(5),
    summary: z.string().min(20).max(160),
    description: z.string().min(40).max(170),
    space: z.enum(['kitchen', 'bathroom', 'living', 'bedroom', 'entrance', 'window']),
    target: z.enum(['appliance', 'furniture', 'screen', 'kitchenware', 'fixture', 'surface']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    duration: z.number().int().positive(), // 분
    frequency: z.string(),
    season: z.array(z.enum(['spring', 'summer', 'autumn', 'winter', 'all'])).min(1),
    materials: z.array(z.string()).min(1),
    tools: z.array(z.string()).min(1),
    steps: z
      .array(z.object({ title: z.string(), body: z.string().min(30), image }))
      .min(4),
    cautions: z.array(z.string()).min(1),
    tips: z.array(z.string()).min(1),
    picks: z.array(z.string()).default([]), // picks 컬렉션 slug
    related: z.array(z.string()).default([]), // guides 컬렉션 slug
    heroImage: image,
    heroAlt: z.string().optional(),
    featured: z.boolean().default(false),
    publishedAt: date,
    updatedAt: date.optional(),
  }),
});

const magazine = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/magazine' }),
  schema: z.object({
    title: z.string().min(5),
    summary: z.string().min(20).max(160),
    description: z.string().min(40).max(170),
    kind: z.enum(['season', 'guide', 'column']),
    // A4 인쇄용 시트. 있으면 PDF가 만들어지고 글에 "PDF로 받기" 버튼이 생긴다
    sheet: z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        sections: z
          .array(
            z.object({
              title: z.string(),
              columns: z.array(z.string()).optional(), // 반복 체크 칸 (예: 월~일)
              check: z.boolean().default(true), // false면 체크 칸 없는 요약 목록
              items: z.array(z.string()).min(1),
            }),
          )
          .min(1),
        note: z.string().optional(),
      })
      .optional(),
    season: z.array(z.enum(['spring', 'summer', 'autumn', 'winter', 'all'])).min(1),
    related: z.array(z.string()).default([]),
    heroImage: image,
    heroAlt: z.string().optional(),
    publishedAt: date,
    updatedAt: date.optional(),
  }),
});

const picks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/picks' }),
  schema: z.object({
    title: z.string().min(5),
    summary: z.string().min(20).max(160),
    description: z.string().min(40).max(170),
    // products 컬렉션의 slug + 이 글에서의 추천 이유
    products: z
      .array(z.object({ id: z.string(), point: z.string() }))
      .min(1),
    related: z.array(z.string()).default([]),
    heroImage: image,
    heroAlt: z.string().optional(),
    publishedAt: date,
    updatedAt: date.optional(),
  }),
});

// 스토어 상품. 파일 위치: src/content/products/<언어>/<id>.md (frontmatter만 사용)
const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    category: z.enum(['cleaner', 'laundry', 'bathroom', 'tool']),
    type: z.string(), // 예: 산소계 · 가루
    point: z.string().min(15), // 스토어 카드에 나오는 한 줄 설명
    url: z.string().url().optional(), // 제휴 링크. 비어 있으면 구매 버튼이 나오지 않는다
    image,
    guides: z.array(z.string()).default([]), // 이 상품을 쓰는 청소법 slug
    pick: z.string().optional(), // 고르는 법 추천 글 slug
    order: z.number().default(100),
  }),
});

export const collections = { guides, magazine, picks, products };
