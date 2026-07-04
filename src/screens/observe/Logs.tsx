import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill } from "@/components";
import { LOG_ENTRIES, LOG_HISTOGRAM } from "@/data";
import type { LogEntry, LogLevel } from "@/types";
import type { PillKind } from "@/components";

const LEVEL_PILL: Record<LogLevel, PillKind> = {
  error: "critical",
  warn: "warning",
  info: "info",
  debug: "neutral",
};

const LEVEL_COLOR: Record<LogLevel, string> = {
  error: "#dc2626",
  warn: "#f59e0b",
  info: "#2563eb",
  debug: "#64748b",
};

export function LogsScreen() {
  const [levelFilter, setLevelFilter] = useState<"all" | LogLevel>("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return LOG_ENTRIES.filter((l) => {
      if (levelFilter !== "all" && l.level !== levelFilter) return false;
      if (q && !`${l.service} ${l.host} ${l.message}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [levelFilter, q]);

  const counts = useMemo(() => {
    const c: Record<LogLevel, number> = { error: 0, warn: 0, info: 0, debug: 0 };
    for (const l of LOG_ENTRIES) c[l.level]++;
    return c;
  }, []);

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Observe</a>
        <span className="sn-bc-sep">›</span>
        <span>Logs</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">LOG-EXPL</span>
          {counts.error > 0 && <Pill kind="critical">{counts.error} errors in view</Pill>}
          <Pill kind="neutral" noDot>
            Loki · 2.8B lines / 24h
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Log explorer</h1>
          <div className="sn-form-sub">
            Structured logs enriched with tenant / service / host labels ·{" "}
            <span className="mono">trace_id</span> links jump to the APM waterfall
          </div>
        </div>
        <div className="sn-form-actions">
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-clock-rotate-left" /> Last 3h
          </button>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-floppy-disk" /> Save query
          </button>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-play" /> Live tail
          </button>
        </div>
      </div>

      {/* Volume histogram */}
      <div className="sn-form-section" style={{ marginBottom: 16 }}>
        <div className="sn-section-header">
          <i className="fa-solid fa-chart-column" />
          <span className="sn-section-title">Volume · last 3h</span>
          <span className="sn-section-badge">5-minute buckets · error burst highlighted</span>
        </div>
        <div className="sn-section-content">
          <div className="logs-hist">
            {LOG_HISTOGRAM.map((v, i) => {
              const burst = i >= 28 && i <= 31;
              const max = Math.max(...LOG_HISTOGRAM);
              return (
                <div
                  key={i}
                  className="logs-hist-bar"
                  style={{
                    height: `${(v / max) * 100}%`,
                    background: burst ? "#dc2626" : "var(--accent)",
                    opacity: burst ? 0.9 : 0.35 + (v / max) * 0.5,
                  }}
                  title={`${v} lines/s`}
                />
              );
            })}
          </div>
          <div className="logs-hist-axis mono">
            <span>-3h</span>
            <span>-2h</span>
            <span>-1h</span>
            <span>now</span>
          </div>
        </div>
      </div>

      {/* Query bar */}
      <div className="inc-toolbar">
        <div className="inc-toolbar-search" style={{ minWidth: 320 }}>
          <i className="fa-solid fa-magnifying-glass" />
          <input
            placeholder='Search message, service, or host… e.g. "deadlock"'
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
          <label>Level</label>
          <div className="inc-segmented">
            {(["all", "error", "warn", "info", "debug"] as const).map((l) => (
              <button
                type="button"
                key={l}
                className={`inc-seg${levelFilter === l ? " active" : ""}`}
                onClick={() => setLevelFilter(l)}
              >
                {l === "all" ? "All" : `${l} (${counts[l as LogLevel]})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log lines */}
      <div className="sn-form-section">
        <div className="sn-section-content" style={{ padding: 0 }}>
          <div className="logs-list">
            {filtered.map((l) => (
              <LogRow
                key={l.id}
                l={l}
                expanded={expanded === l.id}
                onToggle={() => setExpanded(expanded === l.id ? null : l.id)}
              />
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "var(--fg-subtle)",
                  fontSize: 13,
                }}
              >
                No log lines match the current query.
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

function LogRow({
  l,
  expanded,
  onToggle,
}: {
  l: LogEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`logs-row${expanded ? " open" : ""}`}>
      <button type="button" className="logs-row-main" onClick={onToggle}>
        <span className="logs-level" style={{ background: LEVEL_COLOR[l.level] }} />
        <span className="logs-ts mono">{l.ts}</span>
        <Pill kind={LEVEL_PILL[l.level]} noDot>
          {l.level}
        </Pill>
        <span className="logs-svc mono">{l.service}</span>
        <span className="logs-msg">{l.message}</span>
        <i className={`fa-solid fa-chevron-${expanded ? "up" : "down"} logs-chev`} />
      </button>
      {expanded && (
        <div className="logs-detail">
          <DetailRow k="service" v={l.service} />
          <DetailRow k="host" v={l.host} />
          <DetailRow k="tenant" v={l.tenant} />
          <DetailRow k="level" v={l.level} />
          {l.traceId && (
            <div className="logs-detail-row">
              <span className="logs-detail-k mono">trace_id</span>
              <Link to="/apm" className="sn-link mono" style={{ fontSize: 12 }}>
                {l.traceId}{" "}
                <i className="fa-solid fa-up-right-from-square" style={{ fontSize: 10 }} />
              </Link>
            </div>
          )}
          <div className="logs-detail-actions">
            <button type="button" className="sn-btn">
              <i className="fa-solid fa-filter" /> Filter service
            </button>
            <button type="button" className="sn-btn">
              <i className="fa-solid fa-server" /> Open host
            </button>
            <button type="button" className="sn-btn">
              <i className="fa-solid fa-bell" /> Alert on pattern
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="logs-detail-row">
      <span className="logs-detail-k mono">{k}</span>
      <span className="mono" style={{ fontSize: 12 }}>
        {v}
      </span>
    </div>
  );
}

const STYLES = `
  .logs-hist{display:flex;align-items:flex-end;gap:3px;height:110px}
  .logs-hist-bar{flex:1;border-radius:2px 2px 0 0;min-height:3px}
  .logs-hist-axis{display:flex;justify-content:space-between;font-size:10px;color:var(--fg-subtle);margin-top:6px}
  .logs-list{display:flex;flex-direction:column}
  .logs-row{border-top:1px solid var(--border,#f1f5f9)}
  .logs-row:first-child{border-top:0}
  .logs-row-main{display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;border:0;background:transparent;cursor:pointer;font:inherit;color:var(--fg);text-align:left}
  .logs-row-main:hover{background:var(--bg-muted,#f8fafc)}
  .logs-row.open .logs-row-main{background:var(--bg-muted,#f8fafc)}
  .logs-level{width:3px;align-self:stretch;border-radius:2px;flex-shrink:0}
  .logs-ts{font-size:11px;color:var(--fg-subtle);flex-shrink:0}
  .logs-svc{font-size:11px;color:var(--fg-subtle);width:130px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .logs-msg{font-size:12px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--mono,monospace)}
  .logs-chev{font-size:10px;color:var(--fg-subtle)}
  .logs-detail{padding:10px 16px 14px 26px;background:var(--bg-muted,#f8fafc);display:flex;flex-direction:column;gap:5px}
  .logs-detail-row{display:grid;grid-template-columns:90px 1fr;gap:10px;align-items:center}
  .logs-detail-k{font-size:11px;color:var(--fg-subtle)}
  .logs-detail-actions{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
  @media(max-width:820px){.logs-svc{display:none}}
`;
