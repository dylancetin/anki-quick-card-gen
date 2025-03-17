import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/custom-ui/file";
import { ManagePDFDash } from "@/components/dash/pdf-manage";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

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
  const [file, setFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    if (file) {
      setActiveTab("inspect");
    }
  }, [file]);

  return (
    <div className="p-4">
      <Tabs value={activeTab}>
        <TabsContent value="upload" className="mt-0">
          <h1 className="text-2xl font-semibold"></h1>
          <Card>
            <CardHeader>
              <CardTitle>Start by uploading a PDF file</CardTitle>
              <FileUpload
                value={file}
                valueOnChange={setFile}
                accept="application/pdf"
              />
              <a
                href="https://taylan.co"
                className="text-foreground/70 absolute left-3 bottom-3"
              >
                {"Taylan ™"}
              </a>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="inspect">
          <ManagePDFDash file={file} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
