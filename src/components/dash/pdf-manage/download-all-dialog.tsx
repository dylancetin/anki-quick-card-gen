import type React from "react";

import { useState } from "react";
import { downloadAllCards } from "@/lib/download-all-cards";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DownloadAllButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await downloadAllCards(deckName);
      setIsOpen(false);
    } catch (error) {
      console.error("Error downloading cards:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"green"}>Download All Cards</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>Download Cards</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a deck name to download all cards.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deck-name">Deck Name</Label>
              <Input
                id="deck-name"
                name="deck-name"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Enter deck name"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <Button type="submit" disabled={isSubmitting || !deckName.trim()}>
              {isSubmitting ? "Downloading..." : "Download"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
