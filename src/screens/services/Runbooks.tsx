import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, UserById } from "@/components";
import { RUNBOOKS, RUNBOOK_LIBRARY_TOTAL, automationActionById } from "@/data";

export function RunbooksScreen() {
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(RUNBOOKS.map((r) => r.category)))],
    [],
  );
  const [cat, setCat] = useState("all");

  const rows = useMemo(
    () => (cat === "all" ? RUNBOOKS : RUNBOOKS.filter((r) => r.category === cat)),
    [cat],
  );

  const verified = RUNBOOKS.filter((r) => r.verified).length;
  const automated = RUNBOOKS.filter((r) => r.automationActionId).length;
  const stale = RUNBOOKS.filter((r) => !r.verified).length;
  const executions = RUNBOOKS.reduce((a, r) => a + r.executions30d, 0);

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
        <span>Runbooks</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">RUNBOOK-LIB</span>
          {stale > 0 && <Pill kind="warning">{stale} past review policy</Pill>}
          <Pill kind="neutral" noDot>
            90-day review policy · game-day verified
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Runbooks</h1>
          <div className="sn-form-sub">
            {RUNBOOK_LIBRARY_TOTAL} in the library · showing the {RUNBOOKS.length} most-executed ·
            automatable runbooks link straight to their StackStorm action
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/automation" className="sn-btn">
            <i className="fa-solid fa-robot" /> Automation catalog
          </Link>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New runbook
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Library" value={RUNBOOK_LIBRARY_TOTAL} sub="total runbooks" tone="neutral" />
        <Kpi
          label="Verified"
          value={`${verified}/${RUNBOOKS.length}`}
          sub="of curated set"
          tone={stale ? "warn" : "ok"}
        />
        <Kpi label="Automatable" value={automated} sub="linked ST2 action" tone="ok" />
        <Kpi label="Executions" value={executions} sub="last 30 days" tone="neutral" />
        <Kpi label="Stale" value={stale} sub="review overdue" tone={stale ? "warn" : "ok"} />
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-book" />
          <span className="sn-section-title">Most-executed runbooks</span>
        </div>
        <div className="rbk-tabs">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`rbk-tab ${cat === c ? "active" : ""}`}
              onClick={() => setCat(c)}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
        <div className="rbk-list">
          {rows.map((r) => {
            const action = r.automationActionId
              ? automationActionById(r.automationActionId)
              : undefined;
            return (
              <div key={r.id} className="rbk-card">
                <div className="rbk-head">
                  <span className="mono text-mute">{r.id}</span>
                  <span className="rbk-title">{r.title}</span>
                  {r.verified ? (
                    <Pill kind="success" noDot>
                      Verified
                    </Pill>
                  ) : (
                    <Pill kind="warning" noDot>
                      Review overdue
                    </Pill>
                  )}
                  <Pill kind="teal" noDot>
                    {r.category}
                  </Pill>
                </div>
                <div className="rbk-meta">
                  <span>
                    <i className="fa-solid fa-diagram-project" /> {r.service}
                  </span>
                  <span>
                    <i className="fa-solid fa-list-ol" /> {r.steps} steps
                  </span>
                  <span>
                    <i className="fa-solid fa-play" /> {r.executions30d}× / 30d
                  </span>
                  <span>
                    <i className="fa-solid fa-clock-rotate-left" /> reviewed {r.lastReviewed}
                  </span>
                </div>
                <div className="rbk-foot">
                  <UserById id={r.owner} />
                  {action ? (
                    <Link to="/automation" className="rbk-action">
                      <i className="fa-solid fa-robot" />
                      <span className="mono">{action.st2Action}</span>
                      <Pill kind={action.tier === "guarded" ? "purple" : "info"} noDot>
                        {action.tier}
                      </Pill>
                    </Link>
                  ) : (
                    <span className="text-mute" style={{ fontSize: 11.5 }}>
                      Manual only
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
  .rbk-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
  .rbk-tab{display:inline-flex;align-items:center;padding:6px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);cursor:pointer;font:inherit;font-size:12px;color:var(--fg)}
  .rbk-tab:hover{border-color:var(--accent)}
  .rbk-tab.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}
  .rbk-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:12px}
  .rbk-card{border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:12px 14px;background:var(--bg,#fff);display:flex;flex-direction:column;gap:8px}
  .rbk-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .rbk-title{font-size:13px;font-weight:600;flex:1;min-width:180px}
  .rbk-meta{display:flex;gap:14px;flex-wrap:wrap;font-size:11.5px;color:var(--fg-subtle)}
  .rbk-meta i{margin-right:4px;font-size:10px}
  .rbk-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;border-top:1px solid var(--border,#e2e8f0);padding-top:8px}
  .rbk-action{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;color:var(--fg);text-decoration:none}
  .rbk-action:hover .mono{text-decoration:underline}
`;
