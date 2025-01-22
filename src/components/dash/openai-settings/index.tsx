import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
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
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { LucideSettings2 } from "lucide-react";
import {
  type GlobalSettings,
  globalSettingsSchema,
  useGlobalSettingsState,
} from "@/components/global-settings";

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
                <FormControl>
                  <Input {...field} className="w-full" />
                </FormControl>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Kaydet</Button>
      </form>
    </Form>
  );
}
