import type { APIRoute } from 'astro';
import { entries, langPaths, slugOf } from '../../lib/content';
import { path, t, type Lang } from '../../lib/i18n';

// 청소법·매거진·추천 글 전체 RSS (네이버 서치어드바이저 RSS 제출용)
export const getStaticPaths = langPaths;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = async ({ params, site }) => {
  const lang = params.lang as Lang;
  const s = t(lang);
  const items = [
    ...(await entries('guides', lang)).map((e) => ({ e, kind: 'guides', cat: s.nav.guides })),
    ...(await entries('magazine', lang)).map((e) => ({ e, kind: 'magazine', cat: s.nav.magazine })),
    ...(await entries('picks', lang)).map((e) => ({ e, kind: 'picks', cat: s.nav.picks })),
  ].sort((a, b) => b.e.data.publishedAt.getTime() - a.e.data.publishedAt.getTime() || a.e.id.localeCompare(b.e.id));

  const home = new URL(path(lang), site).toString();
  const body = items
    .map(({ e, kind, cat }) => {
      const url = new URL(path(lang, `${kind}/${slugOf(e.id)}`), site).toString();
      return `<item><title>${esc(e.data.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${esc(e.data.description)}</description><category>${esc(cat)}</category><pubDate>${e.data.publishedAt.toUTCString()}</pubDate></item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(s.siteName)}</title>
<link>${home}</link>
<description>${esc(s.siteDescription)}</description>
<language>${lang}</language>
<atom:link href="${new URL(`/${lang}/rss.xml`, site)}" rel="self" type="application/rss+xml"/>
${body}
</channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
