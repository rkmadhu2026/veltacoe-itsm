import { useMemo, useState } from "react";
import { Pill } from "@/components";
import {
  STATUS_INCIDENTS,
  STATUS_PAGES,
  componentsForPage,
  incidentsForPage,
  rollUpStatus,
} from "@/data/status-pages";
import type {
  ComponentStatus,
  StatusImpact,
  StatusIncidentStage,
} from "@/types";

// Presentation helpers — single source of truth for status colors/labels
// so the page header, component dots, and uptime bars stay aligned.
const STATUS_LABEL: Record<ComponentStatus, string> = {
  operational: "Operational",
  degraded: "Degraded performance",
  "partial-outage": "Partial outage",
  "major-outage": "Major outage",
  maintenance: "Under maintenance",
};

const STATUS_COLOR: Record<ComponentStatus, string> = {
  operational: "#10b981",
  degraded: "#f59e0b",
  "partial-outage": "#fb923c",
  "major-outage": "#ef4444",
  maintenance: "#6366f1",
};

const IMPACT_PILL: Record<StatusImpact, "neutral" | "info" | "warning" | "critical"> = {
  none: "neutral",
  minor: "info",
  major: "warning",
  critical: "critical",
};

const STAGE_LABEL: Record<StatusIncidentStage, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

export function StatusPagesScreen() {
  const [selectedPageId, setSelectedPageId] = useState<string>(STATUS_PAGES[0].id);
  const selectedPage = STATUS_PAGES.find((p) => p.id === selectedPageId)!;
  const components = useMemo(() => componentsForPage(selectedPageId), [selectedPageId]);
  const incidents = useMemo(() => incidentsForPage(selectedPageId), [selectedPageId]);
  const rollup = rollUpStatus(selectedPageId);

  const activeIncidents = incidents.filter((i) => i.stage !== "resolved");
  const totalIncidents = STATUS_INCIDENTS.length;
  const totalSubscribers =
    STATUS_PAGES.reduce(
      (sum, p) =>
        sum + p.subscribers.email + p.subscribers.sms + p.subscribers.webhook + p.subscribers.rss,
      0,
    );

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <a className="sn-link">Home</a>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Service</a>
        <span className="sn-bc-sep">›</span>
        <span>Status pages</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">SPG-{STATUS_PAGES.length.toString().padStart(4, "0")}</span>
          <Pill kind={activeIncidents.length === 0 ? "success" : "warning"}>
            {activeIncidents.length === 0
              ? "All systems operational"
              : `${activeIncidents.length} active incident${activeIncidents.length === 1 ? "" : "s"}`}
          </Pill>
          <Pill kind="neutral" noDot>
            {totalSubscribers.toLocaleString()} subscribers
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Status pages</h1>
          <div className="sn-form-sub">
            {STATUS_PAGES.length} pages · {totalIncidents} historical incidents · auto-published from
            internal incident records
          </div>
        </div>
        <div className="sn-form-actions">
          <button className="sn-btn">
            <i className="fa-solid fa-rss" /> Subscribe
          </button>
          <button className="sn-btn">
            <i className="fa-solid fa-file-export" /> Embed
          </button>
          <button className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New page
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="sn-kpi-strip">
        <Kpi label="Pages" value={STATUS_PAGES.length} sub={`${STATUS_PAGES.filter((p) => p.visibility === "public").length} public · ${STATUS_PAGES.filter((p) => p.visibility === "private").length} private`} tone="neutral" />
        <Kpi label="Components" value={components.length} sub={`across ${selectedPage.groups.length} groups`} tone="neutral" />
        <Kpi label="Active incidents" value={activeIncidents.length} sub="on selected page" tone={activeIncidents.length ? "warn" : "ok"} />
        <Kpi label="90-day uptime" value={`${(selectedPage.uptime90d * 100).toFixed(2)}%`} sub="avg across components" tone={selectedPage.uptime90d > 0.999 ? "ok" : selectedPage.uptime90d > 0.99 ? "warn" : "crit"} />
        <Kpi label="Subscribers" value={(selectedPage.subscribers.email + selectedPage.subscribers.sms + selectedPage.subscribers.webhook).toLocaleString()} sub="email + sms + webhook" tone="neutral" />
        <Kpi label="Historical" value={STATUS_INCIDENTS.length} sub="incidents all-time" tone="neutral" />
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          {/* Page selector */}
          <div className="sp-page-tabs">
            {STATUS_PAGES.map((p) => {
              const active = p.id === selectedPageId;
              const local = rollUpStatus(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  className={`sp-page-tab${active ? " active" : ""}`}
                  onClick={() => setSelectedPageId(p.id)}
                >
                  <div className="sp-tab-head">
                    <b>{p.name}</b>
                    <Pill kind={p.visibility === "public" ? "info" : "neutral"} noDot>
                      {p.visibility}
                    </Pill>
                  </div>
                  <div className="sp-tab-meta">
                    <span className="sp-tab-domain">{p.domain}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span
                        className="sp-status-dot"
                        style={{ background: STATUS_COLOR[local.status] }}
                      />
                      <span style={{ fontSize: 11 }}>{local.label}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Big rollup banner — what subscribers see at the top of the public page */}
          <div className={`sp-banner sp-banner-${rollup.tone}`}>
            <i
              className={`fa-solid ${
                rollup.tone === "ok"
                  ? "fa-circle-check"
                  : rollup.tone === "warn"
                    ? "fa-triangle-exclamation"
                    : "fa-circle-xmark"
              }`}
            />
            <div>
              <b>{rollup.label}</b>
              <div style={{ fontSize: 12, color: "var(--fg-subtle)", marginTop: 2 }}>
                {selectedPage.domain} · last update {new Date().toLocaleTimeString()}
              </div>
            </div>
            <a
              className="sn-link"
              href={`https://${selectedPage.domain}`}
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: "auto", fontSize: 12 }}
            >
              View public page <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginLeft: 4 }} />
            </a>
          </div>

          {/* Components grouped */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-chevron-down" />
              <span className="sn-section-title">Components</span>
              <span className="sn-section-badge">
                {components.length} across {selectedPage.groups.length} groups
              </span>
            </div>
            <div className="sn-section-content">
              {selectedPage.groups.map((group) => {
                const groupComponents = components.filter((c) => c.groupId === group.id);
                return (
                  <div key={group.id} className="sp-group">
                    <div className="sp-group-head">
                      <b>{group.name}</b>
                      <span className="text-mute" style={{ fontSize: 11 }}>
                        {groupComponents.length} components
                      </span>
                    </div>
                    <ul className="sp-component-list">
                      {groupComponents.map((c) => (
                        <li key={c.id} className="sp-component-row">
                          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <span
                              className="sp-status-dot"
                              style={{ background: STATUS_COLOR[c.status] }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 550 }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
                                {c.description}
                              </div>
                            </div>
                          </div>
                          <div className="sp-component-meta">
                            <span style={{ fontSize: 11.5, color: STATUS_COLOR[c.status] }}>
                              {STATUS_LABEL[c.status]}
                            </span>
                            <UptimeBar uptime={c.uptime90d} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incident history */}
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-chevron-down" />
              <span className="sn-section-title">Incident history</span>
              <span className="sn-section-badge">
                {incidents.length} on this page
              </span>
            </div>
            <div className="sn-section-content">
              {incidents.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: 0 }}>
                  No incidents have been published to this page.
                </p>
              ) : (
                <ul className="sp-incident-list">
                  {incidents.map((inc) => (
                    <li key={inc.id} className="sp-incident-card">
                      <div className="sp-incident-head">
                        <Pill kind={IMPACT_PILL[inc.impact]}>{inc.impact}</Pill>
                        <b>{inc.title}</b>
                        <span className="sp-incident-stage">{STAGE_LABEL[inc.stage]}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--fg-subtle)" }}>
                          {new Date(inc.startedAt).toLocaleString()}
                        </span>
                      </div>
                      <ol className="sp-incident-updates">
                        {inc.updates.map((u) => (
                          <li key={u.id}>
                            <span className="sp-update-stage">{STAGE_LABEL[u.stage]}</span>
                            <span className="sp-update-time">
                              {new Date(u.at).toLocaleTimeString()}
                            </span>
                            <span className="sp-update-msg">{u.message}</span>
                          </li>
                        ))}
                      </ol>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Side rail */}
        <aside className="sn-form-side">
          <div className="sn-side-card">
            <div className="sn-side-head">Page details</div>
            <div className="sn-side-body">
              <Field label="Visibility">
                <Pill kind={selectedPage.visibility === "public" ? "info" : "neutral"} noDot>
                  {selectedPage.visibility}
                </Pill>
              </Field>
              <Field label="Domain">
                <span className="mono" style={{ fontSize: 11.5 }}>{selectedPage.domain}</span>
              </Field>
              <Field label="Tenant">{selectedPage.tenant}</Field>
              <Field label="Slug">
                <span className="mono" style={{ fontSize: 11.5 }}>{selectedPage.slug}</span>
              </Field>
              <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: "8px 0 0" }}>
                {selectedPage.description}
              </p>
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">Subscribers</div>
            <div className="sn-side-body">
              <Field label="Email">
                {selectedPage.subscribers.email.toLocaleString()}
              </Field>
              <Field label="SMS">{selectedPage.subscribers.sms.toLocaleString()}</Field>
              <Field label="Webhook">{selectedPage.subscribers.webhook}</Field>
              <Field label="RSS / Atom">{selectedPage.subscribers.rss}</Field>
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">Quick actions</div>
            <div className="sn-side-body sn-actions-grid">
              {(
                [
                  ["fa-bullhorn", "Post update"],
                  ["fa-calendar-plus", "Schedule maintenance"],
                  ["fa-envelope", "Email subscribers"],
                  ["fa-code", "Get embed code"],
                  ["fa-globe", "Custom domain"],
                  ["fa-palette", "Branding"],
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
            <div className="sn-side-head">Active across all pages</div>
            <div className="sn-side-body">
              {STATUS_INCIDENTS.filter((i) => i.stage !== "resolved").map((i) => {
                const page = STATUS_PAGES.find((p) => p.id === i.pageId);
                return (
                  <button
                    type="button"
                    key={i.id}
                    className="sn-related-row"
                    onClick={() => i.pageId && setSelectedPageId(i.pageId)}
                    style={{ cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div className="sn-related-title" style={{ fontSize: 12 }}>
                        {i.title}
                      </div>
                      <div className="sn-related-meta">
                        {page?.name} · {STAGE_LABEL[i.stage]}
                      </div>
                    </div>
                    <Pill kind={IMPACT_PILL[i.impact]}>{i.impact}</Pill>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .sp-page-tabs{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px;margin-bottom:16px}
        .sp-page-tab{text-align:left;padding:12px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg,#fff);cursor:pointer;display:flex;flex-direction:column;gap:10px}
        .sp-page-tab:hover{border-color:var(--accent)}
        .sp-page-tab.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
        .sp-tab-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
        .sp-tab-head b{font-size:13px;font-weight:600}
        .sp-tab-meta{display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--fg-subtle,#64748b)}
        .sp-tab-domain{font-family:var(--font-mono,ui-monospace,monospace);font-size:11px}
        .sp-status-dot{display:inline-block;width:8px;height:8px;border-radius:50%;flex-shrink:0}

        .sp-banner{display:flex;align-items:center;gap:12px;padding:16px;border-radius:10px;margin-bottom:16px;border:1px solid}
        .sp-banner i{font-size:24px}
        .sp-banner-ok{background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.3);color:#065f46}
        .sp-banner-ok i{color:#10b981}
        .sp-banner-warn{background:rgba(245,158,11,.08);border-color:rgba(245,158,11,.3);color:#92400e}
        .sp-banner-warn i{color:#f59e0b}
        .sp-banner-crit{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.3);color:#991b1b}
        .sp-banner-crit i{color:#ef4444}

        .sp-group{margin-bottom:16px}
        .sp-group:last-child{margin-bottom:0}
        .sp-group-head{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border,#e2e8f0);margin-bottom:8px}
        .sp-group-head b{font-size:12.5px;font-weight:600}
        .sp-component-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}
        .sp-component-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 10px;border-radius:6px}
        .sp-component-row:hover{background:var(--bg-muted,#f8fafc)}
        .sp-component-meta{display:flex;align-items:center;gap:12px;flex-shrink:0}

        .sp-uptime-bar{display:flex;align-items:center;gap:6px}
        .sp-uptime-bar-track{width:80px;height:6px;border-radius:3px;background:var(--bg-muted,#e2e8f0);overflow:hidden}
        .sp-uptime-bar-fill{height:100%;border-radius:3px}
        .sp-uptime-bar-pct{font-size:11px;font-variant-numeric:tabular-nums;color:var(--fg-subtle,#64748b);min-width:48px}

        .sp-incident-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px}
        .sp-incident-card{padding:12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg-muted,#f8fafc)}
        .sp-incident-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}
        .sp-incident-head b{font-size:13px;font-weight:600;flex:1;min-width:0}
        .sp-incident-stage{padding:2px 8px;border-radius:999px;background:rgba(0,0,0,.06);font-size:11px}
        .sp-incident-updates{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;border-left:2px solid var(--border,#e2e8f0);padding-left:12px}
        .sp-incident-updates>li{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;font-size:12px}
        .sp-update-stage{font-weight:600;color:var(--accent);font-size:11px;text-transform:uppercase;letter-spacing:.04em}
        .sp-update-time{color:var(--fg-subtle,#64748b);font-size:11px;font-variant-numeric:tabular-nums}
        .sp-update-msg{flex:1;min-width:0;color:var(--fg)}
      `}</style>
    </div>
  );
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sn-form-group">
      <div className="sn-field-label">{label}</div>
      <div className="sn-field-value">{children}</div>
    </div>
  );
}

function UptimeBar({ uptime }: { uptime: number }) {
  const pct = uptime * 100;
  const color = uptime > 0.999 ? "#10b981" : uptime > 0.99 ? "#f59e0b" : "#ef4444";
  return (
    <div className="sp-uptime-bar">
      <div className="sp-uptime-bar-track">
        <div className="sp-uptime-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="sp-uptime-bar-pct">{pct.toFixed(2)}%</span>
    </div>
  );
}
