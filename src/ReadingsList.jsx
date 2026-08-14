function formatReadingDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function previewResult(text) {
  const flat = (text || '').replace(/\s+/g, ' ').trim()
  if (flat.length <= 80) return flat
  return `${flat.slice(0, 80)}…`
}

function ReadingsList({ readings, loading, onDelete }) {
  return (
    <section className="readings-list">
      <h2 className="readings-list__title">내 사주 기록</h2>
      {loading ? (
        <p className="readings-list__empty">기록을 불러오는 중…</p>
      ) : readings.length === 0 ? (
        <p className="readings-list__empty">아직 기록이 없어요. 첫 사주를 봐보세요!</p>
      ) : (
        <ul className="readings-list__items">
          {readings.map((r) => (
            <li key={r.id} className="readings-list__item">
              <div className="readings-list__meta">
                <strong>{r.name || '이름 없음'}</strong>
                <time dateTime={r.created_at}>{formatReadingDate(r.created_at)}</time>
              </div>
              <p className="readings-list__preview">{previewResult(r.result)}</p>
              <button
                type="button"
                className="readings-list__delete"
                onClick={() => onDelete(r.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ReadingsList
