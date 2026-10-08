// 번역 중인 언어까지 포함한 목록 (PREVIEW_ALL_LANGS=1 일 때만 쓰인다)
const PREVIEW_LANGS = ['ko', 'en'];

// 사이트 전역 설정. 도메인을 구매하면 SITE_URL만 바꾸고 다시 빌드한다.
export default {
  // 정식 주소 (끝에 / 없이). canonical, hreflang, 사이트맵, og:url 모두 이 값을 기준으로 만든다.
  SITE_URL: 'https://malkkeumi.com',

  // 구글 애드센스 게시자 ID (예: 'pub-1234567890123456'). 비어 있으면 광고 코드와 광고 칸이 출력되지 않는다.
  ADSENSE_PUB_ID: '',

  // 검색엔진 소유 확인 코드 (meta 태그의 content 값만). 비어 있으면 출력하지 않는다.
  GOOGLE_SITE_VERIFICATION: '',
  NAVER_SITE_VERIFICATION: '83fc74ae8841bcafd4d34956fbe73589b278cb89',

  // 콘텐츠를 공개하는 언어. 첫 번째가 기본 언어이자 x-default.
  // 영어 번역이 충분히 쌓이면 'en'을 추가한다. (빈 페이지가 공개되지 않도록)
  // 새 언어를 준비할 때는 이 목록에서 빼 두고 PREVIEW_LANGS에만 넣은 뒤, PREVIEW_ALL_LANGS=1 npm run dev 로 미리 본다
  PUBLIC_LANGS: process.env.PREVIEW_ALL_LANGS ? PREVIEW_LANGS : ['ko', 'en'],

  // 개인정보처리방침·이용약관 시행일
  POLICY_DATE: '2026-10-01',

  // 운영 주체와 공개 연락처 (소개·문의·푸터·개인정보처리방침·글쓴이 표시에 쓰인다)
  OPERATOR: { ko: '말끔레시피', en: 'Malkkeum Recipe' },
  CONTACT_EMAIL: 'malkkeumi01@gmail.com',

  // 쿠팡 파트너스 고지 문구 (공정위 지침상 글마다 눈에 띄게 표시해야 한다)
  AFFILIATE_NOTICE: {
    ko: '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
    en: 'This page contains affiliate links. We may earn a small commission at no extra cost to you.',
  },
};
