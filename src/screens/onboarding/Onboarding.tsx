import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill } from "@/components";
import {
  CATALOG_MODELS,
  CATALOG_VENDORS,
  COLLECTOR_PROFILES,
  CRITICALITY_TIERS,
  DEVICE_CATEGORIES,
  DISCOVERY_CANDIDATES,
  SITES,
  TENANTS,
  catalogModelById,
  collectorProfileById,
} from "@/data";
import type {
  CatalogModelStatus,
  CollectorAuthKind,
  Criticality,
} from "@/types";
import type { PillKind } from "@/components";

type Mode = "manual" | "bulk" | "discovery";
const ENVIRONMENTS = ["DEV", "UAT", "PROD", "DR"] as const;
type Environment = (typeof ENVIRONMENTS)[number];

const STEPS = [
  { id: 0, label: "Scope", icon: "fa-sitemap" },
  { id: 1, label: "Category & model", icon: "fa-microchip" },
  { id: 2, label: "Target & ownership", icon: "fa-server" },
  { id: 3, label: "Collector & security", icon: "fa-shield-halved" },
  { id: 4, label: "Review", icon: "fa-clipboard-check" },
];

const SNMP_AUTH = ["MD5", "SHA", "SHA224", "SHA256", "SHA384", "SHA512"] as const;
const SNMP_PRIV = ["DES", "AES", "AES192", "AES256", "AES192C", "AES256C"] as const;
const SNMP_LEVELS = ["noAuthNoPriv", "authNoPriv", "authPriv"] as const;

const STATUS_PILL: Record<CatalogModelStatus, PillKind> = {
  SUPPORTED: "success",
  PARTIALLY_SUPPORTED: "warning",
  GENERIC_SNMP: "info",
  DISCOVERED_UNVERIFIED: "warning",
  RETIRED: "neutral",
  BLOCKED: "critical",
};

interface Draft {
  tenant: string;
  site: string;
  environment: Environment;
  category: string;
  vendor: string;
  model: string;
  firmware: string;
  host: string;
  ip: string;
  service: string;
  ownerTeam: string;
  criticality: Criticality;
  collectorProfile: string;
  snmpLevel: (typeof SNMP_LEVELS)[number];
  snmpAuth: (typeof SNMP_AUTH)[number];
  snmpPriv: (typeof SNMP_PRIV)[number];
  vaultRef: string;
}

const EMPTY: Draft = {
  tenant: "",
  site: "",
  environment: "PROD",
  category: "",
  vendor: "",
  model: "",
  firmware: "",
  host: "",
  ip: "",
  service: "",
  ownerTeam: "",
  criticality: "gold",
  collectorProfile: "",
  snmpLevel: "authPriv",
  snmpAuth: "SHA256",
  snmpPriv: "AES256",
  vaultRef: "",
};

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("manual");

  return (
    <div className="onb-root">
      <header className="onb-top">
        <div className="onb-top-left">
          <button type="button" className="onb-close" onClick={() => navigate("/infra/assets")} aria-label="Back to inventory">
            <i className="fa-solid fa-arrow-left" />
          </button>
          <div>
            <div className="onb-top-title">Device onboarding</div>
            <div className="onb-top-sub">Register infrastructure &amp; application targets · auto-discovery never auto-commits</div>
          </div>
        </div>
        <div className="onb-modes">
          {([
            ["manual", "fa-keyboard", "Manual"],
            ["bulk", "fa-file-csv", "Bulk import"],
            ["discovery", "fa-radar", `Discovery review (${DISCOVERY_CANDIDATES.length})`],
          ] as const).map(([m, ic, lbl]) => (
            <button type="button" key={m} className={`onb-mode${mode === m ? " active" : ""}`} onClick={() => setMode(m as Mode)}>
              <i className={`fa-solid ${ic}`} /> {lbl}
            </button>
          ))}
        </div>
      </header>

      <div className="onb-body">
        {mode === "manual" && <ManualWizard onDone={() => navigate("/infra/assets")} />}
        {mode === "bulk" && <BulkImport />}
        {mode === "discovery" && <DiscoveryReview />}
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

// ── Manual wizard ────────────────────────────────────────────────────────────

function ManualWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(EMPTY);
  const [done, setDone] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  const vendorsForCat = useMemo(
    () => CATALOG_VENDORS.filter((v) => v.categories.includes(d.category)),
    [d.category],
  );
  const modelsForVendor = useMemo(
    () => CATALOG_MODELS.filter((m) => m.category === d.category && m.vendor === d.vendor),
    [d.category, d.vendor],
  );
  const model = catalogModelById(d.model);
  const profile = collectorProfileById(d.collectorProfile || model?.collectorProfile || "");

  const stepValid = (s: number): boolean => {
    switch (s) {
      case 0: return Boolean(d.tenant && d.site && d.environment);
      case 1: return Boolean(d.category && d.vendor && d.model && d.firmware);
      case 2: return Boolean((d.host || d.ip) && d.service && d.ownerTeam && d.criticality);
      case 3: {
        const p = profile;
        if (!p) return false;
        if (p.requiresVault && !d.vaultRef.trim()) return false;
        return true;
      }
      default: return true;
    }
  };

  if (done) {
    return (
      <div className="onb-done">
        <div className="onb-done-icon"><i className="fa-solid fa-circle-check" /></div>
        <h2>Onboarding submitted</h2>
        <p>
          <span className="mono">{d.host || d.ip}</span> queued for validation on the{" "}
          <b>{d.environment}</b> collector. A validation job will confirm reachability before the asset
          transitions <span className="mono">pending_review → active</span>.
        </p>
        <div className="onb-audit">
          <i className="fa-solid fa-clipboard-list" /> Audit event written · actor you · action{" "}
          <span className="mono">onboard</span> · tenant{" "}
          <span className="mono">{TENANTS.find((t) => t.id === d.tenant)?.name}</span> · secret stored as Vault reference only
        </div>
        <div className="onb-done-actions">
          <button type="button" className="sn-btn" onClick={() => { setD(EMPTY); setStep(0); setDone(false); }}>
            <i className="fa-solid fa-plus" /> Onboard another
          </button>
          <button type="button" className="sn-btn primary" onClick={onDone}>
            <i className="fa-solid fa-list" /> Go to inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="onb-wizard">
      {/* Stepper */}
      <ol className="onb-steps">
        {STEPS.map((s) => (
          <li key={s.id} className={`onb-step${s.id === step ? " current" : ""}${s.id < step ? " done" : ""}`}>
            <button type="button" onClick={() => s.id < step && setStep(s.id)} disabled={s.id > step}>
              <span className="onb-step-mark">
                {s.id < step ? <i className="fa-solid fa-check" /> : <i className={`fa-solid ${s.icon}`} />}
              </span>
              <span className="onb-step-label">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="onb-panel">
        {step === 0 && (
          <div className="onb-grid">
            <SelectField label="Tenant" value={d.tenant} onChange={(v) => set("tenant", v)} options={TENANTS.map((t) => ({ value: t.id, label: t.name }))} placeholder="Select tenant" />
            <SelectField label="Site" value={d.site} onChange={(v) => set("site", v)} options={SITES.map((s) => ({ value: s.id, label: s.name }))} placeholder="Select site" />
            <div className="onb-field">
              <label>Environment</label>
              <div className="onb-seg">
                {ENVIRONMENTS.map((e) => (
                  <button type="button" key={e} className={`onb-seg-btn${d.environment === e ? " active" : ""}`} onClick={() => set("environment", e)}>{e}</button>
                ))}
              </div>
            </div>
            <div className="onb-note">
              <i className="fa-solid fa-lock" /> The tenant, site and environment are bound into every Prometheus target
              label and Alertmanager route — they cannot be changed after onboarding without a new record.
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="onb-grid">
            <div className="onb-field span2">
              <label>Category</label>
              <div className="onb-cat-grid">
                {DEVICE_CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className={`onb-cat${d.category === c.id ? " active" : ""}`}
                    onClick={() => setD((p) => ({ ...p, category: c.id, vendor: "", model: "", firmware: "" }))}
                  >
                    <i className={`fa-solid ${c.icon}`} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <SelectField
              label="Vendor"
              value={d.vendor}
              onChange={(v) => setD((p) => ({ ...p, vendor: v, model: "", firmware: "" }))}
              options={vendorsForCat.map((v) => ({ value: v.id, label: v.name }))}
              placeholder={d.category ? "Select vendor" : "Pick a category first"}
              disabled={!d.category}
            />
            <SelectField
              label="Model"
              value={d.model}
              onChange={(v) => setD((p) => ({ ...p, model: v, firmware: "" }))}
              options={modelsForVendor.map((m) => ({ value: m.id, label: m.model }))}
              placeholder={d.vendor ? "Select model" : "Pick a vendor first"}
              disabled={!d.vendor}
            />
            <SelectField
              label="Firmware / OS version"
              value={d.firmware}
              onChange={(v) => set("firmware", v)}
              options={(model?.firmware ?? []).map((f) => ({ value: f, label: f }))}
              placeholder={d.model ? "Select firmware" : "Pick a model first"}
              disabled={!d.model}
            />
            {model && (
              <div className="onb-model-card span2">
                <div className="onb-model-head">
                  <Pill kind={STATUS_PILL[model.status]}>{model.status.replace(/_/g, " ").toLowerCase()}</Pill>
                  <b>{model.vendor} · {model.family}</b>
                  <span className="mono text-mute" style={{ marginLeft: "auto" }}>
                    collector: {collectorProfileById(model.collectorProfile)?.name}
                  </span>
                </div>
                <div className="onb-caps">
                  {model.capabilities.map((c) => <span key={c} className="onb-cap mono">{c}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="onb-grid">
            <TextField label="Hostname / FQDN" value={d.host} onChange={(v) => set("host", v)} placeholder="e.g. sw-blr-tor-15.finspot.in" mono />
            <TextField label="Management IP" value={d.ip} onChange={(v) => set("ip", v)} placeholder="e.g. 10.10.3.15" mono />
            <TextField label="Service name" value={d.service} onChange={(v) => set("service", v)} placeholder="e.g. core-network" mono />
            <TextField label="Owner team" value={d.ownerTeam} onChange={(v) => set("ownerTeam", v)} placeholder="e.g. Network Eng" />
            <div className="onb-field span2">
              <label>Criticality tier</label>
              <div className="onb-crit">
                {CRITICALITY_TIERS.map((t) => (
                  <button type="button" key={t.id} className={`onb-crit-btn crit-${t.id}${d.criticality === t.id ? " active" : ""}`} onClick={() => set("criticality", t.id)}>
                    <b>{t.label}</b>
                    <span>{t.sla}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onb-grid">
            <SelectField
              label="Collector profile"
              value={d.collectorProfile || model?.collectorProfile || ""}
              onChange={(v) => set("collectorProfile", v)}
              options={COLLECTOR_PROFILES.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Select collector profile"
            />
            {profile && (
              <div className="onb-field">
                <label>Emitted metrics</label>
                <div className="onb-caps">{profile.metrics.map((m) => <span key={m} className="onb-cap mono">{m}</span>)}</div>
              </div>
            )}

            {profile && isSnmpV3(profile.authKind) && (
              <div className="onb-field span2 onb-sec">
                <label>SNMPv3 security</label>
                <div className="onb-sec-grid">
                  <div className="onb-field">
                    <label>Security level</label>
                    <div className="onb-seg">
                      {SNMP_LEVELS.map((l) => (
                        <button type="button" key={l} className={`onb-seg-btn${d.snmpLevel === l ? " active" : ""}`} onClick={() => set("snmpLevel", l)}>{l}</button>
                      ))}
                    </div>
                  </div>
                  {d.snmpLevel !== "noAuthNoPriv" && (
                    <SelectField label="Auth method" value={d.snmpAuth} onChange={(v) => set("snmpAuth", v as Draft["snmpAuth"])} options={SNMP_AUTH.map((a) => ({ value: a, label: a }))} />
                  )}
                  {d.snmpLevel === "authPriv" && (
                    <SelectField label="Privacy method" value={d.snmpPriv} onChange={(v) => set("snmpPriv", v as Draft["snmpPriv"])} options={SNMP_PRIV.map((a) => ({ value: a, label: a }))} />
                  )}
                </div>
              </div>
            )}

            {profile?.requiresVault ? (
              <TextField label="Vault credential reference" value={d.vaultRef} onChange={(v) => set("vaultRef", v)} placeholder="vault:kv/<tenant>/<site>/<asset>" mono span2 />
            ) : (
              <div className="onb-note span2"><i className="fa-solid fa-circle-info" /> This collector needs no stored secret ({profile?.authKind ?? "none"}).</div>
            )}
            <div className="onb-note span2 onb-note-warn">
              <i className="fa-solid fa-shield-halved" /> Secrets are never stored in LinkedEye — only the Vault path is
              persisted. SNMP community strings, SNMPv3 passwords and Redfish credentials live in Vault exclusively.
            </div>
          </div>
        )}

        {step === 4 && (
          <ReviewPanel d={d} />
        )}
      </div>

      {/* Footer nav */}
      <div className="onb-foot">
        <button type="button" className="sn-btn" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          <i className="fa-solid fa-chevron-left" /> Back
        </button>
        <div className="onb-foot-status">
          Step {step + 1} of {STEPS.length}
          {!stepValid(step) && <span className="onb-foot-hint"> · complete required fields to continue</span>}
        </div>
        {step < STEPS.length - 1 ? (
          <button type="button" className="sn-btn primary" disabled={!stepValid(step)} onClick={() => setStep((s) => s + 1)}>
            Next <i className="fa-solid fa-chevron-right" />
          </button>
        ) : (
          <button type="button" className="sn-btn primary" onClick={() => setDone(true)}>
            <i className="fa-solid fa-paper-plane" /> Submit &amp; validate
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewPanel({ d }: { d: Draft }) {
  const model = catalogModelById(d.model);
  const profile = collectorProfileById(d.collectorProfile || model?.collectorProfile || "");
  const rows: [string, string][] = [
    ["Tenant", TENANTS.find((t) => t.id === d.tenant)?.name ?? "—"],
    ["Site", SITES.find((s) => s.id === d.site)?.name ?? "—"],
    ["Environment", d.environment],
    ["Category", DEVICE_CATEGORIES.find((c) => c.id === d.category)?.label ?? "—"],
    ["Model", model ? `${model.vendor} ${model.model}` : "—"],
    ["Firmware", d.firmware || "—"],
    ["Host / IP", [d.host, d.ip].filter(Boolean).join(" · ") || "—"],
    ["Service", d.service || "—"],
    ["Owner team", d.ownerTeam || "—"],
    ["Criticality", CRITICALITY_TIERS.find((t) => t.id === d.criticality)?.label ?? "—"],
    ["Collector", profile?.name ?? "—"],
    ["Auth", profile ? (isSnmpV3(profile.authKind) ? `SNMPv3 ${d.snmpLevel} (${d.snmpAuth}/${d.snmpPriv})` : profile.authKind) : "—"],
    ["Vault ref", d.vaultRef || (profile?.requiresVault ? "⚠ missing" : "not required")],
  ];
  return (
    <div className="onb-grid">
      <div className="onb-review span2">
        {rows.map(([k, v]) => (
          <div key={k} className="onb-review-row">
            <span className="onb-review-k">{k}</span>
            <span className="onb-review-v">{v}</span>
          </div>
        ))}
      </div>
      <div className="onb-pipeline span2">
        {["Validation job", "Collector assignment", "Dashboard template", "Alert policy", "Topology node", "Audit record"].map((s, i) => (
          <div key={s} className="onb-pipeline-step">
            <span className="onb-pipeline-n">{i + 1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bulk import ──────────────────────────────────────────────────────────────

const BULK_ROWS = [
  { row: 2, host: "sw-blr-tor-15", ip: "10.10.3.15", model: "Arista 7050X3",     ok: true,  err: "" },
  { row: 3, host: "sw-blr-tor-16", ip: "10.10.3.16", model: "Arista 7050X3",     ok: true,  err: "" },
  { row: 4, host: "fw-nyc-dmz-03", ip: "10.30.0.9",  model: "Palo Alto PA-3260", ok: true,  err: "" },
  { row: 5, host: "lb-fra-prod-3", ip: "10.20.5.9",  model: "F5 BIG-IP i5800",   ok: false, err: "duplicate management IP (already 10.20.5.9 → LB-FRA-PROD-03)" },
  { row: 6, host: "unknown-dev-1", ip: "10.10.3.999",model: "Cisco C9500",       ok: false, err: "invalid IPv4 address 10.10.3.999" },
];

function BulkImport() {
  const ok = BULK_ROWS.filter((r) => r.ok).length;
  const bad = BULK_ROWS.length - ok;
  return (
    <div className="onb-bulk">
      <div className="onb-bulk-drop">
        <i className="fa-solid fa-file-arrow-up" />
        <div><b>Drop a CSV or JSON manifest</b><div className="text-mute" style={{ fontSize: 12 }}>Columns: tenant, site, environment, host, ip, vendor, model, firmware, service, owner_team, criticality, collector_profile, vault_ref</div></div>
        <button type="button" className="sn-btn">Choose file</button>
      </div>
      <div className="sn-form-section">
        <div className="sn-section-header">
          <i className="fa-solid fa-table-list" />
          <span className="sn-section-title">Validation report · sample manifest</span>
          <span className="sn-section-badge">{ok} valid · {bad} error{bad === 1 ? "" : "s"}</span>
        </div>
        <div className="sn-section-content">
          <p style={{ fontSize: 12, color: "var(--fg-subtle)", marginTop: 0 }}>
            Row-level validation runs before any commit. Invalid rows are surfaced individually — the import is never
            a single pass/fail, and valid rows can be committed while errors are fixed.
          </p>
          <table className="sn-list-table">
            <thead><tr><th style={{ width: 50 }}>Row</th><th style={{ width: 30 }} /><th>Host</th><th style={{ width: 130 }}>IP</th><th>Model</th><th>Result</th></tr></thead>
            <tbody>
              {BULK_ROWS.map((r) => (
                <tr key={r.row}>
                  <td className="mono">{r.row}</td>
                  <td><i className={`fa-solid ${r.ok ? "fa-circle-check" : "fa-circle-exclamation"}`} style={{ color: r.ok ? "#10b981" : "#dc2626" }} /></td>
                  <td className="mono">{r.host}</td>
                  <td className="mono">{r.ip}</td>
                  <td>{r.model}</td>
                  <td>{r.ok ? <Pill kind="success">valid</Pill> : <span style={{ color: "#dc2626", fontSize: 12 }}>{r.err}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="button" className="sn-btn primary" disabled={ok === 0}><i className="fa-solid fa-check" /> Commit {ok} valid row{ok === 1 ? "" : "s"}</button>
            <button type="button" className="sn-btn"><i className="fa-solid fa-download" /> Download error report</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Discovery review ─────────────────────────────────────────────────────────

function DiscoveryReview() {
  const [selected, setSelected] = useState<string | null>(DISCOVERY_CANDIDATES[0]?.id ?? null);
  const cand = DISCOVERY_CANDIDATES.find((c) => c.id === selected);
  return (
    <div className="onb-disc">
      <div className="onb-disc-list">
        <div className="onb-disc-list-head">
          <i className="fa-solid fa-radar" /> Discovery queue
          <span className="sn-side-count">{DISCOVERY_CANDIDATES.length}</span>
        </div>
        {DISCOVERY_CANDIDATES.map((c) => (
          <button type="button" key={c.id} className={`onb-disc-item${selected === c.id ? " active" : ""}`} onClick={() => setSelected(c.id)}>
            <div className="onb-disc-item-top">
              <span className="mono" style={{ fontSize: 12 }}>{c.sysName}</span>
              <ConfidenceDot v={c.confidence} />
            </div>
            <div className="mono text-mute" style={{ fontSize: 11 }}>{c.ip} · {c.source}</div>
            <div style={{ fontSize: 11, marginTop: 2 }}>{c.normalizedVendor} {c.normalizedModel}</div>
          </button>
        ))}
      </div>

      {cand ? (
        <div className="onb-disc-detail">
          <div className="onb-disc-detail-head">
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }} className="mono">{cand.sysName}</div>
              <div className="text-mute" style={{ fontSize: 12 }}>{cand.ip} · discovered {cand.discoveredAt} via {cand.source}</div>
            </div>
            <Pill kind={STATUS_PILL[cand.status]}>{cand.status.replace(/_/g, " ").toLowerCase()}</Pill>
          </div>

          <div className="onb-disc-fp">
            <FpRow k="sysDescr" v={cand.sysDescr} />
            <FpRow k="Vendor" v={cand.normalizedVendor} />
            <FpRow k="Model" v={cand.normalizedModel} />
            <FpRow k="Serial" v={cand.serial} />
            <FpRow k="Firmware" v={cand.firmware} />
            <FpRow k="Confidence" v={`${Math.round(cand.confidence * 100)}%`} />
            <FpRow k="Matched catalog" v={cand.matchedModel ? `${catalogModelById(cand.matchedModel)?.vendor} ${catalogModelById(cand.matchedModel)?.model}` : "no match — generic profile"} />
            <FpRow k="Suggested profile" v={cand.suggestedProfile} />
          </div>

          {!cand.matchedModel && (
            <div className="onb-note onb-note-warn">
              <i className="fa-solid fa-triangle-exclamation" /> Model Review Required — no catalog match. A generic safe
              profile is assigned and destructive automation is disabled until a NOC operator maps or creates a model.
            </div>
          )}

          <div className="onb-disc-actions">
            <button type="button" className="sn-btn primary" disabled={cand.confidence < 0.5}><i className="fa-solid fa-check" /> Approve &amp; onboard</button>
            <button type="button" className="sn-btn"><i className="fa-solid fa-diagram-project" /> Map to existing model</button>
            <button type="button" className="sn-btn"><i className="fa-solid fa-plus" /> Create new model</button>
            <button type="button" className="sn-btn"><i className="fa-solid fa-ban" /> Block device</button>
          </div>
          <div className="onb-note">
            <i className="fa-solid fa-circle-info" /> Approving writes an immutable audit event and moves the asset to{" "}
            <span className="mono">pending_review</span> — a validation job must pass before it becomes{" "}
            <span className="mono">active</span>.
          </div>
        </div>
      ) : (
        <div className="onb-disc-detail" style={{ display: "grid", placeItems: "center", color: "var(--fg-subtle)" }}>
          Discovery queue empty.
        </div>
      )}
    </div>
  );
}

function FpRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="onb-disc-fp-row">
      <span className="onb-disc-fp-k">{k}</span>
      <span className="onb-disc-fp-v mono">{v}</span>
    </div>
  );
}

function ConfidenceDot({ v }: { v: number }) {
  const color = v >= 0.8 ? "#10b981" : v >= 0.5 ? "#f59e0b" : "#dc2626";
  return <span className="onb-conf" style={{ color }}>{Math.round(v * 100)}%</span>;
}

// ── shared field components ──────────────────────────────────────────────────

function TextField({ label, value, onChange, placeholder, mono, span2 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; span2?: boolean }) {
  return (
    <div className={`onb-field${span2 ? " span2" : ""}`}>
      <label>{label}</label>
      <input className={`onb-input${mono ? " mono" : ""}`} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder, disabled, span2 }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string; disabled?: boolean; span2?: boolean }) {
  return (
    <div className={`onb-field${span2 ? " span2" : ""}`}>
      <label>{label}</label>
      <select className="onb-input" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder ?? "Select…"}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function isSnmpV3(k: CollectorAuthKind): boolean {
  return k === "snmp_v3";
}

const STYLES = `
  .onb-root{position:fixed;inset:0;display:flex;flex-direction:column;background:var(--bg,#fff);color:var(--fg);z-index:50}
  .onb-top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 20px;border-bottom:1px solid var(--border,#e2e8f0);flex-wrap:wrap}
  .onb-top-left{display:flex;align-items:center;gap:14px}
  .onb-close{width:36px;height:36px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:var(--bg,#fff);cursor:pointer;color:var(--fg)}
  .onb-top-title{font-size:16px;font-weight:650}
  .onb-top-sub{font-size:12px;color:var(--fg-subtle)}
  .onb-modes{display:flex;gap:4px;border:1px solid var(--border,#e2e8f0);border-radius:8px;padding:3px}
  .onb-mode{border:0;background:transparent;padding:8px 12px;border-radius:6px;font:inherit;font-size:12.5px;color:var(--fg-subtle);cursor:pointer;display:flex;align-items:center;gap:6px}
  .onb-mode.active{background:var(--accent);color:#fff;font-weight:600}
  .onb-body{flex:1;overflow:auto;padding:24px;max-width:1100px;margin:0 auto;width:100%}
  .onb-wizard{display:flex;flex-direction:column;gap:20px}
  .onb-steps{list-style:none;display:flex;gap:6px;margin:0;padding:0;flex-wrap:wrap}
  .onb-steps>li{flex:1;min-width:120px}
  .onb-steps button{width:100%;display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);font:inherit;cursor:default;color:var(--fg-subtle)}
  .onb-steps .current button{border-color:var(--accent);color:var(--fg);box-shadow:0 0 0 1px var(--accent)}
  .onb-steps .done button{cursor:pointer;color:var(--fg)}
  .onb-step-mark{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:var(--bg-muted,#f1f5f9);font-size:10px;flex-shrink:0}
  .onb-steps .current .onb-step-mark,.onb-steps .done .onb-step-mark{background:var(--accent);color:#fff}
  .onb-step-label{font-size:12.5px;font-weight:550}
  .onb-panel{border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:20px;min-height:280px}
  .onb-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .onb-field{display:flex;flex-direction:column;gap:6px}
  .onb-field.span2{grid-column:1 / -1}
  .onb-field>label{font-size:11px;font-weight:600;color:var(--fg-subtle);text-transform:uppercase;letter-spacing:.04em}
  .onb-input{border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);font:inherit;font-size:13px;padding:9px 11px;color:var(--fg);width:100%}
  .onb-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
  .onb-seg{display:flex;border:1px solid var(--border,#e2e8f0);border-radius:8px;overflow:hidden;width:fit-content}
  .onb-seg-btn{border:0;background:transparent;padding:8px 14px;font:inherit;font-size:12px;cursor:pointer;color:var(--fg);border-right:1px solid var(--border,#e2e8f0)}
  .onb-seg-btn:last-child{border-right:0}
  .onb-seg-btn.active{background:var(--accent);color:#fff;font-weight:600}
  .onb-cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
  .onb-cat{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);cursor:pointer;font:inherit;font-size:11.5px;color:var(--fg)}
  .onb-cat i{font-size:18px;color:var(--accent)}
  .onb-cat:hover{border-color:var(--accent)}
  .onb-cat.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);font-weight:600}
  .onb-model-card{border:1px solid var(--border,#e2e8f0);border-radius:8px;padding:12px;background:var(--bg-muted,#f8fafc)}
  .onb-model-head{display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap}
  .onb-caps{display:flex;flex-wrap:wrap;gap:6px}
  .onb-cap{font-size:10.5px;padding:2px 8px;border-radius:6px;background:var(--bg,#fff);border:1px solid var(--border,#e2e8f0)}
  .onb-crit{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .onb-crit-btn{display:flex;flex-direction:column;gap:2px;padding:10px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg,#fff);cursor:pointer;font:inherit;text-align:left;color:var(--fg)}
  .onb-crit-btn b{font-size:13px}
  .onb-crit-btn span{font-size:10.5px;color:var(--fg-subtle)}
  .onb-crit-btn.active{box-shadow:0 0 0 1px var(--accent);border-color:var(--accent)}
  .onb-crit-btn.crit-platinum.active{border-color:#6366f1;box-shadow:0 0 0 1px #6366f1}
  .onb-crit-btn.crit-gold.active{border-color:#f59e0b;box-shadow:0 0 0 1px #f59e0b}
  .onb-sec{border:1px dashed var(--border,#cbd5e1);border-radius:8px;padding:14px}
  .onb-sec-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:8px}
  .onb-note{grid-column:1 / -1;display:flex;gap:8px;align-items:flex-start;font-size:12px;color:var(--fg-subtle);background:var(--bg-muted,#f8fafc);border:1px solid var(--border,#e2e8f0);border-radius:8px;padding:10px 12px}
  .onb-note i{margin-top:2px;color:var(--accent)}
  .onb-note-warn{border-color:#f59e0b40;background:#f59e0b12}
  .onb-note-warn i{color:#d97706}
  .onb-review{border:1px solid var(--border,#e2e8f0);border-radius:8px;overflow:hidden}
  .onb-review-row{display:grid;grid-template-columns:180px 1fr;border-top:1px solid var(--border,#e2e8f0)}
  .onb-review-row:first-child{border-top:0}
  .onb-review-k{padding:9px 12px;background:var(--bg-muted,#f8fafc);font-size:12px;color:var(--fg-subtle);font-weight:600}
  .onb-review-v{padding:9px 12px;font-size:12.5px}
  .onb-pipeline{display:flex;flex-wrap:wrap;gap:8px}
  .onb-pipeline-step{display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;font-size:12px;background:var(--bg-muted,#f8fafc)}
  .onb-pipeline-n{width:20px;height:20px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:10px;font-weight:700}
  .onb-foot{display:flex;align-items:center;gap:16px;padding-top:4px}
  .onb-foot-status{flex:1;text-align:center;font-size:12px;color:var(--fg-subtle)}
  .onb-foot-hint{color:#d97706}
  .onb-done{max-width:560px;margin:40px auto;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px}
  .onb-done-icon{font-size:56px;color:#10b981}
  .onb-done h2{margin:0}
  .onb-done p{font-size:13px;color:var(--fg-subtle);margin:0}
  .onb-audit{font-size:12px;background:var(--bg-muted,#f8fafc);border:1px solid var(--border,#e2e8f0);border-radius:8px;padding:10px 12px;color:var(--fg-subtle)}
  .onb-done-actions{display:flex;gap:8px;margin-top:8px}
  .onb-bulk{display:flex;flex-direction:column;gap:16px}
  .onb-bulk-drop{display:flex;align-items:center;gap:16px;padding:24px;border:2px dashed var(--border,#cbd5e1);border-radius:12px}
  .onb-bulk-drop>i{font-size:32px;color:var(--accent)}
  .onb-bulk-drop>div{flex:1}
  .onb-disc{display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start}
  .onb-disc-list{border:1px solid var(--border,#e2e8f0);border-radius:10px;overflow:hidden}
  .onb-disc-list-head{display:flex;align-items:center;gap:8px;padding:12px;font-weight:600;font-size:13px;background:var(--bg-muted,#f8fafc);border-bottom:1px solid var(--border,#e2e8f0)}
  .onb-disc-item{width:100%;text-align:left;border:0;border-bottom:1px solid var(--border,#e2e8f0);background:var(--bg,#fff);padding:10px 12px;cursor:pointer;color:var(--fg)}
  .onb-disc-item:hover{background:var(--bg-muted,#f8fafc)}
  .onb-disc-item.active{background:var(--accent);color:#fff}
  .onb-disc-item.active .text-mute,.onb-disc-item.active .onb-conf{color:rgba(255,255,255,.85)!important}
  .onb-disc-item-top{display:flex;justify-content:space-between;align-items:center}
  .onb-conf{font-size:11px;font-weight:700}
  .onb-disc-detail{border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:18px;min-height:320px}
  .onb-disc-detail-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}
  .onb-disc-fp{border:1px solid var(--border,#e2e8f0);border-radius:8px;overflow:hidden;margin-bottom:14px}
  .onb-disc-fp-row{display:grid;grid-template-columns:150px 1fr;border-top:1px solid var(--border,#e2e8f0)}
  .onb-disc-fp-row:first-child{border-top:0}
  .onb-disc-fp-k{padding:8px 12px;background:var(--bg-muted,#f8fafc);font-size:11.5px;color:var(--fg-subtle);font-weight:600}
  .onb-disc-fp-v{padding:8px 12px;font-size:12px}
  .onb-disc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
  @media(max-width:820px){.onb-grid{grid-template-columns:1fr}.onb-disc{grid-template-columns:1fr}.onb-crit{grid-template-columns:1fr 1fr}.onb-sec-grid{grid-template-columns:1fr}}
`;
