// db.js
import Dexie, { type EntityTable } from "dexie";

type AnkiCard = {
  id: number;
  value:
    | {
        type: "text";
        content: string;
      }
    | {
        type: "image";
        imageId: string;
        boxes: string;
      };
};

const db = new Dexie("Local-Fake-AnkiDB") as Dexie & {
  cards: EntityTable<
    AnkiCard,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  cards: "++id", // primary key "id" (for the runtime!)
});

export type { AnkiCard };
export { db };
