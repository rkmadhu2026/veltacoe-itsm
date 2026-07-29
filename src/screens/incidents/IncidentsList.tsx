import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pill, SLAIndicator, Sev, UserById } from "@/components";
import { INCIDENTS, TENANTS } from "@/data";
import type { IncidentStatus, Severity } from "@/types";

const STATUS_OPTIONS: ("all" | IncidentStatus)[] = [
  "all",
  "active",
  "mitigating",
  "investigating",
  "open",
  "resolved",
];
const SEV_OPTIONS: ("all" | Severity)[] = ["all", 1, 2, 3, 4];

export function IncidentsListScreen() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<"all" | IncidentStatus>("all");
  const [sevFilter, setSevFilter] = useState<"all" | Severity>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return INCIDENTS.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (sevFilter !== "all" && i.sev !== sevFilter) return false;
      if (q && !`${i.id} ${i.title} ${i.service}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [statusFilter, sevFilter, q]);

  const counts = useMemo(() => {
    return {
      total: INCIDENTS.length,
      sev1: INCIDENTS.filter((i) => i.sev === 1 && i.status === "active").length,
      breaching: INCIDENTS.filter((i) => i.sla < 0.4 && i.status !== "resolved").length,
      atRisk: INCIDENTS.filter((i) => i.sla >= 0.4 && i.sla < 0.7 && i.status !== "resolved")
        .length,
      unassigned: INCIDENTS.filter((i) => !i.assignee && i.status !== "resolved").length,
    };
  }, []);

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>Incidents</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">INC-LIST</span>
          {counts.sev1 > 0 && <Pill kind="critical">{counts.sev1} active Sev 1</Pill>}
          {counts.breaching > 0 && <Pill kind="warning">{counts.breaching} SLA breaching</Pill>}
          <Pill kind="neutral" noDot>
            {counts.total} total
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Incidents</h1>
          <div className="sn-form-sub">
            All ITSM incidents across {TENANTS.length} business units · auto-refresh every 30s
          </div>
        </div>
        <div className="sn-form-actions">
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-file-export" /> Export
          </button>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-filter" /> Saved views
          </button>
          <button
            type="button"
            className="sn-btn primary"
            onClick={() => navigate("/incidents/new")}
          >
            <i className="fa-solid fa-plus" /> New incident
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <div className="sn-kpi tone-neutral">
          <div className="sn-kpi-l">Total</div>
          <div className="sn-kpi-v">{counts.total}</div>
          <div className="sn-kpi-s">all severities</div>
        </div>
        <div className="sn-kpi tone-crit">
          <div className="sn-kpi-l">Active Sev 1</div>
          <div className="sn-kpi-v">{counts.sev1}</div>
          <div className="sn-kpi-s">needs IC</div>
        </div>
        <div className="sn-kpi tone-crit">
          <div className="sn-kpi-l">SLA breaching</div>
          <div className="sn-kpi-v">{counts.breaching}</div>
          <div className="sn-kpi-s">{"<"} 40% budget</div>
        </div>
        <div className="sn-kpi tone-warn">
          <div className="sn-kpi-l">SLA at risk</div>
          <div className="sn-kpi-v">{counts.atRisk}</div>
          <div className="sn-kpi-s">40–70% budget</div>
        </div>
        <div className="sn-kpi tone-warn">
          <div className="sn-kpi-l">Unassigned</div>
          <div className="sn-kpi-v">{counts.unassigned}</div>
          <div className="sn-kpi-s">no assignee</div>
        </div>
        <div className="sn-kpi tone-ok">
          <div className="sn-kpi-l">In view</div>
          <div className="sn-kpi-v">{filtered.length}</div>
          <div className="sn-kpi-s">after filters</div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="inc-toolbar">
        <div className="inc-toolbar-search">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            placeholder="Search id, title, or service…"
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
          <label>Status</label>
          <div className="inc-segmented">
            {STATUS_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                className={`inc-seg${statusFilter === s ? " active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>
        <div className="inc-toolbar-group">
          <label>Severity</label>
          <div className="inc-segmented">
            {SEV_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                className={`inc-seg${sevFilter === s ? " active" : ""}`}
                onClick={() => setSevFilter(s)}
              >
                {s === "all" ? "All" : `SEV ${s}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="sn-form-section">
        <div className="sn-section-content">
          <table className="sn-list-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>Sev</th>
                <th style={{ width: 110 }}>Number</th>
                <th>Short description</th>
                <th style={{ width: 140 }}>Service</th>
                <th style={{ width: 170 }}>Tenant</th>
                <th style={{ width: 120 }}>Assignee</th>
                <th style={{ width: 110 }}>State</th>
                <th style={{ width: 80 }}>Age</th>
                <th style={{ width: 130 }}>SLA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <Sev n={inc.sev} />
                  </td>
                  <td>
                    <Link
                      to={`/incidents/${inc.id}`}
                      className="sn-link mono"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {inc.id}
                    </Link>
                  </td>
                  <td>{inc.title}</td>
                  <td className="mono">{inc.service}</td>
                  <td>{TENANTS.find((t) => t.id === inc.tenant)?.name ?? "—"}</td>
                  <td>
                    {inc.assignee ? (
                      <UserById id={inc.assignee} showName />
                    ) : (
                      <span className="text-mute" style={{ fontStyle: "italic" }}>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`sn-state-pill state-${inc.status}`}>
                      <i
                        className={`fa-solid ${
                          inc.status === "active"
                            ? "fa-fire"
                            : inc.status === "mitigating"
                              ? "fa-wrench"
                              : inc.status === "investigating"
                                ? "fa-magnifying-glass"
                                : "fa-check"
                        }`}
                      />{" "}
                      {inc.status}
                    </span>
                  </td>
                  <td className="mono text-mute">{inc.age}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <SLAIndicator pct={inc.sla} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{ padding: 32, textAlign: "center", color: "var(--fg-subtle)" }}
                  >
                    No incidents match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .inc-toolbar{display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg,#fff);border:1px solid var(--border,#e2e8f0);border-radius:8px;margin-bottom:16px;flex-wrap:wrap}
        .inc-toolbar-search{display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--border,#e2e8f0);border-radius:6px;background:var(--bg-muted,#f8fafc);min-width:260px;flex:1}
        .inc-toolbar-search input{flex:1;border:0;background:transparent;font:inherit;font-size:13px;outline:none}
        .inc-toolbar-search i{color:var(--fg-subtle);font-size:12px}
        .inc-toolbar-clear{border:0;background:transparent;cursor:pointer;color:var(--fg-subtle);padding:0}
        .inc-toolbar-group{display:flex;align-items:center;gap:8px}
        .inc-toolbar-group>label{font-size:11px;font-weight:600;color:var(--fg-subtle);text-transform:uppercase;letter-spacing:.04em}
        .inc-segmented{display:flex;border:1px solid var(--border,#e2e8f0);border-radius:6px;overflow:hidden}
        .inc-seg{border:0;background:transparent;padding:6px 10px;font:inherit;font-size:12px;color:var(--fg);cursor:pointer;border-right:1px solid var(--border,#e2e8f0);text-transform:capitalize}
        .inc-seg:last-child{border-right:0}
        .inc-seg.active{background:var(--accent);color:#fff;font-weight:600}
        .inc-seg:hover:not(.active){background:var(--bg-muted,#f8fafc)}
      `}</style>
    </div>
  );
}
