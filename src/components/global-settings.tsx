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
export const globalSettingsSchema = z.object({
	key: z.string().optional(),
	baseUrl: z.string().optional(),
	model: z.string().optional(),
	lang: z.enum(["TÜRKÇE", "ENGLISH"]).optional(),
	providers: z
		.object({ name: z.string() })
		.array()
		.optional()
		.transform((providers) => {
			if (!providers) return providers;
			return providers.filter((provider) => provider.name.trim() !== "");
		}),
});

export type GlobalSettings = z.infer<typeof globalSettingsSchema>;

const defSettings = {
	key: "SET_YOUR_KEY_NOW",
	baseUrl: "https://api.openai.com/v1",
	model: "gpt-4o-mini",
	lang: "TÜRKÇE" as const,
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
