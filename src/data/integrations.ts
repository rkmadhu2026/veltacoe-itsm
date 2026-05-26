import type { Integration } from "@/types";

export const INTEGRATIONS: readonly Integration[] = [
  // Observability
  { name: "Node Exporter",   icon: "fa-solid fa-microchip",         category: "Observability", connected: true,  meta: "Installed · 412 Linux hosts · /metrics" },
  { name: "Prometheus",      icon: "fa-solid fa-fire-flame-curved", category: "Observability", connected: true,  meta: "Auto-scraping Node Exporter · 18.6k/s" },
  { name: "Grafana",         icon: "fa-solid fa-chart-line",        category: "Observability", connected: true,  meta: "Auto-provisioned tenant dashboards" },
  { name: "Grafana Loki",    icon: "fa-solid fa-layer-group",       category: "Observability", connected: true,  meta: "Logs auto-ingested · 2.8B/day" },
  { name: "OpenTelemetry",   icon: "fa-solid fa-share-nodes",       category: "Observability", connected: true,  meta: "Traces · 412M spans/day" },
  { name: "Datadog",         icon: "fa-solid fa-dog",               category: "Observability", connected: true,  meta: "Bidirectional sync" },
  { name: "New Relic",       icon: "fa-solid fa-square",            category: "Observability", connected: false, meta: "NRQL & APM bridge" },
  { name: "Dynatrace",       icon: "fa-solid fa-circle-dot",        category: "Observability", connected: false, meta: "Smartscape topology" },
  { name: "Elastic / ELK",   icon: "fa-solid fa-magnifying-glass",  category: "Observability", connected: true,  meta: "Search backend" },
  { name: "Splunk",          icon: "fa-solid fa-database",          category: "Observability", connected: false, meta: "Log forwarder available" },
  // On-call
  { name: "PagerDuty",                   icon: "fa-solid fa-bell",           category: "On-call",  connected: true,  meta: "3 services · 8 schedules" },
  { name: "Opsgenie",                    icon: "fa-solid fa-headset",        category: "On-call",  connected: false, meta: "Atlassian on-call" },
  { name: "VictorOps / Splunk On-Call",  icon: "fa-solid fa-walkie-talkie",  category: "On-call",  connected: false, meta: "Routing rules" },
  { name: "Notify",                      icon: "fa-solid fa-paper-plane",    category: "On-call",  connected: true,  meta: "SMS + voice fallback" },
  { name: "Twilio",                      icon: "fa-solid fa-phone",          category: "On-call",  connected: true,  meta: "SMS / voice provider" },
  // Automation
  { name: "StackStorm",       icon: "fa-solid fa-bolt",            category: "Automation", connected: true,  meta: "Event-driven workflows" },
  { name: "Rundeck",          icon: "fa-solid fa-rocket",          category: "Automation", connected: false, meta: "Job scheduler" },
  { name: "Ansible Tower",    icon: "fa-solid fa-tower-broadcast", category: "Automation", connected: true,  meta: "Config management" },
  { name: "Terraform Cloud",  icon: "fa-solid fa-cube",            category: "Automation", connected: true,  meta: "Infra as code" },
  { name: "Jenkins",          icon: "fa-brands fa-jenkins",        category: "Automation", connected: true,  meta: "CI/CD pipelines" },
  { name: "GitHub Actions",   icon: "fa-brands fa-github",         category: "Automation", connected: true,  meta: "Deploy events" },
  // ITSM
  { name: "ServiceNow",          icon: "fa-solid fa-building",  category: "ITSM", connected: true,  meta: "Bi-di incident sync" },
  { name: "Jira Service Mgmt",   icon: "fa-brands fa-jira",     category: "ITSM", connected: true,  meta: "Tickets · changes" },
  { name: "BMC Remedy",          icon: "fa-solid fa-life-ring", category: "ITSM", connected: false, meta: "Legacy ITSM bridge" },
  { name: "Freshservice",        icon: "fa-solid fa-headset",   category: "ITSM", connected: false, meta: "SaaS service desk" },
  // Comms
  { name: "Slack",              icon: "fa-brands fa-slack",     category: "Comms", connected: true,  meta: "5 channels · slash cmds" },
  { name: "Microsoft Teams",    icon: "fa-brands fa-microsoft", category: "Comms", connected: true,  meta: "War-room bridge" },
  { name: "Zoom",               icon: "fa-solid fa-video",      category: "Comms", connected: true,  meta: "Auto-create bridge" },
  { name: "Webex",              icon: "fa-solid fa-comments",   category: "Comms", connected: false, meta: "Cisco Webex bridge" },
  { name: "Discord",            icon: "fa-brands fa-discord",   category: "Comms", connected: false, meta: "Community alerts" },
  { name: "Email (SMTP)",       icon: "fa-solid fa-envelope",   category: "Comms", connected: true,  meta: "Outbound only" },
  // SCM
  { name: "GitHub",     icon: "fa-brands fa-github",    category: "SCM", connected: true,  meta: "Repo events · PRs" },
  { name: "GitLab",     icon: "fa-brands fa-gitlab",    category: "SCM", connected: false, meta: "Self-hosted available" },
  { name: "Bitbucket",  icon: "fa-brands fa-bitbucket", category: "SCM", connected: false, meta: "Atlassian repos" },
  // Cloud
  { name: "AWS",          icon: "fa-brands fa-aws",         category: "Cloud", connected: true,  meta: "CloudWatch · 12 accounts" },
  { name: "Azure",        icon: "fa-brands fa-microsoft",   category: "Cloud", connected: false, meta: "Monitor + Resource Graph" },
  { name: "GCP",          icon: "fa-brands fa-google",      category: "Cloud", connected: false, meta: "Cloud Monitoring" },
  { name: "Kubernetes",   icon: "fa-solid fa-dharmachakra", category: "Cloud", connected: true,  meta: "8 clusters · 2,156 pods" },
  // Identity
  { name: "Okta",                icon: "fa-solid fa-key",          category: "Identity", connected: true,  meta: "SAML · SCIM" },
  { name: "Azure AD",            icon: "fa-brands fa-windows",     category: "Identity", connected: false, meta: "Entra ID SSO" },
  { name: "1Password",           icon: "fa-solid fa-lock",         category: "Identity", connected: false, meta: "Secrets vault" },
  { name: "HashiCorp Vault",     icon: "fa-solid fa-vault",        category: "Identity", connected: true,  meta: "Secrets · PKI" },
  { name: "CrowdStrike",         icon: "fa-solid fa-shield-virus", category: "Identity", connected: false, meta: "EDR signal feed" },
  // Business
  { name: "Salesforce",  icon: "fa-solid fa-cloud",    category: "Business", connected: false, meta: "Customer impact link" },
  { name: "HubSpot",     icon: "fa-brands fa-hubspot", category: "Business", connected: false, meta: "Customer comms" },
  { name: "Statuspage",  icon: "fa-solid fa-signal",   category: "Business", connected: true,  meta: "Public + private pages" },
];
