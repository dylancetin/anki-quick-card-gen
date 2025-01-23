import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { useGlobalSettingsState } from "@/components/global-settings";
import { useMemo } from "react";
import { toast } from "sonner";

export const useAi = () => {
  const [value, _] = useGlobalSettingsState();
  const ai = useMemo(() => {
    if (value.key === "SET_YOUR_KEY_NOW") {
      toast.info("Sağ üstteki butondan api ayarlarını yapabilirsiniz");
    }
    return createOpenAI({
      compatibility: "compatible",
      apiKey: value.key,
      baseURL: value.baseUrl,
    });
  }, [value.key]);
  return ai;
};

export const useModel = () => {
  const [value, _] = useGlobalSettingsState();
  const model = useMemo(() => {
    if (value.key === "SET_YOUR_KEY_NOW") {
      toast.info("Sağ üstteki butondan api ayarlarını yapabilirsiniz");
    }
    if (!value.model) {
      toast.error("Model seçilmedi");
    }
    if (value.baseUrl?.includes("openrouter")) {
      return createOpenRouter({
        apiKey: value.key,
      }).chat(value.model ?? "deepseek/deepseek-chat");
    }

    if (value.baseUrl === "https://api.anthropic.com/v1") {
      return createAnthropic({
        apiKey: value.key,
        baseURL: value.baseUrl,
        headers: {
          "anthropic-dangerous-direct-browser-access": "true",
        },
      })(value.model ?? "claude-3-haiku-20240307");
    }
    return createOpenAI({
      compatibility: "compatible",
      apiKey: value.key,
      baseURL: value.baseUrl,
    })(value.model ?? "gpt-4o-mini");
  }, [value.key, value.baseUrl, value.model]);
  return model;
};
