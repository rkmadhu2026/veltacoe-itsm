// Shared domain types for VeltaCore ITSM.
// Naming: capitalized singular nouns; arrays typed as ReadonlyArray<T> at the data boundary.

export type AvatarColor = "amber" | "teal" | "pink" | "purple" | "slate" | "green";
export type ServiceStatus = "healthy" | "degraded" | "down";
export type Severity = 1 | 2 | 3 | 4;
export type IncidentStatus = "active" | "mitigating" | "investigating" | "open" | "resolved";

export interface Org {
  name: string;
  slug: string;
  plan: string;
  seatsUsed: number;
  seatsTotal: number;
  founder: string;
  contact: string;
  phone: string;
}

export interface Tenant {
  id: string;
  name: string;
  parent: string;
  code: string;
  color: AvatarColor;
  users: number;
  incidents: number;
  sev1: number;
  health: number;
  mttr: number;
  spend: number;
  plan: string;
}

export type UserRole = "Incident Commander" | "Admin" | "Responder" | "Manager" | "Viewer";
export type UserPresence = "online" | "away" | "offline";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: string;
  color: AvatarColor;
  status: UserPresence;
  last: string;
}

export interface Incident {
  id: string;
  sev: Severity;
  title: string;
  service: string;
  tenant: string;
  assignee: string | null;
  status: IncidentStatus;
  age: string;
  sla: number;
  sloBurn: number;
  impacted: string;
}

export type TimelineEventType = "critical" | "ai" | "info" | "warn" | "success";

export interface TimelineEvent {
  t: string;
  type: TimelineEventType;
  body: React.ReactNode;
  meta: string[];
}

export interface ChatMessage {
  u?: string;
  ai?: boolean;
  role?: string;
  time: string;
  text: string;
}

export interface ServiceEntry {
  name: string;
  status: ServiceStatus;
  uptime: number;
  p95: string;
  err: number;
  deps: number;
}

export type IntegrationCategory =
  | "Observability"
  | "On-call"
  | "Automation"
  | "ITSM"
  | "Comms"
  | "SCM"
  | "Cloud"
  | "Identity"
  | "Business";

export interface Integration {
  name: string;
  icon: string;
  category: IntegrationCategory;
  connected: boolean;
  meta: string;
}

// ---------- ITSM extended ----------

export type ProblemStatus = "Root cause analysis" | "Known error" | "Resolved" | "Assessment";

export interface Problem {
  id: string;
  title: string;
  status: ProblemStatus;
  priority: 1 | 2 | 3 | 4;
  assignee: string;
  linked: number;
  created: string;
  age: string;
  impact: string;
  kb: string | null;
}

export type ChangeType = "Emergency" | "Normal" | "Standard";
export type ChangeState =
  | "Draft"
  | "CAB review"
  | "Approved"
  | "Scheduled"
  | "Implementing"
  | "Completed"
  | "Failed";
export type ChangeRisk = "Low" | "Moderate" | "High";

export interface Change {
  id: string;
  title: string;
  type: ChangeType;
  state: ChangeState;
  risk: ChangeRisk;
  window: string;
  assignee: string;
  approvers: number;
  approved: number;
  tenant: string;
  service: string;
}

export interface CatalogCategory {
  id: string;
  label: string;
  icon: string;
  count: number;
  color: string;
}

export interface CatalogItem {
  id: string;
  cat: string;
  title: string;
  desc: string;
  sla: string;
  eta: string;
  popular?: boolean;
  badge?: string;
}

export interface CI {
  id: string;
  name: string;
  cls: string;
  env: string;
  region: string;
  owner: string | null;
  health: ServiceStatus;
  deps: number;
}

export interface Article {
  id: string;
  title: string;
  cat: string;
  views: number;
  upd: string;
  author: string;
  rating: number;
  tag: string;
}

export interface SLA {
  id: string;
  name: string;
  target: string;
  window: string;
  breach: number;
  compliance: number;
}

// ---------- Infrastructure ----------

export type Region = "APAC" | "EMEA" | "AMER";
export type DeviceStatus = "ok" | "warn" | "critical" | "down";
export type DeviceKindId =
  | "firewall"
  | "switch"
  | "router"
  | "loadbal"
  | "phys-srv"
  | "win-srv"
  | "linux-srv"
  | "vm"
  | "hypervisor"
  | "storage"
  | "ups"
  | "exporter";

export interface Site {
  id: string;
  name: string;
  region: Region;
  devices: number;
  health: number;
}

export interface DeviceKind {
  id: DeviceKindId;
  label: string;
  icon: string;
  color: string;
  iconBrand?: boolean;
}

export interface Device {
  id: string;
  kind: DeviceKindId;
  model: string;
  site: string;
  ip: string;
  os: string;
  uptime: string;
  cpu: number;
  mem: number;
  status: DeviceStatus;
  role: string;
  iface: string;
  throughput: string;
  sessions: string;
  lastSeen: string;
  agent: string;
}

export type NetLink = [string, string];

export type VMState = "running" | "stopped" | "suspended";

export interface VM {
  id: string;
  host: string;
  cluster: string;
  os: string;
  cpu: string;
  mem: string;
  disk: string;
  state: VMState;
  cpuUse: number;
  memUse: number;
  ip: string;
}

export type AlertSeverity = "critical" | "warn" | "info";

export interface InfraAlert {
  id: string;
  sev: AlertSeverity;
  device: string;
  site: string;
  title: string;
  detail: string;
  since: string;
  rule: string;
}

export interface Exporter {
  name: string;
  version: string;
  hosts: number;
  scrapes: string;
  lag: string;
  status: "ok" | "warn" | "down";
  sites: string[];
}

// ---------- On-call ----------

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type AlertChannel = "sms" | "voice" | "push" | "email" | "slack" | "teams";

export interface Schedule {
  id: string;
  name: string;
  team: string;
  tenant: string;
  timezone: string;
  description: string;
  /** ISO weekday letter, e.g. "Mon" */
  rotationLength: string;
}

export interface Shift {
  scheduleId: string;
  layer: number;
  userId: string;
  /** Day-of-week index 0–6, Mon=0 */
  startDay: number;
  endDay: number;
  /** 24h "HH:mm" */
  startTime: string;
  endTime: string;
}

export interface EscalationStep {
  step: number;
  /** Minutes after the previous step (or alert fire for step 1) */
  afterMinutes: number;
  /** Either an on-call schedule, a specific user, or a team. */
  target:
    | { kind: "schedule"; scheduleId: string }
    | { kind: "user"; userId: string }
    | { kind: "team"; team: string };
  channels: AlertChannel[];
}

export interface EscalationPolicy {
  id: string;
  name: string;
  scheduleId: string;
  description: string;
  steps: EscalationStep[];
  /** Repeat the policy this many times if no one acks */
  repeat: number;
}

export interface OnCallOverride {
  id: string;
  scheduleId: string;
  originalUserId: string;
  coveringUserId: string;
  /** ISO date strings */
  start: string;
  end: string;
  reason: string;
}

// ---------- Status pages ----------

export type ComponentStatus =
  | "operational"
  | "degraded"
  | "partial-outage"
  | "major-outage"
  | "maintenance";

export type StatusIncidentStage = "investigating" | "identified" | "monitoring" | "resolved";
export type StatusImpact = "none" | "minor" | "major" | "critical";
export type StatusPageVisibility = "public" | "private";

export interface StatusComponentGroup {
  id: string;
  name: string;
  description?: string;
}

export interface StatusComponent {
  id: string;
  groupId: string;
  name: string;
  description: string;
  status: ComponentStatus;
  /** 90-day uptime as a fraction 0–1 */
  uptime90d: number;
  /** Optional internal service link */
  service?: string;
}

export interface StatusIncidentUpdate {
  id: string;
  /** ISO timestamp */
  at: string;
  stage: StatusIncidentStage;
  message: string;
}

export interface StatusIncident {
  id: string;
  pageId: string;
  title: string;
  impact: StatusImpact;
  stage: StatusIncidentStage;
  /** Component IDs affected by this incident */
  componentIds: string[];
  startedAt: string;
  resolvedAt?: string;
  updates: StatusIncidentUpdate[];
}

export interface StatusSubscribers {
  email: number;
  sms: number;
  webhook: number;
  rss: number;
}

export interface StatusPage {
  id: string;
  name: string;
  slug: string;
  domain: string;
  visibility: StatusPageVisibility;
  tenant: string;
  description: string;
  groups: StatusComponentGroup[];
  subscribers: StatusSubscribers;
  /** Average uptime across all components, last 90 days */
  uptime90d: number;
}

// ---------- Tweaks (theme/UX state) ----------

export type Density = "compact" | "comfortable" | "spacious";
export type StylePreset = "graphite" | "porcelain" | "ink" | "neon";
export type InnovationLevel = "calm" | "elevated" | "bold";
export type SidebarStyle = "navy" | "white" | "graphite";
export type HeaderVariant = "command" | "compact";
export type IncidentLayout = "triage" | "split" | "stacked";

export interface Tweaks {
  accent: string;
  density: Density;
  dark: boolean;
  stylePreset: StylePreset;
  innovationLevel: InnovationLevel;
  sidebarStyle: SidebarStyle;
  headerVariant: HeaderVariant;
  incidentLayout: IncidentLayout;
  showSparklines: boolean;
  fontSize: number;
}

// ---------- Alerting (Alertmanager-style) ----------
// Prometheus alert rules evaluate to alert instances; Alertmanager groups,
// dedupes, inhibits, silences, and routes them to receivers. We model the
// whole pipeline so the Alerts module is a faithful control-plane view.

export type AlertLabelSeverity = "critical" | "warning" | "info";
export type AlertRuleState = "firing" | "pending" | "inactive";
export type AlertInstanceState =
  | "firing"
  | "pending"
  | "silenced"
  | "inhibited"
  | "resolved";

export interface AlertRule {
  id: string;
  /** `alertname` label. */
  name: string;
  /** Rule group the rule belongs to (Prometheus rule file group). */
  group: string;
  /** PromQL expression. */
  expr: string;
  /** `for:` clause — how long the condition must hold before firing. */
  forDuration: string;
  severity: AlertLabelSeverity;
  summary: string;
  runbook: string | null;
  state: AlertRuleState;
  /** Number of active instances currently produced by this rule. */
  firing: number;
}

export interface AlertInstance {
  id: string;
  ruleId: string;
  alertname: string;
  severity: AlertLabelSeverity;
  state: AlertInstanceState;
  /** Tenant id (must match a Tenant.id). */
  tenant: string;
  service: string;
  component: string;
  /** Host / device the alert fired on. */
  instance: string;
  site: string;
  ownerTeam: string;
  /** Relative time the alert started firing. */
  startsAt: string;
  /** Current sample value that tripped the rule. */
  value: string;
  summary: string;
  runbook: string | null;
  /** Alertmanager fingerprint — stable identity for dedup. */
  fingerprint: string;
  /** Id of the silence muting this instance, when silenced. */
  silencedBy?: string;
  /** Fingerprint of the alert inhibiting this one, when inhibited. */
  inhibitedBy?: string;
}

export type ReceiverKind =
  | "pagerduty"
  | "email"
  | "slack"
  | "teams"
  | "webhook"
  | "redmine";

export interface AlertReceiver {
  id: string;
  name: string;
  kind: ReceiverKind;
  /** Human-readable destination (channel, address, service key ref). */
  target: string;
  /** Vault reference for the secret — never the secret itself. */
  vaultRef: string | null;
  enabled: boolean;
}

export interface AlertRoute {
  id: string;
  /** Label matchers that steer an alert down this branch. */
  match: Record<string, string>;
  /** Receiver id. */
  receiver: string;
  groupBy: string[];
  groupWait: string;
  groupInterval: string;
  repeatInterval: string;
  /** Keep evaluating sibling routes after a match. */
  cont: boolean;
  children?: AlertRoute[];
}

export type SilenceStatus = "active" | "pending" | "expired";

export interface AlertSilence {
  id: string;
  matchers: string[];
  /** User id that created the silence. */
  createdBy: string;
  comment: string;
  startsAt: string;
  endsAt: string;
  status: SilenceStatus;
  /** Number of alert instances currently muted. */
  affected: number;
}

export interface InhibitionRule {
  id: string;
  sourceMatch: string;
  targetMatch: string;
  equal: string[];
  description: string;
}

export interface MaintenanceWindow {
  id: string;
  name: string;
  scope: string;
  startsAt: string;
  endsAt: string;
  status: "scheduled" | "active" | "ended";
  createdBy: string;
}

// A grouped bucket of alert instances, as Alertmanager would present them.
export interface AlertGroup {
  key: string;
  labels: Record<string, string>;
  receiver: string;
  /** Alert instance ids in the group. */
  members: string[];
}

// ---------- Device catalog / onboarding ----------
// Backend-driven catalog hierarchy: Category → Vendor → Family → Model →
// Firmware → Collector profile. The frontend never hard-codes models.

export type CatalogModelStatus =
  | "SUPPORTED"
  | "PARTIALLY_SUPPORTED"
  | "GENERIC_SNMP"
  | "DISCOVERED_UNVERIFIED"
  | "RETIRED"
  | "BLOCKED";

export type CollectorTransport =
  | "node_exporter"
  | "windows_exporter"
  | "snmp_v2c"
  | "snmp_v3"
  | "redfish"
  | "otel"
  | "blackbox"
  | "vendor_api"
  | "kube";

export type CollectorAuthKind =
  | "none"
  | "snmp_v2c"
  | "snmp_v3"
  | "redfish"
  | "winrm"
  | "ssh_key"
  | "bearer"
  | "otel";

export interface CollectorProfile {
  id: string;
  name: string;
  transport: CollectorTransport;
  authKind: CollectorAuthKind;
  /** Whether the profile requires a Vault-stored secret to poll. */
  requiresVault: boolean;
  /** Headline metric families this profile emits. */
  metrics: string[];
}

export interface CatalogVendor {
  id: string;
  name: string;
  /** Category ids this vendor ships devices for. */
  categories: string[];
  models: number;
}

export interface CatalogModel {
  id: string;
  vendor: string;
  family: string;
  model: string;
  /** Category id (maps to DeviceKindId where applicable). */
  category: string;
  firmware: string[];
  collectorProfile: string;
  status: CatalogModelStatus;
  capabilities: string[];
}

export interface CatalogCategoryDef {
  id: string;
  label: string;
  icon: string;
  group: "Network" | "Compute" | "Platform" | "Application" | "Facility";
}

export type Criticality = "platinum" | "gold" | "silver" | "bronze";

// ---------- Discovery + asset lifecycle ----------
// Asset lifecycle: discovered → pending_review → active → decommissioned.
// Auto-discovery NEVER auto-commits — candidates land in a human review queue.

export type AssetLifecycle =
  | "discovered"
  | "pending_review"
  | "active"
  | "decommissioned";

export type DiscoverySource = "snmp" | "vendor_api" | "lldp" | "cdp" | "agent" | "cidr_sweep";

export interface DiscoveryCandidate {
  id: string;
  ip: string;
  site: string;
  source: DiscoverySource;
  /** 0–1 confidence of the fingerprint match. */
  confidence: number;
  sysName: string;
  sysDescr: string;
  normalizedVendor: string;
  normalizedModel: string;
  serial: string;
  firmware: string;
  /** Matched catalog model id, or null when unrecognized. */
  matchedModel: string | null;
  suggestedProfile: string;
  status: CatalogModelStatus;
  discoveredAt: string;
}

export type AuditAction =
  | "onboard"
  | "update"
  | "approve"
  | "silence"
  | "decommission"
  | "discover"
  | "automation";

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: AuditAction;
  target: string;
  tenant: string;
  detail: string;
}
