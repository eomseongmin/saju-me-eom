import { useEffect, useState } from 'react'
import { supabase } from './supabase'

function formatFeedTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function LiveFeed() {
  const [feed, setFeed] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!supabase) return undefined

    let cancelled = false

    supabase
      .from('feed')
      .select('id, nickname, one_liner, created_at')
      .order('created_at', { ascending: false })
      .limit(40)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error(error)
          setFeed([])
        } else {
          setFeed(data ?? [])
        }
        setReady(true)
      })

    const channel = supabase
      .channel('public-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feed' },
        (payload) => {
          const row = payload.new
          if (!row?.id) return
          setFeed((prev) => {
            if (prev.some((item) => item.id === row.id)) return prev
            return [row, ...prev].slice(0, 40)
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <section className="live-feed" aria-live="polite">
      <h2 className="live-feed__title">모두의 운세</h2>
      <p className="live-feed__lead">누군가 저장하면 한 줄이 바로 올라옵니다.</p>
      {!ready ? (
        <p className="live-feed__empty">피드를 불러오는 중…</p>
      ) : feed.length === 0 ? (
        <p className="live-feed__empty">아직 피드가 없어요. 첫 저장을 해보세요.</p>
      ) : (
        <ul className="live-feed__list">
          {feed.map((item) => (
            <li key={item.id} className="live-feed__item">
              <span className="live-feed__nick">{item.nickname}</span>
              <span className="live-feed__line">{item.one_liner}</span>
              <time className="live-feed__time" dateTime={item.created_at}>
                {formatFeedTime(item.created_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default LiveFeed
