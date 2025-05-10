import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
} from "react";
import { z } from "zod";
import { getDefaultSystemPrompt } from "@/lib/prompt";
import { useLocalStorage } from "@/hooks/use-local-storage";

export const openRouterProviders = [
  "OpenAI",
  "Anthropic",
  "Google",
  "Google AI Studio",
  "Amazon Bedrock",
  "Groq",
  "SambaNova",
  "Cohere",
  "Mistral",
  "Together",
  "Together 2",
  "Fireworks",
  "DeepInfra",
  "Lepton",
  "Novita",
  "Avian",
  "Lambda",
  "Azure",
  "Modal",
  "AnyScale",
  "Replicate",
  "Perplexity",
  "Recursal",
  "OctoAI",
  "DeepSeek",
  "Infermatic",
  "AI21",
  "Featherless",
  "Inflection",
  "xAI",
  "Cloudflare",
  "SF Compute",
  "Minimax",
  "Nineteen",
  "Liquid",
  "InferenceNet",
  "Friendli",
  "AionLabs",
  "Alibaba",
  "Nebius",
  "Chutes",
  "Kluster",
  "Crusoe",
  "Targon",
  "01.AI",
  "HuggingFace",
  "Mancer",
  "Mancer 2",
  "Hyperbolic",
  "Hyperbolic 2",
  "Lynn 2",
  "Lynn",
  "Reflection",
];

export const globalSettingsSchema = z
  .object({
    selectedType: z.enum(["openai-compatible", "claude", "groq", "openrouter"]),
    claude: z
      .object({
        key: z.string(),
        model: z.string(),
      })
      .partial(),

    groq: z
      .object({
        key: z.string(),
        model: z.string(),
      })
      .partial(),
    openrouter: z
      .object({
        key: z.string(),
        model: z.string(),
        providers: z
          .object({ name: z.string() })
          .array()
          .transform((providers) => {
            if (!providers) return providers;
            return providers.filter((provider) => provider.name.trim() !== "");
          }),
      })
      .partial(),

    //openai compatible
    key: z.string(),
    baseUrl: z.string(),
    model: z.string(),

    lang: z.enum(["TÜRKÇE", "ENGLISH"]),
  })
  .partial();

export type GlobalSettings = z.infer<typeof globalSettingsSchema>;

const defSettings: GlobalSettings = {
  key: "SET_YOUR_KEY_NOW",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  lang: "TÜRKÇE" as const,
};

export const GlobalSettingsStateContext = createContext<
  [GlobalSettings, Dispatch<SetStateAction<GlobalSettings>>] | undefined
>(undefined);

export const PromptStateContext = createContext<
  [string, Dispatch<SetStateAction<string>>] | undefined
>(undefined);

export function GlobalSettingsStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const settings = useLocalStorage<GlobalSettings>("settings", defSettings);

  const promptState = useLocalStorage<string>("system-prompt", () =>
    getDefaultSystemPrompt("TÜRKÇE"),
  );

  return (
    <GlobalSettingsStateContext.Provider value={settings}>
      <PromptStateContext.Provider value={promptState}>
        {children}
      </PromptStateContext.Provider>
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

export const usePromptState = () => {
  const context = useContext(PromptStateContext);
  if (context === undefined) {
    throw new Error(
      "useWritingState must be used within a WritingStateProvider",
    );
  }
  return context;
};
