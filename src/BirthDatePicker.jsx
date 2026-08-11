import { useMemo, useState } from 'react'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function toDateString(year, month, day) {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

/**
 * 생년월일 선택기
 * 연도 네모 → 월 네모 → 달력(일)만 차례대로 보여주고,
 * 일까지 고르면 선택 창을 닫습니다.
 */
function BirthDatePicker({ value, onChange }) {
  const parsed = value ? value.split('-').map(Number) : []
  const selectedYear = parsed[0] || null
  const selectedMonth = parsed[1] || null
  const selectedDay = parsed[2] || null

  const [draftYear, setDraftYear] = useState(selectedYear)
  const [draftMonth, setDraftMonth] = useState(selectedMonth)

  // year | month | day | closed
  // 이미 날짜가 있으면 창을 닫힌 상태로 시작
  const [step, setStep] = useState(value ? 'closed' : 'year')

  const currentYear = new Date().getFullYear()
  const [decadeStart, setDecadeStart] = useState(
    selectedYear ? Math.floor(selectedYear / 10) * 10 : 2000,
  )
  const years = Array.from({ length: 10 }, (_, i) => decadeStart + i).filter(
    (y) => y <= currentYear && y >= 1920,
  )

  const calendarCells = useMemo(() => {
    if (!draftYear || !draftMonth) return []

    const firstWeekday = new Date(draftYear, draftMonth - 1, 1).getDay()
    const daysInMonth = getDaysInMonth(draftYear, draftMonth)
    const cells = []

    for (let i = 0; i < firstWeekday; i += 1) cells.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
    return cells
  }, [draftYear, draftMonth])

  function pickYear(year) {
    setDraftYear(year)
    setDraftMonth(null)
    setStep('month') // 연도 창 닫고 월 창만 열림
    onChange('')
  }

  function pickMonth(month) {
    setDraftMonth(month)
    setStep('day') // 월 창 닫고 달력만 열림
    onChange('')
  }

  function pickDay(day) {
    onChange(toDateString(draftYear, draftMonth, day))
    setStep('closed') // 일 고르면 선택 UI 전부 닫기
  }

  function reopen() {
    // 다시 고를 때는 연도부터
    setDraftYear(null)
    setDraftMonth(null)
    setStep('year')
    onChange('')
  }

  return (
    <div className="birth-picker">
      {value ? (
        <button type="button" className="birth-selected" onClick={reopen}>
          {selectedYear}년 {selectedMonth}월 {selectedDay}일
          <span>다시 선택</span>
        </button>
      ) : (
        <p className="birth-progress">
          {step === 'year' && '연도를 선택하세요'}
          {step === 'month' && '월을 선택하세요'}
          {step === 'day' && '일을 선택하세요'}
        </p>
      )}

      {step === 'year' && (
        <div className="birth-panel">
          <div className="birth-panel__nav">
            <button
              type="button"
              onClick={() => setDecadeStart((d) => Math.max(1920, d - 10))}
              disabled={decadeStart <= 1920}
            >
              ← 이전
            </button>
            <strong>{decadeStart}년대</strong>
            <button
              type="button"
              onClick={() =>
                setDecadeStart((d) =>
                  Math.min(Math.floor(currentYear / 10) * 10, d + 10),
                )
              }
              disabled={decadeStart >= Math.floor(currentYear / 10) * 10}
            >
              다음 →
            </button>
          </div>
          <div className="birth-grid birth-grid--year">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                className="birth-box"
                onClick={() => pickYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'month' && (
        <div className="birth-panel">
          <div className="birth-grid birth-grid--month">
            {MONTHS.map((month) => (
              <button
                key={month}
                type="button"
                className="birth-box"
                onClick={() => pickMonth(month)}
              >
                {month}월
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'day' && draftYear && draftMonth && (
        <div className="birth-panel">
          <div className="birth-calendar">
            {WEEKDAYS.map((label) => (
              <div key={label} className="birth-calendar__weekday">
                {label}
              </div>
            ))}
            {calendarCells.map((day, index) =>
              day === null ? (
                <div key={`empty-${index}`} className="birth-calendar__empty" />
              ) : (
                <button
                  key={day}
                  type="button"
                  className="birth-box birth-box--day"
                  onClick={() => pickDay(day)}
                >
                  {day}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BirthDatePicker
