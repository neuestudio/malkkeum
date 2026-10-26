// 지역 쓰레기 배출 정보 (src/data/waste-seoul.json, scripts/waste-data.mjs가 공공데이터로 만든다)
import raw from '../data/waste-seoul.json';
import manual from '../data/waste-seoul-manual.json';
import site from '../../site.config.mjs';

export type Kind = 'g' | 'f' | 'r';
export type Zone = (typeof raw.districts)[number]['zones'][number] & { contractor?: string };
export type District = Omit<(typeof raw.districts)[number], 'zones'> & { zones: Zone[]; source?: { name: string; url: string } };

// 공공데이터에 없는 구는 구청 공식 페이지에서 옮긴 값(waste-seoul-manual.json)으로 채운다
const label = (codes: string[]) => codes.map((c) => ({ MO: '월', TU: '화', WE: '수', TH: '목', FR: '금', SA: '토', SU: '일' })[c]).join('+');
const districts: District[] = raw.districts.map((d) => {
  const m = manual.districts.find((x) => x.slug === d.slug);
  if (!d.missing || !m) return d as District;
  const z = m.zoneDefaults;
  return {
    ...d,
    basis: m.basis,
    stale: false,
    missing: false,
    source: m.source,
    zones: m.zones.map((zz) => ({
      ...z,
      zone: zz.zone,
      area: zz.area,
      contractor: (zz as { contractor?: string }).contractor,
      daysText: { g: label(z.days.g), f: label(z.days.f), r: label(z.days.r) },
      basis: m.basis,
    })),
  } as District;
});

export const waste = { ...raw, districts };
// 공개 전에는 로컬 확인용으로만 만든다
export const wasteVisible = Boolean(site.WASTE_PUBLIC || import.meta.env.DEV || process.env.WASTE_PREVIEW === '1');
export const wastePublic = Boolean(site.WASTE_PUBLIC);

export const KINDS: { key: Kind; name: string; color: string }[] = [
  { key: 'g', name: '일반쓰레기', color: 'var(--text)' },
  { key: 'f', name: '음식물', color: 'var(--medium)' },
  { key: 'r', name: '재활용', color: 'var(--accent-deep)' },
];
const ORDER = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const KO: Record<string, string> = { MO: '월', TU: '화', WE: '수', TH: '목', FR: '금', SA: '토', SU: '일' };

export const sortDays = (codes: string[]) => ORDER.filter((d) => codes.includes(d));
export function dayLabel(codes: string[] | null, raw: string) {
  if (!codes) return raw.replace(/\+/g, ', ') || '구청 문의';
  if (codes.length === 7) return '매일';
  return sortDays(codes).map((d) => KO[d]).join('·');
}
// 구청마다 '2400', '19:00'처럼 표기가 달라서 HH:MM으로 맞춘다
const norm = (t: string) => (/^\d{4}$/.test(t) ? `${t.slice(0, 2)}:${t.slice(2)}` : t);
export const timeLabel = ([s, e]: string[]) => (s && e ? `${norm(s)} ~ ${norm(e)}` : norm(s || ''));

// 쓰레기 배출일 알림 도구에 이 구역 요일과 시작 시각을 채워서 연다
export function alertLink(z: Zone) {
  const q = new URLSearchParams();
  for (const k of ['g', 'f', 'r'] as Kind[]) {
    const d = z.days[k];
    if (!d) continue;
    q.set(k, sortDays(d).join('.'));
    if (z.time[k][0]) q.set(`${k}t`, norm(z.time[k][0]).replace(':', ''));
  }
  return q.toString() ? `/ko/tools/trash-day/?${q}` : '/ko/tools/trash-day/';
}

export const fmtBasis = (d: string | null) => (d ? `${d.slice(0, 4)}년 ${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일` : '');
