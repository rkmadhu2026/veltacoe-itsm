import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, Sparkline } from "@/components";
import { APM_ENDPOINTS, SERVICES, TRACES } from "@/data";
import { spark } from "@/lib/spark";
import type { ServiceStatus, SpanKind, Trace } from "@/types";
import type { PillKind } from "@/components";

const STATUS_PILL: Record<ServiceStatus, PillKind> = {
  healthy: "success",
  degraded: "warning",
  down: "critical",
};

const KIND_COLOR: Record<SpanKind, string> = {
  server: "#2563eb",
  client: "#8b5cf6",
  db: "#f59e0b",
  queue: "#14b8a6",
  internal: "#64748b",
};

const seedOf = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

export function ApmScreen() {
  const [selectedService, setSelectedService] = useState<"all" | string>("all");
  const [selectedTraceId, setSelectedTraceId] = useState<string>(TRACES[0].id);

  const endpoints = useMemo(
    () =>
      selectedService === "all"
        ? APM_ENDPOINTS
        : APM_ENDPOINTS.filter((e) => e.service === selectedService),
    [selectedService],
  );

  const trace = TRACES.find((t) => t.id === selectedTraceId) ?? TRACES[0];

  const stats = useMemo(() => {
    const rpm = APM_ENDPOINTS.reduce((a, e) => a + e.rpm, 0);
    const errRate = APM_ENDPOINTS.reduce((a, e) => a + e.errPct * e.rpm, 0) / Math.max(1, rpm);
    const apdex = APM_ENDPOINTS.reduce((a, e) => a + e.apdex, 0) / APM_ENDPOINTS.length;
    const degraded = SERVICES.filter((s) => s.status !== "healthy").length;
    return {
      rpm: `${(rpm / 1000).toFixed(1)}k`,
      errRate: errRate.toFixed(2),
      apdex: apdex.toFixed(2),
      degraded,
    };
  }, []);

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Observe</a>
        <span className="sn-bc-sep">›</span>
        <span>APM &amp; traces</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">APM-OTEL</span>
          {stats.degraded > 0 && <Pill kind="warning">{stats.degraded} services degraded</Pill>}
          <Pill kind="neutral" noDot>
            OpenTelemetry · RED method
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Application performance</h1>
          <div className="sn-form-sub">
            {SERVICES.length} instrumented services · {APM_ENDPOINTS.length} tracked endpoints ·
            traces correlated by <span className="mono">trace_id</span> across logs and metrics
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/logs" className="sn-btn">
            <i className="fa-solid fa-list-ul" /> Correlated logs
          </Link>
          <Link to="/entity-map" className="sn-btn">
            <i className="fa-solid fa-circle-nodes" /> Entity map
          </Link>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> Instrument service
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Throughput" value={stats.rpm} sub="requests / min" tone="neutral" />
        <Kpi
          label="Error rate"
          value={`${stats.errRate}%`}
          sub="weighted, all endpoints"
          tone={Number(stats.errRate) > 1 ? "warn" : "ok"}
        />
        <Kpi
          label="Apdex"
          value={stats.apdex}
          sub="fleet average"
          tone={Number(stats.apdex) < 0.85 ? "warn" : "ok"}
        />
        <Kpi label="Services" value={SERVICES.length} sub="instrumented" tone="neutral" />
        <Kpi
          label="Degraded"
          value={stats.degraded}
          sub="breaching SLO"
          tone={stats.degraded ? "warn" : "ok"}
        />
        <Kpi label="Traces sampled" value="1.2M" sub="last 24h · 10% head" tone="neutral" />
      </div>

      {/* Service RED table */}
      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-gauge-high" />
          <span className="sn-section-title">Services · rate / errors / duration</span>
          <span className="sn-section-badge">click to filter endpoints</span>
        </div>
        <div className="sn-section-content">
          <table className="sn-list-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>Status</th>
                <th>Service</th>
                <th style={{ width: 130 }}>Latency trend</th>
                <th style={{ width: 90 }}>p95</th>
                <th style={{ width: 90 }}>Err %</th>
                <th style={{ width: 90 }}>Uptime</th>
                <th style={{ width: 70 }}>Deps</th>
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((s) => (
                <tr
                  key={s.name}
                  onClick={() => setSelectedService(selectedService === s.name ? "all" : s.name)}
                  style={{
                    cursor: "pointer",
                    background: selectedService === s.name ? "var(--bg-muted,#f8fafc)" : undefined,
                  }}
                >
                  <td>
                    <Pill kind={STATUS_PILL[s.status]}>{s.status}</Pill>
                  </td>
                  <td>
                    <span className="mono" style={{ fontWeight: 550 }}>
                      {s.name}
                    </span>
                  </td>
                  <td>
                    <Sparkline
                      data={spark(seedOf(s.name), s.status === "healthy" ? 0 : 1)}
                      color={s.status === "healthy" ? "#10b981" : "#f59e0b"}
                      w={110}
                      h={26}
                    />
                  </td>
                  <td className="mono">{s.p95}</td>
                  <td className="mono" style={{ color: s.err >= 1 ? "#dc2626" : undefined }}>
                    {s.err}%
                  </td>
                  <td className="mono">{s.uptime}%</td>
                  <td className="mono text-mute">{s.deps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          {/* Trace waterfall */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-water" />
              <span className="sn-section-title">Trace waterfall</span>
              <span className="sn-section-badge mono">
                {trace.id} · {trace.durMs}ms
              </span>
            </div>
            <div className="sn-section-content">
              <div className="apm-trace-tabs">
                {TRACES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    className={`apm-trace-tab${t.id === selectedTraceId ? " active" : ""}`}
                    onClick={() => setSelectedTraceId(t.id)}
                  >
                    {t.status === "error" ? (
                      <i className="fa-solid fa-circle-exclamation" style={{ color: "#dc2626" }} />
                    ) : (
                      <i className="fa-solid fa-circle-check" style={{ color: "#10b981" }} />
                    )}
                    <span className="mono">{t.name}</span>
                    <span className="text-mute mono" style={{ fontSize: 10.5 }}>
                      {t.durMs}ms
                    </span>
                  </button>
                ))}
              </div>
              <Waterfall trace={trace} />
              <div className="apm-legend">
                {(Object.entries(KIND_COLOR) as [SpanKind, string][]).map(([k, c]) => (
                  <span key={k} className="apm-legend-item">
                    <span className="apm-swatch" style={{ background: c }} /> {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="sn-form-side">
          <div className="sn-side-card">
            <div className="sn-side-head">
              Endpoints{" "}
              {selectedService !== "all" && (
                <span className="sn-side-count">{selectedService}</span>
              )}
            </div>
            <div className="sn-side-body">
              {endpoints.map((e) => (
                <div
                  key={`${e.service}${e.route}`}
                  className="sn-related-row"
                  style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}
                >
                  <div style={{ display: "flex", width: "100%", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 11.5, fontWeight: 550, flex: 1 }}>
                      {e.route}
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: e.errPct >= 1 ? "#dc2626" : "var(--fg-subtle)",
                      }}
                    >
                      {e.errPct}%
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--fg-subtle)" }} className="mono">
                    {e.service} · {e.rpm.toLocaleString()} rpm · p50 {e.p50} · p95 {e.p95} · apdex{" "}
                    {e.apdex}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

function Waterfall({ trace }: { trace: Trace }) {
  return (
    <div className="apm-wf">
      {trace.spans.map((s) => {
        const depth = spanDepth(trace, s.id);
        return (
          <div key={s.id} className="apm-wf-row">
            <div className="apm-wf-label" style={{ paddingLeft: depth * 14 }}>
              <span className="apm-wf-svc mono">{s.service}</span>
              <span className="apm-wf-name">{s.name}</span>
            </div>
            <div className="apm-wf-track">
              <div
                className={`apm-wf-bar${s.error ? " error" : ""}`}
                style={{
                  left: `${(s.startMs / trace.durMs) * 100}%`,
                  width: `${Math.max(0.8, (s.durMs / trace.durMs) * 100)}%`,
                  background: s.error ? "#dc2626" : KIND_COLOR[s.kind],
                }}
                title={`${s.name} · ${s.durMs}ms${s.error ? " · error" : ""}`}
              />
            </div>
            <span className="apm-wf-dur mono">{s.durMs}ms</span>
          </div>
        );
      })}
    </div>
  );
}

function spanDepth(trace: Trace, id: string): number {
  let depth = 0;
  let cur = trace.spans.find((s) => s.id === id);
  while (cur?.parentId) {
    depth++;
    cur = trace.spans.find((s) => s.id === cur!.parentId);
  }
  return depth;
}

function Kpi({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number | string;
  sub: string;
  tone: "ok" | "warn" | "crit" | "neutral";
}) {
  return (
    <div className={`sn-kpi tone-${tone}`}>
      <div className="sn-kpi-l">{label}</div>
      <div className="sn-kpi-v">{value}</div>
      <div className="sn-kpi-s">{sub}</div>
    </div>
  );
}

const STYLES = `
  .apm-trace-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
  .apm-trace-tab{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);cursor:pointer;font:inherit;font-size:12px;color:var(--fg)}
  .apm-trace-tab:hover{border-color:var(--accent)}
  .apm-trace-tab.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}
  .apm-wf{display:flex;flex-direction:column;gap:4px}
  .apm-wf-row{display:grid;grid-template-columns:260px 1fr 64px;gap:10px;align-items:center}
  .apm-wf-label{display:flex;flex-direction:column;min-width:0}
  .apm-wf-svc{font-size:10px;color:var(--fg-subtle)}
  .apm-wf-name{font-size:11.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .apm-wf-track{position:relative;height:16px;background:var(--bg-muted,#f8fafc);border-radius:4px}
  .apm-wf-bar{position:absolute;top:2px;bottom:2px;border-radius:3px;min-width:3px}
  .apm-wf-bar.error{box-shadow:0 0 0 1px #dc2626}
  .apm-wf-dur{font-size:10.5px;color:var(--fg-subtle);text-align:right}
  .apm-legend{display:flex;gap:14px;flex-wrap:wrap;margin-top:12px;font-size:11px;color:var(--fg-subtle)}
  .apm-legend-item{display:inline-flex;align-items:center;gap:5px}
  .apm-swatch{width:11px;height:11px;border-radius:3px;display:inline-block}
  @media(max-width:820px){.apm-wf-row{grid-template-columns:150px 1fr 54px}}
`;
