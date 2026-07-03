import { NavLink, useLocation } from "react-router-dom";
import { Avatar, colorFor } from "@/components";
import { ORG } from "@/data/org";
import { useTenant } from "./TenantContext";
import { NAV } from "./nav";

interface SidebarProps {
  onOpenSwitcher: () => void;
}

export function Sidebar({ onOpenSwitcher }: SidebarProps) {
  const { tenant } = useTenant();
  const location = useLocation();
  return (
    <aside className="sidebar">
      <div className="sb-head">
        <div className="sb-logo">VC</div>
        <div className="sb-brand">
          <b>VeltaCore ITSM</b>
          <span>Enterprise Platform</span>
        </div>
      </div>

      <button
        type="button"
        className="tenant-switch"
        onClick={onOpenSwitcher}
        aria-label="Switch tenant"
      >
        <div className="t-icon" style={{ background: colorFor(tenant.color) }}>
          {tenant.code}
        </div>
        <div className="t-body">
          <div className="t-org">{ORG.name}</div>
          <div className="t-unit">
            <span className="t-unit-label">Unit:</span> {tenant.name}
          </div>
        </div>
        <i className="fa-solid fa-chevron-down" />
      </button>

      <nav className="sb-nav">
        {NAV.map((sec) => (
          <div key={sec.section} className="sb-section">
            <div className="sb-section-title">{sec.section}</div>
            {sec.items
              .filter((i) => !i.hidden)
              .map((i) => {
                const active = i.matchPrefix
                  ? location.pathname.startsWith(i.matchPrefix)
                  : location.pathname === i.to;
                return (
                  <NavLink key={i.id} to={i.to} className={`sb-item${active ? " active" : ""}`}>
                    <span className="sb-icon">
                      <i className={`fa-solid ${i.icon}`} />
                    </span>
                    <span className="sb-label">{i.label}</span>
                    {i.badge && <span className={`sb-badge ${i.badge.kind}`}>{i.badge.n}</span>}
                    {!i.badge && i.kbd && <kbd>{i.kbd}</kbd>}
                  </NavLink>
                );
              })}
          </div>
        ))}
      </nav>

      <div className="sb-foot">
        <div className="sb-env">
          <span className="env-dot" />
          <span>Production · us-east-1</span>
          <i className="fa-solid fa-bolt" />
        </div>
        <div className="sb-user">
          <Avatar name="Priya Raghunathan" color="amber" />
          <div className="sb-user-info">
            <b>Priya Raghunathan</b>
            <span>priya.r@finspot.in</span>
          </div>
          <i
            className="fa-solid fa-chevron-up"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}
          />
        </div>
      </div>
    </aside>
  );
}
