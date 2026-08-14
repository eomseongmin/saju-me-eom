import { startTransition, useEffect, useState } from 'react'
import AuthScreen from './AuthScreen'
import LiveFeed from './LiveFeed'
import ProfileModal from './ProfileModal'
import ProfilePage from './ProfilePage'
import ReadingsList from './ReadingsList'
import ResultSkeleton from './ResultSkeleton'
import SajuReading from './SajuReading'
import { fetchFeedOneLiner, fetchSajuReading } from './fetchSajuReading'
import { hasSupabaseEnv, supabase } from './supabase'
import {
  birthTimeLabelFrom,
  formFromProfile,
  isProfileFormComplete,
  profilePayloadFromForm,
} from './userProfile'
import './App.css'

const EMPTY_FORM = {
  name: '',
  birthDate: '',
  birthTime: '',
  timeUnknown: false,
  gender: '',
  calendar: 'solar',
}

function anonymousNickname(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) return '익명의 손님'
  return `${trimmed[0]}**`
}

function App() {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profileReady, setProfileReady] = useState(false)
  const [view, setView] = useState('home')
  const [form, setForm] = useState(EMPTY_FORM)

  const [showResult, setShowResult] = useState(false)
  const [error, setError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sajuText, setSajuText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [readings, setReadings] = useState([])
  const [readingsLoading, setReadingsLoading] = useState(false)

  const genderLabel = form.gender === 'male' ? '남성' : form.gender === 'female' ? '여성' : '-'
  const calendarLabel = form.calendar === 'lunar' ? '음력' : '양력'
  const birthTimeLabel = birthTimeLabelFrom(form.birthTime, form.timeUnknown)

  function updateForm(patch) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  function resetResultView() {
    setShowResult(false)
    setSajuText('')
    setError('')
    setSaved(false)
  }

  async function loadReadings() {
    if (!supabase || !session?.user?.id) {
      setReadings([])
      return
    }

    setReadingsLoading(true)
    const { data, error: loadError } = await supabase
      .from('readings')
      .select('id, name, birth, birth_time, gender, result, created_at')
      .order('created_at', { ascending: false })

    setReadingsLoading(false)

    if (loadError) {
      console.error(loadError)
      setReadings([])
      return
    }

    setReadings(data ?? [])
  }

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setAuthReady(true)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null)
      setProfileReady(false)
      setForm(EMPTY_FORM)
      setView('home')
      setReadings([])
      resetResultView()
      return
    }

    let cancelled = false
    setProfileReady(false)

    supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error: loadError }) => {
        if (cancelled) return
        if (loadError) {
          console.error(loadError)
          setProfile(null)
          setForm(EMPTY_FORM)
        } else if (data) {
          setProfile(data)
          setForm(formFromProfile(data))
        } else {
          setProfile(null)
          setForm(EMPTY_FORM)
        }
        setProfileReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (!session?.user?.id || !profile?.id) {
      setReadings([])
      return
    }

    let cancelled = false
    setReadingsLoading(true)

    supabase
      .from('readings')
      .select('id, name, birth, birth_time, gender, result, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error: loadError }) => {
        if (cancelled) return
        setReadingsLoading(false)
        if (loadError) {
          console.error(loadError)
          setReadings([])
          return
        }
        setReadings(data ?? [])
      })

    return () => {
      cancelled = true
    }
  }, [session?.user?.id, profile?.id])

  async function saveProfile() {
    if (!session?.user?.id) return false
    if (!isProfileFormComplete(form)) {
      setProfileError('이름, 생년월일, 시간, 성별을 모두 입력해 주세요.')
      return false
    }

    setProfileError('')
    setSavingProfile(true)
    const { data, error: saveError } = await supabase
      .from('users')
      .upsert(profilePayloadFromForm(session.user.id, form))
      .select()
      .single()
    setSavingProfile(false)

    if (saveError) {
      setProfileError(saveError.message)
      return false
    }

    setProfile(data)
    resetResultView()
    return true
  }

  async function handleSeeResult() {
    if (!isProfileFormComplete(form)) {
      setError('프로필 정보가 부족합니다. 프로필에서 먼저 입력해 주세요.')
      return
    }

    setError('')
    setLoading(true)
    setShowResult(true)
    setSajuText('')
    setSaved(false)

    let gotChunk = false

    try {
      const text = await fetchSajuReading({
        name: form.name.trim(),
        birthDate: form.birthDate,
        birthTime: birthTimeLabel,
        gender: form.gender,
        calendarLabel,
        timeUnknown: form.timeUnknown,
        onChunk: (partial) => {
          gotChunk = true
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

  async function saveReading() {
    if (!sajuText || loading || saving || saved || !session?.user?.id || !profile) return

    setSaving(true)
    const { error: saveError } = await supabase.from('readings').insert({
      user_id: session.user.id,
      name: form.name.trim(),
      birth: form.birthDate,
      birth_time: birthTimeLabel,
      gender: form.gender,
      result: sajuText,
    })

    if (saveError) {
      setSaving(false)
      alert('저장 실패: ' + saveError.message)
      return
    }

    try {
      const oneLiner = await fetchFeedOneLiner(sajuText)
      const { error: feedError } = await supabase.from('feed').insert({
        nickname: anonymousNickname(form.name),
        one_liner: oneLiner,
      })
      if (feedError) {
        console.error(feedError)
        alert('풀이는 저장됐지만 피드 등록에 실패했습니다: ' + feedError.message)
      }
    } catch (err) {
      console.error(err)
      alert('풀이는 저장됐지만 한 줄 요약을 만들지 못했습니다.')
    }

    await loadReadings()
    setSaving(false)
    setSaved(true)
  }

  async function deleteReading(id) {
    if (!supabase || !id) return
    const { error: deleteError } = await supabase.from('readings').delete().eq('id', id)
    if (deleteError) {
      alert('삭제 실패: ' + deleteError.message)
      return
    }
    await loadReadings()
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (!hasSupabaseEnv) {
    return (
      <main className="auth-screen">
        <div className="auth-card">
          <h1 className="brand">성민이의 점집</h1>
          <p className="auth-desc">
            배포 환경 변수가 없습니다. Vercel에 아래 값을 넣고 다시 배포해 주세요.
          </p>
          <ul className="env-missing">
            <li>VITE_SUPABASE_URL</li>
            <li>VITE_SUPABASE_ANON_KEY</li>
            <li>VITE_GEMINI_API_KEY</li>
          </ul>
        </div>
      </main>
    )
  }

  if (!authReady) {
    return (
      <main className="auth-screen">
        <div className="auth-card">
          <p className="auth-desc">불러오는 중…</p>
        </div>
      </main>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  const needsOnboarding = profileReady && !profile

  return (
    <div className="layout">
      {profile && view === 'home' && (
        <ReadingsList
          readings={readings}
          loading={readingsLoading}
          onDelete={deleteReading}
        />
      )}

      <main className="app">
        <header className="topbar">
          <button type="button" className="topbar-brand" onClick={() => setView('home')}>
            성민이의 점집
          </button>
          <div className="topbar-actions">
            <button
              type="button"
              className={`topbar-link ${view === 'profile' ? 'is-active' : ''}`}
              onClick={() => {
                if (profile) {
                  setForm(formFromProfile(profile))
                  setProfileError('')
                  setView('profile')
                }
              }}
              disabled={!profile}
            >
              프로필
            </button>
            <button type="button" className="topbar-link" onClick={handleSignOut}>
              로그아웃
            </button>
          </div>
        </header>

        {view === 'profile' && profile ? (
          <ProfilePage
            form={form}
            onFormChange={updateForm}
            saving={savingProfile}
            error={profileError}
            onBack={() => {
              setForm(formFromProfile(profile))
              setProfileError('')
              setView('home')
            }}
            onSave={async () => {
              const ok = await saveProfile()
              if (ok) setView('home')
            }}
          />
        ) : (
          <>
            <LiveFeed />

            <section className="panel">
              <div className="app-header">
                <h1 className="brand">성민이의 점집</h1>
                {profile ? (
                  <p className="lead">{profile.name}님, 저장된 정보로 사주를 볼게요.</p>
                ) : (
                  <p className="lead">사주를 보려면 기본 정보를 먼저 입력해 주세요.</p>
                )}
              </div>

              {profile ? (
                <>
                  <section className="profile-summary">
                    <div className="profile-summary-top">
                      <div>
                        <p className="profile-summary-label">내 프로필</p>
                        <p className="profile-summary-name">{form.name}</p>
                      </div>
                      <button
                        type="button"
                        className="ghost-btn ghost-btn--compact"
                        onClick={() => {
                          setForm(formFromProfile(profile))
                          setProfileError('')
                          setView('profile')
                        }}
                      >
                        수정
                      </button>
                    </div>
                    <div className="profile-chips">
                      <span className="chip">
                        {form.birthDate} ({calendarLabel})
                      </span>
                      <span className="chip">{birthTimeLabel}</span>
                      <span className="chip">{genderLabel}</span>
                    </div>
                  </section>

                  <button
                    type="button"
                    className="submit-btn"
                    onClick={handleSeeResult}
                    disabled={loading}
                  >
                    {loading ? '사주 해석 중…' : '사주 결과 보기'}
                  </button>
                </>
              ) : null}

              {error && <p className="error">{error}</p>}

              {showResult && (
                <section className="result">
                  <div className="result-header">
                    <p className="result-eyebrow">사주 결과</p>
                    <h2 className="result-title">{form.name}님의 사주</h2>
                    <p className="result-meta">
                      {form.birthDate} ({calendarLabel}) · {birthTimeLabel} · {genderLabel}
                    </p>
                  </div>

                  <div className="result-content">
                    {loading && !sajuText ? (
                      <ResultSkeleton />
                    ) : sajuText ? (
                      <SajuReading text={sajuText} streaming={loading} />
                    ) : null}
                  </div>

                  {!loading && sajuText ? (
                    <div className="result-footer">
                      <button
                        type="button"
                        className="save-btn"
                        onClick={saveReading}
                        disabled={saving || saved}
                      >
                        {saving ? '저장 중…' : saved ? '저장됨 ✓' : '이 풀이 저장하기'}
                      </button>
                    </div>
                  ) : null}
                </section>
              )}
            </section>
          </>
        )}
      </main>

      {needsOnboarding && (
        <ProfileModal
          form={form}
          onFormChange={updateForm}
          saving={savingProfile}
          error={profileError}
          onSave={saveProfile}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  )
}

export default App
