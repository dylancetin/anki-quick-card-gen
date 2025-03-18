import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TaskName = string;
export const t = Object.assign(toast, {
  asyncPromise: async <T>(
    promise: Promise<T>,
    settings?:
      | TaskName
      | {
          onSuccess?: string;
          onError?: string;
          onPending?: string;
        },
  ): Promise<T> => {
    const toastMessages: {
      onSuccess: string;
      onError: string;
      onPending: string;
    } = {
      onSuccess:
        settings === undefined
          ? "Successfully completed"
          : typeof settings === "string"
            ? `${settings} operation completed successfully`
            : (settings.onSuccess ?? "Successfully completed"),
      onError:
        settings === undefined
          ? "An unexpected error occurred!"
          : typeof settings === "string"
            ? `An error occurred during ${settings} operation!`
            : (settings.onError ?? "An unexpected error occurred!"),
      onPending:
        settings === undefined
          ? "Loading.."
          : typeof settings === "string"
            ? `Loading ${settings}...`
            : (settings.onPending ?? "Loading.."),
    };
    const toastId = toast.loading(toastMessages.onPending);
    try {
      const res = await promise;
      return res;
    } catch (e) {
      toast.error(toastMessages.onError, { id: toastId });
      throw e;
    }
  },
});
