import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Tag,
  BookOpen,
  MoreHorizontal,
  AlertCircle,
  BarChart3,
  Layers,
  TrendingUp,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";

// ---------------------------------------------------------------------------
// Types & seed data
// ---------------------------------------------------------------------------

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  bookCount: number;
  createdAt: string;
}

const PALETTE = [
  "#6366f1",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#a855f7",
];

const INITIAL_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Fiction",
    description: "Novels and short stories drawn from imagination.",
    color: "#6366f1",
    bookCount: 148,
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "Science",
    description: "Natural sciences, physics, biology and chemistry.",
    color: "#10b981",
    bookCount: 94,
    createdAt: "2024-01-12",
  },
  {
    id: "3",
    name: "Technology",
    description: "Computing, programming and digital innovation.",
    color: "#3b82f6",
    bookCount: 112,
    createdAt: "2024-01-14",
  },
  {
    id: "4",
    name: "Biography",
    description: "Life stories of notable historical figures.",
    color: "#f59e0b",
    bookCount: 57,
    createdAt: "2024-02-01",
  },
  {
    id: "5",
    name: "Self-Help",
    description: "Personal growth, productivity and wellness.",
    color: "#8b5cf6",
    bookCount: 83,
    createdAt: "2024-02-10",
  },
  {
    id: "6",
    name: "History",
    description: "World history, civilizations and events.",
    color: "#ec4899",
    bookCount: 76,
    createdAt: "2024-02-15",
  },
  {
    id: "7",
    name: "Philosophy",
    description: "Ethics, logic and critical thinking.",
    color: "#14b8a6",
    bookCount: 42,
    createdAt: "2024-03-01",
  },
  {
    id: "8",
    name: "Mystery",
    description: "Crime fiction, thrillers and detective stories.",
    color: "#f97316",
    bookCount: 69,
    createdAt: "2024-03-05",
  },
];

// ---------------------------------------------------------------------------
// Category Form Modal
// ---------------------------------------------------------------------------

interface FormModalProps {
  open: boolean;
  initial: Category | null;
  onClose: () => void;
  onSave: (data: { name: string; description: string; color: string }) => void;
}

function CategoryFormModal({ open, initial, onClose, onSave }: FormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [color, setColor] = useState(initial?.color ?? PALETTE[0]);
  const [nameErr, setNameErr] = useState(false);

  // Sync when editing different category
  useState(() => {
    setName(initial?.name ?? "");
    setDesc(initial?.description ?? "");
    setColor(initial?.color ?? PALETTE[0]);
    setNameErr(false);
  });

  const handleSave = () => {
    if (!name.trim()) {
      setNameErr(true);
      return;
    }
    onSave({ name: name.trim(), description: desc.trim(), color });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              Category Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="cat-name"
              placeholder="e.g. Science Fiction"
              className={`rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 ${nameErr ? "border-rose-400 focus-visible:border-rose-500" : ""}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameErr(false);
              }}
            />
            {nameErr && (
              <p className="text-xs font-medium text-rose-500">
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
              placeholder="Brief description of this category…"
              className="h-20 resize-none rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">
              Label Color
            </Label>
            <div className="flex flex-wrap gap-2.5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                  aria-label={c}
                >
                  {color === c && (
                    <Check className="size-4 stroke-3 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 border-t border-slate-100 bg-slate-50 p-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl font-bold text-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 rounded-xl font-bold text-white shadow-md"
            style={{ backgroundColor: color }}
          >
            {initial ? "Save Changes" : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirm Modal
// ---------------------------------------------------------------------------

function DeleteConfirmModal({
  open,
  category,
  onClose,
  onConfirm,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!category) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-4xl border-none p-0 shadow-2xl sm:max-w-sm">
        <div className="space-y-5 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">
              Delete Category?
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-800">
                "{category.name}"
              </span>
              ? This may affect{" "}
              <span className="font-bold text-rose-600">
                {category.bookCount}
              </span>{" "}
              books linked to it.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="h-11 flex-1 rounded-xl bg-rose-500 font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-600"
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function CategoryPage() {
  usePageTitle("Category");
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Derived
  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [categories, search],
  );

  const totalBooks = categories.reduce((s, c) => s + c.bookCount, 0);
  const topCategory = [...categories].sort(
    (a, b) => b.bookCount - a.bookCount,
  )[0];

  const pieData = categories.map((c) => ({
    name: c.name,
    value: c.bookCount,
    color: c.color,
  }));

  // Handlers
  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditTarget(c);
    setFormOpen(true);
  };
  const openDelete = (c: Category) => {
    setDeleteTarget(c);
    setDeleteOpen(true);
  };

  const handleSave = (data: {
    name: string;
    description: string;
    color: string;
  }) => {
    if (editTarget) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editTarget.id ? { ...c, ...data } : c)),
      );
      toast.success("Category updated successfully");
    } else {
      const newCat: Category = {
        id: Math.random().toString(36).slice(2, 9),
        bookCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
        ...data,
      };
      setCategories((prev) => [newCat, ...prev]);
      toast.success("Category created successfully");
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast.success("Category deleted");
    setDeleteOpen(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <div className="rounded-xl bg-violet-50 p-2">
              <Tag className="size-7" />
            </div>
            Category Management
          </h1>
          <p className="mt-1 ml-1 font-medium text-slate-500">
            Organize your catalog by creating and managing book categories.
          </p>
        </div>
        <Button
          onClick={openCreate}
          id="create-category-btn"
          className="h-11 gap-2 rounded-xl bg-slate-900 px-6 font-bold text-white shadow-lg shadow-violet-200 transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
        >
          <Plus className="size-4" /> New Category
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="group transition-all hover:border-violet-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="shrink-0 rounded-xl bg-violet-50 p-3 text-violet-600 transition-transform group-hover:scale-110">
              <Tag className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Total Categories
              </p>
              <h3 className="text-2xl font-black text-slate-900">
                {categories.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="group transition-all hover:border-indigo-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="shrink-0 rounded-xl bg-indigo-50 p-3 text-indigo-600 transition-transform group-hover:scale-110">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Books Categorized
              </p>
              <h3 className="text-2xl font-black text-slate-900">
                {totalBooks.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="group transition-all hover:border-emerald-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="shrink-0 rounded-xl bg-emerald-50 p-3 text-emerald-600 transition-transform group-hover:scale-110">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Most Popular
              </p>
              <h3 className="max-w-[120px] truncate text-base font-black text-slate-900">
                {topCategory?.name ?? "—"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {topCategory?.bookCount ?? 0} books
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group transition-all hover:border-amber-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="shrink-0 rounded-xl bg-amber-50 p-3 text-amber-600 transition-transform group-hover:scale-110">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Avg Books / Cat.
              </p>
              <h3 className="text-2xl font-black text-slate-900">
                {categories.length
                  ? Math.round(totalBooks / categories.length)
                  : 0}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Category Grid + Chart ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grid list — 2/3 */}
        <div className="space-y-4 lg:col-span-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search categories…"
              className="h-11 rounded-xl border-slate-200 bg-white pl-10 focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((cat) => {
              const pct =
                totalBooks > 0
                  ? Math.round((cat.bookCount / totalBooks) * 100)
                  : 0;
              return (
                <div
                  key={cat.id}
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Color strip */}
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: cat.color }}
                  />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      {/* Icon + name */}
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: `${cat.color}18`,
                            color: cat.color,
                          }}
                        >
                          <Tag className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900">
                            {cat.name}
                          </h3>
                          <p className="text-[11px] font-medium text-slate-400">
                            Since {cat.createdAt}
                          </p>
                        </div>
                      </div>

                      {/* Actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-xl border-slate-100 p-1.5 shadow-xl"
                        >
                          <DropdownMenuItem
                            onClick={() => openEdit(cat)}
                            className="cursor-pointer gap-2 rounded-lg py-2 font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Edit3 className="size-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 bg-slate-100" />
                          <DropdownMenuItem
                            onClick={() => openDelete(cat)}
                            className="cursor-pointer gap-2 rounded-lg py-2 font-medium text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="size-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Description */}
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed font-medium text-slate-500">
                      {cat.description || (
                        <span className="text-slate-300 italic">
                          No description provided.
                        </span>
                      )}
                    </p>

                    {/* Book count + bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="size-3" /> {cat.bookCount} books
                        </span>
                        <span>{pct}% of catalog</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-12 text-slate-400 sm:col-span-2">
                <Tag className="size-10 text-slate-300" />
                <p className="text-sm font-medium">
                  No categories match your search.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Distribution chart — 1/3 */}
        <Card className="sticky top-4 h-fit shadow-xs transition-shadow hover:shadow-md">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-black text-slate-800">
              <Layers className="size-4 text-violet-500" /> Distribution
            </CardTitle>
            <p className="text-xs font-medium text-slate-400">
              Books per category
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.97)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                  formatter={((v: number) => [`${v} books`, ""]) as never}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-3 w-full space-y-2">
              {[...categories]
                .sort((a, b) => b.bookCount - a.bookCount)
                .slice(0, 6)
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="max-w-[120px] truncate font-medium text-slate-600">
                        {c.name}
                      </span>
                    </div>
                    <span className="font-black text-slate-700">
                      {c.bookCount}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Modals ── */}
      {formOpen && (
        <CategoryFormModal
          open={formOpen}
          initial={editTarget}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
        />
      )}
      <DeleteConfirmModal
        open={deleteOpen}
        category={deleteTarget}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
