import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, UserById } from "@/components";
import { CIS } from "@/data";
import type { ServiceStatus } from "@/types";
import type { PillKind } from "@/components";

const HEALTH_PILL: Record<ServiceStatus, PillKind> = {
  healthy: "success",
  degraded: "warning",
  down: "critical",
};

export function CmdbScreen() {
  const classes = useMemo(() => ["all", ...Array.from(new Set(CIS.map((c) => c.cls)))], []);
  const [cls, setCls] = useState("all");

  const rows = useMemo(() => (cls === "all" ? CIS : CIS.filter((c) => c.cls === cls)), [cls]);

  const prod = CIS.filter((c) => c.env === "prod").length;
  const unhealthy = CIS.filter((c) => c.health !== "healthy").length;
  const unowned = CIS.filter((c) => !c.owner).length;

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
        <span>CMDB</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">CMDB-CI</span>
          {unhealthy > 0 && <Pill kind="warning">{unhealthy} CIs unhealthy</Pill>}
          {unowned > 0 && <Pill kind="critical">{unowned} unowned</Pill>}
          <Pill kind="neutral" noDot>
            Reconciled hourly from discovery
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Configuration items</h1>
          <div className="sn-form-sub">
            {CIS.length} CIs across {classes.length - 1} classes · relationships mirrored from the
            asset inventory and service dependency graph
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/infra/assets" className="sn-btn">
            <i className="fa-solid fa-boxes-stacked" /> Asset inventory
          </Link>
          <Link to="/entity-map" className="sn-btn">
            <i className="fa-solid fa-circle-nodes" /> Relationships
          </Link>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New CI
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Total CIs" value={CIS.length} sub="reconciled" tone="neutral" />
        <Kpi label="Production" value={prod} sub="env = prod" tone="neutral" />
        <Kpi
          label="Unhealthy"
          value={unhealthy}
          sub="degraded or down"
          tone={unhealthy ? "warn" : "ok"}
        />
        <Kpi label="Unowned" value={unowned} sub="missing owner" tone={unowned ? "crit" : "ok"} />
        <Kpi label="Classes" value={classes.length - 1} sub="CI classes" tone="neutral" />
        <Kpi label="Drift" value="0" sub="config drift alerts" tone="ok" />
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-sitemap" />
          <span className="sn-section-title">Configuration items</span>
        </div>
        <div className="cmdb-tabs">
          {classes.map((c) => (
            <button
              key={c}
              type="button"
              className={`cmdb-tab ${cls === c ? "active" : ""}`}
              onClick={() => setCls(c)}
            >
              {c === "all" ? "All classes" : c}
            </button>
          ))}
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>CI</th>
              <th>Name</th>
              <th>Class</th>
              <th>Env</th>
              <th>Region</th>
              <th>Owner</th>
              <th>Health</th>
              <th>Deps</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="mono text-mute">{c.id}</td>
                <td style={{ fontWeight: 550 }} className="mono">
                  {c.name}
                </td>
                <td>{c.cls}</td>
                <td>
                  <Pill kind={c.env === "prod" ? "purple" : "neutral"} noDot>
                    {c.env}
                  </Pill>
                </td>
                <td className="mono text-mute">{c.region}</td>
                <td>
                  <UserById id={c.owner} />
                </td>
                <td>
                  <Pill kind={HEALTH_PILL[c.health]}>{c.health}</Pill>
                </td>
                <td className="mono">{c.deps}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
  .cmdb-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
  .cmdb-tab{display:inline-flex;align-items:center;padding:6px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);cursor:pointer;font:inherit;font-size:12px;color:var(--fg)}
  .cmdb-tab:hover{border-color:var(--accent)}
  .cmdb-tab.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}
`;
