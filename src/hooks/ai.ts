import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";
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
	const [settings, _] = useGlobalSettingsState();
	const model = useMemo(() => {
		if (settings.key === "SET_YOUR_KEY_NOW") {
			toast.info("Sağ üstteki butondan api ayarlarını yapabilirsiniz");
		}
		if (!settings.model) {
			toast.error("Model seçilmedi");
		}
		if (settings.baseUrl?.includes("openrouter")) {
			return createOpenRouter({
				apiKey: settings.key,
				extraBody:
					settings.providers && settings.providers.length > 0
						? {
								provider: {
									order: settings.providers.map((e) => e.name),
								},
							}
						: undefined,
			}).chat(settings.model ?? "deepseek/deepseek-chat");
		}

		if (settings.baseUrl === "https://api.anthropic.com/v1") {
			return createAnthropic({
				apiKey: settings.key,
				baseURL: settings.baseUrl,
				headers: {
					"anthropic-dangerous-direct-browser-access": "true",
				},
			})(settings.model ?? "claude-3-haiku-20240307");
		}
		if (settings.baseUrl === "groq") {
			return createGroq({
				apiKey: settings.key,
			});
		}

		return createOpenAI({
			compatibility: "compatible",
			apiKey: settings.key,
			baseURL: settings.baseUrl,
		})(settings.model ?? "gpt-4o-mini");
	}, [settings.key, settings.baseUrl, settings.model]);
	return model;
};
