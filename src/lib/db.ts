// db.js
import Dexie, { type EntityTable } from "dexie";
import { z } from "zod";

const BasicCardSchema = z.object({
  type: z.literal("Basic"),
  front: z.string(),
  back: z.string(),
});
export type BasicCard = z.infer<typeof BasicCardSchema>;

const ClozeCardSchema = z.object({
  type: z.literal("Cloze"),
  front: z.string(),
});
export type ClozeCard = z.infer<typeof ClozeCardSchema>;

const TypeInCardSchema = z.object({
  type: z.literal("Type-in"),
  front: z.string(),
  back: z.string(),
});
export type TypeInCard = z.infer<typeof TypeInCardSchema>;

const ImageOcclusionCardSchema = z.object({
  type: z.literal("Image Occlusion"),
  imageId: z.string(),
  boxes: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .array(),
});
export type ImageOcclusionCard = z.infer<typeof ImageOcclusionCardSchema>;

export const AIAnkiCardSchema = z.discriminatedUnion("type", [
  BasicCardSchema,
  ClozeCardSchema,
  TypeInCardSchema,
]);

export type AIAnkiCard = z.infer<typeof AIAnkiCardSchema>;

export type PreviewCard = { page: number; fromPage?: number; front: string } & (
  | {
      type: "Basic";
      back: string;
    }
  | {
      type: "Cloze";
    }
  | {
      type: "Type-in";
      back: string;
    }
);

export const AnkiCardSchema = z.object({
  id: z.number(),
  value: z.union([
    BasicCardSchema,
    ClozeCardSchema,
    TypeInCardSchema,
    ImageOcclusionCardSchema,
  ]),
});

type AnkiCard = z.infer<typeof AnkiCardSchema>;

const db = new Dexie("Local-Fake-AnkiDB") as Dexie & {
  cards: EntityTable<
    AnkiCard,
    "id" // primary key "id" (for the typings only)
  >;
  images: EntityTable<
    {
      id: string;
      image: string;
    },
    "id"
  >;
  pdfs: EntityTable<
    {
      id: number;
      fileName: string;
      fileSize: number;
      file?: File;
      previewImage?: Blob;
      sessionRestorePageIndex?: number;
      lastUsed: number;
      dominantColor?: [number, number, number];
    },
    "id"
  >;
};

// Schema declaration:
db.version(5).stores({
  cards: "++id", // primary key "id" (for the runtime!)
  images: "id",
  pdfs: "++id, [fileName+fileSize]",
});

export type { AnkiCard };
export { db };
