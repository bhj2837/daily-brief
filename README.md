# 📰 Daily Brief

하루치 정보를 한 화면에 브리핑하는 **종합 정보 포털**.
뉴스를 중심으로 날씨·마켓 정보 모듈을 얹고, 쉬어가는 **끝말잇기 미니게임**까지 담았습니다.
읽기 좋은 **에디토리얼(신문/매거진) 레이아웃** + 라이트/다크 테마.

> SK AX SKALA `Frontend-framework: Vue.js` 종합과제 프로젝트.
> 기존 `skala-weather`(몰입형 날씨앱)를 `/weather` 모듈로 재활용해 확장했습니다.

---

## 🚀 실행 방법

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사/자동수정
npm run format   # Prettier 포맷팅
```

**API 키 없이도 전체 기능이 동작합니다.** 키가 없으면 자동으로 Mock 데이터로 폴백합니다.
실데이터를 쓰려면 `.env.example`을 복사해 `.env`를 만들고 키를 채우세요.

```bash
cp .env.example .env
```

| 변수 | 용도 | 필요 여부 |
|---|---|---|
| `VITE_OPENWEATHER_API_KEY` | 날씨 | 선택 (없으면 **Open-Meteo로 실시간**) |
| `VITE_FINNHUB_API_KEY` | 증시 | 선택 (넣으면 실시간, 없으면 샘플) |
| `VITE_GNEWS_API_KEY` | 한국 종합뉴스 | 선택 (넣으면 실시간, 없으면 샘플) |

키가 필요 없는 API(날씨 **Open-Meteo**, 환율 Frankfurter, 코인 CoinGecko, 테크뉴스 Hacker News, 우주뉴스 Spaceflight News, 단어검증 Wiktionary)는 배포 후에도 항상 실데이터로 동작합니다. 증시(Finnhub)·종합뉴스(GNews)는 **키를 넣으면 자동으로 실시간으로 전환**되고, 없으면 샘플로 동작합니다.

> 키 발급·등록 방법은 **[API_KEYS.md](./API_KEYS.md)** 에 단계별로 정리했습니다.

---

## 🧭 라우팅

| 경로 | 화면 | 강의 개념 |
|---|---|---|
| `/` | 오늘의 브리핑 (홈) | Lazy Loading |
| `/news` | 뉴스 목록 | Lazy Loading |
| `/news/:id` | 기사 상세 | 동적 라우트 |
| `/markets` | 마켓 (환율·코인·증시) | Lazy Loading |
| `/markets/:id` | 종목 상세 (차트) | 동적 라우트 |
| `/weather` | 날씨 (기존 재활용) | Lazy Loading |
| `/weather/:cityId` | 날씨 상세 (시간별 차트) | 동적 라우트 |
| `/game` | 끝말잇기 미니게임 | Lazy Loading |
| `/bookmarks` | 북마크 모아보기 | Lazy Loading |
| `/about` | 소개 | 정적 라우트 |
| `/:pathMatch(.*)*` | 404 | Catch-all |

라우터: **Lazy Loading + 동적 경로 + Catch-all + afterEach 가드(문서 제목)** 적용.

---

## 🗂 폴더 구조

```
src/
├── api/
│   ├── http.js              # 공통 Axios 팩토리
│   ├── news.js              # Hacker News · Spaceflight News · 종합(Mock)
│   ├── markets.js           # Frankfurter · CoinGecko · 증시(Mock)
│   ├── dict.js              # 끝말잇기 단어 검증 (Wiktionary)
│   └── weather/             # cities · weatherApi · openMeteo(무키 실시간) · mockData
├── data/                    # wordChain(사전) · mockNews · mockMarkets
├── composables/             # useWeather · useNews · useMarkets · useWordChain · useUnit · useWeatherTheme · useGeolocation
├── stores/                  # configStore · bookmarkStore · historyStore · gameStore
├── components/
│   ├── layout/              # AppNavBar · TickerBar · AppFooter
│   ├── common/              # BaseCard · SectionHeader · SkeletonBlock · ThemeToggler · SourceBadge · LineChart
│   ├── news/                # NewsCard · HeadlineItem
│   ├── markets/             # MarketTable · Sparkline
│   ├── game/                # ChainList · TurnTimer
│   └── weather/             # WeatherCard · ForecastStrip · SearchBar · SearchHistory · UnitToggler · FavoriteButton
├── utils/                   # hangul(자모·두음) · format · sound
├── views/                   # BriefHome · News · NewsDetail · Markets · MarketDetail
│                            # Weather · WeatherDetail · Game · Bookmarks · About · NotFound
├── router/index.js
└── assets/main.css          # 에디토리얼 디자인 시스템(토큰/타이포/카드/그리드)
```

PWA: `public/manifest.webmanifest` · `public/sw.js` · `public/icons/*` (설치·오프라인 지원)

---

## 🧩 강의 개념 매핑 (Rubric 대응)

| 강의 단원 | 적용 위치 |
|---|---|
| 2. Vue 문법 (v-for/v-if/v-model/이벤트) | 목록 렌더링, 조건부 UI, 검색 입력 |
| 3. Composition API (ref/computed/watch) | 전 컴포넌트 `<script setup>` |
| 4. Component (props/emit/slot/lifecycle) | BaseCard(slot) · WeatherCard(props/emit) |
| 5. Vue Router (동적/lazy/catch-all/guard) | `router/index.js` |
| 6. Pinia (state/getters/actions + localStorage) | config · bookmark · history 스토어 |
| 7. Axios (다중 API 연동) | http 팩토리 · weatherApi |
| 8. UI 라이브러리 | Element Plus (autocomplete/button/skeleton/message) |
| 9. Modern JS (Promise) | Geolocation · 병렬 fetch(Promise.all) |
| 10. Vite/ESLint/Prettier/env | 빌드 설정 · `.env` · lint/format |
| 심화(강의 범위 제외) | Composable 리팩터링 · Mock 폴백 · 일반화 북마크 스토어 · 한글 자모/두음 엔진 · SVG 스파크라인 |

---

## ✅ 진행 상태

- [x] **뼈대** — 라우터 · 에디토리얼 디자인 시스템 · 레이아웃 셸(마스트헤드/티커/푸터) · 날씨 모듈 이식 · 홈 브리핑 화면
- [x] **뉴스 모듈** — 테크(Hacker News) · 우주(Spaceflight News) 실데이터 + 종합(Mock) 탭, 기사 상세(HN 댓글·원문 링크), 홈 헤드라인 실연결
- [x] **마켓 모듈** — 환율(Frankfurter) · 암호화폐(CoinGecko) 실데이터 + 증시(Mock), SVG 스파크라인, 상단 실시간 티커 · 홈 마켓 요약 실연결
- [x] **끝말잇기 미니게임** — 한글 자모 분해 · 두음법칙(려→여/락→낙) · 로컬 사전 442단어 + 온라인 사전(Wiktionary) 검증 · 난이도별 컴퓨터 AI · 타이머/점수/콤보 · 힌트 · 효과음 · Pinia 전적 영속
- [x] **날씨 무키 실시간** — Open-Meteo 연동으로 키 없이도 실데이터(OpenWeather 키 있으면 우선), 실패 시 Mock 폴백
- [x] **추가 기능** — 북마크 모아보기(/bookmarks) · 날씨 시간별 기온 차트 · 마켓 종목 상세 차트(/markets/:id) · **PWA(설치·오프라인)**

**전체 완성.** `npm run build` 통과 · `npx eslint src` 0 error.

---

## 🛠 기술 스택

Vue 3 · Vite 6 · Vue Router 4 · Pinia 2 · Axios · Element Plus
