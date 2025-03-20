import {
  AnkiCard,
  BasicCard,
  ClozeCard,
  db,
  ImageOcclusionCard,
  TypeInCard,
} from "./db";
import JSZip from "jszip";
import initSqlJs, { Database } from "sql.js";
import { colTableValues, newDeck } from "./anki-db-values";

const modelIds = {
  "Image Occlusion": 1711892431823,
  "Type-in": 1692999971515,
  "Basic-f752e": 1525456532501,
  "Basic (and reversed card)+": 1689757495603,
  Basic: 1692999971512,
  "Basic (and reversed card)": 1692999971513,
  "Basic (optional reversed card)": 1692999971514,
  Cloze: 1692999971516,
  "Basic Quizlet Extended": 1711892473612,
  "Image Occlusion Enhanced": 1713160726185,
} as const;

export async function downloadAllCards(deckName: string) {
  try {
    // Initialize SQL.js (loads the WebAssembly SQLite implementation)
    const wasmURL = new URL("sql.js/dist/sql-wasm.wasm", import.meta.url);
    const SQL = await initSqlJs({
      locateFile: () => wasmURL.toString(),
    });

    // Create a new SQLite database
    const sqlDb = new SQL.Database();

    // Create Anki database schema
    createAnkiTables(sqlDb);

    // Get all cards from our local database
    const allCards = await db.cards.toArray();

    // Media map for tracking images
    const mediaMap = {};
    let mediaCounter = 0;

    // Get the current timestamp (used throughout as creation/modification time)
    const timestamp = Math.floor(Date.now() / 1000);

    // Initialize the collection with default values
    initializeCollection(sqlDb, timestamp, deckName);

    // Process all cards and add them to the database
    for (const card of allCards) {
      await processCard(sqlDb, card, timestamp, mediaMap, mediaCounter++);
    }

    // Create and download the .apkg file
    await packageAndDownload(sqlDb, mediaMap, deckName);
  } catch (error) {
    console.error("Error creating Anki package:", error);
  }
}

function createAnkiTables(sqlDb: Database) {
  // Create all the tables needed for an Anki database
  sqlDb.exec(`
    CREATE TABLE cards (
      id              integer primary key,
      nid             integer not null,
      did             integer not null,
      ord             integer not null,
      mod             integer not null,
      usn             integer not null,
      type            integer not null,
      queue           integer not null,
      due             integer not null,
      ivl             integer not null,
      factor          integer not null,
      reps            integer not null,
      lapses          integer not null,
      left            integer not null,
      odue            integer not null,
      odid            integer not null,
      flags           integer not null,
      data            text not null
    );

    CREATE TABLE notes (
      id              integer primary key,
      guid            text not null,
      mid             integer not null,
      mod             integer not null,
      usn             integer not null,
      tags            text not null,
      flds            text not null,
      sfld            text not null,
      csum            integer not null,
      flags           integer not null,
      data            text not null
    );

    CREATE TABLE col (
      id              integer primary key,
      crt             integer not null,
      mod             integer not null,
      scm             integer not null,
      ver             integer not null,
      dty             integer not null,
      usn             integer not null,
      ls              integer not null,
      conf            text not null,
      models          text not null,
      decks           text not null,
      dconf           text not null,
      tags            text not null
    );

    CREATE TABLE graves (
      usn             integer not null,
      oid             integer not null,
      type            integer not null
    );

    CREATE TABLE revlog (
      id              integer primary key,
      cid             integer not null,
      usn             integer not null,
      ease            integer not null,
      ivl             integer not null,
      lastIvl         integer not null,
      factor          integer not null,
      time            integer not null,
      type            integer not null
    );

    CREATE INDEX ix_cards_nid on cards (nid);
    CREATE INDEX ix_cards_sched on cards (did, queue, due);
    CREATE INDEX ix_cards_usn on cards (usn);
    CREATE INDEX ix_notes_csum on notes (csum);
    CREATE INDEX ix_notes_usn on notes (usn);
    CREATE INDEX ix_revlog_cid on revlog (cid);
    CREATE INDEX ix_revlog_usn on revlog (usn);
  `);
}

function initializeCollection(
  sqlDb: Database,
  timestamp: number,
  deckName: string,
) {
  sqlDb.run("INSERT INTO col VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    1, // id
    timestamp, // crt (creation time)
    timestamp * 1000, // mod (milliseconds)
    timestamp * 1000, // scm (schema modification time)
    11, // ver (version)
    0, // dty (dirty flag)
    0, // usn (update sequence number)
    0, // ls (last sync time)
    JSON.stringify(colTableValues.conf), // conf
    JSON.stringify(colTableValues.models), // models
    JSON.stringify(newDeck(timestamp, deckName)), // decks
    JSON.stringify(colTableValues.dconf), // dconf
    "{}", // tags
  ]);
}

async function processCard(
  sqlDb: Database,
  card: AnkiCard,
  timestamp: number,
  mediaMap: Record<string, string>,
  mediaCounter: number,
) {
  const noteId = timestamp * 1000 + mediaCounter;
  const cardId = noteId; // We'll use the same ID for simplicity

  // Generate a unique identifier for the note
  const guid = crypto.randomUUID();

  switch (card.value.type) {
    case "Basic":
      addBasicCard(sqlDb, card.value, noteId, cardId, guid, timestamp);
      break;
    case "Cloze":
      addClozeCard(sqlDb, card.value, noteId, cardId, guid, timestamp);
      break;
    case "Type-in":
      addTypeInCard(sqlDb, card.value, noteId, cardId, guid, timestamp);
      break;
    case "Image Occlusion":
      await addImageOcclusionCard(
        sqlDb,
        card.value,
        noteId,
        cardId,
        guid,
        timestamp,
        mediaMap,
        mediaCounter,
      );
      break;
  }
}

// SUCCESS
function addBasicCard(
  sqlDb: Database,
  cardData: BasicCard,
  noteId: number,
  cardId: number,
  guid: string,
  timestamp: number,
) {
  // Add the note
  sqlDb.run("INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    noteId, // id
    guid, // guid
    modelIds.Basic, // mid (model id - Basic)
    timestamp, // mod
    -1, // usn
    " auto-gen ", // tags
    `${cardData.front}\u001f${cardData.back}`, // flds (fields separated by U+001F)
    cardData.front, // sfld (sort field)
    calculateChecksum(cardData.front), // csum
    0, // flags
    "", // data
  ]);

  // Add the card
  sqlDb.run(
    "INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      cardId, // id
      noteId, // nid (note id)
      timestamp.toString(), // did (deck id)
      0, // ord (template ordinal)
      timestamp, // mod
      -1, // usn
      0, // type (0=new)
      0, // queue (0=new)
      0, // due
      0, // ivl (interval)
      0, // factor
      0, // reps
      0, // lapses
      0, // left
      0, // odue
      0, // odid
      0, // flags
      "", // data
    ],
  );
}

function addClozeCard(
  sqlDb: Database,
  cardData: ClozeCard,
  noteId: number,
  cardId: number,
  guid: string,
  timestamp: number,
) {
  // Add the note
  sqlDb.run("INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    noteId, // id
    guid, // guid
    modelIds.Cloze, // mid (model id - Cloze)
    timestamp, // mod
    -1, // usn
    " auto-gen ", // tags
    `${cardData.front}\u001f`, // flds (Text + empty Extra)
    cardData.front, // sfld
    calculateChecksum(cardData.front), // csum
    0, // flags
    "", // data
  ]);

  // Find all cloze deletions in the text
  const matches = cardData.front.match(/\{\{c(\d+)::/g) || [];
  const clozeIndices: number[] = [];

  // Extract cloze indices
  for (const match of matches) {
    const index = parseInt(match.substring(3));
    clozeIndices.push(index);
  }

  // If no cloze deletions found, create a single card
  if (clozeIndices.length === 0) {
    return;
  }

  // Create a card for each cloze deletion
  let i = 0;
  for (const clozeIndex of clozeIndices) {
    sqlDb.run(
      "INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        cardId.toString() + i.toString(), // id
        noteId, // nid
        1, // did
        clozeIndex - 1, // ord (cloze index - 1)
        timestamp, // mod
        -1, // usn
        0, // type
        0, // queue
        0, // due
        0, // ivl
        0, // factor
        0, // reps
        0, // lapses
        0, // left
        0, // odue
        0, // odid
        0, // flags
        "", // data
      ],
    );
    i++;
  }
}

function addTypeInCard(
  sqlDb: Database,
  cardData: TypeInCard,
  noteId: number,
  cardId: number,
  guid: string,
  timestamp: number,
) {
  // Add the note (using Basic model, but with special template)
  sqlDb.run("INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    noteId, // id
    guid, // guid
    modelIds["Type-in"], // mid (model id - Basic)
    timestamp, // mod
    -1, // usn
    " auto-gen ", // tags
    `${cardData.front}\u001f${cardData.back}`, // flds
    cardData.front, // sfld
    calculateChecksum(cardData.front), // csum
    0, // flags
    "", // data
  ]);

  // Add the card
  sqlDb.run(
    "INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      cardId, // id
      noteId, // nid
      timestamp.toString(), // did
      0, // ord
      timestamp, // mod
      -1, // usn
      0, // type
      0, // queue
      0, // due
      0, // ivl
      0, // factor
      0, // reps
      0, // lapses
      0, // left
      0, // odue
      0, // odid
      0, // flags
      "", // data
    ],
  );
}

async function addImageOcclusionCard(
  sqlDb: Database,
  cardData: ImageOcclusionCard,
  noteId: number,
  cardId: number,
  guid: string,
  timestamp: number,
  mediaMap: Record<string, any>,
  mediaCounter: number,
) {
  // Add image to media map
  const fileName = mediaCounter.toString();
  mediaMap[fileName] = `${cardData.imageId}.webp`;

  // Get the image data
  const imageData = await db.images.get(cardData.imageId);
  if (!imageData) {
    console.error(`Image not found: ${cardData.imageId}`);
    return;
  }

  // Store image data for later
  mediaMap._images = mediaMap._images || [];
  mediaMap._images.push({
    fileName,
    data: imageData.image,
  });

  // Create cloze-style occlusions
  const occlusionText = cardData.boxes.map(
    (box, i) =>
      `{{c${i + 1}::image-occlusion:rect:left=${box.x}:top=${box.y}:width=${box.width}:height=${box.height}:oi=1}}`,
  );

  // Image HTML
  const imageHtml = `<img src="${cardData.imageId}.webp">`;
  const unitSeparator = String.fromCharCode(31);
  const fullContent = `${occlusionText.join("<br>")}${unitSeparator}${imageHtml}${unitSeparator}${unitSeparator}${unitSeparator}`;

  // Add note (using Cloze model)
  sqlDb.run("INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    noteId, // id
    guid, // guid
    modelIds["Image Occlusion"], // mid (Cloze model)
    timestamp, // mod
    -1, // usn
    " auto-gen ", // tags
    fullContent, // flds (Text + Extra)
    occlusionText.join(" "), // sfld
    calculateChecksum(fullContent), // csum
    0, // flags
    "", // data
  ]);

  // Add a card for each occlusion
  for (let i = 0; i < cardData.boxes.length; i++) {
    sqlDb.run(
      "INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        cardId.toString() + i.toString(), // id
        noteId, // nid
        timestamp.toString(), // did
        i, // ord
        timestamp, // mod
        -1, // usn
        0, // type
        0, // queue
        0, // due
        0, // ivl
        0, // factor
        0, // reps
        0, // lapses
        0, // left
        0, // odue
        0, // odid
        0, // flags
        "{}", // data
      ],
    );
  }
}
async function packageAndDownload(
  sqlDb: Database,
  mediaMap: Record<string, any>,
  deckName: string,
) {
  // Export the database to binary
  const dbBuffer = sqlDb.export();

  // Create a zip file
  const zip = new JSZip();

  // Add the SQLite database to the zip
  zip.file("collection.anki21", new Uint8Array(dbBuffer));

  // Add media files to the zip
  if (mediaMap._images) {
    for (const image of mediaMap._images) {
      // Extract base64 data (removing the data URL prefix)
      const base64Data = image.data.split(",")[1];
      zip.file(image.fileName, base64Data, { base64: true });
    }

    // Remove internal _images property before creating media mapping
    delete mediaMap._images;
  }

  // Add media mapping file
  zip.file("media", JSON.stringify(mediaMap));

  // Generate the zip file and trigger download
  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `${deckName}-anki-cards.apkg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function calculateChecksum(text: string) {
  // Simple checksum calculation - Anki uses a more complex one
  let total = 0;
  for (let i = 0; i < text.length; i++) {
    total += text.charCodeAt(i);
  }
  return total % 1000000;
}
