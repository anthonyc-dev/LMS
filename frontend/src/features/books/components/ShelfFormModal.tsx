import { useState } from "react";
import { Layers } from "lucide-react";
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
import { Loader2 } from "lucide-react";
import {
  type Shelf,
  type ShelfStatus,
  FLOORS,
  SECTIONS,
  CATS,
} from "@/features/books/types/shelf";

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
  code: "",
  label: "",
  floor: FLOORS[0],
  section: SECTIONS[0],
  category: CATS[0],
  capacity: "60",
  occupied: "0",
  status: "active" as ShelfStatus,
  notes: "",
};

export interface ShelfFormProps {
  open: boolean;
  initial: Shelf | null;
  isPending?: boolean;
  onClose: () => void;
  onSave: (data: Omit<Shelf, "id" | "lastAudited">) => void;
}

export function ShelfFormModal({
  open,
  initial,
  isPending,
  onClose,
  onSave,
}: ShelfFormProps) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          code: initial.code,
          label: initial.label,
          floor: initial.floor,
          section: initial.section,
          category: initial.category,
          capacity: String(initial.capacity),
          occupied: String(initial.occupied),
          status: initial.status,
          notes: initial.notes,
        }
      : { ...EMPTY_FORM },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (val: string | null) =>
    setForm((f) => ({ ...f, [key]: (val ?? "") as never }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = "Shelf code is required.";
    if (!form.label.trim()) e.label = "Label is required.";
    if (!form.capacity || isNaN(+form.capacity) || +form.capacity <= 0)
      e.capacity = "Enter a valid capacity.";
    if (isNaN(+form.occupied) || +form.occupied < 0)
      e.occupied = "Enter a valid occupied count.";
    if (+form.occupied > +form.capacity)
      e.occupied = "Occupied cannot exceed capacity.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      code: form.code.trim(),
      label: form.label.trim(),
      floor: form.floor,
      section: form.section,
      category: form.category,
      capacity: +form.capacity,
      occupied: +form.occupied,
      status: form.status,
      notes: form.notes.trim(),
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
              <Layers className="size-5" />{" "}
              {initial ? "Edit Shelf" : "New Shelf"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-400">
              {initial
                ? "Update shelf details and capacity."
                : "Register a new shelf in your library."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <Field id="shelf-code" label="Shelf Code *" err={errors.code}>
              <Input
                id="shelf-code"
                placeholder="e.g. A-01"
                className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                value={form.code}
                onChange={(e) => set("code")(e.target.value)}
              />
            </Field>
            <Field id="shelf-status" label="Status">
              <Select
                value={form.status}
                onValueChange={(v) => set("status")(v as ShelfStatus)}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field id="shelf-label" label="Shelf Label *" err={errors.label}>
            <Input
              id="shelf-label"
              placeholder="e.g. Fiction — Row 1"
              className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
              value={form.label}
              onChange={(e) => set("label")(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field id="shelf-floor" label="Floor">
              <Select
                value={form.floor}
                onValueChange={(v) => {
                  if (v !== null) set("floor")(v);
                }}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {FLOORS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="shelf-section" label="Section">
              <Select
                value={form.section}
                onValueChange={(v) => {
                  if (v !== null) set("section")(v);
                }}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field id="shelf-category" label="Assigned Category">
            <Select
              value={form.category}
              onValueChange={(v) => {
                if (v !== null) set("category")(v);
              }}
            >
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                {CATS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field id="shelf-capacity" label="Capacity *" err={errors.capacity}>
              <Input
                id="shelf-capacity"
                type="number"
                min="1"
                className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                value={form.capacity}
                onChange={(e) => set("capacity")(e.target.value)}
              />
            </Field>
            <Field
              id="shelf-occupied"
              label="Currently Occupied"
              err={errors.occupied}
            >
              <Input
                id="shelf-occupied"
                type="number"
                min="0"
                className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                value={form.occupied}
                onChange={(e) => set("occupied")(e.target.value)}
              />
            </Field>
          </div>

          <Field id="shelf-notes" label="Notes">
            <Input
              id="shelf-notes"
              placeholder="Any remarks about this shelf…"
              className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter className="flex gap-3 border-t border-slate-100 bg-slate-50 p-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-xl font-bold text-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 rounded-xl bg-slate-900 font-bold text-white shadow-md hover:bg-slate-800"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initial ? "Save Changes" : "Create Shelf"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
