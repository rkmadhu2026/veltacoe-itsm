import { useLocation } from "react-router-dom";

/**
 * Placeholder — rendered for routes whose legacy screen hasn't been migrated
 * to TypeScript yet. The architectural skeleton (router + chrome + data layer)
 * is in place; each remaining screen is a swap-in.
 */
export function Placeholder({ title }: { title?: string }) {
  const location = useLocation();
  const label = title ?? location.pathname.replace(/^\//, "").replace(/\//g, " · ");
  return (
    <div className="page page-fade narrow">
      <div className="page-head">
        <div className="page-title">
          <h1>{label || "Dashboard"}</h1>
          <div className="subtitle">
            Screen migrated to the new architecture skeleton — full content lands in the next pass.
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body" style={{ padding: 32, color: "var(--fg-subtle)", fontSize: 13 }}>
          <p style={{ margin: "0 0 12px" }}>
            <i
              className="fa-solid fa-circle-info"
              style={{ marginRight: 8, color: "var(--accent)" }}
            />
            This route is wired into the new React Router + TypeScript shell. The legacy{" "}
            <code>screens/*.jsx</code> source is still on disk and will be ported to{" "}
            <code>src/screens/</code> as part of subsequent phases.
          </p>
          <p style={{ margin: 0 }}>
            Path: <code>{location.pathname}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
