import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Pill, Sev, UserById } from "@/components";
import { INCIDENTS, TENANTS } from "@/data";

export function CrossTenantScreen() {
  const [tenantFilter, setTenantFilter] = useState<"all" | string>("all");

  const active = useMemo(() => INCIDENTS.filter((i) => i.status !== "resolved"), []);
  const rows = useMemo(
    () => (tenantFilter === "all" ? active : active.filter((i) => i.tenant === tenantFilter)),
    [active, tenantFilter],
  );

  const sev1 = active.filter((i) => i.sev === 1).length;
  const worst = [...TENANTS].sort((a, b) => a.health - b.health)[0];
  const tenantName = (id: string) => TENANTS.find((t) => t.id === id)?.name ?? id;

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <a className="sn-link">finspot</a>
        <span className="sn-bc-sep">›</span>
        <span>Cross-tenant view</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">XT-OVERVIEW</span>
          {sev1 > 0 && <Pill kind="critical">{sev1} active Sev-1</Pill>}
          <Pill kind="neutral" noDot>
            Read-only rollup · tenant isolation preserved
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Cross-tenant view</h1>
          <div className="sn-form-sub">
            One pane across all {TENANTS.length} tenants — incidents, health, and MTTR without
            switching context · drill-down opens in the tenant's own workspace
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/admin/tenants" className="sn-btn">
            <i className="fa-solid fa-building" /> Tenant admin
          </Link>
          <Link to="/reports" className="sn-btn">
            <i className="fa-solid fa-chart-column" /> Org reports
          </Link>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Tenants" value={TENANTS.length} sub="in this org" tone="neutral" />
        <Kpi
          label="Active incidents"
          value={active.length}
          sub="org-wide"
          tone={active.length ? "warn" : "ok"}
        />
        <Kpi label="Active Sev-1" value={sev1} sub="all tenants" tone={sev1 ? "crit" : "ok"} />
        <Kpi
          label="Lowest health"
          value={worst.health}
          sub={worst.name}
          tone={worst.health < 85 ? "warn" : "ok"}
        />
        <Kpi
          label="Avg MTTR"
          value={`${Math.round(TENANTS.reduce((a, t) => a + t.mttr, 0) / TENANTS.length)}m`}
          sub="weighted equal"
          tone="neutral"
        />
      </div>

      {/* Tenant tiles */}
      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-grip-vertical" />
          <span className="sn-section-title">Tenant posture</span>
        </div>
        <div className="xt-grid">
          {TENANTS.map((t) => {
            const tActive = active.filter((i) => i.tenant === t.id).length;
            return (
              <button
                key={t.id}
                type="button"
                className={`xt-tile ${tenantFilter === t.id ? "active" : ""}`}
                onClick={() => setTenantFilter(tenantFilter === t.id ? "all" : t.id)}
              >
                <span className="xt-tile-head">
                  <Avatar name={t.name} color={t.color} />
                  <span className="xt-tile-name">{t.name}</span>
                  {t.sev1 > 0 && (
                    <Pill kind="critical" noDot>
                      {t.sev1} Sev-1
                    </Pill>
                  )}
                </span>
                <span className="xt-tile-stats">
                  <span>
                    <b>{tActive}</b> active
                  </span>
                  <span>
                    <b>{t.mttr}m</b> MTTR
                  </span>
                  <span>
                    <b>{t.health}</b> health
                  </span>
                </span>
                <span className="xt-tile-bar">
                  <span
                    style={{
                      width: `${t.health}%`,
                      background:
                        t.health < 85 ? "#dc2626" : t.health < 92 ? "#f59e0b" : "var(--accent)",
                    }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Combined incident queue */}
      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-triangle-exclamation" />
          <span className="sn-section-title">
            Active incidents
            {tenantFilter !== "all" ? ` · ${tenantName(tenantFilter)}` : " · all tenants"}
          </span>
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>Incident</th>
              <th>Sev</th>
              <th>Tenant</th>
              <th>Service</th>
              <th>Age</th>
              <th>SLA</th>
              <th>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.id}>
                <td>
                  <div className="mono text-mute" style={{ fontSize: 11 }}>
                    {i.id}
                  </div>
                  <Link to={`/incidents/${i.id}`} style={{ fontWeight: 550 }}>
                    {i.title}
                  </Link>
                </td>
                <td>
                  <Sev n={i.sev} />
                </td>
                <td className="text-mute">{tenantName(i.tenant)}</td>
                <td className="mono text-mute">{i.service}</td>
                <td className="mono">{i.age}</td>
                <td className="mono" style={{ color: i.sla < 30 ? "#dc2626" : undefined }}>
                  {i.sla}%
                </td>
                <td>
                  <UserById id={i.assignee} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-mute" style={{ padding: 18 }}>
                  No active incidents for this tenant.
                </td>
              </tr>
            )}
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
  .xt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
  .xt-tile{display:flex;flex-direction:column;gap:9px;padding:13px 14px;border:1px solid var(--border,#e2e8f0);border-radius:11px;background:var(--bg,#fff);cursor:pointer;font:inherit;text-align:left;color:var(--fg)}
  .xt-tile:hover{border-color:var(--accent)}
  .xt-tile.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
  .xt-tile-head{display:flex;align-items:center;gap:9px}
  .xt-tile-name{font-size:13px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .xt-tile-stats{display:flex;gap:14px;font-size:11.5px;color:var(--fg-subtle)}
  .xt-tile-stats b{color:var(--fg);font-size:12.5px}
  .xt-tile-bar{display:block;height:6px;background:var(--bg-muted,#f8fafc);border-radius:3px;overflow:hidden}
  .xt-tile-bar span{display:block;height:100%;border-radius:3px}
`;
