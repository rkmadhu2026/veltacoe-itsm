import type { EscalationPolicy, OnCallOverride, Schedule, Shift } from "@/types";

// Weekday helpers — keep index-based math out of the screen file.
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const SCHEDULES: readonly Schedule[] = [
  {
    id: "sched-sre-primary",
    name: "SRE-Tier-1 · Primary",
    team: "SRE Platform",
    tenant: "core-observability",
    timezone: "Asia/Kolkata",
    description: "First-responder rotation for all Sev-1 and Sev-2 alerts on tier-1 services.",
    rotationLength: "1 week",
  },
  {
    id: "sched-sre-secondary",
    name: "SRE-Tier-1 · Secondary",
    team: "SRE Platform",
    tenant: "core-observability",
    timezone: "Asia/Kolkata",
    description: "Backup on the primary rotation. Paged if primary doesn't ack within 5 min.",
    rotationLength: "1 week",
  },
  {
    id: "sched-database",
    name: "Database on-call",
    team: "Database",
    tenant: "core-observability",
    timezone: "Asia/Kolkata",
    description: "Oracle, Postgres, and warehouse rotation. Follows the sun.",
    rotationLength: "2 weeks",
  },
  {
    id: "sched-network",
    name: "Network on-call",
    team: "Networking",
    tenant: "colo-network",
    timezone: "Asia/Kolkata",
    description: "Firewalls, switches, BGP, edge load balancers across 5 DCs.",
    rotationLength: "1 week",
  },
  {
    id: "sched-security",
    name: "Security on-call",
    team: "Security",
    tenant: "risk-ops",
    timezone: "Asia/Kolkata",
    description: "EDR, IAM, certificate, and audit incidents.",
    rotationLength: "1 week",
  },
];

// One week of shifts per schedule. startDay/endDay = 0..6 (Mon..Sun).
// Times in 24h. Two layers per schedule modelling business-hours + after-hours.
export const SHIFTS: readonly Shift[] = [
  // SRE primary — Priya weekdays, Devon weekend
  {
    scheduleId: "sched-sre-primary",
    layer: 1,
    userId: "u1",
    startDay: 0,
    endDay: 4,
    startTime: "09:00",
    endTime: "21:00",
  },
  {
    scheduleId: "sched-sre-primary",
    layer: 2,
    userId: "u5",
    startDay: 0,
    endDay: 4,
    startTime: "21:00",
    endTime: "09:00",
  },
  {
    scheduleId: "sched-sre-primary",
    layer: 1,
    userId: "u5",
    startDay: 5,
    endDay: 6,
    startTime: "00:00",
    endTime: "23:59",
  },

  // SRE secondary — Marcus weekdays
  {
    scheduleId: "sched-sre-secondary",
    layer: 1,
    userId: "u2",
    startDay: 0,
    endDay: 4,
    startTime: "00:00",
    endTime: "23:59",
  },
  {
    scheduleId: "sched-sre-secondary",
    layer: 1,
    userId: "u8",
    startDay: 5,
    endDay: 6,
    startTime: "00:00",
    endTime: "23:59",
  },

  // Database — Elena
  {
    scheduleId: "sched-database",
    layer: 1,
    userId: "u4",
    startDay: 0,
    endDay: 6,
    startTime: "00:00",
    endTime: "23:59",
  },

  // Network — Yuki
  {
    scheduleId: "sched-network",
    layer: 1,
    userId: "u3",
    startDay: 0,
    endDay: 6,
    startTime: "00:00",
    endTime: "23:59",
  },

  // Security — Jamal
  {
    scheduleId: "sched-security",
    layer: 1,
    userId: "u7",
    startDay: 0,
    endDay: 6,
    startTime: "00:00",
    endTime: "23:59",
  },
];

export const ESCALATION_POLICIES: readonly EscalationPolicy[] = [
  {
    id: "esc-sev1-sre",
    name: "Sev-1 SRE escalation",
    scheduleId: "sched-sre-primary",
    description: "Critical alerts on tier-1 services. Wakes everyone if it has to.",
    repeat: 2,
    steps: [
      {
        step: 1,
        afterMinutes: 0,
        target: { kind: "schedule", scheduleId: "sched-sre-primary" },
        channels: ["push", "sms", "voice", "slack"],
      },
      {
        step: 2,
        afterMinutes: 5,
        target: { kind: "schedule", scheduleId: "sched-sre-secondary" },
        channels: ["push", "sms", "voice"],
      },
      {
        step: 3,
        afterMinutes: 10,
        target: { kind: "user", userId: "u5" },
        channels: ["voice", "sms"],
      },
      {
        step: 4,
        afterMinutes: 15,
        target: { kind: "team", team: "Platform" },
        channels: ["slack", "email"],
      },
    ],
  },
  {
    id: "esc-database",
    name: "Database escalation",
    scheduleId: "sched-database",
    description: "Oracle / Postgres / warehouse outages.",
    repeat: 1,
    steps: [
      {
        step: 1,
        afterMinutes: 0,
        target: { kind: "schedule", scheduleId: "sched-database" },
        channels: ["push", "sms", "slack"],
      },
      {
        step: 2,
        afterMinutes: 8,
        target: { kind: "schedule", scheduleId: "sched-sre-primary" },
        channels: ["push", "slack"],
      },
      {
        step: 3,
        afterMinutes: 15,
        target: { kind: "user", userId: "u5" },
        channels: ["sms", "voice"],
      },
    ],
  },
  {
    id: "esc-network",
    name: "Network escalation",
    scheduleId: "sched-network",
    description: "Firewall / switch / BGP failures.",
    repeat: 1,
    steps: [
      {
        step: 1,
        afterMinutes: 0,
        target: { kind: "schedule", scheduleId: "sched-network" },
        channels: ["push", "sms"],
      },
      {
        step: 2,
        afterMinutes: 10,
        target: { kind: "schedule", scheduleId: "sched-sre-primary" },
        channels: ["slack", "push"],
      },
    ],
  },
  {
    id: "esc-security",
    name: "Security escalation",
    scheduleId: "sched-security",
    description: "EDR / IAM / cert / audit signals.",
    repeat: 0,
    steps: [
      {
        step: 1,
        afterMinutes: 0,
        target: { kind: "schedule", scheduleId: "sched-security" },
        channels: ["push", "sms", "voice"],
      },
      {
        step: 2,
        afterMinutes: 5,
        target: { kind: "team", team: "Security" },
        channels: ["slack", "email"],
      },
    ],
  },
];

export const ON_CALL_OVERRIDES: readonly OnCallOverride[] = [
  {
    id: "ovr-1",
    scheduleId: "sched-sre-primary",
    originalUserId: "u1",
    coveringUserId: "u8",
    start: "2026-05-27T09:00+05:30",
    end: "2026-05-29T21:00+05:30",
    reason: "Priya OOO — conference",
  },
  {
    id: "ovr-2",
    scheduleId: "sched-network",
    originalUserId: "u3",
    coveringUserId: "u2",
    start: "2026-05-26T18:00+05:30",
    end: "2026-05-27T09:00+05:30",
    reason: "Yuki at hospital — covered for the night",
  },
];

// ── Selectors ───────────────────────────────────────────────────────────────

/**
 * Resolve who is on call for a schedule right now, applying overrides.
 * `now` is injected for deterministic tests.
 */
export function whoIsOnCall(
  scheduleId: string,
  now: Date = new Date(),
): { userId: string; layer: number; overridden: boolean } | null {
  const dayIdx = (now.getDay() + 6) % 7; // JS Sunday=0 → Mon=0
  const hhmm = now.toTimeString().slice(0, 5);

  const matches = SHIFTS.filter(
    (s) =>
      s.scheduleId === scheduleId &&
      dayIdx >= s.startDay &&
      dayIdx <= s.endDay &&
      hhmm >= s.startTime &&
      (s.endTime === "23:59" ? true : hhmm < s.endTime),
  ).sort((a, b) => a.layer - b.layer);

  if (matches.length === 0) return null;
  const shift = matches[0];

  const override = ON_CALL_OVERRIDES.find(
    (o) =>
      o.scheduleId === scheduleId &&
      o.originalUserId === shift.userId &&
      new Date(o.start) <= now &&
      new Date(o.end) > now,
  );

  return {
    userId: override?.coveringUserId ?? shift.userId,
    layer: shift.layer,
    overridden: !!override,
  };
}
