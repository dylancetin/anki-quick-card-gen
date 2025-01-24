import { AIAnkiCard, AnkiCard, db } from "@/lib/db";
import { useRef, useMemo, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useLiveQuery } from "dexie-react-hooks";

const renderStringWithHighlight = (str: string) => {
  const regex = /{{(c\d+)::(.*?)}}/g;
  const parts = str.split(regex);
  return (
    <span className="inline-flex gap-2">
      {parts.map((part, index) => {
        if (index % 3 === 0) {
          return <span key={index}>part</span>; // Regular text
        } else if (index % 3 === 1) {
          return (
            <Badge
              className="inline"
              key={index}
            >{`${parts[index + 1]} (${part.replace("c", "")})`}</Badge>
          ); // Highlighted text
        }
        return null; // Skip the second capturing group
      })}
    </span>
  );
};

function RenderTooltipContent({ content }: { content: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="truncate max-w-96 cursor-pointer">{content}</div>
      </TooltipTrigger>
      <TooltipContent className="max-w-96 text-wrap">
        <p className="max-w-96 text-wrap">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

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
          if (
            row.original.type === "Basic" ||
            row.original.type === "Type-in"
          ) {
            return <RenderTooltipContent content={row.original.front} />;
          }

          if (row.original.type === "Cloze") {
            return (
              <RenderTooltipContent
                content={renderStringWithHighlight(row.original.front)}
              />
            );
          }

          return null;
        },
      },
      {
        accessorKey: "back",
        header: "Arka-Yüz",
        cell: ({ getValue }) => <RenderTooltipContent content={getValue()} />,
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

export const ImageOcclusionPreview = ({
  imageId,
  boxes,
}: {
  imageId: string;
  boxes: Array<{ x: number; y: number; width: number; height: number }>;
}) => {
  const image = useLiveQuery(() => db.images.get(imageId));
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-sm">
          <p>{boxes.length} occlusion boxes</p>
          <p>Click to edit</p>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="relative inline-block max-w-full">
          {image && (
            <div className="relative">
              <img
                ref={imgRef}
                src={image.image}
                alt="Occlusion preview"
                className="max-h-[200px] object-contain"
              />
              {/* Boxes container */}
              <div className="absolute top-0 left-0 w-full h-full">
                {boxes.map((box, index) => (
                  <div
                    key={index}
                    className="absolute bg-red-500/80 pointer-events-none"
                    style={{
                      left: `${box.x * 100}%`,
                      top: `${box.y * 100}%`,
                      width: `${box.width * 100}%`,
                      height: `${box.height * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
const allCardsColumns: ColumnDef<AnkiCard>[] = [
  {
    accessorKey: "value.type",
    header: "Tür",
  },
  {
    header: "Ön-Yüz",
    cell: ({ row }) => {
      if (
        row.original.value.type === "Basic" ||
        row.original.value.type === "Type-in"
      ) {
        return <RenderTooltipContent content={row.original.value.front} />;
      }

      if (row.original.value.type === "Cloze") {
        return (
          <RenderTooltipContent
            content={renderStringWithHighlight(row.original.value.front)}
          />
        );
      }
      if (row.original.value.type === "Image Occlusion") {
        return (
          <ImageOcclusionPreview
            boxes={row.original.value.boxes}
            imageId={row.original.value.imageId}
          />
        );
      }

      return null;
    },
  },
  {
    header: "Arka-Yüz",
    cell: ({
      row: {
        original: { value },
      },
    }) => (
      <RenderTooltipContent
        content={
          value.type === "Basic" || value.type === "Type-in" ? value.back : ""
        }
      />
    ),
  },
  {
    header: "Aksiyonlar",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              if (row.original.value.type === "Image Occlusion") {
                await db.images.delete(row.original.value.imageId);
              }
              await db.cards.delete(row.original.id);
            }}
            size={"sm"}
            variant={"destructive"}
          >
            Sil
          </Button>
        </div>
      );
    },
  },
];

export function AllCards() {
  "use no memo";
  const dbCards = useLiveQuery(() => db.cards.toArray());
  console.log(dbCards);

  const table = useReactTable({
    data: dbCards ?? [],
    columns: allCardsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Bütün kartlar</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-32px)] w-[calc(100vw-32px)] h-[calc(100vh-32px)] block space-y-4">
        <DialogHeader>
          <DialogTitle>Depodaki tüm kartlar</DialogTitle>
          <DialogDescription>Bütün Kartların</DialogDescription>
        </DialogHeader>
        <div className="rounded-md border max-w-full overflow-x-scroll">
          <Datatable
            isLoading={false}
            table={table}
            columns={allCardsColumns}
          />
        </div>
        <TableNav table={table} />
        <DialogFooter>
          <Button type="submit">Geri Dön</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
