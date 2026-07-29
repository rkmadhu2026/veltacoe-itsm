import { Link } from "react-router-dom";
import { Pill } from "@/components";
import { SLAS, SLA_ATTAINMENT, TENANTS } from "@/data";

const tenantName = (id: string) => TENANTS.find((t) => t.id === id)?.name ?? id;

export function SlasScreen() {
  const avgCompliance = SLAS.reduce((a, s) => a + s.compliance, 0) / SLAS.length;
  const totalBreaches = SLAS.reduce((a, s) => a + s.breach, 0);
  const sloBreaches = SLA_ATTAINMENT.reduce((a, r) => a + r.breaches, 0);

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
        <span>SLA definitions</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">SLA-DEF</span>
          {totalBreaches > 0 && <Pill kind="warning">{totalBreaches} breaches this window</Pill>}
          <Pill kind="neutral" noDot>
            Timers pause outside coverage windows
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>SLA definitions</h1>
          <div className="sn-form-sub">
            {SLAS.length} response/resolution SLAs · {SLA_ATTAINMENT.length} availability SLOs ·
            attainment reported monthly in the compliance pack
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/reports" className="sn-btn">
            <i className="fa-solid fa-chart-column" /> Attainment report
          </Link>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New SLA
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="SLA definitions" value={SLAS.length} sub="active timers" tone="neutral" />
        <Kpi
          label="Avg compliance"
          value={`${avgCompliance.toFixed(1)}%`}
          sub="response + resolution"
          tone={avgCompliance < 92 ? "warn" : "ok"}
        />
        <Kpi
          label="SLA breaches"
          value={totalBreaches}
          sub="this window"
          tone={totalBreaches ? "warn" : "ok"}
        />
        <Kpi label="Availability SLOs" value={SLA_ATTAINMENT.length} sub="tracked" tone="neutral" />
        <Kpi
          label="SLO breaches"
          value={sloBreaches}
          sub="error budget exhausted"
          tone={sloBreaches ? "warn" : "ok"}
        />
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-stopwatch" />
          <span className="sn-section-title">Response &amp; resolution SLAs</span>
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>SLA</th>
              <th>Name</th>
              <th>Target</th>
              <th>Coverage</th>
              <th style={{ width: 220 }}>Compliance</th>
              <th>Breaches</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {SLAS.map((s) => {
              const warn = s.compliance < 92;
              const crit = s.compliance < 85;
              return (
                <tr key={s.id}>
                  <td className="mono text-mute">{s.id}</td>
                  <td style={{ fontWeight: 550 }}>{s.name}</td>
                  <td className="mono">{s.target}</td>
                  <td className="mono text-mute">{s.window}</td>
                  <td>
                    <div className="sla-bar">
                      <div className="sla-bar-track">
                        <div
                          className="sla-bar-fill"
                          style={{
                            width: `${s.compliance}%`,
                            background: crit ? "#dc2626" : warn ? "#f59e0b" : "var(--accent)",
                          }}
                        />
                      </div>
                      <span className="mono sla-bar-pct">{s.compliance}%</span>
                    </div>
                  </td>
                  <td className="mono">{s.breach}</td>
                  <td>
                    {crit ? (
                      <Pill kind="critical">Failing</Pill>
                    ) : warn ? (
                      <Pill kind="warning">At risk</Pill>
                    ) : (
                      <Pill kind="success">Meeting</Pill>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-signal" />
          <span className="sn-section-title">Availability SLOs · current window</span>
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Tenant</th>
              <th>Target</th>
              <th>Attained</th>
              <th>Error budget left</th>
              <th>Breaches</th>
            </tr>
          </thead>
          <tbody>
            {SLA_ATTAINMENT.map((r) => (
              <tr key={`${r.tenant}-${r.service}`}>
                <td style={{ fontWeight: 550 }}>{r.service}</td>
                <td className="text-mute">{tenantName(r.tenant)}</td>
                <td className="mono">{r.targetPct}%</td>
                <td
                  className="mono"
                  style={{
                    fontWeight: 600,
                    color: r.attainedPct < r.targetPct ? "#dc2626" : undefined,
                  }}
                >
                  {r.attainedPct}%
                </td>
                <td className="mono">{r.errorBudgetLeftPct}%</td>
                <td className="mono">{r.breaches}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-mute" style={{ fontSize: 11.5, marginTop: 10 }}>
          Availability SLOs are computed from synthetic checks and alert downtime; the monthly SLA
          compliance pack ships on the 1st at 09:00 IST.
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
  .sla-bar{display:flex;align-items:center;gap:8px}
  .sla-bar-track{flex:1;height:7px;background:var(--bg-muted,#f8fafc);border-radius:4px;overflow:hidden}
  .sla-bar-fill{height:100%;border-radius:4px}
  .sla-bar-pct{font-size:11px;width:44px;text-align:right;color:var(--fg-subtle)}
`;
