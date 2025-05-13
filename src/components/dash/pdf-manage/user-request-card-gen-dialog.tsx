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
import { UseCardGenerationReturn } from "@/hooks/use-card-generation";
import { z } from "zod";

const formSchema = z.object({
  userRequest: z.string(),
});
type FormSchema = z.infer<typeof formSchema>;

export function RequestCardsDialog({
  cardGenMutation,
  currentPage,
  includePagesOffset,
}: {
  cardGenMutation: UseCardGenerationReturn;
  currentPage: number;
  includePagesOffset: number;
}) {
  "use no memo";
  const [open, setOpen] = useState(false);
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });
  const submitButton = useRef<HTMLButtonElement>(null);

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
        <Button variant={"outline"}>Request Cards</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Özel kart iste</AlertDialogTitle>
          <AlertDialogDescription>
            Burdaki prompt'un ile mevcut sayfa bağlamı beraber LLM'e gönderilir.
            Senin isteğine özel kartlar oluşturulur.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (data) => {
                cardGenMutation.mutate({
                  currentPage,
                  includePagesOffset,
                  userRequest: data.userRequest,
                });
                form.reset();
                setOpen(false);
              },
              (e) => {
                console.log(e);
                toast.error("Form doğrulanamadı");
              },
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="userRequest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kullanıcı özel isteği</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="w-full min-h-100"
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
                Kartları Oluştur
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
