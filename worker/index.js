// 모든 요청이 정적 파일보다 먼저 이 Worker를 거친다.
// 1) 정식 도메인이 아닌 주소(예: 도메인 연결 후의 workers.dev)로 들어오면 같은 경로로 301
// 2) / → 기본 언어(/ko/)로 301
// 3) 페이지 주소는 항상 끝에 / 가 붙도록 301
// 4) POST /api/contact → 문의 메일 전송 (Cloudflare Email Routing)
import { EmailMessage } from 'cloudflare:email';

const DEFAULT_LANG = 'ko';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') return contact(request, env);

    const canonicalHost = env.CANONICAL_HOST;
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (canonicalHost && !local && (url.hostname !== canonicalHost || url.protocol === 'http:')) {
      url.protocol = 'https:';
      url.hostname = canonicalHost;
      url.port = '';
      return Response.redirect(url.toString(), 301);
    }

    // 네이버 소유 확인 로봇(Yeti)은 리다이렉트 없이 루트 페이지(확인 태그 포함)를 받는다
    const naverBot = /Yeti/i.test(request.headers.get('User-Agent') || '');
    if (url.pathname === '/' && !naverBot) {
      url.pathname = `/${DEFAULT_LANG}/`;
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname.endsWith('/index.html')) {
      url.pathname = url.pathname.slice(0, -'index.html'.length);
      return Response.redirect(url.toString(), 301);
    }

    const looksLikeFile = /\.[a-z0-9]+$/i.test(url.pathname);
    if (!looksLikeFile && !url.pathname.endsWith('/')) {
      url.pathname += '/';
      return Response.redirect(url.toString(), 301);
    }

    const res = await env.ASSETS.fetch(request);
    // PDF와 인쇄용 시트는 글 본문과 내용이 겹치니 검색 결과에 따로 나오지 않게 한다
    if (url.pathname.startsWith('/pdf/') || url.pathname.includes('/sheets/')) {
      const out = new Response(res.body, res);
      out.headers.set('X-Robots-Tag', 'noindex');
      return out;
    }
    return res;
  },
};

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function contact(request, env) {
  if (request.method !== 'POST') return json(405, { error: 'method' });

  // 다른 사이트에서 이 주소로 폼을 쏘는 것을 막는다
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json(403, { error: 'origin' });

  let form;
  try {
    form = await request.formData();
  } catch {
    return json(400, { error: 'form' });
  }
  const field = (k, max) => String(form.get(k) ?? '').trim().slice(0, max);

  // 봇이 채우는 숨은 칸에 값이 있으면 성공한 척하고 버린다
  if (field('website', 200)) return json(200, { ok: true });

  const name = field('name', 50).replace(/[\r\n]/g, ' ');
  const email = field('email', 120);
  const topic = field('topic', 40).replace(/[\r\n]/g, ' ');
  const message = field('message', 3000);
  const lang = field('lang', 5);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || !form.get('consent')) {
    return json(400, { error: 'invalid' });
  }

  // 도메인 연결 + Email Routing 설정 전에는 메일을 보낼 수 없다 (README 참고)
  if (!env.MAILER || !env.CONTACT_FROM || !env.CONTACT_TO) return json(503, { error: 'mail-not-configured' });

  const subject = `[말끔 문의] ${topic} - ${name}`;
  const text = [`이름: ${name}`, `이메일: ${email}`, `유형: ${topic}`, `언어: ${lang}`, '', message].join('\n');
  const raw = [
    `From: =?UTF-8?B?${b64('말끔 문의폼')}?= <${env.CONTACT_FROM}>`,
    `To: <${env.CONTACT_TO}>`,
    `Reply-To: <${email}>`,
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${env.CONTACT_FROM.split('@')[1]}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(text).replace(/.{76}/g, '$&\r\n'),
  ].join('\r\n');

  try {
    await env.MAILER.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
  } catch (e) {
    console.error('contact mail failed', e);
    return json(502, { error: 'send' });
  }
  return json(200, { ok: true });
}

function b64(s) {
  let bin = '';
  for (const byte of new TextEncoder().encode(s)) bin += String.fromCharCode(byte);
  return btoa(bin);
}
