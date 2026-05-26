import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "veltacore.auth.v1";

interface AuthState {
  authed: boolean;
  login: () => void;
  logout: () => void;
}

/**
 * Mock authentication — flips an `authed` boolean persisted to localStorage.
 * Real SSO/SAML/Entra integration replaces this hook later; consumers only
 * need to know `authed` + `login()` + `logout()`.
 */
export function useAuth(): AuthState {
  const [authed, setAuthed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, authed ? "1" : "0");
    } catch {
      // best-effort persistence
    }
  }, [authed]);

  const login = useCallback(() => setAuthed(true), []);
  const logout = useCallback(() => setAuthed(false), []);

  return { authed, login, logout };
}
