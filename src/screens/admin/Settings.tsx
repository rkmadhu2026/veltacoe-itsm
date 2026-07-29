import { useState } from "react";
import { Link } from "react-router-dom";
import { Pill } from "@/components";
import { ORG } from "@/data/org";

interface Toggle {
  id: string;
  label: string;
  detail: string;
  on: boolean;
  locked?: boolean;
}

const SECURITY_TOGGLES: readonly Toggle[] = [
  {
    id: "mfa",
    label: "Enforce MFA for all members",
    detail: "TOTP or email OTP required at sign-in",
    on: true,
    locked: true,
  },
  {
    id: "sso-only",
    label: "SSO-only sign-in",
    detail: "Disable password login; Microsoft Entra is the identity source",
    on: true,
  },
  {
    id: "session-8h",
    label: "8-hour session timeout",
    detail: "Idle sessions are signed out and must re-authenticate",
    on: true,
  },
  {
    id: "ip-allow",
    label: "IP allow-list for super-admin",
    detail: "Admin routes only reachable from office + VPN ranges",
    on: false,
  },
];

const NOTIFY_TOGGLES: readonly Toggle[] = [
  {
    id: "sev1-all",
    label: "Broadcast Sev-1 to all tenant admins",
    detail: "In addition to the paging policy",
    on: true,
  },
  {
    id: "digest",
    label: "Daily digest email",
    detail: "07:30 IST summary to subscribed members",
    on: true,
  },
  {
    id: "maint-cal",
    label: "Sync maintenance windows to calendar",
    detail: "ICS feed per tenant",
    on: false,
  },
];

const RETENTION = [
  { signal: "Metrics (Prometheus/Thanos)", hot: "30d", cold: "13 months" },
  { signal: "Logs (Loki)", hot: "14d", cold: "6 months" },
  { signal: "Traces (Tempo)", hot: "7d", cold: "30 days" },
  { signal: "Audit trail", hot: "—", cold: "7 years · immutable" },
] as const;

export function SettingsScreen() {
  const [sec, setSec] = useState<Record<string, boolean>>(
    Object.fromEntries(SECURITY_TOGGLES.map((t) => [t.id, t.on])),
  );
  const [ntf, setNtf] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFY_TOGGLES.map((t) => [t.id, t.on])),
  );

  const renderToggles = (
    items: readonly Toggle[],
    state: Record<string, boolean>,
    set: (fn: (s: Record<string, boolean>) => Record<string, boolean>) => void,
  ) =>
    items.map((t) => (
      <label key={t.id} className={`set-toggle ${t.locked ? "locked" : ""}`}>
        <input
          type="checkbox"
          checked={state[t.id]}
          disabled={t.locked}
          onChange={() => set((s) => ({ ...s, [t.id]: !s[t.id] }))}
        />
        <span className="set-toggle-body">
          <span className="set-toggle-label">
            {t.label}
            {t.locked && (
              <Pill kind="neutral" noDot>
                Org policy
              </Pill>
            )}
          </span>
          <span className="set-toggle-detail">{t.detail}</span>
        </span>
      </label>
    ));

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>Settings</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">ORG-SETTINGS</span>
          <Pill kind="success">All policies compliant</Pill>
          <Pill kind="neutral" noDot>
            Changes audited · admin only
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Settings</h1>
          <div className="sn-form-sub">
            Organization defaults for {ORG.name} · security posture, notification defaults, and data
            retention · secrets are Vault references, never stored here
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/users" className="sn-btn">
            <i className="fa-solid fa-user-gear" /> People &amp; roles
          </Link>
          <Link to="/profile" className="sn-btn">
            <i className="fa-solid fa-id-badge" /> My profile
          </Link>
        </div>
      </div>

      <div className="set-grid">
        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-building" />
            <span className="sn-section-title">General</span>
          </div>
          <div className="set-facts">
            <div>
              <span className="set-fact-l">Organization</span>
              <span style={{ fontWeight: 600 }}>{ORG.name}</span>
            </div>
            <div>
              <span className="set-fact-l">Primary region</span>
              <span>ap-south-1 (Mumbai)</span>
            </div>
            <div>
              <span className="set-fact-l">Default timezone</span>
              <span>Asia/Kolkata (IST)</span>
            </div>
            <div>
              <span className="set-fact-l">Currency</span>
              <span>USD</span>
            </div>
            <div>
              <span className="set-fact-l">Identity provider</span>
              <span>Microsoft Entra ID · SCIM on</span>
            </div>
            <div>
              <span className="set-fact-l">Secrets backend</span>
              <span className="mono">vault://kv/linkedeye/*</span>
            </div>
          </div>
        </div>

        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-shield-halved" />
            <span className="sn-section-title">Security</span>
          </div>
          <div className="set-toggles">{renderToggles(SECURITY_TOGGLES, sec, setSec)}</div>
        </div>

        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-bell" />
            <span className="sn-section-title">Notification defaults</span>
          </div>
          <div className="set-toggles">{renderToggles(NOTIFY_TOGGLES, ntf, setNtf)}</div>
        </div>

        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-database" />
            <span className="sn-section-title">Data retention</span>
          </div>
          <table className="sn-table">
            <thead>
              <tr>
                <th>Signal</th>
                <th>Hot storage</th>
                <th>Long-term</th>
              </tr>
            </thead>
            <tbody>
              {RETENTION.map((r) => (
                <tr key={r.signal}>
                  <td style={{ fontWeight: 550 }}>{r.signal}</td>
                  <td className="mono">{r.hot}</td>
                  <td className="mono">{r.cold}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-mute" style={{ fontSize: 11.5, marginTop: 10 }}>
            Retention follows each tenant's plan; extending it is a billed change handled through
            the catalog.
          </div>
        </div>
      </div>
    </div>
  );
}

const STYLES = `
  .set-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:18px;align-items:start}
  .set-facts{display:flex;flex-direction:column;gap:8px}
  .set-facts>div{display:flex;justify-content:space-between;gap:12px;font-size:12.5px;border-bottom:1px dashed var(--border,#e2e8f0);padding-bottom:8px}
  .set-facts>div:last-child{border-bottom:none}
  .set-fact-l{color:var(--fg-subtle)}
  .set-toggles{display:flex;flex-direction:column;gap:8px}
  .set-toggle{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:1px solid var(--border,#e2e8f0);border-radius:10px;background:var(--bg,#fff);cursor:pointer}
  .set-toggle.locked{cursor:default;opacity:.85}
  .set-toggle input{accent-color:var(--accent);margin-top:2px}
  .set-toggle-body{display:flex;flex-direction:column;gap:2px}
  .set-toggle-label{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600}
  .set-toggle-detail{font-size:11.5px;color:var(--fg-subtle)}
`;
