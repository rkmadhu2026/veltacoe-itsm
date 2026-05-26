interface GaugeProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
}

export function Gauge({ value, size = 100, stroke = 10, color = "var(--accent)" }: GaugeProps) {
  const r = (size - stroke) / 2;
  const c = Math.PI * r;
  const offset = c * (1 - value / 100);
  const cy = size / 2 + r / 2;
  return (
    <svg width={size} height={size / 2 + stroke} style={{ overflow: "visible" }}>
      <path
        className="arc-bg"
        d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`}
        strokeWidth={stroke}
      />
      <path
        className="arc-fg"
        d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`}
        strokeWidth={stroke}
        stroke={color}
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
