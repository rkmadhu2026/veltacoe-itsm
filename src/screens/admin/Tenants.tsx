import { Link } from "react-router-dom";
import { Avatar, Pill } from "@/components";
import { TENANTS } from "@/data";
import type { PillKind } from "@/components";

const PLAN_PILL: Record<string, PillKind> = {
  Enterprise: "purple",
  Business: "info",
  Growth: "teal",
};

const fmt = (n: number) => n.toLocaleString("en-US");

export function AdminTenantsScreen() {
  const totalUsers = TENANTS.reduce((a, t) => a + t.users, 0);
  const totalSpend = TENANTS.reduce((a, t) => a + t.spend, 0);
  const totalSev1 = TENANTS.reduce((a, t) => a + t.sev1, 0);
  const avgHealth = Math.round(TENANTS.reduce((a, t) => a + t.health, 0) / TENANTS.length);

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Super-admin</a>
        <span className="sn-bc-sep">›</span>
        <span>Tenants</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">ADMIN-TEN</span>
          {totalSev1 > 0 && <Pill kind="critical">{totalSev1} Sev-1 across tenants</Pill>}
          <Pill kind="neutral" noDot>
            Org: finspot · data isolated per tenant
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Tenants</h1>
          <div className="sn-form-sub">
            {TENANTS.length} tenants · {fmt(totalUsers)} seats · Keycloak realms and Prometheus
            scrape configs provisioned automatically on create
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/admin/billing" className="sn-btn">
            <i className="fa-solid fa-credit-card" /> Billing
          </Link>
          <Link to="/admin/usage" className="sn-btn">
            <i className="fa-solid fa-gauge-high" /> Usage
          </Link>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New tenant
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Tenants" value={TENANTS.length} sub="active" tone="neutral" />
        <Kpi label="Seats" value={fmt(totalUsers)} sub="licensed users" tone="neutral" />
        <Kpi
          label="Avg health"
          value={avgHealth}
          sub="weighted equal"
          tone={avgHealth < 90 ? "warn" : "ok"}
        />
        <Kpi
          label="Active Sev-1"
          value={totalSev1}
          sub="org-wide"
          tone={totalSev1 ? "crit" : "ok"}
        />
        <Kpi label="MRR" value={`$${fmt(totalSpend)}`} sub="monthly recurring" tone="ok" />
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-building" />
          <span className="sn-section-title">Tenant registry</span>
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Plan</th>
              <th>Seats</th>
              <th>Open incidents</th>
              <th>Sev-1</th>
              <th style={{ width: 180 }}>Health</th>
              <th>MTTR</th>
              <th>Spend / mo</th>
            </tr>
          </thead>
          <tbody>
            {TENANTS.map((t) => (
              <tr key={t.id}>
                <td>
                  <div className="adm-tenant">
                    <Avatar name={t.name} color={t.color} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div className="mono text-mute" style={{ fontSize: 11 }}>
                        {t.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <Pill kind={PLAN_PILL[t.plan] ?? "neutral"} noDot>
                    {t.plan}
                  </Pill>
                </td>
                <td className="mono">{fmt(t.users)}</td>
                <td className="mono">{t.incidents}</td>
                <td>
                  {t.sev1 > 0 ? (
                    <Pill kind="critical" noDot>
                      {t.sev1}
                    </Pill>
                  ) : (
                    <span className="text-mute">0</span>
                  )}
                </td>
                <td>
                  <div className="adm-health">
                    <div className="adm-health-track">
                      <div
                        className="adm-health-fill"
                        style={{
                          width: `${t.health}%`,
                          background:
                            t.health < 85 ? "#dc2626" : t.health < 92 ? "#f59e0b" : "var(--accent)",
                        }}
                      />
                    </div>
                    <span className="mono" style={{ fontSize: 11 }}>
                      {t.health}
                    </span>
                  </div>
                </td>
                <td className="mono">{t.mttr}m</td>
                <td className="mono" style={{ fontWeight: 600 }}>
                  ${fmt(t.spend)}
                </td>
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
  .adm-tenant{display:flex;align-items:center;gap:10px}
  .adm-health{display:flex;align-items:center;gap:8px}
  .adm-health-track{flex:1;height:7px;background:var(--bg-muted,#f8fafc);border-radius:4px;overflow:hidden}
  .adm-health-fill{height:100%;border-radius:4px}
`;
