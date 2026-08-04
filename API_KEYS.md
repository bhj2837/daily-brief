# API 키 발급 & 등록 가이드

이 프로젝트는 **키가 없어도 전부 동작**합니다(무키 API는 실시간, 나머지는 샘플).
아래 키를 넣으면 **샘플로 표시되던 항목이 실시간으로 바뀝니다.** 넣고 싶은 것만 골라 넣으면 됩니다.

| 항목 | 키 변수 | 안 넣으면 | 넣으면 |
|---|---|---|---|
| 증시 | `VITE_FINNHUB_API_KEY` | 샘플 지수 | Finnhub 실시간 |
| 종합뉴스 | `VITE_GNEWS_API_KEY` | 샘플 기사 | GNews 한국 헤드라인 |
| 날씨(선택) | `VITE_OPENWEATHER_API_KEY` | **이미 Open-Meteo로 실시간** | OpenWeather 우선 사용 |

> 뉴스(테크·우주)·환율·코인·날씨는 키 없이도 이미 실시간이라, 굳이 안 넣어도 됩니다.

---

## 1단계 — 키 받기 (무료)

### Finnhub (증시)
1. https://finnhub.io 접속 → 우측 상단 **Get free API key** (또는 Sign up)
2. 이메일·비밀번호로 가입 → 로그인
3. 대시보드 첫 화면의 **API Key** 칸에 있는 문자열을 복사
   (예: `cq1a2b3c4d5e6f7g8h9i0`)

> 무료플랜은 미국 상장 종목/ETF가 잘 됩니다. 그래서 이 앱은 S&P500(SPY)·나스닥(QQQ)·다우(DIA)·한국(EWY) ETF로 주요 지수를 표시합니다.

### GNews (종합뉴스)
1. https://gnews.io 접속 → **Sign up** (무료: 하루 100회)
2. 가입·로그인 후 대시보드의 **API key** 복사

### OpenWeather (선택 — 안 넣어도 날씨 실시간)
1. https://openweathermap.org/api 접속 → 가입·로그인
2. 프로필 → **My API keys** 에서 키 복사
3. 신규 키는 **활성화까지 최대 2시간** 걸릴 수 있습니다.

---

## 2단계 — 어디에 넣나

### A. 내 컴퓨터에서 테스트 (로컬)

프로젝트 폴더(= `package.json`이 있는 곳)에 **`.env`** 파일을 만들고 아래처럼 붙여넣습니다.
(`.env.example`을 복사해서 값만 채워도 됩니다.)

```bash
# 프로젝트 폴더에서
cp .env.example .env
```

`.env` 내용 예시 (등호 뒤에 **따옴표 없이** 키만):

```
VITE_FINNHUB_API_KEY=여기에_Finnhub_키
VITE_GNEWS_API_KEY=여기에_GNews_키
VITE_OPENWEATHER_API_KEY=
```

저장한 뒤 **개발 서버를 껐다 다시 켭니다** (값은 시작할 때 읽힘).

```bash
npm run dev
```

> ⚠️ 변수 이름은 반드시 `VITE_`로 시작해야 합니다. `.env`는 `.gitignore`에 있어 GitHub에는 올라가지 않습니다.

### B. Vercel 배포에 넣기

1. Vercel 대시보드 → 해당 프로젝트 → **Settings → Environment Variables**
2. 아래를 하나씩 추가 (**Key** = 변수 이름, **Value** = 복사한 키)
   - `VITE_FINNHUB_API_KEY`
   - `VITE_GNEWS_API_KEY`
   - (선택) `VITE_OPENWEATHER_API_KEY`
3. 적용 범위(Environment)는 **Production / Preview / Development** 모두 체크
4. 저장 후 **Deployments 탭 → 최신 배포 우측 ⋯ → Redeploy** (환경변수는 새 빌드부터 적용됨)

---

## 3단계 — 잘 됐는지 확인

- 마켓 페이지의 **증시** 카드, 뉴스의 **종합** 탭 배지가 **"실시간"** 으로 바뀌면 성공입니다.
- 아직 **"샘플"** 이면: 키 오타, `VITE_` 접두사 누락, 서버 미재시작(로컬) 또는 Redeploy 안 함(Vercel) 중 하나입니다.
- 키가 틀렸거나 한도를 넘겨도 앱은 **자동으로 샘플로 폴백**하므로 화면이 깨지지 않습니다.

---

## ⚠️ 보안 한 줄 요약

프론트엔드(SPA) 특성상 `VITE_` 키는 **브라우저에 노출**됩니다(누구나 개발자도구로 볼 수 있음).
그래서 여기서는 **무료·공개용 키만** 사용하세요. 발급처에서 가능하면 **사용 도메인 제한**을 걸어두는 걸 권장합니다.
정말 감춰야 하는 유료 키라면 서버리스 함수(프록시)로 감싸야 합니다.
