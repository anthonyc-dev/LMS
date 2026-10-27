import type { Book } from "@/features/books/types/book";
import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Spinner } from "@/shared/components/ui/spinner";

export function DeleteBookModal({
  book,
  open,
  onClose,
  onConfirm,
  isDeleting,
}: {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}) {
  if (!book) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-primary/20 overflow-hidden rounded-xl border p-0 shadow-sm sm:max-w-sm">
        <div className="space-y-5 p-8 text-center">
          <div className="bg-error-bg text-error-bg0 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">
              Delete Metadata?
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Are you sure you want to delete metadata for{" "}
              <span className="font-bold text-slate-800">"{book.title}"</span>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={onClose}
              className="h-11 flex-1 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={onConfirm}
              className="bg-error-bg0 shadow-error-bg hover:bg-error-text h-11 flex-1 rounded-xl font-bold text-white shadow-md"
            >
              {isDeleting ? <Spinner className="mr-2" /> : null}
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
