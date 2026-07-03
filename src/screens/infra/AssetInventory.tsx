import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pill } from "@/components";
import { DEVICES, DEVICE_KINDS, SITES, assetLifecycle, deviceKindById } from "@/data";
import type { AssetLifecycle, Device, DeviceStatus } from "@/types";
import type { PillKind } from "@/components";

const STATUS_DOT: Record<DeviceStatus, string> = {
  ok: "#10b981",
  warn: "#f59e0b",
  critical: "#dc2626",
  down: "#64748b",
};

const LIFECYCLE_PILL: Record<AssetLifecycle, PillKind> = {
  active: "success",
  pending_review: "warning",
  discovered: "info",
  decommissioned: "neutral",
};

const LIFECYCLE_LABEL: Record<AssetLifecycle, string> = {
  active: "Active",
  pending_review: "Pending review",
  discovered: "Discovered",
  decommissioned: "Decommissioned",
};

export function AssetInventoryScreen() {
  const navigate = useNavigate();
  const [kindFilter, setKindFilter] = useState<"all" | string>("all");
  const [siteFilter, setSiteFilter] = useState<"all" | string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | DeviceStatus>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return DEVICES.filter((d) => {
      if (kindFilter !== "all" && d.kind !== kindFilter) return false;
      if (siteFilter !== "all" && d.site !== siteFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (
        q &&
        !`${d.id} ${d.model} ${d.ip} ${d.role} ${d.os}`.toLowerCase().includes(q.toLowerCase())
      )
        return false;
      return true;
    });
  }, [kindFilter, siteFilter, statusFilter, q]);

  const counts = useMemo(() => {
    let ok = 0,
      warn = 0,
      crit = 0,
      down = 0,
      review = 0;
    for (const d of DEVICES) {
      if (d.status === "ok") ok++;
      else if (d.status === "warn") warn++;
      else if (d.status === "critical") crit++;
      else if (d.status === "down") down++;
      if (assetLifecycle(d.id) === "pending_review") review++;
    }
    return { total: DEVICES.length, ok, warn, crit, down, review };
  }, []);

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <Link to="/infra" className="sn-link">
          Infrastructure
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>Asset inventory</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">CMDB-CI</span>
          {counts.crit > 0 && <Pill kind="critical">{counts.crit} critical</Pill>}
          {counts.review > 0 && <Pill kind="warning">{counts.review} pending review</Pill>}
          <Pill kind="neutral" noDot>
            {counts.total} assets
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Asset inventory</h1>
          <div className="sn-form-sub">
            Configuration items across {SITES.length} sites · lifecycle: discovered → pending review
            → active → decommissioned
          </div>
        </div>
        <div className="sn-form-actions">
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-file-csv" /> Bulk import
          </button>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-file-export" /> Export
          </button>
          <button type="button" className="sn-btn primary" onClick={() => navigate("/onboarding")}>
            <i className="fa-solid fa-plus" /> Onboard device
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <div className="sn-kpi tone-neutral">
          <div className="sn-kpi-l">Total assets</div>
          <div className="sn-kpi-v">{counts.total}</div>
          <div className="sn-kpi-s">all categories</div>
        </div>
        <div className="sn-kpi tone-ok">
          <div className="sn-kpi-l">Healthy</div>
          <div className="sn-kpi-v">{counts.ok}</div>
          <div className="sn-kpi-s">status ok</div>
        </div>
        <div className="sn-kpi tone-warn">
          <div className="sn-kpi-l">Warning</div>
          <div className="sn-kpi-v">{counts.warn}</div>
          <div className="sn-kpi-s">degraded</div>
        </div>
        <div className="sn-kpi tone-crit">
          <div className="sn-kpi-l">Critical</div>
          <div className="sn-kpi-v">{counts.crit}</div>
          <div className="sn-kpi-s">needs action</div>
        </div>
        <div className="sn-kpi tone-crit">
          <div className="sn-kpi-l">Down</div>
          <div className="sn-kpi-v">{counts.down}</div>
          <div className="sn-kpi-s">unreachable</div>
        </div>
        <div className="sn-kpi tone-warn">
          <div className="sn-kpi-l">In review</div>
          <div className="sn-kpi-v">{counts.review}</div>
          <div className="sn-kpi-s">awaiting approval</div>
        </div>
      </div>

      {/* Category chips */}
      <div className="asset-chips">
        <button
          type="button"
          className={`asset-chip${kindFilter === "all" ? " active" : ""}`}
          onClick={() => setKindFilter("all")}
        >
          <i className="fa-solid fa-layer-group" /> All{" "}
          <span className="asset-chip-n">{DEVICES.length}</span>
        </button>
        {DEVICE_KINDS.map((k) => {
          const n = DEVICES.filter((d) => d.kind === k.id).length;
          if (n === 0) return null;
          return (
            <button
              type="button"
              key={k.id}
              className={`asset-chip${kindFilter === k.id ? " active" : ""}`}
              onClick={() => setKindFilter(k.id)}
            >
              <i
                className={`fa-${k.iconBrand ? "brands" : "solid"} ${k.icon}`}
                style={{ color: k.color }}
              />
              {k.label} <span className="asset-chip-n">{n}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="inc-toolbar">
        <div className="inc-toolbar-search">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            placeholder="Search id, model, IP, role…"
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
          <label>Site</label>
          <select
            className="asset-select"
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
          >
            <option value="all">All sites</option>
            {SITES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="inc-toolbar-group">
          <label>Status</label>
          <div className="inc-segmented">
            {(["all", "ok", "warn", "critical", "down"] as const).map((s) => (
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
      </div>

      {/* Table */}
      <div className="sn-form-section">
        <div className="sn-section-content">
          <table className="sn-list-table">
            <thead>
              <tr>
                <th style={{ width: 30 }} />
                <th style={{ width: 170 }}>Asset</th>
                <th>Model</th>
                <th style={{ width: 130 }}>Site</th>
                <th style={{ width: 120 }}>IP</th>
                <th style={{ width: 90 }}>CPU</th>
                <th style={{ width: 90 }}>Mem</th>
                <th style={{ width: 140 }}>Lifecycle</th>
                <th style={{ width: 130 }}>Collector</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <AssetRow key={d.id} d={d} onOpen={() => navigate(`/infra/device/${d.id}`)} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{ padding: 32, textAlign: "center", color: "var(--fg-subtle)" }}
                  >
                    No assets match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

function AssetRow({ d, onOpen }: { d: Device; onOpen: () => void }) {
  const kind = deviceKindById(d.kind);
  const lc = assetLifecycle(d.id);
  return (
    <tr onClick={onOpen} style={{ cursor: "pointer" }}>
      <td>
        <span className="asset-dot" style={{ background: STATUS_DOT[d.status] }} title={d.status} />
      </td>
      <td>
        <Link
          to={`/infra/device/${d.id}`}
          className="sn-link mono"
          onClick={(e) => e.stopPropagation()}
        >
          {d.id}
        </Link>
        <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{d.role}</div>
      </td>
      <td>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {kind && (
            <i
              className={`fa-${kind.iconBrand ? "brands" : "solid"} ${kind.icon}`}
              style={{ color: kind.color, fontSize: 12 }}
            />
          )}
          {d.model}
        </span>
        <div style={{ fontSize: 11, color: "var(--fg-subtle)" }} className="mono">
          {d.os}
        </div>
      </td>
      <td>{SITES.find((s) => s.id === d.site)?.name ?? d.site}</td>
      <td className="mono">{d.ip}</td>
      <td>
        <MiniBar pct={d.cpu} />
      </td>
      <td>
        <MiniBar pct={d.mem} />
      </td>
      <td>
        <Pill kind={LIFECYCLE_PILL[lc]}>{LIFECYCLE_LABEL[lc]}</Pill>
      </td>
      <td className="mono" style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
        {d.agent}
      </td>
    </tr>
  );
}

function MiniBar({ pct }: { pct: number }) {
  const color = pct >= 85 ? "#dc2626" : pct >= 70 ? "#f59e0b" : "#10b981";
  return (
    <div className="asset-bar" title={`${pct}%`}>
      <div className="asset-bar-fill" style={{ width: `${pct}%`, background: color }} />
      <span className="asset-bar-txt mono">{pct}%</span>
    </div>
  );
}

const STYLES = `
  .asset-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
  .asset-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid var(--border,#e2e8f0);border-radius:999px;background:var(--bg,#fff);cursor:pointer;font:inherit;font-size:12px;color:var(--fg)}
  .asset-chip:hover{border-color:var(--accent)}
  .asset-chip.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}
  .asset-chip-n{background:var(--bg-muted,#f1f5f9);border-radius:999px;padding:0 7px;font-size:11px;color:var(--fg-subtle)}
  .asset-select{border:1px solid var(--border,#e2e8f0);border-radius:6px;background:var(--bg,#fff);font:inherit;font-size:12px;padding:6px 8px;color:var(--fg)}
  .asset-dot{display:inline-block;width:9px;height:9px;border-radius:50%}
  .asset-bar{position:relative;height:16px;border-radius:4px;background:var(--bg-muted,#f1f5f9);overflow:hidden}
  .asset-bar-fill{position:absolute;inset:0 auto 0 0;border-radius:4px}
  .asset-bar-txt{position:absolute;right:5px;top:0;line-height:16px;font-size:10px;color:var(--fg)}
`;
