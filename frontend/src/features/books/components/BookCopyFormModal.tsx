import { useState, useEffect, useMemo } from "react";
import { BookCopy as BookCopyIcon, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import {
  type BookCopy,
  type BookCopyStatus,
  type BookCondition,
} from "@/features/books/types/bookCopy";
import { useBooks } from "@/features/books/hooks/useBooks";
import { useShelves } from "@/features/books/api/shelves";

function Field({
  id,
  label,
  err,
  children,
}: {
  id: string;
  label: string;
  err?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-bold text-slate-700">
        {label}
      </Label>
      {children}
      {err && <p className="text-xs font-medium text-rose-500">{err}</p>}
    </div>
  );
}

const EMPTY_FORM = {
  status: "AVAILABLE" as BookCopyStatus,
  condition: "GOOD" as BookCondition,
  notes: "",
  acquiredAt: new Date().toISOString().split("T")[0],
  purchasePrice: "0",
  bookId: "",
  shelfId: "",
};

export interface BookCopyFormProps {
  open: boolean;
  initial: BookCopy | null;
  isPending?: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function BookCopyFormModal({
  open,
  initial,
  isPending,
  onClose,
  onSave,
}: BookCopyFormProps) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          status: initial.status,
          condition: initial.condition,
          notes: initial.notes || "",
          acquiredAt: initial.acquiredAt
            ? String(initial.acquiredAt).split("T")[0]
            : "",
          purchasePrice: initial.purchasePrice
            ? String(initial.purchasePrice)
            : "0",
          bookId: initial.bookId,
          shelfId: initial.shelfId || "",
        }
      : { ...EMPTY_FORM },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              status: initial.status,
              condition: initial.condition,
              notes: initial.notes || "",
              acquiredAt: initial.acquiredAt
                ? String(initial.acquiredAt).split("T")[0]
                : "",
              purchasePrice: initial.purchasePrice
                ? String(initial.purchasePrice)
                : "0",
              bookId: initial.bookId,
              shelfId: initial.shelfId || "",
            }
          : { ...EMPTY_FORM },
      );
      setErrors({});
    }
  }, [open, initial]);

  const { data: paginatedBooks } = useBooks({ limit: 1000 });
  const books = paginatedBooks?.data || [];

  const { data: shelves = [] } = useShelves();

  const bookItems = useMemo(() => {
    return books.map((b) => (
      <SelectItem key={b.id} value={b.id}>
        {b.title} {b.isbn ? `(${b.isbn})` : ""}
      </SelectItem>
    ));
  }, [books]);

  const shelfItems = useMemo(() => {
    return shelves.map((s) => (
      <SelectItem key={s.id} value={s.id}>
        {s.code} - {s.name}
      </SelectItem>
    ));
  }, [shelves]);

  const set = (key: keyof typeof form) => (val: string | null) =>
    setForm((f) => ({ ...f, [key]: (val ?? "") as never }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.bookId) e.bookId = "Book selection is required.";
    if (
      form.purchasePrice &&
      (isNaN(+form.purchasePrice) || +form.purchasePrice < 0)
    )
      e.purchasePrice = "Enter a valid purchase price.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      status: form.status,
      condition: form.condition,
      notes: form.notes.trim() || undefined,
      acquiredAt: form.acquiredAt
        ? new Date(form.acquiredAt).toISOString()
        : undefined,
      purchasePrice: form.purchasePrice ? +form.purchasePrice : undefined,
      bookId: form.bookId,
      shelfId: form.shelfId || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-4xl border-none p-0 shadow-2xl sm:max-w-lg">
        <div className="relative overflow-hidden bg-linear-to-br from-slate-800 to-slate-900 p-6 text-white">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
          <DialogHeader className="relative z-10 space-y-1">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-white">
              <BookCopyIcon className="size-5" />{" "}
              {initial ? "Edit Book Copy" : "New Book Copy"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-400">
              {initial
                ? "Update book copy details."
                : "Register a new physical copy of a book."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[50vh] space-y-4 overflow-y-auto bg-white p-6 md:max-h-[60vh]">
          <Field id="book-id" label="Book *" err={errors.bookId}>
            <Select value={form.bookId} onValueChange={(v) => set("bookId")(v)} disabled={!!initial}>
              <SelectTrigger className="w-full rounded-xl border-slate-200">
                <SelectValue placeholder="Select a book">
                  <span className="block truncate pr-4">
                    {books.find((b) => b.id === form.bookId)?.title ||
                      (initial && initial.bookId === form.bookId
                        ? initial.book?.title
                        : "Select a book")}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                {bookItems}
              </SelectContent>
            </Select>
          </Field>

          {initial && initial.barcode && (
            <Field id="barcode" label="Barcode">
              <Input
                id="barcode"
                className="cursor-not-allowed rounded-xl border-slate-200 bg-slate-50"
                value={initial.barcode}
                disabled
              />
            </Field>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="status" label="Status">
              <Select
                value={form.status}
                onValueChange={(v) => set("status")(v)}
              >
                <SelectTrigger className="w-full rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                  <SelectItem value="BORROWED">BORROWED</SelectItem>
                  <SelectItem value="RESERVED">RESERVED</SelectItem>
                  <SelectItem value="LOST">LOST</SelectItem>
                  <SelectItem value="DAMAGED">DAMAGED</SelectItem>
                  <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field id="condition" label="Condition">
              <Select
                value={form.condition}
                onValueChange={(v) => set("condition")(v)}
              >
                <SelectTrigger className="w-full rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="NEW">NEW</SelectItem>
                  <SelectItem value="GOOD">GOOD</SelectItem>
                  <SelectItem value="FAIR">FAIR</SelectItem>
                  <SelectItem value="POOR">POOR</SelectItem>
                  <SelectItem value="DAMAGED">DAMAGED</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field id="shelf-id" label="Location (Shelf)">
            <Select
              value={form.shelfId}
              onValueChange={(v) => set("shelfId")(v === "none" ? "" : v)}
            >
              <SelectTrigger className="w-full rounded-xl border-slate-200">
                <SelectValue placeholder="No shelf assigned">
                  {form.shelfId === "" || form.shelfId === "none"
                    ? "No shelf assigned"
                    : shelves.find((s) => s.id === form.shelfId)?.name ||
                      (initial && initial.shelfId === form.shelfId
                        ? initial.shelf?.name
                        : form.shelfId)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="none">No shelf assigned</SelectItem>
                {shelfItems}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="acquired-at" label="Acquired Date">
              <Input
                id="acquired-at"
                type="date"
                className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                value={form.acquiredAt}
                onChange={(e) => set("acquiredAt")(e.target.value)}
                disabled={!!initial}
              />
            </Field>

            <Field
              id="purchase-price"
              label="Purchase Price"
              err={errors.purchasePrice}
            >
              <Input
                id="purchase-price"
                type="number"
                step="0.01"
                min="0"
                className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                value={form.purchasePrice}
                onChange={(e) => set("purchasePrice")(e.target.value)}
                disabled={!!initial}
              />
            </Field>
          </div>

          <Field id="notes" label="Notes">
            <Input
              id="notes"
              placeholder="Any remarks..."
              className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="w-full rounded-xl font-bold text-slate-600 sm:w-auto sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-full rounded-xl bg-slate-900 font-bold text-white shadow-md hover:bg-slate-800 sm:w-auto sm:flex-1"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initial ? "Save Changes" : "Create Copy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
