interface SLAIndicatorProps {
  pct: number;
  label?: string;
}

export function SLAIndicator({ pct, label }: SLAIndicatorProps) {
  const kind = pct < 0.4 ? "bad" : pct < 0.7 ? "warn" : "good";
  return (
    <div className="sla">
      <div className="sla-bar">
        <div className={`sla-fill ${kind}`} style={{ width: `${pct * 100}%` }} />
      </div>
      <span className="sla-text">{label || `${Math.round(pct * 100)}%`}</span>
    </div>
  );
}
