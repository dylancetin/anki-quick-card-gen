import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetTitle,
  SheetContent,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { LucideSettings2 } from "lucide-react";

export function EditOpenAIConfig() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger>
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
      </SheetContent>
    </Sheet>
  );
}
