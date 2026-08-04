# 배포 가이드 (GitHub + Vercel)

Daily Brief를 GitHub Public 저장소에 올리고 Vercel로 배포하는 방법입니다.
**API 키가 없어도 모든 기능이 Mock 폴백으로 동작하므로, 키 설정 없이 바로 배포·확인할 수 있습니다.**

---

## 1. GitHub Public 저장소에 올리기

먼저 로컬에서 빌드·린트가 통과하는지 확인합니다.

```bash
npm install
npm run lint        # 0 error
npm run build       # 성공
```

`.gitignore`에 `node_modules`, `dist`, `.env`가 포함되어 있어 불필요한 파일과 비밀 키는 커밋되지 않습니다.

```bash
git init
git add .
git commit -m "feat: Daily Brief - 뉴스·날씨·마켓·끝말잇기 종합 포털"

# GitHub에서 새 Public 저장소를 만든 뒤(README 없이 빈 저장소 권장):
git branch -M main
git remote add origin https://github.com/<본인아이디>/daily-brief.git
git push -u origin main
```

> 저장소 가시성은 반드시 **Public**으로 설정하세요.

---

## 2. Vercel 배포 (권장)

### 방법 A — 대시보드(가장 쉬움)

1. https://vercel.com 에 GitHub 계정으로 로그인
2. **Add New… → Project → Import** 에서 방금 올린 저장소 선택
3. 프레임워크가 **Vite**로 자동 감지됩니다. 아래 기본값 그대로 두면 됩니다.
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Deploy** 클릭 → 잠시 후 `https://<프로젝트>.vercel.app` 주소가 생성됩니다.

`vercel.json`에 SPA 리라이트가 포함되어 있어, `/news/123` 같은 딥링크를 새로고침해도 404가 나지 않습니다.

### 방법 B — CLI

```bash
npm i -g vercel
vercel          # 최초 배포(프로젝트 연결)
vercel --prod   # 프로덕션 배포
```

---

## 3. (선택) 실데이터 키 등록

키 없이도 동작하지만, 실데이터를 쓰려면 Vercel 프로젝트의
**Settings → Environment Variables** 에 아래 값을 추가하고 재배포하세요.

| 변수 | 용도 |
|---|---|
| `VITE_OPENWEATHER_API_KEY` | 날씨 실데이터 |
| `VITE_FINNHUB_API_KEY` | 증시 실데이터(선택) |
| `VITE_GNEWS_API_KEY` | 한국 종합뉴스(선택) |

> 환율(Frankfurter)·암호화폐(CoinGecko)·테크뉴스(Hacker News)·우주뉴스(Spaceflight News)·단어검증(Wiktionary)은 키가 필요 없어 배포 후에도 항상 실데이터로 동작합니다.

---

## 4. 배포 후 체크리스트

- [ ] 시크릿 창(키 없음)에서 접속해 전 페이지가 정상 동작하는지 확인
- [ ] `/news/:id`, `/markets/:id`, `/weather/:cityId` 딥링크 새로고침 시 404가 아닌지 확인
- [ ] 라이트/다크 테마, 모바일 반응형 확인
- [ ] 끝말잇기에서 온라인 사전(Wiktionary) 검증이 동작하는지 확인
- [ ] 브라우저 주소창의 "설치"(PWA) 아이콘으로 앱 설치가 되는지 확인
