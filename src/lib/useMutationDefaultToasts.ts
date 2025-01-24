import { UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export const errorAndSuccessToasts: Pick<
  UseMutationOptions,
  "onError" | "onSuccess"
> = {
  onError: (error) => {
    if (typeof error === "object" && error.message) {
      toast.error("Bir hata oluştu", {
        description: error.message,
      });
    } else {
      toast.error("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  },
  onSuccess: (data) => {
    toast.success("Başarı ile işlem tamamlandı");
  },
};
