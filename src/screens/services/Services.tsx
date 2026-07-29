import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, Sparkline } from "@/components";
import { SERVICES, SERVICE_DEPS } from "@/data";
import { spark } from "@/lib/spark";
import type { ServiceStatus } from "@/types";
import type { PillKind } from "@/components";

const STATUS_PILL: Record<ServiceStatus, PillKind> = {
  healthy: "success",
  degraded: "warning",
  down: "critical",
};

const FILTERS: readonly ("all" | ServiceStatus)[] = ["all", "healthy", "degraded", "down"];

const seedOf = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

export function ServicesScreen() {
  const [filter, setFilter] = useState<"all" | ServiceStatus>("all");

  const rows = useMemo(
    () => (filter === "all" ? SERVICES : SERVICES.filter((s) => s.status === filter)),
    [filter],
  );

  const healthy = SERVICES.filter((s) => s.status === "healthy").length;
  const degraded = SERVICES.filter((s) => s.status === "degraded").length;
  const down = SERVICES.filter((s) => s.status === "down").length;
  const avgUptime = SERVICES.reduce((a, s) => a + s.uptime, 0) / SERVICES.length;

  const dependents = (name: string) => SERVICE_DEPS.filter(([, to]) => to === name).length;

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Service</a>
        <span className="sn-bc-sep">›</span>
        <span>Services</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">SVC-CATALOG</span>
          {down > 0 && <Pill kind="critical">{down} down</Pill>}
          {degraded > 0 && <Pill kind="warning">{degraded} degraded</Pill>}
          <Pill kind="neutral" noDot>
            Business service registry
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Services</h1>
          <div className="sn-form-sub">
            {SERVICES.length} registered services · {SERVICE_DEPS.length} dependency edges · health
            rolled up from alerts, synthetics, and APM
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/entity-map" className="sn-btn">
            <i className="fa-solid fa-circle-nodes" /> Entity map
          </Link>
          <Link to="/apm" className="sn-btn">
            <i className="fa-solid fa-gauge-high" /> APM
          </Link>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> Register service
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Services" value={SERVICES.length} sub="registered" tone="neutral" />
        <Kpi label="Healthy" value={healthy} sub="all SLOs met" tone="ok" />
        <Kpi label="Degraded" value={degraded} sub="SLO at risk" tone={degraded ? "warn" : "ok"} />
        <Kpi label="Down" value={down} sub="hard outage" tone={down ? "crit" : "ok"} />
        <Kpi
          label="Avg uptime"
          value={`${avgUptime.toFixed(2)}%`}
          sub="30-day window"
          tone="neutral"
        />
        <Kpi label="Dependencies" value={SERVICE_DEPS.length} sub="tracked edges" tone="neutral" />
      </div>

      <div className="svc-two-col">
        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-diagram-project" />
            <span className="sn-section-title">Service health</span>
          </div>
          <div className="svc-filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`svc-filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <table className="sn-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Uptime 30d</th>
                <th>p95</th>
                <th>Error %</th>
                <th>Deps</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 550 }} className="mono">
                    {s.name}
                  </td>
                  <td>
                    <Pill kind={STATUS_PILL[s.status]}>{s.status}</Pill>
                  </td>
                  <td className="mono">{s.uptime}%</td>
                  <td className="mono">{s.p95}</td>
                  <td className="mono" style={{ color: s.err > 1 ? "#dc2626" : undefined }}>
                    {s.err}%
                  </td>
                  <td className="mono">
                    {s.deps} ↓ · {dependents(s.name)} ↑
                  </td>
                  <td>
                    <Sparkline
                      data={spark(seedOf(s.name), s.status === "healthy" ? 0 : 1)}
                      color={
                        s.status === "down"
                          ? "#dc2626"
                          : s.status === "degraded"
                            ? "#f59e0b"
                            : "var(--accent)"
                      }
                      w={90}
                      h={26}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-arrow-right-arrow-left" />
            <span className="sn-section-title">Dependency edges</span>
          </div>
          <div className="svc-edges">
            {SERVICE_DEPS.map(([from, to]) => {
              const target = SERVICES.find((s) => s.name === to);
              const bad = target && target.status !== "healthy";
              return (
                <div key={`${from}-${to}`} className="svc-edge">
                  <span className="mono">{from}</span>
                  <i
                    className="fa-solid fa-arrow-right-long"
                    style={{ color: bad ? "#f59e0b" : "var(--fg-subtle)" }}
                  />
                  <span className="mono" style={{ fontWeight: 550 }}>
                    {to}
                  </span>
                  {bad && (
                    <Pill kind={STATUS_PILL[target.status]} noDot>
                      {target.status}
                    </Pill>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-mute" style={{ fontSize: 11.5, marginTop: 10 }}>
            Edges feed blast-radius analysis on the entity map and incident correlation.
          </div>
        </div>
      </div>
    </div>
  );
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
  .svc-two-col{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:18px;align-items:start}
  @media (max-width:1200px){.svc-two-col{grid-template-columns:1fr}}
  .svc-filter-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
  .svc-filter-tab{display:inline-flex;align-items:center;padding:6px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);cursor:pointer;font:inherit;font-size:12px;color:var(--fg)}
  .svc-filter-tab:hover{border-color:var(--accent)}
  .svc-filter-tab.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}
  .svc-edges{display:flex;flex-direction:column;gap:8px}
  .svc-edge{display:flex;align-items:center;gap:10px;font-size:12px;padding:7px 10px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff)}
`;
