import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, BarChart, Pill, UserById } from "@/components";
import {
  ALERT_FUNNEL,
  OPS_TREND,
  REPORT_DEFINITIONS,
  SLA_ATTAINMENT,
  TENANT_USAGE,
  TENANTS,
} from "@/data";
import type { ReportCadence, ReportRunState } from "@/types";
import type { PillKind } from "@/components";

const RUN_PILL: Record<ReportRunState, PillKind> = {
  ok: "success",
  failed: "critical",
  running: "info",
};

const FORMAT_PILL: Record<string, PillKind> = {
  pdf: "purple",
  csv: "teal",
  html: "amber",
};

const CADENCES: readonly ("all" | ReportCadence)[] = [
  "all",
  "daily",
  "weekly",
  "monthly",
  "quarterly",
];

const fmt = (n: number) => n.toLocaleString("en-US");

const tenantName = (id: string) => TENANTS.find((t) => t.id === id)?.name ?? id;

export function ReportsScreen() {
  const [cadence, setCadence] = useState<"all" | ReportCadence>("all");

  const reports = useMemo(
    () =>
      cadence === "all"
        ? REPORT_DEFINITIONS
        : REPORT_DEFINITIONS.filter((r) => r.cadence === cadence),
    [cadence],
  );

  const latest = OPS_TREND[OPS_TREND.length - 1];
  const prev = OPS_TREND[OPS_TREND.length - 2];
  const fleetAttained =
    SLA_ATTAINMENT.reduce((a, r) => a + r.attainedPct, 0) / SLA_ATTAINMENT.length;
  const breaches = SLA_ATTAINMENT.reduce((a, r) => a + r.breaches, 0);
  const rawAlerts = ALERT_FUNNEL[0].count;
  const paged = ALERT_FUNNEL[ALERT_FUNNEL.length - 1].count;
  const noiseReduction = (100 - (paged / rawAlerts) * 100).toFixed(2);
  const totalCost = TENANT_USAGE.reduce((a, t) => a + t.monthlyCostUsd, 0);

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Build</a>
        <span className="sn-bc-sep">›</span>
        <span>Reports &amp; analytics</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">REP-ANALYTICS</span>
          {breaches > 0 && <Pill kind="warning">{breaches} SLA breaches this window</Pill>}
          <Pill kind="neutral" noDot>
            30-day window · IST
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Reports &amp; analytics</h1>
          <div className="sn-form-sub">
            {REPORT_DEFINITIONS.length} scheduled reports · {SLA_ATTAINMENT.length} SLA-tracked
            services · reliability, noise, and spend rolled up across {TENANT_USAGE.length} tenants
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/slas" className="sn-btn">
            <i className="fa-solid fa-stopwatch" /> SLA definitions
          </Link>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-file-export" /> Export pack
          </button>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New report
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi
          label="MTTR"
          value={`${latest.mttrMin}m`}
          sub={`${prev.mttrMin - latest.mttrMin}m better vs ${prev.month}`}
          tone="ok"
        />
        <Kpi label="MTTA" value={`${latest.mttaMin}m`} sub="mean time to acknowledge" tone="ok" />
        <Kpi
          label="Incidents MTD"
          value={latest.incidents}
          sub={`${latest.month} to date`}
          tone="neutral"
        />
        <Kpi
          label="SLA attainment"
          value={`${fleetAttained.toFixed(3)}%`}
          sub="fleet, weighted equal"
          tone={breaches ? "warn" : "ok"}
        />
        <Kpi
          label="Change failure"
          value={`${latest.changeFailPct}%`}
          sub="rollbacks / changes"
          tone={latest.changeFailPct > 8 ? "warn" : "ok"}
        />
        <Kpi
          label="Noise reduction"
          value={`${noiseReduction}%`}
          sub="raw alerts → pages"
          tone="ok"
        />
      </div>

      {/* Reliability trend */}
      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-chart-line" />
          <span className="sn-section-title">Reliability trend · 6 months</span>
        </div>
        <div className="rep-trend">
          <div className="rep-chart-card">
            <div className="rep-chart-title">
              Incidents per month <span className="text-mute">· all severities</span>
            </div>
            <AreaChart data={OPS_TREND.map((m) => m.incidents)} h={120} />
            <MonthAxis />
          </div>
          <div className="rep-chart-card">
            <div className="rep-chart-title">
              MTTR minutes <span className="text-mute">· lower is better</span>
            </div>
            <BarChart data={OPS_TREND.map((m) => m.mttrMin)} h={120} color="#14b8a6" />
            <MonthAxis />
          </div>
          <div className="rep-chart-card">
            <div className="rep-chart-title">
              Change failure % <span className="text-mute">· failed or rolled back</span>
            </div>
            <BarChart data={OPS_TREND.map((m) => m.changeFailPct)} h={120} color="#f59e0b" />
            <MonthAxis />
          </div>
        </div>
      </div>

      {/* Alert funnel */}
      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-filter" />
          <span className="sn-section-title">Alert funnel · last 30 days</span>
        </div>
        <div className="rep-funnel">
          {ALERT_FUNNEL.map((s, i) => {
            const pct = (s.count / rawAlerts) * 100;
            return (
              <div key={s.stage} className="rep-funnel-row">
                <div className="rep-funnel-label">
                  <div className="rep-funnel-stage">{s.stage}</div>
                  <div className="rep-funnel-note">{s.note}</div>
                </div>
                <div className="rep-funnel-track">
                  <div
                    className="rep-funnel-bar"
                    style={{
                      width: `${Math.max(pct, 0.75)}%`,
                      opacity: 1 - i * 0.13,
                    }}
                  />
                </div>
                <div className="rep-funnel-count mono">{fmt(s.count)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SLA attainment */}
      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-stopwatch" />
          <span className="sn-section-title">SLA attainment · current window</span>
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Tenant</th>
              <th>Target</th>
              <th>Attained</th>
              <th style={{ width: 220 }}>Error budget left</th>
              <th>Breaches</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {SLA_ATTAINMENT.map((r) => {
              const breached = r.attainedPct < r.targetPct;
              const atRisk = !breached && r.errorBudgetLeftPct < 25;
              return (
                <tr key={`${r.tenant}-${r.service}`}>
                  <td style={{ fontWeight: 550 }}>{r.service}</td>
                  <td className="text-mute">{tenantName(r.tenant)}</td>
                  <td className="mono">{r.targetPct}%</td>
                  <td className="mono" style={{ fontWeight: 600 }}>
                    {r.attainedPct}%
                  </td>
                  <td>
                    <div className="rep-budget">
                      <div className="rep-budget-track">
                        <div
                          className="rep-budget-fill"
                          style={{
                            width: `${r.errorBudgetLeftPct}%`,
                            background: breached ? "#dc2626" : atRisk ? "#f59e0b" : "var(--accent)",
                          }}
                        />
                      </div>
                      <span className="mono rep-budget-pct">{r.errorBudgetLeftPct}%</span>
                    </div>
                  </td>
                  <td className="mono">{r.breaches}</td>
                  <td>
                    {breached ? (
                      <Pill kind="critical">Breached</Pill>
                    ) : atRisk ? (
                      <Pill kind="warning">At risk</Pill>
                    ) : (
                      <Pill kind="success">Healthy</Pill>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rep-two-col">
        {/* Tenant usage & cost */}
        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-building" />
            <span className="sn-section-title">
              Tenant usage &amp; spend · ${fmt(totalCost)}/mo total
            </span>
          </div>
          <table className="sn-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Devices</th>
                <th>Metrics/s</th>
                <th>Logs GB/d</th>
                <th>Alerts/d</th>
                <th>Auto runs</th>
                <th>Spend/mo</th>
              </tr>
            </thead>
            <tbody>
              {TENANT_USAGE.map((t) => (
                <tr key={t.tenant}>
                  <td style={{ fontWeight: 550 }}>{tenantName(t.tenant)}</td>
                  <td className="mono">{fmt(t.devices)}</td>
                  <td className="mono">{fmt(t.metricsPerSec)}</td>
                  <td className="mono">{t.logGbPerDay}</td>
                  <td className="mono">{fmt(t.alertsPerDay)}</td>
                  <td className="mono">{t.automationRuns}</td>
                  <td className="mono" style={{ fontWeight: 600 }}>
                    ${fmt(t.monthlyCostUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scheduled reports */}
        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-calendar-check" />
            <span className="sn-section-title">Scheduled reports</span>
          </div>
          <div className="rep-cadence-tabs">
            {CADENCES.map((c) => (
              <button
                key={c}
                type="button"
                className={`rep-cadence-tab ${cadence === c ? "active" : ""}`}
                onClick={() => setCadence(c)}
              >
                {c === "all" ? "All" : c[0].toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          <div className="rep-list">
            {reports.map((r) => (
              <div key={r.id} className="rep-card">
                <div className="rep-card-head">
                  <span className="rep-card-name">{r.name}</span>
                  <Pill kind={RUN_PILL[r.lastRunState]}>
                    {r.lastRunState === "ok"
                      ? "Delivered"
                      : r.lastRunState === "failed"
                        ? "Failed"
                        : "Running"}
                  </Pill>
                </div>
                <div className="rep-card-desc">{r.description}</div>
                <div className="rep-card-meta">
                  <Pill kind={FORMAT_PILL[r.format]} noDot>
                    {r.format.toUpperCase()}
                  </Pill>
                  <span className="text-mute">
                    {r.schedule} · {r.audience} · {r.recipients} recipients · last run {r.lastRun}
                  </span>
                </div>
                <div className="rep-card-owner">
                  <UserById id={r.owner} />
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="text-mute" style={{ padding: "16px 4px", fontSize: 12.5 }}>
                No reports on this cadence.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthAxis() {
  return (
    <div className="rep-axis">
      {OPS_TREND.map((m) => (
        <span key={m.month}>{m.month}</span>
      ))}
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
  .rep-trend{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
  .rep-chart-card{border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;background:var(--bg,#fff)}
  .rep-chart-title{font-size:12.5px;font-weight:600;margin-bottom:10px}
  .rep-axis{display:flex;justify-content:space-between;margin-top:6px;font-size:10px;color:var(--fg-subtle)}
  .rep-funnel{display:flex;flex-direction:column;gap:8px}
  .rep-funnel-row{display:grid;grid-template-columns:280px 1fr 110px;gap:12px;align-items:center}
  .rep-funnel-stage{font-size:12.5px;font-weight:550}
  .rep-funnel-note{font-size:11px;color:var(--fg-subtle)}
  .rep-funnel-track{height:18px;background:var(--bg-muted,#f8fafc);border-radius:5px;overflow:hidden}
  .rep-funnel-bar{height:100%;background:var(--accent);border-radius:5px;min-width:3px}
  .rep-funnel-count{font-size:12px;text-align:right}
  .rep-budget{display:flex;align-items:center;gap:8px}
  .rep-budget-track{flex:1;height:7px;background:var(--bg-muted,#f8fafc);border-radius:4px;overflow:hidden}
  .rep-budget-fill{height:100%;border-radius:4px}
  .rep-budget-pct{font-size:11px;width:34px;text-align:right;color:var(--fg-subtle)}
  .rep-two-col{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:18px;align-items:start}
  @media (max-width:1200px){.rep-two-col{grid-template-columns:1fr}}
  .rep-cadence-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
  .rep-cadence-tab{display:inline-flex;align-items:center;padding:6px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);cursor:pointer;font:inherit;font-size:12px;color:var(--fg)}
  .rep-cadence-tab:hover{border-color:var(--accent)}
  .rep-cadence-tab.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}
  .rep-list{display:flex;flex-direction:column;gap:10px}
  .rep-card{border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:12px 14px;background:var(--bg,#fff)}
  .rep-card-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:4px}
  .rep-card-name{font-size:13px;font-weight:600}
  .rep-card-desc{font-size:12px;color:var(--fg-subtle);margin-bottom:8px}
  .rep-card-meta{display:flex;align-items:center;gap:8px;font-size:11.5px;flex-wrap:wrap;margin-bottom:8px}
  .rep-card-owner{border-top:1px solid var(--border,#e2e8f0);padding-top:8px}
`;
