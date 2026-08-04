// ===== 한글 자모 분해/조합 + 두음법칙 유틸 =====
// 끝말잇기의 핵심. 음절을 초성/중성/종성으로 분해하고, 마지막 글자에 대해
// 두음법칙이 적용된 대체 시작 글자를 계산한다. (강의 범위 밖 심화 · 순수 함수)

const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

const BASE = 0xac00
const LAST = 0xd7a3

export const isHangulSyllable = (ch) => {
  if (!ch) return false
  const code = ch.charCodeAt(0)
  return code >= BASE && code <= LAST
}

// 완성형 음절 → { cho, jung, jong } 인덱스
export const decompose = (ch) => {
  if (!isHangulSyllable(ch)) return null
  const s = ch.charCodeAt(0) - BASE
  const jong = s % 28
  const jung = Math.floor((s % (21 * 28)) / 28)
  const cho = Math.floor(s / (21 * 28))
  return { cho, jung, jong }
}

// 인덱스 → 완성형 음절
export const compose = (cho, jung, jong = 0) =>
  String.fromCharCode(BASE + (cho * 21 + jung) * 28 + jong)

// 마지막 실제 음절(공백/기호 제외)
export const lastSyllable = (word) => {
  const s = String(word || '').replace(/\s/g, '')
  for (let i = s.length - 1; i >= 0; i--) {
    if (isHangulSyllable(s[i])) return s[i]
  }
  return ''
}
export const firstSyllable = (word) => {
  const s = String(word || '').replace(/\s/g, '')
  return s[0] || ''
}

// i·y 계열 중성(ㅑㅒㅕㅖㅛㅠㅣ): 두음법칙에서 ㄹ/ㄴ → ㅇ 로 바뀌는 조건
const IY = new Set([2, 3, 6, 7, 12, 17, 20])
const CHO_R = 5 // ㄹ
const CHO_N = 2 // ㄴ
const CHO_O = 11 // ㅇ

// 두음법칙 변환 글자(있으면). 예: 려→여, 락→낙, 녀→여
export const dueum = (ch) => {
  const d = decompose(ch)
  if (!d) return null
  const { cho, jung, jong } = d
  if (cho === CHO_R) {
    // ㄹ: i·y 계열이면 ㅇ, 아니면 ㄴ
    return compose(IY.has(jung) ? CHO_O : CHO_N, jung, jong)
  }
  if (cho === CHO_N && IY.has(jung)) {
    // ㄴ + i·y 계열이면 ㅇ (녀→여, 니→이)
    return compose(CHO_O, jung, jong)
  }
  return null
}

// 다음 단어의 허용 시작 글자 목록(원래 글자 + 두음 변환)
export const allowedStarts = (ch) => {
  const set = new Set()
  if (ch) set.add(ch)
  const alt = dueum(ch)
  if (alt) set.add(alt)
  return [...set]
}

export const _internal = { CHO, JUNG, JONG }
