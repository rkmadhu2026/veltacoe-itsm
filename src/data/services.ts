import type { ServiceEntry } from "@/types";

export const SERVICES: readonly ServiceEntry[] = [
  { name: "checkout-api", status: "degraded", uptime: 98.4, p95: "420ms", err: 2.1, deps: 6 },
  { name: "auth-svc", status: "healthy", uptime: 99.95, p95: "82ms", err: 0.04, deps: 4 },
  { name: "inventory", status: "degraded", uptime: 99.1, p95: "1.2s", err: 0.8, deps: 9 },
  { name: "notifications", status: "healthy", uptime: 99.8, p95: "210ms", err: 0.12, deps: 3 },
  { name: "warehouse", status: "healthy", uptime: 99.99, p95: "4.1s", err: 0.0, deps: 11 },
  { name: "edge", status: "healthy", uptime: 100, p95: "24ms", err: 0.0, deps: 2 },
  { name: "k8s-control", status: "down", uptime: 97.2, p95: "—", err: 100, deps: 0 },
  { name: "payments-primary", status: "degraded", uptime: 99.2, p95: "2.4s", err: 1.4, deps: 2 },
];
