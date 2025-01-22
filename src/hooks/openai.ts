import { createOpenAI } from "@ai-sdk/openai";
import { useGlobalSettingsState } from "@/components/global-settings";
import { useMemo } from "react";
import { toast } from "sonner";

export const useOpenAi = () => {
  const [value, _] = useGlobalSettingsState();
  const openAi = useMemo(() => {
    if (value.key === "SET_YOUR_KEY_NOW") {
      toast.info("Sağ üstteki butondan api ayarlarını yapabilirsiniz");
    }
    return createOpenAI({
      compatibility: "strict",
      apiKey: value.key,
      baseURL: value.baseUrl,
    });
  }, [value.key]);
  return openAi;
};
