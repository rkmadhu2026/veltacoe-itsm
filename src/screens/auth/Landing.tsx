import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";

const MARQUEE = [
  "Incident command",
  "AI RCA",
  "CMDB graph",
  "Runbook automation",
  "SLA control",
  "Change risk",
  "Infra observability",
];

const TRUST_LOGOS = [
  "FINSPOT",
  "INFRA OPS",
  "NETWORK OPS",
  "APP LOGS",
  "STACKSTORM",
  "PROMETHEUS",
  "GRAFANA",
  "KEYCLOAK",
];

const SIGNAL_STEPS: ReadonlyArray<readonly [string, string, string]> = [
  ["fa-tower-broadcast", "Ingest", "Metrics · logs · traces"],
  ["fa-brain", "Correlate", "AI clusters impact"],
  ["fa-diagram-project", "Decide", "Blast radius + owner"],
  ["fa-bolt", "Act", "Runbook or rollback"],
];

const FEATURES: ReadonlyArray<{ ic: string; t: string; d: string; c: string }> = [
  {
    ic: "fa-fire",
    t: "Incident response",
    d: "War-rooms auto-provisioned. AI suggests runbooks. PagerDuty + Slack + Zoom in one click.",
    c: "#dc2626",
  },
  {
    ic: "fa-magnifying-glass-chart",
    t: "Problem management",
    d: "Recurring incidents auto-link to problem records. Five-whys generated from timelines.",
    c: "#f59e0b",
  },
  {
    ic: "fa-code-branch",
    t: "Change management",
    d: "CAB workflows, risk scoring, impact graphs from CMDB. Roll back any deploy with one click.",
    c: "#2563eb",
  },
  {
    ic: "fa-server",
    t: "On-prem infra",
    d: "Firewalls, switches, servers, VMs, exporters — discover, monitor, action — all from one pane.",
    c: "#475569",
  },
  {
    ic: "fa-sitemap",
    t: "Service mapping",
    d: "Auto-built dependency graph. Blast-radius and root-cause traversal in milliseconds.",
    c: "#8b5cf6",
  },
  {
    ic: "fa-bolt",
    t: "Flow Designer",
    d: "Drag-and-drop automation. Triggers, conditions, AI steps, runbook execution.",
    c: "#0891b2",
  },
];

const INTEGRATION_TILES: ReadonlyArray<readonly [string, string, string]> = [
  ["Prometheus", "fa-fire-flame-curved", "#dc2626"],
  ["Grafana", "fa-chart-line", "#f59e0b"],
  ["Loki", "fa-layer-group", "#0891b2"],
  ["OpenTelemetry", "fa-share-nodes", "#7c3aed"],
  ["Datadog", "fa-dog", "#643D8A"],
  ["New Relic", "fa-square", "#10b981"],
  ["PagerDuty", "fa-bell", "#06ac38"],
  ["Opsgenie", "fa-headset", "#2684ff"],
  ["StackStorm", "fa-bolt", "#8b5cf6"],
  ["Ansible", "fa-tower-broadcast", "#bb1c1c"],
  ["Terraform", "fa-cube", "#7c3aed"],
  ["ServiceNow", "fa-building", "#0891b2"],
  ["Jira", "fa-list-check", "#2563eb"],
  ["Slack", "fa-comments", "#4a154b"],
  ["Teams", "fa-users", "#6264a7"],
  ["AWS", "fa-cloud", "#ff9900"],
  ["Kubernetes", "fa-dharmachakra", "#326ce5"],
  ["Okta", "fa-key", "#016"],
];

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    per: "5 seats",
    features: ["3 integrations", "Basic alerting", "Slack notifications", "Community support"],
    cta: "Open platform",
    primary: false,
  },
  {
    name: "Business",
    price: "$12",
    per: "per seat / month",
    features: [
      "Unlimited integrations",
      "AI correlation",
      "Custom runbooks",
      "SSO + audit logs",
      "Email + chat support",
    ],
    cta: "Create workspace",
    primary: true,
    badge: "Most popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "annual contract",
    features: [
      "Multi-tenant + RBAC",
      "Dedicated CSM",
      "On-prem option",
      "FedRAMP / SOC2",
      "24/7 phone support",
    ],
    cta: "Talk to sales",
    primary: false,
  },
] as const;

const FAQS: ReadonlyArray<readonly [string, string]> = [
  [
    "How fast can we connect data?",
    "Most teams connect alerting, logs, traces, cloud, and Slack in the first hour. VeltaCore ITSM starts correlating incidents as soon as events arrive.",
  ],
  [
    "Can it replace our current ITSM?",
    "Yes. Incidents, problems, changes, services, CMDB, knowledge, SLAs, runbooks, roles, billing, and tenant controls are already routed in the product.",
  ],
  [
    "Does AI take action by default?",
    "AI recommends root cause, owners, risk, and runbooks first. You decide which automation steps can execute automatically per service and tenant.",
  ],
  [
    "Will it work for on-prem systems?",
    "Yes. The platform models datacenter racks, virtual machines, exporters, topology, networks, and hybrid cloud services in the same operational graph.",
  ],
];

const FOOTER_COLS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ["Product", ["Incidents", "Problems", "Changes", "CMDB", "Service Catalog"]],
  ["Platform", ["Multi-tenant", "Integrations", "API", "Mobile", "Security"]],
  ["Resources", ["Docs", "Status page", "Changelog", "Roadmap", "Community"]],
  ["Company", ["About", "Customers", "Careers", "Press", "Contact"]],
];

export function LandingScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const enter = () => {
    login();
    navigate("/dashboard");
  };

  return (
    <div className="landing editorial-landing">
      <nav className="lp-nav">
        <div className="lp-logo">
          <div className="lp-logo-mark">VC</div>
          <span>VeltaCore ITSM</span>
        </div>
        <div className="lp-nav-links">
          <a href="#platform">Platform</a>
          <a href="#solutions">Solutions</a>
          <a href="#integrations">Integrations</a>
          <a href="#pricing">Pricing</a>
          <a href="#customers">Customers</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="lp-nav-cta">
          <button type="button" className="lp-btn ghost" onClick={() => navigate("/login")}>
            Sign in
          </button>
          <button type="button" className="lp-btn primary" onClick={() => navigate("/signup")}>
            Create workspace
          </button>
        </div>
      </nav>

      <header className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-left">
            <span className="lp-eyebrow">
              <span className="lp-eyebrow-dot" /> New · AI-led RCA in 14 seconds
            </span>
            <h1 className="lp-editorial-title">
              <span>Incidents controlled.</span>
              <span>
                <em>Services stable.</em>
              </span>
              <span>Teams aligned.</span>
            </h1>
            <p className="lp-sub">
              Detect, triage, respond, and learn in one pane across infrastructure, network devices,
              application logs, traces, and automation teams. Multi-tenant from day zero, built for
              high-pressure operations.
            </p>
            <div className="lp-hero-cta">
              <button
                type="button"
                className="lp-btn primary lg"
                onClick={() => navigate("/signup")}
              >
                Create workspace <i className="fa-solid fa-arrow-right" />
              </button>
              <button type="button" className="lp-btn ghost lg" onClick={enter}>
                Open platform <i className="fa-solid fa-arrow-right-to-bracket" />
              </button>
            </div>
            <div className="lp-hero-meta">
              <span>
                <i className="fa-solid fa-check" /> No credit card required
              </span>
              <span>
                <i className="fa-solid fa-check" /> SOC 2 · GDPR · HIPAA
              </span>
              <span>
                <i className="fa-solid fa-check" /> 99.99% uptime SLA
              </span>
            </div>
          </div>
          <div className="lp-hero-right">
            <div className="lp-mockup">
              <div className="lp-mockup-head">
                <span className="lp-traffic">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="lp-mockup-url">veltacore-itsm.io/incidents</span>
              </div>
              <div className="lp-mockup-body">
                <div className="lp-command-surface">
                  <div className="lp-command-orb">
                    <span>AI</span>
                  </div>
                  <div className="lp-command-copy">
                    <b>Autonomous RCA running</b>
                    <span>6 signals fused · rollback confidence 87%</span>
                  </div>
                  <button type="button" onClick={enter}>
                    Open
                  </button>
                </div>
                <div className="lp-mock-pill">
                  <span className="lp-pulse" /> 1 active Sev 1 — Stripe pool
                </div>
                <div className="lp-mock-row crit">
                  <span className="lp-mock-id">INC-48291</span>
                  <span>Payment gateway timeouts</span>
                  <span className="lp-mock-sla">
                    <i className="fa-solid fa-triangle-exclamation" /> Breach
                  </span>
                </div>
                <div className="lp-mock-row">
                  <span className="lp-mock-id">INC-48290</span>
                  <span>Inventory 5xx elevated</span>
                  <span className="lp-mock-sla ok">
                    <i className="fa-solid fa-check" /> OK
                  </span>
                </div>
                <div className="lp-mock-row">
                  <span className="lp-mock-id">INC-48289</span>
                  <span>Warehouse slow queries</span>
                  <span className="lp-mock-sla ok">
                    <i className="fa-solid fa-check" /> OK
                  </span>
                </div>
                <div className="lp-mock-ai">
                  <i className="fa-solid fa-sparkles" />
                  <div>
                    <b>VeltaCore ITSM AI</b>
                    <div>
                      Likely cause: connection pool reduced to 120 in deploy <code>2f8a1c</code>.
                      Rollback suggested.
                    </div>
                  </div>
                </div>
                <div className="lp-command-map">
                  {(["Alert", "Trace", "Change", "CMDB", "Runbook"] as const).map((label, i) => (
                    <div key={label} className="lp-command-node" style={{ ["--i" as never]: i }}>
                      <i
                        className={`fa-solid ${
                          ["fa-bell", "fa-route", "fa-code-branch", "fa-sitemap", "fa-play"][i]
                        }`}
                      />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lp-logos">
          <div>Trusted by ops teams at</div>
          <div className="lp-logo-row">
            {TRUST_LOGOS.map((l) => (
              <span key={l} className="lp-logo-word">
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="lp-marquee-strip" aria-label="VeltaCore ITSM platform capabilities">
          <div className="lp-marquee-track">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={`${item}-${i}`}>{item}</span>
            ))}
          </div>
        </div>
      </header>

      <section className="lp-section lp-metrics">
        {[
          ["55+", "Infra components"],
          ["13", "Alert receivers"],
          ["8+", "Hardware exporters"],
          ["40+", "REST endpoints"],
          ["4", "ITSM modules"],
        ].map(([v, l]) => (
          <div key={l} className="lp-metric">
            <div className="lp-metric-v">{v}</div>
            <div className="lp-metric-l">{l}</div>
          </div>
        ))}
      </section>

      <section className="lp-signal-band" id="solutions">
        <div className="lp-section-num">01 — Autonomous operations</div>
        <div className="lp-signal-copy">
          <span className="lp-eyebrow-text">AUTONOMOUS OPERATIONS</span>
          <h2>Signals become actions before teams lose context.</h2>
          <p>
            VeltaCore ITSM continuously links telemetry, changes, assets, ownership, and runbooks
            into one decision graph.
          </p>
        </div>
        <div className="lp-signal-flow">
          {SIGNAL_STEPS.map(([ic, title, text], i) => (
            <div key={title} className="lp-signal-step">
              <i className={`fa-solid ${ic}`} />
              <b>{title}</b>
              <span>{text}</span>
              {i < SIGNAL_STEPS.length - 1 && <em />}
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section" id="platform">
        <div className="lp-section-num">02 — Platform</div>
        <div className="lp-section-head">
          <span className="lp-eyebrow-text">PLATFORM</span>
          <h2>One platform. Every signal. Zero context loss.</h2>
          <p className="lp-section-sub">
            From alert to resolution — observability, on-call, ITSM, and infra in a single
            multi-tenant workspace.
          </p>
        </div>
        <div className="lp-features">
          {FEATURES.map((f) => (
            <div key={f.t} className="lp-feature">
              <div className="lp-feature-ic" style={{ color: f.c, background: f.c + "14" }}>
                <i className={`fa-solid ${f.ic}`} />
              </div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section lp-integ" id="integrations">
        <div className="lp-section-num">03 — Integrations</div>
        <div className="lp-section-head">
          <span className="lp-eyebrow-text">INTEGRATIONS</span>
          <h2>45+ integrations across observability, on-call, ITSM, and cloud</h2>
        </div>
        <div className="lp-integ-grid">
          {INTEGRATION_TILES.map(([n, ic, c]) => (
            <div key={n} className="lp-integ-card">
              <i className={`fa-solid ${ic}`} style={{ color: c }} />
              <span>{n}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section lp-quote" id="customers">
        <div className="lp-section-num">04 — Customer proof</div>
        <div className="lp-customer-grid">
          <div className="lp-customer-story">
            <i className="fa-solid fa-quote-left lp-quote-mark" />
            <p className="lp-quote-text">
              "We cut Sev-1 MTTR from 47 minutes to 9. VeltaCore ITSM's AI correlation surfaces the
              root cause before our pager even fires."
            </p>
            <div className="lp-quote-author">
              <div className="lp-avatar">PR</div>
              <div>
                <b>Priya Raghunathan</b>
                <span>Senior DevOps Engineer · FinSpot Technology Solutions</span>
              </div>
            </div>
          </div>
          <div className="lp-customer-proof">
            <div>
              <b>9m</b>
              <span>Sev-1 MTTR</span>
            </div>
            <div>
              <b>31k</b>
              <span>alerts deduped</span>
            </div>
            <div>
              <b>184</b>
              <span>runbooks automated</span>
            </div>
            <div>
              <b>6</b>
              <span>business units live</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section" id="pricing">
        <div className="lp-section-num">05 — Pricing</div>
        <div className="lp-section-head">
          <span className="lp-eyebrow-text">PRICING</span>
          <h2>Simple plans that scale with your fleet</h2>
        </div>
        <div className="lp-pricing">
          {PLANS.map((p) => (
            <div key={p.name} className={`lp-plan${p.primary ? " featured" : ""}`}>
              {"badge" in p && p.badge && <div className="lp-plan-badge">{p.badge}</div>}
              <h3>{p.name}</h3>
              <div className="lp-plan-price">
                {p.price}
                <span>{p.price !== "Custom" ? " / seat" : ""}</span>
              </div>
              <div className="lp-plan-per">{p.per}</div>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>
                    <i className="fa-solid fa-check" /> {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`lp-btn ${p.primary ? "primary" : "ghost"} lg`}
                onClick={() => (p.primary ? navigate("/signup") : enter())}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section lp-faq" id="faq">
        <div className="lp-section-num">06 — Field notes</div>
        <div className="lp-section-head">
          <span className="lp-eyebrow-text">FAQ</span>
          <h2>
            Built for real incident pressure across infrastructure, network, and application teams.
          </h2>
          <p className="lp-section-sub">
            A few operator answers before your first workspace goes live.
          </p>
        </div>
        <div className="lp-faq-grid">
          {FAQS.map(([q, a]) => (
            <details key={q} className="lp-faq-item">
              <summary>
                {q}
                <i className="fa-solid fa-plus" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="lp-cta">
        <h2>Your next Sev-1 starts in 14 minutes. Be ready.</h2>
        <p>
          Spin up a workspace, connect Node Exporter, Prometheus, Grafana, and logs, then watch
          VeltaCore ITSM correlate the stream.
        </p>
        <div className="lp-cta-buttons">
          <button type="button" className="lp-btn primary lg" onClick={() => navigate("/signup")}>
            Create workspace
          </button>
          <button type="button" className="lp-btn ghost lg" onClick={enter}>
            Open operations console
          </button>
        </div>
      </section>

      <footer className="lp-foot" id="docs">
        <div className="lp-foot-cols">
          <div className="lp-foot-col">
            <div className="lp-logo">
              <div className="lp-logo-mark sm">VC</div>
              <span>VeltaCore ITSM</span>
            </div>
            <p>The incident platform built for the AI age. © 2026.</p>
          </div>
          {FOOTER_COLS.map(([title, items]) => (
            <div key={title} className="lp-foot-col">
              <h4>{title}</h4>
              <ul>
                {items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="lp-foot-bar">
          <span>SOC 2 Type II · GDPR · HIPAA · ISO 27001</span>
          <span>Privacy · Terms · Cookies</span>
        </div>
      </footer>
    </div>
  );
}
