import { AnkiCard, AnkiCardSchema, db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCallback, useRef, useState } from "react";

export function CreateCardDialog() {
  "use no memo";
  const [open, setOpen] = useState(false);
  const form = useForm<AnkiCard["value"]>({
    resolver: zodResolver(AnkiCardSchema.shape.value),
  });
  const submitButton = useRef<HTMLButtonElement>(null);
  const cardType = form.watch("type");
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitButton?.current?.click();
      }
    },
    [submitButton.current],
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button>Kart Ekle</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Kartı ekle</AlertDialogTitle>
          <AlertDialogDescription>
            Manuel kart ekleyebilirsin buradan
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              async (data) => {
                await db.cards.add({ value: data });
                form.reset();
                toast.success("Yeni kart eklendi");
              },
              (e) => {
                console.log(e);
                toast.error("Form doğrulanamadı");
              },
            )}
            className="space-y-4 mt-8"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kart Türü</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    // defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Bir kart türü seç" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Type-in", "Basic"].map((e) => (
                        <SelectItem value={e} key={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ön</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="w-full"
                      disabled={cardType === undefined}
                      onKeyDown={handleKeyDown}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arka</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="w-full"
                      disabled={
                        cardType === "Cloze" ||
                        cardType === "Image Occlusion" ||
                        cardType === undefined
                      }
                      onKeyDown={handleKeyDown}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel type="button">İptal</AlertDialogCancel>
              <Button type="submit" ref={submitButton}>
                Düzenlemeyi Kaydet
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
