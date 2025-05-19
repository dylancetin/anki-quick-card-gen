import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/custom-ui/file";
import { ManagePDFDash } from "@/components/dash/pdf-manage";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { PreviousPDF } from "@/components/dash/previous-pdfs";
import { usePdfFileAndCurrentPage } from "@/hooks/use-pdf";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  validateSearch: zodValidator(
    z.object({
      currentPage: z.coerce.number().optional(),
    }),
  ),
});

type Tabs = "upload" | "inspect";

function HomeComponent() {
  const [activeTab, setActiveTab] = useState<Tabs>("upload");
  const [savePdf, setSavePdf] = useLocalStorage("save-pdf-on-upload", false);
  const [currentPage, setCurrentPage, file, setFile] =
    usePdfFileAndCurrentPage(savePdf);

  useEffect(() => {
    if (file) {
      setActiveTab("inspect");
    }
  }, [file]);

  return (
    <div className="p-4">
      <Tabs value={activeTab}>
        <TabsContent value="upload" className="mt-0 space-y-4">
          <div className="mx-auto max-w-200 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-2 justify-between w-full">
                  <CardTitle>Yeni PDF Ekle</CardTitle>
                  <div className="flex items-center gap-2">
                    Save PDF for later sessions{" "}
                    <Switch checked={savePdf} onCheckedChange={setSavePdf} />
                  </div>
                </div>
                <FileUpload
                  value={file}
                  valueOnChange={setFile}
                  accept="application/pdf"
                />
                <a
                  href="https://taylan.co"
                  className="text-foreground/70 pt-4 w-fit"
                >
                  {"Taylan ™"}
                </a>
              </CardHeader>
            </Card>
          </div>
          <h1 className="text-2xl font-semibold">Eski PDF'ler</h1>
          <PreviousPDF setFile={setFile} />
        </TabsContent>
        <TabsContent value="inspect">
          <ManagePDFDash
            file={file}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
