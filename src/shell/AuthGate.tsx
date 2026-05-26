import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";

/**
 * AuthGate — wraps protected routes. Redirects to "/" when unauthenticated.
 * Preserves the attempted path in location.state so post-login navigation
 * can resume the original target (future enhancement).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const location = useLocation();
  if (!authed) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
