# 말끔레시피 인스타그램 (@malkkeumi)

역할: 문구·검수는 Claude, 이미지는 ChatGPT('말끔레시피 인스타' 프로젝트, 지침에 스타일 고정 문구).

- `posts/<번호-주제>/brief.md`: ChatGPT에 붙여 넣는 슬라이드별 문구 (한글·영문, 장별 배경과 사진 설명)
- `posts/<번호-주제>/caption.txt`: 인스타 캡션 + 해시태그
- 완성 이미지는 Claude에게 보여 주고 브리프와 대조 검수 후 업로드

참고용으로 남겨 둔 것: `templates/cardnews.html` + `scripts/render.mjs` (자체 렌더링 템플릿, 지금은 사용하지 않음)
