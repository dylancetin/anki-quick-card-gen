import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Check, PlusCircle, X } from "lucide-react";
import {
  type GlobalSettings,
  globalSettingsSchema,
  openRouterProviders,
  useGlobalSettingsState,
  usePromptState,
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
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { getDefaultSystemPrompt } from "@/lib/prompt";

export function EditOpenAIConfig({
  openState: [open, setOpen],
}: {
  openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-scroll w-[448px] sm:w-[600px] sm:max-w-lg">
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
    name: "openrouter.providers",
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
          name="selectedType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aktif Sağlayıcı</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Bir sağlayıcı seç" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["openai-compatible", "claude", "groq", "openrouter"].map(
                    (e) => (
                      <SelectItem value={e} key={e}>
                        {e}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Accordion type="multiple" className={"space-y-5 border-none"}>
          <AccordionItem value={"openai"} className="border rounded-lg p-2">
            <AccordionTrigger className="text-sm py-0">
              OpenAi-Compatible
            </AccordionTrigger>
            <AccordionContent className="p-2 space-y-4">
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
                      OpenAi api uyumlu api url (boş bırak default için)
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
                    <FormDescription>Örnek: gpt-4o-mini</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value={"claude"} className="border rounded-lg p-2">
            <AccordionTrigger className="text-sm py-0">Claude</AccordionTrigger>
            <AccordionContent className="p-2 space-y-4">
              <FormField
                control={form.control}
                name="claude.key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claude API Anahtarı</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="claude.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LLM Model</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormDescription>
                      Örnek: claude-3-haiku-20240307
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value={"groq"} className="border rounded-lg p-2">
            <AccordionTrigger className="text-sm py-0">Groq</AccordionTrigger>
            <AccordionContent className="p-2 space-y-4">
              <FormField
                control={form.control}
                name="groq.key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Groq API Anahtarı</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="groq.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LLM Model</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormDescription>
                      Örnek: deepseek-r1-distill-llama-70b
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value={"openrouter"} className="border rounded-lg p-2">
            <AccordionTrigger className="text-sm py-0">
              OpenRouter
            </AccordionTrigger>
            <AccordionContent className="p-2 space-y-4">
              <FormField
                control={form.control}
                name="openrouter.key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Openrouter API Anahtarı</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="openrouter.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LLM Model</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormDescription>
                      Örnek: deepseek-r1-distill-llama-70b
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
                    name={`openrouter.providers.${index}.name`}
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
                                  <CommandEmpty>
                                    No provider found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {openRouterProviders.map((provider) => (
                                      <CommandItem
                                        value={provider}
                                        key={provider}
                                        onSelect={() => {
                                          form.setValue(
                                            `openrouter.providers.${index}.name`,
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
                                      `openrouter.providers.${index}.name`,
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>

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

export function EditPromptConfig({
  openState: [open, setOpen],
}: {
  openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-scroll w-[448px] sm:w-[600px] sm:max-w-lg">
        <SheetTitle>Hi</SheetTitle>
        <SheetDescription>
          Buradan sistem prompt ayarlarını yapabilirsiniz
        </SheetDescription>
        {open && <PromptSettingsForm closeTab={() => setOpen(false)} />}
      </SheetContent>
    </Sheet>
  );
}

function PromptSettingsForm({ closeTab }: { closeTab: () => void }) {
  "use no memo";
  const [promptValue, setPromptValue] = usePromptState();
  const [settings] = useGlobalSettingsState();
  const form = useForm<{ systemPrompt: string }>({
    resolver: zodResolver(
      z.object({
        systemPrompt: z.string(),
      }),
    ),
    defaultValues: {
      systemPrompt: promptValue,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          (data) => {
            setPromptValue(data.systemPrompt);
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
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sistem Promptu</FormLabel>
              <FormControl>
                <Textarea {...field} rows={30} className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit">Kaydet</Button>
          <Button
            type="button"
            variant={"outline"}
            onClick={() => {
              form.setValue(
                "systemPrompt",
                getDefaultSystemPrompt(settings.lang),
              );
            }}
          >
            Default Prompt Gir
          </Button>
        </div>
      </form>
    </Form>
  );
}
