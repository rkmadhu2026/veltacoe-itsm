import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Pill } from "@/components";
import { USERS } from "@/data";
import type { UserPresence, UserRole } from "@/types";
import type { PillKind } from "@/components";

const ROLE_PILL: Record<UserRole, PillKind> = {
  "Incident Commander": "critical",
  Admin: "purple",
  Manager: "info",
  Responder: "teal",
  Viewer: "neutral",
};

const PRESENCE_PILL: Record<UserPresence, PillKind> = {
  online: "success",
  away: "warning",
  offline: "neutral",
};

// RBAC matrix summary — enforced by Keycloak roles + OPA policies server-side.
const ROLE_DEFS: readonly { role: UserRole; icon: string; grants: string }[] = [
  {
    role: "Admin",
    icon: "fa-user-gear",
    grants: "Full platform config, tenants, integrations, automation approvals",
  },
  {
    role: "Incident Commander",
    icon: "fa-user-shield",
    grants: "Declare/close Sev-1, page anyone, approve guarded automation",
  },
  {
    role: "Manager",
    icon: "fa-user-tie",
    grants: "Reports, SLA administration, schedule overrides, catalog approvals",
  },
  {
    role: "Responder",
    icon: "fa-user-clock",
    grants: "Ack/resolve incidents, run safe automation, edit runbooks",
  },
  {
    role: "Viewer",
    icon: "fa-user",
    grants: "Read-only dashboards, reports, and status pages",
  },
];

export function PeopleScreen() {
  const [role, setRole] = useState<"all" | UserRole>("all");

  const rows = useMemo(
    () => (role === "all" ? USERS : USERS.filter((u) => u.role === role)),
    [role],
  );

  const online = USERS.filter((u) => u.status === "online").length;
  const admins = USERS.filter((u) => u.role === "Admin").length;

  return (
    <div className="page page-fade sn-dash">
      <style>{STYLES}</style>

      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>People &amp; roles</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">PEOPLE-RBAC</span>
          <Pill kind="success">{online} online</Pill>
          <Pill kind="neutral" noDot>
            Provisioned via Entra SCIM · roles in Keycloak
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>People &amp; roles</h1>
          <div className="sn-form-sub">
            {USERS.length} members shown · role changes require an Admin and are captured in the
            audit trail
          </div>
        </div>
        <div className="sn-form-actions">
          <Link to="/on-call" className="sn-btn">
            <i className="fa-solid fa-clock-rotate-left" /> On-call schedules
          </Link>
          <button type="button" className="sn-btn primary">
            <i className="fa-solid fa-user-plus" /> Invite member
          </button>
        </div>
      </div>

      <div className="sn-kpi-strip">
        <Kpi label="Members" value={USERS.length} sub="in this view" tone="neutral" />
        <Kpi label="Online" value={online} sub="active now" tone="ok" />
        <Kpi label="Admins" value={admins} sub="least-privilege target: 2" tone="neutral" />
        <Kpi label="Roles" value={ROLE_DEFS.length} sub="RBAC tiers" tone="neutral" />
        <Kpi label="Pending invites" value={0} sub="none outstanding" tone="ok" />
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-shield-halved" />
          <span className="sn-section-title">Role definitions</span>
        </div>
        <div className="ppl-roles">
          {ROLE_DEFS.map((r) => (
            <button
              key={r.role}
              type="button"
              className={`ppl-role ${role === r.role ? "active" : ""}`}
              onClick={() => setRole(role === r.role ? "all" : r.role)}
            >
              <span className="ppl-role-head">
                <i className={`fa-solid ${r.icon}`} />
                <b>{r.role}</b>
                <Pill kind={ROLE_PILL[r.role]} noDot>
                  {USERS.filter((u) => u.role === r.role).length}
                </Pill>
              </span>
              <span className="ppl-role-grants">{r.grants}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-users" />
          <span className="sn-section-title">Members{role !== "all" ? ` · ${role}` : ""}</span>
        </div>
        <table className="sn-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Team</th>
              <th>Presence</th>
              <th>Last active</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="ppl-member">
                    <Avatar name={u.name} color={u.color} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div className="mono text-mute" style={{ fontSize: 11 }}>
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <Pill kind={ROLE_PILL[u.role]} noDot>
                    {u.role}
                  </Pill>
                </td>
                <td>{u.team}</td>
                <td>
                  <Pill kind={PRESENCE_PILL[u.status]}>{u.status}</Pill>
                </td>
                <td className="mono text-mute">{u.last}</td>
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
  .ppl-roles{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
  .ppl-role{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border:1px solid var(--border,#e2e8f0);border-radius:10px;background:var(--bg,#fff);cursor:pointer;font:inherit;text-align:left;color:var(--fg)}
  .ppl-role:hover{border-color:var(--accent)}
  .ppl-role.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
  .ppl-role-head{display:flex;align-items:center;gap:8px;font-size:12.5px}
  .ppl-role-head i{color:var(--fg-subtle);font-size:12px}
  .ppl-role-grants{font-size:11px;color:var(--fg-subtle)}
  .ppl-member{display:flex;align-items:center;gap:10px}
`;
