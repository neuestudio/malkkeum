# 말끔 AI 이미지 프롬프트

총 **107장** (청소법 35 · 매거진 13 · 추천 11 · 스토어 상품 48)

## 작업 순서

1. 아래 **공통 스타일**과 **개별 프롬프트**를 이어 붙여 이미지 생성 도구에 넣는다
2. 결과 이미지를 **파일명 그대로** 저장 → `images-src/<폴더>/<파일명>.png`
   - 예: `images-src/guides/window-screen.png`
3. `npm run images` 실행 → webp로 변환되어 사이트에 자동 연결
   - 이름이 틀린 파일과 아직 이미지가 없는 글을 알려 줌
4. `npm run dev`로 확인

## 공통 규칙

- **비율**: 청소법·매거진·추천은 **3:2 가로** (최소 2400×1600), 스토어 상품은 **1:1** (최소 1600×1600)
- 청소법 이미지는 카드에서 **4:5 세로**로, 메인 배너에서 **16:9**로 잘려 보여요. **주인공을 가운데**에 두고 주변 여백을 넉넉히.
- 글자·로고·브랜드명이 들어간 이미지는 다시 생성 (상표 문제 + 가짜 글씨가 어색함)
- 사람 얼굴은 넣지 않기. 손은 괜찮지만 **손가락 모양과 도구 잡는 모습**이 이상하면 다시 생성
- 전체 톤이 섞이지 않도록 **한 도구, 같은 스타일 문구**로 계속 생성

---

## 공통 스타일 (A) — 청소법 · 매거진 · 추천

```
Editorial interior photograph, soft natural daylight from a side window, warm cream and beige palette with muted sage green accents, calm minimal Korean apartment, clean and tidy, gentle shadows, shallow depth of field, subtle film grain, photorealistic, no people's faces, no text, no logos, no brand labels. Main subject centered with generous empty space around it. 3:2 landscape.
```

## 공통 스타일 (B) — 스토어 상품

```
Minimal product still life photograph on a warm cream linen surface against an off-white plaster wall, soft daylight with a gentle diagonal shadow, muted sage and beige tones, plain unbranded packaging with no text or logos, single product centered, calm editorial mood, photorealistic. 1:1 square.
```

---

## 청소법 (`images-src/guides/`) — 스타일 A

| 파일명 | 내용 | 개별 프롬프트 |
|---|---|---|
| `window-screen` | 방충망 ⭐메인 배너 | A window insect screen in an apartment living room, a spray bottle and folded newspaper resting on the window sill, sunlight passing through the fine mesh casting a soft grid shadow |
| `drum-washer` | 드럼세탁기 | A front-loading washing machine with its round door open on a bright balcony utility room, a folded white towel and a small glass jar of white powder on top |
| `top-loader` | 통돌이 세탁기 | A top-loading washing machine with the lid open in a bright balcony laundry corner, a plastic scoop and a mesh skimmer resting beside it |
| `microwave` | 전자레인지 | A clean microwave oven on a kitchen counter with its door open, a glass bowl of water with lemon halves inside, gentle steam |
| `sink-drain` | 싱크대 배수구 | Close-up of a stainless kitchen sink drain with the strainer lifted out, a small brush and a bowl of baking soda on the sink edge |
| `cutting-board` | 도마 | A wooden cutting board and a white plastic cutting board standing upright to dry on a kitchen counter, half a lemon and coarse salt in a small dish |
| `bathroom-mirror` | 욕실 거울 | A bathroom mirror above a white sink, a folded microfiber cloth and a clear spray bottle on the counter, spotless reflective glass |
| `shower-head` | 샤워기 헤드 | A chrome shower head wrapped in a clear plastic bag filled with water, secured with a rubber band, against light grey tiles |
| `toilet-stain` | 변기 | A clean white toilet in a bright minimal bathroom, a toilet brush in a simple holder and a clear spray bottle beside it, soft daylight |
| `burnt-pot` | 냄비 탄 자국 | A stainless steel pot on a gas stove with a wooden spatula resting on its rim, a small dish of baking soda nearby |
| `faucet` | 수도꼭지 | Close-up of a shiny chrome faucet over a white basin, a small brush and folded paper towel on the counter, water droplets catching light |
| `shoe-cabinet` | 신발장 | An open shoe cabinet in an apartment entryway with neatly arranged sneakers, a paper cup of baking soda on a shelf, soft light from the doorway |
| `range-hood` | 가스레인지·후드 | A kitchen range hood filter soaking in a sink basin of warm water, a gas stove with grates removed in soft focus behind |
| `silicone-mold` | 실리콘 곰팡이 | Close-up of a clean white silicone seal line between a bathtub and wall tiles, a rolled paper towel along the seam, rubber gloves nearby |
| `electric-kettle` | 전기포트 | A stainless electric kettle on a kitchen counter with its lid open, a small glass jar of white citric acid powder and a spoon beside it |
| `fridge` | 냉장고 | An open refrigerator with glass shelves partly emptied and clean, a folded cloth and a small bowl of baking soda on a shelf |
| `window-rail` | 창틀 레일 | Close-up of a sliding window track, a soft paintbrush and a chopstick wrapped in a cloth lying in the rail, warm afternoon light |
| `mattress` | 매트리스 | A bare white mattress on a bed frame in a sunlit bedroom, a fine sieve and a bowl of baking soda on top, window open with a sheer curtain |
| `curtain` | 커튼 | Freshly washed linen curtains hanging from a rail and drying in the breeze, a laundry basket on the floor below |
| `aircon-filter` | 에어컨 필터 | A removed air conditioner mesh filter drying on a towel near a window, a wall-mounted air conditioner with its front panel lifted in the background |
| `fabric-sofa` | 패브릭 소파 | A beige fabric sofa in a bright living room, a small bowl of foam, a white towel and a soft brush resting on the armrest |
| `leather-sofa` | 가죽 소파 | A cognac leather sofa in a calm living room, a folded microfiber cloth and a small unlabeled jar of leather balm on the seat |
| `dishwasher` | 식기세척기 | A built-in dishwasher with the door open and the lower rack pulled out, the cylindrical filter removed and placed on a towel beside it |
| `tile-grout` | 줄눈 | Close-up of white bathroom floor tiles with clean grout lines, a narrow angled grout brush and a small bowl of baking soda paste |
| `shower-glass` | 샤워부스 유리문 🆕 | A frameless glass shower enclosure in a bright bathroom, the glass perfectly clear with a few water droplets, a squeegee hanging on the side, soft daylight |
| `bathroom-fan` | 욕실 환풍기 🆕 | A clean square ceiling exhaust fan grille in a bright bathroom seen from below at an angle, light tiles, soft daylight, minimal composition |
| `bathtub` | 욕조 🆕 | A clean white acrylic bathtub in a calm bathroom, a soft sponge and a folded towel on the rim, gentle window light |
| `washbasin-drain` | 세면대 배수구 🆕 | Close-up of a white bathroom washbasin with the pop-up drain stopper lifted out and resting beside it, a small bottle brush on the counter |
| `induction` | 인덕션 상판 🆕 | A spotless black glass induction cooktop on a light kitchen counter, a small cooktop scraper and a folded microfiber cloth beside it |
| `airfryer` | 에어프라이어 🆕 | An air fryer on a kitchen counter with its basket pulled out and washed, drying on a towel beside it, soft morning light |
| `rice-cooker` | 전기밥솥 🆕 | A white electric rice cooker with its lid open on a kitchen counter, the removable steam vent cap and rubber gasket placed on a cloth beside it |
| `kitchen-wall-grease` | 주방 벽 타일 🆕 | Clean glossy white subway tiles behind a stove, a spray bottle and a sponge on the counter, warm light reflecting on the tiles |
| `blinds` | 블라인드 🆕 | Light wooden-tone horizontal window blinds half open with sunlight streaming through, a white cotton glove resting on the window sill |
| `rug` | 러그 🆕 | A textured cream wool rug in a sunlit living room, a vacuum cleaner brush head resting at the edge, calm and minimal |
| `laundry-smell` | 빨래 쉰내 해결 🆕 | Freshly washed white towels hanging to dry on a rack by a sunny balcony window, a front-loading washer with its door open in the background, calm and airy |

## 매거진 (`images-src/magazine/`) — 스타일 A

| 파일명 | 내용 | 개별 프롬프트 |
|---|---|---|
| `aircon-storage` | 에어컨 보관 | A wall-mounted air conditioner covered with a simple linen dust cover in a calm autumn living room, falling leaves visible through the window |
| `humidifier-prep` | 가습기 세척 | A white humidifier disassembled on a kitchen counter, its water tank rinsed and drying upside down, a small brush beside it, early winter light |
| `boiler-check` | 보일러 점검 | A tidy utility room with a white wall-mounted home boiler and neatly organized pipes, warm lamp light, a notepad with a checklist on a shelf (no readable text) |
| `condensation-mold` | 결로 대비 | Condensation droplets on the inside of a window pane on a cold morning, a folded dry towel on the sill, soft blue-grey outdoor light and warm interior |
| `summer-bedding-storage` | 여름 이불 보관 | Freshly laundered light summer blankets folded and stacked in a fabric storage box, sunlight on a wooden floor, a small moisture absorber beside it |
| `never-mix-cleaners` | 섞으면 안 되는 세제 | Several plain unlabeled cleaning bottles spaced apart on a bathroom shelf, clearly separated, calm and orderly, a pair of rubber gloves |
| `cleaning-agents-guide` | 세제 3종 비교 | Three glass jars of white powders side by side on a linen cloth, a wooden scoop in front of each, minimal and symmetrical |
| `cleaning-routine` | 청소 루틴 | A calm tidy living room corner with a woven basket holding cleaning tools, a small calendar on the wall with no readable text, morning light |
| `moving-cleaning` | 이사·입주 청소 🆕 | An empty bright apartment room just before move-in, open built-in closet doors, a bucket, a mop and folded cloths on a clean wooden floor, cardboard boxes stacked by the door |
| `kimjang-cleanup` | 김장 뒷정리 🆕 | A tidy Korean kitchen after kimchi making, a large rinsed plastic basin and a kimchi container drying upside down in the sun by the window, rubber gloves hanging to dry |
| `padding-wash` | 패딩 세탁 🆕 | A freshly washed puffy down jacket laid flat on a drying rack in soft shade near a window, a soft brush and a small bottle of gentle detergent beside it |
| `pet-home-cleaning` | 반려동물 집 청소 🆕 | A calm living room with a relaxed dog lying on a washable blanket on a beige sofa, a lint brush and a clean pet water bowl nearby, no human faces |
| `cleaning-tools-care` | 청소 도구 관리 🆕 | Clean dish cloths and sponges drying neatly on a rack above a kitchen sink, a toilet brush and rubber gloves hanging to dry in soft daylight |

## 추천 (`images-src/picks/`) — 스타일 A

| 파일명 | 내용 | 개별 프롬프트 |
|---|---|---|
| `washer-tub-cleaner` | 세탁조 클리너 | Two plain unlabeled cleaner packages, a powder pouch and a liquid bottle, placed on top of a washing machine, soft laundry room light |
| `basic-cleaners` | 기본 세제 3종 | Three clear airtight canisters of white powder lined up on a kitchen shelf, simple blank paper tags, warm daylight |
| `starter-kit` | 청소 도구 키트 | A flat lay of basic cleaning tools on a cream surface: microfiber cloths in muted colors, a spray bottle, small brushes, a squeegee and rubber gloves, neatly arranged |
| `mold-remover` | 곰팡이 제거제 | A plain unlabeled gel tube and a spray bottle on a bathroom shelf beside white tiles, rubber gloves draped over the edge |
| `humidifier-buying-guide` | 가습기 고르는 법 🆕 | A minimal white humidifier releasing a soft mist on a bedside table in a calm bedroom at dusk, warm lamp light, a small hygrometer beside it |
| `condensation-products` | 결로 방지 용품 🆕 | A window pane with clear insulating bubble wrap film applied to the lower half, a roll of absorbent tape on the sill, cold blue morning light outside and warm interior |
| `laundry-detergent-guide` | 세탁세제 고르는 법 🆕 | Three unlabeled detergent containers, a liquid bottle, a powder box with a scoop and a small jar of capsules, arranged on top of a front-loading washer |
| `bedding-vacuum-guide` | 침구청소기 🆕 | A neatly made bed with a white duvet in soft morning light, a compact handheld bedding vacuum resting on the mattress edge |
| `dehumidifier-vs-absorber` | 제습기 vs 제습제 🆕 | A compact white dehumidifier in the corner of a bright room next to an open wardrobe with a moisture absorber container on the floor |
| `pet-cleaning-supplies` | 반려동물 청소용품 🆕 | A calm cat lying on a beige sofa, a rubber pet hair brush and a lint roller on the cushion beside it, no human faces |
| `cordless-vacuum-guide` | 무선청소기 고르는 법 🆕 | A slim cordless stick vacuum leaning against a light wall on a wooden floor in a minimal living room, a small rug in the foreground |

## 스토어 상품 (`images-src/products/`) — 스타일 B

> 쿠팡 제휴 상품이 정해지면 상품 사진 대신 쓸 수 있는 **분위기 이미지**예요. 실제 상품 사진을 쓸 수 있게 되면 같은 파일명으로 바꿔 넣으면 돼요.

| 파일명 | 개별 프롬프트 |
|---|---|
| `oxygen-tub-cleaner` | A plain kraft paper pouch of white cleaning powder with a scoop |
| `chlorine-tub-cleaner` | A plain white plastic bottle of liquid cleaner with a simple cap |
| `percarbonate` | A large plain paper bag of white granules, a few granules spilled beside a wooden scoop |
| `baking-soda` | A glass jar of fine white powder with a wooden spoon |
| `citric-acid` | A clear glass jar of white crystalline powder with half a lemon beside it |
| `mold-gel` | A plain white gel tube with a narrow nozzle lying on its side |
| `mold-spray` | A plain white trigger spray bottle |
| `squeegee` | A small bathroom squeegee with a silicone blade and a wooden handle leaning against the wall |
| `fabric-stain-remover` | A plain amber glass spray bottle next to a folded linen swatch |
| `microfiber-cloth` | A neat stack of microfiber cloths in cream, sage and grey |
| `spray-bottle` | A clear glass mist spray bottle with a matte black trigger |
| `detail-brush` | Three slim cleaning brushes of different bristle widths lying in a row |
| `grout-brush` | A narrow angled grout brush with stiff bristles and a wooden handle |
| `rubber-gloves` | A pair of long sage green rubber gloves folded neatly |
| `handheld-vacuum-brush` | Two vacuum cleaner attachments, a crevice nozzle and a soft brush head, side by side |
| `soft-sponge` 🆕 | A pair of soft cream-colored cleaning sponges stacked neatly |
| `dish-soap` 🆕 | A plain clear glass pump bottle of pale dish soap, no label |
| `paper-towel` 🆕 | A thick roll of plain white paper towels standing upright |
| `toilet-brush` 🆕 | A minimal white toilet brush in a simple cylindrical holder |
| `drain-hair-remover` 🆕 | Two slim flexible plastic drain cleaning sticks with small barbs, lying side by side |
| `cooktop-scraper` 🆕 | A small flat cooktop scraper with a wooden handle and metal blade |
| `leather-conditioner` 🆕 | A small plain amber glass jar of cream leather conditioner with a folded cloth |
| `dishwasher-cleaner` 🆕 | A plain white pouch of dishwasher cleaning tablets with a few tablets beside it, no text |
| `mesh-skimmer` 🆕 | A fine mesh skimmer with a long wooden handle |
| `ethanol` 🆕 | A plain white spray bottle with a small blank label area, clean and clinical |
| `wool-detergent` 🆕 | A plain soft-white bottle of gentle liquid detergent next to folded knitwear |
| `laundry-net` 🆕 | A large folded white mesh laundry bag with a zipper |
| `cotton-gloves` 🆕 | A pair of plain white cotton work gloves laid flat |
| `ultrasonic-humidifier` 🆕 | A small round white ultrasonic humidifier with a gentle mist |
| `warm-mist-humidifier` 🆕 | A compact white warm-mist humidifier with a visible steam outlet |
| `evaporative-humidifier` 🆕 | A tall white evaporative humidifier with a front grille |
| `hygrometer` 🆕 | A small square digital thermo-hygrometer with a blank display |
| `window-bubble-wrap` 🆕 | A neatly rolled sheet of clear window insulation bubble wrap |
| `condensation-tape` 🆕 | A roll of white absorbent window condensation tape |
| `draft-stopper` 🆕 | A roll of gray foam weather-stripping tape |
| `moisture-absorber` 🆕 | A plain white plastic moisture absorber container with clear lid |
| `hanging-dehumidifier` 🆕 | A plain white hanging moisture absorber pouch on a wooden hanger |
| `dehumidifier` 🆕 | A compact white home dehumidifier with a front water tank |
| `liquid-detergent` 🆕 | A plain white liquid laundry detergent bottle with a measuring cap |
| `powder-detergent` 🆕 | A plain kraft box of powder laundry detergent with a scoop |
| `capsule-detergent` 🆕 | A clear jar of laundry detergent capsules with a lid |
| `bedding-vacuum` 🆕 | A compact white bedding vacuum cleaner with a flat head |
| `mattress-protector` 🆕 | A folded white quilted waterproof mattress protector |
| `pet-hair-remover` 🆕 | A sage green rubber pet hair removal brush |
| `enzyme-cleaner` 🆕 | A plain white trigger spray bottle with a small paw-shaped blank tag |
| `lint-roller` 🆕 | A lint roller with a wooden handle and a white sticky roll |
| `cordless-vacuum` 🆕 | A slim white cordless stick vacuum standing upright |
| `handheld-vacuum` 🆕 | A small white handheld vacuum lying on its side |

