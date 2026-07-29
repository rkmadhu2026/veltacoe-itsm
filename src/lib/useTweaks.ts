import { useCallback, useEffect, useState } from "react";
import type { Tweaks } from "@/types";

const STORAGE_KEY = "veltacore.tweaks.v1";

/**
 * useTweaks — single source of truth for theme/UX state.
 * Persists to localStorage instead of the Claude artifact-host postMessage
 * protocol (which doesn't apply outside a hosted artifact iframe).
 */
export function useTweaks<T extends Tweaks>(
  defaults: T,
): [T, <K extends keyof T>(key: K, val: T[K]) => void] {
  const [values, setValues] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const stored = JSON.parse(raw) as Partial<T>;
      return { ...defaults, ...stored };
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {
      // localStorage full or disabled — best-effort persistence.
    }
  }, [values]);

  const setTweak = useCallback(<K extends keyof T>(key: K, val: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  return [values, setTweak];
}
