import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Pill } from "@/components";
import { USERS } from "@/data";

// The signed-in user across the shell (Header/Sidebar) is u1.
const ME = USERS[0];

interface Session {
  id: string;
  device: string;
  icon: string;
  location: string;
  ip: string;
  lastActive: string;
  current?: boolean;
}

const INITIAL_SESSIONS: readonly Session[] = [
  {
    id: "s1",
    device: "Chrome · macOS 15",
    icon: "fa-desktop",
    location: "Chennai, IN",
    ip: "10.24.8.101",
    lastActive: "now",
    current: true,
  },
  {
    id: "s2",
    device: "LinkedEye iOS app",
    icon: "fa-mobile-screen",
    location: "Chennai, IN",
    ip: "10.24.9.44",
    lastActive: "38m ago",
  },
  {
    id: "s3",
    device: "Firefox · Windows 11 (NOC bay 2)",
    icon: "fa-desktop",
    location: "Mumbai, IN",
    ip: "10.31.2.17",
    lastActive: "3h ago",
  },
  {
    id: "s4",
    device: "Edge · Windows 11",
    icon: "fa-desktop",
    location: "Mumbai, IN",
    ip: "10.31.4.90",
    lastActive: "6d ago",
  },
];

const MFA_METHODS = [
  {
    id: "totp",
    name: "Google Authenticator",
    icon: "fa-qrcode",
    detail: "TOTP · enrolled Mar 2026",
    state: "Primary",
    kind: "success" as const,
  },
  {
    id: "otp",
    name: "Email OTP",
    icon: "fa-envelope",
    detail: `Fallback · ${ME.email}`,
    state: "Enabled",
    kind: "info" as const,
  },
  {
    id: "recovery",
    name: "Recovery codes",
    icon: "fa-key",
    detail: "8 of 10 unused",
    state: "Generated",
    kind: "neutral" as const,
  },
];

// Personal access tokens are stored as Vault references only — the platform
// never persists or displays raw secrets.
const API_TOKENS = [
  {
    id: "tok-cli",
    name: "linkedeye-cli",
    vaultRef: "vault://kv/users/u1/tokens/cli",
    scopes: "read:metrics · read:alerts",
    lastUsed: "2h ago",
    expires: "in 41d",
  },
  {
    id: "tok-grafana",
    name: "grafana-import",
    vaultRef: "vault://kv/users/u1/tokens/grafana",
    scopes: "read:dashboards",
    lastUsed: "12d ago",
    expires: "in 9d",
  },
];

const PREFS = [
  { id: "page-sev1", label: "Page me for Sev-1 on my services", on: true },
  { id: "email-digest", label: "Daily NOC digest email (07:30 IST)", on: true },
  { id: "slack-mentions", label: "Slack DM on incident mentions", on: true },
  { id: "maint-notify", label: "Notify before maintenance windows I own", on: false },
];

export function ProfileScreen() {
  const [sessions, setSessions] = useState<readonly Session[]>(INITIAL_SESSIONS);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFS.map((p) => [p.id, p.on])),
  );

  const revoke = (id: string) => setSessions((s) => s.filter((x) => x.id !== id));

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>My profile</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">PROFILE</span>
          <Pill kind="success">MFA enforced</Pill>
          <Pill kind="neutral" noDot>
            SSO · Microsoft Entra
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>My profile</h1>
          <div className="sn-form-sub">
            Account security, sessions, and notification preferences · secrets live in Vault, never
            in the platform database
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/on-call" className="sn-btn">
            <i className="fa-solid fa-clock-rotate-left" /> My on-call
          </Link>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-key" /> Change password
          </button>
        </div>
      </div>

      <div className="pro-grid">
        {/* Identity card */}
        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-id-badge" />
            <span className="sn-section-title">Identity</span>
          </div>
          <div className="pro-id">
            <Avatar name={ME.name} color={ME.color} size="lg" />
            <div>
              <div className="pro-name">{ME.name}</div>
              <div className="pro-mail mono">{ME.email}</div>
              <div className="pro-pills">
                <Pill kind="purple" noDot>
                  {ME.role}
                </Pill>
                <Pill kind="teal" noDot>
                  {ME.team}
                </Pill>
                <Pill kind="success">online</Pill>
              </div>
            </div>
          </div>
          <div className="pro-facts">
            <div>
              <span className="pro-fact-l">Employee id</span>
              <span className="mono">FS-0412</span>
            </div>
            <div>
              <span className="pro-fact-l">Timezone</span>
              <span>Asia/Kolkata (IST)</span>
            </div>
            <div>
              <span className="pro-fact-l">Default tenant</span>
              <span>Core Observability</span>
            </div>
            <div>
              <span className="pro-fact-l">On-call rotation</span>
              <Link to="/on-call">SRE Platform · primary this week</Link>
            </div>
            <div>
              <span className="pro-fact-l">Identity provider</span>
              <span>Microsoft Entra ID (SSO)</span>
            </div>
            <div>
              <span className="pro-fact-l">Password</span>
              <span>Managed by SSO · rotated 18d ago</span>
            </div>
          </div>
        </div>

        {/* Security / MFA */}
        <div className="sn-form-section">
          <div className="sn-section-header">
            <i className="fa-solid fa-shield-halved" />
            <span className="sn-section-title">Multi-factor authentication</span>
          </div>
          <div className="pro-mfa-list">
            {MFA_METHODS.map((m) => (
              <div key={m.id} className="pro-mfa">
                <span className="pro-mfa-icon">
                  <i className={`fa-solid ${m.icon}`} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pro-mfa-name">{m.name}</div>
                  <div className="pro-mfa-detail">{m.detail}</div>
                </div>
                <Pill kind={m.kind} noDot>
                  {m.state}
                </Pill>
              </div>
            ))}
          </div>
          <div className="text-mute" style={{ fontSize: 11.5, marginTop: 10 }}>
            MFA is enforced org-wide. Re-enrolling the authenticator invalidates existing recovery
            codes.
          </div>

          <div className="sn-section-header" style={{ marginTop: 18 }}>
            <i className="fa-solid fa-code" />
            <span className="sn-section-title">API tokens</span>
          </div>
          <div className="pro-tokens">
            {API_TOKENS.map((t) => (
              <div key={t.id} className="pro-token">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pro-mfa-name mono">{t.name}</div>
                  <div className="pro-mfa-detail mono">{t.vaultRef}</div>
                  <div className="pro-mfa-detail">
                    {t.scopes} · last used {t.lastUsed} · expires {t.expires}
                  </div>
                </div>
                <button type="button" className="sn-btn" style={{ fontSize: 11.5 }}>
                  Rotate
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-laptop" />
          <span className="sn-section-title">Active sessions · {sessions.length}</span>
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Location</th>
              <th>IP</th>
              <th>Last active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>
                  <span className="pro-dev">
                    <i className={`fa-solid ${s.icon}`} /> {s.device}
                    {s.current && (
                      <Pill kind="success" noDot>
                        This device
                      </Pill>
                    )}
                  </span>
                </td>
                <td>{s.location}</td>
                <td className="mono text-mute">{s.ip}</td>
                <td className="text-mute">{s.lastActive}</td>
                <td style={{ textAlign: "right" }}>
                  {!s.current && (
                    <button
                      type="button"
                      className="sn-btn pro-revoke"
                      onClick={() => revoke(s.id)}
                    >
                      <i className="fa-solid fa-right-from-bracket" /> Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notification preferences */}
      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-bell" />
          <span className="sn-section-title">Notification preferences</span>
        </div>
        <div className="pro-prefs">
          {PREFS.map((p) => (
            <label key={p.id} className="pro-pref">
              <input
                type="checkbox"
                checked={prefs[p.id]}
                onChange={() => setPrefs((x) => ({ ...x, [p.id]: !x[p.id] }))}
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

const STYLES = `
  .pro-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:18px;align-items:start}
  @media (max-width:1100px){.pro-grid{grid-template-columns:1fr}}
  .pro-id{display:flex;gap:14px;align-items:center;margin-bottom:14px}
  .pro-name{font-size:16px;font-weight:650}
  .pro-mail{font-size:12px;color:var(--fg-subtle)}
  .pro-pills{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}
  .pro-facts{display:flex;flex-direction:column;gap:8px}
  .pro-facts>div{display:flex;justify-content:space-between;gap:12px;font-size:12.5px;border-bottom:1px dashed var(--border,#e2e8f0);padding-bottom:8px}
  .pro-facts>div:last-child{border-bottom:none}
  .pro-fact-l{color:var(--fg-subtle)}
  .pro-mfa-list,.pro-tokens{display:flex;flex-direction:column;gap:8px}
  .pro-mfa,.pro-token{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--border,#e2e8f0);border-radius:10px;background:var(--bg,#fff)}
  .pro-mfa-icon{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;background:var(--bg-muted,#f8fafc);font-size:13px}
  .pro-mfa-name{font-size:12.5px;font-weight:600}
  .pro-mfa-detail{font-size:11.5px;color:var(--fg-subtle);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .pro-dev{display:inline-flex;align-items:center;gap:8px;font-size:12.5px}
  .pro-revoke{font-size:11.5px}
  .pro-prefs{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:10px}
  .pro-pref{display:flex;align-items:center;gap:10px;font-size:12.5px;padding:10px 12px;border:1px solid var(--border,#e2e8f0);border-radius:10px;background:var(--bg,#fff);cursor:pointer}
  .pro-pref input{accent-color:var(--accent)}
`;
