import type { TimelineEvent } from "@/types";

// JSX-bearing data lives in a .tsx file. Kept separate so plain .ts data
// modules don't have to opt into JSX syntax.
export const TIMELINE_EVENTS: readonly TimelineEvent[] = [
  {
    t: "14:32:08",
    type: "critical",
    body: (
      <>
        PagerDuty escalation triggered — <b>Sev 1</b> declared automatically by alert rule{" "}
        <code>stripe_timeout_rate &gt; 5%</code>
      </>
    ),
    meta: ["Alert rule", "auto"],
  },
  {
    t: "14:32:14",
    type: "ai",
    body: (
      <>
        <b>VeltaCore ITSM AI</b> correlated 3 related signals: increased DB CPU on{" "}
        <code>payments-primary</code>, GC pauses on <code>checkout-api</code>, and inbound rate
        limit on Stripe webhook. Likely root cause: <b>connection pool exhaustion</b>.
      </>
    ),
    meta: ["Confidence 87%", "2 runbooks suggested"],
  },
  {
    t: "14:32:30",
    type: "info",
    body: (
      <>
        Priya Raghunathan joined as <b>Incident Commander</b>
      </>
    ),
    meta: ["SRE Platform"],
  },
  {
    t: "14:34:02",
    type: "info",
    body: <>Bridge opened in #inc-48291-war-room · Zoom bridge auto-provisioned</>,
    meta: ["Slack", "Zoom"],
  },
  {
    t: "14:35:47",
    type: "warn",
    body: (
      <>
        Auto-scaled <code>checkout-api</code> from 12 → 24 replicas via runbook{" "}
        <i>pool-expansion-v3</i>
      </>
    ),
    meta: ["runbook", "Kubernetes"],
  },
  {
    t: "14:38:15",
    type: "info",
    body: <>Status page updated: "Investigating elevated payment failures"</>,
    meta: ["statuspage.io", "public"],
  },
  {
    t: "14:41:09",
    type: "success",
    body: (
      <>
        p95 latency on <code>checkout-api</code> dropped from 8.4s → 420ms
      </>
    ),
    meta: ["Datadog metric"],
  },
  {
    t: "14:42:50",
    type: "ai",
    body: (
      <>
        <b>VeltaCore ITSM AI</b> recommends creating a problem record to track the underlying
        pool-sizing regression.
      </>
    ),
    meta: ["Suggestion"],
  },
];
