const FORTUNE_ITEMS = [
  { key: 'overall', label: '총운' },
  { key: 'love', label: '연애' },
  { key: 'wealth', label: '재물' },
  { key: 'career', label: '직장' },
]

function TodayFortune({ fortune, loading, error }) {
  if (!loading && !fortune && !error) return null

  return (
    <section className="today-fortune" aria-live="polite">
      <div className="today-fortune__header">
        <p className="today-fortune__eyebrow">오늘의 운세</p>
        <h2 className="today-fortune__title">
          {fortune?.dateLabel || '오늘'}의 흐름
        </h2>
      </div>

      {error && <p className="error">{error}</p>}

      {loading && !fortune ? (
        <p className="today-fortune__loading">운세를 풀어보는 중…</p>
      ) : null}

      {fortune ? (
        <div className="today-fortune__grid">
          {FORTUNE_ITEMS.map((item) => (
            <article key={item.key} className="today-fortune__card">
              <h3>{item.label}</h3>
              <p>{fortune[item.key]}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default TodayFortune
