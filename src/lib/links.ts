import coupang from '../../coupang-links.mjs';
import type { Lang } from './i18n';

// 상품 구매 링크. 한국어는 coupang-links.mjs, 다른 언어는 상품 파일의 url (예: 아마존)
export function productUrl(lang: Lang, id: string, fallback?: string): string | undefined {
  if (lang === 'ko') return (coupang as Record<string, string>)[id] || fallback || undefined;
  return fallback || undefined;
}
