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
  if (flat.length <= 60) return flat
  return `${flat.slice(0, 60)}…`
}

function ReadingsList({ readings, loading, onDelete }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-heading">
          <h2 className="sidebar-title">내 기록</h2>
          <span className="sidebar-count">{readings.length}</span>
        </div>
      </div>

      {loading ? (
        <p className="sidebar-empty">불러오는 중…</p>
      ) : readings.length === 0 ? (
        <p className="sidebar-empty">아직 기록이 없어요.</p>
      ) : (
        <ul className="sidebar-list">
          {readings.map((r) => (
            <li key={r.id} className="sidebar-item-wrap">
              <div className="sidebar-item">
                <span className="sidebar-item-name">{r.name || '이름 없음'}</span>
                <span className="sidebar-item-meta">{formatReadingDate(r.created_at)}</span>
                <span className="sidebar-item-preview">{previewResult(r.result)}</span>
              </div>
              <button
                type="button"
                className="sidebar-delete"
                onClick={() => onDelete(r.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

export default ReadingsList
