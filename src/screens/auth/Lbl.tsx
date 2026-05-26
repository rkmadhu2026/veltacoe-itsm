import type { ReactNode } from "react";

interface LblProps {
  l: string;
  children: ReactNode;
}

export function Lbl({ l, children }: LblProps) {
  return (
    <div className="auth-field">
      <label>{l}</label>
      {children}
    </div>
  );
}
