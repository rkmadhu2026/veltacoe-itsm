interface BarChartProps {
  data: readonly number[];
  color?: string;
  h?: number;
}

export function BarChart({ data, color = "var(--accent)", h = 140 }: BarChartProps) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: h, padding: "0 2px" }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            background: color,
            borderRadius: "3px 3px 0 0",
            opacity: 0.2 + (v / max) * 0.8,
            minHeight: 2,
          }}
        />
      ))}
    </div>
  );
}
