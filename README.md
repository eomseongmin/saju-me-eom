# 사주미 (saju-me)

이름·생년월일·시간·성별·양력/음력을 입력하면 Gemini API로 사주 기본차트 해석을 받아보는 React 앱입니다.

## 주요 기능

- Google / 이메일 로그인·회원가입
- `users` 프로필(이름, 생년월일, 시간, 성별, 양력/음력) 저장 후 재사용
- 첫 로그인 시 필수 정보 입력 모달
- 프로필에서 정보 수정
- Gemini 스트리밍 사주 해석
- `readings`에 풀이 저장 (`user_id` + RLS로 **내 기록만**)
- 내 사주 기록 목록 · 삭제
- `feed` 공개 한 줄 + **Realtime** 모두의 운세 피드

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. API 키 설정

프로젝트 루트 `.env` 예시:

```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

`.env.example`을 참고해도 됩니다.  
`.env`는 Git에 올리지 않습니다 (`.gitignore`에 포함).

키를 바꾼 뒤에는 **반드시 `npm run dev`를 끄고 다시** 실행하세요.

## Supabase 세팅

1. 프로젝트 `saju-me` (가능하면 Seoul)
2. **SQL Editor**에서 `supabase/schema.sql` **전체를 다시 실행**
   - `users`: 프로필
   - `readings`: 풀이 + `user_id` → `users.id` (RLS: 본인만 select/insert/delete)
   - `feed`: 공개 한 줄 (select 모두 / insert 로그인만) + Realtime publication
3. Table Editor → `feed` → **Realtime ON** 확인 (SQL로 이미 넣어도, 대시보드에서 한 번 더 확인)
4. **Authentication → Providers → Email**
   - 로컬 테스트면 **Confirm email** 끄기
5. `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`(publishable) 넣고 서버 재시작

## Google 로그인 (OAuth)

Google Cloud에서 Client ID / Secret을 만든 뒤, Supabase Google provider에 넣습니다.

1. [Google Cloud Console](https://console.cloud.google.com) → 프로젝트
2. **OAuth 동의 화면** — External, 앱 이름 `사주미`, 테스트 사용자에 본인 이메일
3. **OAuth 클라이언트 ID** (웹 애플리케이션)
   - 승인된 자바스크립트 원본:
     - `http://localhost:5173`
     - `https://saju-me-eom.vercel.app` (실제 Vercel 주소)
   - 승인된 리디렉션 URI (**Supabase Callback만**):
     - `https://dinwvdnuckxplpiyuyjz.supabase.co/auth/v1/callback`
4. Supabase → Authentication → Providers → **Google** ON + Client ID/Secret
5. Supabase → Authentication → **URL Configuration**
   - Site URL: 배포 주소 (`https://saju-me-eom.vercel.app`) 또는 로컬
   - Redirect URLs:
     - `http://localhost:5173/**`
     - `https://saju-me-eom.vercel.app/**`

`.env`의 `VITE_SUPABASE_URL`은 `https://dinwvdnuckxplpiyuyjz.supabase.co` 이어야 합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173/` 로 접속합니다.

## 8회차 검증 체크리스트

- [ ] Google로 로그인 → 이메일/세션 유지 → 로그아웃
- [ ] 사주 결과 보기 → **이 풀이 저장하기** → Table Editor `readings`에 `user_id` 채워짐
- [ ] 홈 **내 사주 기록**에 목록 표시 · 삭제 동작
- [ ] 로그아웃/다른 계정에서는 내 readings가 안 보임 (RLS)
- [ ] 저장 시 `feed`에 한 줄 추가 + 다른 탭에서 **모두의 운세**에 새로고침 없이 표시
- [ ] Vercel 배포 URL에서 로그인 → 사주 → 저장 → 피드까지 동작

피드가 안 뜨면: ① `feed` Realtime ON ② 구독 table 이름 `feed` ③ 브라우저 콘솔 에러

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | Oxlint 검사 |

## 기술 스택

- React 19 + Vite 8
- `@google/genai` (Gemini API, 스트리밍)
- `@supabase/supabase-js` (Auth · DB · Realtime)
- 순수 CSS (살구/하늘색 UI)

## 프로젝트 구조 (주요 파일)

```
src/
  App.jsx              # 홈 / 프로필 / 저장 / 기록 목록
  AuthScreen.jsx       # Google·이메일 로그인
  LiveFeed.jsx         # feed Realtime 구독 UI
  ReadingsList.jsx     # 내 readings 목록·삭제
  ProfileModal.jsx     # 첫 정보 입력 모달
  ProfilePage.jsx      # 프로필 수정
  ProfileFields.jsx    # 공통 입력 필드
  BirthDatePicker.jsx  # 생년월일 피커
  fetchSajuReading.js  # Gemini 사주 + 한 줄 요약
  SajuReading.jsx      # 해석 렌더링
  supabase.js          # Supabase 클라이언트
supabase/
  schema.sql           # users · readings · feed · RLS
```

## 참고

- API 키(`VITE_` 접두사)는 브라우저에 노출됩니다. 배포 시에는 서버에서 호출하는 방식을 권장합니다.
- 현재 명식(년주·월주 등)은 데모 차트 데이터를 사용합니다.

## Vercel 배포 (권장)

1. GitHub 연동 — Framework: **Vite**, Output: **dist**
2. **Settings → Environment Variables** (Production / Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
3. 변수 추가/수정 후 **Deployments → Redeploy** (없으면 빌드에 키가 안 들어감)
4. Supabase URL Configuration에 Vercel 주소 등록 (위 Google 로그인 5번)

## Netlify 배포

계정 크레딧이 남아 있을 때만 사용. Build: `npm run build`, Publish: `dist`, 동일 `VITE_*` 환경 변수 후 재배포.
