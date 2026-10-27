import { TablePageNumbers } from "@/shared/components/DataTable/TablePageNumbers";
import { useState, useMemo, Fragment } from "react";
import {
  Search,
  Filter,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  BarChart3,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  Minus,
  RefreshCcw,
  Download,
  Layers,
  Hash,
  ChevronDown,
} from "lucide-react";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface InventoryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  damagedCopies: number;
  lastUpdated: string;
  coverColor: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Fiction: "#6366f1",
  Science: "#10b981",
  Technology: "#3b82f6",
  Biography: "#f59e0b",
  "Self-Help": "#8b5cf6",
  History: "#ec4899",
  Philosophy: "#14b8a6",
  Mystery: "#f97316",
};

const SAMPLE_BOOKS: InventoryBook[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0743273565",
    category: "Fiction",
    totalCopies: 20,
    availableCopies: 12,
    borrowedCopies: 7,
    damagedCopies: 1,
    lastUpdated: "2025-05-20",
    coverColor: "#6366f1",
  },
  {
    id: "2",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "978-0553380163",
    category: "Science",
    totalCopies: 15,
    availableCopies: 3,
    borrowedCopies: 11,
    damagedCopies: 1,
    lastUpdated: "2025-05-18",
    coverColor: "#10b981",
  },
  {
    id: "3",
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "978-0735211292",
    category: "Self-Help",
    totalCopies: 30,
    availableCopies: 25,
    borrowedCopies: 5,
    damagedCopies: 0,
    lastUpdated: "2025-05-22",
    coverColor: "#8b5cf6",
  },
  {
    id: "4",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Technology",
    totalCopies: 18,
    availableCopies: 2,
    borrowedCopies: 14,
    damagedCopies: 2,
    lastUpdated: "2025-05-19",
    coverColor: "#3b82f6",
  },
  {
    id: "5",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    isbn: "978-0062316097",
    category: "History",
    totalCopies: 22,
    availableCopies: 10,
    borrowedCopies: 12,
    damagedCopies: 0,
    lastUpdated: "2025-05-17",
    coverColor: "#ec4899",
  },
  {
    id: "6",
    title: "Deep Work",
    author: "Cal Newport",
    isbn: "978-1455586691",
    category: "Self-Help",
    totalCopies: 14,
    availableCopies: 0,
    borrowedCopies: 12,
    damagedCopies: 2,
    lastUpdated: "2025-05-16",
    coverColor: "#8b5cf6",
  },
  {
    id: "7",
    title: "The Pragmatic Programmer",
    author: "David Thomas",
    isbn: "978-0135957059",
    category: "Technology",
    totalCopies: 10,
    availableCopies: 8,
    borrowedCopies: 2,
    damagedCopies: 0,
    lastUpdated: "2025-05-21",
    coverColor: "#3b82f6",
  },
  {
    id: "8",
    title: "A Promised Land",
    author: "Barack Obama",
    isbn: "978-1524763169",
    category: "Biography",
    totalCopies: 8,
    availableCopies: 1,
    borrowedCopies: 7,
    damagedCopies: 0,
    lastUpdated: "2025-05-15",
    coverColor: "#f59e0b",
  },
  {
    id: "9",
    title: "Meditations",
    author: "Marcus Aurelius",
    isbn: "978-0140449334",
    category: "Philosophy",
    totalCopies: 12,
    availableCopies: 9,
    borrowedCopies: 3,
    damagedCopies: 0,
    lastUpdated: "2025-05-14",
    coverColor: "#14b8a6",
  },
  {
    id: "10",
    title: "The Da Vinci Code",
    author: "Dan Brown",
    isbn: "978-0307474278",
    category: "Mystery",
    totalCopies: 25,
    availableCopies: 4,
    borrowedCopies: 20,
    damagedCopies: 1,
    lastUpdated: "2025-05-23",
    coverColor: "#f97316",
  },
  {
    id: "11",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    isbn: "978-0374533557",
    category: "Science",
    totalCopies: 16,
    availableCopies: 11,
    borrowedCopies: 5,
    damagedCopies: 0,
    lastUpdated: "2025-05-12",
    coverColor: "#10b981",
  },
  {
    id: "12",
    title: "Zero to One",
    author: "Peter Thiel",
    isbn: "978-0804139021",
    category: "Self-Help",
    totalCopies: 9,
    availableCopies: 7,
    borrowedCopies: 2,
    damagedCopies: 0,
    lastUpdated: "2025-05-11",
    coverColor: "#8b5cf6",
  },
];

const ROWS_PER_PAGE = 8;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStockStatus(book: InventoryBook) {
  const ratio = book.availableCopies / book.totalCopies;
  if (book.availableCopies === 0) return "out";
  if (ratio <= 0.25) return "low";
  if (ratio <= 0.6) return "medium";
  return "good";
}

const statusConfig = {
  good: {
    label: "In Stock",
    cls: "bg-success-bg text-success-text border-success-bg",
  },
  medium: {
    label: "Moderate",
    cls: "bg-warning-bg  text-warning-text  border-warning-bg",
  },
  low: {
    label: "Low Stock",
    cls: "bg-warning-bg text-warning-text border-warning-bg",
  },
  out: {
    label: "Out of Stock",
    cls: "bg-error-bg   text-error-text   border-error-bg",
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MiniBookCover({ color, title }: { color: string; title: string }) {
  return (
    <div
      className="relative flex h-10 w-7 shrink-0 items-end justify-center overflow-hidden rounded-md pb-0.5 shadow-md sm:h-14 sm:w-10 sm:pb-1"
      style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}
      aria-label={title}
    >
      <div className="absolute top-1 right-1 left-1 h-0.5 rounded-full bg-white/20" />
      <div className="absolute top-2.5 right-1 left-1 h-0.5 rounded-full bg-white/10" />
      <BookOpen className="size-2.5 text-white/70 sm:size-3.5" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Adjust Stock Modal
// ---------------------------------------------------------------------------

interface AdjustModalProps {
  book: InventoryBook | null;
  open: boolean;
  onClose: () => void;
  onSave: (
    bookId: string,
    field: "available" | "damaged" | "borrowed",
    delta: number,
  ) => void;
}

function AdjustStockModal({ book, open, onClose, onSave }: AdjustModalProps) {
  const [field, setField] = useState<"available" | "damaged" | "borrowed">(
    "available",
  );
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("");

  const handleSave = () => {
    if (!book || delta === 0) {
      toast.error("Please set a non-zero adjustment value.");
      return;
    }
    onSave(book.id, field, delta);
    setDelta(0);
    setReason("");
    onClose();
  };

  if (!book) return null;

  const currentVal =
    field === "available"
      ? book.availableCopies
      : field === "damaged"
        ? book.damagedCopies
        : book.borrowedCopies;

  const previewVal = Math.max(0, currentVal + delta);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-primary/20 overflow-hidden rounded-xl border p-0 shadow-sm sm:max-w-md">
        {/* Header */}
        <div className="bg-primary relative overflow-hidden p-6 text-white">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
          <DialogHeader className="relative z-10 space-y-1">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-white">
              <Edit3 className="size-5" /> Adjust Stock
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/85 text-sm font-medium">
              {book.title}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 bg-white p-6">
          {/* Field selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Adjust Field
            </label>
            <Select
              value={field}
              onValueChange={(v) => {
                setField(v as typeof field);
                setDelta(0);
              }}
            >
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="available">Available Copies</SelectItem>
                <SelectItem value="borrowed">Borrowed Copies</SelectItem>
                <SelectItem value="damaged">Damaged Copies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delta stepper */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Quantity Change
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDelta((d) => d - 1)}
                className="bg-error-bg text-error-text hover:bg-error-bg flex size-10 items-center justify-center rounded-xl text-lg font-bold transition-colors"
              >
                <Minus className="size-4" />
              </button>
              <div className="flex-1 text-center">
                <span
                  className={`text-3xl font-semibold ${delta > 0 ? "text-success-text" : delta < 0 ? "text-error-text" : "text-slate-400"}`}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              </div>
              <button
                onClick={() => setDelta((d) => d + 1)}
                className="bg-success-bg text-success-text hover:bg-success-bg flex size-10 items-center justify-center rounded-xl text-lg font-bold transition-colors"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold">
            <div className="text-center">
              <p className="mb-1 text-xs tracking-wider text-slate-400 uppercase">
                Current
              </p>
              <p className="text-2xl text-slate-800">{currentVal}</p>
            </div>
            <ArrowUpRight className="size-5 text-slate-300" />
            <div className="text-center">
              <p className="mb-1 text-xs tracking-wider text-slate-400 uppercase">
                After
              </p>
              <p
                className={`text-2xl ${previewVal !== currentVal ? "text-blue-600" : "text-slate-800"}`}
              >
                {previewVal}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Reason{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <Input
              placeholder="e.g. New shipment received, damaged during shelving…"
              className="focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl border-slate-200"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
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
            className="bg-primary hover:bg-primary/90 flex-1 rounded-xl font-bold text-white shadow-md shadow-none"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function InventoryPage() {
  usePageTitle("Inventory");
  const isMobile = useIsMobile();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [books, setBooks] = useState<InventoryBook[]>(SAMPLE_BOOKS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [adjustBook, setAdjustBook] = useState<InventoryBook | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  // -----------------------------------------------------------------------
  // Derived / computed
  // -----------------------------------------------------------------------

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(books.map((b) => b.category)))],
    [books],
  );

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.includes(search);
      const matchCat =
        categoryFilter === "all" || b.category === categoryFilter;
      const matchStatus =
        statusFilter === "all" || getStockStatus(b) === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [books, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginatedBooks = filtered.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  // KPI metrics
  const totalVolumes = books.reduce((s, b) => s + b.totalCopies, 0);
  const totalAvailable = books.reduce((s, b) => s + b.availableCopies, 0);
  const totalBorrowed = books.reduce((s, b) => s + b.borrowedCopies, 0);
  const totalDamaged = books.reduce((s, b) => s + b.damagedCopies, 0);
  const lowStockCount = books.filter(
    (b) => getStockStatus(b) === "low" || getStockStatus(b) === "out",
  ).length;
  const utilizationPct = Math.round((totalBorrowed / totalVolumes) * 100);

  // Category chart data
  const getCategoryChartData = () => {
    const map: Record<
      string,
      { available: number; borrowed: number; damaged: number }
    > = {};
    books.forEach((b) => {
      if (!map[b.category])
        map[b.category] = { available: 0, borrowed: 0, damaged: 0 };
      map[b.category].available += b.availableCopies;
      map[b.category].borrowed += b.borrowedCopies;
      map[b.category].damaged += b.damagedCopies;
    });
    return Object.entries(map).map(([name, v]) => ({
      name: name.length > 8 ? name.slice(0, 7) + "…" : name,
      ...v,
    }));
  };
  const categoryChartData = getCategoryChartData();

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleAdjust = (book: InventoryBook) => {
    setAdjustBook(book);
    setIsAdjustOpen(true);
  };

  const handleSaveAdjust = (
    bookId: string,
    field: "available" | "damaged" | "borrowed",
    delta: number,
  ) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b;
        const updated = { ...b };
        if (field === "available")
          updated.availableCopies = Math.max(0, b.availableCopies + delta);
        if (field === "damaged")
          updated.damagedCopies = Math.max(0, b.damagedCopies + delta);
        if (field === "borrowed")
          updated.borrowedCopies = Math.max(0, b.borrowedCopies + delta);
        return updated;
      }),
    );
    toast.success("Stock updated successfully");
  };

  // Reset page on filter change
  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleCatFilter = (v: string | null) => {
    if (v !== null) {
      setCategoryFilter(v);
      setPage(1);
    }
  };
  const handleStatusFilter = (v: string | null) => {
    if (v !== null) {
      setStatusFilter(v);
      setPage(1);
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* ── Page Header ── */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <div className="rounded-xl bg-blue-50 p-2">
              <Package className="size-7" />
            </div>
            Inventory Management
          </h1>
          <p className="mt-1 ml-1 font-medium text-slate-500">
            Track stock levels, utilization, and book conditions across your
            entire catalog.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 gap-2 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            onClick={() => toast.info("Export functionality coming soon.")}
          >
            <Download className="size-4" /> Export
          </Button>
          <Button
            variant="outline"
            className="h-11 gap-2 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            onClick={() => {
              setBooks(SAMPLE_BOOKS);
              toast.success("Data refreshed");
            }}
          >
            <RefreshCcw className="size-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Volumes */}
        <Card className="group transition-all duration-300 hover:border-blue-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-600 transition-transform group-hover:scale-110">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Total Volumes
              </p>
              <h3 className="text-2xl font-black text-slate-900">
                {totalVolumes.toLocaleString()}
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {books.length} unique titles
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available */}
        <Card className="group hover:border-success-bg transition-all duration-300 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="bg-success-bg text-success-text shrink-0 rounded-xl p-3 transition-transform group-hover:scale-110">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Available
              </p>
              <h3 className="text-2xl font-black text-slate-900">
                {totalAvailable.toLocaleString()}
              </h3>
              <div className="mt-0.5 flex items-center gap-1">
                <ArrowUpRight className="text-success-bg0 size-3" />
                <span className="text-success-text text-[11px] font-bold">
                  {Math.round((totalAvailable / totalVolumes) * 100)}% of stock
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Borrowed */}
        <Card className="group transition-all duration-300 hover:border-blue-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-600 transition-transform group-hover:scale-110">
              <TrendingUp className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Borrowed
              </p>
              <h3 className="text-2xl font-black text-slate-900">
                {totalBorrowed.toLocaleString()}
              </h3>
              <div className="mt-1.5 space-y-0.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Utilization</span>
                  <span>{utilizationPct}%</span>
                </div>
                <Progress
                  value={utilizationPct}
                  className="h-1.5 bg-slate-100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="group hover:border-error-bg transition-all duration-300 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="bg-error-bg text-error-text shrink-0 rounded-xl p-3 transition-transform group-hover:scale-110">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Needs Attention
              </p>
              <h3 className="text-error-text text-2xl font-black">
                {lowStockCount}
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {totalDamaged} damaged copies
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts + Low Stock Alerts Row ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Category Stock Bar Chart (3/5) */}
        <Card className="shadow-xs transition-shadow hover:shadow-md lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-black text-slate-800">
                <BarChart3 className="size-4 text-blue-500" /> Stock by Category
              </CardTitle>
              <p className="text-xs font-medium text-slate-400">
                Available vs Borrowed copies per genre
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={categoryChartData}
                barGap={4}
                barCategoryGap="35%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.97)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                  labelStyle={{
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: 4,
                  }}
                />
                <Bar
                  name="Available"
                  dataKey="available"
                  radius={[4, 4, 0, 0]}
                  fill="#6366f1"
                />
                <Bar
                  name="Borrowed"
                  dataKey="borrowed"
                  radius={[4, 4, 0, 0]}
                  fill="#10b981"
                />
                <Bar
                  name="Damaged"
                  dataKey="damaged"
                  radius={[4, 4, 0, 0]}
                  fill="#f87171"
                />
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-6">
              {[
                ["Available", "#6366f1"],
                ["Borrowed", "#10b981"],
                ["Damaged", "#f87171"],
              ].map(([label, color]) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low-Stock Alerts (2/5) */}
        <Card className="shadow-xs transition-shadow hover:shadow-md lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-black text-slate-800">
                <AlertTriangle className="text-error-bg0 size-4" /> Stock Alerts
              </CardTitle>
              <p className="text-xs font-medium text-slate-400">
                Titles needing restocking
              </p>
            </div>
            <Badge className="bg-error-bg text-error-text border-none font-bold">
              {lowStockCount} items
            </Badge>
          </CardHeader>
          <CardContent className="h-[230px] overflow-y-auto p-0">
            {books
              .filter(
                (b) =>
                  getStockStatus(b) === "low" || getStockStatus(b) === "out",
              )
              .map((b) => {
                const st = getStockStatus(b);
                return (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 border-b border-slate-50 px-4 py-3 transition-colors last:border-0 hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <MiniBookCover color={b.coverColor} title={b.title} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">
                          {b.title}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">
                          {b.author}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 space-y-1 text-right">
                      <Badge
                        className={`border px-2 py-0.5 text-[9px] font-bold ${statusConfig[st].cls}`}
                      >
                        {statusConfig[st].label}
                      </Badge>
                      <p className="text-[10px] font-bold text-slate-500">
                        {b.availableCopies}/{b.totalCopies} left
                      </p>
                    </div>
                  </div>
                );
              })}
            {lowStockCount === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                <CheckCircle2 className="text-success-text size-8" />
                <p className="text-sm font-medium">
                  All titles are well-stocked!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Inventory Table ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Hash className="size-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">
              {filtered.length} {filtered.length === 1 ? "title" : "titles"}{" "}
              found
            </span>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search title, author, ISBN…"
                className="h-10 rounded-xl border-slate-200 pl-10 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Category filter */}
            <Select value={categoryFilter} onValueChange={handleCatFilter}>
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 sm:w-40">
                <Filter className="mr-1.5 size-3.5 text-slate-400" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "all" ? "All Categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="good">In Stock</SelectItem>
                <SelectItem value="medium">Moderate</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-slate-100 bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className={`py-4 pl-5 font-bold text-slate-500 ${isMobile ? "" : "w-[300px]"}`}
                >
                  Book
                </TableHead>
                {!isMobile && (
                  <>
                    <TableHead className="py-4 font-bold text-slate-500">
                      Category
                    </TableHead>
                    <TableHead className="py-4 text-center font-bold text-slate-500">
                      Total
                    </TableHead>
                    <TableHead className="py-4 text-center font-bold text-slate-500">
                      Available
                    </TableHead>
                    <TableHead className="py-4 text-center font-bold text-slate-500">
                      Borrowed
                    </TableHead>
                    <TableHead className="py-4 text-center font-bold text-slate-500">
                      Damaged
                    </TableHead>
                    <TableHead className="py-4 font-bold text-slate-500">
                      Utilization
                    </TableHead>
                    <TableHead className="py-4 font-bold text-slate-500">
                      Status
                    </TableHead>
                  </>
                )}
                <TableHead className="py-4 pr-5 text-right font-bold text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBooks.map((book) => {
                const st = getStockStatus(book);
                const utilPct = Math.round(
                  (book.borrowedCopies / book.totalCopies) * 100,
                );
                const progressCl =
                  st === "out"
                    ? "bg-error-bg0"
                    : st === "low"
                      ? "bg-warning-bg0"
                      : st === "medium"
                        ? "bg-warning-bg0"
                        : "bg-success-bg0";

                const isExpanded = isMobile && expandedRow === book.id;

                return (
                  <Fragment key={book.id}>
                    <TableRow
                      className="group cursor-pointer transition-colors hover:bg-slate-50/60"
                      onClick={() => {
                        if (isMobile) {
                          setExpandedRow(isExpanded ? null : book.id);
                        }
                      }}
                    >
                      {/* Book info */}
                      <TableCell className="py-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <MiniBookCover
                            color={book.coverColor}
                            title={book.title}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="max-w-[220px] text-sm font-bold wrap-break-word whitespace-normal text-slate-900 sm:max-w-[180px] sm:truncate">
                              {book.title}
                            </p>
                            <p className="max-w-[220px] truncate text-xs font-medium text-slate-500 sm:max-w-[180px]">
                              {book.author}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                              {book.isbn}
                            </p>
                          </div>
                          {isMobile && (
                            <div className="ml-auto flex items-center justify-end">
                              <ChevronDown
                                className={`size-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Category */}
                      {!isMobile && (
                        <>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="border-none text-xs font-bold"
                              style={{
                                backgroundColor: `${CATEGORY_COLORS[book.category] || "#64748b"}18`,
                                color:
                                  CATEGORY_COLORS[book.category] || "#64748b",
                              }}
                            >
                              {book.category}
                            </Badge>
                          </TableCell>

                          {/* Counts */}
                          <TableCell className="text-center">
                            <span className="font-black text-slate-700">
                              {book.totalCopies}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-success-text font-black">
                              {book.availableCopies}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-black text-blue-700">
                              {book.borrowedCopies}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`font-black ${book.damagedCopies > 0 ? "text-error-text" : "text-slate-400"}`}
                            >
                              {book.damagedCopies}
                            </span>
                          </TableCell>

                          {/* Utilization bar */}
                          <TableCell className="min-w-[120px]">
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>{utilPct}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${progressCl}`}
                                  style={{ width: `${utilPct}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>

                          {/* Status badge */}
                          <TableCell>
                            <Badge
                              className={`rounded-full border px-2.5 py-1 text-xs font-bold shadow-sm ${statusConfig[st].cls}`}
                            >
                              {statusConfig[st].label}
                            </Badge>
                          </TableCell>
                        </>
                      )}

                      {/* Actions */}
                      <TableCell className="pr-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdjust(book);
                          }}
                          className={`h-8 gap-1.5 rounded-lg text-xs font-bold text-slate-500 transition-opacity hover:bg-blue-50 hover:text-blue-600 ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        >
                          <Edit3 className="size-3.5" /> Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                        <TableCell
                          colSpan={2}
                          className="border-b border-slate-100 p-0"
                        >
                          <div className="flex flex-col gap-3 px-5 py-4 text-sm">
                            <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="font-medium text-slate-500">
                                Category
                              </span>
                              <Badge
                                variant="secondary"
                                className="border-none text-xs font-bold"
                                style={{
                                  backgroundColor: `${CATEGORY_COLORS[book.category] || "#64748b"}18`,
                                  color:
                                    CATEGORY_COLORS[book.category] || "#64748b",
                                }}
                              >
                                {book.category}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="font-medium text-slate-500">
                                Total
                              </span>
                              <span className="font-black text-slate-700">
                                {book.totalCopies}
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="font-medium text-slate-500">
                                Available
                              </span>
                              <span className="text-success-text font-black">
                                {book.availableCopies}
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="font-medium text-slate-500">
                                Borrowed
                              </span>
                              <span className="font-black text-blue-700">
                                {book.borrowedCopies}
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="font-medium text-slate-500">
                                Damaged
                              </span>
                              <span
                                className={`font-black ${book.damagedCopies > 0 ? "text-error-text" : "text-slate-400"}`}
                              >
                                {book.damagedCopies}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <div className="flex justify-between">
                                <span className="font-medium text-slate-500">
                                  Utilization
                                </span>
                                <span className="text-xs font-bold text-slate-400">
                                  {utilPct}%
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className={`h-full rounded-full ${progressCl}`}
                                  style={{ width: `${utilPct}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="font-medium text-slate-500">
                                Status
                              </span>
                              <Badge
                                className={`rounded-full border px-2.5 py-1 text-xs font-bold shadow-sm ${statusConfig[st].cls}`}
                              >
                                {statusConfig[st].label}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}

              {paginatedBooks.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isMobile ? 2 : 9}
                    className="h-48 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="size-8 text-slate-300" />
                      <p className="text-sm font-medium">
                        No books match your filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row">
          <p className="text-xs font-medium text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–
              {Math.min(page * ROWS_PER_PAGE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-700">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <TablePageNumbers
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Adjust Stock Modal ── */}
      <AdjustStockModal
        book={adjustBook}
        open={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        onSave={handleSaveAdjust}
      />
    </div>
  );
}
