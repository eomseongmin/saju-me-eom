function ResultSkeleton() {
  return (
    <div className="saju-skeleton" aria-hidden="true">
      <div className="saju-skeleton__label">사주를 풀어내는 중…</div>
      <div className="saju-skeleton__title" />
      <div className="saju-skeleton__line" />
      <div className="saju-skeleton__line saju-skeleton__line--long" />
      <div className="saju-skeleton__line saju-skeleton__line--mid" />
      <div className="saju-skeleton__title saju-skeleton__title--short" />
      <div className="saju-skeleton__line" />
      <div className="saju-skeleton__line saju-skeleton__line--mid" />
      <div className="saju-skeleton__line saju-skeleton__line--short" />
    </div>
  )
}

export default ResultSkeleton
