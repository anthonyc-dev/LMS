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
  type ShelfSection,
  FLOORS,
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
      {err && <p className="text-error-bg0 text-xs font-medium">{err}</p>}
    </div>
  );
}

export interface ShelfFormPayload {
  code: string;
  name: string;
  floor: string;
  description?: string;
  notes: string;
  sections: { id?: string; name: string }[];
}

export interface ShelfFormProps {
  open: boolean;
  initial: Shelf | null;
  isPending?: boolean;
  onClose: () => void;
  onSave: (data: ShelfFormPayload) => void;
}

export function ShelfFormModal({
  open,
  initial,
  isPending,
  onClose,
  onSave,
}: ShelfFormProps) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [floor, setFloor] = useState(initial?.floor ?? FLOORS[0]);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [sections, setSections] = useState<ShelfSection[]>(
    initial?.sections ?? [],
  );
  const [sectionInput, setSectionInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!code.trim()) e.code = "Shelf code is required.";
    if (!name.trim()) e.name = "Name is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addSection = () => {
    const trimmed = sectionInput.trim();
    if (!trimmed) return;
    if (sections.some((s) => s.name === trimmed)) return;
    setSections((prev) => [...prev, { name: trimmed }]);
    setSectionInput("");
  };

  const removeSection = (sectionName: string) => {
    setSections((prev) => prev.filter((s) => s.name !== sectionName));
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      code: code.trim(),
      name: name.trim(),
      floor,
      notes: notes.trim(),
      sections: sections.map((s) => ({ id: s.id, name: s.name })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-primary/20 overflow-hidden rounded-xl border p-0 shadow-sm sm:max-w-lg">
        <div className="bg-primary relative overflow-hidden p-6 text-white">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
          <DialogHeader className="relative z-10 space-y-1">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-white">
              <Layers className="size-5" />{" "}
              {initial ? "Edit Shelf" : "New Shelf"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/85 text-sm font-medium">
              {initial
                ? "Update shelf details and capacity."
                : "Register a new shelf in your library."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto bg-white p-6">
          <Field id="shelf-code" label="Shelf Code *" err={errors.code}>
            <Input
              id="shelf-code"
              placeholder="e.g. A-01"
              className="focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl border-slate-200"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </Field>

          <Field id="shelf-name" label="Shelf Name *" err={errors.name}>
            <Input
              id="shelf-name"
              placeholder="e.g. Fiction — Row 1"
              className="focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl border-slate-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field id="shelf-floor" label="Floor">
            <Select
              value={floor}
              onValueChange={(v) => {
                if (v !== null) setFloor(v);
              }}
            >
              <SelectTrigger className="w-full rounded-xl border-slate-200">
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

          <Field id="shelf-sections" label="Sections">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="shelf-sections"
                  placeholder="e.g. Fiction, Science"
                  className="rounded-xl border-slate-200"
                  value={sectionInput}
                  onChange={(e) => setSectionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSection();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-xl border-slate-200"
                  onClick={addSection}
                >
                  Add
                </Button>
              </div>
              {sections.length > 0 && (
                <div className="space-y-1.5">
                  {sections.map((s, idx) => {
                    const hasBooks = (s.bookCopies?.length ?? 0) > 0;

                    return s.id ? (
                      <div key={s.id} className="flex items-center gap-2">
                        <Input
                          value={s.name}
                          onChange={(e) => {
                            setSections((prev) =>
                              prev.map((sec, i) =>
                                i === idx
                                  ? { ...sec, name: e.target.value }
                                  : sec,
                              ),
                            );
                          }}
                          className="h-8 rounded-lg border-slate-200 text-xs"
                        />
                        {hasBooks ? (
                          <span
                            className="bg-warning-bg text-warning-bg0 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                            title="Cannot delete — section has book copies"
                          >
                            Has books
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeSection(s.name)}
                            className="bg-error-bg text-error-text hover:bg-error-bg hover:text-error-text shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        key={s.name}
                        className="bg-success-bg text-success-text inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold"
                      >
                        {s.name}
                        <button
                          type="button"
                          onClick={() => removeSection(s.name)}
                          className="text-success-text hover:text-error-bg0 ml-0.5"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Field>

          <Field id="shelf-notes" label="Notes">
            <Input
              id="shelf-notes"
              placeholder="Any remarks about this shelf…"
              className="focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl border-slate-200"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="w-full rounded-xl font-bold text-slate-600 sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 w-full rounded-xl font-bold text-white shadow-md sm:flex-1"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initial ? "Save Changes" : "Create Shelf"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
