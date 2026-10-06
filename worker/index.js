// 모든 요청이 정적 파일보다 먼저 이 Worker를 거친다.
// 1) 정식 도메인이 아닌 주소(예: 도메인 연결 후의 workers.dev)로 들어오면 같은 경로로 301
// 2) / → 기본 언어(/ko/)로 301
// 3) 페이지 주소는 항상 끝에 / 가 붙도록 301
// 4) POST /api/contact → 문의 메일 전송 (Cloudflare Email Routing)
import { EmailMessage } from 'cloudflare:email';

const DEFAULT_LANG = 'ko';

// 옮기거나 합친 글의 옛 주소 → 새 주소 (301)
const MOVED = {
  '/ko/guides/saenghwal-tub-cleaner/': '/ko/guides/laundry-smell/',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') return contact(request, env);
    if (url.pathname === '/api/trash-calendar.ics') return trashCalendar(url);

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
      // 브라우저 언어가 한국어가 아니고 영어판이 공개돼 있으면 /en/, 아니면 /ko/
      // (언어에 따라 목적지가 달라지므로 영구 이동(301)이 아닌 302)
      const prefersKo = /^\s*ko\b/i.test(request.headers.get('Accept-Language') || 'ko');
      let lang = DEFAULT_LANG;
      if (!prefersKo) {
        const en = await env.ASSETS.fetch(new Request(new URL('/en/', url), { method: 'HEAD' }));
        if (en.ok) lang = 'en';
      }
      url.pathname = `/${lang}/`;
      return Response.redirect(url.toString(), 302);
    }

    if (MOVED[url.pathname]) {
      url.pathname = MOVED[url.pathname];
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

// ─── 쓰레기 배출일 캘린더 (.ics) ─────────────────────────────
// /api/trash-calendar.ics?g=MO.TH&gt=2000&f=TU.FR&ft=2000&r=WE&rt=1900&a=30
// g·f·r = 일반쓰레기·음식물·재활용 요일, *t = 시각(HHMM), a = 몇 분 전 알림(0·30·60·1440)
const TRASH_TYPES = {
  g: { name: '일반쓰레기(종량제 봉투) 배출일', tip: '종량제 봉투 입구를 묶어 정해진 장소와 시간에 내놓아요.' },
  f: { name: '음식물 쓰레기 배출일', tip: '물기를 꼭 짜고, 뼈·조개껍데기·달걀껍데기 같은 일반쓰레기는 빼요.' },
  r: { name: '재활용 분리배출일', tip: '내용물을 비우고 헹군 뒤 종류별로 나눠요. 페트병은 라벨을 떼고 납작하게.' },
};
const DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

function trashCalendar(url) {
  const q = url.searchParams;
  const alarm = [0, 30, 60, 1440].includes(Number(q.get('a'))) ? Number(q.get('a')) : 30;
  // 서울 기준 오늘 날짜
  const now = new Date(Date.now() + 9 * 3600 * 1000);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const events = [];

  for (const [key, info] of Object.entries(TRASH_TYPES)) {
    const days = (q.get(key) || '').split('.').filter((d) => DAYS.includes(d));
    if (!days.length) continue;
    const t = /^([01]\d|2[0-3])([0-5]\d)$/.exec(q.get(key + 't') || '') || [, '20', '00'];
    // 오늘부터 7일 안에서 고른 요일 중 가장 가까운 날을 첫 일정으로
    let first = null;
    for (let i = 0; i < 7 && !first; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      if (days.includes(DAYS[d.getUTCDay()])) first = d;
    }
    const ymd = first.toISOString().slice(0, 10).replace(/-/g, '');
    const lines = [
      'BEGIN:VEVENT',
      `UID:malkkeum-trash-${key}-${days.join('')}-${t[1]}${t[2]}@malkkeumi.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Asia/Seoul:${ymd}T${t[1]}${t[2]}00`,
      'DURATION:PT30M',
      `RRULE:FREQ=WEEKLY;BYDAY=${days.join(',')}`,
      `SUMMARY:${info.name}`,
      `DESCRIPTION:${info.tip}\\n분리배출 가이드: https://malkkeumi.com/ko/tools/trash-day/`,
      'URL:https://malkkeumi.com/ko/tools/trash-day/',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${info.name}`,
      `TRIGGER:${alarm === 0 ? 'PT0M' : alarm === 1440 ? '-P1D' : `-PT${alarm}M`}`,
      'END:VALARM',
      'END:VEVENT',
    ];
    events.push(...lines);
  }

  if (!events.length) return new Response('요일을 하나 이상 골라 주세요.', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Malkkeum//Trash Day//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:말끔 쓰레기 배출일',
    'X-WR-TIMEZONE:Asia/Seoul',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Seoul',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0900',
    'TZOFFSETTO:+0900',
    'TZNAME:KST',
    'END:STANDARD',
    'END:VTIMEZONE',
    ...events,
    'END:VCALENDAR',
  ]
    .map(foldLine)
    .join('\r\n');

  return new Response(ics + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="malkkeum-trash-day.ics"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}

// iCalendar 규칙: 한 줄은 75바이트를 넘으면 접어서 이어 쓴다
function foldLine(line) {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out = [];
  let cur = '';
  for (const ch of line) {
    if (enc.encode(cur + ch).length > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = '';
    }
    cur += ch;
  }
  out.push(cur);
  return out.join('\r\n ');
}

