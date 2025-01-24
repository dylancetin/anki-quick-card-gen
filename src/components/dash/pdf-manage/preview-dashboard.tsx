import { AIAnkiCard, db } from "@/lib/db";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Datatable } from "@/components/custom-ui/datatable";
import { TableNav } from "@/components/custom-ui/datatable";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "@tanstack/react-router";
import { Updater } from "use-immer";

const renderStringWithHighlight = (str: string) => {
  const regex = /{{(c\d+)::(.*?)}}/g;
  const parts = str.split(regex);
  return parts.map((part, index) => {
    if (index % 3 === 0) {
      return part; // Regular text
    } else if (index % 3 === 1) {
      return (
        <Badge className="inline">{`${parts[index + 1]} (${part.replace("c", "")})`}</Badge>
      ); // Highlighted text
    }
    return null; // Skip the second capturing group
  });
};

const renderTooltipContent = (content: ReactNode) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="truncate max-w-96 cursor-pointer">{content}</div>
    </TooltipTrigger>
    <TooltipContent className="max-w-96 text-wrap">
      <p className="max-w-96 text-wrap">{content}</p>
    </TooltipContent>
  </Tooltip>
);

export function PreviewModal({
  open,
  setOpen,
  previewCards,
  setPreviewCards,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  previewCards: AIAnkiCard["cards"];
  setPreviewCards: Updater<AIAnkiCard["cards"]>;
}) {
  "use no memo";
  function saveToDB(card: AIAnkiCard["cards"][number]) {
    db.cards.add({ value: card });
  }
  const columns: ColumnDef<AIAnkiCard["cards"][number]>[] = useMemo(
    () => [
      {
        accessorKey: "type",
        header: "Tür",
      },
      {
        header: "Ön-Yüz",
        cell: ({ row }) => {
          if (row.original.type === "Basic") {
            return renderTooltipContent(row.original.front);
          }

          if (row.original.type === "Cloze") {
            return renderTooltipContent(
              renderStringWithHighlight(row.original.content),
            );
          }

          if (row.original.type === "Type-in") {
            return renderTooltipContent(row.original.front);
          }

          return null;
        },
      },
      {
        accessorKey: "back",
        header: "Arka-Yüz",
        cell: ({ getValue }) => renderTooltipContent(getValue()),
      },
      {
        header: "Aksiyonlar",
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  saveToDB(row.original);
                  setPreviewCards((d) => {
                    d.splice(row.index, 1);
                  });
                }}
                size={"sm"}
              >
                Kaydet
              </Button>
              <Button
                onClick={() => {
                  setPreviewCards((d) => {
                    d.splice(row.index, 1);
                  });
                }}
                variant={"destructive"}
                size={"sm"}
              >
                Sil
              </Button>
            </div>
          );
        },
      },
    ],
    [setPreviewCards, saveToDB],
  );

  const table = useReactTable({
    data: previewCards,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[calc(100vw-32px)] w-[calc(100vw-32px)] h-[calc(100vh-32px)] block space-y-4">
        <DialogHeader>
          <DialogTitle>Kartları incele ve depoya ekle</DialogTitle>
          <DialogDescription>
            Kartları burdan onaylayıp kaydet
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border max-w-full overflow-x-scroll">
          <Datatable isLoading={false} table={table} columns={columns} />
        </div>
        <TableNav table={table} />
        <DialogFooter>
          <Button type="submit">Geri Dön</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
