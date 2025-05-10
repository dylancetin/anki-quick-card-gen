import { useEffect } from "react";
import { Draft } from "immer";
import { useImmer } from "./use-immer";

export type DraftFunction<S> = (draft: Draft<S>) => void;
export type Updater<S> = (arg: S | DraftFunction<S>) => void;

function setLocalStorageItem(key: string, value: any) {
  const stringified = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, stringified);
  } catch (error) {
    console.error(
      `useImmerLocalStorage: Could not set localStorage item for key "${key}":`,
      error,
    );
  }
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
  const [value, setValue] = useImmer<T | undefined>(() => {
    const prevValue = getLocalStorageItem(key);
    if (prevValue) {
      return JSON.parse(prevValue);
    }
    return initialValue === undefined
      ? undefined
      : typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue;
  });

  useEffect(() => {
    setLocalStorageItem(key, value);
  }, [key, value]);

  return [value, setValue];
}
