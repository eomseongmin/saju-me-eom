import { useEffect, useState } from 'react'
import { supabase } from './supabase'

function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorDescription = params.get('error_description') || params.get('error')
    if (errorDescription) {
      setMessage(decodeURIComponent(errorDescription.replace(/\+/g, ' ')))
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setBusy(true)

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (!data.session) {
          setMessage('가입 메일을 확인해 주세요. 확인 후 로그인해 주세요.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setMessage(err?.message || '로그인에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogleLogin() {
    if (!supabase) return
    setMessage('')
    setBusy(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) {
      setBusy(false)
      setMessage(error.message)
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-card">
        <p className="auth-eyebrow">사주 해석 서비스</p>
        <h1 className="brand">엄성민의 점집</h1>
        <p className="auth-desc">로그인하면 내 정보로 바로 사주를 볼 수 있어요.</p>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={busy}
        >
          Google로 계속하기
        </button>

        <p className="auth-divider">또는 이메일로</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('login')
              setMessage('')
            }}
          >
            로그인
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('signup')
              setMessage('')
            }}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="auth-email">이메일</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="auth-password">비밀번호</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={busy}>
            {busy ? '처리 중…' : mode === 'signup' ? '회원가입' : '로그인'}
          </button>
        </form>

        {message && <p className="error">{message}</p>}
      </div>
    </main>
  )
}

export default AuthScreen
