import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/use-live-query";

import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { useImgUrl } from "@/hooks/use-img-url";

type PdfFile = {
  id: number;
  fileName: string;
  fileSize: number;
  file?: File;
  previewImage?: Blob;
  sessionRestorePageIndex?: number;
  lastUsed: number;
};

interface PreviousPdfCardProps {
  pdf: PdfFile;
  onSelect: (pdf: PdfFile) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
const formatLastUsed = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function PreviousPdfCard({ pdf, onSelect }: PreviousPdfCardProps) {
  const previewUrl = useImgUrl(pdf.previewImage);
  const removePdf = async () => {
    await db.pdfs.delete(pdf.id);
  };

  return (
    <div className="relative border rounded-xl overflow-hidden min-h-96 flex justify-end flex-col">
      {previewUrl ? (
        <img
          src={previewUrl || "/placeholder.svg"}
          alt={pdf.fileName}
          className="absolute inset-0 object-cover w-full h-full"
        />
      ) : (
        <div className="absolute top-1/3 left-1/2 -translate-y-1/2 -translate-x-1/2 flex w-full flex-col items-center justify-center p-2">
          <FileIcon className="mb-2 h-16 w-16 text-muted-foreground" />
          <div className="text-xs text-muted-foreground">
            {formatFileSize(pdf.fileSize)}
          </div>
        </div>
      )}
      <div className="absolute inset-0 z-10 flex items-center justify-center card-overlay-gradient" />
      <div className="w-full space-y-2 rounded-lg px-2 pb-2 z-20">
        <h3 className="sm:text-lg font-bold text-white">{pdf.fileName}</h3>
        <p className="text-xs sm:text-sm text-white/70">
          En son {formatLastUsed(pdf.lastUsed)} kullanıldı
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size={"sm"}
            className="w-full text-white/70"
            onClick={() => onSelect(pdf)}
          >
            Bu PDF'i kullan
          </Button>
          <Button
            variant="ghost"
            size={"sm"}
            className="w-full text-white/70"
            onClick={removePdf}
          >
            Bu PDF'i sil
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PreviousPDF({
  setFile,
}: {
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}) {
  const oldPdfs = useLiveQuery(() =>
    db.pdfs
      .limit(6)
      .filter((f) => !!f.file)
      .reverse()
      .sortBy("lastUsed"),
  );

  const onSelect: (pdf: PdfFile) => void = (pdf) => {
    setFile(pdf.file);
  };

  if (!oldPdfs || oldPdfs.length === 0) {
    return <p>Kayıtlı PDF bulunamadı! Hemen pdf yükleyerek başla.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {oldPdfs.length > 4 ? (
        <p>
          6'dan fazla pdf'i sistemde kayıtlı bırakmamanızı öneririz. PDF'ler
          kullandığınız browser üzerinde saklanmaktadır.
        </p>
      ) : null}
      {oldPdfs.map((pdf) => (
        <PreviousPdfCard key={pdf.id} pdf={pdf} onSelect={onSelect} />
      ))}
    </div>
  );
}
