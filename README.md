# 사주미 (saju-me)

이름·생년월일·시간·성별·양력/음력을 입력하면 Gemini API로 사주 기본차트 해석을 받아보는 React 앱입니다.

## 주요 기능

- 사주 정보 입력 폼 (이름, 생년월일, 시간, 성별, 양력/음력)
- 생년월일: 연도 → 월 → 일 순서 선택 피커
- 태어난 시간 **모름** 옵션 (시주 없이 해석)
- Gemini 스트리밍 해석 (글자가 나오는 대로 표시)
- 대기 중 스켈레톤 UI
- 마크다운을 읽기 좋은 문단/제목으로 렌더링
- 흰색 배경 + 살구색 입력 카드 + 하늘색 결과 카드 UI

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

## Supabase 세팅 (readings)

1. [supabase.com](https://supabase.com) → **New project**
   - 이름: `saju-me`
   - 리전: **Seoul**
   - DB 비밀번호는 메모해 두세요.
2. **Table Editor**에서 `readings` 테이블 생성. 열 5개:

   | 열 이름 | 타입 | 설명 |
   |---------|------|------|
   | `name` | text | 이름 |
   | `birth` | date | 생년월일 |
   | `birth_time` | text | 시간 또는 `모름` |
   | `gender` | text | `male` / `female` |
   | `result` | text | AI 사주 풀이 전문 |

   SQL Editor를 쓰면 `supabase/readings.sql`을 실행해도 됩니다.  
   **RLS는 오늘 체크 해제**(끄기).
3. Table Editor → **Insert row**로 가짜 데이터 1줄 넣어 보기.
4. **Project Settings → API**에서
   - Project URL → `.env`의 `VITE_SUPABASE_URL`
   - anon public key → `.env`의 `VITE_SUPABASE_ANON_KEY`
5. 저장 후 개발 서버 재시작 → 앱에서 **이 풀이 저장하기**

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
  App.jsx              # 입력 폼 + 결과 화면
  BirthDatePicker.jsx  # 생년월일 피커
  fetchSajuReading.js  # Gemini 프롬프트/스트리밍 호출
  SajuReading.jsx      # 해석 텍스트 렌더링
  ResultSkeleton.jsx   # 로딩 스켈레톤
  App.css / index.css  # 스타일
```

## 참고

- API 키(`VITE_` 접두사)는 브라우저에 노출됩니다. 배포 시에는 서버에서 호출하는 방식을 권장합니다.
- 현재 명식(년주·월주 등)은 데모 차트 데이터를 사용합니다. 이후 실제 사주 계산 로직으로 교체할 수 있습니다.

## Netlify 배포

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Environment variables에 **반드시** 아래 이름으로 키를 넣습니다.
   - `VITE_GEMINI_API_KEY` = (Google AI Studio API 키)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 환경 변수를 추가/수정한 뒤에는 **Trigger deploy → Clear cache and deploy site**로 다시 빌드해야 합니다.  
   (Vite는 키가 빌드 시점에 코드에 들어갑니다. 배포 후에만 키를 넣으면 반영되지 않습니다.)

`netlify.toml`이 위 설정을 포함합니다.
