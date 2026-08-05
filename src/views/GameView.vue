<script setup>
// ===== 끝말잇기 미니게임 =====
// 로컬 사전 + 두음법칙 + 컴퓨터 AI. 백엔드 없이 동작.
// 강의 2~4장(v-model/이벤트/조건부 렌더), 6장(Pinia 전적), 심화(Composable 엔진).
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useWordChain } from '@/composables/useWordChain'
import { useGameStore } from '@/stores/gameStore'
import SectionHeader from '@/components/common/SectionHeader.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import TurnTimer from '@/components/game/TurnTimer.vue'
import ChainList from '@/components/game/ChainList.vue'

const gameStore = useGameStore()
const { best, wins, losses, longest, bestCombo, winRate } = storeToRefs(gameStore)

const useHint = () => {
  hint()
  focusInput()
}

const {
  chain, status, result, turn, checking, computerThinking, score, combo, difficulty, timeLeft, message,
  soundOn, hintWord, hintsUsed,
  lastChar, starts, timeRatio, chainLength, start, submit, surrender, hint, toggleSound,
} = useWordChain()

const input = ref('')
const inputEl = ref(null)
const selectedDiff = ref('normal')

const DIFFS = [
  { key: 'easy', label: '쉬움', desc: '무작위 응답' },
  { key: 'normal', label: '보통', desc: '길게 이어감' },
  { key: 'hard', label: '어려움', desc: '끊기 노림수' },
]

// 끝말잇기 변경 이력
const patchNotes = [
  {
    v: 'v1.0 · 기본',
    items: ['한글 자모 분해 기반 두음법칙(려→여·락→낙) 판정', '엄선한 명사 로컬 사전 + 난이도별 컴퓨터 AI', '12초 타이머 · 점수/콤보 · 전적 localStorage 저장'],
  },
  {
    v: 'v1.1 · 편의',
    items: ['힌트 버튼(−5점) 추가', '효과음 on/off 토글', '최고 콤보 기록 추가'],
  },
  {
    v: 'v1.2 · 사전 API',
    items: ['로컬 사전에 없어도 위키낱말사전(Wiktionary) API로 실제 존재 여부를 확인해 인정', '확인 중에는 타이머를 멈춰 네트워크 지연으로 손해 없게 처리'],
  },
  {
    v: 'v1.3 · 공정성',
    items: ['컴퓨터도 로컬 사전이 막히면 위키낱말사전에서 실제 단어를 탐색해 이어감', '이제 실제로 이을 단어가 없을 때만 컴퓨터가 패배'],
  },
]

const isPlaying = computed(() => status.value === 'playing')
const startsHint = computed(() => starts.value.join(' / '))

const onStart = () => {
  start(selectedDiff.value)
  input.value = ''
  focusInput()
}

const onSubmit = async () => {
  if (!isPlaying.value || turn.value !== 'player' || checking.value) return
  const res = await submit(input.value)
  if (res.ok) {
    input.value = ''
  } else if (res.reason) {
    ElMessage.warning(message.value || '다시 시도하세요.')
  }
  focusInput()
}

const focusInput = () => nextTick(() => inputEl.value?.focus?.())

// 컴퓨터가 응답해 다시 내 차례가 되면 입력에 포커스
watch(turn, (t) => {
  if (t === 'player' && isPlaying.value) focusInput()
})

onMounted(() => gameStore.init())
</script>

<template>
  <div class="game">
    <SectionHeader kicker="Game" title="끝말잇기">
      <template #action>
        <div class="head-tools">
          <button class="sound" :title="soundOn ? '효과음 켜짐' : '효과음 꺼짐'" @click="toggleSound">
            {{ soundOn ? '🔊' : '🔇' }}
          </button>
          <span class="best mono">🏆 최고 {{ best }}</span>
        </div>
      </template>
    </SectionHeader>

    <details class="patch">
      <summary>패치노트</summary>
      <div class="patch-body">
        <div v-for="p in patchNotes" :key="p.v" class="patch-ver">
          <b>{{ p.v }}</b>
          <ul>
            <li v-for="(it, i) in p.items" :key="i">{{ it }}</li>
          </ul>
        </div>
      </div>
    </details>

    <div class="layout">
      <!-- 게임 보드 -->
      <BaseCard class="board">
        <!-- 시작 전 -->
        <div v-if="status === 'idle'" class="intro">
          <p class="intro-lead">
            컴퓨터가 낸 단어의 <b>마지막 글자</b>로 시작하는 단어를 이어 보세요.
            두음법칙(려→여, 락→낙)도 인정합니다.
          </p>
          <div class="diff">
            <span class="diff-label">난이도</span>
            <div class="diff-btns">
              <button
                v-for="d in DIFFS"
                :key="d.key"
                class="diff-btn"
                :class="{ on: selectedDiff === d.key }"
                @click="selectedDiff = d.key"
              >
                <b>{{ d.label }}</b><span>{{ d.desc }}</span>
              </button>
            </div>
          </div>
          <el-button type="primary" round size="large" class="start-btn" @click="onStart">
            게임 시작 ▶
          </el-button>
        </div>

        <!-- 진행 / 종료 -->
        <template v-else>
          <div class="hud">
            <div class="hud-item">
              <span class="hl">점수</span><span class="hv mono">{{ score }}</span>
            </div>
            <div class="hud-item">
              <span class="hl">콤보</span><span class="hv mono">{{ combo }}x</span>
            </div>
            <div class="hud-item">
              <span class="hl">체인</span><span class="hv mono">{{ chainLength }}</span>
            </div>
            <div class="hud-item">
              <span class="hl">난이도</span
              ><span class="hv">{{ DIFFS.find((d) => d.key === difficulty)?.label }}</span>
            </div>
          </div>

          <ChainList :chain="chain" class="chainlist" />

          <!-- 결과 -->
          <div v-if="status === 'ended'" class="result" :class="result">
            <div class="r-emoji">{{ result === 'win' ? '🎉' : '😵' }}</div>
            <h3 class="serif">{{ result === 'win' ? '승리!' : '패배' }}</h3>
            <p class="r-msg">{{ message }}</p>
            <p class="r-score mono">최종 점수 {{ score }} · {{ chainLength }} 체인</p>
            <el-button type="primary" round @click="onStart">다시 하기 ↻</el-button>
          </div>

          <!-- 입력 -->
          <div v-else class="play-zone">
            <div class="hint">
              다음 글자:
              <b class="serif">{{ startsHint }}</b>
              <span class="hint-sub">(‘{{ lastChar }}’(으)로 끝남)</span>
            </div>
            <TurnTimer :ratio="timeRatio" :seconds="timeLeft" :active="turn === 'player' && !checking" />
            <div class="input-row">
              <el-input
                ref="inputEl"
                v-model="input"
                :disabled="turn !== 'player' || checking"
                :placeholder="
                  checking
                    ? '사전에서 단어 확인 중…'
                    : computerThinking
                      ? '컴퓨터가 사전에서 단어 찾는 중…'
                      : turn === 'player'
                        ? `${startsHint}(으)로 시작하는 단어`
                        : '컴퓨터가 생각 중…'
                "
                size="large"
                clearable
                @keyup.enter="onSubmit"
              />
              <el-button
                type="primary"
                size="large"
                :loading="checking"
                :disabled="turn !== 'player' || !input.trim() || checking"
                @click="onSubmit"
              >
                {{ checking ? '확인 중' : '제출' }}
              </el-button>
            </div>
            <p v-if="checking" class="checking-note">🔎 로컬 사전에 없어 온라인 사전으로 확인하고 있어요…</p>
            <p v-if="hintWord" class="hint-word">
              💡 예시: <b class="serif">{{ hintWord }}</b>
            </p>
            <div class="play-tools">
              <button class="ghost" :disabled="turn !== 'player' || checking" @click="useHint">
                💡 힌트 (-5점{{ hintsUsed ? ` · ${hintsUsed}회` : '' }})
              </button>
              <button class="surrender" :disabled="checking || computerThinking" @click="surrender">기권하기</button>
            </div>
          </div>
        </template>
      </BaseCard>

      <!-- 사이드바: 전적 + 규칙 -->
      <aside class="side">
        <BaseCard kicker="Stats" title="전적">
          <div class="stats">
            <div class="stat"><span class="s-v mono">{{ best }}</span><span class="s-l">최고 점수</span></div>
            <div class="stat"><span class="s-v mono">{{ winRate }}%</span><span class="s-l">승률</span></div>
            <div class="stat"><span class="s-v mono">{{ wins }}</span><span class="s-l">승</span></div>
            <div class="stat"><span class="s-v mono">{{ losses }}</span><span class="s-l">패</span></div>
            <div class="stat"><span class="s-v mono">{{ longest }}</span><span class="s-l">최장 체인</span></div>
            <div class="stat"><span class="s-v mono">{{ bestCombo }}x</span><span class="s-l">최고 콤보</span></div>
          </div>
          <button v-if="wins + losses > 0" class="reset" @click="gameStore.reset()">전적 초기화</button>
        </BaseCard>

        <BaseCard kicker="Rules" title="규칙">
          <ul class="rules">
            <li>사전에 있는 <b>2글자 이상 명사</b>만 인정</li>
            <li>이전 단어의 <b>마지막 글자</b>로 시작</li>
            <li><b>두음법칙</b> 허용 (례→예, 락→낙, 녀→여)</li>
            <li>이미 쓴 단어는 <b>재사용 불가</b></li>
            <li>제한시간 <b>12초</b> · 못 이으면 패배</li>
            <li>컴퓨터가 못 이으면 <b>승리</b></li>
          </ul>
        </BaseCard>
      </aside>
    </div>

    <p class="dict-note">
      입력한 단어가 로컬 사전(엄선한 명사 약 440개)에 없으면
      <a href="https://ko.wiktionary.org" target="_blank" rel="noopener noreferrer">위키낱말사전</a>
      API로 실제 존재 여부를 확인해 인정합니다. 한글 자모 분해로 두음법칙까지 검증합니다.
    </p>
  </div>
</template>

<style scoped>
.game {
  display: grid;
  gap: 6px;
}
.dict-note {
  margin-top: 16px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ink-mute);
  text-align: center;
}
.dict-note a {
  color: var(--ink-sub);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.dict-note a:hover {
  color: var(--accent);
}
.patch {
  margin: 2px 0 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}
.patch > summary {
  cursor: pointer;
  list-style: none;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-sub);
}
.patch > summary::-webkit-details-marker {
  display: none;
}
.patch > summary::before {
  content: '▸';
  margin-right: 8px;
  color: var(--ink-mute);
}
.patch[open] > summary::before {
  content: '▾';
}
.patch-body {
  padding: 4px 16px 14px;
  display: grid;
  gap: 12px;
}
.patch-ver b {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--ink);
}
.patch-ver ul {
  margin: 5px 0 0;
  padding-left: 16px;
}
.patch-ver li {
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--ink-sub);
}
.head-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sound {
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 999px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
}
.sound:hover {
  border-color: var(--border-strong);
}
.best {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-sub);
}
.hint-word {
  font-size: 14px;
  color: var(--ink-sub);
}
.hint-word b {
  font-size: 17px;
  color: var(--accent);
  margin-left: 4px;
}
.play-tools {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ghost {
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--ink-sub);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
.ghost:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.ghost:disabled {
  opacity: 0.5;
  cursor: default;
}
.layout {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 22px;
  align-items: start;
}

/* 인트로 */
.intro {
  display: grid;
  gap: 20px;
  place-items: center;
  text-align: center;
  padding: 20px 10px;
}
.intro-lead {
  color: var(--ink-sub);
  line-height: 1.7;
  max-width: 440px;
}
.intro-lead b {
  color: var(--ink);
}
.diff {
  display: grid;
  gap: 10px;
  justify-items: center;
}
.diff-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
.diff-btns {
  display: flex;
  gap: 8px;
}
.diff-btn {
  display: grid;
  gap: 2px;
  padding: 10px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.diff-btn b {
  font-size: 14px;
  font-weight: 800;
}
.diff-btn span {
  font-size: 11px;
  color: var(--ink-mute);
}
.diff-btn.on {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.start-btn {
  min-width: 200px;
}

/* HUD */
.hud {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 18px;
}
.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 4px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.hud-item .hl {
  font-size: 11px;
  color: var(--ink-mute);
  font-weight: 700;
}
.hud-item .hv {
  font-size: 20px;
  font-weight: 800;
}

.chainlist {
  margin-bottom: 18px;
}

/* 결과 */
.result {
  text-align: center;
  display: grid;
  gap: 8px;
  place-items: center;
  padding: 22px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.result.win {
  background: color-mix(in srgb, var(--up) 10%, var(--surface));
  border-color: color-mix(in srgb, var(--up) 30%, var(--border));
}
.result.lose {
  background: color-mix(in srgb, var(--down) 8%, var(--surface));
  border-color: color-mix(in srgb, var(--down) 26%, var(--border));
}
.r-emoji {
  font-size: 46px;
}
.result h3 {
  font-size: 24px;
  font-weight: 900;
}
.r-msg {
  color: var(--ink-sub);
  font-size: 14px;
}
.r-score {
  font-size: 13px;
  color: var(--ink-mute);
  margin-bottom: 8px;
}

/* 입력 */
.play-zone {
  display: grid;
  gap: 12px;
}
.hint {
  font-size: 14px;
  color: var(--ink-sub);
}
.hint b {
  font-size: 18px;
  color: var(--accent);
  margin: 0 4px;
}
.hint-sub {
  font-size: 12px;
  color: var(--ink-mute);
}
.input-row {
  display: flex;
  gap: 10px;
}
.input-row .el-input {
  flex: 1;
}
.checking-note {
  font-size: 12.5px;
  color: var(--ink-sub);
}
.surrender {
  justify-self: start;
  border: 0;
  background: transparent;
  color: var(--ink-mute);
  font-size: 12.5px;
  cursor: pointer;
}
.surrender:disabled {
  opacity: 0.5;
  cursor: default;
}
.surrender:hover {
  color: var(--down);
}

/* 사이드바 */
.side {
  display: grid;
  gap: 18px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.s-v {
  font-size: 22px;
  font-weight: 800;
}
.s-l {
  font-size: 11.5px;
  color: var(--ink-mute);
  font-weight: 600;
}
.reset {
  margin-top: 12px;
  border: 0;
  background: transparent;
  color: var(--ink-mute);
  font-size: 12px;
  cursor: pointer;
}
.reset:hover {
  color: var(--down);
}
.rules {
  list-style: none;
  display: grid;
  gap: 9px;
}
.rules li {
  font-size: 13.5px;
  color: var(--ink-sub);
  padding-left: 18px;
  position: relative;
  line-height: 1.5;
}
.rules li::before {
  content: '·';
  position: absolute;
  left: 6px;
  color: var(--accent);
  font-weight: 900;
}
.rules b {
  color: var(--ink);
}

@media (max-width: 860px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
