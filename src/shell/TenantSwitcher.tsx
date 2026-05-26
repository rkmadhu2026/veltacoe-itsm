import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, colorFor } from "@/components";
import { ORG } from "@/data/org";
import { TENANTS } from "@/data/tenants";
import { useTenant } from "./TenantContext";

interface TenantSwitcherProps {
  open: boolean;
  onClose: () => void;
}

export function TenantSwitcher({ open, onClose }: TenantSwitcherProps) {
  const { tenant, setTenant } = useTenant();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(0);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setFocus(0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setFocus((f) => Math.min(f + 1, TENANTS.length));
      if (e.key === "ArrowUp") setFocus((f) => Math.max(f - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = TENANTS.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="tsw-backdrop" onClick={onClose} role="presentation">
      <div className="tsw" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Tenant switcher">
        <div className="tsw-head">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            autoFocus
            placeholder="Jump to tenant, workspace, or view…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <kbd>esc</kbd>
        </div>
        <div className="tsw-body">
          <div className="tsw-section-title">Parent organization</div>
          <button
            type="button"
            className="tsw-row"
            onClick={() => {
              onClose();
              navigate("/cross-tenant");
            }}
          >
            <div className="tsw-icon" style={{ background: "linear-gradient(135deg,#0f1c3f,#2563eb)" }}>
              LF
            </div>
            <div className="tsw-info">
              <b>{ORG.name}</b>
              <span>All business units · cross-tenant view</span>
            </div>
            <div className="tsw-meta">
              <Pill kind="purple" noDot>
                Super-admin
              </Pill>
            </div>
          </button>

          <div className="tsw-section-title">Business units ({filtered.length})</div>
          {filtered.map((t, i) => (
            <button
              type="button"
              key={t.id}
              className={`tsw-row${i + 1 === focus ? " focus" : ""}`}
              onClick={() => {
                setTenant(t);
                onClose();
              }}
            >
              <div className="tsw-icon" style={{ background: colorFor(t.color) }}>
                {t.code}
              </div>
              <div className="tsw-info">
                <b>
                  {t.name}
                  {tenant.id === t.id && (
                    <span style={{ color: "var(--fg-subtle)", fontWeight: 400, fontSize: 11 }}>
                      {" "}
                      · current
                    </span>
                  )}
                </b>
                <span>
                  {t.users} users · {t.incidents} open incidents · {t.plan}
                </span>
              </div>
              <div className="tsw-meta">
                {t.sev1 > 0 && <Pill kind="critical">{t.sev1} Sev 1</Pill>}
                <span className="mono" style={{ fontSize: 11 }}>
                  {t.health}%
                </span>
              </div>
            </button>
          ))}

          <div className="tsw-section-title">Quick actions</div>
          <button
            type="button"
            className="tsw-row"
            onClick={() => {
              onClose();
              navigate("/onboarding");
            }}
          >
            <div className="tsw-icon" style={{ background: "var(--bg-muted)", color: "var(--fg)" }}>
              <i className="fa-solid fa-plus" />
            </div>
            <div className="tsw-info">
              <b>Create a new business unit</b>
              <span>Provision a new sub-tenant under {ORG.name}</span>
            </div>
            <kbd style={{ fontSize: 10, color: "var(--fg-subtle)" }}>⌘ N</kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
