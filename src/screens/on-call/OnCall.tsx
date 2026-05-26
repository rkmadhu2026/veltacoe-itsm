import { useMemo, useState } from "react";
import { Avatar, Pill, UserById } from "@/components";
import {
  ESCALATION_POLICIES,
  ON_CALL_OVERRIDES,
  SCHEDULES,
  SHIFTS,
  WEEKDAYS,
  whoIsOnCall,
} from "@/data/on-call";
import { userById } from "@/data/users";
import type { AlertChannel, EscalationStep } from "@/types";

// Channel pill colors map to the icons. Keep separate from the data layer
// because it's a presentation concern.
const CHANNEL_ICON: Record<AlertChannel, string> = {
  sms: "fa-message",
  voice: "fa-phone",
  push: "fa-mobile-screen",
  email: "fa-envelope",
  slack: "fa-brands fa-slack",
  teams: "fa-brands fa-microsoft",
};

const CHANNEL_LABEL: Record<AlertChannel, string> = {
  sms: "SMS",
  voice: "Voice",
  push: "Push",
  email: "Email",
  slack: "Slack",
  teams: "Teams",
};

export function OnCallScreen() {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(SCHEDULES[0].id);
  const now = useMemo(() => new Date(), []);

  const selectedSchedule = SCHEDULES.find((s) => s.id === selectedScheduleId)!;
  const selectedShifts = SHIFTS.filter((s) => s.scheduleId === selectedScheduleId);
  const selectedPolicy = ESCALATION_POLICIES.find((p) => p.scheduleId === selectedScheduleId);

  // Compute "who's on call right now" across every schedule for the KPI strip
  // and the side rail. Memo-free — small fixed-size list.
  const liveOnCall = SCHEDULES.map((s) => ({
    schedule: s,
    current: whoIsOnCall(s.id, now),
  }));

  const activeOverrides = ON_CALL_OVERRIDES.filter((o) => new Date(o.start) <= now && new Date(o.end) > now);

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <a className="sn-link">Home</a>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Operate</a>
        <span className="sn-bc-sep">›</span>
        <span>On-call schedules</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">ONC-{SCHEDULES.length.toString().padStart(4, "0")}</span>
          <Pill kind="success">{liveOnCall.filter((x) => x.current).length} on-call now</Pill>
          {activeOverrides.length > 0 && (
            <Pill kind="warning">
              {activeOverrides.length} active override{activeOverrides.length === 1 ? "" : "s"}
            </Pill>
          )}
        </div>
        <div className="sn-form-title-meta">
          <h1>On-call schedules &amp; escalations</h1>
          <div className="sn-form-sub">
            {SCHEDULES.length} schedules · {ESCALATION_POLICIES.length} escalation policies ·{" "}
            {SHIFTS.length} shifts defined
          </div>
        </div>
        <div className="sn-form-actions">
          <button className="sn-btn">
            <i className="fa-solid fa-calendar-plus" /> Override
          </button>
          <button className="sn-btn">
            <i className="fa-solid fa-file-export" /> Export ICS
          </button>
          <button className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New schedule
          </button>
        </div>
      </div>

      {/* KPI strip — same vocabulary as the rest of the app */}
      <div className="sn-kpi-strip">
        <Kpi label="Active schedules" value={SCHEDULES.length} sub="across 3 tenants" tone="neutral" />
        <Kpi label="On-call right now" value={liveOnCall.filter((x) => x.current).length} sub="primary layer" tone="ok" />
        <Kpi label="Escalation policies" value={ESCALATION_POLICIES.length} sub={`avg ${avgSteps()} steps`} tone="neutral" />
        <Kpi label="Active overrides" value={activeOverrides.length} sub="vacation / OOO" tone={activeOverrides.length ? "warn" : "neutral"} />
        <Kpi label="Coverage" value="100%" sub="no gaps this week" tone="ok" />
        <Kpi label="Avg ack time" value="3m 12s" sub="last 30 days" tone="ok" />
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          {/* Schedule picker (tabs) */}
          <div className="oncall-tabs">
            {SCHEDULES.map((s) => {
              const live = liveOnCall.find((x) => x.schedule.id === s.id)?.current;
              const active = s.id === selectedScheduleId;
              return (
                <button
                  type="button"
                  key={s.id}
                  className={`oncall-tab${active ? " active" : ""}`}
                  onClick={() => setSelectedScheduleId(s.id)}
                >
                  <div className="oncall-tab-head">
                    <b>{s.name}</b>
                    <span className="text-mute" style={{ fontSize: 11 }}>{s.team}</span>
                  </div>
                  {live ? (
                    <div className="oncall-tab-now">
                      <Avatar
                        name={userById(live.userId)?.name ?? "?"}
                        color={userById(live.userId)?.color ?? "slate"}
                        size="sm"
                      />
                      <span style={{ fontSize: 11 }}>
                        {userById(live.userId)?.name.split(" ")[0]}
                        {live.overridden && (
                          <i
                            className="fa-solid fa-arrows-rotate"
                            style={{ marginLeft: 6, color: "var(--warning)" }}
                            title="Covering an override"
                          />
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-mute" style={{ fontSize: 11 }}>—</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected schedule detail */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-chevron-down" />
              <span className="sn-section-title">{selectedSchedule.name}</span>
              <span className="sn-section-badge">{selectedSchedule.rotationLength}</span>
            </div>
            <div className="sn-section-content">
              <div className="sn-form-row">
                <Field label="Team" value={selectedSchedule.team} />
                <Field label="Timezone" value={selectedSchedule.timezone} />
              </div>
              <div className="sn-form-row">
                <Field label="Tenant" value={selectedSchedule.tenant} />
                <Field label="Rotation length" value={selectedSchedule.rotationLength} />
              </div>
              <p style={{ fontSize: 12, color: "var(--fg-subtle)", marginTop: 8 }}>
                {selectedSchedule.description}
              </p>
            </div>
          </div>

          {/* Weekly calendar — 7 columns × shifts as bars */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-chevron-down" />
              <span className="sn-section-title">This week</span>
              <span className="sn-section-badge">{selectedShifts.length} shifts</span>
            </div>
            <div className="sn-section-content">
              <WeekGrid shifts={selectedShifts} />
            </div>
          </div>

          {/* Escalation policy */}
          {selectedPolicy && (
            <div className="sn-form-section">
              <div className="sn-section-header">
                <i className="fa-solid fa-chevron-down" />
                <span className="sn-section-title">Escalation policy · {selectedPolicy.name}</span>
                {selectedPolicy.repeat > 0 && (
                  <span className="sn-section-badge">repeats ×{selectedPolicy.repeat}</span>
                )}
              </div>
              <div className="sn-section-content">
                <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: "0 0 12px" }}>
                  {selectedPolicy.description}
                </p>
                <ol className="oncall-steps">
                  {selectedPolicy.steps.map((s) => (
                    <li key={s.step}>
                      <EscalationStepRow step={s} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Side rail */}
        <aside className="sn-form-side">
          <div className="sn-side-card">
            <div className="sn-side-head">Who's on call now</div>
            <div className="sn-side-body">
              {liveOnCall.map(({ schedule, current }) => (
                <div key={schedule.id} className="sn-related-row">
                  <div>
                    <div className="sn-related-title" style={{ fontSize: 12 }}>{schedule.name}</div>
                    <div className="sn-related-meta">{schedule.team}</div>
                  </div>
                  {current ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Avatar
                        name={userById(current.userId)?.name ?? "?"}
                        color={userById(current.userId)?.color ?? "slate"}
                        size="sm"
                      />
                      <span style={{ fontSize: 11.5 }}>
                        {userById(current.userId)?.name.split(" ")[0]}
                      </span>
                    </div>
                  ) : (
                    <span className="text-mute" style={{ fontSize: 11 }}>—</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">
              Active overrides <span className="sn-side-count">{activeOverrides.length}</span>
            </div>
            <div className="sn-side-body">
              {activeOverrides.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: 0 }}>
                  No overrides in effect.
                </p>
              ) : (
                activeOverrides.map((o) => {
                  const sched = SCHEDULES.find((s) => s.id === o.scheduleId);
                  return (
                    <div key={o.id} className="sn-related-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 550 }}>{sched?.name}</div>
                      <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
                        <UserById id={o.originalUserId} showName={false} /> →{" "}
                        <UserById id={o.coveringUserId} showName={false} />
                      </div>
                      <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{o.reason}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">Quick actions</div>
            <div className="sn-side-body sn-actions-grid">
              {(
                [
                  ["fa-calendar-plus", "Add override"],
                  ["fa-user-plus", "Add responder"],
                  ["fa-arrows-rotate", "Swap shift"],
                  ["fa-bell", "Test alert"],
                  ["fa-file-export", "Export ICS"],
                  ["fa-clipboard-list", "Audit log"],
                ] as const
              ).map(([ic, lbl]) => (
                <button key={lbl} type="button" className="sn-action">
                  <i className={`fa-solid ${ic}`} />
                  <span>{lbl}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">All escalation policies</div>
            <div className="sn-side-body">
              {ESCALATION_POLICIES.map((p) => {
                const sched = SCHEDULES.find((s) => s.id === p.scheduleId);
                return (
                  <button
                    type="button"
                    key={p.id}
                    className="sn-related-row"
                    onClick={() => sched && setSelectedScheduleId(sched.id)}
                    style={{ cursor: "pointer", textAlign: "left" }}
                  >
                    <div>
                      <div className="sn-related-title" style={{ fontSize: 12 }}>{p.name}</div>
                      <div className="sn-related-meta">
                        {p.steps.length} step{p.steps.length === 1 ? "" : "s"}
                        {p.repeat > 0 ? ` · repeats ×${p.repeat}` : ""}
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, color: "var(--fg-subtle)" }} />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function avgSteps() {
  const total = ESCALATION_POLICIES.reduce((sum, p) => sum + p.steps.length, 0);
  return Math.round((total / ESCALATION_POLICIES.length) * 10) / 10;
}

interface KpiProps {
  label: string;
  value: number | string;
  sub: string;
  tone: "ok" | "warn" | "crit" | "neutral";
}
function Kpi({ label, value, sub, tone }: KpiProps) {
  return (
    <div className={`sn-kpi tone-${tone}`}>
      <div className="sn-kpi-l">{label}</div>
      <div className="sn-kpi-v">{value}</div>
      <div className="sn-kpi-s">{sub}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="sn-form-group">
      <div className="sn-field-label">{label}</div>
      <div className="sn-field-value">{value}</div>
    </div>
  );
}

// Minimal week-grid renderer. Each shift becomes a colored block stretching
// from startDay/startTime to endDay/endTime. Layer 1 sits on top, layer 2 below.
function WeekGrid({ shifts }: { shifts: readonly import("@/types").Shift[] }) {
  const HOURS = 24;
  const cellHeight = 28;
  const layers = Array.from(new Set(shifts.map((s) => s.layer))).sort();

  return (
    <div className="oncall-grid">
      <div className="oncall-grid-head">
        <div className="oncall-grid-corner" />
        {WEEKDAYS.map((d) => (
          <div key={d} className="oncall-grid-day">
            {d}
          </div>
        ))}
      </div>
      {layers.map((layer) => (
        <div key={layer} className="oncall-grid-layer">
          <div className="oncall-grid-layer-label">Layer {layer}</div>
          <div className="oncall-grid-cells">
            {WEEKDAYS.map((_, dayIdx) => {
              const shift = shifts.find(
                (s) => s.layer === layer && dayIdx >= s.startDay && dayIdx <= s.endDay,
              );
              if (!shift) return <div key={dayIdx} className="oncall-grid-cell empty" />;
              const u = userById(shift.userId);
              return (
                <div
                  key={dayIdx}
                  className="oncall-grid-cell"
                  style={{ height: cellHeight }}
                  title={`${u?.name} · ${shift.startTime}–${shift.endTime}`}
                >
                  <Avatar name={u?.name ?? "?"} color={u?.color ?? "slate"} size="sm" />
                  <span style={{ fontSize: 11 }}>
                    {shift.startTime === "00:00" && shift.endTime === "23:59"
                      ? "24h"
                      : `${shift.startTime}–${shift.endTime}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <style>{`
        .oncall-grid{border:1px solid var(--border, #e2e8f0);border-radius:8px;overflow:hidden;background:var(--bg, #fff)}
        .oncall-grid-head{display:grid;grid-template-columns:80px repeat(7,1fr);background:var(--bg-muted, #f8fafc);border-bottom:1px solid var(--border, #e2e8f0)}
        .oncall-grid-corner{padding:8px}
        .oncall-grid-day{padding:8px 10px;font-size:11px;font-weight:600;color:var(--fg-subtle, #64748b);text-align:center;border-left:1px solid var(--border, #e2e8f0)}
        .oncall-grid-layer{display:grid;grid-template-columns:80px 1fr;border-top:1px solid var(--border, #e2e8f0)}
        .oncall-grid-layer:first-of-type{border-top:0}
        .oncall-grid-layer-label{padding:10px;font-size:11px;font-weight:600;color:var(--fg-subtle, #64748b);background:var(--bg-muted, #f8fafc);display:flex;align-items:center}
        .oncall-grid-cells{display:grid;grid-template-columns:repeat(7,1fr)}
        .oncall-grid-cell{padding:6px 8px;display:flex;align-items:center;gap:8px;border-left:1px solid var(--border, #e2e8f0);font-size:11.5px}
        .oncall-grid-cell.empty{background:repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.03) 6px, rgba(0,0,0,0.03) 12px)}
        .oncall-tabs{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-bottom:16px}
        .oncall-tab{text-align:left;padding:12px;border-radius:8px;border:1px solid var(--border, #e2e8f0);background:var(--bg, #fff);cursor:pointer;display:flex;flex-direction:column;gap:8px}
        .oncall-tab:hover{border-color:var(--accent)}
        .oncall-tab.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
        .oncall-tab-head{display:flex;flex-direction:column;gap:2px}
        .oncall-tab-head b{font-size:12.5px;font-weight:600}
        .oncall-tab-now{display:flex;align-items:center;gap:6px}
        .oncall-steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}
        .oncall-steps>li{padding:10px 12px;border:1px solid var(--border, #e2e8f0);border-radius:8px;background:var(--bg-muted, #f8fafc)}
        .oncall-step-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .oncall-step-num{width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:11px;font-weight:700;flex-shrink:0}
        .oncall-step-target{font-size:12.5px;font-weight:550;flex:1;min-width:0}
        .oncall-step-meta{font-size:11px;color:var(--fg-subtle, #64748b);display:flex;align-items:center;gap:6px;flex-wrap:wrap}
        .oncall-channel{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;background:rgba(0,0,0,0.06);font-size:10.5px}
      `}</style>
    </div>
  );
}

function EscalationStepRow({ step }: { step: EscalationStep }) {
  const target = step.target;
  let targetLabel: string;
  if (target.kind === "schedule") {
    const sid = target.scheduleId;
    const sched = SCHEDULES.find((s) => s.id === sid);
    targetLabel = sched ? `Schedule · ${sched.name}` : "Schedule";
  } else if (target.kind === "user") {
    const u = userById(target.userId);
    targetLabel = u ? `User · ${u.name}` : "User";
  } else {
    targetLabel = `Team · ${target.team}`;
  }
  return (
    <div className="oncall-step-row">
      <div className="oncall-step-num">{step.step}</div>
      <div className="oncall-step-target">{targetLabel}</div>
      <div className="oncall-step-meta">
        <span>
          {step.afterMinutes === 0
            ? "Immediately"
            : `+${step.afterMinutes}m if not acked`}
        </span>
        {step.channels.map((c) => (
          <span key={c} className="oncall-channel">
            <i className={`fa-solid ${CHANNEL_ICON[c]}`} /> {CHANNEL_LABEL[c]}
          </span>
        ))}
      </div>
    </div>
  );
}
