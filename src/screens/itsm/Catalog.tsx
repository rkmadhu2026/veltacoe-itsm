import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill } from "@/components";
import { CATALOG_CATEGORIES, CATALOG_ITEMS } from "@/data";

export function CatalogScreen() {
  const [cat, setCat] = useState<"all" | string>("all");

  const items = useMemo(
    () => (cat === "all" ? CATALOG_ITEMS : CATALOG_ITEMS.filter((i) => i.cat === cat)),
    [cat],
  );

  const totalOfferings = CATALOG_CATEGORIES.reduce((a, c) => a + c.count, 0);
  const popular = CATALOG_ITEMS.filter((i) => i.popular).length;
  const catLabel = (id: string) => CATALOG_CATEGORIES.find((c) => c.id === id)?.label ?? id;

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>Service catalog</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">SVC-CAT</span>
          <Pill kind="neutral" noDot>
            Fulfilment SLAs enforced per item
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Service catalog</h1>
          <div className="sn-form-sub">
            {totalOfferings} offerings across {CATALOG_CATEGORIES.length} categories · showing the{" "}
            {CATALOG_ITEMS.length} most-requested items
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/catalog/request" className="sn-btn primary">
            <i className="fa-solid fa-plus" /> New request
          </Link>
        </div>
      </div>

      {/* Category grid */}
      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-bag-shopping" />
          <span className="sn-section-title">Browse by category</span>
        </div>
        <div className="cat-grid">
          <button
            type="button"
            className={`cat-card ${cat === "all" ? "active" : ""}`}
            onClick={() => setCat("all")}
          >
            <span className="cat-icon" style={{ background: "#64748b18", color: "#64748b" }}>
              <i className="fa-solid fa-grip" />
            </span>
            <span className="cat-label">All categories</span>
            <span className="cat-count">{totalOfferings} items</span>
          </button>
          {CATALOG_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`cat-card ${cat === c.id ? "active" : ""}`}
              onClick={() => setCat(c.id)}
            >
              <span className="cat-icon" style={{ background: `${c.color}18`, color: c.color }}>
                <i className={`fa-solid ${c.icon}`} />
              </span>
              <span className="cat-label">{c.label}</span>
              <span className="cat-count">{c.count} items</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-star" />
          <span className="sn-section-title">
            {cat === "all" ? `Most requested · ${popular} popular` : catLabel(cat)}
          </span>
        </div>
        <div className="item-grid">
          {items.map((i) => (
            <div key={i.id} className="item-card">
              <div className="item-head">
                <span className="item-title">{i.title}</span>
                {i.popular && (
                  <Pill kind="amber" noDot>
                    Popular
                  </Pill>
                )}
                {i.badge && (
                  <Pill kind="purple" noDot>
                    {i.badge}
                  </Pill>
                )}
              </div>
              <div className="item-desc">{i.desc}</div>
              <div className="item-meta">
                <span>
                  <i className="fa-solid fa-stopwatch" /> SLA {i.sla}
                </span>
                <span>
                  <i className="fa-solid fa-truck-fast" /> {i.eta}
                </span>
                <Pill kind="neutral" noDot>
                  {catLabel(i.cat)}
                </Pill>
              </div>
              <div className="item-foot">
                <Link to="/catalog/request" className="sn-btn" style={{ fontSize: 12 }}>
                  <i className="fa-solid fa-cart-shopping" /> Request
                </Link>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-mute" style={{ padding: 16, fontSize: 12.5 }}>
              No curated items in this category yet — {catLabel(cat)} offerings are requestable via
              the generic request form.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STYLES = `
  .cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}
  .cat-card{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:14px;border:1px solid var(--border,#e2e8f0);border-radius:10px;background:var(--bg,#fff);cursor:pointer;font:inherit;text-align:left;color:var(--fg)}
  .cat-card:hover{border-color:var(--accent)}
  .cat-card.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
  .cat-icon{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border-radius:9px;font-size:14px}
  .cat-label{font-size:12.5px;font-weight:600}
  .cat-count{font-size:11px;color:var(--fg-subtle)}
  .item-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
  .item-card{border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;background:var(--bg,#fff);display:flex;flex-direction:column;gap:8px}
  .item-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .item-title{font-size:13px;font-weight:600;flex:1;min-width:140px}
  .item-desc{font-size:12px;color:var(--fg-subtle)}
  .item-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:11.5px;color:var(--fg-subtle)}
  .item-meta i{margin-right:4px;font-size:10px}
  .item-foot{border-top:1px solid var(--border,#e2e8f0);padding-top:8px;display:flex;justify-content:flex-end}
`;
