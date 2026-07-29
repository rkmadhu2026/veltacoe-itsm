import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill } from "@/components";
import {
  ADAPTER_CHECKS,
  BUSINESS_DAYS,
  FILE_TRANSFERS,
  HOLIDAYS,
  QUEUE_CHECKS,
  SYNTHETIC_CHECKS,
  TRADING_STEPS,
  bodEodHeatmap,
  tradingStepsFor,
} from "@/data";
import type { CheckState, SyntheticKind, TradingStep, WorkflowKind } from "@/types";
import type { PillKind } from "@/components";

const STATE_PILL: Record<CheckState, PillKind> = {
  PASSED: "success",
  WARNING: "warning",
  FAILED: "critical",
  RUNNING: "info",
  PENDING: "neutral",
  SKIPPED_HOLIDAY: "neutral",
  MANUAL_OVERRIDE: "purple",
};

const STATE_ICON: Record<CheckState, string> = {
  PASSED: "fa-check",
  WARNING: "fa-triangle-exclamation",
  FAILED: "fa-xmark",
  RUNNING: "fa-spinner",
  PENDING: "fa-hourglass-half",
  SKIPPED_HOLIDAY: "fa-umbrella-beach",
  MANUAL_OVERRIDE: "fa-user-pen",
};

const HEAT_COLOR: Record<CheckState, string> = {
  PASSED: "rgba(16,185,129,0.75)",
  WARNING: "rgba(245,158,11,0.85)",
  FAILED: "rgba(220,38,38,0.9)",
  RUNNING: "rgba(37,99,235,0.7)",
  PENDING: "var(--bg-muted, #f1f5f9)",
  SKIPPED_HOLIDAY: "rgba(100,116,139,0.35)",
  MANUAL_OVERRIDE: "rgba(139,92,246,0.8)",
};

const KIND_ICON: Record<SyntheticKind, string> = {
  http: "fa-globe",
  tcp: "fa-plug",
  dns: "fa-signs-post",
  ssl: "fa-lock",
};

export function TradingOpsScreen() {
  const [workflow, setWorkflow] = useState<WorkflowKind>("BOD");
  const steps = tradingStepsFor(workflow);
  const heat = useMemo(() => bodEodHeatmap(), []);

  const stats = useMemo(() => {
    const bod = tradingStepsFor("BOD");
    const bodDone = bod.every((s) =>
      ["PASSED", "WARNING", "MANUAL_OVERRIDE", "SKIPPED_HOLIDAY"].includes(s.state),
    );
    const warnings = TRADING_STEPS.filter((s) => s.state === "WARNING").length;
    const overrides = TRADING_STEPS.filter((s) => s.state === "MANUAL_OVERRIDE").length;
    const checksTotal = SYNTHETIC_CHECKS.length + ADAPTER_CHECKS.length + QUEUE_CHECKS.length;
    const checksOk =
      SYNTHETIC_CHECKS.filter((c) => c.state === "PASSED").length +
      ADAPTER_CHECKS.filter((c) => c.state === "PASSED").length +
      QUEUE_CHECKS.filter((c) => c.state === "PASSED").length;
    return { bodDone, warnings, overrides, checksTotal, checksOk };
  }, []);

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Operate</a>
        <span className="sn-bc-sep">›</span>
        <span>Trading ops</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">BOD-EOD</span>
          <Pill kind={stats.bodDone ? "success" : "warning"}>
            BOD {stats.bodDone ? "complete" : "in progress"}
          </Pill>
          <Pill kind="info">EOD running</Pill>
          {stats.overrides > 0 && (
            <Pill kind="purple">
              {stats.overrides} manual override{stats.overrides === 1 ? "" : "s"}
            </Pill>
          )}
        </div>
        <div className="sn-form-title-meta">
          <h1>Trading operations</h1>
          <div className="sn-form-sub">
            Trading day · BOD/EOD workflows, exchange adapters, synthetic checks, and file transfers
            gated by the holiday calendar · every state change is audit-logged
          </div>
        </div>
        <div className="sn-form-actions">
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-calendar-days" /> Holiday calendar
          </button>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-file-lines" /> Daily report
          </button>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-rotate" /> Re-run failed step
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi
          label="BOD"
          value={stats.bodDone ? "Complete" : "Running"}
          sub="signed off 08:30"
          tone={stats.bodDone ? "ok" : "warn"}
        />
        <Kpi label="EOD" value="Step 1/6" sub="market close confirm" tone="neutral" />
        <Kpi
          label="Checks passing"
          value={`${stats.checksOk}/${stats.checksTotal}`}
          sub="synthetic · adapters · queues"
          tone={stats.checksOk === stats.checksTotal ? "ok" : "warn"}
        />
        <Kpi
          label="Warnings"
          value={stats.warnings}
          sub="soft-threshold breaches"
          tone={stats.warnings ? "warn" : "ok"}
        />
        <Kpi
          label="Overrides"
          value={stats.overrides}
          sub="operator-approved"
          tone={stats.overrides ? "warn" : "ok"}
        />
        <Kpi
          label="Next holiday"
          value={HOLIDAYS[0].date.slice(5)}
          sub={HOLIDAYS[0].name}
          tone="neutral"
        />
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          {/* Workflow timeline */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-list-check" />
              <span className="sn-section-title">Workflow · today</span>
              <div className="tops-wf-toggle">
                {(["BOD", "EOD"] as const).map((w) => (
                  <button
                    type="button"
                    key={w}
                    className={`tops-wf-btn${workflow === w ? " active" : ""}`}
                    onClick={() => setWorkflow(w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div className="sn-section-content">
              <ol className="tops-steps">
                {steps.map((s) => (
                  <StepRow key={s.id} s={s} />
                ))}
              </ol>
            </div>
          </div>

          {/* BOD/EOD heatmap */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-table-cells" />
              <span className="sn-section-title">BOD/EOD heatmap · last 10 sessions</span>
              <span className="sn-section-badge">step × business day</span>
            </div>
            <div className="sn-section-content">
              <div className="tops-heat">
                <div className="tops-heat-row tops-heat-head">
                  <div className="tops-heat-label" />
                  {BUSINESS_DAYS.map((d) => (
                    <div key={d} className="tops-heat-day">
                      {d}
                    </div>
                  ))}
                </div>
                {TRADING_STEPS.map((step) => (
                  <div key={step.id} className="tops-heat-row">
                    <div className="tops-heat-label" title={step.name}>
                      <span className="mono" style={{ fontSize: 9.5, color: "var(--fg-subtle)" }}>
                        {step.workflow}
                      </span>{" "}
                      {step.name}
                    </div>
                    {BUSINESS_DAYS.map((d) => {
                      const cell = heat.find((c) => c.stepId === step.id && c.day === d);
                      const state = cell?.state ?? "PASSED";
                      return (
                        <div
                          key={d}
                          className="tops-heat-cell"
                          style={{ background: HEAT_COLOR[state] }}
                          title={`${step.name} · ${d} · ${state}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="tops-heat-legend">
                {(
                  ["PASSED", "WARNING", "FAILED", "MANUAL_OVERRIDE", "SKIPPED_HOLIDAY"] as const
                ).map((s) => (
                  <span key={s} className="tops-heat-key">
                    <span className="tops-heat-swatch" style={{ background: HEAT_COLOR[s] }} />
                    {s.replace(/_/g, " ").toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Synthetic checks */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-heart-pulse" />
              <span className="sn-section-title">Synthetic checks</span>
              <span className="sn-section-badge">HTTP · TCP · DNS · SSL</span>
            </div>
            <div className="sn-section-content">
              <table className="sn-list-table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }} />
                    <th>Check</th>
                    <th>Target</th>
                    <th style={{ width: 110 }}>State</th>
                    <th style={{ width: 80 }}>Latency</th>
                    <th>Detail</th>
                    <th style={{ width: 90 }}>Last run</th>
                  </tr>
                </thead>
                <tbody>
                  {SYNTHETIC_CHECKS.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <i
                          className={`fa-solid ${KIND_ICON[c.kind]}`}
                          style={{ color: "var(--accent)" }}
                          title={c.kind}
                        />
                      </td>
                      <td style={{ fontWeight: 550 }}>{c.name}</td>
                      <td className="mono text-mute" style={{ fontSize: 11.5 }}>
                        {c.target}
                      </td>
                      <td>
                        <Pill kind={STATE_PILL[c.state]}>{c.state.toLowerCase()}</Pill>
                      </td>
                      <td className="mono">{c.latency}</td>
                      <td className="mono" style={{ fontSize: 11.5 }}>
                        {c.detail}
                      </td>
                      <td className="mono text-mute" style={{ fontSize: 11 }}>
                        {c.lastRun}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="sn-form-side">
          {/* Adapters */}
          <div className="sn-side-card">
            <div className="sn-side-head">
              Exchange adapters <span className="sn-side-count">{ADAPTER_CHECKS.length}</span>
            </div>
            <div className="sn-side-body">
              {ADAPTER_CHECKS.map((a) => (
                <div key={a.id} className="sn-related-row">
                  <div style={{ minWidth: 0 }}>
                    <div className="sn-related-title mono" style={{ fontSize: 12 }}>
                      {a.name}
                    </div>
                    <div className="sn-related-meta">
                      {a.segment} · hb {a.heartbeat} · {a.msgRate}
                      {a.seqGaps > 0 && (
                        <span style={{ color: "#d97706" }}> · {a.seqGaps} seq gaps</span>
                      )}
                    </div>
                  </div>
                  <Pill kind={STATE_PILL[a.state]}>{a.state === "PASSED" ? "up" : "degraded"}</Pill>
                </div>
              ))}
            </div>
          </div>

          {/* Queues */}
          <div className="sn-side-card">
            <div className="sn-side-head">Queues</div>
            <div className="sn-side-body">
              {QUEUE_CHECKS.map((q) => (
                <div key={q.id} className="sn-related-row">
                  <div style={{ minWidth: 0 }}>
                    <div className="sn-related-title mono" style={{ fontSize: 12 }}>
                      {q.queue}
                    </div>
                    <div className="sn-related-meta">
                      depth {q.depth.toLocaleString()} · {q.consumers} consumers · in {q.inRate} /
                      out {q.outRate}
                    </div>
                  </div>
                  <Pill kind={STATE_PILL[q.state]}>{q.state.toLowerCase()}</Pill>
                </div>
              ))}
            </div>
          </div>

          {/* File transfers */}
          <div className="sn-side-card">
            <div className="sn-side-head">
              File transfers <span className="sn-side-count">{FILE_TRANSFERS.length}</span>
            </div>
            <div className="sn-side-body">
              {FILE_TRANSFERS.map((f) => (
                <div
                  key={f.id}
                  className="sn-related-row"
                  style={{ flexDirection: "column", alignItems: "flex-start", gap: 3 }}
                >
                  <div style={{ display: "flex", width: "100%", alignItems: "center", gap: 8 }}>
                    <i
                      className={`fa-solid ${f.direction === "inbound" ? "fa-download" : "fa-upload"}`}
                      style={{ fontSize: 10, color: "var(--fg-subtle)" }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 550, flex: 1 }}>{f.name}</span>
                    <Pill kind={STATE_PILL[f.state]}>
                      {f.state.replace(/_/g, " ").toLowerCase()}
                    </Pill>
                  </div>
                  <div className="sn-related-meta" style={{ paddingLeft: 18 }}>
                    by {f.deadline} IST · {f.sizeOrNote}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Holiday calendar */}
          <div className="sn-side-card">
            <div className="sn-side-head">Upcoming holidays</div>
            <div className="sn-side-body">
              {HOLIDAYS.map((h) => (
                <div key={h.date} className="sn-related-row">
                  <div>
                    <div className="sn-related-title" style={{ fontSize: 12 }}>
                      {h.name}
                    </div>
                    <div className="sn-related-meta">{h.markets.join(" · ")}</div>
                  </div>
                  <span className="mono text-mute" style={{ fontSize: 11 }}>
                    {h.date}
                  </span>
                </div>
              ))}
              <p style={{ fontSize: 11, color: "var(--fg-subtle)", margin: "8px 0 0" }}>
                Holiday sessions auto-set every step to{" "}
                <span className="mono">SKIPPED_HOLIDAY</span>.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

function StepRow({ s }: { s: TradingStep }) {
  return (
    <li className={`tops-step state-${s.state.toLowerCase()}`}>
      <span className="tops-step-mark">
        <i
          className={`fa-solid ${STATE_ICON[s.state]}${s.state === "RUNNING" ? " fa-spin" : ""}`}
        />
      </span>
      <div className="tops-step-body">
        <div className="tops-step-top">
          <b>
            {s.seq}. {s.name}
          </b>
          <Pill kind={STATE_PILL[s.state]}>{s.state.replace(/_/g, " ").toLowerCase()}</Pill>
          <span className="mono text-mute" style={{ marginLeft: "auto", fontSize: 11 }}>
            {s.scheduledAt} IST{s.duration ? ` · ${s.duration}` : ""}
          </span>
        </div>
        <div className="tops-step-desc">{s.description}</div>
        {s.note && (
          <div className="tops-step-note">
            <i className="fa-solid fa-clipboard-list" /> {s.note}
          </div>
        )}
      </div>
    </li>
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
  .tops-wf-toggle{margin-left:auto;display:flex;border:1px solid var(--border,#e2e8f0);border-radius:6px;overflow:hidden}
  .tops-wf-btn{border:0;background:transparent;padding:5px 14px;font:inherit;font-size:12px;font-weight:600;cursor:pointer;color:var(--fg)}
  .tops-wf-btn.active{background:var(--accent);color:#fff}
  .tops-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
  .tops-step{display:flex;gap:12px;padding:10px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff)}
  .tops-step.state-warning{border-color:#f59e0b55}
  .tops-step.state-failed{border-color:#dc262666}
  .tops-step.state-manual_override{border-color:#8b5cf655}
  .tops-step.state-running{border-color:var(--accent)}
  .tops-step-mark{width:26px;height:26px;border-radius:50%;background:var(--bg-muted,#f1f5f9);display:grid;place-items:center;font-size:11px;flex-shrink:0;margin-top:2px}
  .tops-step.state-passed .tops-step-mark{background:#10b981;color:#fff}
  .tops-step.state-warning .tops-step-mark{background:#f59e0b;color:#fff}
  .tops-step.state-failed .tops-step-mark{background:#dc2626;color:#fff}
  .tops-step.state-running .tops-step-mark{background:#2563eb;color:#fff}
  .tops-step.state-manual_override .tops-step-mark{background:#8b5cf6;color:#fff}
  .tops-step-body{flex:1;min-width:0}
  .tops-step-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .tops-step-top b{font-size:13px}
  .tops-step-desc{font-size:12px;color:var(--fg-subtle);margin-top:2px}
  .tops-step-note{margin-top:6px;font-size:11.5px;background:var(--bg-muted,#f8fafc);border:1px dashed var(--border,#cbd5e1);border-radius:6px;padding:6px 10px;color:var(--fg-subtle)}
  .tops-step-note i{margin-right:6px;color:#8b5cf6}
  .tops-heat{overflow-x:auto}
  .tops-heat-row{display:grid;grid-template-columns:220px repeat(10,1fr);gap:3px;margin-bottom:3px;align-items:center}
  .tops-heat-head .tops-heat-day{font-size:10px;color:var(--fg-subtle);text-align:center}
  .tops-heat-label{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tops-heat-cell{height:20px;border-radius:3px;min-width:22px}
  .tops-heat-legend{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;font-size:11px;color:var(--fg-subtle)}
  .tops-heat-key{display:inline-flex;align-items:center;gap:5px}
  .tops-heat-swatch{width:12px;height:12px;border-radius:3px;display:inline-block}
  @media(max-width:900px){.tops-heat-row{grid-template-columns:140px repeat(10,1fr)}}
`;
