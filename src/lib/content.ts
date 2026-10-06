import { getCollection, type CollectionEntry } from 'astro:content';
import { PUBLIC_LANGS, type Lang } from './i18n';

type Name = 'guides' | 'magazine' | 'picks' | 'products';

// 글 id는 "ko/window-screen" 형식. 앞은 언어, 뒤는 slug.
export const slugOf = (id: string) => id.split('/').slice(1).join('/');
export const langOf = (id: string) => id.split('/')[0] as Lang;

// 최신순. 날짜가 같으면 id 순으로 고정 (빌드마다 순서가 바뀌지 않게)
const byDateDesc = (a: { id: string; data: Record<string, unknown> }, b: { id: string; data: Record<string, unknown> }) => {
  const ta = a.data.publishedAt instanceof Date ? a.data.publishedAt.getTime() : 0;
  const tb = b.data.publishedAt instanceof Date ? b.data.publishedAt.getTime() : 0;
  return tb - ta || a.id.localeCompare(b.id);
};

export async function entries<N extends Name>(name: N, lang: Lang): Promise<CollectionEntry<N>[]> {
  const all = (await getCollection(name)) as CollectionEntry<N>[];
  return all.filter((e) => langOf(e.id) === lang).sort(byDateDesc as never);
}

// 같은 slug의 글이 공개 언어 중 어디에 있는지 (hreflang 용)
export async function translationsOf(name: Name, slug: string): Promise<Lang[]> {
  const all = await getCollection(name);
  return PUBLIC_LANGS.filter((l) => all.some((e) => e.id === `${l}/${slug}`));
}

// 없는 slug를 적으면 빌드를 멈춰서 깨진 연결을 막는다
export function pickBySlugs<T extends { id: string }>(list: T[], slugs: string[], from = '') {
  return slugs.map((s) => {
    const found = list.find((e) => slugOf(e.id) === s);
    if (!found) throw new Error(`[content] ${from}: '${s}' 글을 찾을 수 없어요`);
    return found;
  });
}

// 상세 페이지 getStaticPaths 공통
export async function detailPaths(name: Name) {
  const all = await getCollection(name);
  return all
    .filter((e) => PUBLIC_LANGS.includes(langOf(e.id)))
    .map((entry) => ({ params: { lang: langOf(entry.id), slug: slugOf(entry.id) }, props: { entry } }));
}

export const langPaths = () => PUBLIC_LANGS.map((lang) => ({ params: { lang } }));

// 도구는 한국 제도(종량제 등)에 맞춘 기능이라 한국어에만 둔다
export const TOOL_LANGS: Lang[] = ['ko'];
export const toolLangPaths = () => PUBLIC_LANGS.filter((l) => TOOL_LANGS.includes(l)).map((lang) => ({ params: { lang } }));

export const SEASON_BY_MONTH = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'] as const;
export const currentSeason = (d = new Date()) => SEASON_BY_MONTH[d.getMonth()];
