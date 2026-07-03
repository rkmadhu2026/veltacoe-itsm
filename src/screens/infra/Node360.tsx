import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Pill, Sparkline } from "@/components";
import {
  NET_LINKS,
  SITES,
  alertsForDevice,
  assetLifecycle,
  deviceById,
  deviceKindById,
} from "@/data";
import { spark } from "@/lib/spark";
import type { AlertLabelSeverity, AssetLifecycle, DeviceStatus } from "@/types";
import type { PillKind } from "@/components";

const STATUS_PILL: Record<DeviceStatus, PillKind> = {
  ok: "success",
  warn: "warning",
  critical: "critical",
  down: "neutral",
};

const LIFECYCLE_PILL: Record<AssetLifecycle, PillKind> = {
  active: "success",
  pending_review: "warning",
  discovered: "info",
  decommissioned: "neutral",
};

const SEV_PILL: Record<AlertLabelSeverity, PillKind> = {
  critical: "critical",
  warning: "warning",
  info: "info",
};

const seedOf = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

export function Node360Screen() {
  const { id = "" } = useParams();
  const device = deviceById(id);

  const deps = useMemo(() => {
    const upstream = NET_LINKS.filter(([, b]) => b === id).map(([a]) => a);
    const downstream = NET_LINKS.filter(([a]) => a === id).map(([, b]) => b);
    return { upstream, downstream };
  }, [id]);

  const alerts = useMemo(() => alertsForDevice(id), [id]);

  if (!device) {
    return (
      <div className="page page-fade narrow">
        <div className="page-head"><div className="page-title"><h1>Device not found</h1></div></div>
        <div className="card"><div className="card-body" style={{ padding: 24 }}>
          No asset with id <code>{id}</code>. <Link to="/infra/assets" className="sn-link">Back to inventory</Link>.
        </div></div>
      </div>
    );
  }

  const kind = deviceKindById(device.kind);
  const lc = assetLifecycle(device.id);
  const site = SITES.find((s) => s.id === device.site);
  const seed = seedOf(device.id);
  const cpuSeries = spark(seed, device.cpu > 70 ? 1 : 0);
  const memSeries = spark(seed + 7, device.mem > 70 ? 1 : 0);
  const netSeries = spark(seed + 13);
  const latSeries = spark(seed + 21, device.status === "warn" ? 1 : 0);

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">Home</Link>
        <span className="sn-bc-sep">›</span>
        <Link to="/infra" className="sn-link">Infrastructure</Link>
        <span className="sn-bc-sep">›</span>
        <Link to="/infra/assets" className="sn-link">Asset inventory</Link>
        <span className="sn-bc-sep">›</span>
        <span className="mono">{device.id}</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">{device.id}</span>
          <Pill kind={STATUS_PILL[device.status]}>{device.status}</Pill>
          <Pill kind={LIFECYCLE_PILL[lc]}>{lc.replace(/_/g, " ")}</Pill>
          {alerts.length > 0 && <Pill kind="critical">{alerts.length} active alert{alerts.length === 1 ? "" : "s"}</Pill>}
        </div>
        <div className="sn-form-title-meta">
          <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {kind && <i className={`fa-${kind.iconBrand ? "brands" : "solid"} ${kind.icon}`} style={{ color: kind.color }} />}
            {device.model}
          </h1>
          <div className="sn-form-sub">
            {device.role} · {site?.name ?? device.site} · <span className="mono">{device.ip}</span> · {device.os}
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/infra/topology" className="sn-btn"><i className="fa-solid fa-circle-nodes" /> View in topology</Link>
          <button type="button" className="sn-btn"><i className="fa-solid fa-rotate" /> Poll now</button>
          <button type="button" className="sn-btn primary"><i className="fa-solid fa-wand-magic-sparkles" /> Suggest remediation</button>
        </div>
      </div>

      {/* Metric tiles */}
      <div className="n360-metrics">
        <MetricTile label="CPU" value={`${device.cpu}%`} series={cpuSeries} tone={device.cpu >= 85 ? "crit" : device.cpu >= 70 ? "warn" : "ok"} />
        <MetricTile label="Memory" value={`${device.mem}%`} series={memSeries} tone={device.mem >= 85 ? "crit" : device.mem >= 70 ? "warn" : "ok"} />
        <MetricTile label="Throughput" value={device.throughput === "—" ? "n/a" : device.throughput} series={netSeries} tone="ok" />
        <MetricTile label="Latency p95" value={device.status === "warn" ? "28 ms" : "6 ms"} series={latSeries} tone={device.status === "warn" ? "warn" : "ok"} />
        <MetricTile label="Uptime" value={device.uptime} tone="neutral" />
        <MetricTile label="Last seen" value={device.lastSeen} tone={device.status === "down" ? "crit" : "ok"} />
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          {/* Interfaces / inventory */}
          <Section icon="fa-ethernet" title="Interfaces & inventory" badge={device.iface}>
            <div className="n360-inv-grid">
              <InvRow k="Vendor / model" v={device.model} />
              <InvRow k="OS / firmware" v={device.os} />
              <InvRow k="Management IP" v={device.ip} mono />
              <InvRow k="Interfaces" v={device.iface} />
              <InvRow k="Sessions" v={device.sessions} />
              <InvRow k="Collector" v={device.agent} mono />
              <InvRow k="Site" v={site?.name ?? device.site} />
              <InvRow k="Region" v={site?.region ?? "—"} />
            </div>
          </Section>

          {/* Related alerts */}
          <Section icon="fa-bell" title="Active alerts" badge={`${alerts.length}`}>
            {alerts.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "var(--fg-subtle)", margin: 0 }}>No firing alerts for this device.</p>
            ) : (
              <div className="n360-alerts">
                {alerts.map((a) => (
                  <div key={a.id} className="n360-alert">
                    <Pill kind={SEV_PILL[a.severity]}>{a.severity}</Pill>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 550, fontSize: 12.5 }}>{a.alertname}</div>
                      <div style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>{a.summary}</div>
                    </div>
                    <span className="mono text-mute" style={{ fontSize: 11 }}>{a.value} · {a.startsAt}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Correlated signals */}
          <Section icon="fa-diagram-project" title="Correlated signals" badge="AI · read-only">
            <div className="n360-corr">
              {correlations(device.id, device.status).map((c) => (
                <div key={c.label} className="n360-corr-row">
                  <span className={`n360-corr-dot tone-${c.tone}`} />
                  <span style={{ flex: 1 }}>{c.label}</span>
                  <span className="mono text-mute" style={{ fontSize: 11 }}>corr {c.corr}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: "var(--fg-subtle)", marginTop: 10, marginBottom: 0 }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 6, color: "var(--accent)" }} />
              Recommendations are advisory. No remediation runs without explicit approval and a rollback plan.
            </p>
          </Section>
        </div>

        <aside className="sn-form-side">
          <div className="sn-side-card">
            <div className="sn-side-head">Dependencies</div>
            <div className="sn-side-body">
              <div className="n360-dep-label">Upstream ({deps.upstream.length})</div>
              {deps.upstream.length === 0 && <p className="n360-dep-empty">— none</p>}
              {deps.upstream.map((u) => <DepRow key={u} id={u} />)}
              <div className="n360-dep-label" style={{ marginTop: 10 }}>Downstream ({deps.downstream.length})</div>
              {deps.downstream.length === 0 && <p className="n360-dep-empty">— none</p>}
              {deps.downstream.map((dn) => <DepRow key={dn} id={dn} />)}
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">Safe automations</div>
            <div className="sn-side-body sn-actions-grid">
              {([
                ["fa-rotate", "Restart collector"],
                ["fa-stethoscope", "Collect diagnostics"],
                ["fa-heart-pulse", "Health verify"],
                ["fa-ticket", "Create ticket"],
                ["fa-bell-slash", "Silence 1h"],
                ["fa-screwdriver-wrench", "Maintenance"],
              ] as const).map(([ic, lbl]) => (
                <button key={lbl} type="button" className="sn-action"><i className={`fa-solid ${ic}`} /><span>{lbl}</span></button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--fg-subtle)", margin: "8px 4px 0" }}>
              Destructive actions are disabled for {lc === "pending_review" ? "assets pending review" : "this profile"}.
            </p>
          </div>
        </aside>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

function MetricTile({ label, value, series, tone }: { label: string; value: string; series?: number[]; tone: "ok" | "warn" | "crit" | "neutral" }) {
  const color = tone === "crit" ? "#dc2626" : tone === "warn" ? "#f59e0b" : tone === "ok" ? "#10b981" : "#64748b";
  return (
    <div className={`n360-tile tone-${tone}`}>
      <div className="n360-tile-l">{label}</div>
      <div className="n360-tile-v">{value}</div>
      {series && <div className="n360-tile-spark"><Sparkline data={series} color={color} w={110} h={30} /></div>}
    </div>
  );
}

function Section({ icon, title, badge, children }: { icon: string; title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="sn-form-section">
      <div className="sn-section-header">
        <i className={`fa-solid ${icon}`} />
        <span className="sn-section-title">{title}</span>
        {badge && <span className="sn-section-badge">{badge}</span>}
      </div>
      <div className="sn-section-content">{children}</div>
    </div>
  );
}

function InvRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="n360-inv-row">
      <span className="n360-inv-k">{k}</span>
      <span className={`n360-inv-v${mono ? " mono" : ""}`}>{v}</span>
    </div>
  );
}

function DepRow({ id }: { id: string }) {
  const dev = deviceById(id);
  const kind = dev && deviceKindById(dev.kind);
  return (
    <Link to={`/infra/device/${id}`} className="sn-related-row" style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {kind && <i className={`fa-${kind.iconBrand ? "brands" : "solid"} ${kind.icon}`} style={{ color: kind.color, fontSize: 12 }} />}
        <div style={{ minWidth: 0 }}>
          <div className="sn-related-title mono" style={{ fontSize: 12 }}>{id}</div>
          <div className="sn-related-meta">{dev?.role ?? "—"}</div>
        </div>
      </div>
      <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, color: "var(--fg-subtle)" }} />
    </Link>
  );
}

// Deterministic correlated-signal list. Real system pulls this from the
// correlation service; here it's derived from the device's own state.
function correlations(id: string, status: DeviceStatus): { label: string; tone: "ok" | "warn" | "crit"; corr: string }[] {
  const base = [
    { label: "CPU saturation ↔ interface error rate", tone: (status === "warn" || status === "critical" ? "warn" : "ok") as "ok" | "warn" | "crit", corr: "0.82" },
    { label: "Memory pressure ↔ p95 latency", tone: (status === "warn" ? "warn" : "ok") as "ok" | "warn" | "crit", corr: "0.74" },
    { label: "Recent config change (change window)", tone: "ok" as const, corr: "0.31" },
    { label: "Upstream link utilization", tone: (status === "critical" ? "crit" : "ok") as "ok" | "warn" | "crit", corr: "0.68" },
  ];
  return base;
}

const STYLES = `
  .n360-metrics{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:16px}
  .n360-tile{border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:12px;background:var(--bg,#fff)}
  .n360-tile-l{font-size:11px;color:var(--fg-subtle);text-transform:uppercase;letter-spacing:.04em}
  .n360-tile-v{font-size:20px;font-weight:650;margin-top:2px}
  .n360-tile-spark{margin-top:4px}
  .n360-tile.tone-crit{border-color:#dc262640}
  .n360-tile.tone-warn{border-color:#f59e0b40}
  .n360-inv-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 24px}
  .n360-inv-row{display:flex;justify-content:space-between;gap:12px;font-size:12.5px;padding:7px 0;border-top:1px solid var(--border,#f1f5f9)}
  .n360-inv-k{color:var(--fg-subtle)}
  .n360-inv-v{text-align:right;font-weight:500}
  .n360-alerts{display:flex;flex-direction:column;gap:8px}
  .n360-alert{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--border,#e2e8f0);border-radius:8px}
  .n360-corr{display:flex;flex-direction:column}
  .n360-corr-row{display:flex;align-items:center;gap:10px;font-size:12.5px;padding:8px 0;border-top:1px solid var(--border,#f1f5f9)}
  .n360-corr-row:first-child{border-top:0}
  .n360-corr-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
  .n360-corr-dot.tone-ok{background:#10b981}
  .n360-corr-dot.tone-warn{background:#f59e0b}
  .n360-corr-dot.tone-crit{background:#dc2626}
  .n360-dep-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--fg-subtle);margin-bottom:4px}
  .n360-dep-empty{font-size:12px;color:var(--fg-subtle);margin:2px 0}
  @media(max-width:1100px){.n360-metrics{grid-template-columns:repeat(3,1fr)}.n360-inv-grid{grid-template-columns:1fr}}
`;
