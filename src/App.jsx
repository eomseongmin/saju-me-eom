import { startTransition, useState } from 'react'
import BirthDatePicker from './BirthDatePicker'
import { fetchSajuReading } from './fetchSajuReading'
import ResultSkeleton from './ResultSkeleton'
import SajuReading from './SajuReading'
import './App.css'

function App() {
  // 각 입력칸마다 useState로 상태를 만듭니다
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('') // 생년월일 (YYYY-MM-DD)
  const [birthTime, setBirthTime] = useState('') // 태어난 시간 (HH:MM)
  const [timeUnknown, setTimeUnknown] = useState(false) // 시간 모름
  const [gender, setGender] = useState('') // 'male' | 'female'
  const [calendar, setCalendar] = useState('solar') // 'solar'(양력) | 'lunar'(음력)

  // 버튼을 눌렀을 때만 결과 영역을 보여주기 위한 상태
  const [showResult, setShowResult] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sajuText, setSajuText] = useState('')

  // 필수 값이 다 채워졌는지 확인 (시간은 '모름'도 허용)
  const isFormComplete =
    name.trim() && birthDate && (birthTime || timeUnknown) && gender && calendar

  // 화면에 보여줄 때 쓰기 쉬운 말로 바꿉니다
  const genderLabel = gender === 'male' ? '남성' : gender === 'female' ? '여성' : '-'
  const calendarLabel = calendar === 'lunar' ? '음력' : '양력'
  const birthTimeLabel = timeUnknown ? '모름' : birthTime

  function resetResultView() {
    setShowResult(false)
    setSajuText('')
    setError('')
  }

  async function handleSeeResult() {
    if (!isFormComplete) {
      setError('이름, 생년월일, 시간, 성별을 모두 입력해 주세요.')
      setShowResult(false)
      setSajuText('')
      return
    }

    setError('')
    setLoading(true)
    setShowResult(true)
    setSajuText('')

    let gotChunk = false

    try {
      const text = await fetchSajuReading({
        name: name.trim(),
        birthDate,
        birthTime: birthTimeLabel,
        gender, // 프롬프트용: 'male' | 'female'
        calendarLabel,
        timeUnknown,
        onChunk: (partial) => {
          gotChunk = true
          // 조각이 들어올 때마다 화면을 부드럽게 갱신
          startTransition(() => {
            setSajuText(partial)
          })
        },
      })
      setSajuText(text)
    } catch (err) {
      setError(err?.message || '사주 결과를 불러오지 못했습니다.')
      if (!gotChunk) setShowResult(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <h1 className="brand">사주미</h1>
      <p className="lead">정보를 입력한 뒤 아래 버튼으로 결과를 확인하세요.</p>

      <div className="field">
        <label htmlFor="name">이름</label>
        <input
          id="name"
          type="text"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            resetResultView()
          }}
        />
      </div>

      <div className="field">
        <span className="field-label">생년월일</span>
        <BirthDatePicker
          value={birthDate}
          onChange={(next) => {
            setBirthDate(next)
            resetResultView()
          }}
        />
      </div>

      <div className="field">
        <label htmlFor="birthTime">태어난 시간</label>
        <input
          id="birthTime"
          type="time"
          value={timeUnknown ? '' : birthTime}
          disabled={timeUnknown}
          onChange={(e) => {
            setBirthTime(e.target.value)
            setTimeUnknown(false)
            resetResultView()
          }}
        />
        <label className="option time-unknown">
          <input
            type="checkbox"
            checked={timeUnknown}
            onChange={(e) => {
              const checked = e.target.checked
              setTimeUnknown(checked)
              if (checked) setBirthTime('')
              resetResultView()
            }}
          />
          모름
        </label>
      </div>

      <fieldset className="field">
        <legend>성별</legend>
        <label className="option">
          <input
            type="radio"
            name="gender"
            value="male"
            checked={gender === 'male'}
            onChange={(e) => {
              setGender(e.target.value)
              resetResultView()
            }}
          />
          남성
        </label>
        <label className="option">
          <input
            type="radio"
            name="gender"
            value="female"
            checked={gender === 'female'}
            onChange={(e) => {
              setGender(e.target.value)
              resetResultView()
            }}
          />
          여성
        </label>
      </fieldset>

      <fieldset className="field">
        <legend>양력 / 음력</legend>
        <label className="option">
          <input
            type="radio"
            name="calendar"
            value="solar"
            checked={calendar === 'solar'}
            onChange={(e) => {
              setCalendar(e.target.value)
              resetResultView()
            }}
          />
          양력
        </label>
        <label className="option">
          <input
            type="radio"
            name="calendar"
            value="lunar"
            checked={calendar === 'lunar'}
            onChange={(e) => {
              setCalendar(e.target.value)
              resetResultView()
            }}
          />
          음력
        </label>
      </fieldset>

      <button
        type="button"
        className="submit-btn"
        onClick={handleSeeResult}
        disabled={loading}
      >
        {loading ? '사주 해석 중…' : '사주 결과 보기'}
      </button>

      {error && <p className="error">{error}</p>}

      {showResult && (
        <section className="result-panel">
          <h2>{name}님의 사주</h2>
          <ul>
            <li>
              <strong>생년월일</strong> {birthDate} ({calendarLabel})
            </li>
            <li>
              <strong>태어난 시간</strong> {birthTimeLabel}
            </li>
            <li>
              <strong>성별</strong> {genderLabel}
            </li>
          </ul>

          {loading && !sajuText ? (
            <ResultSkeleton />
          ) : sajuText ? (
            <SajuReading text={sajuText} streaming={loading} />
          ) : null}
        </section>
      )}
    </main>
  )
}

export default App
