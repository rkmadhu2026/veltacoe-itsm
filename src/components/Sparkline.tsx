interface SparklineProps {
  data: readonly number[];
  color?: string;
  w?: number;
  h?: number;
  area?: boolean;
}

export function Sparkline({
  data,
  color = "var(--accent)",
  w = 80,
  h = 30,
  area = true,
}: SparklineProps) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = Math.max(max - min, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 2 - ((v - min) / range) * (h - 4);
    return [x, y] as const;
  });
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const areaD = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} className="mini-chart" style={{ color, display: "block" }}>
      {area && <path className="spark-area" d={areaD} />}
      <path className="spark-line" d={d} />
    </svg>
  );
}
