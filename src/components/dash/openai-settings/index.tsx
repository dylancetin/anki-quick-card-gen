import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldError, useForm, useFieldArray } from "react-hook-form";
import {
	Sheet,
	SheetTitle,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { TooltipArrow } from "@radix-ui/react-tooltip";
import { Check, LucideSettings2, PlusCircle, X } from "lucide-react";
import {
	type GlobalSettings,
	globalSettingsSchema,
	openRouterProviders,
	useGlobalSettingsState,
} from "@/components/global-settings";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function EditOpenAIConfig() {
	const [open, setOpen] = useState(false);
	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						size={"icon"}
						onClick={() => setOpen(true)}
						className="rounded-full"
					>
						<LucideSettings2 className="text-flexoki-paper size-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<TooltipArrow className="fill-border" />
					Open-AI Ayarları
				</TooltipContent>
			</Tooltip>
			<SheetContent>
				<SheetTitle>Hi</SheetTitle>
				<SheetDescription>
					Buradan Ai-SDK ayarlarını yapabilirsiniz
				</SheetDescription>
				{open && <SettingsForm closeTab={() => setOpen(false)} />}
			</SheetContent>
		</Sheet>
	);
}

function SettingsForm({ closeTab }: { closeTab: () => void }) {
	"use no memo";
	const [settingsValue, setSettingsValue] = useGlobalSettingsState();
	const form = useForm<GlobalSettings>({
		resolver: zodResolver(globalSettingsSchema),
		defaultValues: settingsValue,
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "providers",
	});

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(
					(data) => {
						setSettingsValue(data);
						closeTab();
					},
					(e) => {
						console.log(e);
						for (const field in e) {
							// @ts-ignore
							const v = e[field] as FieldError | undefined;
							if (!v) continue;
							if (v?.message) toast.error(`${field} ${v.message}`);
						}
					},
				)}
				className="space-y-4 mt-8"
			>
				<FormField
					control={form.control}
					name="key"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Open-AI API Anahtarı</FormLabel>
							<FormControl>
								<Input {...field} className="w-full" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="baseUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Open-AI Base URL</FormLabel>
							<FormControl>
								<Input {...field} className="w-full" />
							</FormControl>
							<FormDescription>
								OpenAi api uyumlu api url(claude da destekli, "openrouter" da
								yazabilirsiniz)
								<br />
								Örnek:
								<br />
								groq
								<br />
								openrouter
								<br />
								https://api.anthropic.com/v1
								<br />
								https://api.openai.com/v1
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="model"
					render={({ field }) => (
						<FormItem>
							<FormLabel>LLM Model</FormLabel>
							<FormControl>
								<Input {...field} className="w-full" />
							</FormControl>
							<FormDescription>
								Örnek: gpt-4o-mini (openai ve claude dışında denemedim büyük
								ihtimal çalışmicak)
								<br />
								Örnek:
								<br />
								deepseek/deepseek-chat
								<br />
								claude-3-haiku-20240307
								<br />
								gpt-4o-mini
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Card className="px-2 pb-4 pt-2 space-y-4">
					{fields.map((field, index) => (
						<FormField
							key={field.id}
							control={form.control}
							name={`providers.${index}.name`}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="w-24 text-right">
										Provider {index + 1}
									</FormLabel>
									<div className="flex items-center space-x-2 mb-4">
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														role="combobox"
														className={cn(
															"w-full justify-between",
															!field.value && "text-muted-foreground",
														)}
													>
														{field.value || "Select provider"}
														<PlusCircle className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-[200px] p-0">
												<Command>
													<CommandInput placeholder="Search provider..." />
													<CommandList>
														<CommandEmpty>No provider found.</CommandEmpty>
														<CommandGroup>
															{openRouterProviders.map((provider) => (
																<CommandItem
																	value={provider}
																	key={provider}
																	onSelect={() => {
																		form.setValue(
																			`providers.${index}.name`,
																			provider,
																		);
																	}}
																>
																	<Check
																		className={cn(
																			"mr-2 h-4 w-4",
																			provider === field.value
																				? "opacity-100"
																				: "opacity-0",
																		)}
																	/>
																	{provider}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
												<div className="p-2 border-t">
													<Input
														placeholder="Custom provider"
														value={field.value}
														onChange={(e) => {
															form.setValue(
																`providers.${index}.name`,
																e.target.value,
															);
														}}
													/>
												</div>
											</PopoverContent>
										</Popover>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => remove(index)}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					))}
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="mt-2 text-end ml-auto"
						onClick={() => append({ name: "" })}
					>
						<PlusCircle className="h-4 w-4 mr-2" />
						Sağlayıcı (openrouter için)
					</Button>
				</Card>
				<FormField
					control={form.control}
					name="lang"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Cevap Dili</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Bir dil seç" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="TÜRKÇE">Türkçe</SelectItem>
									<SelectItem value="ENGLISH">English</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Kaydet</Button>
			</form>
		</Form>
	);
}
