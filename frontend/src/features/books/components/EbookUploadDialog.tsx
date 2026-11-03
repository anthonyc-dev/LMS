import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { booksApi } from "../api/books";
import type { Book } from "../types/book";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { EbookReader } from "./EbookReader";

export function EbookUploadDialog({
  book,
  onClose,
}: {
  book: Book;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [reading, setReading] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (action: "upload" | "remove") => {
      if (action === "remove") await booksApi.removeEbook(book.id);
      else if (file) await booksApi.uploadEbook(book.id, file);
      else throw new Error("PDF file is required");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("eBook updated");
      onClose();
    },
    onError: (error) =>
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message || "Unable to update eBook"
          : "Unable to update eBook",
      ),
  });
  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => !open && !mutation.isPending && onClose()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>eBook PDF: {book.title}</DialogTitle>
            <DialogDescription>
              Upload a PDF up to 10 MB. Users can read it from the book catalog.
            </DialogDescription>
          </DialogHeader>
          {book.ebookFileName && (
            <div className="space-y-2">
              <p className="text-sm break-all">
                Current PDF: {book.ebookFileName}
              </p>
              <Button
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => setReading(true)}
              >
                Read current PDF
              </Button>
            </div>
          )}
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!file) return;
              if (file.size > 10 * 1024 * 1024) {
                toast.error("PDF must be 10 MB or smaller");
                return;
              }
              mutation.mutate("upload");
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium">PDF file</span>
              <Input
                type="file"
                accept="application/pdf,.pdf"
                required
                disabled={mutation.isPending}
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!file || mutation.isPending}>
                {mutation.isPending
                  ? "Saving…"
                  : book.ebookFileName
                    ? "Replace PDF"
                    : "Upload PDF"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </form>
          {book.ebookFileName && (
            <form
              className="space-y-3 border-t pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate("remove");
              }}
            >
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" required disabled={mutation.isPending} />
                Remove this PDF from the catalog.
              </label>
              <Button
                type="submit"
                variant="destructive"
                disabled={mutation.isPending}
              >
                Remove PDF
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {reading && (
        <EbookReader
          bookId={book.id}
          title={book.title}
          onClose={() => setReading(false)}
        />
      )}
    </>
  );
}
