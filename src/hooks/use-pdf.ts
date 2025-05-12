import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";
import { PDFDocumentProxy } from "pdfjs-dist";
import { Vibrant } from "node-vibrant/browser";

export const usePdfFileAndCurrentPage = (savePdf: boolean) => {
  const [currentPage, setCurrentPage] = useState<undefined | number>();
  const [file, setFile] = useState<File | undefined>(undefined);
  const [pdfFileDbId, setPdfFileDbId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!pdfFileDbId || !currentPage) return;
    const updateLatestUsed = async () => {
      await db.pdfs.update(pdfFileDbId, {
        sessionRestorePageIndex: currentPage,
      });
    };
    updateLatestUsed();
  }, [currentPage, pdfFileDbId]);

  useEffect(() => {
    if (!file) return;
    const saveAndRestorePdf = async () => {
      const pdf = await db.pdfs.get({
        fileName: file.name,
        fileSize: file.size,
      });
      if (pdf) {
        if (pdf.sessionRestorePageIndex) {
          setCurrentPage(pdf.sessionRestorePageIndex);
        }
        setPdfFileDbId(pdf.id);
        await db.pdfs.update(pdf.id, { lastUsed: Date.now() });
        if (savePdf && !pdf.file) {
          await db.pdfs.update(pdf.id, { file: file });
        }
        return;
      }
      const res = await db.pdfs.add({
        fileName: file.name,
        fileSize: file.size,
        file: savePdf ? file : undefined,
        lastUsed: Date.now(),
      });
      setPdfFileDbId(res);
    };
    saveAndRestorePdf();
  }, [file, savePdf, setPdfFileDbId]);

  return [currentPage ?? 1, setCurrentPage, file, setFile] as const;
};

/**
 * Returns a hex string of the image's most “Vibrant” swatch,
 * falling back to another swatch if needed.
 */
export async function getDominantColorViaVibrant(
  imgUrl: string,
): Promise<[number, number, number]> {
  const palette = await Vibrant.from(imgUrl).getPalette();
  console.log(palette);
  //type Vec3 = [number, number, number]

  const v = palette.DarkVibrant;
  console.log("Generated preview img bg color:", v?.rgb);
  if (!v) {
    console.error("A problem occured on rgb gen", v);
  }

  return v?.rgb ?? [108, 28, 124];
}

export const useCreatePreviewImg = (
  pdfDoc: PDFDocumentProxy | null,
  file: File | undefined,
) => {
  const startedRunningForPdf = useRef<undefined | string>(undefined);
  useEffect(() => {
    if (!pdfDoc || !file) return;

    const pdfId = `${file.name}-${file.size.toString()}`;
    if (startedRunningForPdf.current === pdfId) {
      return;
    }
    startedRunningForPdf.current = pdfId;

    const createPreviewBlob = async () => {
      const dbPdf = await db.pdfs.get({
        fileName: file.name,
        fileSize: file.size,
      });

      if (!dbPdf || !dbPdf.file) {
        console.log("skipping img preview gen");
        return;
      }

      // if any missing regenerate
      if (dbPdf.previewImage && dbPdf.dominantColor) {
        console.log("skipping img preview gen");
        return;
      }

      const page = await pdfDoc.getPage(1);
      const scale = 0.8;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const imgBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          // blob will never be null when you pass a valid mimeType
          resolve(blob!);
        }, "image/webp");
      });

      const url = URL.createObjectURL(imgBlob);
      let rgb: [number, number, number];
      try {
        rgb = await getDominantColorViaVibrant(url);
      } finally {
        URL.revokeObjectURL(url);
      }

      console.log("saving preview image", imgBlob);
      canvas.remove();
      await db.pdfs.update(dbPdf.id, {
        previewImage: imgBlob,
        dominantColor: rgb,
      });
    };
    createPreviewBlob();
  }, [pdfDoc, file, startedRunningForPdf.current]);
};
