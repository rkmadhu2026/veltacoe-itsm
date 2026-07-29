// Cross-module selectors that wire an incident to the on-call schedule
// responsible for it and to the status page component representing its
// impacted service. These live in the data layer (not the screen) so any
// surface — incident detail, dashboard, alert listing — can reuse them.

import type { Incident, Schedule, StatusComponent, StatusPage } from "@/types";
import { SCHEDULES, whoIsOnCall } from "./on-call";
import { STATUS_COMPONENTS, STATUS_PAGES } from "./status-pages";

// Tenant → ordered list of schedule IDs (primary first). Hand-rolled because
// our 5 tenants and 5 schedules don't share a foreign key — schedules are
// owned by teams, tenants subscribe to those teams.
const TENANT_SCHEDULES: Record<string, readonly string[]> = {
  "core-observability": ["sched-sre-primary", "sched-sre-secondary", "sched-database"],
  "application-services": ["sched-sre-primary", "sched-sre-secondary"],
  "observability-center": ["sched-sre-primary"],
  "risk-ops": ["sched-security"],
  "platform-labs": ["sched-sre-primary"],
  "colo-network": ["sched-network", "sched-sre-primary"],
};

export interface IncidentOnCallEntry {
  schedule: Schedule;
  userId: string;
  layer: number;
  overridden: boolean;
}

/**
 * Resolve the on-call responders for an incident. Returns the schedules
 * that cover the incident's tenant, plus the user currently on call for
 * each, ordered with the most specific (primary) schedule first.
 */
export function onCallForIncident(
  incident: Incident,
  now: Date = new Date(),
): IncidentOnCallEntry[] {
  const scheduleIds = TENANT_SCHEDULES[incident.tenant] ?? [];
  const entries: IncidentOnCallEntry[] = [];
  for (const sid of scheduleIds) {
    const schedule = SCHEDULES.find((s) => s.id === sid);
    if (!schedule) continue;
    const current = whoIsOnCall(sid, now);
    if (!current) continue;
    entries.push({
      schedule,
      userId: current.userId,
      layer: current.layer,
      overridden: current.overridden,
    });
  }
  return entries;
}

export interface IncidentStatusPageLink {
  page: StatusPage;
  component: StatusComponent;
}

/**
 * Find the public-facing status page component that represents the
 * incident's impacted service, if one exists. Returns the matching page
 * + component so the UI can offer "publish to status page" inline.
 */
export function statusPageLinkForIncident(incident: Incident): IncidentStatusPageLink | null {
  const component = STATUS_COMPONENTS.find((c) => c.service === incident.service);
  if (!component) return null;
  const page = STATUS_PAGES.find((p) => p.groups.some((g) => g.id === component.groupId));
  if (!page) return null;
  return { page, component };
}
