import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill } from "@/components";
import { DEVICES, DEVICE_KINDS, NET_LINKS, deviceById, deviceKindById } from "@/data";
import type { Device, DeviceStatus } from "@/types";

const STATUS_COLOR: Record<DeviceStatus, string> = {
  ok: "#10b981",
  warn: "#f59e0b",
  critical: "#dc2626",
  down: "#64748b",
};

const ROOT = "RTR-BLR-EDGE-01";
const VIEW_W = 980;
const VIEW_H = 520;

interface Node {
  id: string;
  device: Device;
  x: number;
  y: number;
  depth: number;
}

export function TopologyScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  const { nodes, nodeById, children } = useMemo(() => buildGraph(), []);

  // Blast radius: everything reachable downstream of the selected node.
  const blast = useMemo(() => {
    if (!selected) return new Set<string>();
    const seen = new Set<string>([selected]);
    const stack = [selected];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const c of children.get(cur) ?? []) {
        if (!seen.has(c)) {
          seen.add(c);
          stack.push(c);
        }
      }
    }
    return seen;
  }, [selected, children]);

  const selDevice = selected ? deviceById(selected) : null;
  const kindsInGraph = useMemo(() => {
    const set = new Set(nodes.map((n) => n.device.kind));
    return DEVICE_KINDS.filter((k) => set.has(k.id));
  }, [nodes]);

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">Home</Link>
        <span className="sn-bc-sep">›</span>
        <Link to="/infra" className="sn-link">Infrastructure</Link>
        <span className="sn-bc-sep">›</span>
        <span>Network topology</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">TOPO-BLR</span>
          <Pill kind="neutral" noDot>{nodes.length} nodes</Pill>
          <Pill kind="neutral" noDot>{NET_LINKS.length} links</Pill>
          {selected && <Pill kind="warning">{blast.size - 1} downstream in blast radius</Pill>}
        </div>
        <div className="sn-form-title-meta">
          <h1>Network topology &amp; blast radius</h1>
          <div className="sn-form-sub">
            Bangalore DC-1 core fabric · LLDP/CDP-derived · click a node to trace its downstream dependency chain
          </div>
        </div>
        <div className="sn-form-actions">
          <button type="button" className="sn-btn" onClick={() => setSelected(null)} disabled={!selected}>
            <i className="fa-solid fa-arrows-rotate" /> Clear selection
          </button>
          <button type="button" className="sn-btn"><i className="fa-solid fa-download" /> Export SVG</button>
        </div>
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          <div className="topo-canvas">
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" role="img" aria-label="Network topology graph">
              {/* Edges */}
              {NET_LINKS.map(([a, b], i) => {
                const na = nodeById.get(a);
                const nb = nodeById.get(b);
                if (!na || !nb) return null;
                const active = !selected || (blast.has(a) && blast.has(b));
                return (
                  <line
                    key={i}
                    x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                    stroke={active ? "var(--accent)" : "var(--border, #e2e8f0)"}
                    strokeWidth={active ? 2 : 1}
                    opacity={active ? 0.8 : 0.3}
                  />
                );
              })}
              {/* Nodes */}
              {nodes.map((n) => {
                const kind = deviceKindById(n.device.kind);
                const inBlast = !selected || blast.has(n.id);
                const isSel = selected === n.id;
                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x},${n.y})`}
                    style={{ cursor: "pointer", opacity: inBlast ? 1 : 0.28 }}
                    onClick={() => setSelected(isSel ? null : n.id)}
                  >
                    <circle r={isSel ? 20 : 16} fill="var(--bg,#fff)" stroke={STATUS_COLOR[n.device.status]} strokeWidth={isSel ? 4 : 3} />
                    <circle r={7} fill={kind?.color ?? "#64748b"} />
                    <text y={isSel ? 36 : 32} textAnchor="middle" className="topo-label" fontSize={10}>{n.id.replace("-BLR", "")}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="topo-legend">
            <div className="topo-legend-group">
              <span className="topo-legend-title">Status</span>
              {(["ok", "warn", "critical", "down"] as DeviceStatus[]).map((s) => (
                <span key={s} className="topo-legend-item"><span className="topo-ring" style={{ borderColor: STATUS_COLOR[s] }} /> {s}</span>
              ))}
            </div>
            <div className="topo-legend-group">
              <span className="topo-legend-title">Type</span>
              {kindsInGraph.map((k) => (
                <span key={k.id} className="topo-legend-item"><span className="topo-swatch" style={{ background: k.color }} /> {k.label}</span>
              ))}
            </div>
          </div>
        </div>

        <aside className="sn-form-side">
          {selDevice ? (
            <>
              <div className="sn-side-card">
                <div className="sn-side-head">Selected node</div>
                <div className="sn-side-body">
                  <div className="topo-sel-title mono">{selDevice.id}</div>
                  <div className="text-mute" style={{ fontSize: 12, marginBottom: 8 }}>{selDevice.model}</div>
                  <MetaRow k="Role" v={selDevice.role} />
                  <MetaRow k="IP" v={selDevice.ip} mono />
                  <MetaRow k="Status" v={selDevice.status} />
                  <MetaRow k="CPU / Mem" v={`${selDevice.cpu}% / ${selDevice.mem}%`} />
                  <Link to={`/infra/device/${selDevice.id}`} className="sn-btn primary" style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>
                    <i className="fa-solid fa-up-right-from-square" /> Open Node 360
                  </Link>
                </div>
              </div>
              <div className="sn-side-card">
                <div className="sn-side-head">Blast radius <span className="sn-side-count">{blast.size - 1}</span></div>
                <div className="sn-side-body">
                  {blast.size === 1 ? (
                    <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: 0 }}>Leaf node — no downstream dependents.</p>
                  ) : (
                    [...blast].filter((id) => id !== selected).map((id) => {
                      const dev = deviceById(id);
                      return (
                        <Link key={id} to={`/infra/device/${id}`} className="sn-related-row" style={{ textDecoration: "none" }}>
                          <div>
                            <div className="sn-related-title mono" style={{ fontSize: 12 }}>{id}</div>
                            <div className="sn-related-meta">{dev?.role}</div>
                          </div>
                          <span className="topo-ring" style={{ borderColor: STATUS_COLOR[dev?.status ?? "down"] }} />
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="sn-side-card">
              <div className="sn-side-head">Blast-radius analysis</div>
              <div className="sn-side-body">
                <p style={{ fontSize: 12.5, color: "var(--fg-subtle)", margin: "0 0 10px" }}>
                  Select any node to trace every downstream device that depends on it. Use this before a change window
                  to understand impact, or during an incident to scope what a failure takes out.
                </p>
                <div className="topo-hint"><i className="fa-solid fa-hand-pointer" /> Click a node in the graph</div>
              </div>
            </div>
          )}
        </aside>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

function MetaRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="topo-meta-row">
      <span>{k}</span>
      <span className={mono ? "mono" : ""}>{v}</span>
    </div>
  );
}

// Layered left-to-right layout: BFS depth from ROOT over the undirected graph
// sets the column; nodes are spread vertically within each column.
function buildGraph() {
  const undirected = new Map<string, Set<string>>();
  const children = new Map<string, string[]>();
  const ids = new Set<string>();
  for (const [a, b] of NET_LINKS) {
    ids.add(a); ids.add(b);
    if (!undirected.has(a)) undirected.set(a, new Set());
    if (!undirected.has(b)) undirected.set(b, new Set());
    undirected.get(a)!.add(b);
    undirected.get(b)!.add(a);
    if (!children.has(a)) children.set(a, []);
    children.get(a)!.push(b);
  }

  // BFS depth from ROOT.
  const depth = new Map<string, number>();
  depth.set(ROOT, 0);
  const queue = [ROOT];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const nb of undirected.get(cur) ?? []) {
      if (!depth.has(nb)) {
        depth.set(nb, (depth.get(cur) ?? 0) + 1);
        queue.push(nb);
      }
    }
  }
  // Any disconnected node → depth 0 fallback.
  for (const id of ids) if (!depth.has(id)) depth.set(id, 0);

  const byDepth = new Map<number, string[]>();
  for (const id of [...ids].sort()) {
    const dd = depth.get(id)!;
    if (!byDepth.has(dd)) byDepth.set(dd, []);
    byDepth.get(dd)!.push(id);
  }
  const maxDepth = Math.max(...[...byDepth.keys()]);
  const colGap = (VIEW_W - 120) / Math.max(1, maxDepth);

  const nodes: Node[] = [];
  const nodeById = new Map<string, Node>();
  for (const [dd, list] of [...byDepth.entries()].sort((a, b) => a[0] - b[0])) {
    const rowGap = VIEW_H / (list.length + 1);
    list.forEach((id, i) => {
      const device = deviceById(id) ?? fallbackDevice(id);
      const node: Node = { id, device, x: 60 + dd * colGap, y: rowGap * (i + 1), depth: dd };
      nodes.push(node);
      nodeById.set(id, node);
    });
  }
  return { nodes, nodeById, children };
}

function fallbackDevice(id: string): Device {
  return DEVICES[0] ?? ({ id, kind: "switch", model: id, site: "", ip: "", os: "", uptime: "", cpu: 0, mem: 0, status: "down", role: "", iface: "", throughput: "", sessions: "", lastSeen: "", agent: "" } as Device);
}

const STYLES = `
  .topo-canvas{border:1px solid var(--border,#e2e8f0);border-radius:10px;background:var(--bg,#fff);padding:8px;overflow:hidden}
  .topo-label{fill:var(--fg,#0f172a);font-family:var(--mono,monospace)}
  .topo-legend{display:flex;gap:24px;flex-wrap:wrap;margin-top:12px;padding:12px;border:1px solid var(--border,#e2e8f0);border-radius:8px}
  .topo-legend-group{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .topo-legend-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--fg-subtle)}
  .topo-legend-item{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--fg-subtle)}
  .topo-ring{width:12px;height:12px;border-radius:50%;border:3px solid;display:inline-block}
  .topo-swatch{width:12px;height:12px;border-radius:3px;display:inline-block}
  .topo-sel-title{font-size:14px;font-weight:600}
  .topo-meta-row{display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-top:1px solid var(--border,#f1f5f9)}
  .topo-meta-row>span:first-child{color:var(--fg-subtle)}
  .topo-hint{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--accent);background:var(--bg-muted,#f8fafc);border:1px dashed var(--border,#cbd5e1);border-radius:8px;padding:10px}
`;
