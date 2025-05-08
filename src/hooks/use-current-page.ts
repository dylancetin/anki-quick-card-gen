import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";
import { PDFDocumentProxy } from "pdfjs-dist";

export const usePdfFileAndCurrentPage = (savePdf: boolean) => {
  const { currentPage } = useSearch({
    from: "/",
  });
  const [file, setFile] = useState<File | undefined>(undefined);
  const [pdfFileDbId, setPdfFileDbId] = useState<number | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    if (!file) return;
  }, [pdfFileDbId]);

  useEffect(() => {
    if (!file) return;
    const saveAndRestorePdf = async () => {
      const pdf = await db.pdfs.get({
        fileName: file.name,
        fileSize: file.size,
      });
      if (pdf) {
        if (pdf.sessionRestorePageIndex) {
          navigate({
            from: "/",
            search: { currentPage: pdf.sessionRestorePageIndex },
          });
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

  return [
    currentPage ?? 1,
    (n: number) => {
      navigate({ from: "/", search: { currentPage: n } });
    },
    file,
    setFile,
  ] as const;
};

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
      console.log("saving preview image", imgBlob);
      await db.pdfs.update(dbPdf.id, { previewImage: imgBlob });
    };
    createPreviewBlob();
  }, [pdfDoc, file, startedRunningForPdf.current]);
};
