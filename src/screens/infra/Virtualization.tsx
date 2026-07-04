import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pill } from "@/components";
import { DEVICES, VMS } from "@/data";
import type { VM, VMState } from "@/types";
import type { PillKind } from "@/components";

const STATE_PILL: Record<VMState, PillKind> = {
  running: "success",
  stopped: "neutral",
  suspended: "warning",
};

const STATE_ICON: Record<VMState, string> = {
  running: "fa-play",
  stopped: "fa-stop",
  suspended: "fa-pause",
};

export function VirtualizationScreen() {
  const navigate = useNavigate();
  const [clusterFilter, setClusterFilter] = useState<"all" | string>("all");
  const [stateFilter, setStateFilter] = useState<"all" | VMState>("all");
  const [q, setQ] = useState("");

  const hypervisors = useMemo(() => DEVICES.filter((d) => d.kind === "hypervisor"), []);
  const clusters = useMemo(() => [...new Set(VMS.map((v) => v.cluster))].sort(), []);

  const filtered = useMemo(() => {
    return VMS.filter((v) => {
      if (clusterFilter !== "all" && v.cluster !== clusterFilter) return false;
      if (stateFilter !== "all" && v.state !== stateFilter) return false;
      if (q && !`${v.id} ${v.host} ${v.os} ${v.ip}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [clusterFilter, stateFilter, q]);

  const stats = useMemo(() => {
    const running = VMS.filter((v) => v.state === "running").length;
    const stopped = VMS.filter((v) => v.state === "stopped").length;
    const avgCpu = Math.round(
      VMS.filter((v) => v.state === "running").reduce((a, v) => a + v.cpuUse, 0) /
        Math.max(1, running),
    );
    const avgMem = Math.round(
      VMS.filter((v) => v.state === "running").reduce((a, v) => a + v.memUse, 0) /
        Math.max(1, running),
    );
    const hotHosts = hypervisors.filter((h) => h.cpu >= 60 || h.mem >= 75).length;
    return { total: VMS.length, running, stopped, avgCpu, avgMem, hotHosts };
  }, [hypervisors]);

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
        <span>Virtualization</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">VIRT-OPS</span>
          <Pill kind="success">{stats.running} running</Pill>
          {stats.hotHosts > 0 && <Pill kind="warning">{stats.hotHosts} hosts under pressure</Pill>}
          <Pill kind="neutral" noDot>
            {hypervisors.length} hypervisors
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Virtualization</h1>
          <div className="sn-form-sub">
            vSphere clusters · {clusters.length} clusters · {VMS.length} virtual machines across{" "}
            {hypervisors.length} ESXi hosts · vmware-exporter telemetry
          </div>
        </div>
        <div className="sn-form-actions">
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-arrows-rotate" /> Sync vCenter
          </button>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-file-export" /> Export
          </button>
          <button type="button" className="sn-btn primary" onClick={() => navigate("/onboarding")}>
            <i className="fa-solid fa-plus" /> Onboard cluster
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi
          label="Virtual machines"
          value={stats.total}
          sub={`${clusters.length} clusters`}
          tone="neutral"
        />
        <Kpi label="Running" value={stats.running} sub="powered on" tone="ok" />
        <Kpi label="Stopped" value={stats.stopped} sub="powered off" tone="neutral" />
        <Kpi
          label="Avg vCPU load"
          value={`${stats.avgCpu}%`}
          sub="running VMs"
          tone={stats.avgCpu >= 70 ? "warn" : "ok"}
        />
        <Kpi
          label="Avg memory"
          value={`${stats.avgMem}%`}
          sub="running VMs"
          tone={stats.avgMem >= 70 ? "warn" : "ok"}
        />
        <Kpi
          label="Hosts hot"
          value={stats.hotHosts}
          sub="CPU/mem pressure"
          tone={stats.hotHosts ? "warn" : "ok"}
        />
      </div>

      {/* Hypervisor host cards */}
      <div className="virt-hosts">
        {hypervisors.map((h) => {
          const hostVms = VMS.filter((v) => v.host === h.id);
          const running = hostVms.filter((v) => v.state === "running").length;
          return (
            <Link key={h.id} to={`/infra/device/${h.id}`} className="virt-host">
              <div className="virt-host-head">
                <i className="fa-solid fa-layer-group" />
                <div>
                  <div className="virt-host-name mono">{h.id}</div>
                  <div className="virt-host-sub">
                    {h.model} · {h.os}
                  </div>
                </div>
                <Pill
                  kind={
                    h.status === "ok" ? "success" : h.status === "warn" ? "warning" : "critical"
                  }
                >
                  {h.status}
                </Pill>
              </div>
              <div className="virt-host-meters">
                <Meter label="CPU" pct={h.cpu} />
                <Meter label="Memory" pct={h.mem} />
              </div>
              <div className="virt-host-foot">
                <span>
                  <i className="fa-solid fa-cube" /> {hostVms.length || "—"} VM
                  {hostVms.length === 1 ? "" : "s"} tracked · {running} running
                </span>
                <span className="mono text-mute">{h.role}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="inc-toolbar">
        <div className="inc-toolbar-search">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            placeholder="Search VM, host, OS, or IP…"
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
          <label>Cluster</label>
          <div className="inc-segmented">
            {(["all", ...clusters] as const).map((c) => (
              <button
                type="button"
                key={c}
                className={`inc-seg${clusterFilter === c ? " active" : ""}`}
                onClick={() => setClusterFilter(c)}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>
        <div className="inc-toolbar-group">
          <label>State</label>
          <div className="inc-segmented">
            {(["all", "running", "stopped", "suspended"] as const).map((s) => (
              <button
                type="button"
                key={s}
                className={`inc-seg${stateFilter === s ? " active" : ""}`}
                onClick={() => setStateFilter(s)}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VM table */}
      <div className="sn-form-section">
        <div className="sn-section-content">
          <table className="sn-list-table">
            <thead>
              <tr>
                <th style={{ width: 110 }}>State</th>
                <th>VM</th>
                <th style={{ width: 150 }}>Host</th>
                <th style={{ width: 100 }}>Cluster</th>
                <th style={{ width: 170 }}>OS</th>
                <th style={{ width: 130 }}>Resources</th>
                <th style={{ width: 110 }}>CPU</th>
                <th style={{ width: 110 }}>Memory</th>
                <th style={{ width: 120 }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <VmRow key={v.id} v={v} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{ padding: 32, textAlign: "center", color: "var(--fg-subtle)" }}
                  >
                    No virtual machines match the current filters.
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

function VmRow({ v }: { v: VM }) {
  return (
    <tr>
      <td>
        <Pill kind={STATE_PILL[v.state]}>
          <i
            className={`fa-solid ${STATE_ICON[v.state]}`}
            style={{ fontSize: 9, marginRight: 4 }}
          />
          {v.state}
        </Pill>
      </td>
      <td>
        <span className="mono" style={{ fontWeight: 550 }}>
          {v.id}
        </span>
      </td>
      <td>
        <Link to={`/infra/device/${v.host}`} className="sn-link mono">
          {v.host}
        </Link>
      </td>
      <td className="mono">{v.cluster}</td>
      <td>{v.os}</td>
      <td className="mono text-mute" style={{ fontSize: 11.5 }}>
        {v.cpu} · {v.mem} · {v.disk}
      </td>
      <td>
        {v.state === "running" ? <UsageBar pct={v.cpuUse} /> : <span className="text-mute">—</span>}
      </td>
      <td>
        {v.state === "running" ? <UsageBar pct={v.memUse} /> : <span className="text-mute">—</span>}
      </td>
      <td className="mono text-mute">{v.ip}</td>
    </tr>
  );
}

function UsageBar({ pct }: { pct: number }) {
  const color = pct >= 85 ? "#dc2626" : pct >= 70 ? "#f59e0b" : "#10b981";
  return (
    <div className="virt-bar" title={`${pct}%`}>
      <div className="virt-bar-fill" style={{ width: `${pct}%`, background: color }} />
      <span className="virt-bar-txt mono">{pct}%</span>
    </div>
  );
}

function Meter({ label, pct }: { label: string; pct: number }) {
  const color = pct >= 85 ? "#dc2626" : pct >= 60 ? "#f59e0b" : "#10b981";
  return (
    <div className="virt-meter">
      <div className="virt-meter-top">
        <span>{label}</span>
        <span className="mono">{pct}%</span>
      </div>
      <div className="virt-meter-track">
        <div className="virt-meter-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

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
  .virt-hosts{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:16px}
  .virt-host{border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;background:var(--bg,#fff);text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:12px}
  .virt-host:hover{border-color:var(--accent)}
  .virt-host-head{display:flex;align-items:flex-start;gap:10px}
  .virt-host-head>i{font-size:18px;color:#6366f1;margin-top:2px}
  .virt-host-head>div{flex:1;min-width:0}
  .virt-host-name{font-size:13px;font-weight:600}
  .virt-host-sub{font-size:11px;color:var(--fg-subtle)}
  .virt-host-meters{display:flex;flex-direction:column;gap:8px}
  .virt-meter-top{display:flex;justify-content:space-between;font-size:11px;color:var(--fg-subtle);margin-bottom:3px}
  .virt-meter-track{height:6px;border-radius:999px;background:var(--bg-muted,#f1f5f9);overflow:hidden}
  .virt-meter-fill{height:100%;border-radius:999px}
  .virt-host-foot{display:flex;justify-content:space-between;font-size:11px;color:var(--fg-subtle);gap:8px;flex-wrap:wrap}
  .virt-bar{position:relative;height:16px;border-radius:4px;background:var(--bg-muted,#f1f5f9);overflow:hidden;min-width:70px}
  .virt-bar-fill{position:absolute;inset:0 auto 0 0;border-radius:4px}
  .virt-bar-txt{position:absolute;right:5px;top:0;line-height:16px;font-size:10px;color:var(--fg)}
`;
