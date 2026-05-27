import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sev, UserById } from "@/components";
import {
  INCIDENTS,
  SCHEDULES,
  SERVICES,
  STATUS_INCIDENTS,
  STATUS_PAGES,
  TENANTS,
  TIMELINE_EVENTS,
  rollUpStatus,
  whoIsOnCall,
} from "@/data";
import { useStatusUpdates } from "@/lib/useStatusUpdates";
import { useTenant } from "@/shell/TenantContext";
import { userById } from "@/data/users";

export function DashboardScreen() {
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"work" | "comments" | "activities" | "related">("work");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const activeSev1 = INCIDENTS.filter((i) => i.sev === 1 && i.status === "active").length;
  const activeIncidents = INCIDENTS.filter((i) => i.status === "active").length;

  // Live on-call snapshot across every schedule — used for the side rail.
  const now = useMemo(() => new Date(), []);
  const liveOnCall = useMemo(
    () =>
      SCHEDULES.map((s) => ({ schedule: s, current: whoIsOnCall(s.id, now) })).filter(
        (x) => x.current,
      ),
    [now],
  );

  // Status-page rollups across every page + active status incidents.
  const statusSummary = useMemo(
    () =>
      STATUS_PAGES.map((p) => ({ page: p, rollup: rollUpStatus(p.id) })),
    [],
  );
  const activeStatusIncidents = STATUS_INCIDENTS.filter((i) => i.stage !== "resolved");

  const { updates: publishedUpdates } = useStatusUpdates();

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <a className="sn-link">Home</a>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Operations</a>
        <span className="sn-bc-sep">›</span>
        <span>{tenant.name} Dashboard</span>
      </div>

      <div className="ops-command">
        <div className="ops-command-copy">
          <div className="ops-command-kicker">
            <i className="fa-solid fa-bell-circle-check" /> AI Multi-alert Command
          </div>
          <h1>Correlate infrastructure, network, logs, and traces</h1>
          <p>
            Node Exporter, Prometheus, Grafana, and Loki are wired to this tenant so metrics, logs,
            and traces land automatically in one incident timeline.
          </p>
          <div className="ops-command-actions">
            <button
              type="button"
              className="ops-command-primary"
              onClick={() => navigate("/incidents/new")}
            >
              <i className="fa-solid fa-triangle-exclamation" /> Create P1 incident
            </button>
            <button
              type="button"
              className="ops-command-secondary"
              onClick={() => navigate("/entity-map")}
            >
              <i className="fa-solid fa-circle-nodes" /> Trace dependencies
            </button>
            <button
              type="button"
              className="ops-command-secondary"
              onClick={() => navigate("/flow")}
            >
              <i className="fa-solid fa-bolt" /> Run automation
            </button>
          </div>
        </div>
        <div className="ops-command-grid">
          <div className="ops-health-orb">
            <div className="ops-orb-ring" style={{ ["--score" as never]: tenant.health }}>
              <div>
                <b>{tenant.health}</b>
                <span>health</span>
              </div>
            </div>
            <div className="ops-orb-caption">Tenant posture · {tenant.plan}</div>
          </div>
          <div className="ops-signal-card">
            <div className="ops-signal-head">
              <span>Alert correlation</span>
              <b>87%</b>
            </div>
            <div className="ops-signal-bars">
              {[72, 46, 88, 61, 94, 52, 76].map((v, i) => (
                <i key={i} style={{ height: v + "%" }} />
              ))}
            </div>
            <div className="ops-signal-foot">6 alerts grouped into 2 Sev-1 patterns</div>
          </div>
          <div className="ops-risk-stack">
            {([
              ["Node Exporter hosts", "412", "ok"],
              ["Prometheus targets", "866", "ok"],
              ["Grafana dashboards", "12", "ok"],
            ] as const).map(([label, value, tone]) => (
              <div key={label} className={`ops-risk-row ${tone}`}>
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">
            DASH-{String(tenant.name.length).padStart(4, "0")}
          </span>
          <span className="sn-pill prio-1">
            <i className="fa-solid fa-circle" /> 1 — Critical
          </span>
          <span className="sn-pill state-progress">
            <i className="fa-solid fa-spinner fa-spin" /> In Progress
          </span>
          <span className="sn-pill state-neutral">
            <i className="fa-solid fa-shield-halved" /> SLA Tracked
          </span>
        </div>
        <div className="sn-form-title-meta">
          <h1>{tenant.name} · Live Operations</h1>
          <div className="sn-form-sub">
            Auto-refresh every 30s · viewing {tenant.name} scope · last sync 2s ago
          </div>
        </div>
        <div className="sn-form-actions">
          <button className="sn-btn"><i className="fa-solid fa-share-nodes" /> Share</button>
          <button className="sn-btn"><i className="fa-solid fa-file-export" /> Export</button>
          <button className="sn-btn"><i className="fa-solid fa-print" /> Print</button>
          <button
            type="button"
            className="sn-btn primary"
            onClick={() => navigate("/incidents/new")}
          >
            <i className="fa-solid fa-triangle-exclamation" /> Declare Incident
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        {[
          { l: "Open Incidents", v: tenant.incidents, sub: "+2 in last 1h", tone: "crit" },
          { l: "Active Sev-1", v: activeSev1, sub: "needs attention", tone: "crit" },
          { l: "MTTR (p50)", v: tenant.mttr + "m", sub: "12% faster MoM", tone: "ok" },
          { l: "Change Success", v: "96.4%", sub: "+2.1% vs last", tone: "ok" },
          { l: "SLA Compliance", v: "94.2%", sub: "3 at risk", tone: "warn" },
          { l: "Assets Monitored", v: "1,599", sub: "across 5 sites", tone: "neutral" },
        ].map((k) => (
          <div key={k.l} className={`sn-kpi tone-${k.tone}`}>
            <div className="sn-kpi-l">{k.l}</div>
            <div className="sn-kpi-v">{k.v}</div>
            <div className="sn-kpi-s">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          <FormSection
            id="ops"
            title="Operational Snapshot"
            collapsed={collapsed.ops}
            onToggle={toggle}
          >
            <FormRow>
              <Field label="Environment" value="Production" required />
              <Field label="Site" value="dc-blr-1 · Bangalore DC-1" />
            </FormRow>
            <FormRow>
              <Field label="Active Incident Commander" value={<UserById id="u1" />} required />
              <Field
                label="On-call Rotation"
                value={
                  <span>
                    <b>SRE-Tier-1</b> · 5 online
                  </span>
                }
              />
            </FormRow>
            <FormRow>
              <Field
                label="Tenant"
                value={
                  <span>
                    <b>{tenant.name}</b> ({tenant.plan})
                  </span>
                }
                required
              />
              <Field label="Service Window" value="24×7 · Production" />
            </FormRow>
            <FormRow>
              <Field
                label="Last Major Incident"
                value={
                  <Link to="/incidents/INC-48279" className="sn-link">
                    INC-48279 · k8s control plane · 6m ago
                  </Link>
                }
              />
              <Field
                label="Last Change"
                value={
                  <Link to="/changes/CHG-2219" className="sn-link">
                    CHG-2219 · Pool config rollback · 14m ago
                  </Link>
                }
              />
            </FormRow>
          </FormSection>

          <FormSection
            id="ingest"
            title="Automatic Observability Ingestion"
            badge="active"
            collapsed={collapsed.ingest}
            onToggle={toggle}
          >
            <FormRow>
              <Field
                label="Tenant"
                value={
                  <span>
                    <b>{tenant.name}</b> · auto-provisioned
                  </span>
                }
                required
              />
              <Field
                label="Node Exporter"
                value={
                  <span className="tone-ok">
                    <b>Installed</b> · 412 Linux hosts reporting /metrics
                  </span>
                }
              />
            </FormRow>
            <FormRow>
              <Field
                label="Prometheus"
                value={
                  <span className="tone-ok">
                    <b>Scraping</b> · 866 targets · 15s interval
                  </span>
                }
              />
              <Field
                label="Grafana"
                value={
                  <span className="tone-ok">
                    <b>Provisioned</b> · 12 dashboards · tenant scoped
                  </span>
                }
              />
            </FormRow>
            <FormRow>
              <Field
                label="Logs"
                value={
                  <span className="tone-ok">
                    <b>Ingesting</b> · Grafana Loki · 2.8B/day
                  </span>
                }
              />
              <Field
                label="Traces"
                value={
                  <span className="tone-ok">
                    <b>Ingesting</b> · OpenTelemetry · 412M spans/day
                  </span>
                }
              />
            </FormRow>
          </FormSection>

          <FormSection
            id="incidents"
            title="Active Incidents"
            badge={`${activeIncidents} open`}
            collapsed={collapsed.incidents}
            onToggle={toggle}
          >
            <table className="sn-list-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>Sev</th>
                  <th style={{ width: 110 }}>Number</th>
                  <th>Short description</th>
                  <th style={{ width: 130 }}>Service</th>
                  <th style={{ width: 160 }}>Assignment Group</th>
                  <th style={{ width: 110 }}>State</th>
                  <th style={{ width: 80 }}>Age</th>
                  <th style={{ width: 80 }}>SLA</th>
                </tr>
              </thead>
              <tbody>
                {INCIDENTS.slice(0, 6).map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => navigate(`/incidents/${inc.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <Sev n={inc.sev} />
                    </td>
                    <td>
                      <a className="sn-link mono">{inc.id}</a>
                    </td>
                    <td>{inc.title}</td>
                    <td className="mono">{inc.service}</td>
                    <td>{TENANTS.find((t) => t.id === inc.tenant)?.name || "—"}</td>
                    <td>
                      <span className={`sn-state-pill state-${inc.status}`}>
                        <i
                          className={`fa-solid ${
                            inc.status === "active"
                              ? "fa-fire"
                              : inc.status === "mitigating"
                                ? "fa-wrench"
                                : "fa-magnifying-glass"
                          }`}
                        />{" "}
                        {inc.status}
                      </span>
                    </td>
                    <td className="mono text-mute">{inc.age}</td>
                    <td>
                      <div className="sn-sla">
                        <div className="sn-sla-bar">
                          <div
                            className="sn-sla-fill"
                            style={{
                              width: inc.sla * 100 + "%",
                              background:
                                inc.sla < 0.4
                                  ? "var(--critical)"
                                  : inc.sla < 0.7
                                    ? "var(--warning)"
                                    : "var(--success)",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </FormSection>

          <FormSection
            id="services"
            title="Service Health"
            badge={`${SERVICES.length} services`}
            collapsed={collapsed.services}
            onToggle={toggle}
          >
            <table className="sn-list-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th style={{ width: 100 }}>State</th>
                  <th style={{ width: 110 }}>Uptime (30d)</th>
                  <th style={{ width: 110 }}>p95 latency</th>
                  <th style={{ width: 100 }}>Error %</th>
                  <th style={{ width: 130 }}>Dependencies</th>
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((s) => (
                  <tr key={s.name}>
                    <td>
                      <div className="row row-8">
                        <span className={`sn-status-dot ${s.status}`} />
                        <span className="mono">
                          <b>{s.name}</b>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`sn-state-pill svc-${s.status}`}>
                        <i className="fa-solid fa-circle" /> {s.status}
                      </span>
                    </td>
                    <td className="mono">{s.uptime}%</td>
                    <td className="mono">{s.p95}</td>
                    <td
                      className={`mono ${
                        s.err > 1 ? "tone-crit" : s.err > 0.1 ? "tone-warn" : ""
                      }`}
                    >
                      {s.err}%
                    </td>
                    <td className="mono text-mute">{s.deps} CIs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </FormSection>

          <FormSection
            id="changes"
            title="Recent Changes"
            badge="last 24h"
            collapsed={collapsed.changes}
            onToggle={toggle}
          >
            <FormRow>
              <Field label="Total Changes" value="14" />
              <Field
                label="Awaiting Approval"
                value={
                  <span className="tone-warn">
                    <b>2</b> · CAB meets Fri
                  </span>
                }
              />
            </FormRow>
            <FormRow>
              <Field
                label="Implementing Now"
                value={
                  <span>
                    <b>1</b> · CHG-2216 · Feature flags v2.4
                  </span>
                }
              />
              <Field label="Failed Changes" value="0" />
            </FormRow>
            <FormRow>
              <Field
                label="Emergency Changes"
                value={
                  <span>
                    <b>1</b> · CHG-2219 · Pool rollback
                  </span>
                }
              />
              <Field label="Lead Time (p50)" value="1.8d" />
            </FormRow>
          </FormSection>

          <div className="sn-activity-section">
            <div className="sn-activity-tabs">
              {(
                [
                  ["work", `Work Notes (${TIMELINE_EVENTS.length})`],
                  ["comments", "Additional Comments"],
                  ["activities", "Activities"],
                  ["related", "Related Records (3)"],
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
              {tab === "work" && (
                <>
                  <div className="sn-comment-box">
                    <textarea placeholder="Add a work note…" rows={2} />
                    <div className="sn-comment-actions">
                      <span className="text-mute" style={{ fontSize: 11 }}>
                        <i className="fa-solid fa-eye-slash" /> Internal · not visible to caller
                      </span>
                      <div className="row row-8">
                        <button className="sn-btn">
                          <i className="fa-solid fa-paperclip" />
                        </button>
                        <button className="sn-btn primary">Post Work Note</button>
                      </div>
                    </div>
                  </div>
                  <div className="sn-activity-stream">
                    {TIMELINE_EVENTS.map((ev, i) => {
                      const user =
                        i === 0
                          ? "Monitoring System"
                          : i === 1
                            ? "VeltaCore ITSM AI"
                            : [
                                "Priya Raghunathan",
                                "Marcus Okafor",
                                "Yuki Tanaka",
                                "Devon Hassan",
                                "System",
                                "VeltaCore ITSM AI",
                              ][i % 6];
                      const initials = user
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
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
                            {initials}
                          </div>
                          <div className="sn-activity-body">
                            <div className="sn-activity-head">
                              <b>{user}</b>
                              <span className="text-mute">
                                {ev.type === "ai"
                                  ? "ran AI correlation"
                                  : ev.type === "critical"
                                    ? "triggered alert"
                                    : ev.type === "success"
                                      ? "marked progress"
                                      : "added a work note"}
                              </span>
                              <span className="sn-activity-time">{ev.t}</span>
                            </div>
                            <div className="sn-activity-text">{ev.body}</div>
                            {ev.meta && (
                              <div className="sn-activity-meta">
                                {ev.meta.map((m, j) => (
                                  <span key={j} className="sn-tag">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {tab === "comments" && (
                <div className="sn-empty">
                  <i className="fa-solid fa-comments" />
                  <h4>No customer-facing comments</h4>
                  <p>Add a comment to communicate publicly with the caller.</p>
                </div>
              )}
              {tab === "activities" && (
                <div className="sn-empty">
                  <i className="fa-solid fa-clock-rotate-left" />
                  <h4>System activity log</h4>
                  <p>Field changes, state transitions, and automation events appear here.</p>
                </div>
              )}
              {tab === "related" && (
                <div className="sn-empty">
                  <i className="fa-solid fa-link" />
                  <h4>3 related records</h4>
                  <p>1 problem · 2 changes linked to this operational view.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="sn-form-side">
          <div className="sn-side-card">
            <div className="sn-side-head">Assignment</div>
            <div className="sn-side-body">
              <Field label="Assigned to" value={<UserById id="u1" />} />
              <Field label="Group" value="SRE-Tier-1" />
              <Field label="Caller" value={<a className="sn-link">Monitoring System</a>} />
              <Field
                label="Opened by"
                value={<a className="sn-link">prometheus-alertmanager</a>}
              />
              <Field label="Updated" value="2 seconds ago" />
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">Quick Actions</div>
            <div className="sn-side-body sn-actions-grid">
              {(
                [
                  ["fa-fire", "Declare Sev-1"],
                  ["fa-user-plus", "Add Responder"],
                  ["fa-slack fa-brands", "Open War Room"],
                  ["fa-bell-slash", "Mute Alerts"],
                  ["fa-play", "Run Runbook"],
                  ["fa-arrow-up", "Escalate to Mgr"],
                  ["fa-bullhorn", "Update Status Page"],
                  ["fa-arrow-rotate-left", "Rollback Last Deploy"],
                ] as const
              ).map(([ic, lbl]) => (
                <button key={lbl} className="sn-action">
                  <i className={`fa-solid ${ic}`} />
                  <span>{lbl}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">
              Related Records <span className="sn-side-count">3</span>
            </div>
            <div className="sn-side-body">
              <div className="sn-related-row">
                <div>
                  <div className="sn-related-title">Connection pool sizing regression</div>
                  <div className="sn-related-meta">Problem · 4 incidents linked</div>
                </div>
                <Link to="/problems/PRB-3912" className="sn-link mono">
                  PRB-3912
                </Link>
              </div>
              <div className="sn-related-row">
                <div>
                  <div className="sn-related-title">Pool config rollback</div>
                  <div className="sn-related-meta">Change · approved · implementing</div>
                </div>
                <Link to="/changes/CHG-2219" className="sn-link mono">
                  CHG-2219
                </Link>
              </div>
              <div className="sn-related-row">
                <div>
                  <div className="sn-related-title">Stripe pool exhaustion runbook</div>
                  <div className="sn-related-meta">Knowledge · 1,283 views</div>
                </div>
                <Link to="/knowledge/KB-2114" className="sn-link mono">
                  KB-2114
                </Link>
              </div>
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">
              On-call right now
              <span className="sn-side-count">{liveOnCall.length}</span>
            </div>
            <div className="sn-side-body">
              {liveOnCall.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: 0 }}>
                  No active schedules.
                </p>
              ) : (
                liveOnCall.map(({ schedule, current }) => {
                  if (!current) return null;
                  const u = userById(current.userId);
                  return (
                    <div key={schedule.id} className="sn-related-row">
                      <div style={{ minWidth: 0 }}>
                        <div className="sn-related-title" style={{ fontSize: 12 }}>
                          <UserById id={current.userId} showName={true} />
                        </div>
                        <div className="sn-related-meta">
                          {schedule.name}
                          {current.overridden && " · override"}
                        </div>
                      </div>
                      <Link to="/on-call" className="sn-link" style={{ fontSize: 11 }}>
                        →
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">
              Status pages
              {activeStatusIncidents.length > 0 && (
                <span className="sn-side-count">{activeStatusIncidents.length} active</span>
              )}
            </div>
            <div className="sn-side-body">
              {statusSummary.map(({ page, rollup }) => {
                const color =
                  rollup.tone === "ok" ? "#10b981" : rollup.tone === "warn" ? "#f59e0b" : "#ef4444";
                return (
                  <Link
                    key={page.id}
                    to="/status-pages"
                    className="sn-related-row"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div className="sn-related-title" style={{ fontSize: 12 }}>
                        {page.name}
                      </div>
                      <div
                        className="sn-related-meta"
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            background: color,
                          }}
                        />
                        <span>{rollup.label}</span>
                      </div>
                    </div>
                    <span className="text-mute" style={{ fontSize: 11 }}>
                      {(page.uptime90d * 100).toFixed(2)}%
                    </span>
                  </Link>
                );
              })}
              {publishedUpdates.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    background: "rgba(16,185,129,.08)",
                    color: "#065f46",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                >
                  <i
                    className="fa-solid fa-circle-check"
                    style={{ color: "#10b981", marginRight: 6 }}
                  />
                  {publishedUpdates.length} update
                  {publishedUpdates.length === 1 ? "" : "s"} published this session
                </div>
              )}
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">SLA</div>
            <div className="sn-side-body">
              <Field
                label="Response SLA"
                value={
                  <span className="tone-ok">
                    <b>94.2%</b> compliance
                  </span>
                }
              />
              <Field
                label="Resolution SLA"
                value={
                  <span className="tone-warn">
                    <b>88.6%</b> compliance
                  </span>
                }
              />
              <Field
                label="Breaching Now"
                value={
                  <span className="tone-crit">
                    <b>2</b> incidents
                  </span>
                }
              />
              <Field label="Next Review" value="Fri, 16 May · 14:00 UTC" />
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">Infrastructure</div>
            <div className="sn-side-body">
              <Field label="Sites" value="5 datacenters" />
              <Field label="Assets" value="1,599 monitored" />
              <Field
                label="Down/Critical"
                value={
                  <span className="tone-crit">
                    <b>2</b> devices
                  </span>
                }
              />
              <Field
                label="Warning"
                value={
                  <span className="tone-warn">
                    <b>5</b> devices
                  </span>
                }
              />
              <Field label="Exporters" value="9 / 9 healthy" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

interface FormSectionProps {
  id: string;
  title: string;
  badge?: string;
  collapsed?: boolean;
  onToggle?: (id: string) => void;
  children: ReactNode;
}
function FormSection({ id, title, badge, collapsed, onToggle, children }: FormSectionProps) {
  return (
    <div className="sn-form-section">
      <button
        type="button"
        className="sn-section-header"
        onClick={() => onToggle && onToggle(id)}
      >
        <i className={`fa-solid fa-chevron-${collapsed ? "right" : "down"}`} />
        <span className="sn-section-title">{title}</span>
        {badge && <span className="sn-section-badge">{badge}</span>}
      </button>
      {!collapsed && <div className="sn-section-content">{children}</div>}
    </div>
  );
}

function FormRow({ children }: { children: ReactNode }) {
  return <div className="sn-form-row">{children}</div>;
}

interface FieldProps {
  label: string;
  value: ReactNode;
  required?: boolean;
}
function Field({ label, value, required }: FieldProps) {
  return (
    <div className="sn-form-group">
      <div className={`sn-field-label${required ? " required" : ""}`}>{label}</div>
      <div className="sn-field-value">{value}</div>
    </div>
  );
}
