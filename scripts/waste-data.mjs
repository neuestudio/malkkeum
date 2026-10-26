// 공공데이터 '전국생활쓰레기배출정보'(행정안전부, 매일 갱신)를 받아 서울 자치구별로 정리한다.
// 실행: node scripts/waste-data.mjs  → src/data/waste-seoul.json
// 출처: https://www.data.go.kr/data/15025450/standard.do (이용허락범위 제한 없음)
// 파일은 localdata 다운로드 페이지를 거쳐야 받아진다 (Referer 필요). 인코딩은 CP949.
import { writeFile, mkdir } from 'node:fs/promises';

const PAGE = 'https://file.localdata.go.kr/file/household_waste_info/info';
const FILE = 'https://file.localdata.go.kr/file/download/household_waste_info/info';
const OUT = 'src/data/waste-seoul.json';
// 데이터 기준일이 이보다 오래되면 '구청에 확인' 안내를 띄우고 검색 노출을 막는다
const STALE_BEFORE = '2022-01-01';

// 서울 25개 자치구 (주소용 영문 slug). 데이터에 없는 구도 목록에는 남긴다.
const GU = {
  종로구: 'jongno', 중구: 'jung', 용산구: 'yongsan', 성동구: 'seongdong', 광진구: 'gwangjin',
  동대문구: 'dongdaemun', 중랑구: 'jungnang', 성북구: 'seongbuk', 강북구: 'gangbuk', 도봉구: 'dobong',
  노원구: 'nowon', 은평구: 'eunpyeong', 서대문구: 'seodaemun', 마포구: 'mapo', 양천구: 'yangcheon',
  강서구: 'gangseo', 구로구: 'guro', 금천구: 'geumcheon', 영등포구: 'yeongdeungpo', 동작구: 'dongjak',
  관악구: 'gwanak', 서초구: 'seocho', 강남구: 'gangnam', 송파구: 'songpa', 강동구: 'gangdong',
};
const DAY = { 월: 'MO', 화: 'TU', 수: 'WE', 목: 'TH', 금: 'FR', 토: 'SA', 일: 'SU' };

// 따옴표 안의 쉼표·줄바꿈을 지키는 CSV 파서
function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), r[i].trim()])));
}

// "월+수+금" → ['MO','WE','FR']. 요일이 아닌 말이 섞이면 null (원문 그대로 보여준다)
function days(v) {
  const parts = v.split('+').map((s) => s.trim()).filter(Boolean);
  if (!parts.length || !parts.every((p) => DAY[p])) return null;
  return parts.map((p) => DAY[p]);
}
const clean = (v) => (v && v !== '없음' && v !== '-' ? v : '');

const res = await fetch(FILE, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: PAGE } });
if (!res.ok || !(res.headers.get('content-type') || '').includes('csv')) throw new Error(`다운로드 실패: ${res.status} ${res.headers.get('content-type')}`);
const text = new TextDecoder('euc-kr').decode(await res.arrayBuffer());
const all = parseCsv(text);
const seoul = all.filter((r) => r['시도명'] === '서울특별시');

const districts = Object.entries(GU).map(([name, slug]) => {
  const rows = seoul.filter((r) => r['시군구명'] === name);
  const basis = rows.map((r) => r['데이터기준일자']).sort().at(-1) || null;
  const zones = rows.map((r) => ({
    zone: clean(r['관리구역명']),
    area: clean(r['관리구역대상지역명']).replace(/\+/g, ', '),
    placeType: clean(r['배출장소유형']),
    place: clean(r['배출장소']),
    method: { g: clean(r['생활쓰레기배출방법']), f: clean(r['음식물쓰레기배출방법']), r: clean(r['재활용품배출방법']) },
    days: { g: days(r['생활쓰레기배출요일']), f: days(r['음식물쓰레기배출요일']), r: days(r['재활용품배출요일']) },
    daysText: { g: r['생활쓰레기배출요일'], f: r['음식물쓰레기배출요일'], r: r['재활용품배출요일'] },
    time: {
      g: [r['생활쓰레기배출시작시각'], r['생활쓰레기배출종료시각']],
      f: [r['음식물쓰레기배출시작시각'], r['음식물쓰레기배출종료시각']],
      r: [r['재활용품배출시작시각'], r['재활용품배출종료시각']],
    },
    noPickup: clean(r['미수거일']).replace(/\+/g, ', '),
    bulk: { method: clean(r['일시적다량폐기물배출방법']), place: clean(r['일시적다량폐기물배출장소']) },
    dept: clean(r['관리부서명']),
    phone: clean(r['관리부서전화번호']),
    basis: r['데이터기준일자'],
  }));
  return { name, slug, basis, stale: !basis || basis < STALE_BEFORE, missing: rows.length === 0, zones };
});

await mkdir('src/data', { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({ source: { name: '행정안전부 전국생활쓰레기배출정보', url: 'https://www.data.go.kr/data/15025450/standard.do', fetchedAt: new Date().toISOString().slice(0, 10) }, districts }, null, 1) + '\n',
);
const ok = districts.filter((d) => !d.missing);
console.log(`✓ ${OUT}  서울 ${ok.length}/25개 구, ${seoul.length}개 구역 · 오래된 데이터 ${ok.filter((d) => d.stale).length}개 구 · 없음: ${districts.filter((d) => d.missing).map((d) => d.name).join(', ')}`);
