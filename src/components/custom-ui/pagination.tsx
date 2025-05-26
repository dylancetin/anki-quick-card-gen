import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

export function PaginationButtons({
  currentPage,
  numPages,
  setCurrentPage,
}: {
  currentPage: number;
  numPages: number | null;
  setCurrentPage: (e: number) => void;
}) {
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < (numPages || 0)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="mt-4 flex gap-4">
      <Button onClick={goToPreviousPage} disabled={currentPage === 1}>
        Önceki
      </Button>
      <Popover>
        <PopoverTrigger>
          <span className="self-center">
            Page {currentPage}/{numPages}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto space-y-4" align="center" side="top">
          <div className="text-bw-600 text-xs ">Sayfa</div>
          <Input
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") {
                const inputValue = event.currentTarget.value;
                if (inputValue) {
                  const page = Number(inputValue); // Sayfa indeksi 0'dan başladığı için 1 çıkarıyoruz

                  if (page <= (numPages ?? 1)) {
                    setCurrentPage(page);
                    return;
                  }

                  if (page < 0) {
                    toast.error("Sayfa bulunamadı", {
                      description: "Girilen sayfa 0'dan daha küçük olamaz.",
                      duration: 2500,
                    });
                    return;
                  }

                  toast.error("Sayfa bulunamadı", {
                    description: `Girilen sayfa mevcut sayfa sayısından (${numPages}) daha büyük olamaz.`,
                    duration: 2500,
                  });
                }
              }
            }}
          />
        </PopoverContent>
      </Popover>
      <Button onClick={goToNextPage} disabled={currentPage === numPages}>
        Sonraki
      </Button>
    </div>
  );
}
