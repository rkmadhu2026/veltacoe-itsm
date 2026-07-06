import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, UserById } from "@/components";
import { CHANGES } from "@/data";
import type { ChangeRisk, ChangeState } from "@/types";
import type { PillKind } from "@/components";

const STATE_PILL: Record<ChangeState, PillKind> = {
  Draft: "neutral",
  "CAB review": "warning",
  Approved: "info",
  Scheduled: "purple",
  Implementing: "amber",
  Completed: "success",
  Failed: "critical",
};

const RISK_PILL: Record<ChangeRisk, PillKind> = {
  Low: "success",
  Moderate: "warning",
  High: "critical",
};

const TYPE_PILL: Record<string, PillKind> = {
  Emergency: "critical",
  Normal: "info",
  Standard: "neutral",
};

const STATES: readonly ("all" | ChangeState)[] = [
  "all",
  "Draft",
  "CAB review",
  "Approved",
  "Scheduled",
  "Implementing",
  "Completed",
];

export function ChangesScreen() {
  const [state, setState] = useState<"all" | ChangeState>("all");

  const rows = useMemo(
    () => (state === "all" ? CHANGES : CHANGES.filter((c) => c.state === state)),
    [state],
  );

  const pendingApproval = CHANGES.filter((c) => c.approved < c.approvers).length;
  const emergency = CHANGES.filter((c) => c.type === "Emergency").length;
  const highRisk = CHANGES.filter((c) => c.risk === "High").length;
  const implementing = CHANGES.filter((c) => c.state === "Implementing").length;

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>Change management</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">CHG-QUEUE</span>
          {emergency > 0 && <Pill kind="critical">{emergency} emergency</Pill>}
          {highRisk > 0 && <Pill kind="warning">{highRisk} high risk</Pill>}
          <Pill kind="neutral" noDot>
            CAB-gated · dual approval on high risk
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Change management</h1>
          <div className="sn-form-sub">
            {CHANGES.length} changes in flight · {pendingApproval} awaiting approver sign-off ·{" "}
            {implementing} implementing now
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/automation" className="sn-btn">
            <i className="fa-solid fa-robot" /> Automation guardrails
          </Link>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New change
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="In flight" value={CHANGES.length} sub="all states" tone="neutral" />
        <Kpi
          label="Awaiting approval"
          value={pendingApproval}
          sub="approver sign-off pending"
          tone={pendingApproval ? "warn" : "ok"}
        />
        <Kpi
          label="Emergency"
          value={emergency}
          sub="expedited CAB"
          tone={emergency ? "crit" : "ok"}
        />
        <Kpi
          label="High risk"
          value={highRisk}
          sub="dual approval"
          tone={highRisk ? "warn" : "ok"}
        />
        <Kpi label="Implementing" value={implementing} sub="in progress now" tone="neutral" />
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-code-branch" />
          <span className="sn-section-title">Change queue</span>
        </div>
        <div className="chg-tabs">
          {STATES.map((s) => (
            <button
              key={s}
              type="button"
              className={`chg-tab ${state === s ? "active" : ""}`}
              onClick={() => setState(s)}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>Change</th>
              <th>Type</th>
              <th>State</th>
              <th>Risk</th>
              <th>Window</th>
              <th>Service</th>
              <th style={{ width: 140 }}>Approvals</th>
              <th>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="mono text-mute" style={{ fontSize: 11 }}>
                    {c.id}
                  </div>
                  <Link to={`/changes/${c.id}`} style={{ fontWeight: 550 }}>
                    {c.title}
                  </Link>
                </td>
                <td>
                  <Pill kind={TYPE_PILL[c.type]} noDot>
                    {c.type}
                  </Pill>
                </td>
                <td>
                  <Pill kind={STATE_PILL[c.state]}>{c.state}</Pill>
                </td>
                <td>
                  <Pill kind={RISK_PILL[c.risk]} noDot>
                    {c.risk}
                  </Pill>
                </td>
                <td className="text-mute" style={{ fontSize: 12 }}>
                  {c.window}
                </td>
                <td className="mono text-mute">{c.service}</td>
                <td>
                  <div className="chg-approvals">
                    <div className="chg-approvals-track">
                      <div
                        className="chg-approvals-fill"
                        style={{
                          width: `${c.approvers ? (c.approved / c.approvers) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="mono" style={{ fontSize: 11 }}>
                      {c.approved}/{c.approvers}
                    </span>
                  </div>
                </td>
                <td>
                  <UserById id={c.assignee} />
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
  .chg-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
  .chg-tab{display:inline-flex;align-items:center;padding:6px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);cursor:pointer;font:inherit;font-size:12px;color:var(--fg)}
  .chg-tab:hover{border-color:var(--accent)}
  .chg-tab.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}
  .chg-approvals{display:flex;align-items:center;gap:6px}
  .chg-approvals-track{flex:1;height:6px;background:var(--bg-muted,#f8fafc);border-radius:3px;overflow:hidden}
  .chg-approvals-fill{height:100%;background:var(--accent);border-radius:3px}
`;
