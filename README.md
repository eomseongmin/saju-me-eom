# 사주미 (saju-me)

이름·생년월일·시간·성별·양력/음력을 입력하면 Gemini API로 사주 기본차트 해석을 받아보는 React 앱입니다.

## 주요 기능

- 이메일 로그인 / 회원가입
- `users` 프로필(이름, 생년월일, 시간, 성별, 양력/음력) 저장 후 재사용
- 첫 로그인 시 필수 정보 입력 모달
- 프로필에서 정보 수정
- Gemini 스트리밍 사주 해석
- `readings`에 풀이 저장 (`user_id`로 프로필과 연결)

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

1. 프로젝트 `saju-me` (Seoul)
2. **SQL Editor**에서 `supabase/schema.sql` 전체를 실행
   - `users`: 프로필
   - `readings`: 풀이 + `user_id` → `users.id`
3. **Authentication → Providers → Email**
   - 로컬 테스트면 **Confirm email** 끄기 (안 끄면 가입 후 메일 확인 필요)
4. `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`(publishable) 넣고 서버 재시작

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173/` 로 접속합니다.

> PowerShell에서 `npm`을 못 찾는 경우:
>
> ```powershell
> $env:PATH = "C:\Program Files\nodejs;" + $env:PATH
> npm run dev
> ```
>
> 또는 Git Bash 터미널을 사용하세요.

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
- `@supabase/supabase-js` (풀이 저장)
- 순수 CSS (살구/하늘색 카드 UI)

## 프로젝트 구조 (주요 파일)

```
src/
  App.jsx              # 로그인 이후 홈/프로필/결과
  AuthScreen.jsx       # 로그인·회원가입
  ProfileModal.jsx     # 첫 정보 입력 모달
  ProfilePage.jsx      # 프로필 수정
  ProfileFields.jsx    # 공통 입력 필드
  BirthDatePicker.jsx  # 생년월일 피커
  fetchSajuReading.js  # Gemini 호출
  SajuReading.jsx      # 해석 렌더링
  supabase.js          # Supabase 클라이언트
```

## 참고

- API 키(`VITE_` 접두사)는 브라우저에 노출됩니다. 배포 시에는 서버에서 호출하는 방식을 권장합니다.
- 현재 명식(년주·월주 등)은 데모 차트 데이터를 사용합니다. 이후 실제 사주 계산 로직으로 교체할 수 있습니다.

## Netlify 배포

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Environment variables에 **반드시** 아래 이름으로 키를 넣습니다.
   - `VITE_GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 환경 변수를 추가/수정한 뒤에는 **Trigger deploy → Clear cache and deploy site**로 다시 빌드해야 합니다.  
   (Vite는 키가 빌드 시점에 코드에 들어갑니다. 배포 후에만 키를 넣으면 반영되지 않습니다.)

`netlify.toml`이 위 설정을 포함합니다.

## Vercel 배포

1. GitHub 연동 후 Framework Preset: **Vite**, Output: **dist**
2. **Settings → Environment Variables**에 추가 (Production / Preview 모두):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (publishable)
   - `VITE_GEMINI_API_KEY`
3. 변수를 넣은 뒤 **Deployments → Redeploy** (없으면 빌드에 키가 안 들어감)
4. Supabase Authentication → URL Configuration에 Vercel 주소 추가
   - Site URL: `https://내프로젝트.vercel.app`
   - Redirect URLs: `https://내프로젝트.vercel.app/**`
