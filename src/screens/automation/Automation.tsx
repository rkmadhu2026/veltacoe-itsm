import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, UserById } from "@/components";
import {
  AUTOMATION_ACTIONS,
  AUTOMATION_EXECUTIONS,
  NEVER_AUTOMATE,
  TENANTS,
  automationActionById,
} from "@/data";
import type { AutomationExecution, AutomationTier, ExecutionState } from "@/types";
import type { PillKind } from "@/components";

const STATE_PILL: Record<ExecutionState, PillKind> = {
  PROPOSED: "neutral",
  AWAITING_APPROVAL: "warning",
  APPROVED: "info",
  RUNNING: "info",
  SUCCEEDED: "success",
  FAILED: "critical",
  ROLLED_BACK: "purple",
  REJECTED: "neutral",
};

const TIER_PILL: Record<AutomationTier, PillKind> = {
  safe: "success",
  guarded: "warning",
  forbidden: "critical",
};

const tenantName = (id: string) => TENANTS.find((t) => t.id === id)?.name ?? id;

export function AutomationScreen() {
  // Local demo state: approvals decided in-session move out of the queue.
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});

  const pending = useMemo(
    () => AUTOMATION_EXECUTIONS.filter((e) => e.state === "AWAITING_APPROVAL" && !decisions[e.id]),
    [decisions],
  );

  const stats = useMemo(() => {
    const running = AUTOMATION_EXECUTIONS.filter(
      (e) => e.state === "RUNNING" || e.state === "APPROVED",
    ).length;
    const succeeded = AUTOMATION_EXECUTIONS.filter((e) => e.state === "SUCCEEDED").length;
    const rolledBack = AUTOMATION_EXECUTIONS.filter((e) => e.state === "ROLLED_BACK").length;
    const totalRuns = AUTOMATION_ACTIONS.reduce((a, x) => a + x.runs, 0);
    return { running, succeeded, rolledBack, totalRuns };
  }, []);

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Build</a>
        <span className="sn-bc-sep">›</span>
        <span>Automation</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">ST2-CTRL</span>
          {pending.length > 0 && <Pill kind="warning">{pending.length} awaiting approval</Pill>}
          <Pill kind="neutral" noDot>
            StackStorm executes · LinkedEye approves
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Automation control plane</h1>
          <div className="sn-form-sub">
            Every run needs a requester, a reason, an incident reference, an approval, and a
            rollback plan — recorded to the immutable audit trail. OPA authorizes production runs.
          </div>
        </div>
        <div className="sn-form-actions">
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-clipboard-list" /> Audit trail
          </button>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-book" /> Runbooks
          </button>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> Propose action
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi
          label="Awaiting approval"
          value={pending.length}
          sub="human gate"
          tone={pending.length ? "warn" : "ok"}
        />
        <Kpi label="Running" value={stats.running} sub="approved · executing" tone="neutral" />
        <Kpi label="Succeeded" value={stats.succeeded} sub="recent window" tone="ok" />
        <Kpi
          label="Rolled back"
          value={stats.rolledBack}
          sub="plan executed"
          tone={stats.rolledBack ? "warn" : "ok"}
        />
        <Kpi
          label="Catalog actions"
          value={AUTOMATION_ACTIONS.length}
          sub="safe + guarded"
          tone="neutral"
        />
        <Kpi
          label="Lifetime runs"
          value={stats.totalRuns.toLocaleString()}
          sub="all actions"
          tone="neutral"
        />
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          {/* Approval queue */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-user-check" />
              <span className="sn-section-title">Approval queue</span>
              <span className="sn-section-badge">{pending.length} pending</span>
            </div>
            <div className="sn-section-content auto-queue">
              {pending.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--fg-subtle)", margin: 0 }}>
                  Queue clear — nothing awaiting approval.
                </p>
              ) : (
                pending.map((e) => (
                  <ApprovalCard
                    key={e.id}
                    e={e}
                    onDecide={(d) => setDecisions((p) => ({ ...p, [e.id]: d }))}
                  />
                ))
              )}
            </div>
          </div>

          {/* Execution history */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-clock-rotate-left" />
              <span className="sn-section-title">Execution history</span>
              <span className="sn-section-badge">immutable · append-only</span>
            </div>
            <div className="sn-section-content">
              <table className="sn-list-table">
                <thead>
                  <tr>
                    <th style={{ width: 150 }}>State</th>
                    <th>Action · target</th>
                    <th style={{ width: 110 }}>Incident</th>
                    <th style={{ width: 120 }}>Requested by</th>
                    <th style={{ width: 110 }}>Decision</th>
                    <th style={{ width: 90 }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {AUTOMATION_EXECUTIONS.map((e) => {
                    const action = automationActionById(e.actionId);
                    const localDecision = decisions[e.id];
                    const state: ExecutionState = localDecision
                      ? localDecision === "approved"
                        ? "APPROVED"
                        : "REJECTED"
                      : e.state;
                    return (
                      <tr key={e.id}>
                        <td>
                          <Pill kind={STATE_PILL[state]}>
                            {state.replace(/_/g, " ").toLowerCase()}
                          </Pill>
                        </td>
                        <td>
                          <div style={{ fontWeight: 550, fontSize: 12.5 }}>{action?.name}</div>
                          <div className="mono text-mute" style={{ fontSize: 11 }}>
                            {e.target}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{e.reason}</div>
                          {e.output && (
                            <div className="auto-output mono">
                              <i className="fa-solid fa-terminal" /> {e.output}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="sn-link mono" style={{ fontSize: 11.5 }}>
                            {e.incidentRef}
                          </span>
                          <div style={{ fontSize: 10.5, color: "var(--fg-subtle)" }}>
                            {tenantName(e.tenant)}
                          </div>
                        </td>
                        <td>
                          <UserById id={e.requestedBy} showName />
                        </td>
                        <td>
                          {e.decidedBy ? (
                            <div title={e.decisionNote}>
                              <UserById id={e.decidedBy} showName={false} />
                            </div>
                          ) : (
                            <span
                              className="text-mute"
                              style={{ fontSize: 11, fontStyle: "italic" }}
                            >
                              pending
                            </span>
                          )}
                        </td>
                        <td className="mono text-mute" style={{ fontSize: 11 }}>
                          {e.requestedAt}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action catalog */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-boxes-stacked" />
              <span className="sn-section-title">Action catalog</span>
              <span className="sn-section-badge">
                StackStorm endpoint stored as Vault reference
              </span>
            </div>
            <div className="sn-section-content auto-catalog">
              {AUTOMATION_ACTIONS.map((a) => (
                <div key={a.id} className="auto-card">
                  <div className="auto-card-head">
                    <b>{a.name}</b>
                    <Pill kind={TIER_PILL[a.tier]}>{a.tier}</Pill>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--fg-subtle)" }}>
                    {a.st2Action}
                  </div>
                  <p style={{ fontSize: 11.5, margin: "6px 0", color: "var(--fg-subtle)" }}>
                    {a.description}
                  </p>
                  <div className="auto-card-foot">
                    <span className="mono">{a.runs.toLocaleString()} runs</span>
                    {a.rollbackPlan && (
                      <span title={a.rollbackPlan}>
                        <i className="fa-solid fa-rotate-left" /> rollback plan
                      </span>
                    )}
                    {a.runbook && (
                      <span
                        className="mono"
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        <i className="fa-solid fa-book" /> {a.runbook}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="sn-form-side">
          <div className="sn-side-card">
            <div className="sn-side-head">Guardrails</div>
            <div className="sn-side-body">
              <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: "0 0 8px" }}>
                Never automated — human hands only, always:
              </p>
              {NEVER_AUTOMATE.map((n) => (
                <div key={n} className="auto-never">
                  <i className="fa-solid fa-ban" /> {n}
                </div>
              ))}
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">Policy gates</div>
            <div className="sn-side-body">
              {[
                ["fa-fingerprint", "Keycloak identity", "requester + approver must differ"],
                [
                  "fa-scale-balanced",
                  "OPA authorization",
                  "tenant/site/environment scope enforced",
                ],
                ["fa-link", "Incident reference", "no run without a linked INC/CHG"],
                ["fa-rotate-left", "Rollback plan", "required for guarded tier"],
                ["fa-clipboard-list", "Audit record", "append-only, written before execution"],
              ].map(([ic, t, d]) => (
                <div key={t} className="auto-gate">
                  <i className={`fa-solid ${ic}`} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 550 }}>{t}</div>
                    <div style={{ fontSize: 10.5, color: "var(--fg-subtle)" }}>{d}</div>
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

function ApprovalCard({
  e,
  onDecide,
}: {
  e: AutomationExecution;
  onDecide: (d: "approved" | "rejected") => void;
}) {
  const action = automationActionById(e.actionId);
  return (
    <div className="auto-approval">
      <div className="auto-approval-head">
        <Pill kind={TIER_PILL[action?.tier ?? "safe"]}>{action?.tier}</Pill>
        <b>{action?.name}</b>
        <span className="mono text-mute" style={{ fontSize: 11 }}>
          {e.id}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--fg-subtle)" }}>
          {e.requestedAt}
        </span>
      </div>
      <div className="mono" style={{ fontSize: 11.5 }}>
        {e.target}
      </div>
      <div style={{ fontSize: 12 }}>{e.reason}</div>
      <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
        <UserById id={e.requestedBy} showName /> · incident{" "}
        <span className="sn-link mono">{e.incidentRef}</span> · {tenantName(e.tenant)}
      </div>
      {action?.rollbackPlan && (
        <div className="auto-rollback">
          <i className="fa-solid fa-rotate-left" /> Rollback: {action.rollbackPlan}
        </div>
      )}
      <div className="auto-approval-actions">
        <button type="button" className="sn-btn primary" onClick={() => onDecide("approved")}>
          <i className="fa-solid fa-check" /> Approve &amp; execute
        </button>
        <button type="button" className="sn-btn" onClick={() => onDecide("rejected")}>
          <i className="fa-solid fa-xmark" /> Reject
        </button>
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
  .auto-queue{display:flex;flex-direction:column;gap:12px}
  .auto-approval{border:1px solid #f59e0b55;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:6px;background:var(--bg,#fff)}
  .auto-approval-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .auto-approval-head b{font-size:13.5px}
  .auto-rollback{font-size:11.5px;background:var(--bg-muted,#f8fafc);border:1px dashed var(--border,#cbd5e1);border-radius:6px;padding:6px 10px;color:var(--fg-subtle)}
  .auto-rollback i{color:#8b5cf6;margin-right:5px}
  .auto-approval-actions{display:flex;gap:8px;margin-top:6px}
  .auto-output{margin-top:4px;font-size:10.5px;color:var(--fg-subtle);background:var(--bg-muted,#f8fafc);border-radius:4px;padding:3px 8px;display:inline-block}
  .auto-output i{margin-right:4px}
  .auto-catalog{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
  .auto-card{border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:12px}
  .auto-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:2px}
  .auto-card-head b{font-size:12.5px}
  .auto-card-foot{display:flex;gap:12px;flex-wrap:wrap;font-size:10.5px;color:var(--fg-subtle)}
  .auto-never{display:flex;align-items:center;gap:8px;font-size:12px;padding:5px 0}
  .auto-never i{color:#dc2626;font-size:11px}
  .auto-gate{display:flex;gap:10px;padding:7px 0;border-top:1px solid var(--border,#f1f5f9)}
  .auto-gate:first-of-type{border-top:0}
  .auto-gate>i{color:var(--accent);margin-top:2px;width:16px;text-align:center}
`;
