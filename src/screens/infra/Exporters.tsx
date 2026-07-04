import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Pill } from "@/components";
import { EXPORTERS, SITES } from "@/data";
import type { Exporter } from "@/types";
import type { PillKind } from "@/components";

const STATUS_PILL: Record<Exporter["status"], PillKind> = {
  ok: "success",
  warn: "warning",
  down: "critical",
};

// Parse "12.4k/s" / "120/s" / "—" into a number for the fleet total.
function scrapesPerSec(s: string): number {
  const m = s.match(/^([\d.]+)(k?)\/s$/);
  if (!m) return 0;
  return parseFloat(m[1]) * (m[2] === "k" ? 1000 : 1);
}

export function ExportersScreen() {
  const stats = useMemo(() => {
    const ok = EXPORTERS.filter((e) => e.status === "ok").length;
    const warn = EXPORTERS.filter((e) => e.status === "warn").length;
    const down = EXPORTERS.filter((e) => e.status === "down").length;
    const hosts = EXPORTERS.reduce((a, e) => a + e.hosts, 0);
    const rate = EXPORTERS.reduce((a, e) => a + scrapesPerSec(e.scrapes), 0);
    return { ok, warn, down, hosts, rate: `${(rate / 1000).toFixed(1)}k/s` };
  }, []);

  const bySite = useMemo(
    () =>
      SITES.map((s) => ({
        site: s,
        exporters: EXPORTERS.filter((e) => e.sites.includes(s.id)),
      })),
    [],
  );

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
        <span>Exporters</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">EXP-FLEET</span>
          {stats.down > 0 && <Pill kind="critical">{stats.down} down</Pill>}
          {stats.warn > 0 && <Pill kind="warning">{stats.warn} lagging</Pill>}
          <Pill kind="success">{stats.ok} healthy</Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Prometheus exporter fleet</h1>
          <div className="sn-form-sub">
            {EXPORTERS.length} exporter types · {stats.hosts.toLocaleString()} scraped hosts ·{" "}
            {stats.rate} aggregate scrape rate
          </div>
        </div>
        <div className="sn-form-actions">
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-rotate" /> Reload targets
          </button>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-file-code" /> Generated config
          </button>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> Register exporter
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Exporter types" value={EXPORTERS.length} sub="in fleet" tone="neutral" />
        <Kpi label="Healthy" value={stats.ok} sub="scraping on time" tone="ok" />
        <Kpi
          label="Lagging"
          value={stats.warn}
          sub="scrape lag"
          tone={stats.warn ? "warn" : "ok"}
        />
        <Kpi label="Down" value={stats.down} sub="not scraping" tone={stats.down ? "crit" : "ok"} />
        <Kpi
          label="Scraped hosts"
          value={stats.hosts.toLocaleString()}
          sub="all sites"
          tone="neutral"
        />
        <Kpi label="Scrape rate" value={stats.rate} sub="samples ingested" tone="ok" />
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          <div className="sn-form-section">
            <div className="sn-section-header">
              <i className="fa-solid fa-tower-broadcast" />
              <span className="sn-section-title">Fleet status</span>
              <span className="sn-section-badge">last scrape + lag per exporter</span>
            </div>
            <div className="sn-section-content">
              <table className="sn-list-table">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Status</th>
                    <th>Exporter</th>
                    <th style={{ width: 90 }}>Version</th>
                    <th style={{ width: 80 }}>Hosts</th>
                    <th style={{ width: 100 }}>Scrapes</th>
                    <th style={{ width: 80 }}>Lag</th>
                    <th>Sites</th>
                  </tr>
                </thead>
                <tbody>
                  {EXPORTERS.map((e) => (
                    <tr key={e.name}>
                      <td>
                        <Pill kind={STATUS_PILL[e.status]}>{e.status}</Pill>
                      </td>
                      <td>
                        <span className="mono" style={{ fontWeight: 550 }}>
                          {e.name}
                        </span>
                      </td>
                      <td className="mono text-mute">{e.version}</td>
                      <td className="mono">{e.hosts}</td>
                      <td className="mono">{e.scrapes}</td>
                      <td
                        className="mono"
                        style={{ color: e.status === "warn" ? "#d97706" : undefined }}
                      >
                        {e.lag}
                      </td>
                      <td>
                        <div className="exp-sites">
                          {e.sites.map((sid) => (
                            <span key={sid} className="exp-site mono">
                              {sid}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="sn-form-side">
          <div className="sn-side-card">
            <div className="sn-side-head">Coverage by site</div>
            <div className="sn-side-body">
              {bySite.map(({ site, exporters }) => (
                <div key={site.id} className="sn-related-row">
                  <div>
                    <div className="sn-related-title" style={{ fontSize: 12 }}>
                      {site.name}
                    </div>
                    <div className="sn-related-meta">
                      {exporters.length} exporter type{exporters.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <Pill
                    kind={
                      exporters.some((e) => e.status !== "ok")
                        ? "warning"
                        : exporters.length
                          ? "success"
                          : "neutral"
                    }
                  >
                    {exporters.length
                      ? exporters.every((e) => e.status === "ok")
                        ? "ok"
                        : "degraded"
                      : "none"}
                  </Pill>
                </div>
              ))}
            </div>
          </div>

          <div className="sn-side-card">
            <div className="sn-side-head">Config pipeline</div>
            <div className="sn-side-body">
              <p style={{ fontSize: 12, color: "var(--fg-subtle)", margin: "0 0 10px" }}>
                Target files are generated per tenant/site, validated with{" "}
                <span className="mono">promtool check config</span>, and published only after
                approval — never a live edit.
              </p>
              {[
                "file_sd targets generated",
                "promtool validation",
                "credential scan",
                "approval + reload",
              ].map((step, i) => (
                <div key={step} className="exp-pipe">
                  <span className="exp-pipe-n">{i + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style>{STYLES}</style>
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
  .exp-sites{display:flex;flex-wrap:wrap;gap:4px}
  .exp-site{font-size:10px;padding:1px 7px;border-radius:6px;background:var(--bg-muted,#f8fafc);border:1px solid var(--border,#e2e8f0)}
  .exp-pipe{display:flex;align-items:center;gap:8px;font-size:12px;padding:5px 0}
  .exp-pipe-n{width:18px;height:18px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:9.5px;font-weight:700;flex-shrink:0}
`;
