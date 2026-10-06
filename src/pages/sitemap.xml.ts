import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PUBLIC_LANGS, path, type Lang } from '../lib/i18n';
import { langOf, slugOf, TOOL_LANGS } from '../lib/content';

// 번역본이 있는 페이지끼리 xhtml:link 로 묶는다 (hreflang)
export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => new URL(p, site).toString();
  type Row = { alts: Partial<Record<Lang, string>>; lastmod?: Date };
  const rows: Row[] = [];

  for (const p of ['', 'guides', 'magazine', 'picks', 'store', 'about', 'contact', 'privacy', 'terms']) {
    rows.push({ alts: Object.fromEntries(PUBLIC_LANGS.map((l) => [l, path(l, p)])) });
  }
  for (const p of ['tools', 'tools/trash-day', 'tools/supplies']) {
    rows.push({ alts: Object.fromEntries(PUBLIC_LANGS.filter((l) => TOOL_LANGS.includes(l)).map((l) => [l, path(l, p)])) });
  }
  for (const name of ['guides', 'magazine', 'picks'] as const) {
    const all = (await getCollection(name)).filter((e) => PUBLIC_LANGS.includes(langOf(e.id)));
    const slugs = [...new Set(all.map((e) => slugOf(e.id)))];
    for (const slug of slugs) {
      const group = all.filter((e) => slugOf(e.id) === slug);
      const lastmod = new Date(Math.max(...group.map((e) => (e.data.updatedAt ?? e.data.publishedAt).getTime())));
      rows.push({ alts: Object.fromEntries(group.map((e) => [langOf(e.id), path(langOf(e.id), `${name}/${slug}`)])), lastmod });
    }
  }

  const urls = rows.flatMap(({ alts, lastmod }) => {
    const entries = Object.entries(alts) as [Lang, string][];
    const links =
      entries.length > 1
        ? entries.map(([l, h]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(h)}"/>`).join('')
        : '';
    return entries.map(
      ([, h]) => `<url><loc>${abs(h)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}${links}</url>`,
    );
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
