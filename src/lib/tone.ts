// 자리표시 이미지 색을 공간별로 다르게 해서 카드 목록이 단조롭지 않게 한다.
const TONES = {
  kitchen: 'sand',
  bathroom: 'stone',
  living: 'clay',
  bedroom: 'sand',
  entrance: 'stone',
  window: 'sage',
} as const;

export const toneOf = (space: keyof typeof TONES) => TONES[space];
