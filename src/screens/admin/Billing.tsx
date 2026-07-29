import { Link } from "react-router-dom";
import { Avatar, Pill } from "@/components";
import { TENANTS } from "@/data";
import type { PillKind } from "@/components";

const PLAN_PILL: Record<string, PillKind> = {
  Enterprise: "purple",
  Business: "info",
  Growth: "teal",
};

const PLAN_FEATURES: Record<string, string> = {
  Enterprise: "Unlimited assets · 13-mo retention · 24×7 support · SSO + SCIM",
  Business: "5k assets · 6-mo retention · business-hours support · SSO",
  Growth: "1k assets · 3-mo retention · community support",
};

// Recent invoices — settled via the org's payment profile (card on file is
// tokenised with the payment provider; only the last 4 digits surface here).
const INVOICES = [
  { id: "INV-2607", period: "Jun 2026", amount: 122_900, state: "Paid", issued: "Jul 1" },
  { id: "INV-2606", period: "May 2026", amount: 121_400, state: "Paid", issued: "Jun 1" },
  { id: "INV-2605", period: "Apr 2026", amount: 118_700, state: "Paid", issued: "May 1" },
  { id: "INV-2604", period: "Mar 2026", amount: 114_200, state: "Paid", issued: "Apr 1" },
] as const;

const fmt = (n: number) => n.toLocaleString("en-US");

export function AdminBillingScreen() {
  const mrr = TENANTS.reduce((a, t) => a + t.spend, 0);

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <a className="sn-link">Super-admin</a>
        <span className="sn-bc-sep">›</span>
        <span>Billing & plans</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">ADMIN-BILL</span>
          <Pill kind="success">Account in good standing</Pill>
          <Pill kind="neutral" noDot>
            Billed monthly · USD
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Billing &amp; plans</h1>
          <div className="sn-form-sub">
            ${fmt(mrr)}/mo across {TENANTS.length} tenants · usage-based overages reconciled on the
            1st · card on file ending 4412
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/admin/usage" className="sn-btn">
            <i className="fa-solid fa-gauge-high" /> Usage detail
          </Link>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-file-invoice" /> Download invoices
          </button>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-arrow-up-right-dots" /> Change plan
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="MRR" value={`$${fmt(mrr)}`} sub="all tenants" tone="ok" />
        <Kpi
          label="Last invoice"
          value={`$${fmt(INVOICES[0].amount)}`}
          sub={INVOICES[0].period}
          tone="neutral"
        />
        <Kpi label="Outstanding" value="$0" sub="nothing due" tone="ok" />
        <Kpi
          label="Enterprise"
          value={TENANTS.filter((t) => t.plan === "Enterprise").length}
          sub="tenants on top tier"
          tone="neutral"
        />
        <Kpi label="Next renewal" value="Aug 1" sub="auto-renews" tone="neutral" />
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-credit-card" />
          <span className="sn-section-title">Plans by tenant</span>
        </div>
        <div className="bil-grid">
          {TENANTS.map((t) => (
            <div key={t.id} className="bil-card">
              <div className="bil-head">
                <Avatar name={t.name} color={t.color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                  <div className="mono text-mute" style={{ fontSize: 11 }}>
                    {t.users} seats
                  </div>
                </div>
                <Pill kind={PLAN_PILL[t.plan] ?? "neutral"} noDot>
                  {t.plan}
                </Pill>
              </div>
              <div className="bil-feat">{PLAN_FEATURES[t.plan]}</div>
              <div className="bil-foot">
                <span className="bil-amount">${fmt(t.spend)}</span>
                <span className="text-mute" style={{ fontSize: 11 }}>
                  /month
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-file-invoice" />
          <span className="sn-section-title">Invoice history</span>
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Period</th>
              <th>Issued</th>
              <th>Amount</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv) => (
              <tr key={inv.id}>
                <td className="mono" style={{ fontWeight: 600 }}>
                  {inv.id}
                </td>
                <td>{inv.period}</td>
                <td className="text-mute">{inv.issued}</td>
                <td className="mono">${fmt(inv.amount)}</td>
                <td>
                  <Pill kind="success">{inv.state}</Pill>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button type="button" className="sn-btn" style={{ fontSize: 11.5 }}>
                    <i className="fa-solid fa-download" /> PDF
                  </button>
                </td>
              </tr>
            ))}
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
  .bil-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
  .bil-card{border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;background:var(--bg,#fff);display:flex;flex-direction:column;gap:10px}
  .bil-head{display:flex;align-items:center;gap:10px}
  .bil-feat{font-size:11.5px;color:var(--fg-subtle)}
  .bil-foot{display:flex;align-items:baseline;gap:4px;border-top:1px solid var(--border,#e2e8f0);padding-top:10px}
  .bil-amount{font-size:18px;font-weight:700}
`;
