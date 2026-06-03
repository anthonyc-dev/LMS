import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import type { BookCopy } from "@/features/books/types/bookCopy";

export function DeleteBookCopyModal({
  open,
  bookCopy,
  isPending,
  onClose,
  onConfirm,
}: {
  open: boolean;
  bookCopy: BookCopy | null;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!bookCopy) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-4xl border-none p-0 shadow-2xl sm:max-w-sm">
        <div className="space-y-5 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">Delete Book Copy?</h3>
            <p className="text-sm font-medium text-slate-500">
              Remove copy{" "}
              <span className="font-bold text-slate-800">
                "{bookCopy.barcode}"
              </span>
              ? This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="h-11 flex-1 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isPending}
              className="h-11 flex-1 rounded-xl bg-rose-500 font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-600"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
