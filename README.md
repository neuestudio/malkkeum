# 말끔 (Malkkeum) — 청소 가이드 플랫폼

Astro 정적 사이트 + Cloudflare Workers. 기획은 [PLAN.md](PLAN.md).

```
npm run dev       # 개발 서버 (http://localhost:4321/ko/) — 광고 자리가 점선으로 보임
npm run images    # images-src/ 원본 → public/images/ webp 변환 + 빠진 이미지 목록
npm run build     # dist/ 생성 + A4 체크리스트 PDF + 검색 색인(Pagefind) + 깨진 내부 링크 검사 (Chrome 필요)
npm run preview   # 빌드 + Worker 포함 로컬 실행 (http://localhost:8787) — 문의폼·리다이렉트 확인용
npm run deploy    # 빌드 + Cloudflare 배포
```

## 구조
- `site.config.mjs` — 도메인, 애드센스 ID, 공개 언어, 제휴 고지 문구
- `src/content/products/<언어>/<id>.md` — 스토어 상품. `url`에 쿠팡 제휴 링크를 넣으면 구매 버튼이 생김. 추천 글(picks)은 이 id로 상품을 불러옴
- `src/content/guides|magazine|picks/<언어>/<slug>.md` — 모든 글. 필수 항목은 `src/content.config.ts`에서 검사 (빠지면 빌드 실패)
- `src/lib/i18n.ts` — 화면 문구 (ko/en)
- `src/pages/[lang]/...` — 페이지 템플릿
- `worker/index.js` — `/` → `/ko/` 301, 끝 슬래시 통일, 도메인 이전 301, 문의폼 메일 전송
- `images-src/<guides|magazine|picks|products>/<slug>.png` — AI 이미지 원본 (git 제외). 프롬프트는 [IMAGE_PROMPTS.md](IMAGE_PROMPTS.md)
- `public/images/` — `npm run images`가 만든 webp (1600px + 800px). 파일명이 글 slug와 같으면 자동 연결, 없으면 자리표시 색면

## A4 체크리스트 PDF
- 매거진 글 frontmatter에 `sheet:`(제목, 섹션, 항목)를 적으면 빌드 때 `dist/pdf/ko-<slug>.pdf`가 만들어지고 글 위아래에 "PDF로 받기 / 인쇄하기" 버튼이 생김
- 섹션에 `columns: [월, 화, …]`를 주면 요일·주·월별 체크 칸, `check: false`면 체크 칸 없는 요약 목록
- 글자 크기는 A4 한 장을 꽉 채우도록 자동으로 정해짐 (0.8~1.6배). 빌드 로그에 배율과 쪽수가 나오고, 한 장을 넘으면 경고
- 미리보기: `/ko/sheets/<slug>/` (검색엔진 제외 처리됨)
- PDF 생성에 컴퓨터의 Chrome을 씀. 다른 위치면 `CHROME_PATH` 환경변수로 지정

## 글 추가
1. 기존 글을 복사해 `src/content/guides/ko/<영문-slug>.md` 로 저장
2. 앞부분(frontmatter)의 항목을 채우고 본문 작성
3. `npm run dev`로 확인 → 커밋

## 영어 공개
1. `src/content/*/en/<같은 slug>.md` 로 번역본 추가 (번역본이 있는 글만 /en 에 공개됨)
2. 충분히 쌓이면 `site.config.mjs` → `PUBLIC_LANGS: ['ko', 'en']`

## 도메인
- 연결됨: **https://malkkeumi.com** (`wrangler.jsonc`의 `routes`, `CANONICAL_HOST`). www·http·workers.dev는 모두 https://malkkeumi.com 같은 경로로 301

### 다른 도메인으로 옮길 때
1. 도메인을 Cloudflare에 추가하고 Workers → `malkkeum` → Custom Domain 연결
2. `site.config.mjs` → `SITE_URL: 'https://새도메인'`
3. `wrangler.jsonc` → `CANONICAL_HOST: '새도메인'` (`workers_dev: true`는 6~12개월 유지)
4. `npm run deploy`

## 문의폼 메일 설정 (도메인 연결 후)
1. Cloudflare 대시보드 → 도메인 → Email → Email Routing 켜기
2. Destination addresses에 받을 메일 주소를 추가하고 인증
3. `wrangler.jsonc`에서 `CONTACT_FROM`(예: `contact@새도메인`), `CONTACT_TO`(인증한 주소) 입력, `send_email` 주석 해제
4. `npm run deploy` 후 문의 페이지에서 테스트
   설정 전에는 폼 제출 시 "전송에 실패했어요"가 표시됨

## 애드센스 신청 전 체크리스트
- [ ] 도메인 연결, 문의폼 메일 동작 확인
- [ ] 한국어 글 30개 이상 (PLAN.md 5장)
- [ ] 모든 글에 AI 이미지
- [ ] Google Search Console · 네이버 서치어드바이저 등록, `/sitemap.xml` 제출
- [ ] 승인 후 `ADSENSE_PUB_ID` 입력 → 배포 → `/ads.txt` 확인, AdSense에서 광고 단위 만들어 `AdSlot`의 `slot` 연결
- [ ] 영어 공개 시 AdSense "개인정보 보호 및 메시지"에서 EEA·영국 동의 메시지(CMP) 설정
