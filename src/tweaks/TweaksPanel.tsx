// TweaksPanel — runtime theme/UX editor.
// Standalone: dropped the Claude artifact-host postMessage protocol; persistence
// now lives in useTweaks via localStorage. Panel toggles via Ctrl+, (or Cmd+,).
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const PANEL_CSS = `
.twk-fab{position:fixed;right:16px;bottom:16px;z-index:2147483645;width:36px;height:36px;border:0;border-radius:18px;background:rgba(15,23,42,.85);color:#fff;cursor:pointer;display:grid;place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.18);font-size:14px}
.twk-fab:hover{background:rgba(15,23,42,.95)}
.twk-panel{position:fixed;right:16px;bottom:60px;z-index:2147483646;width:280px;max-height:calc(100vh - 88px);display:flex;flex-direction:column;background:rgba(250,249,247,.92);color:#29261b;-webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);border:.5px solid rgba(255,255,255,.6);border-radius:14px;box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
.twk-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 8px 10px 14px;cursor:move;user-select:none}
.twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
.twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1}
.twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
.twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;overflow-x:hidden;min-height:0;scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
.twk-body::-webkit-scrollbar{width:8px}
.twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
.twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;border:2px solid transparent;background-clip:content-box}
.twk-row{display:flex;flex-direction:column;gap:5px}
.twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
.twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
.twk-lbl>span:first-child{font-weight:500}
.twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}
.twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:rgba(41,38,27,.45);padding:10px 0 0}
.twk-sect:first-child{padding-top:0}
.twk-field{appearance:none;width:100%;height:26px;padding:0 8px;border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
.twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
select.twk-field{padding-right:22px;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");background-repeat:no-repeat;background-position:right 8px center}
.twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;border-radius:999px;background:rgba(0,0,0,.12);outline:none}
.twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:pointer}
.twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:pointer}
.twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;background:rgba(0,0,0,.06);user-select:none}
.twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
.twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;background:transparent;color:inherit;font:inherit;font-weight:500;height:22px;border-radius:6px;cursor:pointer;padding:0}
.twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;background:rgba(0,0,0,.15);transition:background .15s;cursor:pointer;padding:0}
.twk-toggle[data-on="1"]{background:#34c759}
.twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
.twk-toggle[data-on="1"] i{transform:translateX(14px)}
.twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:pointer;background:transparent;flex-shrink:0}
.twk-swatch::-webkit-color-swatch-wrapper{padding:0}
.twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
`;

interface TweaksPanelProps {
  title?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function TweaksPanel({ title = "Tweaks", children, defaultOpen = false }: TweaksPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <style>{PANEL_CSS}</style>
      <button
        type="button"
        className="twk-fab"
        title="Tweaks (Ctrl+,)"
        aria-label="Open tweaks panel"
        onClick={() => setOpen((o) => !o)}
      >
        <i className="fa-solid fa-sliders" aria-hidden />
      </button>
      {open && (
        <div className="twk-panel" role="dialog" aria-label={title}>
          <div className="twk-hd">
            <b>{title}</b>
            <button
              type="button"
              className="twk-x"
              aria-label="Close tweaks"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="twk-body">{children}</div>
        </div>
      )}
    </>
  );
}

// ── Control primitives ──────────────────────────────────────────────────────

interface TweakSectionProps {
  label: string;
  children?: ReactNode;
}
export function TweakSection({ label, children }: TweakSectionProps) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

interface TweakRowProps {
  label: string;
  value?: ReactNode;
  children?: ReactNode;
  inline?: boolean;
}
export function TweakRow({ label, value, children, inline = false }: TweakRowProps) {
  return (
    <div className={inline ? "twk-row twk-row-h" : "twk-row"}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

interface TweakSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}
export function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  onChange,
}: TweakSliderProps) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input
        type="range"
        className="twk-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </TweakRow>
  );
}

interface TweakToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}
export function TweakToggle({ label, value, onChange }: TweakToggleProps) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl">
        <span>{label}</span>
      </div>
      <button
        type="button"
        className="twk-toggle"
        data-on={value ? "1" : "0"}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
      >
        <i />
      </button>
    </div>
  );
}

interface TweakRadioOption {
  value: string;
  label: string;
}
interface TweakRadioProps {
  label: string;
  value: string;
  options: ReadonlyArray<string | TweakRadioOption>;
  onChange: (v: string) => void;
}
export function TweakRadio({ label, value, options, onChange }: TweakRadioProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const opts: TweakRadioOption[] = options.map((o) =>
    typeof o === "object" ? o : { value: o, label: o },
  );
  const idx = Math.max(
    0,
    opts.findIndex((o) => o.value === value),
  );
  const n = opts.length;

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" className="twk-seg">
        <div
          className="twk-seg-thumb"
          style={{
            left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
            width: `calc((100% - 4px) / ${n})`,
          }}
        />
        {opts.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

interface TweakSelectProps {
  label: string;
  value: string;
  options: ReadonlyArray<string | TweakRadioOption>;
  onChange: (v: string) => void;
}
export function TweakSelect({ label, value, options, onChange }: TweakSelectProps) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === "object" ? o.value : o;
          const l = typeof o === "object" ? o.label : o;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </TweakRow>
  );
}

interface TweakColorProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}
export function TweakColor({ label, value, onChange }: TweakColorProps) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl">
        <span>{label}</span>
      </div>
      <input
        type="color"
        className="twk-swatch"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// AppTweaks — concrete panel binding the VeltaCore tweak schema. Lives here
// (vs the App.tsx file) so the form lives next to its inputs.
import type { Tweaks } from "@/types";

interface AppTweaksProps {
  t: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, val: Tweaks[K]) => void;
}
export function AppTweaks({ t, setTweak }: AppTweaksProps) {
  // useCallback prevents re-binding child handlers on every render.
  const set = useCallback(
    <K extends keyof Tweaks>(k: K) =>
      (v: Tweaks[K]) =>
        setTweak(k, v),
    [setTweak],
  );
  return (
    <TweaksPanel title="VeltaCore tweaks">
      <TweakSection label="Theme">
        <TweakColor label="Accent" value={t.accent} onChange={set("accent")} />
        <TweakToggle label="Dark mode" value={t.dark} onChange={set("dark")} />
        <TweakRadio
          label="Style preset"
          value={t.stylePreset}
          options={["graphite", "porcelain", "ink", "neon"]}
          onChange={(v) => setTweak("stylePreset", v as Tweaks["stylePreset"])}
        />
        <TweakRadio
          label="Innovation"
          value={t.innovationLevel}
          options={["calm", "elevated", "bold"]}
          onChange={(v) => setTweak("innovationLevel", v as Tweaks["innovationLevel"])}
        />
      </TweakSection>
      <TweakSection label="Layout">
        <TweakRadio
          label="Density"
          value={t.density}
          options={["compact", "comfortable", "spacious"]}
          onChange={(v) => setTweak("density", v as Tweaks["density"])}
        />
        <TweakRadio
          label="Sidebar"
          value={t.sidebarStyle}
          options={["navy", "white", "graphite"]}
          onChange={(v) => setTweak("sidebarStyle", v as Tweaks["sidebarStyle"])}
        />
        <TweakRadio
          label="Incident layout"
          value={t.incidentLayout}
          options={["triage", "split", "stacked"]}
          onChange={(v) => setTweak("incidentLayout", v as Tweaks["incidentLayout"])}
        />
        <TweakSlider
          label="Font size"
          value={t.fontSize}
          min={11}
          max={18}
          unit="px"
          onChange={set("fontSize")}
        />
      </TweakSection>
      <TweakSection label="Charts">
        <TweakToggle label="Sparklines" value={t.showSparklines} onChange={set("showSparklines")} />
      </TweakSection>
    </TweaksPanel>
  );
}
