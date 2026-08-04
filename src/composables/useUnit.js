// ===== 온도 단위 변환 Composable =====
// 강의 p191에서 "메인/상세에 중복되는 단위 변환 코드는 Composable로 해결 가능(범위 제외)"
// 이라고 남긴 부분을 실제로 구현한 심화 항목.

import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/configStore'

export function useUnit() {
  const configStore = useConfigStore()
  const { unit, unitSymbol } = storeToRefs(configStore)

  // 원본(섭씨 숫자) → 현재 단위 값
  const convert = (celsius) => {
    if (celsius == null || Number.isNaN(celsius)) return '--'
    if (unit.value === 'fahrenheit') return Math.round((celsius * 9) / 5 + 32)
    return Math.round(celsius)
  }

  // 값 + 기호 한 번에
  const format = (celsius) => `${convert(celsius)}${unitSymbol.value}`

  return { unit, unitSymbol, convert, format, toggle: configStore.toggleUnit }
}
