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
import { FieldError, useForm } from "react-hook-form";
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
import { LucideSettings2 } from "lucide-react";
import {
  type GlobalSettings,
  globalSettingsSchema,
  useGlobalSettingsState,
} from "@/components/global-settings";
import { toast } from "sonner";

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
