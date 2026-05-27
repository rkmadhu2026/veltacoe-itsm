import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar, Pill, SLAIndicator, Sev, UserById } from "@/components";
import {
  CHAT,
  INCIDENTS,
  SERVICES,
  TENANTS,
  TIMELINE_EVENTS,
  onCallForIncident,
  statusPageLinkForIncident,
  userById,
} from "@/data";
import { useStatusUpdates } from "@/lib/useStatusUpdates";
import type {
  ComponentStatus,
  StatusIncidentStage,
} from "@/types";

const STATUS_COLOR: Record<ComponentStatus, string> = {
  operational: "#10b981",
  degraded: "#f59e0b",
  "partial-outage": "#fb923c",
  "major-outage": "#ef4444",
  maintenance: "#6366f1",
};

const STATUS_LABEL: Record<ComponentStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  "partial-outage": "Partial outage",
  "major-outage": "Major outage",
  maintenance: "Maintenance",
};

const STAGE_LABEL: Record<StatusIncidentStage, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

export function IncidentDetailScreen() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const incident = INCIDENTS.find((i) => i.id === id);

  // ── Hooks must run before any early return ─────────────────────────────
  const onCallEntries = useMemo(
    () => (incident ? onCallForIncident(incident) : []),
    [incident],
  );
  const statusLink = useMemo(
    () => (incident ? statusPageLinkForIncident(incident) : null),
    [incident],
  );

  const [tab, setTab] = useState<"timeline" | "chat" | "related" | "automation">("timeline");
  const [publishOpen, setPublishOpen] = useState(false);
  const [draftMessage, setDraftMessage] = useState(
    "We're investigating elevated failures on this service. Updates to follow as we learn more.",
  );
  const [draftStage, setDraftStage] = useState<StatusIncidentStage>("investigating");

  const { publish, forIncident } = useStatusUpdates();
  const publishHistory = useMemo(
    () => (incident ? forIncident(incident.id) : []),
    [incident, forIncident],
  );
  const latestPublish = publishHistory[0] ?? null;
  // ───────────────────────────────────────────────────────────────────────

  if (!incident) {
    return (
      <div className="page page-fade narrow">
        <div className="page-head">
          <div className="page-title">
            <h1>Incident not found</h1>
            <div className="subtitle">No incident with id {id}.</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ padding: 24 }}>
            <button type="button" className="btn primary" onClick={() => navigate("/incidents")}>
              Back to incidents
            </button>
          </div>
        </div>
      </div>
    );
  }

  const service = SERVICES.find((s) => s.name === incident.service);
  const tenantName = TENANTS.find((t) => t.id === incident.tenant)?.name ?? incident.tenant;
  const primaryOnCall = onCallEntries[0];
  const primaryUser = primaryOnCall ? userById(primaryOnCall.userId) : null;

  const handlePublish = () => {
    if (!statusLink || !incident) return;
    publish({
      incidentId: incident.id,
      pageId: statusLink.page.id,
      componentId: statusLink.component.id,
      stage: draftStage,
      message: draftMessage,
      subscribers:
        statusLink.page.subscribers.email +
        statusLink.page.subscribers.sms +
        statusLink.page.subscribers.webhook,
    });
    setPublishOpen(false);
  };

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">Home</Link>
        <span className="sn-bc-sep">›</span>
        <Link to="/incidents" className="sn-link">Incidents</Link>
        <span className="sn-bc-sep">›</span>
        <span>{incident.id}</span>
      </div>

      {/* Header */}
      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">{incident.id}</span>
          <Sev n={incident.sev} />
          <Pill
            kind={
              incident.status === "active"
                ? "critical"
                : incident.status === "mitigating"
                  ? "warning"
                  : incident.status === "investigating"
                    ? "info"
                    : incident.status === "resolved"
                      ? "success"
                      : "neutral"
            }
          >
            {incident.status}
          </Pill>
          <Pill kind="neutral" noDot>
            Age {incident.age}
          </Pill>
          {latestPublish && (
            <Pill kind="info">
              <i className="fa-solid fa-signal" style={{ marginRight: 4 }} />
              Published · {publishHistory.length} update
              {publishHistory.length === 1 ? "" : "s"}
            </Pill>
          )}
        </div>
        <div className="sn-form-title-meta">
          <h1>{incident.title}</h1>
          <div className="sn-form-sub">
            <span className="mono">{incident.service}</span> · {tenantName} · impacting{" "}
            {incident.impacted}
          </div>
        </div>
        <div className="sn-form-actions">
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-arrow-rotate-left" /> Rollback
          </button>
          <button type="button" className="sn-btn">
            <i className="fa-brands fa-slack" /> War room
          </button>
          {statusLink && (
            <button
              type="button"
              className={`sn-btn${latestPublish ? "" : " primary"}`}
              onClick={() => setPublishOpen(true)}
            >
              <i className="fa-solid fa-bullhorn" />{" "}
              {latestPublish ? "Update status page" : "Publish to status page"}
            </button>
          )}
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-check" /> Resolve
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="sn-kpi-strip">
        <KpiBox label="SLA budget" value={`${Math.round(incident.sla * 100)}%`} sub="of SLO window" tone={incident.sla < 0.4 ? "crit" : incident.sla < 0.7 ? "warn" : "ok"} />
        <KpiBox label="SLO burn rate" value={`${incident.sloBurn}×`} sub="vs baseline" tone={incident.sloBurn > 5 ? "crit" : incident.sloBurn > 2 ? "warn" : "ok"} />
        <KpiBox label="Impacted" value={incident.impacted} sub="customers/teams" tone="neutral" />
        <KpiBox label="Service" value={service?.status ?? incident.service} sub={incident.service} tone={service?.status === "down" ? "crit" : service?.status === "degraded" ? "warn" : "ok"} />
        <KpiBox label="On-call" value={primaryUser?.name.split(" ")[0] ?? "—"} sub={primaryOnCall?.schedule.name ?? "no schedule"} tone={primaryUser ? "ok" : "neutral"} />
        <KpiBox label="Status page" value={statusLink ? (latestPublish ? `Updated · ${publishHistory.length}` : "Linked") : "—"} sub={statusLink?.page.domain ?? "no public component"} tone={statusLink ? (latestPublish ? "ok" : "warn") : "neutral"} />
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          {/* SLA bar prominent on detail */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-chevron-down" />
              <span className="sn-section-title">SLA tracking</span>
              <span className="sn-section-badge">
                {incident.sla < 0.4 ? "Breaching" : incident.sla < 0.7 ? "At risk" : "Healthy"}
              </span>
            </div>
            <div className="sn-section-content">
              <SLAIndicator pct={incident.sla} />
            </div>
          </div>

          {/* Tabs */}
          <div className="sn-activity-section">
            <div className="sn-activity-tabs">
              {(
                [
                  ["timeline", `Timeline (${TIMELINE_EVENTS.length})`],
                  ["chat", `War-room chat (${CHAT.length})`],
                  ["related", "Related records"],
                  ["automation", "Automation"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`sn-act-tab${tab === id ? " active" : ""}`}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="sn-activity-content">
              {tab === "timeline" && (
                <div className="sn-activity-stream">
                  {TIMELINE_EVENTS.map((ev, i) => {
                    const avatarColor =
                      ev.type === "ai"
                        ? "linear-gradient(135deg,#8b5cf6,#6366f1)"
                        : ev.type === "critical"
                          ? "linear-gradient(135deg,#ef4444,#dc2626)"
                          : ev.type === "success"
                            ? "linear-gradient(135deg,#10b981,#059669)"
                            : ev.type === "warn"
                              ? "linear-gradient(135deg,#f59e0b,#d97706)"
                              : "linear-gradient(135deg,#3b82f6,#2563eb)";
                    return (
                      <div key={i} className="sn-activity-item">
                        <div className="sn-activity-avatar" style={{ background: avatarColor }}>
                          {ev.type === "ai" ? "AI" : ev.type[0].toUpperCase()}
                        </div>
                        <div className="sn-activity-body">
                          <div className="sn-activity-head">
                            <b>{ev.type === "ai" ? "VeltaCore AI" : "Monitoring"}</b>
                            <span className="sn-activity-time">{ev.t}</span>
                          </div>
                          <div className="sn-activity-text">{ev.body}</div>
                          {ev.meta && (
                            <div className="sn-activity-meta">
                              {ev.meta.map((m, j) => (
                                <span key={j} className="sn-tag">{m}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === "chat" && (
                <div className="incd-chat">
                  {CHAT.map((m, i) => {
                    const u = m.u ? userById(m.u) : null;
                    return (
                      <div
                        key={i}
                        className={`incd-chat-row${m.ai ? " ai" : ""}`}
                      >
                        {m.ai ? (
                          <div className="incd-chat-avatar ai">AI</div>
                        ) : (
                          <Avatar name={u?.name ?? "?"} color={u?.color ?? "slate"} size="sm" />
                        )}
                        <div className="incd-chat-body">
                          <div className="incd-chat-head">
                            <b>{m.ai ? "VeltaCore AI" : u?.name ?? "Unknown"}</b>
                            {m.role && (
                              <span className="text-mute" style={{ fontSize: 11 }}>{m.role}</span>
                            )}
                            <span className="incd-chat-time">{m.time}</span>
                          </div>
                          <div className="incd-chat-msg">{m.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === "related" && (
                <div className="sn-related-rows">
                  <div className="sn-related-row">
                    <div>
                      <div className="sn-related-title">Connection pool sizing regression</div>
                      <div className="sn-related-meta">Problem · 4 incidents linked</div>
                    </div>
                    <Link to="/problems/PRB-3912" className="sn-link mono">PRB-3912</Link>
                  </div>
                  <div className="sn-related-row">
                    <div>
                      <div className="sn-related-title">Pool config rollback</div>
                      <div className="sn-related-meta">Change · approved · implementing</div>
                    </div>
                    <Link to="/changes/CHG-2219" className="sn-link mono">CHG-2219</Link>
                  </div>
                  <div className="sn-related-row">
                    <div>
                      <div className="sn-related-title">Stripe pool exhaustion runbook</div>
                      <div className="sn-related-meta">Knowledge · 1,283 views</div>
                    </div>
                    <Link to="/knowledge/KB-2114" className="sn-link mono">KB-2114</Link>
                  </div>
                </div>
              )}

              {tab === "automation" && (
                <div className="sn-empty">
                  <i className="fa-solid fa-bolt" />
                  <h4>Automation suggestions</h4>
                  <p>
                    VeltaCore AI recommends running <b>pool-expansion-v3</b> and rolling back
                    deploy <code>2f8a1c</code>. Both have one-click runbook entries available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side rail — on-call, status-page, impact */}
        <aside className="sn-form-side">
          {/* On-call responders */}
          <div className="sn-side-card">
            <div className="sn-side-head">
              On-call responders
              <span className="sn-side-count">{onCallEntries.length}</span>
            </div>
            <div className="sn-side-body">
              {onCallEntries.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: 0 }}>
                  No schedules cover this tenant.
                </p>
              ) : (
                onCallEntries.map((e) => (
                  <div key={e.schedule.id} className="sn-related-row">
                    <div style={{ minWidth: 0 }}>
                      <div className="sn-related-title" style={{ fontSize: 12 }}>
                        <UserById id={e.userId} />
                      </div>
                      <div className="sn-related-meta">
                        {e.schedule.name} · layer {e.layer}
                        {e.overridden && " · override"}
                      </div>
                    </div>
                    <Link to="/on-call" className="sn-link" style={{ fontSize: 11 }}>
                      Schedule
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status page integration */}
          {statusLink && (
            <div className="sn-side-card">
              <div className="sn-side-head">Status page</div>
              <div className="sn-side-body">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      className="sp-status-dot"
                      style={{
                        background: STATUS_COLOR[statusLink.component.status],
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                      }}
                    />
                    <b style={{ fontSize: 12.5 }}>{statusLink.component.name}</b>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
                    Component on{" "}
                    <Link to="/status-pages" className="sn-link">
                      {statusLink.page.name}
                    </Link>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
                    Current status: <b style={{ color: STATUS_COLOR[statusLink.component.status] }}>
                      {STATUS_LABEL[statusLink.component.status]}
                    </b>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
                    Subscribers: {statusLink.page.subscribers.email.toLocaleString()} email ·{" "}
                    {statusLink.page.subscribers.sms} SMS
                  </div>
                  {latestPublish ? (
                    <>
                      <div className="incd-publish-confirm">
                        <i className="fa-solid fa-circle-check" />{" "}
                        Last update · {STAGE_LABEL[latestPublish.stage]} at{" "}
                        {new Date(latestPublish.at).toLocaleTimeString()}
                      </div>
                      <button
                        type="button"
                        className="sn-btn primary"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => setPublishOpen(true)}
                      >
                        <i className="fa-solid fa-bullhorn" /> Post another update
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="sn-btn primary"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => setPublishOpen(true)}
                    >
                      <i className="fa-solid fa-bullhorn" /> Publish update
                    </button>
                  )}
                  {publishHistory.length > 1 && (
                    <details className="incd-publish-history">
                      <summary>
                        {publishHistory.length} updates posted on this incident
                      </summary>
                      <ol>
                        {publishHistory.map((p) => (
                          <li key={p.id}>
                            <span className="incd-publish-stage">
                              {STAGE_LABEL[p.stage]}
                            </span>
                            <span className="incd-publish-time">
                              {new Date(p.at).toLocaleString()}
                            </span>
                            <span className="incd-publish-msg">{p.message}</span>
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Impact */}
          <div className="sn-side-card">
            <div className="sn-side-head">Impact</div>
            <div className="sn-side-body">
              <SideField label="Customers" value={incident.impacted} />
              <SideField label="Service" value={incident.service} mono />
              <SideField label="Tenant" value={tenantName} />
              <SideField label="Severity" value={`SEV ${incident.sev}`} />
              {service && (
                <>
                  <SideField label="Uptime (30d)" value={`${service.uptime}%`} mono />
                  <SideField label="p95 latency" value={service.p95} mono />
                  <SideField label="Error rate" value={`${service.err}%`} mono />
                </>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="sn-side-card">
            <div className="sn-side-head">Quick actions</div>
            <div className="sn-side-body sn-actions-grid">
              {(
                [
                  ["fa-fire", "Escalate"],
                  ["fa-user-plus", "Add responder"],
                  ["fa-play", "Run runbook"],
                  ["fa-arrow-rotate-left", "Rollback"],
                  ["fa-bell-slash", "Mute"],
                  ["fa-link", "Link problem"],
                ] as const
              ).map(([ic, lbl]) => (
                <button key={lbl} type="button" className="sn-action">
                  <i className={`fa-solid ${ic}`} />
                  <span>{lbl}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Publish-to-status-page modal */}
      {publishOpen && statusLink && (
        <div className="incd-modal-backdrop" onClick={() => setPublishOpen(false)} role="presentation">
          <div
            className="incd-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Publish to status page"
          >
            <div className="incd-modal-head">
              <h2>
                Publish to <span className="text-mute">{statusLink.page.name}</span>
              </h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPublishOpen(false)}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="incd-modal-body">
              <div className="incd-modal-row">
                <label>Affected component</label>
                <div className="incd-modal-value">
                  <span
                    className="sp-status-dot"
                    style={{
                      background: STATUS_COLOR[statusLink.component.status],
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      marginRight: 6,
                    }}
                  />
                  <b>{statusLink.component.name}</b>
                </div>
              </div>
              <div className="incd-modal-row">
                <label>Stage</label>
                <div className="incd-modal-segmented">
                  {(["investigating", "identified", "monitoring", "resolved"] as const).map((s) => (
                    <button
                      type="button"
                      key={s}
                      className={`incd-seg${draftStage === s ? " active" : ""}`}
                      onClick={() => setDraftStage(s)}
                    >
                      {STAGE_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="incd-modal-row">
                <label htmlFor="incd-msg">Public message</label>
                <textarea
                  id="incd-msg"
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  rows={4}
                />
                <p className="incd-modal-help">
                  This message will be sent to {statusLink.page.subscribers.email.toLocaleString()}{" "}
                  email subscribers and posted on {statusLink.page.domain}.
                </p>
              </div>
            </div>
            <div className="incd-modal-foot">
              <button type="button" className="sn-btn" onClick={() => setPublishOpen(false)}>
                Cancel
              </button>
              <button type="button" className="sn-btn primary" onClick={handlePublish}>
                <i className="fa-solid fa-paper-plane" /> Publish to{" "}
                {statusLink.page.subscribers.email + statusLink.page.subscribers.sms} subscribers
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .incd-chat{display:flex;flex-direction:column;gap:10px}
        .incd-chat-row{display:flex;gap:10px;align-items:flex-start}
        .incd-chat-avatar{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:11px;font-weight:700;flex-shrink:0}
        .incd-chat-avatar.ai{background:linear-gradient(135deg,#8b5cf6,#6366f1)}
        .incd-chat-body{flex:1;min-width:0}
        .incd-chat-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:2px}
        .incd-chat-head b{font-size:12.5px;font-weight:600}
        .incd-chat-time{font-size:11px;color:var(--fg-subtle);font-variant-numeric:tabular-nums;margin-left:auto}
        .incd-chat-msg{font-size:12.5px;color:var(--fg);background:var(--bg-muted,#f8fafc);padding:8px 10px;border-radius:8px}
        .incd-chat-row.ai .incd-chat-msg{background:rgba(139,92,246,.08);border-left:2px solid #8b5cf6}

        .incd-publish-confirm{display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:6px;background:rgba(16,185,129,.08);color:#065f46;font-size:11.5px}
        .incd-publish-confirm i{color:#10b981}
        .incd-publish-history{font-size:11.5px}
        .incd-publish-history>summary{cursor:pointer;color:var(--fg-subtle);padding:4px 0}
        .incd-publish-history>summary:hover{color:var(--fg)}
        .incd-publish-history>ol{margin:8px 0 0;padding:0 0 0 8px;list-style:none;border-left:2px solid var(--border,#e2e8f0);display:flex;flex-direction:column;gap:8px}
        .incd-publish-history>ol>li{display:flex;flex-direction:column;gap:2px;font-size:11.5px}
        .incd-publish-stage{font-weight:600;color:var(--accent);font-size:10.5px;text-transform:uppercase;letter-spacing:.04em}
        .incd-publish-time{color:var(--fg-subtle);font-size:10.5px}
        .incd-publish-msg{color:var(--fg)}

        .incd-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.5);display:grid;place-items:center;z-index:2147483640;padding:24px}
        .incd-modal{background:var(--bg,#fff);border-radius:12px;max-width:560px;width:100%;max-height:calc(100vh - 48px);overflow:auto;box-shadow:0 24px 60px rgba(0,0,0,.3)}
        .incd-modal-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border,#e2e8f0)}
        .incd-modal-head h2{margin:0;font-size:15px;font-weight:600}
        .incd-modal-head h2 .text-mute{font-weight:400;font-size:13px}
        .incd-modal-body{padding:20px;display:flex;flex-direction:column;gap:16px}
        .incd-modal-row{display:flex;flex-direction:column;gap:6px}
        .incd-modal-row label{font-size:11px;font-weight:600;color:var(--fg-subtle);text-transform:uppercase;letter-spacing:.04em}
        .incd-modal-row textarea{width:100%;padding:10px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;font:inherit;font-size:13px;resize:vertical;min-height:80px}
        .incd-modal-row textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px rgba(36,235,175,.2)}
        .incd-modal-help{font-size:11px;color:var(--fg-subtle);margin:0}
        .incd-modal-segmented{display:flex;border:1px solid var(--border,#e2e8f0);border-radius:8px;overflow:hidden}
        .incd-seg{flex:1;border:0;background:transparent;padding:8px 10px;cursor:pointer;font:inherit;font-size:12px;color:var(--fg);border-right:1px solid var(--border,#e2e8f0)}
        .incd-seg:last-child{border-right:0}
        .incd-seg.active{background:var(--accent);color:#fff;font-weight:600}
        .incd-seg:hover:not(.active){background:var(--bg-muted,#f8fafc)}
        .incd-modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:16px 20px;border-top:1px solid var(--border,#e2e8f0)}
      `}</style>
    </div>
  );
}

interface KpiProps {
  label: string;
  value: string | number;
  sub: string;
  tone: "ok" | "warn" | "crit" | "neutral";
}
function KpiBox({ label, value, sub, tone }: KpiProps) {
  return (
    <div className={`sn-kpi tone-${tone}`}>
      <div className="sn-kpi-l">{label}</div>
      <div className="sn-kpi-v">{value}</div>
      <div className="sn-kpi-s">{sub}</div>
    </div>
  );
}

function SideField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="sn-form-group">
      <div className="sn-field-label">{label}</div>
      <div className={`sn-field-value${mono ? " mono" : ""}`}>{value}</div>
    </div>
  );
}
