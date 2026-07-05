import { ORG } from "@/data/org";
import type { Tenant } from "@/types";

export interface Crumb {
  label: string;
  to?: string;
}

// Lightweight breadcrumb resolution. Matches by path prefix, falls back to
// the tenant base crumbs when no specific page matches.
export function crumbsFor(pathname: string, tenant: Tenant): Crumb[] {
  const base: Crumb[] = [{ label: ORG.name }, { label: tenant.name }];

  // /incidents/INC-48291 (or /new)
  if (pathname.startsWith("/incidents/")) {
    const id = pathname.split("/")[2];
    const last = id === "new" ? "New incident" : id;
    return [...base, { label: "Incidents", to: "/incidents" }, { label: last }];
  }
  if (pathname === "/incidents") return [...base, { label: "Incidents" }];

  if (pathname.startsWith("/problems/")) {
    const id = pathname.split("/")[2];
    const last = id === "new" ? "New problem" : id;
    return [...base, { label: "Problems", to: "/problems" }, { label: last }];
  }
  if (pathname === "/problems") return [...base, { label: "Problem management" }];

  if (pathname.startsWith("/changes/")) {
    const id = pathname.split("/")[2];
    return [...base, { label: "Changes", to: "/changes" }, { label: id }];
  }
  if (pathname === "/changes") return [...base, { label: "Change management" }];

  if (pathname === "/catalog/request") {
    return [...base, { label: "Service catalog", to: "/catalog" }, { label: "New request" }];
  }
  if (pathname === "/catalog") return [...base, { label: "Service catalog" }];

  if (pathname.startsWith("/knowledge/")) {
    const id = pathname.split("/")[2];
    return [...base, { label: "Knowledge base", to: "/knowledge" }, { label: id }];
  }
  if (pathname === "/knowledge") return [...base, { label: "Knowledge base" }];

  if (pathname.startsWith("/integrations/")) {
    const name = decodeURIComponent(pathname.split("/")[2] ?? "");
    return [...base, { label: "Integrations", to: "/integrations" }, { label: name }];
  }
  if (pathname === "/integrations") return [...base, { label: "Integrations" }];

  if (pathname.startsWith("/infra/device/")) {
    const id = pathname.split("/")[3];
    return [
      ...base,
      { label: "Infrastructure", to: "/infra" },
      { label: "Asset inventory", to: "/infra/assets" },
      { label: id ?? "Device" },
    ];
  }
  if (pathname === "/infra/assets")
    return [...base, { label: "Infrastructure", to: "/infra" }, { label: "Asset inventory" }];
  if (pathname === "/infra/topology")
    return [...base, { label: "Infrastructure", to: "/infra" }, { label: "Topology" }];
  if (pathname === "/infra/vms")
    return [...base, { label: "Infrastructure", to: "/infra" }, { label: "Virtual machines" }];
  if (pathname === "/infra/rack")
    return [...base, { label: "Infrastructure", to: "/infra" }, { label: "Datacenter rack" }];
  if (pathname === "/infra/exporters")
    return [...base, { label: "Infrastructure", to: "/infra" }, { label: "Exporters" }];
  if (pathname === "/infra") return [...base, { label: "Infrastructure" }];

  if (pathname.startsWith("/admin/")) {
    const last = pathname.split("/")[2];
    const labels: Record<string, string> = {
      tenants: "Tenants",
      billing: "Billing & plans",
      usage: "Usage & quotas",
    };
    return [{ label: ORG.name }, { label: "Super-admin" }, { label: labels[last] ?? last }];
  }

  if (pathname === "/cross-tenant") return [{ label: ORG.name }, { label: "Cross-tenant view" }];
  if (pathname === "/onboarding") return [{ label: ORG.name }, { label: "Onboarding" }];

  const simple: Record<string, string> = {
    "/dashboard": "Operations Dashboard",
    "/on-call": "On-call schedules",
    "/trading-ops": "Trading operations",
    "/status-pages": "Status pages",
    "/services": "Services",
    "/runbooks": "Runbooks",
    "/cmdb": "CMDB",
    "/slas": "SLA definitions",
    "/automation": "Automation control plane",
    "/flow": "Flow Designer",
    "/reports": "Reports & analytics",
    "/apm": "APM & traces",
    "/logs": "Logs",
    "/alerts": "Alerts",
    "/entity-map": "Entity map",
    "/users": "People & roles",
    "/settings": "Settings",
  };
  if (simple[pathname]) return [...base, { label: simple[pathname] }];

  return base;
}
