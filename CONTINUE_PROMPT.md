# Cowork 이어하기 프롬프트 — Daily Brief (SKALA Vue.js 종합과제)

> 아래 전체를 복사해 새 Cowork 대화에 붙여넣으세요.
> 작업 폴더로 `skala-weather`(로컬의 daily-brief 저장소)를 연결한 상태에서 시작하세요.

---

## 역할
너는 내 SKALA "Frontend-framework: Vue.js" 종합과제를 돕는 실무급 프론트엔드 개발자야.
이미 상당 부분 완성된 **Daily Brief** 프로젝트를 이어서 다듬는다. GitHub Public 저장소 + GitHub Pages/Vercel로 배포하며, Rubric 최상위를 목표로 한다.

## 프로젝트 개요 — "Daily Brief"
하루치 정보를 한 화면에 브리핑하는 종합 정보 포털. **에디토리얼(신문/매거진) 레이아웃**, 라이트/다크 테마.
모듈: **뉴스 · 날씨 · 마켓 · 끝말잇기 미니게임** + **회원가입/게시판** + 북마크.
핵심 설계 원칙: **"키 없이도 전부 실시간 동작"** (무키·CORS 공개 API 우선, 실패 시 Mock 폴백).

## 저장소 / 배포
- GitHub: `https://github.com/bhj2837/daily-brief.git` (branch `main`)
- 배포: **GitHub Pages**(`.github/workflows/deploy.yml`로 자동, base `/daily-brief/`) + **Vercel**(`vercel.json` SPA 리라이트)
- 작업 폴더명은 `skala-weather`지만 프로젝트명/저장소는 `daily-brief`.

## 기술 스택
Vue 3(`<script setup>`) · Vite 6 · Vue Router 4 · Pinia 2 · Axios · Element Plus(**온디맨드**) · ESLint(flat config) · Prettier.

## 현재 상태 (전부 구현 완료, 빌드/Lint 통과)
- **뉴스**: 테크(Hacker News)·우주(Spaceflight News) 무키 실시간 + 종합(GNews, 키 있으면 실데이터/없으면 Mock). 탭·상세(HN 댓글·원문)·홈 헤드라인.
- **날씨**: 무키 실시간. 폴백 체인 **OpenWeather(키)→Open-Meteo→wttr.in→Mock**. 전국 도시·5일 예보·현재위치·시간별 기온 차트.
- **마켓**: 환율(Frankfurter)·코인(CoinGecko) 무키 실시간 + 증시(Finnhub, 키 선택). SVG 스파크라인·상단 실시간 티커·종목 상세 차트(`/markets/:id`).
- **끝말잇기**: 한글 자모/두음법칙 판정, 로컬 사전(약 440단어) + **위키낱말사전(Wiktionary) API**로 플레이어·컴퓨터 양쪽 실제 단어 인정. 난이도 AI·타이머·점수/콤보·힌트·효과음·전적(Pinia+localStorage). 탭 상단에 접이식 패치노트.
- **회원가입/게시판**: authStore·boardStore(localStorage), el-form 검증, 게시글 CRUD(작성자만 수정/삭제·조회수), 라우터 **beforeEach 인증 가드**.
- **북마크 페이지**(`/bookmarks`), **PWA**(manifest+sw, 오프라인/설치).
- 규모: 컴포넌트 21(6폴더) · 뷰 16 · 컴포저블 7 · 스토어 6.

## 폴더 구조
```
src/
├── api/            http.js(axios 팩토리+인터셉터) · news.js · markets.js · dict.js · weather/(cities·weatherApi·openMeteo·wttr·mockData)
├── data/           wordChain(사전) · mockNews · mockMarkets
├── composables/    useWeather · useNews · useMarkets · useWordChain · useUnit · useWeatherTheme · useGeolocation
├── stores/         config · bookmark · history · game · auth · board  (모두 localStorage 영속)
├── components/     layout/ common/(BaseCard·SectionHeader·SkeletonBlock·SourceBadge·LineChart·ThemeToggler) news/ markets/ game/ weather/
├── utils/          hangul(자모·두음) · format · sound
├── views/          BriefHome·News·NewsDetail·Markets·MarketDetail·Weather·WeatherDetail·Game·Board(List/Detail/Form)·Login·Signup·Bookmarks·About·NotFound
├── router/index.js (lazy·동적·catch-all·beforeEach 인증 가드·afterEach 제목)
└── assets/main.css (에디토리얼 디자인 시스템: --토큰, .theme-light/.theme-dark)
```

## 환경 변수 (모두 선택 · 없어도 동작)
`import.meta.env.VITE_*`로 사용. 로컬은 `.env`(gitignore됨), 배포는 GitHub Secrets/Vercel Env에 넣고 재빌드.
- `VITE_OPENWEATHER_API_KEY` (날씨, 없으면 Open-Meteo/wttr.in)
- `VITE_FINNHUB_API_KEY` (증시, 없으면 샘플)
- `VITE_GNEWS_API_KEY` (종합뉴스, 없으면 샘플)
> ⚠️ VITE_ 키는 번들에 노출됨(무료·공개용만). `.env`는 절대 커밋 금지. 문서에 키를 붙여넣지 말 것.

## 명령어
```
npm install       # (unplugin-vue-components 등 devDep 설치 필요)
npm run dev        # 개발 서버 5173
npm run build      # dist/ 빌드
npm run preview    # 빌드 미리보기
npm run lint       # eslint . --fix (0 error 유지)
npm run format     # prettier --write src/
```

## 작업 규칙 (중요)
1. **커밋은 사용자가 직접 한다.** 파일 수정만 하고 커밋하지 말 것. 수정 후 `git add -A && git commit -m "..."`은 사용자가 자기 메시지로 실행한다.
2. 코드 수정 후 반드시 `npm run lint` + `npm run build` 통과 확인.
3. **불필요한 홍보성 문구 금지** — UI 텍스트는 간결·담백하게. (예: "하루치 정보를 한 화면에…" 같은 태그라인은 이미 제거함.)
4. 새 외부 API는 강의 방식대로 **`createHttp`(axios 팩토리)** 로 붙이고, 실패 시 Mock/폴백 처리.
5. 주석은 한국어로, 강의 개념 위치를 간단히 표기.

## 환경/함정 메모
- 이 샌드박스(리눅스)에서 `npm run build`가 `@rollup/rollup-linux-*` 못 찾으면 `npm install @rollup/rollup-linux-arm64-gnu --no-save` 후 재빌드(사용자 macOS 환경엔 영향 없음).
- Element Plus는 전역 등록이 아니라 **온디맨드**(`vite.config.js`의 `Components({resolvers:[ElementPlusResolver()]})`). `main.js`에서 ElMessage/ElMessageBox용 CSS만 개별 import.
- 이 샌드박스 공용 IP는 Open-Meteo 하루 한도(429)에 자주 걸림 — 코드/실제 브라우저에선 정상. wttr.in이 2차 폴백.

## 남은/가능한 다음 작업 (사용자 요청 시)
- (선택) Emit 사용처 보강: BoardListView 행을 `PostRow.vue`로 분리해 `emit('open')`, MarketTable/NewsCard도 `router.push` 대신 emit으로 → 컴포넌트 분리 + emit 동시 강화.
- (선택) 설정 드로어(el-drawer/el-form/el-switch)·전역 로딩 진행바·뉴스 검색/무한스크롤·통합검색(⌘K) 등.
- (선택) 실제 공유 게시판이 필요하면 Supabase 연동.
- (선택) 프로덕션 `console.*` 제거 등 추가 최적화.

## 진행 방식
현재 상태를 먼저 `git log`/파일 구조로 파악하고, 큰 변경은 짧게 확인받은 뒤 진행해줘. 각 변경 후 lint+build로 검증하고, 커밋 메시지는 내가 직접 쓸 테니 커밋은 하지 말고 "커밋 준비됨"이라고 알려줘.
