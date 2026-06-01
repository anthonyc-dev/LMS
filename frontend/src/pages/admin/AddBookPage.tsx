import { useState, useRef } from "react";
import {
  Upload,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Tag,
  Hash,
  User,
  FileText,
  Library,
  Check,
  ImageIcon,
  X,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCreateBook } from "@/hooks/useBooks";
import { useCategories } from "@/lib/api/categories";

const LANGUAGES = [
  "English",
  "Filipino",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Chinese",
];

// ---------------------------------------------------------------------------
// Reusable field wrapper
// ---------------------------------------------------------------------------

function Field({
  id,
  label,
  required,
  hint,
  error,
  icon: Icon,
  children,
}: {
  id?: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-bold text-slate-700"
      >
        {Icon && <Icon className="size-3.5 text-slate-400" />}
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-[11px] font-medium text-slate-400">{hint}</p>
      )}
      {error && <p className="text-[11px] font-bold text-rose-500">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepDot({
  n,
  active,
  done,
}: {
  n: number;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all duration-300 ${
        done
          ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
          : active
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
            : "bg-slate-100 text-slate-400"
      }`}
    >
      {done ? <Check className="size-4" /> : n}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function AddBookPage() {
  usePageTitle("Add Metadata");
  const navigate = useNavigate();
  const createBookMutation = useCreateBook();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    categoryId: "",
    isbn: "",
    publisher: "",
    pages: "",
    language: "English",
    edition: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof formData) => (val: string | null) =>
    setFormData((f) => ({ ...f, [key]: (val ?? "") as never }));

  // Validation per step
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = "Book title is required.";
    if (!formData.categoryId.trim()) e.categoryId = "Category ID is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!formData.isbn.trim()) e.isbn = "ISBN is required.";
    if (!formData.description.trim())
      e.description = "Description is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    createBookMutation.mutate(
      {
        title: formData.title,
        author: formData.author,
        categoryId: formData.categoryId,
        isbn: formData.isbn,
        publisher: formData.publisher,
        pages: formData.pages ? parseInt(formData.pages, 10) : undefined,
        language: formData.language,
        edition: formData.edition,
        description: formData.description,
        coverImage: coverFile || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Book metadata added to catalog successfully!");
          navigate("/admin/books");
        },
        onError: () => {
          toast.error("Failed to add book metadata. Please try again.");
        },
      },
    );
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const steps = [
    { n: 1, label: "Core Info" },
    { n: 2, label: "Details" },
    { n: 3, label: "Review" },
  ];

  const selectedCategory = categories?.find(
    (c) => c.id === formData.categoryId,
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[720px] space-y-6 pb-12 duration-700">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl hover:bg-slate-100"
          onClick={() => navigate("/admin/books")}
        >
          <ArrowLeft className="size-5 text-slate-500" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Register Metadata
          </h1>
          <p className="mt-0.5 text-sm font-medium text-slate-500">
            Define a new book entry in the logical catalog.
          </p>
        </div>
        {/* Step indicator */}
        <div className="hidden items-center gap-2 sm:flex">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <StepDot n={s.n} active={step === s.n} done={step > s.n} />
                <span
                  className={`hidden text-xs font-bold md:block ${step === s.n ? "text-indigo-600" : step > s.n ? "text-emerald-600" : "text-slate-400"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 rounded-full transition-colors ${step > s.n ? "bg-emerald-400" : "bg-slate-100"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── STEP 1: Core Book Info ── */}
      {step === 1 && (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {/* Banner */}
          <div className="relative overflow-hidden bg-linear-to-br from-indigo-600 to-violet-600 p-6 text-white">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/5" />
            <div className="absolute top-4 right-12 opacity-10">
              <BookOpen size={100} className="-rotate-12" />
            </div>
            <div className="relative z-10 space-y-1">
              <Badge className="mb-2 border-white/20 bg-white/10 text-[10px] font-bold tracking-wider text-white uppercase">
                Step 1 of 3
              </Badge>
              <h2 className="text-2xl font-black text-white">
                Book Information
              </h2>
              <p className="font-medium text-indigo-200">
                Enter the core details that identify this book metadata.
              </p>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* Cover + Title/Author */}
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              {/* Cover uploader */}
              <div className="w-full shrink-0 sm:w-36">
                <Label className="mb-2 block text-sm font-bold text-slate-700">
                  Cover Image
                </Label>
                <div
                  className="group relative flex aspect-3/4 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 transition-all hover:border-indigo-400 hover:bg-indigo-50"
                  onClick={() => fileRef.current?.click()}
                >
                  {coverPreview ? (
                    <>
                      <img
                        src={coverPreview}
                        alt="Cover"
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoverPreview(null);
                          setCoverFile(null);
                        }}
                        className="absolute top-2 right-2 rounded-full bg-black/40 p-1 text-white transition-colors hover:bg-black/60"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mb-2 rounded-xl bg-slate-100 p-3 transition-colors group-hover:bg-indigo-100">
                        <ImageIcon className="size-5 transition-colors group-hover:text-indigo-500" />
                      </div>
                      <span className="px-4 text-center text-[11px] font-bold transition-colors group-hover:text-indigo-600">
                        Click to upload
                      </span>
                      <span className="mt-1 text-[10px] text-slate-300">
                        PNG, JPG up to 5MB
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
                {coverPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full rounded-xl border-slate-200 text-xs font-bold"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="mr-1 size-3" /> Change
                  </Button>
                )}
              </div>

              {/* Title & Author */}
              <div className="w-full flex-1 space-y-5">
                <Field
                  id="title"
                  label="Book Title"
                  required
                  icon={BookOpen}
                  error={errors.title}
                >
                  <Input
                    id="title"
                    placeholder="e.g. The Great Gatsby"
                    className="h-10 rounded-xl border-slate-200 text-sm focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                    value={formData.title}
                    onChange={(e) => {
                      set("title")(e.target.value);
                      setErrors((er) => ({ ...er, title: "" }));
                    }}
                  />
                </Field>
                <Field
                  id="author"
                  label="Author"
                  icon={User}
                  error={errors.author}
                >
                  <Input
                    id="author"
                    placeholder="e.g. F. Scott Fitzgerald"
                    className="h-10 rounded-xl border-slate-200 text-sm focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                    value={formData.author}
                    onChange={(e) => {
                      set("author")(e.target.value);
                      setErrors((er) => ({ ...er, author: "" }));
                    }}
                  />
                </Field>
                <Field
                  id="categoryId"
                  label="Category"
                  required
                  icon={Tag}
                  error={errors.categoryId}
                >
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => {
                      set("categoryId")(v);
                      setErrors((er) => ({ ...er, categoryId: "" }));
                    }}
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 focus:ring-indigo-500/20">
                      <SelectValue
                        placeholder={
                          isLoadingCategories
                            ? "Loading categories..."
                            : "Select a category"
                        }
                      >
                        {categories?.find((c) => c.id === formData.categoryId)
                          ?.name || "Select a category"}
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
                </Field>
              </div>
            </div>
          </div>

          <div className="flex justify-end px-6 pb-6">
            <Button
              onClick={handleNext}
              className="h-10 gap-2 rounded-xl bg-indigo-600 px-6 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95"
            >
              Continue to Details <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Additional Details ── */}
      {step === 2 && (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-linear-to-br from-violet-600 to-fuchsia-600 p-6 text-white">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/5" />
            <div className="relative z-10 space-y-1">
              <Badge className="mb-2 border-white/20 bg-white/10 text-[10px] font-bold tracking-wider text-white uppercase">
                Step 2 of 3
              </Badge>
              <h2 className="text-2xl font-black text-white">
                Additional Details
              </h2>
              <p className="font-medium text-violet-200">
                Add more context to help users find and understand this book.
              </p>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id="isbn"
                label="ISBN"
                required
                icon={Hash}
                error={errors.isbn}
                hint="International Standard Book Number"
              >
                <Input
                  id="isbn"
                  placeholder="e.g. 978-0743273565"
                  className="h-9 rounded-lg border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                  value={formData.isbn}
                  onChange={(e) => {
                    set("isbn")(e.target.value);
                    setErrors((er) => ({ ...er, isbn: "" }));
                  }}
                />
              </Field>
              <Field id="publisher" label="Publisher" icon={Library}>
                <Input
                  id="publisher"
                  placeholder="e.g. Scribner"
                  className="h-9 rounded-lg border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                  value={formData.publisher}
                  onChange={(e) => set("publisher")(e.target.value)}
                />
              </Field>
              <Field id="pages" label="Pages">
                <Input
                  id="pages"
                  type="number"
                  placeholder="e.g. 350"
                  min="1"
                  className="h-9 rounded-lg border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                  value={formData.pages}
                  onChange={(e) => set("pages")(e.target.value)}
                />
              </Field>
              <Field id="edition" label="Edition" icon={Type}>
                <Input
                  id="edition"
                  placeholder="e.g. 1st Edition"
                  className="h-9 rounded-lg border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                  value={formData.edition}
                  onChange={(e) => set("edition")(e.target.value)}
                />
              </Field>
              <Field id="language" label="Language">
                <Select
                  value={formData.language}
                  onValueChange={(v) => set("language")(v)}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 focus:ring-indigo-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l} className="py-2 text-sm">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field
              id="description"
              label="Description"
              required
              icon={FileText}
              error={errors.description}
              hint="A brief summary or synopsis to help students find the right book."
            >
              <Textarea
                id="description"
                placeholder="Brief summary of the book…"
                className="h-24 resize-none rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                value={formData.description}
                onChange={(e) => {
                  set("description")(e.target.value);
                  setErrors((er) => ({ ...er, description: "" }));
                }}
              />
            </Field>
          </div>

          <div className="flex justify-between px-6 pb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-10 gap-2 rounded-xl px-6 font-bold text-slate-600"
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button
              onClick={handleNext}
              className="h-10 gap-2 rounded-xl bg-violet-600 px-6 font-bold text-white shadow-lg shadow-violet-200 transition-all hover:scale-105 hover:bg-violet-700 active:scale-95"
            >
              Review & Submit <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Review ── */}
      {step === 3 && (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 to-teal-600 p-6 text-white">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/5" />
            <div className="relative z-10 space-y-1">
              <Badge className="mb-2 border-white/20 bg-white/10 text-[10px] font-bold tracking-wider text-white uppercase">
                Step 3 of 3
              </Badge>
              <h2 className="text-2xl font-black text-white">
                Review & Confirm
              </h2>
              <p className="font-medium text-emerald-100">
                Verify the details below before saving the metadata to the
                catalog.
              </p>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* Preview card */}
            <div className="flex flex-col gap-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:flex-row">
              {/* Cover */}
              <div className="w-24 shrink-0">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover"
                    className="aspect-3/4 w-full rounded-xl object-cover shadow-md"
                  />
                ) : (
                  <div className="flex aspect-3/4 w-full items-center justify-center rounded-xl bg-linear-to-br from-indigo-100 to-violet-100 shadow-md">
                    <BookOpen className="size-8 text-indigo-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {formData.title || (
                      <span className="text-slate-300">Untitled</span>
                    )}
                  </h3>
                  <p className="font-medium text-slate-500">
                    {formData.author || "Unknown author"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <Badge className="border-none bg-indigo-100 text-xs font-bold text-indigo-700">
                      {selectedCategory.name}
                    </Badge>
                  )}
                  {formData.language && (
                    <Badge className="border-none bg-slate-100 font-bold text-slate-600">
                      {formData.language}
                    </Badge>
                  )}
                </div>
                {formData.description && (
                  <p className="line-clamp-2 text-sm font-medium text-slate-500">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "ISBN", value: formData.isbn || "—" },
                { label: "Publisher", value: formData.publisher || "—" },
                { label: "Pages", value: formData.pages || "—" },
                { label: "Edition", value: formData.edition || "—" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="mb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {item.label}
                  </p>
                  <p className="truncate text-sm font-bold text-slate-800">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 px-6 pb-6 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-10 gap-2 rounded-xl px-6 font-bold text-slate-600"
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/books")}
                className="h-10 rounded-xl px-6 font-bold text-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createBookMutation.isPending}
                className="h-10 gap-2 rounded-xl bg-emerald-600 px-6 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:scale-105 hover:bg-emerald-700 active:scale-95"
              >
                <Check className="size-4" />{" "}
                {createBookMutation.isPending ? "Adding..." : "Add Metadata"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
