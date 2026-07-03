import type { ReactElement } from "react";

interface HeatmapProps {
  rows?: number;
  cols?: number;
  seed?: number;
}

export function Heatmap({ rows = 7, cols = 24, seed = 1 }: HeatmapProps) {
  const cells: ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = (Math.sin(seed + r * 1.7 + c * 0.5) + 1) / 2;
      const intensity = v * v;
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            aspectRatio: 1,
            borderRadius: 2,
            background:
              intensity > 0.1 ? `rgba(37, 99, 235, ${0.08 + intensity * 0.8})` : "var(--bg-muted)",
          }}
        />,
      );
    }
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
      {cells}
    </div>
  );
}
