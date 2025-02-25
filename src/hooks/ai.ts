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
		if (settings.selectedType === "openrouter" && settings.openrouter) {
			return createOpenRouter({
				apiKey: settings.openrouter.key,
				extraBody:
					settings.openrouter.providers &&
					settings.openrouter.providers.length > 0
						? {
								provider: {
									order: settings.openrouter.providers.map((e) => e.name),
								},
							}
						: undefined,
			}).chat(settings.openrouter.model ?? "deepseek/deepseek-chat");
		}

		if (settings.selectedType === "claude" && settings.claude) {
			return createAnthropic({
				apiKey: settings.claude.key,
				baseURL: "https://api.anthropic.com/v1",
				headers: {
					"anthropic-dangerous-direct-browser-access": "true",
				},
			})(settings.claude.model ?? "claude-3-haiku-20240307");
		}
		if (settings.selectedType === "groq" && settings.groq) {
			return createGroq({
				apiKey: settings.groq.key,
			})(settings.groq.model ?? "deepseek-r1-distill-llama-70b");
		}

		return createOpenAI({
			compatibility: "compatible",
			apiKey: settings.key,
			baseURL: settings.baseUrl,
		})(settings.model ?? "gpt-4o-mini");
	}, [settings.key, settings.baseUrl, settings.model]);
	return model;
};
