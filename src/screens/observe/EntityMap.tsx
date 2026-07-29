import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill } from "@/components";
import { INCIDENTS, SERVICES, SERVICE_DEPS } from "@/data";
import type { ServiceEntry, ServiceStatus } from "@/types";
import type { PillKind } from "@/components";

const STATUS_COLOR: Record<ServiceStatus, string> = {
  healthy: "#10b981",
  degraded: "#f59e0b",
  down: "#dc2626",
};

const STATUS_PILL: Record<ServiceStatus, PillKind> = {
  healthy: "success",
  degraded: "warning",
  down: "critical",
};

const ROOT = "edge";
const VIEW_W = 960;
const VIEW_H = 440;

interface Node {
  name: string;
  service: ServiceEntry | undefined;
  x: number;
  y: number;
}

export function EntityMapScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  const { nodes, nodeByName } = useMemo(() => buildLayout(), []);

  // Downstream = services the selected one calls (transitively).
  // Upstream = services that call it (transitively).
  const { downstream, upstream } = useMemo(() => {
    if (!selected) return { downstream: new Set<string>(), upstream: new Set<string>() };
    return {
      downstream: reach(selected, (n) => SERVICE_DEPS.filter(([a]) => a === n).map(([, b]) => b)),
      upstream: reach(selected, (n) => SERVICE_DEPS.filter(([, b]) => b === n).map(([a]) => a)),
    };
  }, [selected]);

  const inScope = (name: string) =>
    !selected || name === selected || downstream.has(name) || upstream.has(name);

  const selService = selected ? SERVICES.find((s) => s.name === selected) : null;
  const selIncidents = selected
    ? INCIDENTS.filter((i) => i.service === selected && i.status !== "resolved")
    : [];

  const stats = useMemo(() => {
    const degraded = SERVICES.filter((s) => s.status === "degraded").length;
    const down = SERVICES.filter((s) => s.status === "down").length;
    return { degraded, down };
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
        <span>Entity map</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">ENT-MAP</span>
          {stats.down > 0 && <Pill kind="critical">{stats.down} down</Pill>}
          {stats.degraded > 0 && <Pill kind="warning">{stats.degraded} degraded</Pill>}
          <Pill kind="neutral" noDot>
            {SERVICE_DEPS.length} call edges
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Service entity map</h1>
          <div className="sn-form-sub">
            Call-graph derived from trace spans · click a service to highlight its upstream callers
            and downstream dependencies
          </div>
        </div>
        <div className="sn-form-actions">
          <button
            type="button"
            className="sn-btn"
            onClick={() => setSelected(null)}
            disabled={!selected}
          >
            <i className="fa-solid fa-arrows-rotate" /> Clear selection
          </button>
          <Link to="/infra/topology" className="sn-btn">
            <i className="fa-solid fa-network-wired" /> Network topology
          </Link>
          <Link to="/apm" className="sn-btn primary">
            <i className="fa-solid fa-gauge-high" /> APM
          </Link>
        </div>
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          <div className="ent-canvas">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              width="100%"
              role="img"
              aria-label="Service dependency graph"
            >
              <defs>
                <marker
                  id="ent-arrow"
                  viewBox="0 0 8 8"
                  refX="7"
                  refY="4"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M0,0 L8,4 L0,8 z" fill="var(--fg-subtle, #94a3b8)" />
                </marker>
              </defs>
              {SERVICE_DEPS.map(([a, b], i) => {
                const na = nodeByName.get(a);
                const nb = nodeByName.get(b);
                if (!na || !nb) return null;
                const active = !selected || (inScope(a) && inScope(b));
                return (
                  <line
                    key={i}
                    x1={na.x + 54}
                    y1={na.y}
                    x2={nb.x - 54}
                    y2={nb.y}
                    stroke={active ? "var(--accent)" : "var(--border,#e2e8f0)"}
                    strokeWidth={active ? 1.8 : 1}
                    opacity={active ? 0.75 : 0.25}
                    markerEnd="url(#ent-arrow)"
                  />
                );
              })}
              {nodes.map((n) => {
                const isSel = selected === n.name;
                const dim = !inScope(n.name);
                const status = n.service?.status ?? "healthy";
                return (
                  <g
                    key={n.name}
                    transform={`translate(${n.x},${n.y})`}
                    style={{ cursor: "pointer", opacity: dim ? 0.25 : 1 }}
                    onClick={() => setSelected(isSel ? null : n.name)}
                  >
                    <rect
                      x={-54}
                      y={-20}
                      width={108}
                      height={40}
                      rx={9}
                      fill="var(--bg,#fff)"
                      stroke={isSel ? "var(--accent)" : STATUS_COLOR[status]}
                      strokeWidth={isSel ? 3 : 2}
                    />
                    <circle cx={-40} cy={0} r={5} fill={STATUS_COLOR[status]} />
                    <text x={4} y={4} textAnchor="middle" className="ent-label" fontSize={11}>
                      {n.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          {selected && (
            <div className="ent-scope">
              <span>
                <b className="mono">{selected}</b> · {upstream.size} upstream caller
                {upstream.size === 1 ? "" : "s"} · {downstream.size} downstream dependenc
                {downstream.size === 1 ? "y" : "ies"}
              </span>
            </div>
          )}
        </div>

        <aside className="sn-form-side">
          {selService ? (
            <>
              <div className="sn-side-card">
                <div className="sn-side-head">Selected service</div>
                <div className="sn-side-body">
                  <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>
                    {selService.name}
                  </div>
                  <div style={{ margin: "6px 0 10px" }}>
                    <Pill kind={STATUS_PILL[selService.status]}>{selService.status}</Pill>
                  </div>
                  <EntRow k="Uptime" v={`${selService.uptime}%`} />
                  <EntRow k="p95 latency" v={selService.p95} />
                  <EntRow k="Error rate" v={`${selService.err}%`} />
                  <EntRow k="Dependencies" v={String(selService.deps)} />
                  <Link
                    to="/apm"
                    className="sn-btn primary"
                    style={{ marginTop: 10, width: "100%", justifyContent: "center" }}
                  >
                    <i className="fa-solid fa-gauge-high" /> Open in APM
                  </Link>
                </div>
              </div>
              <div className="sn-side-card">
                <div className="sn-side-head">
                  Open incidents <span className="sn-side-count">{selIncidents.length}</span>
                </div>
                <div className="sn-side-body">
                  {selIncidents.length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: 0 }}>
                      No open incidents on this service.
                    </p>
                  ) : (
                    selIncidents.map((i) => (
                      <Link
                        key={i.id}
                        to={`/incidents/${i.id}`}
                        className="sn-related-row"
                        style={{ textDecoration: "none" }}
                      >
                        <div>
                          <div className="sn-related-title mono" style={{ fontSize: 12 }}>
                            {i.id}
                          </div>
                          <div className="sn-related-meta">{i.title}</div>
                        </div>
                        <span className={`sev sev-${i.sev}`}>SEV {i.sev}</span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="sn-side-card">
              <div className="sn-side-head">All services</div>
              <div className="sn-side-body">
                {SERVICES.map((s) => (
                  <button
                    type="button"
                    key={s.name}
                    className="sn-related-row"
                    style={{ cursor: "pointer", textAlign: "left", width: "100%" }}
                    onClick={() => setSelected(s.name)}
                  >
                    <div>
                      <div className="sn-related-title mono" style={{ fontSize: 12 }}>
                        {s.name}
                      </div>
                      <div className="sn-related-meta">
                        p95 {s.p95} · err {s.err}%
                      </div>
                    </div>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: STATUS_COLOR[s.status],
                        flexShrink: 0,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

// BFS-layered left-to-right layout from ROOT over the directed call graph.
function buildLayout() {
  const names = new Set<string>(SERVICES.map((s) => s.name));
  for (const [a, b] of SERVICE_DEPS) {
    names.add(a);
    names.add(b);
  }

  const depth = new Map<string, number>();
  depth.set(ROOT, 0);
  const queue = [ROOT];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const [a, b] of SERVICE_DEPS) {
      if (a === cur && !depth.has(b)) {
        depth.set(b, depth.get(cur)! + 1);
        queue.push(b);
      }
    }
  }
  for (const n of names) if (!depth.has(n)) depth.set(n, 0);

  const byDepth = new Map<number, string[]>();
  for (const n of [...names].sort()) {
    const d = depth.get(n)!;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(n);
  }
  const maxDepth = Math.max(...byDepth.keys());
  const colGap = (VIEW_W - 160) / Math.max(1, maxDepth);

  const nodes: Node[] = [];
  const nodeByName = new Map<string, Node>();
  for (const [d, list] of [...byDepth.entries()].sort((x, y) => x[0] - y[0])) {
    const rowGap = VIEW_H / (list.length + 1);
    list.forEach((name, i) => {
      const node: Node = {
        name,
        service: SERVICES.find((s) => s.name === name),
        x: 80 + d * colGap,
        y: rowGap * (i + 1),
      };
      nodes.push(node);
      nodeByName.set(name, node);
    });
  }
  return { nodes, nodeByName };
}

// Transitive reachability via a successor function.
function reach(start: string, next: (n: string) => string[]): Set<string> {
  const seen = new Set<string>();
  const stack = next(start);
  while (stack.length) {
    const cur = stack.pop()!;
    if (!seen.has(cur)) {
      seen.add(cur);
      stack.push(...next(cur));
    }
  }
  return seen;
}

function EntRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="ent-side-row">
      <span>{k}</span>
      <span className="mono">{v}</span>
    </div>
  );
}

const STYLES = `
  .ent-canvas{border:1px solid var(--border,#e2e8f0);border-radius:10px;background:var(--bg,#fff);padding:8px;overflow:hidden}
  .ent-label{fill:var(--fg,#0f172a);font-family:var(--mono,monospace);font-weight:600}
  .ent-scope{margin-top:10px;padding:10px 14px;border:1px solid var(--border,#e2e8f0);border-radius:8px;font-size:12px;color:var(--fg-subtle);background:var(--bg-muted,#f8fafc)}
  .ent-side-row{display:flex;justify-content:space-between;gap:10px;font-size:12px;padding:4px 0;border-top:1px solid var(--border,#f1f5f9)}
  .ent-side-row>span:first-child{color:var(--fg-subtle)}
`;
