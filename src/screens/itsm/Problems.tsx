import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, UserById } from "@/components";
import { PROBLEMS } from "@/data";
import type { ProblemStatus } from "@/types";
import type { PillKind } from "@/components";

const STATUS_PILL: Record<ProblemStatus, PillKind> = {
  "Root cause analysis": "warning",
  "Known error": "purple",
  Resolved: "success",
  Assessment: "info",
};

const PRIORITY_PILL: Record<1 | 2 | 3 | 4, PillKind> = {
  1: "critical",
  2: "warning",
  3: "info",
  4: "neutral",
};

const STATUSES: readonly ("all" | ProblemStatus)[] = [
  "all",
  "Root cause analysis",
  "Assessment",
  "Known error",
  "Resolved",
];

export function ProblemsScreen() {
  const [status, setStatus] = useState<"all" | ProblemStatus>("all");

  const rows = useMemo(
    () => (status === "all" ? PROBLEMS : PROBLEMS.filter((p) => p.status === status)),
    [status],
  );

  const open = PROBLEMS.filter((p) => p.status !== "Resolved").length;
  const p1 = PROBLEMS.filter((p) => p.priority === 1).length;
  const withKb = PROBLEMS.filter((p) => p.kb).length;
  const totalLinked = PROBLEMS.reduce((a, p) => a + p.linked, 0);

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>Problem management</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">PRB-QUEUE</span>
          {p1 > 0 && <Pill kind="critical">{p1} priority-1 open</Pill>}
          <Pill kind="neutral" noDot>
            Root cause tracking
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Problem management</h1>
          <div className="sn-form-sub">
            {PROBLEMS.length} problems · {open} open · {totalLinked} linked incidents · {withKb}{" "}
            with a published known-error article
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/knowledge" className="sn-btn">
            <i className="fa-solid fa-book-open" /> Knowledge base
          </Link>
          <Link to="/incidents" className="sn-btn">
            <i className="fa-solid fa-triangle-exclamation" /> Incidents
          </Link>
          <Link to="/problems/new" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New problem
          </Link>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Total problems" value={PROBLEMS.length} sub="tracked" tone="neutral" />
        <Kpi label="Open" value={open} sub="not yet resolved" tone={open ? "warn" : "ok"} />
        <Kpi label="Priority 1" value={p1} sub="high impact" tone={p1 ? "crit" : "ok"} />
        <Kpi
          label="Linked incidents"
          value={totalLinked}
          sub="across all problems"
          tone="neutral"
        />
        <Kpi label="Known errors" value={withKb} sub="KB article published" tone="ok" />
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-magnifying-glass-chart" />
          <span className="sn-section-title">Problem queue</span>
        </div>
        <div className="prb-tabs">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`prb-tab ${status === s ? "active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>Problem</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Impact</th>
              <th>Linked</th>
              <th>Age</th>
              <th>KB</th>
              <th>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="mono text-mute" style={{ fontSize: 11 }}>
                    {p.id}
                  </div>
                  <div style={{ fontWeight: 550 }}>{p.title}</div>
                </td>
                <td>
                  <Pill kind={PRIORITY_PILL[p.priority]} noDot>
                    P{p.priority}
                  </Pill>
                </td>
                <td>
                  <Pill kind={STATUS_PILL[p.status]}>{p.status}</Pill>
                </td>
                <td className="text-mute" style={{ fontSize: 12 }}>
                  {p.impact}
                </td>
                <td className="mono">{p.linked}</td>
                <td className="mono">{p.age}</td>
                <td>
                  {p.kb ? (
                    <Link to={`/knowledge/${p.kb}`} className="mono">
                      {p.kb}
                    </Link>
                  ) : (
                    <span className="text-mute">—</span>
                  )}
                </td>
                <td>
                  <UserById id={p.assignee} />
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
  .prb-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
  .prb-tab{display:inline-flex;align-items:center;padding:6px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);cursor:pointer;font:inherit;font-size:12px;color:var(--fg)}
  .prb-tab:hover{border-color:var(--accent)}
  .prb-tab.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}
`;
