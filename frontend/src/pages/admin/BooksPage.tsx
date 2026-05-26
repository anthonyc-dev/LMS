import { useState, useMemo, Fragment } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  BookOpen,
  Star,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Hash,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Asset imports
import book1Img from "@/assets/dashboard/book1.png";
import book2Img from "@/assets/dashboard/book2.png";
import bookDark1Img from "@/assets/dashboard/book_dark1.png";

// ---------------------------------------------------------------------------
// Types & seed data
// ---------------------------------------------------------------------------

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  stock: number;
  status: string;
  coverImage?: string;
  rating?: number;
}

const CATEGORIES = [
  "Fiction",
  "Science",
  "Biography",
  "Self-Help",
  "Productivity",
  "Mystery",
  "Technology",
];
const ROWS_PER_PAGE = 8;

const INITIAL_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    isbn: "978-0743273565",
    stock: 12,
    status: "Available",
    coverImage: book1Img,
    rating: 4.8,
  },
  {
    id: "2",
    title: "Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    isbn: "978-0553380163",
    stock: 5,
    status: "Low Stock",
    coverImage: bookDark1Img,
    rating: 4.9,
  },
  {
    id: "3",
    title: "A Promised Land",
    author: "Barack Obama",
    category: "Biography",
    isbn: "978-1524763169",
    stock: 0,
    status: "Out of Stock",
    coverImage: book2Img,
    rating: 4.7,
  },
  {
    id: "4",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Help",
    isbn: "978-0735211292",
    stock: 45,
    status: "Available",
    coverImage: book1Img,
    rating: 5.0,
  },
  {
    id: "5",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Productivity",
    isbn: "978-1455586691",
    stock: 8,
    status: "Available",
    coverImage: bookDark1Img,
    rating: 4.6,
  },
  {
    id: "6",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "Biography",
    isbn: "978-0062316097",
    stock: 3,
    status: "Low Stock",
    coverImage: book2Img,
    rating: 4.8,
  },
  {
    id: "7",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Technology",
    isbn: "978-0132350884",
    stock: 7,
    status: "Available",
    coverImage: bookDark1Img,
    rating: 4.5,
  },
  {
    id: "8",
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    isbn: "978-0062315007",
    stock: 0,
    status: "Out of Stock",
    coverImage: book1Img,
    rating: 4.7,
  },
  {
    id: "9",
    title: "Zero to One",
    author: "Peter Thiel",
    category: "Self-Help",
    isbn: "978-0804139021",
    stock: 22,
    status: "Available",
    coverImage: book2Img,
    rating: 4.4,
  },
  {
    id: "10",
    title: "Meditations",
    author: "Marcus Aurelius",
    category: "Fiction",
    isbn: "978-0140449334",
    stock: 2,
    status: "Low Stock",
    coverImage: bookDark1Img,
    rating: 4.9,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusToBadge(status: string) {
  switch (status) {
    case "Available":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Low Stock":
      return "bg-amber-100  text-amber-800  border-amber-200";
    case "Out of Stock":
      return "bg-rose-100   text-rose-800   border-rose-200";
    default:
      return "bg-slate-100  text-slate-800  border-slate-200";
  }
}

function stockToStatus(n: number) {
  if (n === 0) return "Out of Stock";
  if (n < 10) return "Low Stock";
  return "Available";
}

// ---------------------------------------------------------------------------
// Edit Modal
// ---------------------------------------------------------------------------

interface EditModalProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Book>) => void;
}

function EditBookModal({ book, open, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState({
    title: book?.title ?? "",
    author: book?.author ?? "",
    category: book?.category ?? "",
    isbn: book?.isbn ?? "",
    stock: String(book?.stock ?? 0),
    description: "",
  });

  if (!book) return null;

  const handleSave = () => {
    if (!form.title || !form.author || !form.category) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const stockNum = parseInt(form.stock);
    onSave({
      ...form,
      stock: stockNum,
      status: stockToStatus(stockNum),
    });
  };

  const f = (key: keyof typeof form) => (val: string | null) =>
    setForm((p) => ({ ...p, [key]: (val ?? "") as never }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-4xl border-none p-0 shadow-2xl sm:max-w-[560px]">
        {/* Header */}
        <div className="relative overflow-hidden bg-slate-900 p-6 text-white">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute top-4 right-10 opacity-10">
            <BookOpen size={80} className="-rotate-12" />
          </div>
          <DialogHeader className="relative z-10 space-y-1">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-white">
              <Edit className="size-5" /> Edit Book Details
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-indigo-200">
              Update the information for "{book.title}".
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 bg-white p-6">
          {/* Cover + Title/Author */}
          <div className="flex items-start gap-5">
            <div className="aspect-3/4 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200/50 shadow-md">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <BookOpen className="size-5 text-slate-300" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-slate-700">
                  Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => f("title")(e.target.value)}
                  className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-slate-700">
                  Author <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={form.author}
                  onChange={(e) => f("author")(e.target.value)}
                  className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Category <span className="text-rose-500">*</span>
              </Label>
              <Select value={form.category} onValueChange={f("category")}>
                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-indigo-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">ISBN</Label>
              <Input
                value={form.isbn}
                onChange={(e) => f("isbn")(e.target.value)}
                placeholder="978-…"
                className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">Stock</Label>
              <Input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => f("stock")(e.target.value)}
                className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-slate-700">
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => f("description")(e.target.value)}
              placeholder="Brief summary…"
              className="h-20 resize-none rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3 border-t border-slate-100 bg-slate-50 p-5">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl font-bold text-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete Modal
// ---------------------------------------------------------------------------

function DeleteBookModal({
  book,
  open,
  onClose,
  onConfirm,
}: {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!book) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-4xl border-none p-0 shadow-2xl sm:max-w-sm">
        <div className="space-y-5 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">Delete Book?</h3>
            <p className="text-sm font-medium text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-800">"{book.title}"</span>?
              This action cannot be undone.
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

export function BooksPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Derived
  const filtered = useMemo(
    () =>
      books.filter((b) => {
        const q = search.toLowerCase();
        const matchSearch =
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.includes(q);
        const matchCat = catFilter === "all" || b.category === catFilter;
        const matchStatus = statusFilter === "all" || b.status === statusFilter;
        return matchSearch && matchCat && matchStatus;
      }),
    [books, search, catFilter, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  const totalStock = books.reduce((s, b) => s + b.stock, 0);
  const availableCount = books.filter((b) => b.status === "Available").length;
  const lowStockCount = books.filter((b) => b.status === "Low Stock").length;
  const outCount = books.filter((b) => b.status === "Out of Stock").length;
  const avgRating = (
    books.reduce((s, b) => s + (b.rating ?? 0), 0) / books.length
  ).toFixed(1);

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const onCat = (v: string | null) => {
    if (v !== null) {
      setCatFilter(v);
      setPage(1);
    }
  };
  const onStatus = (v: string | null) => {
    if (v !== null) {
      setStatusFilter(v);
      setPage(1);
    }
  };

  const handleEdit = (book: Book) => {
    setEditBook(book);
    setEditOpen(true);
  };
  const handleSaveEdit = (updated: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === editBook?.id ? { ...b, ...updated } : b)),
    );
    toast.success("Book updated successfully");
    setEditOpen(false);
  };
  const handleDeleteConfirm = () => {
    setBooks((prev) => prev.filter((b) => b.id !== deleteBook?.id));
    toast.success("Book deleted");
    setDeleteOpen(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <div className="rounded-xl bg-indigo-50 p-2">
              <BookOpen className="size-7" />
            </div>
            Book Management
          </h1>
          <p className="mt-1 ml-1 font-medium text-slate-500">
            Add, edit, and manage your library's complete catalog.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/books/add")}
          id="add-book-btn"
          className="h-11 gap-2 rounded-xl bg-slate-900 px-6 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
        >
          <Plus className="size-4" /> Add New Book
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
          <div className="shrink-0 rounded-xl bg-indigo-50 p-3 text-indigo-600 transition-transform group-hover:scale-110">
            <BookOpen className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Total Titles
            </p>
            <h3 className="text-2xl font-black text-slate-900">
              {books.length}
            </h3>
          </div>
        </div>

        <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
          <div className="shrink-0 rounded-xl bg-slate-100 p-3 text-slate-600 transition-transform group-hover:scale-110">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Total Stock
            </p>
            <h3 className="text-2xl font-black text-slate-900">{totalStock}</h3>
          </div>
        </div>

        <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
          <div className="shrink-0 rounded-xl bg-emerald-50 p-3 text-emerald-600 transition-transform group-hover:scale-110">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Available
            </p>
            <h3 className="text-2xl font-black text-emerald-700">
              {availableCount}
            </h3>
          </div>
        </div>

        <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-rose-200 hover:shadow-md">
          <div className="shrink-0 rounded-xl bg-rose-50 p-3 text-rose-600 transition-transform group-hover:scale-110">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Out of Stock
            </p>
            <h3 className="text-2xl font-black text-rose-600">{outCount}</h3>
            {lowStockCount > 0 && (
              <p className="text-[11px] font-bold text-amber-600">
                {lowStockCount} low stock
              </p>
            )}
          </div>
        </div>

        {/* Avg Rating card */}
        <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
          <div className="shrink-0 rounded-xl bg-amber-50 p-3 text-amber-600 transition-transform group-hover:scale-110">
            <Star className="size-5 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Avg Rating
            </p>
            <h3 className="text-2xl font-black text-slate-900">{avgRating}</h3>
            <p className="text-[11px] text-slate-400">
              across {books.length} books
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Table Card ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Hash className="size-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">
              {filtered.length} book{filtered.length !== 1 ? "s" : ""} found
            </span>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search title, author, ISBN…"
                className="h-10 rounded-xl border-slate-200 pl-10 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => onSearch("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Category */}
            <Select value={catFilter} onValueChange={onCat}>
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 sm:w-40">
                <Filter className="mr-1.5 size-3.5 text-slate-400" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={statusFilter} onValueChange={onStatus}>
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-slate-100 bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] py-4 pl-5 font-bold text-slate-500">
                  Book
                </TableHead>
                {!isMobile && (
                  <>
                    <TableHead className="py-4 font-bold text-slate-500">
                      Category
                    </TableHead>
                    <TableHead className="py-4 text-center font-bold text-slate-500">
                      Stock
                    </TableHead>
                    <TableHead className="min-w-[130px] py-4 font-bold text-slate-500">
                      Stock Level
                    </TableHead>
                    <TableHead className="py-4 font-bold text-slate-500">
                      Status
                    </TableHead>
                    <TableHead className="py-4 font-bold text-slate-500">
                      Rating
                    </TableHead>
                  </>
                )}
                <TableHead className="py-4 pr-5 text-right font-bold text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((book) => {
                const maxStock = 50;
                const pct = Math.min(
                  100,
                  Math.round((book.stock / maxStock) * 100),
                );
                const barCls =
                  book.status === "Out of Stock"
                    ? "bg-rose-500"
                    : book.status === "Low Stock"
                      ? "bg-amber-500"
                      : "bg-emerald-500";
                
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
                    {/* Book cover + info */}
                    <TableCell className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200/50 bg-slate-100 shadow-sm transition-shadow group-hover:shadow-md">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <BookOpen size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                            {book.title}
                          </p>
                          <p className="truncate text-xs font-medium text-slate-500">
                            {book.author}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                            {book.isbn}
                          </p>
                        </div>
                        {isMobile && (
                          <div className="ml-auto flex items-center justify-end">
                            <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
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
                        className="border-none bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
                      >
                        {book.category}
                      </Badge>
                    </TableCell>

                    {/* Stock count */}
                    <TableCell className="text-center">
                      <span className="font-black text-slate-700">
                        {book.stock}
                      </span>
                      <span className="ml-1 text-xs text-slate-400">units</span>
                    </TableCell>

                    {/* Stock bar */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barCls}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Status badge */}
                    <TableCell>
                      <Badge
                        className={`rounded-full border px-2.5 py-1 text-xs font-bold shadow-sm ${statusToBadge(book.status)}`}
                      >
                        {book.status}
                      </Badge>
                    </TableCell>

                    {/* Rating */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-slate-700">
                          {book.rating?.toFixed(1) ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                      </>
                    )}

                    {/* Actions */}
                    <TableCell className="pr-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 rounded-lg text-slate-500 transition-opacity group-hover:opacity-100 hover:bg-slate-100 ${isMobile ? "opacity-100" : "opacity-0"}`}
                              onClick={(e) => {
                                if (isMobile) e.stopPropagation();
                              }}
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
                            onClick={() => handleEdit(book)}
                            className="cursor-pointer gap-2 rounded-lg py-2 font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Edit className="size-3.5" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 bg-slate-100" />
                          <DropdownMenuItem
                            onClick={() => {
                              setDeleteBook(book);
                              setDeleteOpen(true);
                            }}
                            className="cursor-pointer gap-2 rounded-lg py-2 font-medium text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="size-3.5" /> Delete Book
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableCell colSpan={2} className="p-0 border-b border-slate-100">
                        <div className="flex flex-col gap-3 px-5 py-4 text-sm">
                          <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <span className="font-medium text-slate-500">Category</span>
                            <Badge variant="secondary" className="border-none bg-slate-100 text-xs font-bold text-slate-600">
                              {book.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0 items-center">
                            <span className="font-medium text-slate-500">Stock</span>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-700">{book.stock}</span>
                              <span className="text-xs text-slate-400">units</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <div className="flex justify-between">
                              <span className="font-medium text-slate-500">Stock Level</span>
                              <span className="text-xs font-medium text-slate-500">{pct}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              <div className={`h-full rounded-full ${barCls}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <span className="font-medium text-slate-500">Status</span>
                            <Badge className={`rounded-full border px-2.5 py-1 text-xs font-bold shadow-sm ${statusToBadge(book.status)}`}>
                              {book.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <span className="font-medium text-slate-500">Rating</span>
                            <div className="flex items-center gap-1.5">
                              <Star className="size-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-bold text-slate-700">{book.rating?.toFixed(1) ?? "—"}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  </Fragment>
                );
              })}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-48 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="size-8 text-slate-300" />
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                size="icon"
                className={`h-8 w-8 rounded-lg text-xs font-bold ${p === page ? "bg-slate-900 text-white shadow-sm shadow-indigo-200 hover:bg-slate-800" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
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

      {/* ── Modals ── */}
      {editOpen && (
        <EditBookModal
          book={editBook}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
      <DeleteBookModal
        book={deleteBook}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
