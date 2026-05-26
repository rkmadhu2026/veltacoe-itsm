import { Sparkline } from "./Sparkline";

interface KPIProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string | number | null;
  deltaKind?: "up" | "down" | "neutral";
  sparkData?: readonly number[];
  sparkColor?: string;
  icon?: string;
  showSpark?: boolean;
}

export function KPI({
  label,
  value,
  unit,
  delta,
  deltaKind = "up",
  sparkData,
  sparkColor = "var(--accent)",
  icon,
  showSpark = true,
}: KPIProps) {
  return (
    <div className="kpi">
      <div className="kpi-label">
        {icon && <i className={`fa-solid ${icon}`} style={{ fontSize: 11 }} />} {label}
      </div>
      <div className="kpi-value">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      {delta != null && (
        <div className={`kpi-delta ${deltaKind}`}>
          <i
            className={`fa-solid ${
              deltaKind === "up"
                ? "fa-arrow-trend-up"
                : deltaKind === "down"
                  ? "fa-arrow-trend-down"
                  : "fa-minus"
            }`}
          />
          {delta}
        </div>
      )}
      {showSpark && sparkData && (
        <div className="kpi-spark">
          <Sparkline data={sparkData} color={sparkColor} w={80} h={30} />
        </div>
      )}
    </div>
  );
}
