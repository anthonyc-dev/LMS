import { useState, useEffect, useMemo } from "react";
import {
  BookCopy as BookCopyIcon,
  Loader2,
  CheckIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { Checkbox } from "@/shared/components/ui/checkbox";
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
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Label } from "@/shared/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/shared/components/ui/command";
import { cn } from "@/shared/lib/utils";
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
      {err && <p className="text-xs font-medium text-error-bg0">{err}</p>}
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
  shelfSectionIds: [] as string[],
};

export interface BookCopyFormProps {
  open: boolean;
  initial: BookCopy | null;
  defaultBookId?: string;
  isPending?: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function BookCopyFormModal({
  open,
  initial,
  defaultBookId,
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
          bookId: initial.bookId || initial.book?.id || "",
          shelfId: initial.location?.shelfId || "",
          shelfSectionIds: initial.location?.sectionId
            ? [initial.location.sectionId]
            : [],
        }
      : { ...EMPTY_FORM },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [mode, setMode] = useState<"single" | "multiple">("single");
  const [count, setCount] = useState("2");
  const [bookPopoverOpen, setBookPopoverOpen] = useState(false);
  const [sectionPopoverOpen, setSectionPopoverOpen] = useState(false);

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
              bookId: initial.bookId || initial.book?.id || "",
              shelfId: initial.location?.shelfId || "",
              shelfSectionIds: initial.location?.sectionId
                ? [initial.location.sectionId]
                : [],
            }
          : { ...EMPTY_FORM, bookId: defaultBookId || "" },
      );
      setErrors({});
      setMode("single");
      setCount("2");
      setSectionPopoverOpen(false);
    }
  }, [open, initial, defaultBookId]);

  useEffect(() => {
    if (mode === "single" && form.shelfSectionIds.length > 1) {
      setForm((f) => ({
        ...f,
        shelfSectionIds: f.shelfSectionIds.slice(0, 1),
      }));
    }
  }, [mode, form.shelfSectionIds]);

  const { data: paginatedBooks } = useBooks({ limit: 1000 });
  const books = paginatedBooks?.data || [];

  const { data: shelves = [] } = useShelves();

  const bookItems = useMemo(() => {
    return books.map((b) => (
      <CommandItem
        key={b.id}
        value={`${b.title} ${b.isbn || ""} ${b.id}`}
        onSelect={() => {
          set("bookId")(b.id);
          setBookPopoverOpen(false);
        }}
      >
        <CheckIcon
          className={cn(
            "mr-2 h-4 w-4",
            form.bookId === b.id ? "opacity-100" : "opacity-0",
          )}
        />
        {b.title} {b.isbn ? `(${b.isbn})` : ""}
      </CommandItem>
    ));
  }, [books, form.bookId]);

  const shelfItems = useMemo(() => {
    return shelves.map((s) => (
      <SelectItem key={s.id} value={s.id}>
        {s.code} - {s.name}
      </SelectItem>
    ));
  }, [shelves]);

  const set = (key: keyof typeof form) => (val: any) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleToggleSection = (secId: string) => {
    if (initial || mode === "single") {
      setForm((f) => ({
        ...f,
        shelfSectionIds: f.shelfSectionIds.includes(secId) ? [] : [secId],
      }));
    } else {
      setForm((f) => ({
        ...f,
        shelfSectionIds: f.shelfSectionIds.includes(secId)
          ? f.shelfSectionIds.filter((id) => id !== secId)
          : [...f.shelfSectionIds, secId],
      }));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.bookId) e.bookId = "Book selection is required.";
    if (
      form.purchasePrice &&
      (isNaN(+form.purchasePrice) || +form.purchasePrice < 0)
    )
      e.purchasePrice = "Enter a valid purchase price.";

    if (!initial && mode === "multiple") {
      const parsedCount = parseInt(count, 10);
      if (isNaN(parsedCount) || parsedCount < 2) {
        e.count = "Enter a valid count (min 2).";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    try {
      if (!validate()) {
        return;
      }

      const safeIsoDate = (dateStr: string) => {
        if (!dateStr) return undefined;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
      };

      const payload = {
        status: form.status,
        condition: form.condition,
        notes: form.notes?.trim() || undefined,
        acquiredAt: form.acquiredAt ? safeIsoDate(form.acquiredAt) : undefined,
        purchasePrice: form.purchasePrice ? +form.purchasePrice : undefined,
        bookId: form.bookId,
        shelfSectionIds: form.shelfSectionIds,
        ...(mode === "multiple" && !initial
          ? { count: parseInt(count, 10) }
          : {}),
      };

      onSave(payload);
    } catch (err) {
      console.error("Crash in handleSave:", err);
    }
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
          {initial && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h4 className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
                Copy Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-xs font-medium text-slate-500">Book</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">
                    {books.find((b) => b.id === form.bookId)?.title ||
                      initial.book?.title ||
                      "Unknown Book"}
                  </div>
                </div>
                {initial.barcode && (
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-xs font-medium text-slate-500">
                      Barcode
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900">
                      {initial.barcode}
                    </div>
                  </div>
                )}
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-xs font-medium text-slate-500">
                    Acquired Date
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">
                    {form.acquiredAt || "N/A"}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-xs font-medium text-slate-500">
                    Purchase Price
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">
                    {form.purchasePrice
                      ? `$${Number(form.purchasePrice).toFixed(2)}`
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!initial && (
            <Field id="book-id" label="Book *" err={errors.bookId}>
              <Popover open={bookPopoverOpen} onOpenChange={setBookPopoverOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={bookPopoverOpen}
                      className="w-full justify-between rounded-xl border-slate-200 bg-white font-normal"
                    />
                  }
                >
                  <span className="truncate pr-4 text-slate-700">
                    {form.bookId
                      ? books.find((b) => b.id === form.bookId)?.title ||
                        "Unknown Book"
                      : "Search and select a book..."}
                  </span>
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 text-slate-500 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-(--anchor-width) min-w-[200px] rounded-xl border-slate-100 p-0 shadow-xl">
                  <Command>
                    <CommandInput
                      placeholder="Search books by title or ISBN..."
                      className="h-9 outline-none"
                    />
                    <CommandList>
                      <CommandEmpty>No books found.</CommandEmpty>
                      <CommandGroup>{bookItems}</CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>
          )}

          {!initial && (
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="mode" label="Mode">
                <RadioGroup
                  value={mode}
                  onValueChange={(v) => setMode(v as "single" | "multiple")}
                  className="flex h-10 items-center gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="mode-single" />
                    <Label
                      htmlFor="mode-single"
                      className="cursor-pointer font-medium text-slate-700"
                    >
                      Single Copy
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="mode-multiple" />
                    <Label
                      htmlFor="mode-multiple"
                      className="cursor-pointer font-medium text-slate-700"
                    >
                      Multiple Copies
                    </Label>
                  </div>
                </RadioGroup>
              </Field>

              {mode === "multiple" ? (
                <Field id="count" label="Number of Copies" err={errors.count}>
                  <Input
                    id="count"
                    type="number"
                    min="2"
                    className="h-10 rounded-xl border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                    value={count}
                    onChange={(e) => {
                      setCount(e.target.value);
                      setErrors((er) => ({ ...er, count: "" }));
                    }}
                  />
                </Field>
              ) : (
                <div className="hidden sm:block"></div>
              )}
            </div>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="shelf-id" label="Location (Shelf)">
              <Select
                value={form.shelfId}
                onValueChange={(v) => {
                  setForm((f) => ({
                    ...f,
                    shelfId: v === "none" ? "" : (v ?? ""),
                    shelfSectionIds: [],
                  }));
                }}
              >
                <SelectTrigger className="w-full rounded-xl border-slate-200">
                  <SelectValue placeholder="No shelf assigned">
                    {form.shelfId === "" || form.shelfId === "none"
                      ? "No shelf assigned"
                      : shelves.find((s) => s.id === form.shelfId)?.name ||
                        (initial && initial.location?.shelfId === form.shelfId
                          ? initial.location?.shelfName
                          : form.shelfId)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="none">No shelf assigned</SelectItem>
                  {shelfItems}
                </SelectContent>
              </Select>
            </Field>

            <Field id="shelf-section-id" label="Location (Section)">
              <Popover
                open={sectionPopoverOpen}
                onOpenChange={setSectionPopoverOpen}
              >
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      disabled={!form.shelfId || form.shelfId === "none"}
                      className="w-full justify-between rounded-xl border-slate-200 bg-white px-3 py-2 text-left font-normal text-slate-700 disabled:opacity-50"
                    />
                  }
                >
                  <span className="truncate">
                    {form.shelfSectionIds.length === 0
                      ? "No section assigned"
                      : form.shelfSectionIds
                          .map((id) => {
                            const sec = shelves
                              .find((s) => s.id === form.shelfId)
                              ?.sections.find((s) => s.id === id);
                            return sec ? sec.name : id;
                          })
                          .join(", ")}
                  </span>
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 text-slate-500 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="max-h-60 w-(--anchor-width) min-w-[200px] overflow-y-auto rounded-xl border-slate-100 bg-white p-2 shadow-xl">
                  <div className="space-y-2">
                    {shelves
                      .find((s) => s.id === form.shelfId)
                      ?.sections.map((sec) => {
                        const isChecked = form.shelfSectionIds.includes(
                          sec.id!,
                        );
                        return (
                          <div
                            key={sec.id}
                            className="flex cursor-pointer items-center space-x-2 rounded-lg p-1.5 hover:bg-slate-50"
                            onClick={() => handleToggleSection(sec.id!)}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() =>
                                handleToggleSection(sec.id!)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-sm font-medium text-slate-700 select-none">
                              {sec.name}
                            </span>
                          </div>
                        );
                      })}
                    {!shelves.find((s) => s.id === form.shelfId)?.sections
                      .length && (
                      <p className="p-2 text-xs text-slate-400 italic">
                        No sections found for this shelf.
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </Field>
          </div>

          {!initial && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="acquired-at" label="Acquired Date">
                <Input
                  id="acquired-at"
                  type="date"
                  className="rounded-xl border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  value={form.acquiredAt}
                  onChange={(e) => set("acquiredAt")(e.target.value)}
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
                  className="rounded-xl border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  value={form.purchasePrice}
                  onChange={(e) => set("purchasePrice")(e.target.value)}
                />
              </Field>
            </div>
          )}

          <Field id="notes" label="Notes">
            <Input
              id="notes"
              placeholder="Any remarks..."
              className="rounded-xl border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
            />
          </Field>
        </div>
        {/* //modal */}
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
