import { TenantProvider } from "@/shell/TenantContext";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <TenantProvider>
      <AppRoutes />
    </TenantProvider>
  );
}
