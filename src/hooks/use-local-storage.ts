import * as React from "react";
import { useSyncExternalStore } from "react";

function dispatchStorageEvent(key: string, newValue: string | null) {
  window.dispatchEvent(
    new StorageEvent("storage", {
      key,
      newValue,
      storageArea: window.localStorage,
      oldValue: null,
      url: window.location.href,
    }),
  );
}

function setLocalStorageItem(key: string, value: any) {
  const stringified = JSON.stringify(value);
  window.localStorage.setItem(key, stringified);
  dispatchStorageEvent(key, stringified);
}

function removeLocalStorageItem(key: string) {
  window.localStorage.removeItem(key);
  dispatchStorageEvent(key, null);
}

function getLocalStorageItem(key: string): string | null {
  return window.localStorage.getItem(key);
}

function subscribe(key: string) {
  return (onStoreChange: () => void) => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) {
        onStoreChange();
      }
    };
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  };
}

function getServerSnapshot(): string | null {
  throw new Error("useLocalStorage is a client-only hook");
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>];
export function useLocalStorage<T>(
  key: string,
): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>];
export function useLocalStorage<T>(
  key: string,
  initialValue?: T,
): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>] {
  const getSnapshot = () => getLocalStorageItem(key);
  const store = useSyncExternalStore(
    subscribe(key),
    getSnapshot,
    getServerSnapshot,
  );
  const value = store != null ? (JSON.parse(store) as T) : initialValue;

  const setValue = React.useCallback<
    React.Dispatch<React.SetStateAction<T | undefined>>
  >(
    (v) => {
      const next =
        typeof v === "function"
          ? (v as (prev: T | undefined) => T | undefined)(value)
          : v;
      if (next === undefined || next === null) {
        removeLocalStorageItem(key);
      } else {
        setLocalStorageItem(key, next);
      }
    },
    [key, value],
  );

  React.useEffect(() => {
    if (getLocalStorageItem(key) === null && initialValue !== undefined) {
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  return [value, setValue];
}
