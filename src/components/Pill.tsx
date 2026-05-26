import type { ReactNode } from "react";

export type PillKind =
  | "neutral"
  | "success"
  | "warning"
  | "critical"
  | "info"
  | "purple"
  | "teal"
  | "amber"
  | "pink";

interface PillProps {
  kind?: PillKind;
  children: ReactNode;
  noDot?: boolean;
}

export function Pill({ kind = "neutral", children, noDot }: PillProps) {
  return <span className={`pill ${kind}${noDot ? " no-dot" : ""}`}>{children}</span>;
}
