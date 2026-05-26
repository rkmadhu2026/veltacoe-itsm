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
