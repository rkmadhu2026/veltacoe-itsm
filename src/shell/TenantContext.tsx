import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { TENANTS } from "@/data/tenants";
import type { Tenant } from "@/types";

const STORAGE_KEY = "veltacore.tenant.v1";

interface TenantContextValue {
  tenant: Tenant;
  setTenant: (t: Tenant) => void;
  tenants: readonly Tenant[];
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant>(() => {
    try {
      const id = localStorage.getItem(STORAGE_KEY);
      if (id) {
        const found = TENANTS.find((t) => t.id === id);
        if (found) return found;
      }
    } catch {
      // fall through to default
    }
    return TENANTS[0];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, tenant.id);
    } catch {
      // best-effort persistence
    }
  }, [tenant.id]);

  const setTenant = useCallback((t: Tenant) => setTenantState(t), []);
  const value = useMemo(() => ({ tenant, setTenant, tenants: TENANTS }), [tenant, setTenant]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant() used outside TenantProvider");
  return ctx;
}
