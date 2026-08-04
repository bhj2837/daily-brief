// ===== 끝말잇기 전적 Store =====
// 최고 점수 / 승·패 / 최장 체인을 localStorage에 영속화 (강의 6장 Pinia + 영속).
import { defineStore } from 'pinia'

const LS_KEY = 'daily-brief-game'

export const useGameStore = defineStore('game', {
  state: () => ({
    best: 0, // 최고 점수
    wins: 0,
    losses: 0,
    longest: 0, // 최장 체인 길이
    bestCombo: 0, // 최고 연속 기록
  }),
  getters: {
    games: (s) => s.wins + s.losses,
    winRate: (s) => {
      const g = s.wins + s.losses
      return g ? Math.round((s.wins / g) * 100) : 0
    },
  },
  actions: {
    record({ won, score, chainLength, maxCombo = 0 }) {
      if (won) this.wins += 1
      else this.losses += 1
      if (score > this.best) this.best = score
      if (chainLength > this.longest) this.longest = chainLength
      if (maxCombo > this.bestCombo) this.bestCombo = maxCombo
      this.persist()
    },
    reset() {
      this.best = 0
      this.wins = 0
      this.losses = 0
      this.longest = 0
      this.bestCombo = 0
      this.persist()
    },
    persist() {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          best: this.best,
          wins: this.wins,
          losses: this.losses,
          longest: this.longest,
          bestCombo: this.bestCombo,
        }),
      )
    },
    init() {
      try {
        const s = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
        this.best = s.best || 0
        this.wins = s.wins || 0
        this.losses = s.losses || 0
        this.longest = s.longest || 0
        this.bestCombo = s.bestCombo || 0
      } catch {
        /* 무시 */
      }
    },
  },
})
