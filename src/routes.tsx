import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGate } from "@/shell/AuthGate";
import { Layout } from "@/shell/Layout";
import { LandingScreen, SigninScreen, SignupScreen } from "@/screens/auth";
import { DashboardScreen } from "@/screens/dashboard/Dashboard";
import { IncidentDetailScreen } from "@/screens/incidents/IncidentDetail";
import { IncidentsListScreen } from "@/screens/incidents/IncidentsList";
import { OnCallScreen } from "@/screens/on-call/OnCall";
import { StatusPagesScreen } from "@/screens/status-pages/StatusPages";
import { AlertsScreen } from "@/screens/alerts/Alerts";
import { NocOverviewScreen } from "@/screens/infra/NocOverview";
import { AssetInventoryScreen } from "@/screens/infra/AssetInventory";
import { Node360Screen } from "@/screens/infra/Node360";
import { TopologyScreen } from "@/screens/infra/Topology";
import { VirtualizationScreen } from "@/screens/infra/Virtualization";
import { ExportersScreen } from "@/screens/infra/Exporters";
import { RackScreen } from "@/screens/infra/Rack";
import { ApmScreen } from "@/screens/observe/Apm";
import { LogsScreen } from "@/screens/observe/Logs";
import { EntityMapScreen } from "@/screens/observe/EntityMap";
import { OnboardingScreen } from "@/screens/onboarding/Onboarding";
import { TradingOpsScreen } from "@/screens/trading-ops/TradingOps";
import { AutomationScreen } from "@/screens/automation/Automation";
import { ReportsScreen } from "@/screens/reports/Reports";
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

        <Route path="/incidents" element={<IncidentsListScreen />} />
        <Route path="/incidents/new" element={<Placeholder title="New incident" />} />
        <Route path="/incidents/:id" element={<IncidentDetailScreen />} />

        <Route path="/on-call" element={<OnCallScreen />} />
        <Route path="/status-pages" element={<StatusPagesScreen />} />

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
        <Route path="/automation" element={<AutomationScreen />} />
        <Route path="/flow" element={<Placeholder title="Flow Designer" />} />
        <Route path="/reports" element={<ReportsScreen />} />

        <Route path="/apm" element={<ApmScreen />} />
        <Route path="/logs" element={<LogsScreen />} />
        <Route path="/alerts" element={<AlertsScreen />} />
        <Route path="/entity-map" element={<EntityMapScreen />} />

        <Route path="/infra" element={<NocOverviewScreen />} />
        <Route path="/infra/assets" element={<AssetInventoryScreen />} />
        <Route path="/infra/topology" element={<TopologyScreen />} />
        <Route path="/infra/vms" element={<VirtualizationScreen />} />
        <Route path="/infra/rack" element={<RackScreen />} />
        <Route path="/infra/exporters" element={<ExportersScreen />} />
        <Route path="/infra/device/:id" element={<Node360Screen />} />

        <Route path="/integrations" element={<Placeholder title="Integrations" />} />
        <Route path="/integrations/:name" element={<Placeholder />} />

        <Route path="/admin/tenants" element={<Placeholder title="Tenants" />} />
        <Route path="/admin/billing" element={<Placeholder title="Billing & plans" />} />
        <Route path="/admin/usage" element={<Placeholder title="Usage & quotas" />} />

        <Route path="/users" element={<Placeholder title="People & roles" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
        <Route path="/cross-tenant" element={<Placeholder title="Cross-tenant" />} />
        <Route path="/trading-ops" element={<TradingOpsScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
