import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, UserById } from "@/components";
import { ARTICLES } from "@/data";
import type { PillKind } from "@/components";

const CAT_PILL: Record<string, PillKind> = {
  Runbooks: "info",
  Process: "purple",
  Onboarding: "teal",
  "Known errors": "warning",
};

export function KnowledgeScreen() {
  const cats = useMemo(() => ["all", ...Array.from(new Set(ARTICLES.map((a) => a.cat)))], []);
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const base = cat === "all" ? ARTICLES : ARTICLES.filter((a) => a.cat === cat);
    const q = query.trim().toLowerCase();
    return q ? base.filter((a) => `${a.title} ${a.tag} ${a.id}`.toLowerCase().includes(q)) : base;
  }, [cat, query]);

  const totalViews = ARTICLES.reduce((a, x) => a + x.views, 0);
  const avgRating = ARTICLES.reduce((a, x) => a + x.rating, 0) / ARTICLES.length;
  const knownErrors = ARTICLES.filter((a) => a.cat === "Known errors").length;

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>Knowledge base</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">KB-LIBRARY</span>
          <Pill kind="neutral" noDot>
            Reviewed quarterly · linked from problems
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Knowledge base</h1>
          <div className="sn-form-sub">
            {ARTICLES.length} published articles · {totalViews.toLocaleString("en-US")} total views
            · known-error articles are auto-linked from problem records
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/problems" className="sn-btn">
            <i className="fa-solid fa-magnifying-glass-chart" /> Problems
          </Link>
          <Link to="/runbooks" className="sn-btn">
            <i className="fa-solid fa-book" /> Runbooks
          </Link>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New article
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Articles" value={ARTICLES.length} sub="published" tone="neutral" />
        <Kpi
          label="Total views"
          value={totalViews.toLocaleString("en-US")}
          sub="all time"
          tone="neutral"
        />
        <Kpi label="Avg rating" value={avgRating.toFixed(1)} sub="reader feedback" tone="ok" />
        <Kpi label="Known errors" value={knownErrors} sub="published workarounds" tone="ok" />
        <Kpi label="Categories" value={cats.length - 1} sub="content areas" tone="neutral" />
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-book-open" />
          <span className="sn-section-title">Articles</span>
        </div>
        <div className="kb-toolbar">
          <div className="kb-tabs">
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                className={`kb-tab ${cat === c ? "active" : ""}`}
                onClick={() => setCat(c)}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
          <input
            className="kb-search"
            placeholder="Search title, tag, or id…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Category</th>
              <th>Tag</th>
              <th>Views</th>
              <th>Rating</th>
              <th>Updated</th>
              <th>Author</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="mono text-mute" style={{ fontSize: 11 }}>
                    {a.id}
                  </div>
                  <Link to={`/knowledge/${a.id}`} style={{ fontWeight: 550 }}>
                    {a.title}
                  </Link>
                </td>
                <td>
                  <Pill kind={CAT_PILL[a.cat] ?? "neutral"} noDot>
                    {a.cat}
                  </Pill>
                </td>
                <td className="mono text-mute">#{a.tag}</td>
                <td className="mono">{a.views.toLocaleString("en-US")}</td>
                <td>
                  <span className="kb-rating">
                    <i className="fa-solid fa-star" /> {a.rating}
                  </span>
                </td>
                <td className="text-mute" style={{ fontSize: 12 }}>
                  {a.upd}
                </td>
                <td>
                  <UserById id={a.author} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-mute" style={{ padding: 18 }}>
                  No articles match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  .kb-toolbar{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}
  .kb-tabs{display:flex;gap:6px;flex-wrap:wrap}
  .kb-tab{display:inline-flex;align-items:center;padding:6px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);cursor:pointer;font:inherit;font-size:12px;color:var(--fg)}
  .kb-tab:hover{border-color:var(--accent)}
  .kb-tab.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}
  .kb-search{border:1px solid var(--border,#e2e8f0);border-radius:8px;padding:6px 12px;font:inherit;font-size:12px;min-width:220px;background:var(--bg,#fff);color:var(--fg)}
  .kb-search:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
  .kb-rating{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600}
  .kb-rating i{color:#f59e0b;font-size:11px}
`;
