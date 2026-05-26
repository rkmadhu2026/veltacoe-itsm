// Sidebar navigation definition.
// Path-based now (replaces the legacy string-state route IDs).

export type BadgeKind = "critical" | "warning" | "info" | "neutral";

export interface NavBadge {
  n: string | number;
  kind: BadgeKind;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  to: string;
  kbd?: string;
  badge?: NavBadge;
  hidden?: boolean;
  /** Routes that should also light this entry as active. */
  matchPrefix?: string;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const NAV: readonly NavSection[] = [
  {
    section: "Operate",
    items: [
      { id: "dashboard",        label: "Dashboard",        icon: "fa-chart-pie",              to: "/dashboard", kbd: "G D" },
      { id: "incidents",        label: "Incidents",        icon: "fa-triangle-exclamation",   to: "/incidents", kbd: "G I", matchPrefix: "/incidents", badge: { n: 4, kind: "critical" } },
      { id: "on-call",          label: "On-call",          icon: "fa-clock-rotate-left",       to: "/on-call",   matchPrefix: "/on-call" },
      { id: "problems",         label: "Problems",         icon: "fa-magnifying-glass-chart", to: "/problems",  matchPrefix: "/problems", badge: { n: 12, kind: "warning" } },
      { id: "changes",          label: "Changes",          icon: "fa-code-branch",            to: "/changes",   matchPrefix: "/changes",  badge: { n: 7,  kind: "info" } },
      { id: "cross-tenant",     label: "Cross-tenant",     icon: "fa-grip-vertical",          to: "/cross-tenant" },
    ],
  },
  {
    section: "Service",
    items: [
      { id: "services",  label: "Services",        icon: "fa-diagram-project", to: "/services" },
      { id: "catalog",   label: "Service catalog", icon: "fa-bag-shopping",    to: "/catalog", matchPrefix: "/catalog" },
      { id: "knowledge", label: "Knowledge base",  icon: "fa-book-open",       to: "/knowledge", matchPrefix: "/knowledge" },
      { id: "cmdb",      label: "CMDB · CIs",      icon: "fa-sitemap",         to: "/cmdb" },
      { id: "slas",      label: "SLA definitions", icon: "fa-stopwatch",       to: "/slas" },
      { id: "status-pages", label: "Status pages", icon: "fa-signal",         to: "/status-pages", matchPrefix: "/status-pages" },
      { id: "runbooks",  label: "Runbooks",        icon: "fa-book",            to: "/runbooks", badge: { n: 184, kind: "neutral" } },
    ],
  },
  {
    section: "Observe",
    items: [
      { id: "apm",        label: "APM & traces",    icon: "fa-gauge-high",  to: "/apm" },
      { id: "logs",       label: "Logs",            icon: "fa-list-ul",     to: "/logs",   badge: { n: "2.8B", kind: "neutral" } },
      { id: "alerts",     label: "Alert conditions", icon: "fa-bell",       to: "/alerts" },
      { id: "entity-map", label: "Entity map",      icon: "fa-circle-nodes", to: "/entity-map" },
    ],
  },
  {
    section: "Infrastructure",
    items: [
      { id: "infra",           label: "Overview",         icon: "fa-server",            to: "/infra" },
      { id: "infra-assets",    label: "Asset inventory",  icon: "fa-boxes-stacked",     to: "/infra/assets", matchPrefix: "/infra/assets", badge: { n: 1599, kind: "neutral" } },
      { id: "infra-topology",  label: "Network topology", icon: "fa-circle-nodes",      to: "/infra/topology" },
      { id: "infra-vms",       label: "Virtual machines", icon: "fa-cube",              to: "/infra/vms" },
      { id: "infra-rack",      label: "Datacenter rack",  icon: "fa-server",            to: "/infra/rack" },
      { id: "infra-exporters", label: "Exporters",        icon: "fa-tower-broadcast",   to: "/infra/exporters" },
    ],
  },
  {
    section: "Build",
    items: [
      { id: "flow",         label: "Flow Designer", icon: "fa-diagram-project", to: "/flow" },
      { id: "reports",      label: "Reports",       icon: "fa-chart-column",    to: "/reports" },
      { id: "integrations", label: "Integrations",  icon: "fa-plug",            to: "/integrations", matchPrefix: "/integrations" },
    ],
  },
  {
    section: "Admin",
    items: [
      { id: "admin-tenants", label: "Tenants",        icon: "fa-building",    to: "/admin/tenants" },
      { id: "admin-billing", label: "Billing & plans", icon: "fa-credit-card", to: "/admin/billing" },
      { id: "admin-usage",   label: "Usage & quotas", icon: "fa-gauge-high",  to: "/admin/usage" },
      { id: "users",         label: "People & roles", icon: "fa-user-gear",   to: "/users" },
      { id: "settings",      label: "Settings",       icon: "fa-sliders",     to: "/settings" },
    ],
  },
];
