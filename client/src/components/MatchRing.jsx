// Small circular match indicator: share of required ingredients you already have.
export default function MatchRing({ have, total, size = 44 }) {
  const pct = total > 0 ? have / total : 0
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  const missing = total - have

  return (
    <div
      className={`ring ${missing === 0 ? 'ring-full' : ''}`}
      style={{ width: size, height: size }}
      title={missing === 0 ? 'You have everything' : `${missing} ingredient${missing > 1 ? 's' : ''} missing`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-track, #EDE5D4)" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={missing === 0 ? 'var(--green-600)' : 'var(--tomato)'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring-label">
        {have}/{total}
      </span>
    </div>
  )
}
