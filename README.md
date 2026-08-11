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

프로젝트 루트에 `.env` 파일을 만들고 Google AI Studio에서 발급한 Gemini API 키를 넣습니다.

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

`.env.example`을 참고해도 됩니다.  
`.env`는 Git에 올리지 않습니다 (`.gitignore`에 포함).

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
