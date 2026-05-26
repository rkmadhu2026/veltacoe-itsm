// Deterministic 24-point sparkline generator. Same input → same series.
// Replaces the legacy `window.spark` helper.
export function spark(seed: number, trend = 0): number[] {
  const out: number[] = [];
  let v = 50 + (seed % 30);
  for (let i = 0; i < 24; i++) {
    v += Math.sin(seed + i * 0.6) * 8 + trend * (i / 24) * 20 + ((seed * (i + 1)) % 7) - 3;
    out.push(Math.max(4, Math.min(96, v)));
  }
  return out;
}
