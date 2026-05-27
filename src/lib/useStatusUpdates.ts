import { useCallback, useEffect, useState } from "react";
import type { StatusIncidentStage } from "@/types";

const STORAGE_KEY = "veltacore.statusUpdates.v1";

export interface PublishedUpdate {
  id: string;
  /** Source incident id from INCIDENTS */
  incidentId: string;
  /** Status page id from STATUS_PAGES */
  pageId: string;
  /** Component id from STATUS_COMPONENTS */
  componentId: string;
  stage: StatusIncidentStage;
  message: string;
  /** ISO timestamp */
  at: string;
  /** How many subscribers received this update (computed at publish time) */
  subscribers: number;
}

type Listener = (updates: PublishedUpdate[]) => void;
const listeners = new Set<Listener>();

function readStore(): PublishedUpdate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PublishedUpdate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(updates: PublishedUpdate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  } catch {
    // best-effort
  }
  listeners.forEach((l) => l(updates));
}

/**
 * useStatusUpdates — localStorage-backed log of status-page publishes.
 * Multi-tab safe: writeStore broadcasts to all subscribers in the page,
 * and a `storage` event listener handles cross-tab updates.
 */
export function useStatusUpdates() {
  const [updates, setUpdates] = useState<PublishedUpdate[]>(() => readStore());

  useEffect(() => {
    const onChange: Listener = (next) => setUpdates(next);
    listeners.add(onChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUpdates(readStore());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const publish = useCallback((update: Omit<PublishedUpdate, "id" | "at">) => {
    const full: PublishedUpdate = {
      ...update,
      id: `pub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      at: new Date().toISOString(),
    };
    const next = [full, ...readStore()].slice(0, 200); // cap retention
    writeStore(next);
    return full;
  }, []);

  const clear = useCallback(() => writeStore([]), []);

  const forIncident = useCallback(
    (incidentId: string) =>
      updates
        .filter((u) => u.incidentId === incidentId)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [updates],
  );

  const forPage = useCallback(
    (pageId: string) =>
      updates
        .filter((u) => u.pageId === pageId)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [updates],
  );

  return { updates, publish, clear, forIncident, forPage };
}
