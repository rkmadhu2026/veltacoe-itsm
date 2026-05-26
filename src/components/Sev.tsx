import type { Severity } from "@/types";

interface SevProps {
  n: Severity;
}

export function Sev({ n }: SevProps) {
  return <span className={`sev sev-${n}`}>SEV {n}</span>;
}
