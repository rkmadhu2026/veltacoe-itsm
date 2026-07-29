import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Pill } from "@/components";
import {
  ALERT_INSTANCES,
  DEVICES,
  DEVICE_COUNTS,
  DEVICE_KINDS,
  EXPORTERS,
  INFRA_ALERTS,
  SITES,
} from "@/data";
import type { AlertSeverity, InfraAlert, Site } from "@/types";

const SEV_PILL = { critical: "critical", warn: "warning", info: "info" } as const;
const seedOf = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

export function NocOverviewScreen() {
  const stats = useMemo(() => {
    const total = Object.values(DEVICE_COUNTS).reduce((a, b) => a + b, 0);
    const firing = ALERT_INSTANCES.filter((a) => a.state === "firing").length;
    const critical = ALERT_INSTANCES.filter(
      (a) => a.state === "firing" && a.severity === "critical",
    ).length;
    const exportersOk = EXPORTERS.filter((e) => e.status === "ok").length;
    const down = DEVICES.filter((d) => d.status === "down").length;
    const avgHealth = Math.round(SITES.reduce((a, s) => a + s.health, 0) / SITES.length);
    return { total, firing, critical, exportersOk, down, avgHealth };
  }, []);

  const feed = useMemo(() => [...INFRA_ALERTS].slice(0, 8), []);
  const capacityRows = useMemo(
    () =>
      [...DEVICES]
        .filter((d) => d.cpu > 0)
        .sort((a, b) => b.cpu + b.mem - (a.cpu + a.mem))
        .slice(0, 8),
    [],
  );

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>Infrastructure</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">NOC-OPS</span>
          {stats.critical > 0 && <Pill kind="critical">{stats.critical} critical</Pill>}
          {stats.down > 0 && <Pill kind="warning">{stats.down} down</Pill>}
          <Pill kind="success">{stats.avgHealth}% avg health</Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>NOC command center</h1>
          <div className="sn-form-sub">
            {stats.total.toLocaleString()} monitored assets across {SITES.length} sites · live
            health, alert feed, capacity &amp; daily-health heatmaps
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/infra/topology" className="sn-btn">
            <i className="fa-solid fa-circle-nodes" /> Topology
          </Link>
          <Link to="/infra/assets" className="sn-btn">
            <i className="fa-solid fa-boxes-stacked" /> Inventory
          </Link>
          <Link to="/alerts" className="sn-btn primary">
            <i className="fa-solid fa-bell" /> Alerts
          </Link>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <div className="sn-kpi tone-neutral">
          <div className="sn-kpi-l">Assets</div>
          <div className="sn-kpi-v">{stats.total.toLocaleString()}</div>
          <div className="sn-kpi-s">monitored</div>
        </div>
        <div className="sn-kpi tone-crit">
          <div className="sn-kpi-l">Firing alerts</div>
          <div className="sn-kpi-v">{stats.firing}</div>
          <div className="sn-kpi-s">{stats.critical} critical</div>
        </div>
        <div className="sn-kpi tone-crit">
          <div className="sn-kpi-l">Down</div>
          <div className="sn-kpi-v">{stats.down}</div>
          <div className="sn-kpi-s">unreachable</div>
        </div>
        <div className="sn-kpi tone-ok">
          <div className="sn-kpi-l">Exporters</div>
          <div className="sn-kpi-v">
            {stats.exportersOk}/{EXPORTERS.length}
          </div>
          <div className="sn-kpi-s">healthy</div>
        </div>
        <div className="sn-kpi tone-ok">
          <div className="sn-kpi-l">Avg health</div>
          <div className="sn-kpi-v">{stats.avgHealth}%</div>
          <div className="sn-kpi-s">all sites</div>
        </div>
        <div className="sn-kpi tone-neutral">
          <div className="sn-kpi-l">Sites</div>
          <div className="sn-kpi-v">{SITES.length}</div>
          <div className="sn-kpi-s">DC + branch</div>
        </div>
      </div>

      {/* Site health tiles */}
      <div className="noc-sites">
        {SITES.map((s) => (
          <SiteTile key={s.id} site={s} />
        ))}
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          {/* Capacity heatmap */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-gauge-high" />
              <span className="sn-section-title">Capacity saturation · top load</span>
              <span className="sn-section-badge">CPU · Mem · Disk · Net</span>
            </div>
            <div className="sn-section-content">
              <div className="noc-cap">
                <div className="noc-cap-row noc-cap-head">
                  <div className="noc-cap-label" />
                  {["CPU", "Mem", "Disk", "Net"].map((c) => (
                    <div key={c} className="noc-cap-col">
                      {c}
                    </div>
                  ))}
                </div>
                {capacityRows.map((d) => {
                  const seed = seedOf(d.id);
                  const disk = Math.round(40 + (seed % 55));
                  const net = Math.round(20 + ((seed * 7) % 70));
                  const cells = [d.cpu, d.mem, disk, net];
                  return (
                    <Link key={d.id} to={`/infra/device/${d.id}`} className="noc-cap-row">
                      <div className="noc-cap-label mono">{d.id.replace("-BLR", "")}</div>
                      {cells.map((v, i) => (
                        <div
                          key={i}
                          className="noc-cap-cell"
                          style={{ background: satColor(v) }}
                          title={`${v}%`}
                        >
                          {v}
                        </div>
                      ))}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Daily health calendar */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-calendar-check" />
              <span className="sn-section-title">Daily health calendar · last 14 days</span>
              <span className="sn-section-badge">health score / site</span>
            </div>
            <div className="sn-section-content">
              <div className="noc-cal">
                {SITES.map((s, r) => (
                  <div key={s.id} className="noc-cal-row">
                    <div className="noc-cal-label">{s.name}</div>
                    <div className="noc-cal-cells">
                      {Array.from({ length: 14 }, (_, c) => {
                        const v = healthScore(r, c, s.health);
                        return (
                          <div
                            key={c}
                            className="noc-cal-cell"
                            style={{ background: healthColor(v) }}
                            title={`${v}%`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="noc-cal-legend">
                <span>14d ago</span>
                <span style={{ marginLeft: "auto" }}>today →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert feed + device breakdown */}
        <aside className="sn-form-side">
          <div className="sn-side-card">
            <div className="sn-side-head">
              Live alert feed <span className="sn-side-count">{INFRA_ALERTS.length}</span>
            </div>
            <div className="sn-side-body">
              {feed.map((a) => (
                <FeedRow key={a.id} a={a} />
              ))}
              <Link
                to="/alerts"
                className="sn-btn"
                style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              >
                <i className="fa-solid fa-arrow-right" /> All alerts
              </Link>
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">Assets by type</div>
            <div className="sn-side-body">
              <div className="noc-kinds">
                {DEVICE_KINDS.map((k) => (
                  <Link
                    key={k.id}
                    to={`/infra/assets`}
                    className="noc-kind"
                    style={{ textDecoration: "none" }}
                  >
                    <i
                      className={`fa-${k.iconBrand ? "brands" : "solid"} ${k.icon}`}
                      style={{ color: k.color }}
                    />
                    <span className="noc-kind-n">{DEVICE_COUNTS[k.id]}</span>
                    <span className="noc-kind-l">{k.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">Exporter health</div>
            <div className="sn-side-body">
              {EXPORTERS.slice(0, 6).map((e) => (
                <div key={e.name} className="sn-related-row">
                  <div>
                    <div className="sn-related-title mono" style={{ fontSize: 12 }}>
                      {e.name}
                    </div>
                    <div className="sn-related-meta">
                      {e.hosts} hosts · lag {e.lag}
                    </div>
                  </div>
                  <Pill
                    kind={
                      e.status === "ok" ? "success" : e.status === "warn" ? "warning" : "critical"
                    }
                  >
                    {e.status}
                  </Pill>
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

function SiteTile({ site }: { site: Site }) {
  const tone = site.health >= 97 ? "ok" : site.health >= 90 ? "warn" : "crit";
  const color = tone === "ok" ? "#10b981" : tone === "warn" ? "#f59e0b" : "#dc2626";
  const alerts = ALERT_INSTANCES.filter((a) => a.site === site.id && a.state === "firing").length;
  return (
    <div className="noc-site">
      <div className="noc-site-top">
        <div>
          <div className="noc-site-name">{site.name}</div>
          <div className="noc-site-region">
            {site.region} · {site.devices} devices
          </div>
        </div>
        <div className="noc-site-health" style={{ color }}>
          {site.health}%
        </div>
      </div>
      <div className="noc-site-bar">
        <div
          className="noc-site-bar-fill"
          style={{ width: `${site.health}%`, background: color }}
        />
      </div>
      <div className="noc-site-foot">
        {alerts > 0 ? (
          <span style={{ color: "#dc2626" }}>
            <i className="fa-solid fa-bell" /> {alerts} firing
          </span>
        ) : (
          <span className="text-mute">
            <i className="fa-solid fa-check" /> nominal
          </span>
        )}
      </div>
    </div>
  );
}

function FeedRow({ a }: { a: InfraAlert }) {
  const sev = a.sev as AlertSeverity;
  return (
    <div className="noc-feed">
      <Pill kind={SEV_PILL[sev]}>{a.sev}</Pill>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 550 }}>{a.title}</div>
        <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
          <Link to={`/infra/device/${a.device}`} className="sn-link mono">
            {a.device}
          </Link>{" "}
          · {a.since}
        </div>
      </div>
    </div>
  );
}

// Deterministic helpers.
function satColor(v: number): string {
  if (v >= 85) return "rgba(220,38,38,0.85)";
  if (v >= 70) return "rgba(245,158,11,0.8)";
  if (v >= 45) return "rgba(16,185,129,0.55)";
  return "rgba(16,185,129,0.28)";
}
function healthScore(row: number, col: number, base: number): number {
  const wobble = Math.round(Math.sin(row * 1.7 + col * 0.9) * 6 + ((row * 3 + col * 7) % 5) - 2);
  return Math.max(60, Math.min(100, base + wobble));
}
function healthColor(v: number): string {
  if (v >= 97) return "rgba(16,185,129,0.85)";
  if (v >= 92) return "rgba(16,185,129,0.5)";
  if (v >= 85) return "rgba(245,158,11,0.7)";
  return "rgba(220,38,38,0.75)";
}

const STYLES = `
  .noc-sites{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px}
  .noc-site{border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:12px;background:var(--bg,#fff)}
  .noc-site-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
  .noc-site-name{font-weight:600;font-size:13px}
  .noc-site-region{font-size:11px;color:var(--fg-subtle)}
  .noc-site-health{font-size:20px;font-weight:700}
  .noc-site-bar{height:6px;border-radius:999px;background:var(--bg-muted,#f1f5f9);overflow:hidden;margin:8px 0 6px}
  .noc-site-bar-fill{height:100%;border-radius:999px}
  .noc-site-foot{font-size:11.5px}
  .noc-cap{display:flex;flex-direction:column;gap:4px}
  .noc-cap-row{display:grid;grid-template-columns:150px repeat(4,1fr);gap:6px;align-items:center;text-decoration:none;color:inherit}
  .noc-cap-head{font-size:11px;color:var(--fg-subtle);text-align:center}
  .noc-cap-label{font-size:11px;color:var(--fg-subtle)}
  a.noc-cap-row:hover .noc-cap-label{color:var(--accent)}
  .noc-cap-cell{height:26px;border-radius:4px;display:grid;place-items:center;font-size:11px;font-weight:600;color:#fff}
  .noc-cal{display:flex;flex-direction:column;gap:6px}
  .noc-cal-row{display:grid;grid-template-columns:120px 1fr;gap:10px;align-items:center}
  .noc-cal-label{font-size:11.5px;color:var(--fg-subtle)}
  .noc-cal-cells{display:grid;grid-template-columns:repeat(14,1fr);gap:3px}
  .noc-cal-cell{aspect-ratio:1;border-radius:3px;min-height:18px}
  .noc-cal-legend{display:flex;font-size:10.5px;color:var(--fg-subtle);margin-top:8px;padding-left:130px}
  .noc-feed{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-top:1px solid var(--border,#f1f5f9)}
  .noc-feed:first-child{border-top:0}
  .noc-kinds{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .noc-kind{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 4px;border:1px solid var(--border,#e2e8f0);border-radius:8px;color:var(--fg)}
  .noc-kind:hover{border-color:var(--accent)}
  .noc-kind i{font-size:16px}
  .noc-kind-n{font-size:15px;font-weight:700}
  .noc-kind-l{font-size:10px;color:var(--fg-subtle);text-align:center}
  @media(max-width:900px){.noc-cap-row{grid-template-columns:110px repeat(4,1fr)}.noc-cal-row{grid-template-columns:90px 1fr}.noc-cal-legend{padding-left:100px}}
`;
