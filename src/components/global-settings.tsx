import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { z } from "zod";
import { toast } from "sonner";

export const globalSettingsSchema = z.object({
  key: z.string().optional(),
  baseUrl: z.string().url().max(4).optional(),
});

export type GlobalSettings = z.infer<typeof globalSettingsSchema>;

const defSettings = {
  key: "SET_YOUR_KEY_NOW",
  baseUrl: "https://api.openai.com/v1",
};

const GlobalSettingsStateContext = createContext<
  [GlobalSettings, Dispatch<SetStateAction<GlobalSettings>>] | undefined
>(undefined);

export function GlobalSettingsStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [value, setValue] = useState<GlobalSettings>(() => {
    const savedSettings = localStorage.getItem("settings");

    if (savedSettings === null) {
      return defSettings;
    }

    const parsedSettings = globalSettingsSchema.safeParse(
      JSON.parse(savedSettings),
    );

    if (parsedSettings.success) {
      return parsedSettings.data;
    }

    toast.error("Ayarlar yüklenirken bir hata oluştu");

    return defSettings;
  });

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(value));
  }, [value]);

  return (
    <GlobalSettingsStateContext.Provider value={[value, setValue]}>
      {children}
    </GlobalSettingsStateContext.Provider>
  );
}

export const useGlobalSettingsState = () => {
  const context = useContext(GlobalSettingsStateContext);
  if (context === undefined) {
    throw new Error(
      "useWritingState must be used within a WritingStateProvider",
    );
  }
  return context;
};
