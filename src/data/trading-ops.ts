import type {
  AdapterCheck,
  BodEodCell,
  CheckState,
  FileTransferCheck,
  Holiday,
  QueueCheck,
  SyntheticCheck,
  TradingStep,
} from "@/types";

// ── Holiday calendar (exchange trading holidays) ─────────────────────────────

export const HOLIDAYS: readonly Holiday[] = [
  { date: "2026-07-17", name: "Muharram", markets: ["NSE", "BSE", "MCX (morning)"] },
  { date: "2026-08-15", name: "Independence Day", markets: ["NSE", "BSE", "MCX"] },
  { date: "2026-08-28", name: "Ganesh Chaturthi", markets: ["NSE", "BSE"] },
  { date: "2026-10-02", name: "Gandhi Jayanti", markets: ["NSE", "BSE", "MCX"] },
  { date: "2026-10-20", name: "Diwali (Muhurat session only)", markets: ["NSE", "BSE"] },
];

// ── BOD / EOD workflow steps ─────────────────────────────────────────────────
// Today's run: BOD finished (one warning, one manual override); EOD is queued
// with the first step running.

export const TRADING_STEPS: readonly TradingStep[] = [
  // BOD — begins 07:30 IST, must complete before 09:00 market pre-open.
  {
    id: "bod-1",
    workflow: "BOD",
    seq: 1,
    name: "Holiday calendar gate",
    description: "Confirm today is a trading day for all configured segments",
    state: "PASSED",
    scheduledAt: "07:30",
    duration: "2s",
    owner: "trading-ops",
  },
  {
    id: "bod-2",
    workflow: "BOD",
    seq: 2,
    name: "Infra pre-flight",
    description: "Ping/SSH all trading hosts, verify NTP drift < 50ms",
    state: "PASSED",
    scheduledAt: "07:32",
    duration: "48s",
    owner: "platform",
  },
  {
    id: "bod-3",
    workflow: "BOD",
    seq: 3,
    name: "Database health",
    description: "Primary/standby lag, tablespace, overnight batch completion",
    state: "PASSED",
    scheduledAt: "07:35",
    duration: "31s",
    owner: "dba",
  },
  {
    id: "bod-4",
    workflow: "BOD",
    seq: 4,
    name: "Start exchange adapters",
    description: "NSE-FO, NSE-CM, BSE, MCX adapters up with session logon",
    state: "PASSED",
    scheduledAt: "07:40",
    duration: "1m 12s",
    owner: "trading-ops",
  },
  {
    id: "bod-5",
    workflow: "BOD",
    seq: 5,
    name: "Master file import",
    description: "Security master, contract master, band files from exchange SFTP",
    state: "MANUAL_OVERRIDE",
    scheduledAt: "07:45",
    duration: "6m 40s",
    owner: "trading-ops",
    note: "BSE band file re-published late by exchange; imported v2 manually, checksum verified",
  },
  {
    id: "bod-6",
    workflow: "BOD",
    seq: 6,
    name: "Risk limits load",
    description: "Client margin limits + dealer limits pushed to OMS",
    state: "PASSED",
    scheduledAt: "07:55",
    duration: "58s",
    owner: "risk-ops",
  },
  {
    id: "bod-7",
    workflow: "BOD",
    seq: 7,
    name: "Synthetic order round-trip",
    description: "Test order to exchange UAT loop, ack < 150ms",
    state: "WARNING",
    scheduledAt: "08:10",
    duration: "22s",
    owner: "trading-ops",
    note: "Ack 182ms on NSE-FO — above 150ms threshold, within hard limit",
  },
  {
    id: "bod-8",
    workflow: "BOD",
    seq: 8,
    name: "BOD sign-off",
    description: "Checklist snapshot + operator approval recorded to audit trail",
    state: "PASSED",
    scheduledAt: "08:30",
    duration: "4s",
    owner: "noc",
  },

  // EOD — begins 16:00 IST after market close.
  {
    id: "eod-1",
    workflow: "EOD",
    seq: 1,
    name: "Market close confirmation",
    description: "All segments closed, no open synthetic sessions",
    state: "RUNNING",
    scheduledAt: "16:00",
    duration: null,
    owner: "trading-ops",
  },
  {
    id: "eod-2",
    workflow: "EOD",
    seq: 2,
    name: "Trade file reconciliation",
    description: "OMS fills vs exchange trade files, zero-diff gate",
    state: "PENDING",
    scheduledAt: "16:15",
    duration: null,
    owner: "risk-ops",
  },
  {
    id: "eod-3",
    workflow: "EOD",
    seq: 3,
    name: "Bhavcopy download",
    description: "Pull bhavcopy + circulars from exchange SFTP",
    state: "PENDING",
    scheduledAt: "16:45",
    duration: null,
    owner: "trading-ops",
  },
  {
    id: "eod-4",
    workflow: "EOD",
    seq: 4,
    name: "Back-office file push",
    description: "Trades/positions export to back-office and custodian",
    state: "PENDING",
    scheduledAt: "17:15",
    duration: null,
    owner: "trading-ops",
  },
  {
    id: "eod-5",
    workflow: "EOD",
    seq: 5,
    name: "Adapter shutdown + log ship",
    description: "Graceful adapter stop, session logs to archive",
    state: "PENDING",
    scheduledAt: "18:00",
    duration: null,
    owner: "platform",
  },
  {
    id: "eod-6",
    workflow: "EOD",
    seq: 6,
    name: "EOD sign-off",
    description: "Daily health checklist emailed, audit record written",
    state: "PENDING",
    scheduledAt: "18:30",
    duration: null,
    owner: "noc",
  },
];

// ── Synthetic checks (curl / TCP / DNS / SSL) ────────────────────────────────

export const SYNTHETIC_CHECKS: readonly SyntheticCheck[] = [
  {
    id: "syn-1",
    kind: "http",
    name: "OMS REST health",
    target: "https://oms.finspot.in/health",
    state: "PASSED",
    latency: "38ms",
    detail: "HTTP 200",
    intervalSec: 30,
    lastRun: "12s ago",
  },
  {
    id: "syn-2",
    kind: "http",
    name: "Exchange gateway API",
    target: "https://gw.finspot.in/v1/status",
    state: "PASSED",
    latency: "61ms",
    detail: "HTTP 200",
    intervalSec: 30,
    lastRun: "9s ago",
  },
  {
    id: "syn-3",
    kind: "http",
    name: "Client portal login",
    target: "https://trade.finspot.in/login",
    state: "WARNING",
    latency: "1.4s",
    detail: "HTTP 200 · above 1s SLO",
    intervalSec: 60,
    lastRun: "31s ago",
  },
  {
    id: "syn-4",
    kind: "tcp",
    name: "NSE-FO order port",
    target: "10.11.5.10:9010",
    state: "PASSED",
    latency: "3ms",
    detail: "SYN/ACK ok",
    intervalSec: 15,
    lastRun: "6s ago",
  },
  {
    id: "syn-5",
    kind: "tcp",
    name: "BSE order port",
    target: "10.11.5.20:9040",
    state: "PASSED",
    latency: "4ms",
    detail: "SYN/ACK ok",
    intervalSec: 15,
    lastRun: "6s ago",
  },
  {
    id: "syn-6",
    kind: "dns",
    name: "Exchange gateway DNS",
    target: "gw.finspot.in",
    state: "PASSED",
    latency: "11ms",
    detail: "A 10.11.5.2 (authoritative)",
    intervalSec: 120,
    lastRun: "48s ago",
  },
  {
    id: "syn-7",
    kind: "ssl",
    name: "Client portal cert",
    target: "trade.finspot.in:443",
    state: "PASSED",
    latency: "—",
    detail: "expires in 74 days",
    intervalSec: 3600,
    lastRun: "22m ago",
  },
  {
    id: "syn-8",
    kind: "ssl",
    name: "Wildcard platform cert",
    target: "linkedeye.finspot.in:443",
    state: "WARNING",
    latency: "—",
    detail: "expires in 11 days",
    intervalSec: 3600,
    lastRun: "22m ago",
  },
];

// ── Exchange adapters ────────────────────────────────────────────────────────

export const ADAPTER_CHECKS: readonly AdapterCheck[] = [
  {
    id: "adp-1",
    name: "nse-fo-adapter",
    segment: "NSE F&O",
    host: "LNX-K8S-W-04",
    state: "PASSED",
    heartbeat: "2s",
    msgRate: "1.8k/s",
    seqGaps: 0,
  },
  {
    id: "adp-2",
    name: "nse-cm-adapter",
    segment: "NSE Cash",
    host: "LNX-K8S-W-04",
    state: "PASSED",
    heartbeat: "1s",
    msgRate: "940/s",
    seqGaps: 0,
  },
  {
    id: "adp-3",
    name: "bse-adapter",
    segment: "BSE",
    host: "vm-prod-api-01",
    state: "WARNING",
    heartbeat: "9s",
    msgRate: "120/s",
    seqGaps: 2,
  },
  {
    id: "adp-4",
    name: "mcx-adapter",
    segment: "MCX",
    host: "vm-prod-api-02",
    state: "PASSED",
    heartbeat: "2s",
    msgRate: "310/s",
    seqGaps: 0,
  },
  {
    id: "adp-5",
    name: "drop-copy-listener",
    segment: "All venues",
    host: "BARE-BLR-DB-02",
    state: "PASSED",
    heartbeat: "3s",
    msgRate: "3.1k/s",
    seqGaps: 0,
  },
];

// ── Queue checks ─────────────────────────────────────────────────────────────

export const QUEUE_CHECKS: readonly QueueCheck[] = [
  {
    id: "q-1",
    queue: "orders.inbound",
    broker: "rabbitmq-prod",
    depth: 12,
    consumers: 8,
    inRate: "1.7k/s",
    outRate: "1.7k/s",
    state: "PASSED",
  },
  {
    id: "q-2",
    queue: "fills.dropcopy",
    broker: "rabbitmq-prod",
    depth: 4,
    consumers: 4,
    inRate: "3.0k/s",
    outRate: "3.0k/s",
    state: "PASSED",
  },
  {
    id: "q-3",
    queue: "notify.dispatch",
    broker: "rabbitmq-prod",
    depth: 6400,
    consumers: 3,
    inRate: "820/s",
    outRate: "540/s",
    state: "WARNING",
  },
  {
    id: "q-4",
    queue: "eod.filejobs",
    broker: "rabbitmq-prod",
    depth: 0,
    consumers: 2,
    inRate: "0/s",
    outRate: "0/s",
    state: "PENDING",
  },
];

// ── File transfer checks ─────────────────────────────────────────────────────

export const FILE_TRANSFERS: readonly FileTransferCheck[] = [
  {
    id: "ft-1",
    name: "Security master (NSE)",
    direction: "inbound",
    source: "sftp.nseindia.com",
    destination: "oms:/data/masters",
    deadline: "07:50",
    state: "PASSED",
    sizeOrNote: "48.2 MB · 07:41",
  },
  {
    id: "ft-2",
    name: "Band file (BSE)",
    direction: "inbound",
    source: "sftp.bseindia.com",
    destination: "oms:/data/masters",
    deadline: "07:50",
    state: "MANUAL_OVERRIDE",
    sizeOrNote: "v2 imported manually · checksum ok",
  },
  {
    id: "ft-3",
    name: "Bhavcopy (NSE)",
    direction: "inbound",
    source: "sftp.nseindia.com",
    destination: "archive:/eod/bhavcopy",
    deadline: "17:00",
    state: "PENDING",
    sizeOrNote: "awaits market close",
  },
  {
    id: "ft-4",
    name: "Trades export → back office",
    direction: "outbound",
    source: "oms:/export/trades",
    destination: "backoffice-sftp:/incoming",
    deadline: "17:30",
    state: "PENDING",
    sizeOrNote: "awaits reconciliation",
  },
  {
    id: "ft-5",
    name: "Positions → custodian",
    direction: "outbound",
    source: "oms:/export/positions",
    destination: "custodian-sftp:/drop",
    deadline: "18:00",
    state: "PENDING",
    sizeOrNote: "awaits reconciliation",
  },
];

// ── BOD/EOD heatmap: step × business day, last 10 sessions ───────────────────

export const BUSINESS_DAYS: readonly string[] = [
  "Jun 22",
  "Jun 23",
  "Jun 24",
  "Jun 25",
  "Jun 26",
  "Jun 29",
  "Jun 30",
  "Jul 1",
  "Jul 2",
  "Jul 3",
];

// Deterministic history: mostly PASSED with a few realistic exceptions.
const HISTORY_EXCEPTIONS: Readonly<Record<string, CheckState>> = {
  "bod-5·Jun 24": "WARNING",
  "bod-7·Jun 24": "FAILED",
  "bod-5·Jun 30": "MANUAL_OVERRIDE",
  "eod-2·Jun 26": "WARNING",
  "eod-4·Jun 26": "FAILED",
  "bod-7·Jul 2": "WARNING",
  "eod-2·Jul 2": "WARNING",
};

export function bodEodHeatmap(): BodEodCell[] {
  const cells: BodEodCell[] = [];
  for (const step of TRADING_STEPS) {
    for (const day of BUSINESS_DAYS) {
      cells.push({
        stepId: step.id,
        day,
        state: HISTORY_EXCEPTIONS[`${step.id}·${day}`] ?? "PASSED",
      });
    }
  }
  return cells;
}

export const tradingStepsFor = (workflow: "BOD" | "EOD"): TradingStep[] =>
  TRADING_STEPS.filter((s) => s.workflow === workflow).sort((a, b) => a.seq - b.seq);
