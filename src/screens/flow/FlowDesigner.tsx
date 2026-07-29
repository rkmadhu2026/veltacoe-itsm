import { useState } from "react";
import { Link } from "react-router-dom";
import { Pill } from "@/components";
import type { PillKind } from "@/components";

type NodeKind = "trigger" | "condition" | "action" | "approval" | "verify" | "notify";

interface FlowNode {
  id: string;
  kind: NodeKind;
  title: string;
  detail: string;
}

interface Flow {
  id: string;
  name: string;
  state: "enabled" | "draft";
  runs30d: number;
  lastRun: string;
  nodes: readonly FlowNode[];
}

const NODE_META: Record<NodeKind, { icon: string; label: string; color: string }> = {
  trigger: { icon: "fa-bolt", label: "Trigger", color: "#2563eb" },
  condition: { icon: "fa-code-branch", label: "Condition", color: "#8b5cf6" },
  action: { icon: "fa-robot", label: "Action", color: "#f59e0b" },
  approval: { icon: "fa-user-check", label: "Approval", color: "#dc2626" },
  verify: { icon: "fa-stethoscope", label: "Verify", color: "#14b8a6" },
  notify: { icon: "fa-bell", label: "Notify", color: "#0891b2" },
};

const FLOWS: readonly Flow[] = [
  {
    id: "flow-adapter",
    name: "Adapter heartbeat auto-remediation",
    state: "enabled",
    runs30d: 14,
    lastRun: "4h ago",
    nodes: [
      {
        id: "n1",
        kind: "trigger",
        title: "Alert: AdapterHeartbeatMissed",
        detail: "Alertmanager webhook · severity ≥ high · category = trading",
      },
      {
        id: "n2",
        kind: "condition",
        title: "Inside trading hours?",
        detail: "09:00–15:30 IST and not a holiday (calendar service)",
      },
      {
        id: "n3",
        kind: "action",
        title: "linkedeye.adapter_restart",
        detail: "Safe tier · graceful stop/start with session re-logon",
      },
      {
        id: "n4",
        kind: "verify",
        title: "Heartbeat restored ≤ 60s",
        detail: "linkedeye.health_verify · rollback plan on failure",
      },
      {
        id: "n5",
        kind: "notify",
        title: "Update incident + Slack #trading-ops",
        detail: "Timeline entry with execution output",
      },
    ],
  },
  {
    id: "flow-failover",
    name: "Database failover (guarded)",
    state: "enabled",
    runs30d: 1,
    lastRun: "2d ago · rejected",
    nodes: [
      {
        id: "n1",
        kind: "trigger",
        title: "Manual: from incident context",
        detail: "Requires linked INC reference",
      },
      {
        id: "n2",
        kind: "approval",
        title: "Dual approval — IC + Admin",
        detail: "OPA policy: guarded tier · 15 min timeout",
      },
      {
        id: "n3",
        kind: "action",
        title: "linkedeye.db_failover",
        detail: "Promote standby · repoint OMS connections",
      },
      {
        id: "n4",
        kind: "verify",
        title: "Replication + query latency checks",
        detail: "Fail back plan recorded before execution",
      },
      {
        id: "n5",
        kind: "notify",
        title: "Page DBA on-call + status page note",
        detail: "Sev-1 comms template",
      },
    ],
  },
  {
    id: "flow-disk",
    name: "TSDB disk pressure cleanup",
    state: "draft",
    runs30d: 0,
    lastRun: "never",
    nodes: [
      {
        id: "n1",
        kind: "trigger",
        title: "Alert: PrometheusTsdbDiskPressure",
        detail: "predict_linear disk full < 12h",
      },
      {
        id: "n2",
        kind: "condition",
        title: "Retention already at minimum?",
        detail: "Skip compaction if hot window ≤ 15d",
      },
      {
        id: "n3",
        kind: "action",
        title: "linkedeye.collect_diagnostics",
        detail: "Snapshot TSDB stats before any mutation",
      },
      {
        id: "n4",
        kind: "approval",
        title: "Platform on-call sign-off",
        detail: "Compaction is guarded — never automatic",
      },
      {
        id: "n5",
        kind: "notify",
        title: "Open capacity-review ticket",
        detail: "Redmine · linked to alert",
      },
    ],
  },
];

export function FlowDesignerScreen() {
  const [flowId, setFlowId] = useState(FLOWS[0].id);
  const [selNode, setSelNode] = useState<string>(FLOWS[0].nodes[0].id);

  const flow = FLOWS.find((f) => f.id === flowId) ?? FLOWS[0];
  const node = flow.nodes.find((n) => n.id === selNode) ?? flow.nodes[0];
  const enabled = FLOWS.filter((f) => f.state === "enabled").length;

  const pickFlow = (id: string) => {
    setFlowId(id);
    const f = FLOWS.find((x) => x.id === id);
    if (f) setSelNode(f.nodes[0].id);
  };

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Build</a>
        <span className="sn-bc-sep">›</span>
        <span>Flow Designer</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">FLOW-DESIGNER</span>
          <Pill kind="success">{enabled} enabled</Pill>
          <Pill kind="neutral" noDot>
            Compiles to StackStorm workflows
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Flow Designer</h1>
          <div className="sn-form-sub">
            {FLOWS.length} flows · guarded actions always insert an approval gate · every run lands
            in the incident timeline and audit trail
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/automation" className="sn-btn">
            <i className="fa-solid fa-robot" /> Action catalog
          </Link>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New flow
          </button>
        </div>
      </div>

      <div className="flw-layout">
        {/* Flow list */}
        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-diagram-project" />
            <span className="sn-section-title">Flows</span>
          </div>
          <div className="flw-list">
            {FLOWS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`flw-item ${f.id === flowId ? "active" : ""}`}
                onClick={() => pickFlow(f.id)}
              >
                <span className="flw-item-head">
                  <b>{f.name}</b>
                  <Pill kind={f.state === "enabled" ? "success" : "neutral"} noDot>
                    {f.state}
                  </Pill>
                </span>
                <span className="flw-item-sub">
                  {f.runs30d} runs / 30d · last {f.lastRun}
                </span>
              </button>
            ))}
          </div>

          <div className="sn-section-header" style={{ marginTop: 16 }}>
            <i className="fa-solid fa-shapes" />
            <span className="sn-section-title">Palette</span>
          </div>
          <div className="flw-palette">
            {(Object.keys(NODE_META) as NodeKind[]).map((k) => (
              <span key={k} className="flw-chip" style={{ color: NODE_META[k].color }}>
                <i className={`fa-solid ${NODE_META[k].icon}`} /> {NODE_META[k].label}
              </span>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-wand-magic-sparkles" />
            <span className="sn-section-title">{flow.name}</span>
          </div>
          <div className="flw-canvas">
            {flow.nodes.map((n, i) => (
              <div key={n.id} className="flw-step">
                {i > 0 && <div className="flw-connector" />}
                <button
                  type="button"
                  className={`flw-node ${n.id === node.id ? "selected" : ""}`}
                  onClick={() => setSelNode(n.id)}
                >
                  <span
                    className="flw-node-icon"
                    style={{
                      background: `${NODE_META[n.kind].color}18`,
                      color: NODE_META[n.kind].color,
                    }}
                  >
                    <i className={`fa-solid ${NODE_META[n.kind].icon}`} />
                  </span>
                  <span className="flw-node-body">
                    <span className="flw-node-kind">{NODE_META[n.kind].label}</span>
                    <span className="flw-node-title">{n.title}</span>
                  </span>
                </button>
              </div>
            ))}
          </div>

          <div className="flw-props">
            <div className="flw-props-head">
              <i className={`fa-solid ${NODE_META[node.kind].icon}`} />
              <b>{node.title}</b>
              <Pill kind={"info" as PillKind} noDot>
                {NODE_META[node.kind].label}
              </Pill>
            </div>
            <div className="flw-props-detail">{node.detail}</div>
            {node.kind === "approval" && (
              <div className="flw-props-note">
                Approval gates cannot be removed from flows that call guarded actions — enforced at
                compile time.
              </div>
            )}
            {node.kind === "action" && (
              <div className="flw-props-note">
                Action credentials resolve from Vault at runtime; the flow definition stores the
                reference only.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const STYLES = `
  .flw-layout{display:grid;grid-template-columns:minmax(260px,340px) minmax(0,1fr);gap:18px;align-items:start}
  @media (max-width:1000px){.flw-layout{grid-template-columns:1fr}}
  .flw-list{display:flex;flex-direction:column;gap:8px}
  .flw-item{display:flex;flex-direction:column;gap:4px;padding:11px 13px;border:1px solid var(--border,#e2e8f0);border-radius:10px;background:var(--bg,#fff);cursor:pointer;font:inherit;text-align:left;color:var(--fg)}
  .flw-item:hover{border-color:var(--accent)}
  .flw-item.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
  .flw-item-head{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px}
  .flw-item-sub{font-size:11px;color:var(--fg-subtle)}
  .flw-palette{display:flex;flex-wrap:wrap;gap:8px}
  .flw-chip{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;padding:6px 10px;border:1px dashed var(--border,#e2e8f0);border-radius:8px}
  .flw-canvas{display:flex;flex-direction:column;align-items:stretch;gap:0;padding:6px 0 14px}
  .flw-step{display:flex;flex-direction:column;align-items:stretch}
  .flw-connector{width:2px;height:18px;background:var(--border,#e2e8f0);margin:0 auto}
  .flw-node{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border,#e2e8f0);border-radius:11px;background:var(--bg,#fff);cursor:pointer;font:inherit;text-align:left;color:var(--fg);max-width:560px;width:100%;margin:0 auto}
  .flw-node:hover{border-color:var(--accent)}
  .flw-node.selected{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
  .flw-node-icon{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border-radius:9px;font-size:14px;flex-shrink:0}
  .flw-node-body{display:flex;flex-direction:column;gap:1px;min-width:0}
  .flw-node-kind{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--fg-subtle)}
  .flw-node-title{font-size:13px;font-weight:600}
  .flw-props{border:1px solid var(--border,#e2e8f0);border-radius:11px;padding:14px;background:var(--bg-muted,#f8fafc)}
  .flw-props-head{display:flex;align-items:center;gap:9px;font-size:13px;margin-bottom:6px}
  .flw-props-head i{color:var(--fg-subtle)}
  .flw-props-detail{font-size:12px;color:var(--fg-subtle)}
  .flw-props-note{font-size:11.5px;margin-top:10px;padding:9px 11px;border-left:3px solid var(--accent);background:var(--bg,#fff);border-radius:0 8px 8px 0}
`;
