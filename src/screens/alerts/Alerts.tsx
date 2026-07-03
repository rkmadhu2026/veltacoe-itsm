import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, UserById } from "@/components";
import type { PillKind } from "@/components";
import {
  ALERT_INSTANCES,
  ALERT_RECEIVERS,
  ALERT_ROUTE_TREE,
  ALERT_RULES,
  ALERT_SILENCES,
  INHIBITION_RULES,
  MAINTENANCE_WINDOWS,
  TENANTS,
  alertGroups,
  alertRuleById,
  receiverById,
  routeReceiver,
} from "@/data";
import type {
  AlertInstance,
  AlertInstanceState,
  AlertLabelSeverity,
  AlertRoute,
  ReceiverKind,
} from "@/types";

type Tab = "alerts" | "grouping" | "routing" | "silences" | "receivers";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "alerts", label: "Alerts", icon: "fa-bell" },
  { id: "grouping", label: "Grouping & dedup", icon: "fa-object-group" },
  { id: "routing", label: "Routing", icon: "fa-code-branch" },
  { id: "silences", label: "Silences & maintenance", icon: "fa-bell-slash" },
  { id: "receivers", label: "Receivers", icon: "fa-inbox" },
];

const SEV_PILL: Record<AlertLabelSeverity, PillKind> = {
  critical: "critical",
  warning: "warning",
  info: "info",
};

const STATE_META: Record<AlertInstanceState, { pill: PillKind; icon: string }> = {
  firing: { pill: "critical", icon: "fa-fire" },
  pending: { pill: "warning", icon: "fa-hourglass-half" },
  silenced: { pill: "neutral", icon: "fa-bell-slash" },
  inhibited: { pill: "purple", icon: "fa-ban" },
  resolved: { pill: "success", icon: "fa-check" },
};

const RECEIVER_ICON: Record<ReceiverKind, string> = {
  pagerduty: "fa-tower-broadcast",
  email: "fa-envelope",
  slack: "fa-brands fa-slack",
  teams: "fa-brands fa-microsoft",
  webhook: "fa-plug",
  redmine: "fa-ticket",
};

const tenantName = (id: string) => TENANTS.find((t) => t.id === id)?.name ?? id;

export function AlertsScreen() {
  const [tab, setTab] = useState<Tab>("alerts");
  const [sevFilter, setSevFilter] = useState<"all" | AlertLabelSeverity>("all");
  const [stateFilter, setStateFilter] = useState<"all" | AlertInstanceState>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c = { firing: 0, pending: 0, silenced: 0, inhibited: 0, resolved: 0, critical: 0 };
    for (const a of ALERT_INSTANCES) {
      c[a.state]++;
      if (a.severity === "critical" && a.state === "firing") c.critical++;
    }
    return c;
  }, []);

  const groups = useMemo(() => alertGroups(), []);

  const filtered = useMemo(() => {
    return ALERT_INSTANCES.filter((a) => {
      if (sevFilter !== "all" && a.severity !== sevFilter) return false;
      if (stateFilter !== "all" && a.state !== stateFilter) return false;
      if (
        q &&
        !`${a.alertname} ${a.instance} ${a.service} ${a.summary}`
          .toLowerCase()
          .includes(q.toLowerCase())
      )
        return false;
      return true;
    });
  }, [sevFilter, stateFilter, q]);

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Observe</a>
        <span className="sn-bc-sep">›</span>
        <span>Alerts</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">ALRT-MGR</span>
          {counts.critical > 0 && <Pill kind="critical">{counts.critical} critical firing</Pill>}
          {counts.inhibited > 0 && <Pill kind="purple">{counts.inhibited} inhibited</Pill>}
          {counts.silenced > 0 && (
            <Pill kind="neutral" noDot>
              {counts.silenced} silenced
            </Pill>
          )}
        </div>
        <div className="sn-form-title-meta">
          <h1>Alertmanager</h1>
          <div className="sn-form-sub">
            {ALERT_RULES.length} rules · {groups.length} active groups · grouping, dedup, inhibition
            &amp; routing across {TENANTS.length} tenants
          </div>
        </div>
        <div className="sn-form-actions">
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-bell-slash" /> New silence
          </button>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-flask" /> Dry-run route
          </button>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New rule
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Firing" value={counts.firing} sub="active now" tone="crit" />
        <Kpi label="Critical" value={counts.critical} sub="paging Sev1" tone="crit" />
        <Kpi label="Pending" value={counts.pending} sub="in `for` window" tone="warn" />
        <Kpi label="Silenced" value={counts.silenced} sub="muted" tone="neutral" />
        <Kpi label="Inhibited" value={counts.inhibited} sub="suppressed" tone="neutral" />
        <Kpi
          label="Receivers"
          value={ALERT_RECEIVERS.filter((r) => r.enabled).length}
          sub="enabled"
          tone="ok"
        />
      </div>

      <SeverityHeatmap />

      <div className="am-tabs">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`am-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <i className={`fa-solid ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "alerts" && (
        <>
          <div className="inc-toolbar">
            <div className="inc-toolbar-search">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                placeholder="Search alertname, instance, or service…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button
                  type="button"
                  className="inc-toolbar-clear"
                  onClick={() => setQ("")}
                  aria-label="Clear"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
            <div className="inc-toolbar-group">
              <label>Severity</label>
              <div className="inc-segmented">
                {(["all", "critical", "warning", "info"] as const).map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`inc-seg${sevFilter === s ? " active" : ""}`}
                    onClick={() => setSevFilter(s)}
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
            </div>
            <div className="inc-toolbar-group">
              <label>State</label>
              <div className="inc-segmented">
                {(["all", "firing", "pending", "silenced", "inhibited", "resolved"] as const).map(
                  (s) => (
                    <button
                      type="button"
                      key={s}
                      className={`inc-seg${stateFilter === s ? " active" : ""}`}
                      onClick={() => setStateFilter(s)}
                    >
                      {s === "all" ? "All" : s}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="sn-form-section">
            <div className="sn-section-content">
              <table className="sn-list-table">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Severity</th>
                    <th style={{ width: 110 }}>State</th>
                    <th>Alert</th>
                    <th style={{ width: 160 }}>Instance</th>
                    <th style={{ width: 150 }}>Service</th>
                    <th style={{ width: 150 }}>Tenant</th>
                    <th style={{ width: 130 }}>Receiver</th>
                    <th style={{ width: 80 }}>Value</th>
                    <th style={{ width: 90 }}>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <AlertRow key={a.id} a={a} />
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        style={{ padding: 32, textAlign: "center", color: "var(--fg-subtle)" }}
                      >
                        No alerts match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "grouping" && <GroupingView />}
      {tab === "routing" && <RoutingView />}
      {tab === "silences" && <SilencesView />}
      {tab === "receivers" && <ReceiversView />}

      <style>{STYLES}</style>
    </div>
  );
}

// ── Alert row ────────────────────────────────────────────────────────────────

function AlertRow({ a }: { a: AlertInstance }) {
  const rule = alertRuleById(a.ruleId);
  const receiver = receiverById(routeReceiver(a));
  return (
    <tr>
      <td>
        <Pill kind={SEV_PILL[a.severity]}>{a.severity}</Pill>
      </td>
      <td>
        <span className={`sn-state-pill state-${a.state === "firing" ? "active" : "resolved"}`}>
          <i className={`fa-solid ${STATE_META[a.state].icon}`} /> {a.state}
        </span>
      </td>
      <td>
        <div style={{ fontWeight: 550 }}>{a.alertname}</div>
        <div style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>{a.summary}</div>
        {rule?.runbook && (
          <div style={{ fontSize: 11 }}>
            <i className="fa-solid fa-book" style={{ marginRight: 4, color: "var(--accent)" }} />
            <span className="mono">{rule.runbook}</span>
          </div>
        )}
      </td>
      <td className="mono">
        {a.instance.startsWith("SW-") ||
        a.instance.startsWith("FW-") ||
        a.instance.startsWith("LNX-") ||
        a.instance.startsWith("WIN-") ||
        a.instance.startsWith("ESX-") ||
        a.instance.startsWith("UPS-") ||
        a.instance.startsWith("EXP-") ? (
          <Link to={`/infra/device/${a.instance}`} className="sn-link mono">
            {a.instance}
          </Link>
        ) : (
          a.instance
        )}
      </td>
      <td className="mono">{a.service}</td>
      <td>{tenantName(a.tenant)}</td>
      <td>
        {receiver && (
          <span className="am-receiver-chip">
            <i className={`fa-solid ${RECEIVER_ICON[receiver.kind]}`} />{" "}
            {receiver.name.split(" · ")[0]}
          </span>
        )}
      </td>
      <td className="mono">{a.value}</td>
      <td className="mono text-mute">{a.startsAt}</td>
    </tr>
  );
}

// ── Severity heatmap (site × 2h bucket, deterministic) ───────────────────────

function SeverityHeatmap() {
  const sites = useMemo(() => {
    const set = new Map<string, number>();
    for (const a of ALERT_INSTANCES) set.set(a.site, (set.get(a.site) ?? 0) + 1);
    return [...set.keys()].sort();
  }, []);
  const BUCKETS = 12; // last 24h in 2h buckets

  return (
    <div className="sn-form-section am-heatmap-card">
      <div className="sn-section-header">
        <i className="fa-solid fa-fire-flame-curve" />
        <span className="sn-section-title">Alert density · last 24h</span>
        <span className="sn-section-badge">{sites.length} sites × 2h buckets</span>
      </div>
      <div className="sn-section-content">
        <div className="am-heatmap">
          <div className="am-heatmap-row am-heatmap-head">
            <div className="am-heatmap-label" />
            {Array.from({ length: BUCKETS }, (_, i) => (
              <div
                key={i}
                className="am-heatmap-time"
              >{`${(24 - (BUCKETS - i) * 2).toString().padStart(2, "0")}h`}</div>
            ))}
          </div>
          {sites.map((site, r) => (
            <div key={site} className="am-heatmap-row">
              <div className="am-heatmap-label mono">{site}</div>
              {Array.from({ length: BUCKETS }, (_, c) => {
                // Deterministic synthetic density seeded by site+bucket, biased
                // up in recent buckets for firing sites.
                const base = (Math.sin(r * 2.3 + c * 0.7) + 1) / 2;
                const recency = c / BUCKETS;
                const v = Math.min(1, base * 0.7 + recency * 0.4 * (r % 2 === 0 ? 1 : 0.5));
                const n = Math.round(v * 6);
                return (
                  <div
                    key={c}
                    className="am-heatmap-cell"
                    title={`${site} · ${n} alerts`}
                    style={{
                      background: n === 0 ? "var(--bg-muted)" : `rgba(220,38,38,${0.12 + v * 0.7})`,
                    }}
                  >
                    {n > 0 ? n : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="am-heatmap-legend">
          <span>Less</span>
          {[0.15, 0.35, 0.55, 0.75, 0.95].map((o) => (
            <span
              key={o}
              className="am-heatmap-swatch"
              style={{ background: `rgba(220,38,38,${o})` }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

// ── Grouping & dedup ─────────────────────────────────────────────────────────

function GroupingView() {
  const groups = useMemo(() => alertGroups(), []);
  return (
    <div className="sn-form-section">
      <div className="sn-section-header">
        <i className="fa-solid fa-object-group" />
        <span className="sn-section-title">Alert groups</span>
        <span className="sn-section-badge">
          {groups.length} groups · grouped by alertname · tenant · site
        </span>
      </div>
      <div className="sn-section-content am-groups">
        {groups.map((g) => {
          const members = g.members
            .map((id) => ALERT_INSTANCES.find((a) => a.id === id))
            .filter((a): a is AlertInstance => Boolean(a));
          const receiver = receiverById(g.receiver);
          return (
            <div key={g.key} className="am-group">
              <div className="am-group-head">
                <Pill kind={SEV_PILL[g.labels.severity as AlertLabelSeverity]}>
                  {g.labels.severity}
                </Pill>
                <b>{g.labels.alertname}</b>
                <span className="mono text-mute">
                  {tenantName(g.labels.tenant)} · {g.labels.site}
                </span>
                <span className="am-group-count">{members.length}</span>
                {receiver && (
                  <span className="am-receiver-chip" style={{ marginLeft: "auto" }}>
                    <i className={`fa-solid ${RECEIVER_ICON[receiver.kind]}`} />{" "}
                    {receiver.name.split(" · ")[0]}
                  </span>
                )}
              </div>
              <div className="am-group-members">
                {members.map((a) => (
                  <div key={a.id} className="am-group-member">
                    <span
                      className={`sn-state-pill state-${a.state === "firing" ? "active" : "resolved"}`}
                    >
                      <i className={`fa-solid ${STATE_META[a.state].icon}`} /> {a.state}
                    </span>
                    <Link to={`/infra/device/${a.instance}`} className="sn-link mono">
                      {a.instance}
                    </Link>
                    <span className="text-mute" style={{ fontSize: 11.5 }}>
                      {a.summary}
                    </span>
                    <span className="mono text-mute" style={{ marginLeft: "auto" }}>
                      {a.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Routing tree ─────────────────────────────────────────────────────────────

function RoutingView() {
  return (
    <div className="sn-form-layout">
      <div className="sn-form-main">
        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-code-branch" />
            <span className="sn-section-title">Routing tree</span>
            <span className="sn-section-badge">first-match, depth-first</span>
          </div>
          <div className="sn-section-content">
            <RouteNode route={ALERT_ROUTE_TREE} depth={0} isRoot />
          </div>
        </div>
      </div>
      <aside className="sn-form-side">
        <div className="sn-side-card">
          <div className="sn-side-head">
            Inhibition rules <span className="sn-side-count">{INHIBITION_RULES.length}</span>
          </div>
          <div className="sn-side-body">
            {INHIBITION_RULES.map((r) => (
              <div key={r.id} className="am-inhibit">
                <div className="mono" style={{ fontSize: 11 }}>
                  <span className="am-inhibit-src">{r.sourceMatch}</span>
                  <i
                    className="fa-solid fa-arrow-down-long"
                    style={{ margin: "0 6px", color: "var(--fg-subtle)" }}
                  />
                  <span className="am-inhibit-tgt">{r.targetMatch}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 4 }}>
                  {r.description}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--fg-subtle)", marginTop: 2 }}>
                  equal: [{r.equal.join(", ")}]
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function RouteNode({
  route,
  depth,
  isRoot,
}: {
  route: AlertRoute;
  depth: number;
  isRoot?: boolean;
}) {
  const receiver = receiverById(route.receiver);
  const matchers = Object.entries(route.match);
  return (
    <div className="am-route" style={{ marginLeft: depth ? 20 : 0 }}>
      <div className="am-route-head">
        {isRoot ? (
          <span className="am-route-badge root">root</span>
        ) : (
          <span className="am-route-badge">
            {matchers.map(([k, v]) => `${k}=${v}`).join(" ") || "catch-all"}
          </span>
        )}
        {receiver && (
          <span className="am-receiver-chip">
            <i className={`fa-solid ${RECEIVER_ICON[receiver.kind]}`} /> {receiver.name}
          </span>
        )}
        {route.cont && <span className="am-route-cont">continue</span>}
      </div>
      <div className="am-route-meta mono">
        group_by=[{route.groupBy.join(", ")}] · wait={route.groupWait} · interval=
        {route.groupInterval} · repeat={route.repeatInterval}
      </div>
      {route.children?.map((c) => (
        <RouteNode key={c.id} route={c} depth={depth + 1} />
      ))}
    </div>
  );
}

// ── Silences & maintenance ───────────────────────────────────────────────────

function SilencesView() {
  const silencePill: Record<string, PillKind> = {
    active: "success",
    pending: "warning",
    expired: "neutral",
  };
  const mwPill: Record<string, PillKind> = {
    active: "success",
    scheduled: "info",
    ended: "neutral",
  };
  return (
    <div className="sn-form-layout">
      <div className="sn-form-main">
        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-bell-slash" />
            <span className="sn-section-title">Silences</span>
            <span className="sn-section-badge">{ALERT_SILENCES.length}</span>
          </div>
          <div className="sn-section-content am-silences">
            {ALERT_SILENCES.map((s) => (
              <div key={s.id} className="am-silence">
                <div className="am-silence-top">
                  <Pill kind={silencePill[s.status]}>{s.status}</Pill>
                  <span className="mono text-mute" style={{ fontSize: 11 }}>
                    {s.id}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--fg-subtle)" }}>
                    {s.affected} muted · {s.startsAt} → {s.endsAt}
                  </span>
                </div>
                <div className="am-silence-matchers">
                  {s.matchers.map((m) => (
                    <span key={m} className="am-matcher mono">
                      {m}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 12 }}>{s.comment}</div>
                <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
                  by <UserById id={s.createdBy} showName />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <aside className="sn-form-side">
        <div className="sn-side-card">
          <div className="sn-side-head">
            Maintenance windows <span className="sn-side-count">{MAINTENANCE_WINDOWS.length}</span>
          </div>
          <div className="sn-side-body">
            {MAINTENANCE_WINDOWS.map((w) => (
              <div
                key={w.id}
                className="sn-related-row"
                style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
                  <Pill kind={mwPill[w.status]}>{w.status}</Pill>
                  <span style={{ fontSize: 12, fontWeight: 550 }}>{w.name}</span>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
                  {w.scope}
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
                  {w.startsAt} → {w.endsAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

// ── Receivers ────────────────────────────────────────────────────────────────

function ReceiversView() {
  return (
    <div className="sn-form-section">
      <div className="sn-section-header">
        <i className="fa-solid fa-inbox" />
        <span className="sn-section-title">Receivers</span>
        <span className="sn-section-badge">secrets stored as Vault references only</span>
      </div>
      <div className="sn-section-content">
        <table className="sn-list-table">
          <thead>
            <tr>
              <th style={{ width: 44 }} />
              <th>Receiver</th>
              <th style={{ width: 120 }}>Kind</th>
              <th>Target</th>
              <th>Secret</th>
              <th style={{ width: 90 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {ALERT_RECEIVERS.map((r) => (
              <tr key={r.id}>
                <td>
                  <i
                    className={`fa-solid ${RECEIVER_ICON[r.kind]}`}
                    style={{ color: "var(--accent)" }}
                  />
                </td>
                <td style={{ fontWeight: 550 }}>{r.name}</td>
                <td className="mono">{r.kind}</td>
                <td className="mono text-mute">{r.target}</td>
                <td>
                  {r.vaultRef ? (
                    <span className="am-matcher mono">
                      <i className="fa-solid fa-lock" style={{ marginRight: 4 }} />
                      {r.vaultRef}
                    </span>
                  ) : (
                    <span className="text-mute" style={{ fontSize: 11, fontStyle: "italic" }}>
                      none
                    </span>
                  )}
                </td>
                <td>
                  <Pill kind={r.enabled ? "success" : "neutral"}>
                    {r.enabled ? "enabled" : "disabled"}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────

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
  .am-tabs{display:flex;gap:4px;border-bottom:1px solid var(--border,#e2e8f0);margin:16px 0}
  .am-tab{border:0;background:transparent;padding:10px 14px;font:inherit;font-size:13px;color:var(--fg-subtle);cursor:pointer;border-bottom:2px solid transparent;display:flex;align-items:center;gap:6px}
  .am-tab:hover{color:var(--fg)}
  .am-tab.active{color:var(--accent);border-bottom-color:var(--accent);font-weight:600}
  .am-receiver-chip{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:999px;background:var(--bg-muted,#f8fafc);border:1px solid var(--border,#e2e8f0);font-size:10.5px;white-space:nowrap}
  .am-heatmap-card{margin-bottom:16px}
  .am-heatmap{overflow-x:auto}
  .am-heatmap-row{display:grid;grid-template-columns:100px repeat(12,1fr);gap:3px;margin-bottom:3px;align-items:center}
  .am-heatmap-head .am-heatmap-time{font-size:10px;color:var(--fg-subtle);text-align:center}
  .am-heatmap-label{font-size:11px;color:var(--fg-subtle)}
  .am-heatmap-cell{aspect-ratio:1.6;min-height:22px;border-radius:3px;display:grid;place-items:center;font-size:10.5px;font-weight:600;color:#fff}
  .am-heatmap-legend{display:flex;align-items:center;gap:4px;margin-top:10px;font-size:11px;color:var(--fg-subtle)}
  .am-heatmap-swatch{width:16px;height:12px;border-radius:2px}
  .am-groups{display:flex;flex-direction:column;gap:12px}
  .am-group{border:1px solid var(--border,#e2e8f0);border-radius:8px;overflow:hidden}
  .am-group-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-muted,#f8fafc);border-bottom:1px solid var(--border,#e2e8f0);flex-wrap:wrap}
  .am-group-count{background:var(--accent);color:#fff;font-size:11px;font-weight:700;border-radius:999px;padding:1px 8px}
  .am-group-members{display:flex;flex-direction:column}
  .am-group-member{display:flex;align-items:center;gap:10px;padding:8px 12px;border-top:1px solid var(--border,#e2e8f0);font-size:12px}
  .am-group-member:first-child{border-top:0}
  .am-route{border-left:2px solid var(--border,#e2e8f0);padding:8px 0 8px 12px;margin-top:6px}
  .am-route-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .am-route-badge{font-family:var(--mono,monospace);font-size:11px;padding:2px 8px;border-radius:6px;background:var(--bg-muted,#f8fafc);border:1px solid var(--border,#e2e8f0)}
  .am-route-badge.root{background:var(--accent);color:#fff;border-color:var(--accent)}
  .am-route-cont{font-size:10px;color:var(--warning,#d97706);border:1px solid currentColor;border-radius:4px;padding:1px 5px}
  .am-route-meta{font-size:10.5px;color:var(--fg-subtle);margin-top:4px}
  .am-inhibit{padding:8px 0;border-top:1px solid var(--border,#e2e8f0)}
  .am-inhibit:first-child{border-top:0}
  .am-inhibit-src{color:var(--danger,#dc2626)}
  .am-inhibit-tgt{color:var(--fg-subtle)}
  .am-silences{display:flex;flex-direction:column;gap:12px}
  .am-silence{border:1px solid var(--border,#e2e8f0);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px}
  .am-silence-top{display:flex;align-items:center;gap:8px}
  .am-silence-matchers,.am-group-labels{display:flex;flex-wrap:wrap;gap:6px}
  .am-matcher{font-size:10.5px;padding:2px 8px;border-radius:6px;background:var(--bg-muted,#f8fafc);border:1px solid var(--border,#e2e8f0)}
`;
