# 말끔레시피 로고 파일

Malkkeum(Instrument Serif Italic) + RECIPE(Pretendard SemiBold) 락업. 글자는 모두 윤곽선(path)이라 폰트 없이 열립니다.
한눈에 보기: `overview.png`

| 폴더 | 용도 |
|---|---|
| `svg/` | 원본 벡터. 웹, 디자인 툴(Figma·일러스트레이터), 인쇄소 전달 |
| `pdf/` | 인쇄용 벡터 PDF (로고 폭 100mm, 크기 자유롭게 조절 가능) |
| `png/` | 투명 배경 PNG, 폭 3000px. 문서·슬라이드·영상 |
| `sns/` | 프로필 1080×1080 3종, 커버 1500×500 |

## 색 버전

| 파일 | 쓰는 곳 |
|---|---|
| `primary` | 기본. 크림·흰색 등 밝은 배경 (Malkkeum Ink #2A211A, RECIPE Sage Deep #56654A) |
| `reverse` | 어두운 배경 (Cream #F7F4EA, RECIPE Cream 75%) |
| `on-sage` | 세이지 #B7C4A4 배경 (전부 Ink) |
| `mono-black` | 1도 인쇄, 도장, 스티커 |
| `mono-white` | 사진 위, 어두운 단색 위 |
| `symbol` | 파비콘, 앱 아이콘, 아주 작은 자리 |

## 규칙

- RECIPE 크기는 Malkkeum 글자 크기의 약 27%. 비율을 따로 늘리거나 줄이지 않습니다.
- 파일에 들어 있는 여백(대문자 M 높이의 절반)이 최소 보호 영역입니다.
- 최소 크기: 화면 워드마크 높이 24px, 인쇄 폭 25mm.
- 프로필 사진은 `profile-symbol`(작게 보일 때 가장 잘 읽힘)을 기본으로, 로고를 보여주고 싶을 때 `profile-lockup`을 씁니다.

다시 만들기: `FONT_DIR=<폰트 폴더> node scripts/logo.mjs` (폰트는 Google Fonts Instrument Serif, Pretendard 1.3.9, 둘 다 OFL)
