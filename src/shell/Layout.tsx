import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTweaks } from "@/lib/useTweaks";
import { AppTweaks } from "@/tweaks/TweaksPanel";
import { TWEAK_DEFAULTS } from "@/tweaks/defaults";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { TenantSwitcher } from "./TenantSwitcher";

const NO_CHROME_PATHS = new Set(["/onboarding"]);

/**
 * Layout — authenticated chrome wrapper. Sidebar + Header + main outlet.
 * Theming side-effects (CSS vars, data-* attrs) are applied per tweak change.
 * Cmd-K opens the tenant switcher.
 */
export function Layout() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const location = useLocation();
  const noChrome = NO_CHROME_PATHS.has(location.pathname);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", tweaks.accent);
    document.body.setAttribute("data-theme", tweaks.dark ? "dark" : "light");
    document.body.setAttribute("data-style", tweaks.stylePreset);
    document.body.setAttribute("data-innovation", tweaks.innovationLevel);
    document.body.setAttribute("data-density", tweaks.density);
    document.body.setAttribute("data-sidebar", tweaks.sidebarStyle);
    document.body.style.fontSize = tweaks.fontSize + "px";
  }, [tweaks]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Case-insensitive so the shortcut survives Caps Lock / Shift.
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSwitcherOpen(true);
      } else if (e.key === "Escape") {
        setSwitcherOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className={`app${noChrome ? " no-chrome" : ""}`}>
        {!noChrome && <Sidebar onOpenSwitcher={() => setSwitcherOpen(true)} />}
        {!noChrome && <Header onOpenCommand={() => setSwitcherOpen(true)} />}
        <main className="main">
          <Outlet />
        </main>
      </div>
      <TenantSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
      <AppTweaks t={tweaks} setTweak={setTweak} />
    </>
  );
}
