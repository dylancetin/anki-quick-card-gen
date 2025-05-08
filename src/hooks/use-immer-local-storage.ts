import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { Updater, useImmer } from "use-immer";

function subscribeKey(key: string) {
  return (notify: () => void) => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) notify();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  };
}

function getSnapshot(key: string): string | null {
  return window.localStorage.getItem(key);
}

function getServerSnapshot(): string | null {
  throw new Error("useImmerLocalStorage is client-only");
}

export function useImmerLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, Updater<T>] {
  const raw = useSyncExternalStore(
    subscribeKey(key),
    () => getSnapshot(key),
    () => getServerSnapshot(),
  );

  const external = raw != null ? (JSON.parse(raw) as T) : initialValue;

  const [state, update] = useImmer<T>(external);

  useEffect(() => {
    update(() => external);
  }, [raw, update, external]);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  return [state, update];
}
