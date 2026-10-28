import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { BookOpen, Edit, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/shared/components/ui/spinner";
import type { Book, UpdateBookDto } from "@/features/books/types/book";
import { useCategories } from "@/features/books/api/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface EditModalProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updated: UpdateBookDto) => void;
  isUpdating?: boolean;
}

export function EditBookModal({
  book,
  open,
  onClose,
  onSave,
  isUpdating = false,
}: EditModalProps) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    categoryId: "",
    isbn: "",
    description: "",
    publisher: "",
    pages: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  useEffect(() => {
    if (book) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        title: book.title || "",
        author: book.author || "",
        categoryId: book.categoryId || "",
        isbn: book.isbn || "",
        description: book.description || "",
        publisher: book.publisher || "",
        pages: book.pages ? String(book.pages) : "",
      });
      setCoverFile(null);
      setCoverPreview(book.coverImage || null);
    }
  }, [book, open]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  if (!book) return null;

  const handleSave = () => {
    if (!form.title || !form.isbn || !form.categoryId) {
      toast.error(
        "Please fill in all required fields (Title, ISBN, Category ID).",
      );
      return;
    }

    onSave(book.id, {
      ...form,
      pages: form.pages ? parseInt(form.pages, 10) : undefined,
      coverImage: coverFile || undefined,
    });
  };

  const f = (key: keyof typeof form) => (val: string | null) =>
    setForm((p) => ({ ...p, [key]: (val ?? "") as never }));

  return (
    <Dialog
      key={open ? (book?.id ?? "edit") : "closed"}
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isUpdating) {
          onClose();
        }
      }}
    >
      <DialogContent className="border-primary/20 flex max-h-[90vh] flex-col overflow-hidden rounded-xl border p-0 shadow-sm sm:max-h-[85vh] sm:max-w-[560px]">
        {/* Header */}
        <div className="bg-primary relative shrink-0 overflow-hidden p-6 text-white">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute top-4 right-10 opacity-10">
            <BookOpen size={80} className="-rotate-12" />
          </div>
          <DialogHeader className="relative z-10 space-y-1">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-white">
              <Edit className="size-5" /> Edit Book Metadata
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/85 text-sm font-medium">
              Update the metadata for "{book.title}".
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto bg-white p-6">
          <div className="flex items-start gap-5">
            <div className="w-24 shrink-0 space-y-2">
              <div
                className="group relative flex aspect-3/4 w-full cursor-pointer overflow-hidden rounded-xl border border-slate-200/50 shadow-md transition-all hover:border-blue-400"
                onClick={() => !isUpdating && fileRef.current?.click()}
              >
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt={book.title}
                      className="h-full w-full object-cover"
                    />
                    {!isUpdating && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoverPreview(null);
                          setCoverFile(null);
                        }}
                        className="absolute top-1 right-1 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 transition-colors group-hover:bg-blue-50">
                    <BookOpen className="size-5 text-slate-300 group-hover:text-blue-400" />
                    <span className="mt-2 text-[10px] font-bold text-slate-400 group-hover:text-blue-600">
                      Upload
                    </span>
                  </div>
                )}
                {!isUpdating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Upload className="size-6 text-white" />
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
                disabled={isUpdating}
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-slate-700">
                  Title <span className="text-error-bg0">*</span>
                </Label>
                <Input
                  disabled={isUpdating}
                  value={form.title}
                  onChange={(e) => f("title")(e.target.value)}
                  className="focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-slate-700">
                  Author
                </Label>
                <Input
                  disabled={isUpdating}
                  value={form.author}
                  onChange={(e) => f("author")(e.target.value)}
                  className="focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl border-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Category <span className="text-error-bg0">*</span>
              </Label>
              <Select
                disabled={isUpdating}
                value={form.categoryId}
                onValueChange={f("categoryId")}
              >
                <SelectTrigger className="w-full rounded-xl border-slate-200 focus:ring-blue-500/20">
                  <SelectValue
                    placeholder={
                      isLoadingCategories ? "Loading..." : "Select a category"
                    }
                  >
                    {categories?.find((c) => c.id === form.categoryId)?.name ||
                      "Select a category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {categories?.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="py-2 text-sm"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                ISBN <span className="text-error-bg0">*</span>
              </Label>
              <Input
                disabled={isUpdating}
                value={form.isbn}
                onChange={(e) => f("isbn")(e.target.value)}
                placeholder="978-…"
                className="focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Publisher
              </Label>
              <Input
                disabled={isUpdating}
                value={form.publisher}
                onChange={(e) => f("publisher")(e.target.value)}
                className="focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">Pages</Label>
              <Input
                disabled={isUpdating}
                type="number"
                min="0"
                value={form.pages}
                onChange={(e) => f("pages")(e.target.value)}
                className="focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-slate-700">
              Description
            </Label>
            <Textarea
              disabled={isUpdating}
              value={form.description}
              onChange={(e) => f("description")(e.target.value)}
              placeholder="Brief summary…"
              className="focus-visible:border-primary focus-visible:ring-primary/20 h-20 resize-none rounded-xl border-slate-200"
            />
          </div>
        </div>

        <DialogFooter className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row">
          <Button
            disabled={isUpdating}
            variant="outline"
            onClick={onClose}
            className="w-full rounded-xl font-bold text-slate-600 sm:w-auto sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            disabled={isUpdating}
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 w-full rounded-xl font-bold text-white shadow-md shadow-none sm:w-auto sm:flex-1"
          >
            {isUpdating ? <Spinner className="mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
