import { useSyncExternalStore, useMemo, useEffect, useCallback } from "react";
import { Draft, produce } from "immer";

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

export declare type DraftFunction<S> = (draft: Draft<S>) => void;
export declare type Updater<S> = (arg: S | DraftFunction<S>) => void;

export function useImmerLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Updater<T>];

export function useImmerLocalStorage<T>(
  key: string,
): [T | undefined, Updater<T | undefined>];

export function useImmerLocalStorage<T extends {}>(
  key: string,
  initialValue?: T | (() => T),
): [T | undefined, Updater<T | undefined>] {
  const getSnapshot = () => getLocalStorageItem(key);
  const store = useSyncExternalStore(subscribe(key), getSnapshot);

  const value = useMemo(() => {
    return store !== null
      ? (JSON.parse(store) as T)
      : initialValue === undefined
        ? undefined
        : typeof initialValue === "function"
          ? (initialValue as () => T)()
          : initialValue;
  }, [store]);

  const setValue = useCallback<Updater<T | undefined>>(
    (f) => {
      // NOTE:
      // Maybe a bit cursed but
      // This block is here to make ts happier
      // If initial value is undefined,
      // we just pass f or if it is a function
      // then we cant mutate a "undefined" so we console error
      if (value === undefined || value === null) {
        setLocalStorageItem(
          key,
          typeof f === "function"
            ? () => {
                console.error("Cant mutate an undefined value");
                return;
              }
            : f,
        );
        return;
      }

      const next = produce(
        value,
        // @ts-ignore
        f,
      );
      if (next === undefined || next === null) {
        removeLocalStorageItem(key);
      } else {
        setLocalStorageItem(key, next);
      }
      return;
    },
    [key, value],
  );

  useEffect(() => {
    if (
      getLocalStorageItem(key) === null &&
      initialValue !== undefined &&
      typeof initialValue !== "function"
    ) {
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  return [value, setValue];
}
