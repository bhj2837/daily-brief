// ===== 끝말잇기 게임 엔진 Composable =====
// 백엔드 없이 로컬 사전 기반으로 동작하되, 로컬에 없는 단어는 Wiktionary로 온라인 검증한다.
// 두음법칙 검증 + 컴퓨터 AI + 타이머/점수. 컴포넌트는 start/submit/reset만 호출한다.
import { ref, shallowRef, computed, onUnmounted } from 'vue'
import { allowedStarts, lastSyllable, firstSyllable, isHangulSyllable } from '@/utils/hangul'
import { DICT, DICT_SET, indexByFirst } from '@/data/wordChain'
import { verifyKoreanWord, fetchWordsByPrefix } from '@/api/dict'
import { sfx } from '@/utils/sound'
import { useGameStore } from '@/stores/gameStore'

const TIME_LIMIT = 12 // 플레이어 턴 제한시간(초)
const TICK = 100 // ms

export function useWordChain() {
  const gameStore = useGameStore()
  const idx = indexByFirst()

  const chain = shallowRef([]) // { word, by:'computer'|'player' }
  const used = new Set()
  const status = ref('idle') // 'idle' | 'playing' | 'ended'
  const result = ref(null) // 'win' | 'lose'
  const turn = ref('player') // 'player' | 'computer'
  const checking = ref(false) // 온라인 사전 확인 중
  const score = ref(0)
  const combo = ref(0)
  const maxCombo = ref(0)
  const difficulty = ref('normal')
  const timeLeft = ref(TIME_LIMIT)
  const message = ref('')
  const soundOn = ref(true)
  const hintWord = ref('')
  const hintsUsed = ref(0)
  const computerThinking = ref(false) // 컴퓨터가 온라인 사전을 탐색 중

  let timerId = null

  const play = (name) => {
    if (soundOn.value) sfx[name]?.()
  }
  const toggleSound = () => {
    soundOn.value = !soundOn.value
  }

  // ---- 파생 상태 ----
  const lastWord = computed(() => chain.value[chain.value.length - 1]?.word || '')
  const lastChar = computed(() => lastSyllable(lastWord.value))
  const starts = computed(() => allowedStarts(lastChar.value))
  const timeRatio = computed(() => Math.max(0, timeLeft.value / TIME_LIMIT))
  const chainLength = computed(() => chain.value.length)

  // ---- 후보 탐색 (컴퓨터는 로컬 사전에서만 생성) ----
  const candidatesFor = (ch) =>
    allowedStarts(ch)
      .flatMap((s) => idx[s] || [])
      .filter((w) => !used.has(w))

  // ---- 타이머 ----
  const stopTimer = () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }
  const startTimer = () => {
    stopTimer()
    timeLeft.value = TIME_LIMIT
    timerId = setInterval(() => {
      timeLeft.value = Math.round((timeLeft.value - TICK / 1000) * 10) / 10
      if (timeLeft.value <= 0) {
        timeLeft.value = 0
        stopTimer()
        message.value = '시간 초과!'
        play('lose')
        endGame('lose')
      }
    }, TICK)
  }

  // ---- 컴퓨터 AI ----
  // 1) 로컬 사전(난이도 반영) 우선
  const pickLocal = (ch) => {
    const c = candidatesFor(ch)
    if (!c.length) return null
    const openness = (w) => candidatesFor(lastSyllable(w)).length
    if (difficulty.value === 'easy') return c[Math.floor(Math.random() * c.length)]
    if (difficulty.value === 'hard') {
      c.sort((a, b) => openness(a) - openness(b)) // 상대 옵션 최소화(적대적)
      return c[0]
    }
    c.sort((a, b) => openness(b) - openness(a)) // normal: 게임 지속 + 약간의 무작위
    return c[Math.floor(Math.random() * Math.min(4, c.length))]
  }

  // 2) 로컬에 없으면 Wiktionary에서 실제 단어 탐색(플레이어와 동일한 사전 활용)
  const pickOnline = async (ch) => {
    const lists = await Promise.all(allowedStarts(ch).map((s) => fetchWordsByPrefix(s)))
    const cands = [...new Set(lists.flat())].filter((w) => !used.has(w))
    if (!cands.length) return null
    // 명사 성격 우선(용언 '~다' 제외), 없으면 전체에서 선택
    const preferred = cands.filter((w) => !w.endsWith('다'))
    const pool = preferred.length ? preferred : cands
    return pool[Math.floor(Math.random() * pool.length)]
  }

  const pushWord = (word, by) => {
    chain.value = [...chain.value, { word, by }]
    used.add(word)
  }

  const computerTurn = async () => {
    turn.value = 'computer'
    // 로컬 우선 → 없으면 온라인 사전 탐색
    let pick = pickLocal(lastChar.value)
    let viaOnline = false
    if (!pick) {
      computerThinking.value = true
      try {
        pick = await pickOnline(lastChar.value)
      } catch {
        pick = null
      }
      computerThinking.value = false
      viaOnline = true
    }
    if (status.value !== 'playing') return
    if (!pick) {
      message.value = '컴퓨터가 더 이상 이을 단어가 없습니다!'
      play('win')
      endGame('win')
      return
    }
    const apply = () => {
      if (status.value !== 'playing') return
      pushWord(pick, 'computer')
      turn.value = 'player'
      startTimer()
    }
    // 온라인 탐색은 이미 지연이 있으므로 즉시, 로컬은 자연스러운 '생각' 딜레이
    if (viaOnline) apply()
    else setTimeout(apply, 650)
  }

  // ---- 형식/규칙 검증 (사전 존재 여부는 별도) ----
  const validateFormat = (raw) => {
    const word = String(raw || '').trim()
    if (word.length < 2) return { ok: false, reason: '두 글자 이상 입력하세요.' }
    if (![...word].every((c) => isHangulSyllable(c)))
      return { ok: false, reason: '한글 단어만 가능합니다.' }
    if (used.has(word)) return { ok: false, reason: '이미 사용한 단어입니다.' }
    if (chain.value.length && !starts.value.includes(firstSyllable(word)))
      return { ok: false, reason: `'${starts.value.join(' 또는 ')}'(으)로 시작해야 합니다.` }
    return { ok: true, word }
  }

  // ---- 액션 ----
  const start = (diff = 'normal') => {
    stopTimer()
    difficulty.value = diff
    chain.value = []
    used.clear()
    score.value = 0
    combo.value = 0
    maxCombo.value = 0
    hintWord.value = ''
    hintsUsed.value = 0
    result.value = null
    message.value = ''
    checking.value = false
    status.value = 'playing'
    const openers = DICT.filter((w) => w.length <= 3 && candidatesFor(lastSyllable(w)).length > 0)
    const opener = openers[Math.floor(Math.random() * openers.length)] || DICT[0]
    pushWord(opener, 'computer')
    turn.value = 'player'
    startTimer()
  }

  // 비동기: 로컬 사전에 없으면 온라인(Wiktionary) 검증
  const submit = async (raw) => {
    if (status.value !== 'playing' || turn.value !== 'player' || checking.value) return { ok: false }
    const v = validateFormat(raw)
    if (!v.ok) {
      message.value = v.reason
      combo.value = 0
      play('fail')
      return v
    }

    // 사전 확인 (확인 동안 타이머 정지 → 네트워크 지연이 시간을 깎지 않도록)
    if (!DICT_SET.has(v.word)) {
      stopTimer()
      checking.value = true
      const real = await verifyKoreanWord(v.word)
      checking.value = false
      if (status.value !== 'playing') return { ok: false }
      if (real === false) {
        message.value = '사전에 없는 단어입니다.'
        combo.value = 0
        play('fail')
        startTimer()
        return { ok: false, reason: 'not-found' }
      }
      if (real === 'unknown') {
        message.value = '사전 확인에 실패했어요. 다시 시도해 주세요.'
        startTimer()
        return { ok: false, reason: 'network' }
      }
      // real === true → 실제 단어로 인정
    }

    // 정답 처리 (기본 10 + 길이 보너스 + 콤보 보너스)
    stopTimer()
    combo.value += 1
    if (combo.value > maxCombo.value) maxCombo.value = combo.value
    hintWord.value = ''
    const gain = 10 + (v.word.length - 2) * 5 + combo.value * 2
    score.value += gain
    message.value = ''
    play('ok')
    pushWord(v.word, 'player')
    computerTurn()
    return { ok: true, gain }
  }

  // ---- 힌트: 로컬 사전에서 이을 수 있는 단어 1개 (점수 -5) ----
  const HINT_COST = 5
  const hint = () => {
    if (status.value !== 'playing' || turn.value !== 'player' || checking.value) return
    const c = candidatesFor(lastChar.value)
    if (!c.length) {
      message.value = '힌트: 이을 만한 단어를 못 찾았어요.'
      return
    }
    const word = c[Math.floor(Math.random() * c.length)]
    hintWord.value = word
    hintsUsed.value += 1
    score.value = Math.max(0, score.value - HINT_COST)
    play('hint')
  }

  const endGame = (res) => {
    status.value = 'ended'
    result.value = res
    turn.value = 'player'
    checking.value = false
    hintWord.value = ''
    stopTimer()
    gameStore.record({
      won: res === 'win',
      score: score.value,
      chainLength: chain.value.length,
      maxCombo: maxCombo.value,
    })
  }

  const surrender = () => {
    if (status.value === 'playing') {
      message.value = '기권했습니다.'
      play('lose')
      endGame('lose')
    }
  }

  onUnmounted(stopTimer)

  return {
    chain, status, result, turn, checking, computerThinking, score, combo, maxCombo,
    difficulty, timeLeft, message,
    soundOn, hintWord, hintsUsed,
    lastWord, lastChar, starts, timeRatio, chainLength,
    start, submit, surrender, hint, toggleSound,
  }
}
