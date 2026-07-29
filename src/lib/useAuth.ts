import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "veltacore.auth.v1";

// Shared auth state backed by localStorage. Previously this hook kept per-
// component `useState`, so each consumer (AuthGate, AppRoutes, Signin, …) held
// an independent copy: calling login() in one never updated the others, and the
// localStorage write was deferred to an effect — so AuthGate could mount and
// read a stale "0" before the write landed, bouncing the user back to "/".
//
// It's now a single external store: login()/logout() write localStorage
// synchronously and notify every subscriber, so all consumers re-render in
// lockstep and a synchronous navigate() sees the committed value immediately.

const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function write(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // best-effort persistence
  }
  listeners.forEach((notify) => notify());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  // Keep other tabs/windows in sync too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

interface AuthState {
  authed: boolean;
  login: () => void;
  logout: () => void;
}

/**
 * Mock authentication — flips a shared `authed` boolean persisted to
 * localStorage. Real SSO/SAML/Entra integration replaces this hook later;
 * consumers only need to know `authed` + `login()` + `logout()`.
 */
export function useAuth(): AuthState {
  const authed = useSyncExternalStore(subscribe, read, () => false);
  const login = useCallback(() => write(true), []);
  const logout = useCallback(() => write(false), []);
  return { authed, login, logout };
}
