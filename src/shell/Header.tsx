import { Fragment } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "@/components";
import { INCIDENTS } from "@/data/incidents";
import { useTenant } from "./TenantContext";
import { crumbsFor } from "./breadcrumbs";

interface HeaderProps {
  onOpenCommand: () => void;
}

export function Header({ onOpenCommand }: HeaderProps) {
  const { tenant } = useTenant();
  const location = useLocation();
  const navigate = useNavigate();
  const crumbs = crumbsFor(location.pathname, tenant);
  const activeSev1 = INCIDENTS.filter((i) => i.sev === 1 && i.status === "active").length;

  return (
    <header className="header">
      <div className="hdr-crumbs">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          const Tag: React.ElementType = c.to && !isLast ? Link : "span";
          return (
            <Fragment key={i}>
              {i > 0 && <i className="fa-solid fa-chevron-right" />}
              <Tag
                {...(c.to && !isLast ? { to: c.to } : {})}
                className={`crumb${isLast ? " current" : ""}`}
              >
                {c.label}
              </Tag>
            </Fragment>
          );
        })}
      </div>

      <div className="hdr-command">
        <i className="fa-solid fa-magnifying-glass" />
        <input
          className="hdr-command-input"
          placeholder="Search incidents, services, runbooks, people…"
          onFocus={onOpenCommand}
          readOnly
        />
        <kbd>⌘K</kbd>
      </div>

      <div className="hdr-right">
        {activeSev1 > 0 && (
          <button
            type="button"
            className="hdr-incident-pill"
            onClick={() => navigate(`/incidents/${INCIDENTS.find((i) => i.sev === 1 && i.status === "active")?.id ?? ""}`)}
          >
            <span className="pulse-dot" />
            <span>{activeSev1} active Sev 1</span>
          </button>
        )}
        <div className="hdr-divider" />
        <button className="icon-btn" title="Create">
          <i className="fa-solid fa-plus" />
        </button>
        <button className="icon-btn" title="Automation">
          <i className="fa-solid fa-robot" />
        </button>
        <button className="icon-btn" title="Notifications">
          <i className="fa-solid fa-bell" />
          <span className="dot" />
        </button>
        <button className="icon-btn" title="Help">
          <i className="fa-solid fa-circle-question" />
        </button>
        <div className="hdr-divider" />
        <div className="hdr-user">
          <Avatar name="Priya Raghunathan" color="amber" />
          <div>
            <b>Priya</b>
            <span>IC · on-call</span>
          </div>
          <i className="fa-solid fa-chevron-down" />
        </div>
      </div>
    </header>
  );
}
