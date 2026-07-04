import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill } from "@/components";
import { DEVICES, deviceById, deviceKindById } from "@/data";
import type { DeviceStatus } from "@/types";

const STATUS_COLOR: Record<DeviceStatus, string> = {
  ok: "#10b981",
  warn: "#f59e0b",
  critical: "#dc2626",
  down: "#64748b",
};

const RACK_HEIGHT = 42;

// Physical layout for Bangalore DC-1 rows A/B. Presentation-only mapping:
// device id → rack, bottom U position, height in U. Devices not racked here
// (VMs, exporters, branch gear) simply don't appear.
interface RackSlot {
  deviceId: string;
  u: number;
  h: number;
}
interface RackDef {
  id: string;
  name: string;
  row: string;
  slots: RackSlot[];
}

const RACKS: readonly RackDef[] = [
  {
    id: "rack-a1",
    name: "BLR-A1 · Network core",
    row: "Row A",
    slots: [
      { deviceId: "RTR-BLR-EDGE-01", u: 39, h: 3 },
      { deviceId: "FW-BLR-CORE-01", u: 35, h: 3 },
      { deviceId: "FW-BLR-DMZ-02", u: 32, h: 2 },
      { deviceId: "SW-BLR-CORE-01", u: 29, h: 2 },
      { deviceId: "SW-BLR-CORE-02", u: 26, h: 2 },
      { deviceId: "SW-BLR-DIST-04", u: 23, h: 2 },
      { deviceId: "LB-BLR-PROD-01", u: 19, h: 2 },
      { deviceId: "LB-BLR-PROD-02", u: 16, h: 2 },
      { deviceId: "UPS-BLR-A", u: 1, h: 8 },
    ],
  },
  {
    id: "rack-b2",
    name: "BLR-B2 · Compute + storage",
    row: "Row B",
    slots: [
      { deviceId: "SW-BLR-TOR-12", u: 41, h: 1 },
      { deviceId: "SW-BLR-TOR-13", u: 39, h: 1 },
      { deviceId: "ESX-BLR-01", u: 34, h: 2 },
      { deviceId: "ESX-BLR-02", u: 31, h: 2 },
      { deviceId: "BARE-BLR-DB-01", u: 27, h: 2 },
      { deviceId: "BARE-BLR-DB-02", u: 24, h: 2 },
      { deviceId: "WIN-SQL-PROD-01", u: 20, h: 2 },
      { deviceId: "SAN-BLR-PROD-01", u: 13, h: 4 },
      { deviceId: "NAS-BLR-01", u: 9, h: 3 },
      { deviceId: "UPS-BLR-B", u: 1, h: 8 },
    ],
  },
];

export function RackScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  const stats = useMemo(() => {
    const slots = RACKS.flatMap((r) => r.slots);
    const usedU = slots.reduce((a, s) => a + s.h, 0);
    const totalU = RACKS.length * RACK_HEIGHT;
    const issues = slots
      .map((s) => deviceById(s.deviceId))
      .filter((d) => d && d.status !== "ok").length;
    return {
      racked: slots.length,
      usedU,
      totalU,
      occupancy: Math.round((usedU / totalU) * 100),
      issues,
    };
  }, []);

  const selDevice = selected ? deviceById(selected) : null;

  return (
    <div className="page page-fade sn-dash">
      <div className="sn-breadcrumb">
        <Link to="/dashboard" className="sn-link">
          Home
        </Link>
        <span className="sn-bc-sep">›</span>
        <Link to="/infra" className="sn-link">
          Infrastructure
        </Link>
        <span className="sn-bc-sep">›</span>
        <span>Datacenter rack</span>
      </div>

      <div className="sn-form-header">
        <div className="sn-form-title-row">
          <span className="sn-rec-number">DC-BLR-1</span>
          {stats.issues > 0 && <Pill kind="warning">{stats.issues} units with issues</Pill>}
          <Pill kind="neutral" noDot>
            {stats.occupancy}% occupancy
          </Pill>
        </div>
        <div className="sn-form-title-meta">
          <h1>Rack elevation · Bangalore DC-1</h1>
          <div className="sn-form-sub">
            {RACKS.length} racks · {stats.racked} racked devices · {stats.usedU}U used of{" "}
            {stats.totalU}U · click a unit for details
          </div>
        </div>
        <div className="sn-form-actions">
          <button
            type="button"
            className="sn-btn"
            onClick={() => setSelected(null)}
            disabled={!selected}
          >
            <i className="fa-solid fa-arrows-rotate" /> Clear selection
          </button>
          <button type="button" className="sn-btn">
            <i className="fa-solid fa-print" /> Print elevation
          </button>
        </div>
      </div>

      <div className="sn-form-layout">
        <div className="sn-form-main">
          <div className="rack-floor">
            {RACKS.map((rack) => (
              <RackElevation
                key={rack.id}
                rack={rack}
                selected={selected}
                onSelect={(id) => setSelected(id === selected ? null : id)}
              />
            ))}
          </div>
          <div className="rack-legend">
            {(["ok", "warn", "critical", "down"] as DeviceStatus[]).map((s) => (
              <span key={s} className="rack-legend-item">
                <span className="rack-swatch" style={{ background: STATUS_COLOR[s] }} /> {s}
              </span>
            ))}
            <span className="rack-legend-item">
              <span className="rack-swatch rack-swatch-empty" /> free U
            </span>
          </div>
        </div>

        <aside className="sn-form-side">
          {selDevice ? (
            <div className="sn-side-card">
              <div className="sn-side-head">Selected unit</div>
              <div className="sn-side-body">
                <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>
                  {selDevice.id}
                </div>
                <div className="text-mute" style={{ fontSize: 12, marginBottom: 8 }}>
                  {selDevice.model}
                </div>
                <SideRow k="Role" v={selDevice.role} />
                <SideRow k="Status" v={selDevice.status} />
                <SideRow k="IP" v={selDevice.ip} mono />
                <SideRow k="OS" v={selDevice.os} />
                <SideRow k="Uptime" v={selDevice.uptime} />
                <Link
                  to={`/infra/device/${selDevice.id}`}
                  className="sn-btn primary"
                  style={{ marginTop: 10, width: "100%", justifyContent: "center" }}
                >
                  <i className="fa-solid fa-up-right-from-square" /> Open Node 360
                </Link>
              </div>
            </div>
          ) : (
            <div className="sn-side-card">
              <div className="sn-side-head">Physical view</div>
              <div className="sn-side-body">
                <p style={{ fontSize: 12.5, color: "var(--fg-subtle)", margin: 0 }}>
                  Elevation reflects the CMDB rack assignments (device → rack → site). Select any
                  unit to inspect it, or open Node 360 for live telemetry.
                </p>
              </div>
            </div>
          )}

          <div className="sn-side-card">
            <div className="sn-side-head">Power &amp; cooling</div>
            <div className="sn-side-body">
              {DEVICES.filter((d) => d.kind === "ups" && d.site === "dc-blr-1").map((u) => (
                <div key={u.id} className="sn-related-row">
                  <div>
                    <div className="sn-related-title mono" style={{ fontSize: 12 }}>
                      {u.id}
                    </div>
                    <div className="sn-related-meta">{u.role}</div>
                  </div>
                  <Pill kind={u.status === "ok" ? "success" : "warning"}>{u.status}</Pill>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

function RackElevation({
  rack,
  selected,
  onSelect,
}: {
  rack: RackDef;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  // Build a U→slot map; iterate top (42) → bottom (1).
  const occupied = new Map<number, RackSlot>();
  for (const slot of rack.slots) {
    for (let u = slot.u; u < slot.u + slot.h; u++) occupied.set(u, slot);
  }

  const rows: React.ReactNode[] = [];
  for (let u = RACK_HEIGHT; u >= 1; u--) {
    const slot = occupied.get(u);
    if (slot && u === slot.u + slot.h - 1) {
      // Top U of a device — render the full unit spanning slot.h rows.
      const device = deviceById(slot.deviceId);
      const kind = device && deviceKindById(device.kind);
      const isSel = selected === slot.deviceId;
      rows.push(
        <button
          type="button"
          key={`d-${slot.deviceId}`}
          className={`rack-unit${isSel ? " selected" : ""}`}
          style={{
            height: slot.h * 18 + (slot.h - 1) * 2,
            borderLeftColor: device ? STATUS_COLOR[device.status] : "#64748b",
          }}
          onClick={() => onSelect(slot.deviceId)}
          title={device ? `${device.id} · ${device.model}` : slot.deviceId}
        >
          {kind && (
            <i
              className={`fa-${kind.iconBrand ? "brands" : "solid"} ${kind.icon}`}
              style={{ color: kind.color, fontSize: 11 }}
            />
          )}
          <span className="rack-unit-id mono">{slot.deviceId}</span>
          <span className="rack-unit-u mono">
            {slot.h}U · U{slot.u}
          </span>
        </button>,
      );
    } else if (!slot) {
      rows.push(<div key={`e-${u}`} className="rack-unit-empty" title={`U${u} free`} />);
    }
    // Us covered by a taller device render nothing extra.
  }

  return (
    <div className="rack">
      <div className="rack-head">
        <b>{rack.name}</b>
        <span className="text-mute" style={{ fontSize: 11 }}>
          {rack.row} · {RACK_HEIGHT}U
        </span>
      </div>
      <div className="rack-body">{rows}</div>
    </div>
  );
}

function SideRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="rack-side-row">
      <span>{k}</span>
      <span className={mono ? "mono" : ""}>{v}</span>
    </div>
  );
}

const STYLES = `
  .rack-floor{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
  .rack{border:1px solid var(--border,#e2e8f0);border-radius:10px;overflow:hidden;background:var(--bg,#fff)}
  .rack-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-muted,#f8fafc);border-bottom:1px solid var(--border,#e2e8f0);font-size:13px}
  .rack-body{display:flex;flex-direction:column;gap:2px;padding:8px}
  .rack-unit{display:flex;align-items:center;gap:8px;padding:0 10px;border:1px solid var(--border,#e2e8f0);border-left-width:4px;border-radius:4px;background:var(--bg,#fff);cursor:pointer;font:inherit;color:var(--fg);text-align:left;min-height:18px}
  .rack-unit:hover{background:var(--bg-muted,#f8fafc)}
  .rack-unit.selected{box-shadow:0 0 0 2px var(--accent);border-color:var(--accent)}
  .rack-unit-id{font-size:10.5px;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rack-unit-u{font-size:9.5px;color:var(--fg-subtle);flex-shrink:0}
  .rack-unit-empty{height:18px;border-radius:3px;background:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(0,0,0,0.04) 5px,rgba(0,0,0,0.04) 10px)}
  .rack-legend{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;padding:10px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;font-size:11.5px;color:var(--fg-subtle)}
  .rack-legend-item{display:inline-flex;align-items:center;gap:6px}
  .rack-swatch{width:12px;height:12px;border-radius:3px;display:inline-block}
  .rack-swatch-empty{background:repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(0,0,0,0.12) 3px,rgba(0,0,0,0.12) 6px);border:1px solid var(--border,#e2e8f0)}
  .rack-side-row{display:flex;justify-content:space-between;gap:10px;font-size:12px;padding:4px 0;border-top:1px solid var(--border,#f1f5f9)}
  .rack-side-row>span:first-child{color:var(--fg-subtle)}
`;
