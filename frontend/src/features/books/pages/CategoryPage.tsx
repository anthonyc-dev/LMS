import { useState, useMemo } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
} from "@/features/books/api/categories";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Tag,
  BookOpen,
  MoreHorizontal,
  BarChart3,
  Layers,
  TrendingUp,
  X,
} from "lucide-react";
import { CategoryModal } from "@/features/books/components/CategoryModal";
import { DeleteCategoryModal } from "@/features/books/components/DeleteCategoryModal";
import { CategoryPageSkeleton } from "@/features/books/components/CategoryPageSkeleton";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

// ---------------------------------------------------------------------------
// Types & seed data
// ---------------------------------------------------------------------------

interface UICategory extends Category {
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

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function CategoryPage() {
  usePageTitle("Category");

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UICategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UICategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Queries & Mutations
  const { data: serverCategories = [], isLoading } = useCategories();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Map server data to UI model
  const categories: UICategory[] = useMemo(() => {
    return serverCategories.map((c: Category, index: number) => ({
      id: c.id,
      name: c.name,
      description: c.description || "",
      color: PALETTE[index % PALETTE.length],
      bookCount: c.books?.length || 0,
      createdAt: c.createdAt
        ? new Date(c.createdAt).toISOString().slice(0, 10)
        : "N/A",
    }));
  }, [serverCategories]);

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
  const openEdit = (c: UICategory) => {
    setEditTarget(c);
    setFormOpen(true);
  };
  const openDelete = (c: UICategory) => {
    setDeleteTarget(c);
    setDeleteOpen(true);
  };

  const handleSave = (data: { name: string; description: string }) => {
    if (editTarget) {
      updateMutation.mutate(
        { id: editTarget.id, ...data },
        {
          onSuccess: () => {
            toast.success("Category updated successfully");
            setFormOpen(false);
          },
          onError: (error: Error) => {
            toast.error(
              (error as { response?: { data?: { message?: string } } }).response
                ?.data?.message || "Failed to update category",
            );
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Category created successfully");
          setFormOpen(false);
        },
        onError: (error: Error) => {
          toast.error(
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to create category",
          );
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Category deleted");
        setDeleteOpen(false);
      },
      onError: (error: Error) => {
        toast.error(
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message || "Failed to delete category",
        );
      },
    });
  };

  if (isLoading) {
    return <CategoryPageSkeleton />;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <div className="rounded-xl bg-slate-50 p-2">
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
          className="h-11 gap-2 rounded-xl bg-slate-900 px-6 font-bold text-white shadow-lg shadow-slate-200 transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
        >
          <Plus className="size-4" /> New Category
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="group border-slate-100 bg-white transition-all hover:border-slate-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="shrink-0 rounded-xl bg-slate-50 p-3 text-slate-600 transition-transform group-hover:scale-110">
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

        <Card className="group border-slate-100 bg-white transition-all hover:border-blue-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-600 transition-transform group-hover:scale-110">
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

        <Card className="group border-slate-100 bg-white transition-all hover:border-success-bg hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="shrink-0 rounded-xl bg-success-bg p-3 text-success-text transition-transform group-hover:scale-110">
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

        <Card className="group border-slate-100 bg-white transition-all hover:border-warning-bg hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="shrink-0 rounded-xl bg-warning-bg p-3 text-warning-text transition-transform group-hover:scale-110">
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
              className="h-11 rounded-xl border-slate-200 bg-white pl-10 focus-visible:border-slate-500 focus-visible:ring-slate-500/20"
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
                            className="cursor-pointer gap-2 rounded-lg py-2 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit3 className="size-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 bg-slate-100" />
                          <DropdownMenuItem
                            onClick={() => openDelete(cat)}
                            className="cursor-pointer gap-2 rounded-lg py-2 font-medium text-error-text hover:bg-error-bg"
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
        <Card className="sticky top-4 h-fit border-slate-100 bg-white shadow-xs transition-shadow hover:shadow-md">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-black text-slate-800">
              <Layers className="size-4 text-slate-500" /> Distribution
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
                  formatter={
                    ((v: number, n: string) => [`${v} books`, n]) as never
                  }
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
        <CategoryModal
          open={formOpen}
          initial={editTarget}
          isLoading={createMutation.isPending || updateMutation.isPending}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
        />
      )}
      <DeleteCategoryModal
        open={deleteOpen}
        category={deleteTarget}
        isLoading={deleteMutation.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
