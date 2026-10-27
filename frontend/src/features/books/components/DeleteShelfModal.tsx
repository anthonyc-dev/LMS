import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import type { Shelf } from "@/features/books/types/shelf";

export function DeleteShelfModal({
  open,
  shelf,
  isPending,
  onClose,
  onConfirm,
}: {
  open: boolean;
  shelf: Shelf | null;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!shelf) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-primary/20 overflow-hidden rounded-xl border p-0 shadow-sm sm:max-w-sm">
        <div className="space-y-5 p-8 text-center">
          <div className="bg-error-bg text-error-bg0 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">
              Delete Shelf?
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Remove shelf{" "}
              <span className="font-bold text-slate-800">
                "{shelf.code} — {shelf.name}"
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
              className="bg-error-bg0 shadow-error-bg hover:bg-error-text h-11 flex-1 rounded-xl font-bold text-white shadow-md"
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
