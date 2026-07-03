import type { ComponentStatus, StatusComponent, StatusIncident, StatusPage } from "@/types";

export const STATUS_PAGES: readonly StatusPage[] = [
  {
    id: "sp-public",
    name: "FinSpot — Public Status",
    slug: "finspot-public",
    domain: "status.finspot.in",
    visibility: "public",
    tenant: "core-observability",
    description:
      "Customer-facing status page covering the FinSpot trading platform, APIs, payments, and authentication.",
    uptime90d: 0.9994,
    subscribers: { email: 4128, sms: 612, webhook: 38, rss: 184 },
    groups: [
      { id: "grp-customer", name: "Customer-facing platform" },
      { id: "grp-trading", name: "Trading services" },
      { id: "grp-payments", name: "Payments & billing" },
      { id: "grp-mobile", name: "Mobile & desktop apps" },
    ],
  },
  {
    id: "sp-partners",
    name: "FinSpot — Partner APIs",
    slug: "finspot-partners",
    domain: "partners.finspot.in/status",
    visibility: "public",
    tenant: "application-services",
    description: "Public status for partner-facing APIs, webhook delivery, and OAuth services.",
    uptime90d: 0.9988,
    subscribers: { email: 412, sms: 28, webhook: 96, rss: 41 },
    groups: [
      { id: "grp-api", name: "Partner APIs" },
      { id: "grp-webhooks", name: "Webhook delivery" },
      { id: "grp-oauth", name: "OAuth & SSO" },
    ],
  },
  {
    id: "sp-internal",
    name: "Internal Operations",
    slug: "internal-ops",
    domain: "ops.finspot.internal",
    visibility: "private",
    tenant: "core-observability",
    description:
      "Private status page for SRE, security, and infrastructure teams. Visible to staff only.",
    uptime90d: 0.9961,
    subscribers: { email: 142, sms: 12, webhook: 8, rss: 0 },
    groups: [
      { id: "grp-infra", name: "Infrastructure" },
      { id: "grp-internal", name: "Internal tools" },
      { id: "grp-security", name: "Security platform" },
    ],
  },
];

export const STATUS_COMPONENTS: readonly StatusComponent[] = [
  // Public · Customer-facing
  {
    id: "cmp-web",
    groupId: "grp-customer",
    name: "Web application",
    description: "finspot.in customer-facing app",
    status: "operational",
    uptime90d: 0.9998,
    service: "edge",
  },
  {
    id: "cmp-api-core",
    groupId: "grp-customer",
    name: "Core API",
    description: "REST + GraphQL endpoints",
    status: "degraded",
    uptime90d: 0.9974,
    service: "checkout-api",
  },
  {
    id: "cmp-auth",
    groupId: "grp-customer",
    name: "Authentication",
    description: "Login, SSO, session refresh",
    status: "operational",
    uptime90d: 0.9999,
    service: "auth-svc",
  },
  {
    id: "cmp-search",
    groupId: "grp-customer",
    name: "Search",
    description: "Symbol & news search",
    status: "operational",
    uptime90d: 0.9996,
  },
  // Public · Trading
  {
    id: "cmp-orders",
    groupId: "grp-trading",
    name: "Order execution",
    description: "Order routing & matching",
    status: "operational",
    uptime90d: 0.9997,
  },
  {
    id: "cmp-market",
    groupId: "grp-trading",
    name: "Market data feed",
    description: "Real-time prices & quotes",
    status: "operational",
    uptime90d: 0.9999,
  },
  {
    id: "cmp-portfolio",
    groupId: "grp-trading",
    name: "Portfolio service",
    description: "Positions, history, P&L",
    status: "operational",
    uptime90d: 0.9995,
  },
  // Public · Payments
  {
    id: "cmp-deposit",
    groupId: "grp-payments",
    name: "Deposits",
    description: "ACH, UPI, card deposits",
    status: "partial-outage",
    uptime90d: 0.9912,
    service: "payments-primary",
  },
  {
    id: "cmp-withdraw",
    groupId: "grp-payments",
    name: "Withdrawals",
    description: "Bank transfers out",
    status: "operational",
    uptime90d: 0.9988,
  },
  {
    id: "cmp-stripe",
    groupId: "grp-payments",
    name: "Stripe integration",
    description: "Card processor",
    status: "degraded",
    uptime90d: 0.9942,
  },
  // Public · Mobile
  {
    id: "cmp-ios",
    groupId: "grp-mobile",
    name: "iOS app",
    description: "App Store build · v4.18.2",
    status: "operational",
    uptime90d: 1.0,
  },
  {
    id: "cmp-android",
    groupId: "grp-mobile",
    name: "Android app",
    description: "Play Store build · v4.18.0",
    status: "operational",
    uptime90d: 1.0,
  },
  {
    id: "cmp-desktop",
    groupId: "grp-mobile",
    name: "Desktop",
    description: "Tauri build · v3.2.0",
    status: "operational",
    uptime90d: 0.9998,
  },

  // Partner APIs
  {
    id: "cmp-api-pub",
    groupId: "grp-api",
    name: "Public API v2",
    description: "Public partner endpoints",
    status: "operational",
    uptime90d: 0.9991,
  },
  {
    id: "cmp-api-priv",
    groupId: "grp-api",
    name: "Private partner API",
    description: "Authenticated partner endpoints",
    status: "operational",
    uptime90d: 0.9994,
  },
  {
    id: "cmp-rate",
    groupId: "grp-api",
    name: "Rate limiting",
    description: "Edge rate limit service",
    status: "operational",
    uptime90d: 0.9999,
  },
  // Webhooks
  {
    id: "cmp-wh-send",
    groupId: "grp-webhooks",
    name: "Webhook delivery",
    description: "Outbound webhook fan-out",
    status: "operational",
    uptime90d: 0.9985,
  },
  {
    id: "cmp-wh-retry",
    groupId: "grp-webhooks",
    name: "Retry queue",
    description: "Failed delivery retries",
    status: "operational",
    uptime90d: 0.9978,
  },
  // OAuth
  {
    id: "cmp-oauth",
    groupId: "grp-oauth",
    name: "OAuth 2.0 service",
    description: "Token issue & refresh",
    status: "operational",
    uptime90d: 0.9997,
    service: "auth-svc",
  },
  {
    id: "cmp-saml",
    groupId: "grp-oauth",
    name: "SAML SSO",
    description: "Enterprise SSO",
    status: "operational",
    uptime90d: 0.9994,
  },

  // Internal · Infra
  {
    id: "cmp-k8s",
    groupId: "grp-infra",
    name: "Kubernetes clusters",
    description: "8 clusters across prod-east/west",
    status: "major-outage",
    uptime90d: 0.9821,
    service: "k8s-control",
  },
  {
    id: "cmp-prom",
    groupId: "grp-infra",
    name: "Prometheus",
    description: "Metrics scraping",
    status: "operational",
    uptime90d: 0.9996,
  },
  {
    id: "cmp-loki",
    groupId: "grp-infra",
    name: "Loki logs",
    description: "Log ingestion (2.8B/day)",
    status: "operational",
    uptime90d: 0.9999,
  },
  {
    id: "cmp-otel",
    groupId: "grp-infra",
    name: "OpenTelemetry",
    description: "Trace ingestion",
    status: "operational",
    uptime90d: 0.9988,
  },
  // Internal · Tools
  {
    id: "cmp-jenkins",
    groupId: "grp-internal",
    name: "Jenkins CI",
    description: "Build & deploy pipelines",
    status: "operational",
    uptime90d: 0.9982,
  },
  {
    id: "cmp-grafana",
    groupId: "grp-internal",
    name: "Grafana",
    description: "Dashboards & alerting",
    status: "maintenance",
    uptime90d: 0.9971,
  },
  {
    id: "cmp-vault",
    groupId: "grp-internal",
    name: "HashiCorp Vault",
    description: "Secrets management",
    status: "operational",
    uptime90d: 0.9998,
  },
  // Internal · Security
  {
    id: "cmp-okta",
    groupId: "grp-security",
    name: "Okta IdP",
    description: "Identity provider",
    status: "operational",
    uptime90d: 0.9994,
  },
  {
    id: "cmp-edr",
    groupId: "grp-security",
    name: "CrowdStrike EDR",
    description: "Endpoint detection",
    status: "operational",
    uptime90d: 0.9991,
  },
];

export const STATUS_INCIDENTS: readonly StatusIncident[] = [
  {
    id: "spi-2026-05-26-01",
    pageId: "sp-public",
    title: "Elevated card-deposit failures",
    impact: "major",
    stage: "monitoring",
    componentIds: ["cmp-deposit", "cmp-stripe"],
    startedAt: "2026-05-26T08:14:00+05:30",
    updates: [
      {
        id: "u1",
        at: "2026-05-26T08:14:00+05:30",
        stage: "investigating",
        message: "We're investigating elevated failures on card-based deposits via Stripe.",
      },
      {
        id: "u2",
        at: "2026-05-26T08:42:00+05:30",
        stage: "identified",
        message:
          "Identified — Stripe webhook delivery is degraded upstream. Card deposits queued for retry.",
      },
      {
        id: "u3",
        at: "2026-05-26T09:18:00+05:30",
        stage: "monitoring",
        message:
          "Stripe has restored webhook delivery. Queued deposits are draining. Monitoring for residual failures.",
      },
    ],
  },
  {
    id: "spi-2026-05-26-02",
    pageId: "sp-internal",
    title: "Kubernetes control plane unreachable — prod-west",
    impact: "critical",
    stage: "identified",
    componentIds: ["cmp-k8s"],
    startedAt: "2026-05-26T10:42:00+05:30",
    updates: [
      {
        id: "u1",
        at: "2026-05-26T10:42:00+05:30",
        stage: "investigating",
        message: "kube-apiserver on prod-west cluster is timing out. Deployments paused.",
      },
      {
        id: "u2",
        at: "2026-05-26T10:58:00+05:30",
        stage: "identified",
        message:
          "etcd leader election storm caused by network partition in us-west-2a. Repair in progress.",
      },
    ],
  },
  {
    id: "spi-2026-05-26-03",
    pageId: "sp-public",
    title: "Slower API responses on /v2/orders",
    impact: "minor",
    stage: "resolved",
    componentIds: ["cmp-api-core"],
    startedAt: "2026-05-26T05:30:00+05:30",
    resolvedAt: "2026-05-26T06:12:00+05:30",
    updates: [
      {
        id: "u1",
        at: "2026-05-26T05:30:00+05:30",
        stage: "investigating",
        message: "Investigating elevated p95 latency on order endpoints.",
      },
      {
        id: "u2",
        at: "2026-05-26T05:58:00+05:30",
        stage: "monitoring",
        message: "Auto-scaled checkout-api 12 → 24 replicas. Latency recovering.",
      },
      {
        id: "u3",
        at: "2026-05-26T06:12:00+05:30",
        stage: "resolved",
        message: "Latency back to baseline. Will follow up with a problem record.",
      },
    ],
  },
  {
    id: "spi-2026-05-25-01",
    pageId: "sp-internal",
    title: "Scheduled: Grafana 11.0 upgrade",
    impact: "none",
    stage: "monitoring",
    componentIds: ["cmp-grafana"],
    startedAt: "2026-05-25T02:00:00+05:30",
    updates: [
      {
        id: "u1",
        at: "2026-05-25T02:00:00+05:30",
        stage: "investigating",
        message: "Scheduled maintenance window opened for Grafana upgrade to 11.0.",
      },
      {
        id: "u2",
        at: "2026-05-25T02:48:00+05:30",
        stage: "monitoring",
        message: "Upgrade complete. Validating dashboards and alert rules.",
      },
    ],
  },
  {
    id: "spi-2026-05-23-01",
    pageId: "sp-public",
    title: "Mobile push notifications delayed",
    impact: "minor",
    stage: "resolved",
    componentIds: ["cmp-ios", "cmp-android"],
    startedAt: "2026-05-23T14:18:00+05:30",
    resolvedAt: "2026-05-23T15:02:00+05:30",
    updates: [
      {
        id: "u1",
        at: "2026-05-23T14:18:00+05:30",
        stage: "investigating",
        message: "Push notification delivery is delayed by ~6 minutes.",
      },
      {
        id: "u2",
        at: "2026-05-23T15:02:00+05:30",
        stage: "resolved",
        message: "FCM upstream recovered. Backlog cleared.",
      },
    ],
  },
];

// ── Selectors ───────────────────────────────────────────────────────────────

export const componentsForPage = (pageId: string): StatusComponent[] => {
  const page = STATUS_PAGES.find((p) => p.id === pageId);
  if (!page) return [];
  const groupIds = new Set(page.groups.map((g) => g.id));
  return STATUS_COMPONENTS.filter((c) => groupIds.has(c.groupId));
};

export const incidentsForPage = (pageId: string): StatusIncident[] =>
  STATUS_INCIDENTS.filter((i) => i.pageId === pageId).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

/**
 * Roll-up status for a status page: the worst component status wins, plus
 * a friendly label and tone for the header banner.
 */
export function rollUpStatus(pageId: string): {
  status: ComponentStatus;
  label: string;
  tone: "ok" | "warn" | "crit";
} {
  const components = componentsForPage(pageId);
  const order: ComponentStatus[] = [
    "major-outage",
    "partial-outage",
    "degraded",
    "maintenance",
    "operational",
  ];
  const worst = order.find((s) => components.some((c) => c.status === s)) ?? "operational";

  if (worst === "operational")
    return { status: worst, label: "All systems operational", tone: "ok" };
  if (worst === "maintenance")
    return { status: worst, label: "Scheduled maintenance", tone: "warn" };
  if (worst === "degraded") return { status: worst, label: "Some systems degraded", tone: "warn" };
  if (worst === "partial-outage")
    return { status: worst, label: "Partial system outage", tone: "warn" };
  return { status: worst, label: "Major system outage", tone: "crit" };
}
