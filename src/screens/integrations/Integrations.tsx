import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill } from "@/components";
import { INTEGRATIONS } from "@/data";
import type { IntegrationCategory } from "@/types";

export function IntegrationsScreen() {
  const cats = useMemo(
    () => ["all", ...Array.from(new Set(INTEGRATIONS.map((i) => i.category)))],
    [],
  );
  const [cat, setCat] = useState<"all" | IntegrationCategory>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const base = cat === "all" ? INTEGRATIONS : INTEGRATIONS.filter((i) => i.category === cat);
    const q = query.trim().toLowerCase();
    return q ? base.filter((i) => `${i.name} ${i.meta}`.toLowerCase().includes(q)) : base;
  }, [cat, query]);

  const connected = INTEGRATIONS.filter((i) => i.connected).length;

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>Integrations</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">INTEG-HUB</span>
          <Pill kind="success">{connected} connected</Pill>
          <Pill kind="neutral" noDot>
            Credentials stored as Vault references
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Integrations</h1>
          <div className="sn-form-sub">
            {INTEGRATIONS.length} integrations across {cats.length - 1} categories · webhooks,
            polling, and bidirectional sync managed per tenant
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/automation" className="sn-btn">
            <i className="fa-solid fa-robot" /> Automation
          </Link>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> Request integration
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Available" value={INTEGRATIONS.length} sub="in catalog" tone="neutral" />
        <Kpi label="Connected" value={connected} sub="active now" tone="ok" />
        <Kpi
          label="Not connected"
          value={INTEGRATIONS.length - connected}
          sub="ready to enable"
          tone="neutral"
        />
        <Kpi label="Categories" value={cats.length - 1} sub="integration areas" tone="neutral" />
        <Kpi label="Webhook errors" value={0} sub="last 24h" tone="ok" />
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-plug" />
          <span className="sn-section-title">Catalog</span>
        </div>
        <div className="ig-toolbar">
          <div className="ig-tabs">
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                className={`ig-tab ${cat === c ? "active" : ""}`}
                onClick={() => setCat(c as "all" | IntegrationCategory)}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
          <input
            className="ig-search"
            placeholder="Search integrations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="ig-grid">
          {rows.map((i) => (
            <Link
              key={i.name}
              to={`/integrations/${encodeURIComponent(i.name)}`}
              className="ig-card"
            >
              <div className="ig-head">
                <span className={`ig-icon ${i.connected ? "on" : ""}`}>
                  <i className={i.icon} />
                </span>
                <span className="ig-name">{i.name}</span>
                {i.connected ? (
                  <Pill kind="success" noDot>
                    Connected
                  </Pill>
                ) : (
                  <Pill kind="neutral" noDot>
                    Connect
                  </Pill>
                )}
              </div>
              <div className="ig-meta">{i.meta}</div>
              <div className="ig-cat">
                <Pill kind="info" noDot>
                  {i.category}
                </Pill>
              </div>
            </Link>
          ))}
          {rows.length === 0 && (
            <div className="text-mute" style={{ padding: 16, fontSize: 12.5 }}>
              No integrations match the current filter.
            </div>
          )}
        </div>
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
  .ig-toolbar{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}
  .ig-tabs{display:flex;gap:6px;flex-wrap:wrap}
  .ig-tab{display:inline-flex;align-items:center;padding:6px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);cursor:pointer;font:inherit;font-size:12px;color:var(--fg)}
  .ig-tab:hover{border-color:var(--accent)}
  .ig-tab.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}
  .ig-search{border:1px solid var(--border,#e2e8f0);border-radius:8px;padding:6px 12px;font:inherit;font-size:12px;min-width:220px;background:var(--bg,#fff);color:var(--fg)}
  .ig-search:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
  .ig-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
  .ig-card{display:flex;flex-direction:column;gap:8px;padding:14px;border:1px solid var(--border,#e2e8f0);border-radius:10px;background:var(--bg,#fff);text-decoration:none;color:var(--fg)}
  .ig-card:hover{border-color:var(--accent)}
  .ig-head{display:flex;align-items:center;gap:10px}
  .ig-icon{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border-radius:9px;background:var(--bg-muted,#f8fafc);color:var(--fg-subtle);font-size:14px}
  .ig-icon.on{background:color-mix(in srgb,var(--accent) 12%,transparent);color:var(--accent)}
  .ig-name{font-size:13px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ig-meta{font-size:11.5px;color:var(--fg-subtle)}
  .ig-cat{display:flex}
`;
