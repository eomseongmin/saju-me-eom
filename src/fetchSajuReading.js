import { GoogleGenAI } from '@google/genai/web'

function getApiKey() {
  // 과거 오타(GEMENI)도 함께 지원
  const key = (
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_GEMENI_API_KEY ||
    ''
  ).trim()
  return key
}

function formatApiError(err) {
  const message = err?.message || String(err)
  if (/api key|API_KEY|PERMISSION_DENIED|401|403|UNAUTHENTICATED/i.test(message)) {
    return 'API 키가 거부되었습니다. Google AI Studio에서 Gemini API 키를 다시 복사해 .env의 VITE_GEMINI_API_KEY에 넣고, 개발 서버를 재시작해 주세요.'
  }
  if (/Failed to fetch|NetworkError|CORS/i.test(message)) {
    return '네트워크 오류로 Gemini에 연결하지 못했습니다. 인터넷 연결과 브라우저 콘솔을 확인해 주세요.'
  }
  return message
}

/** 생년월일로 만 나이 계산 */
function getManAge(birthDate) {
  const birth = new Date(`${birthDate}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

/**
 * 사주 기본차트 해석 프롬프트
 */
function buildBasicChartPrompt({
  name,
  gender,
  age,
  calendarLabel,
  birthDate,
  birthTime,
  timeUnknown,
  chartBlock,
}) {
  const timeNote = timeUnknown
    ? `\n참고: 태어난 시간을 모릅니다. 시주(時柱)는 확정하지 말고, 년·월·일 중심으로 해석하세요. 시간 때문에 달라질 수 있는 부분은 짧게 한계를 밝혀 주세요.`
    : ''

  return `return only Korean.

당신은 세계 최고의 사주 해석 전문가다. 논리와 구조 중심으로 사주를 해석하며, 수천 명의 인생을 분석해 온 경험이 있다. 분석은 매우 냉정하고 직설적으로 진행되며, 감정에 휘둘리지 않는다. 그러나 예외로 인간 내면에 대한 깊은 통찰을 지니고 있고 장점과 단점을 냉정하게 말한다.

질문: 사주를 통해 이 사람의 전반적인 성격, 기질, 재능을 분석해 주세요.
사용자가 사주 용어에 익숙하지 않다고 가정하고, 쉽고 명확한 말로 설명하며 중요한 포인트에서는 핵심 사주 근거를 밝혀주세요.
1) 사주 명식을 바탕으로 차분하지만 흥미롭게 설명해 주세요.
2) 사주에서 특이하거나 눈에 띄는 점이 있으면 알려주세요.
3) 약점도 솔직하게 말해 주세요.
4) 돋보이는 특징을 최소 한 가지 찾아 명확히 설명해 주세요.
5) 마지막은 사용자가 가장 궁금한 점을 묻는 질문으로 끝내주세요.
6) 판단 근거는 사용자가 제공한 모든 정보와 해석 가능한 모든 사주 정보를 종합해 제시해 주세요.
7) 긍정적 해석과 부정적 해석을 모두 고려해 주세요.
이외에도 특이한점 한가지를 찾아서 언급해 주세요.

출력 형식 규칙:
- 샵(#), 별표(*), 대시(-), 백틱 같은 마크다운 기호를 쓰지 마세요.
- 소제목은 한 줄로만 쓰고, 바로 다음 줄부터 본문을 이어서 쓰세요.
- 한국어 문장으로만 읽기 쉽게 작성하세요.

이름: ${name}
성별: ${gender}
나이: 만 ${age}세
달력: ${calendarLabel}
생년월일: ${birthDate}
태어난 시간: ${birthTime}${timeNote}

${chartBlock}

return only Korean.`
}

/** 데모용 기본 차트 (이후 실제 명식 계산 결과로 교체) */
const DEMO_CHART_BLOCK = `년주는 기묘, 월주는 기사, 일주는 을축, 시주는 을유
오행 분포: 금1 목3 수0 화1 토3
십신(천간): 편재 | 편재 | 일주 | 비견
십신(지지): 비견 | 상관 | 편재 | 편관
지장간: 甲 겁재,乙 비견 | 戊 정재,庚 정관,丙 상관 | 癸 편인,辛 편관,己 편재 | 庚 정관,辛 편관
납음: 성두토 | 대림목 | 해중금 | 천중수
십이운성: 건록 | 목욕 | 쇠 | 절
12신살: 재살 | 역마살 | 월살 | 재살
旬/공망: [년]申酉 [일]戌亥
월령: 庚
대운수: 2
세운: 2021: 신축
2022: 임인
2023: 계묘
2024: 갑진
2025: 을사
2026: 병오 (기준)
2027: 정미
2028: 무신
2029: 기유
2030: 경술
2031: 신해
2032: 임자
월운: 01월: 기축
02월: 경인
03월: 신묘
04월: 임진
05월: 계사
06월: 갑오
07월: 을미
08월: 병신
09월: 정유
10월: 무술
11월: 기해
12월: 경자
대운 1: 무진 2001 (2~11세)
대운 2: 정묘 2011 (12~21세)
대운 3: 병인 2021 (22~31세)
대운 4: 을축 2031 (32~41세)
대운 5: 갑자 2041 (42~51세)
대운 6: 계해 2051 (52~61세)
대운 7: 임술 2061 (62~71세)
대운 8: 신유 2071 (72~81세)
대운 9: 경신 2081 (82~91세)`

/**
 * 기본차트 해석 프롬프트로 Gemini에 요청합니다.
 * onChunk(fullText)로 실시간 조각을 전달합니다.
 */
export async function fetchSajuReading({
  name,
  birthDate,
  birthTime,
  gender,
  calendarLabel,
  timeUnknown = false,
  chartBlock = DEMO_CHART_BLOCK,
  onChunk,
}) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error(
      'API 키가 없습니다. 프로젝트 루트 .env에 VITE_GEMINI_API_KEY=키값 을 넣고 npm run dev를 다시 실행해 주세요.',
    )
  }

  const prompt = buildBasicChartPrompt({
    name,
    gender,
    age: getManAge(birthDate),
    calendarLabel,
    birthDate,
    birthTime,
    timeUnknown,
    chartBlock,
  })

  const ai = new GoogleGenAI({ apiKey })
  let lastError = null

  // 1) 스트리밍 (글자가 나오는 대로 화면 갱신)
  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    let full = ''
    for await (const chunk of stream) {
      const piece = chunk?.text || ''
      if (!piece) continue
      full += piece
      onChunk?.(full)
    }

    const text = full.trim()
    if (text) return text
  } catch (err) {
    lastError = err
    console.error('[saju] stream 실패:', err)
  }

  // 2) 폴백: 한 번에 받기
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
    const text = response?.text?.trim()
    if (text) {
      onChunk?.(text)
      return text
    }
  } catch (err) {
    lastError = err
    console.error('[saju] generateContent 실패:', err)
  }

  throw new Error(
    formatApiError(lastError) ||
      '사주 결과를 받지 못했습니다. 잠시 후 다시 시도해 주세요.',
  )
}
