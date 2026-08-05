// ===== 간단 효과음 (Web Audio API) =====
// 외부 파일 없이 오실레이터로 짧은 효과음을 생성한다. 사용자 상호작용 후 동작.
let ctx
const ac = () => {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) ctx = new AC()
  }
  return ctx
}

const beep = (freq = 440, dur = 0.12, type = 'sine', gain = 0.05) => {
  try {
    const c = ac()
    if (!c) return
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.value = gain
    o.connect(g)
    g.connect(c.destination)
    o.start()
    o.stop(c.currentTime + dur)
  } catch {
    /* 오디오 미지원 무시 */
  }
}

const seq = (notes, gap = 110) =>
  notes.forEach(([f, d], i) => setTimeout(() => beep(f, d, 'triangle'), i * gap))

export const sfx = {
  ok: () => beep(660, 0.1, 'triangle', 0.05),
  fail: () => beep(170, 0.18, 'sawtooth', 0.04),
  hint: () => beep(880, 0.08, 'sine', 0.04),
  win: () =>
    seq([
      [523, 0.14],
      [659, 0.14],
      [784, 0.18],
    ]),
  lose: () =>
    seq(
      [
        [330, 0.16],
        [247, 0.2],
      ],
      150,
    ),
}
