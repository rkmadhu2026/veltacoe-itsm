import { Link } from "react-router-dom";
import { Pill } from "@/components";
import { TENANTS, TENANT_USAGE } from "@/data";

// Plan quotas the usage bars measure against.
const QUOTAS: Record<string, { metricsPerSec: number; logGbPerDay: number; devices: number }> = {
  Enterprise: { metricsPerSec: 150_000, logGbPerDay: 500, devices: 1_000 },
  Business: { metricsPerSec: 80_000, logGbPerDay: 400, devices: 500 },
  Growth: { metricsPerSec: 25_000, logGbPerDay: 100, devices: 200 },
};

const fmt = (n: number) => n.toLocaleString("en-US");
const tenantOf = (id: string) => TENANTS.find((t) => t.id === id);

function QuotaBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(100, (used / limit) * 100);
  return (
    <div className="usg-bar">
      <div className="usg-track">
        <div
          className="usg-fill"
          style={{
            width: `${pct}%`,
            background: pct > 90 ? "#dc2626" : pct > 75 ? "#f59e0b" : "var(--accent)",
          }}
        />
      </div>
      <span className="mono usg-pct">{Math.round(pct)}%</span>
    </div>
  );
}

export function AdminUsageScreen() {
  const totals = TENANT_USAGE.reduce(
    (a, t) => ({
      devices: a.devices + t.devices,
      metrics: a.metrics + t.metricsPerSec,
      logs: a.logs + t.logGbPerDay,
      alerts: a.alerts + t.alertsPerDay,
      runs: a.runs + t.automationRuns,
    }),
    { devices: 0, metrics: 0, logs: 0, alerts: 0, runs: 0 },
  );
  const nearLimit = TENANT_USAGE.filter((u) => {
    const q = QUOTAS[tenantOf(u.tenant)?.plan ?? "Growth"];
    return (
      u.metricsPerSec / q.metricsPerSec > 0.75 ||
      u.logGbPerDay / q.logGbPerDay > 0.75 ||
      u.devices / q.devices > 0.75
    );
  }).length;

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
        <span>Usage & quotas</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">ADMIN-USAGE</span>
          {nearLimit > 0 && <Pill kind="warning">{nearLimit} tenants near quota</Pill>}
          <Pill kind="neutral" noDot>
            Metered hourly · soft limits alert at 75%
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Usage &amp; quotas</h1>
          <div className="sn-form-sub">
            {fmt(totals.metrics)} metrics/s · {fmt(totals.logs)} GB logs/day · {fmt(totals.alerts)}{" "}
            alerts/day org-wide · quotas follow each tenant's plan
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/admin/billing" className="sn-btn">
            <i className="fa-solid fa-credit-card" /> Billing
          </Link>
          <Link to="/reports" className="sn-btn">
            <i className="fa-solid fa-chart-column" /> Trends
          </Link>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Devices" value={fmt(totals.devices)} sub="monitored org-wide" tone="neutral" />
        <Kpi label="Metrics/s" value={fmt(totals.metrics)} sub="ingest rate" tone="neutral" />
        <Kpi label="Logs GB/day" value={fmt(totals.logs)} sub="Loki ingest" tone="neutral" />
        <Kpi label="Alerts/day" value={fmt(totals.alerts)} sub="post-dedup" tone="neutral" />
        <Kpi
          label="Near quota"
          value={nearLimit}
          sub="≥75% of a limit"
          tone={nearLimit ? "warn" : "ok"}
        />
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-gauge-high" />
          <span className="sn-section-title">Consumption vs plan quota</span>
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Plan</th>
              <th style={{ width: 170 }}>Devices</th>
              <th style={{ width: 170 }}>Metrics/s</th>
              <th style={{ width: 170 }}>Logs GB/day</th>
              <th>Alerts/day</th>
              <th>Auto runs</th>
            </tr>
          </thead>
          <tbody>
            {TENANT_USAGE.map((u) => {
              const t = tenantOf(u.tenant);
              const q = QUOTAS[t?.plan ?? "Growth"];
              return (
                <tr key={u.tenant}>
                  <td style={{ fontWeight: 600 }}>{t?.name ?? u.tenant}</td>
                  <td className="text-mute">{t?.plan}</td>
                  <td>
                    <div className="usg-cell">
                      <span className="mono usg-num">
                        {fmt(u.devices)} / {fmt(q.devices)}
                      </span>
                      <QuotaBar used={u.devices} limit={q.devices} />
                    </div>
                  </td>
                  <td>
                    <div className="usg-cell">
                      <span className="mono usg-num">
                        {fmt(u.metricsPerSec)} / {fmt(q.metricsPerSec)}
                      </span>
                      <QuotaBar used={u.metricsPerSec} limit={q.metricsPerSec} />
                    </div>
                  </td>
                  <td>
                    <div className="usg-cell">
                      <span className="mono usg-num">
                        {u.logGbPerDay} / {q.logGbPerDay}
                      </span>
                      <QuotaBar used={u.logGbPerDay} limit={q.logGbPerDay} />
                    </div>
                  </td>
                  <td className="mono">{fmt(u.alertsPerDay)}</td>
                  <td className="mono">{u.automationRuns}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="text-mute" style={{ fontSize: 11.5, marginTop: 10 }}>
          Soft limits page the tenant owner at 75% and open a capacity review at 90%; ingestion is
          never dropped without an approved change.
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
  .usg-cell{display:flex;flex-direction:column;gap:4px}
  .usg-num{font-size:11px;color:var(--fg-subtle)}
  .usg-bar{display:flex;align-items:center;gap:6px}
  .usg-track{flex:1;height:6px;background:var(--bg-muted,#f8fafc);border-radius:3px;overflow:hidden}
  .usg-fill{height:100%;border-radius:3px}
  .usg-pct{font-size:10.5px;width:32px;text-align:right;color:var(--fg-subtle)}
`;
