import { db } from "@/lib/db";
import { useLiveQuery } from "@/hooks/use-live-query";

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
  dominantColor?: [number, number, number];
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
  const linearGradient = generateBezierGradient(
    pdf.dominantColor ?? [108, 28, 124],
  );

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
      <div
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{
          backgroundImage: linearGradient,
        }}
      />
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

function generateBezierGradient(
  hex: [r: number, g: number, b: number],
  steps = 10,
): string {
  const cubicBezier = (
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number,
  ): ((x: number) => number) => {
    const cx = 3 * p1x;
    const bx = 3 * (p2x - p1x) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * p1y;
    const by = 3 * (p2y - p1y) - cy;
    const ay = 1 - cy - by;

    const sampleCurveX = (t: number): number => ((ax * t + bx) * t + cx) * t;
    const sampleCurveY = (t: number): number => ((ay * t + by) * t + cy) * t;
    const sampleCurveDerivativeX = (t: number): number =>
      (3 * ax * t + 2 * bx) * t + cx;

    const solveCurveX = (x: number, epsilon = 1e-6): number => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const xEst = sampleCurveX(t) - x;
        const dx = sampleCurveDerivativeX(t);
        if (Math.abs(xEst) < epsilon) return t;
        if (Math.abs(dx) < 1e-6) break;
        t -= xEst / dx;
      }
      let t0 = 0;
      let t1 = 1;
      t = x;
      while (t0 < t1) {
        const xEst = sampleCurveX(t);
        if (Math.abs(xEst - x) < epsilon) return t;
        x > xEst ? (t0 = t) : (t1 = t);
        t = 0.5 * (t0 + t1);
      }
      return t;
    };

    return (x: number): number => {
      if (p1x === p1y && p2x === p2y) return x;
      return sampleCurveY(solveCurveX(x));
    };
  };

  // cubic bezier implementation
  const ease = cubicBezier(0.38, 0, 0.63, 0.57);
  const [r, g, b] = hex;
  const stops: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const e = ease(i / steps);
    const alpha = (1 - e).toFixed(3);
    const pos = `${(e * 100).toFixed(2)}%`;
    stops.push(`rgba(${r},${g},${b},${alpha}) ${pos}`);
  }

  return `linear-gradient(to top, ${stops.join(", ")})`;
}
