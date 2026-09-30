import type { APIRoute } from 'astro';
import site from '../../site.config.mjs';

// 애드센스 게시자 ID를 site.config.mjs에 넣으면 자동으로 채워진다.
export const GET: APIRoute = () =>
  new Response(
    site.ADSENSE_PUB_ID
      ? `google.com, ${site.ADSENSE_PUB_ID}, DIRECT, f08c47fec0942fa0\n`
      : '# AdSense publisher ID not set yet\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
