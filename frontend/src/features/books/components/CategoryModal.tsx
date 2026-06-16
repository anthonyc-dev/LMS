import { useState } from "react";
import { Tag, Loader2 } from "lucide-react";
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
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { type UICategory, PALETTE } from "@/features/books/api/categories";

interface CategoryModalProps {
  open: boolean;
  initial: UICategory | null;
  isLoading?: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string }) => void;
}

export function CategoryModal({
  open,
  initial,
  isLoading,
  onClose,
  onSave,
}: CategoryModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [nameErr, setNameErr] = useState(false);
  const color = initial?.color ?? PALETTE[0];

  // Sync when editing different category
  useState(() => {
    setName(initial?.name ?? "");
    setDesc(initial?.description ?? "");
    setNameErr(false);
  });

  const handleSave = () => {
    if (!name.trim()) {
      setNameErr(true);
      return;
    }
    onSave({ name: name.trim(), description: desc.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && !val && onClose()}>
      <DialogContent className="overflow-hidden rounded-4xl border-none p-0 shadow-2xl sm:max-w-md">
        {/* Header */}
        <div
          className="relative overflow-hidden p-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${color}dd, ${color})`,
          }}
        >
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/10" />
          <DialogHeader className="relative z-10 space-y-1">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-white">
              <Tag className="size-5" />
              {initial ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-white/70">
              {initial
                ? "Update this category's details."
                : "Add a new book category to your library."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 bg-white p-6">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">
              Category Name <span className="text-error-bg0">*</span>
            </Label>
            <Input
              id="cat-name"
              disabled={isLoading}
              placeholder="e.g. Science Fiction"
              className={`rounded-xl border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 ${nameErr ? "border-error-text focus-visible:border-error-bg0" : ""}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameErr(false);
              }}
            />
            {nameErr && (
              <p className="text-xs font-medium text-error-bg0">
                Name is required.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">
              Description
            </Label>
            <Textarea
              id="cat-desc"
              disabled={isLoading}
              placeholder="Brief description of this category…"
              className="h-20 resize-none rounded-xl border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3 border-t border-slate-100 bg-slate-50 p-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl font-bold text-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 rounded-xl font-bold text-white shadow-md"
            style={{ backgroundColor: color }}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initial ? "Save Changes" : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
