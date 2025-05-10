import * as React from "react";
import { useSyncExternalStore } from "react";
import { produce, Draft, freeze } from "immer"; // Assuming immer is installed

export type DraftFunction<S> = (draft: Draft<S>) => void;
export type Updater<S> = (arg: S | DraftFunction<S>) => void;

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
  try {
    window.localStorage.setItem(key, stringified);
    dispatchStorageEvent(key, stringified);
  } catch (error) {
    console.error(
      `useImmerLocalStorage: Could not set localStorage item for key "${key}":`,
      error,
    );
  }
}

function removeLocalStorageItem(key: string) {
  window.localStorage.removeItem(key);
  dispatchStorageEvent(key, null);
}

function getLocalStorageItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(
      `useImmerLocalStorage: Could not get localStorage item for key "${key}":`,
      error,
    );
    return null;
  }
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
  throw new Error("useImmerLocalStorage is a client-only hook");
}

export function useImmerLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Updater<T>];

export function useImmerLocalStorage<T>(
  key: string,
): [T | undefined, Updater<T | undefined>];

export function useImmerLocalStorage<T>(
  key: string,
  initialValue?: T | (() => T),
): [T | undefined, Updater<T | undefined>] {
  const store = useSyncExternalStore(
    subscribe(key),
    () => getLocalStorageItem(key),
    getServerSnapshot,
  );

  const value = React.useMemo(() => {
    if (store !== null) {
      try {
        const parsed = JSON.parse(store);
        return parsed as T | undefined;
      } catch (error) {
        console.error(
          `useImmerLocalStorage: Could not parse stored value for key "${key}". Falling back to initial value logic.`,
          error,
        );
      }
    }
    if (initialValue === undefined) {
      return undefined;
    } else if (typeof initialValue === "function") {
      return (initialValue as () => T | undefined)();
    } else {
      return initialValue as T | undefined;
    }
  }, [store, key, initialValue]); // Recalculate if store, key, or initialValue definition changes

  const frozenValue = React.useMemo(() => freeze(value, true), [value]);

  const setImmerValue = React.useCallback<Updater<T | undefined>>(
    (updater) => {
      const currentValueForImmer = value;

      let nextState: T | undefined;

      if (typeof updater === "function") {
        nextState = produce(currentValueForImmer, updater as DraftFunction<T>);
      } else {
        nextState = freeze(updater);
      }

      if (nextState === undefined || nextState === null) {
        removeLocalStorageItem(key);
      } else {
        setLocalStorageItem(key, nextState);
      }
    },
    [key, value],
  );

  React.useEffect(() => {
    const storedValue = getLocalStorageItem(key);
    if (
      storedValue === null &&
      initialValue !== undefined &&
      typeof initialValue !== "function"
    ) {
      console.log(
        `[useImmerLocalStorage] Seeding initial value for key "${key}"`,
      );
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  return [frozenValue, setImmerValue];
}
