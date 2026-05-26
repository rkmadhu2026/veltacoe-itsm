import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGate } from "@/shell/AuthGate";
import { Layout } from "@/shell/Layout";
import { LandingScreen, SigninScreen, SignupScreen } from "@/screens/auth";
import { DashboardScreen } from "@/screens/dashboard/Dashboard";
import { Placeholder } from "@/screens/Placeholder";
import { useAuth } from "@/lib/useAuth";

/**
 * Root route table.
 * - "/"      → Landing (or /dashboard if already authed)
 * - "/login" + "/signup" → public auth flows
 * - Everything else lives behind AuthGate + Layout (sidebar/header chrome).
 *
 * Screens not yet migrated render <Placeholder> — the chrome, routing,
 * type system, and data layer are fully functional regardless.
 */
export function AppRoutes() {
  const { authed } = useAuth();

  return (
    <Routes>
      <Route path="/" element={authed ? <Navigate to="/dashboard" replace /> : <LandingScreen />} />
      <Route path="/login" element={<SigninScreen />} />
      <Route path="/signup" element={<SignupScreen />} />

      <Route
        element={
          <AuthGate>
            <Layout />
          </AuthGate>
        }
      >
        <Route path="/dashboard" element={<DashboardScreen />} />

        <Route path="/incidents" element={<Placeholder title="Incidents" />} />
        <Route path="/incidents/new" element={<Placeholder title="New incident" />} />
        <Route path="/incidents/:id" element={<Placeholder />} />

        <Route path="/problems" element={<Placeholder title="Problem management" />} />
        <Route path="/problems/new" element={<Placeholder title="New problem" />} />
        <Route path="/problems/:id" element={<Placeholder />} />

        <Route path="/changes" element={<Placeholder title="Change management" />} />
        <Route path="/changes/:id" element={<Placeholder />} />

        <Route path="/catalog" element={<Placeholder title="Service catalog" />} />
        <Route path="/catalog/request" element={<Placeholder title="Catalog request" />} />

        <Route path="/knowledge" element={<Placeholder title="Knowledge base" />} />
        <Route path="/knowledge/:id" element={<Placeholder />} />

        <Route path="/services" element={<Placeholder title="Services" />} />
        <Route path="/cmdb" element={<Placeholder title="CMDB" />} />
        <Route path="/slas" element={<Placeholder title="SLA definitions" />} />
        <Route path="/runbooks" element={<Placeholder title="Runbooks" />} />
        <Route path="/flow" element={<Placeholder title="Flow Designer" />} />
        <Route path="/reports" element={<Placeholder title="Reports & analytics" />} />

        <Route path="/apm" element={<Placeholder title="APM & traces" />} />
        <Route path="/logs" element={<Placeholder title="Logs" />} />
        <Route path="/alerts" element={<Placeholder title="Alerts" />} />
        <Route path="/entity-map" element={<Placeholder title="Entity map" />} />

        <Route path="/infra" element={<Placeholder title="Infrastructure" />} />
        <Route path="/infra/assets" element={<Placeholder title="Asset inventory" />} />
        <Route path="/infra/topology" element={<Placeholder title="Network topology" />} />
        <Route path="/infra/vms" element={<Placeholder title="Virtual machines" />} />
        <Route path="/infra/rack" element={<Placeholder title="Datacenter rack" />} />
        <Route path="/infra/exporters" element={<Placeholder title="Exporters" />} />
        <Route path="/infra/device/:id" element={<Placeholder />} />

        <Route path="/integrations" element={<Placeholder title="Integrations" />} />
        <Route path="/integrations/:name" element={<Placeholder />} />

        <Route path="/admin/tenants" element={<Placeholder title="Tenants" />} />
        <Route path="/admin/billing" element={<Placeholder title="Billing & plans" />} />
        <Route path="/admin/usage" element={<Placeholder title="Usage & quotas" />} />

        <Route path="/users" element={<Placeholder title="People & roles" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
        <Route path="/cross-tenant" element={<Placeholder title="Cross-tenant" />} />
        <Route path="/onboarding" element={<Placeholder title="Onboarding" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
