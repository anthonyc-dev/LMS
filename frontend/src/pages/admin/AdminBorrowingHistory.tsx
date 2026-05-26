import { useState, useMemo, Fragment } from "react";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BookMarked,
  CalendarDays,
  Eye,
  GraduationCap,
  Crown,
  TrendingUp,
  RefreshCw,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Types & Seed Data
// ---------------------------------------------------------------------------

type BorrowStatus = "active" | "returned" | "overdue" | "renewed";
type UserRole = "admin" | "faculty" | "student";

interface BorrowRecord {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string; // gradient class
  isbn: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerRole: UserRole;
  borrowerAvatar: string; // bg color class
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  renewCount: number;
  overdueDays?: number;
  notes?: string;
}

const ROWS_PER_PAGE = 8;

const RECORDS: BorrowRecord[] = [
  {
    id: "BR-001",
    bookTitle: "Clean Code",
    bookAuthor: "Robert C. Martin",
    bookCover: "from-orange-500 to-amber-600",
    isbn: "978-0132350884",
    borrowerName: "Marcus Johnson",
    borrowerEmail: "m.johnson@student.lms.edu",
    borrowerRole: "student",
    borrowerAvatar: "bg-emerald-500",
    borrowDate: "May 10, 2025",
    dueDate: "May 24, 2025",
    status: "overdue",
    renewCount: 1,
    overdueDays: 7,
    notes: "Borrower contacted via email.",
  },
  {
    id: "BR-002",
    bookTitle: "The Pragmatic Programmer",
    bookAuthor: "Andrew Hunt",
    bookCover: "from-blue-600 to-indigo-700",
    isbn: "978-0135957059",
    borrowerName: "Dr. Sarah Chen",
    borrowerEmail: "s.chen@lms.edu",
    borrowerRole: "faculty",
    borrowerAvatar: "bg-blue-500",
    borrowDate: "May 15, 2025",
    dueDate: "Jun 15, 2025",
    status: "active",
    renewCount: 0,
  },
  {
    id: "BR-003",
    bookTitle: "Introduction to Algorithms",
    bookAuthor: "Cormen, Leiserson et al.",
    bookCover: "from-violet-600 to-purple-700",
    isbn: "978-0262046305",
    borrowerName: "James Lee",
    borrowerEmail: "j.lee@student.lms.edu",
    borrowerRole: "student",
    borrowerAvatar: "bg-cyan-500",
    borrowDate: "Apr 20, 2025",
    dueDate: "May 4, 2025",
    returnDate: "May 3, 2025",
    status: "returned",
    renewCount: 0,
  },
  {
    id: "BR-004",
    bookTitle: "Design Patterns",
    bookAuthor: "Gang of Four",
    bookCover: "from-rose-500 to-pink-600",
    isbn: "978-0201633610",
    borrowerName: "Prof. David Vance",
    borrowerEmail: "d.vance@lms.edu",
    borrowerRole: "faculty",
    borrowerAvatar: "bg-indigo-500",
    borrowDate: "May 1, 2025",
    dueDate: "Jun 1, 2025",
    status: "renewed",
    renewCount: 2,
  },
  {
    id: "BR-005",
    bookTitle: "You Don't Know JS",
    bookAuthor: "Kyle Simpson",
    bookCover: "from-yellow-500 to-orange-500",
    isbn: "978-1491904220",
    borrowerName: "Olivia Davis",
    borrowerEmail: "o.davis@student.lms.edu",
    borrowerRole: "student",
    borrowerAvatar: "bg-amber-500",
    borrowDate: "May 18, 2025",
    dueDate: "Jun 1, 2025",
    status: "active",
    renewCount: 0,
  },
  {
    id: "BR-006",
    bookTitle: "Refactoring",
    bookAuthor: "Martin Fowler",
    bookCover: "from-teal-500 to-emerald-600",
    isbn: "978-0134757599",
    borrowerName: "Ryan Thompson",
    borrowerEmail: "r.thompson@student.lms.edu",
    borrowerRole: "student",
    borrowerAvatar: "bg-violet-500",
    borrowDate: "Apr 10, 2025",
    dueDate: "Apr 24, 2025",
    returnDate: "Apr 22, 2025",
    status: "returned",
    renewCount: 1,
  },
  {
    id: "BR-007",
    bookTitle: "The Mythical Man-Month",
    bookAuthor: "Frederick P. Brooks Jr.",
    bookCover: "from-slate-600 to-gray-700",
    isbn: "978-0201835953",
    borrowerName: "Dr. Priya Patel",
    borrowerEmail: "p.patel@lms.edu",
    borrowerRole: "faculty",
    borrowerAvatar: "bg-pink-500",
    borrowDate: "May 5, 2025",
    dueDate: "May 19, 2025",
    status: "overdue",
    renewCount: 0,
    overdueDays: 12,
  },
  {
    id: "BR-008",
    bookTitle: "Eloquent JavaScript",
    bookAuthor: "Marijn Haverbeke",
    bookCover: "from-green-500 to-teal-600",
    isbn: "978-1593279509",
    borrowerName: "Emily Watson",
    borrowerEmail: "e.watson@student.lms.edu",
    borrowerRole: "student",
    borrowerAvatar: "bg-rose-500",
    borrowDate: "May 20, 2025",
    dueDate: "Jun 3, 2025",
    status: "active",
    renewCount: 0,
  },
  {
    id: "BR-009",
    bookTitle: "Structure and Interpretation",
    bookAuthor: "Abelson & Sussman",
    bookCover: "from-blue-500 to-cyan-600",
    isbn: "978-0262510875",
    borrowerName: "Prof. Nathan Clark",
    borrowerEmail: "n.clark@lms.edu",
    borrowerRole: "faculty",
    borrowerAvatar: "bg-emerald-500",
    borrowDate: "Apr 28, 2025",
    dueDate: "May 28, 2025",
    status: "renewed",
    renewCount: 1,
  },
  {
    id: "BR-010",
    bookTitle: "Computer Networks",
    bookAuthor: "Andrew Tanenbaum",
    bookCover: "from-purple-500 to-violet-600",
    isbn: "978-0132126953",
    borrowerName: "Isabella Brown",
    borrowerEmail: "i.brown@student.lms.edu",
    borrowerRole: "student",
    borrowerAvatar: "bg-blue-500",
    borrowDate: "Mar 15, 2025",
    dueDate: "Mar 29, 2025",
    returnDate: "Mar 28, 2025",
    status: "returned",
    renewCount: 0,
  },
  {
    id: "BR-011",
    bookTitle: "Operating System Concepts",
    bookAuthor: "Silberschatz, Galvin",
    bookCover: "from-red-500 to-rose-600",
    isbn: "978-1119800361",
    borrowerName: "Marcus Johnson",
    borrowerEmail: "m.johnson@student.lms.edu",
    borrowerRole: "student",
    borrowerAvatar: "bg-emerald-500",
    borrowDate: "May 12, 2025",
    dueDate: "May 26, 2025",
    status: "active",
    renewCount: 0,
  },
  {
    id: "BR-012",
    bookTitle: "Database System Concepts",
    bookAuthor: "Silberschatz, Korth",
    bookCover: "from-indigo-500 to-blue-600",
    isbn: "978-1260515046",
    borrowerName: "Dr. Sarah Chen",
    borrowerEmail: "s.chen@lms.edu",
    borrowerRole: "faculty",
    borrowerAvatar: "bg-blue-500",
    borrowDate: "Apr 5, 2025",
    dueDate: "May 5, 2025",
    returnDate: "May 5, 2025",
    status: "returned",
    renewCount: 2,
    notes: "Returned on time, excellent condition.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function statusConfig(status: BorrowStatus) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        cls: "bg-blue-100 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
        icon: BookOpen,
      };
    case "returned":
      return {
        label: "Returned",
        cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
      };
    case "overdue":
      return {
        label: "Overdue",
        cls: "bg-rose-100 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
        icon: AlertTriangle,
      };
    case "renewed":
      return {
        label: "Renewed",
        cls: "bg-violet-100 text-violet-700 border-violet-200",
        dot: "bg-violet-500",
        icon: RefreshCw,
      };
  }
}

function roleConfig(role: UserRole) {
  switch (role) {
    case "admin":
      return { label: "Admin", icon: Crown, cls: "text-violet-600" };
    case "faculty":
      return { label: "Faculty", icon: GraduationCap, cls: "text-blue-600" };
    case "student":
      return { label: "Student", icon: GraduationCap, cls: "text-emerald-600" };
  }
}

// ---------------------------------------------------------------------------
// Status Tabs
// ---------------------------------------------------------------------------

const STATUS_TABS: { value: "all" | BorrowStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "overdue", label: "Overdue" },
  { value: "renewed", label: "Renewed" },
  { value: "returned", label: "Returned" },
];

// ---------------------------------------------------------------------------
// Detail Modal
// ---------------------------------------------------------------------------

function RecordDetailModal({
  record,
  open,
  onClose,
}: {
  record: BorrowRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!record) return null;
  const sc = statusConfig(record.status);
  const rc = roleConfig(record.borrowerRole);
  const RoleIcon = rc.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-3xl border-none p-0 shadow-2xl sm:max-w-[520px]">
        {/* Header gradient */}
        <div
          className={`relative overflow-hidden bg-linear-to-br ${record.bookCover} p-6 text-white`}
        >
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute top-4 right-6 opacity-10">
            <BookMarked size={80} className="-rotate-12" />
          </div>
          <DialogHeader className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-widest backdrop-blur-sm">
                {record.id}
              </span>
            </div>
            <DialogTitle className="text-xl leading-tight font-black text-white">
              {record.bookTitle}
            </DialogTitle>
            <p className="text-sm font-medium text-white/70">
              by {record.bookAuthor}
            </p>
            <p className="text-[11px] font-semibold tracking-wider text-white/50 uppercase">
              ISBN: {record.isbn}
            </p>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="space-y-5 bg-white p-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500">Status</span>
            <Badge
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${sc.cls}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
              {record.overdueDays && (
                <span className="ml-1 font-normal">
                  ({record.overdueDays}d overdue)
                </span>
              )}
            </Badge>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Borrower */}
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${record.borrowerAvatar}`}
            >
              {getInitials(record.borrowerName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">
                {record.borrowerName}
              </p>
              <p className="text-xs text-slate-400">{record.borrowerEmail}</p>
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${rc.cls}`}
            >
              <RoleIcon className="size-3.5" />
              {rc.label}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Borrowed On
              </p>
              <p className="text-sm font-bold text-slate-800">
                {record.borrowDate}
              </p>
            </div>
            <div className="space-y-1 rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Due Date
              </p>
              <p
                className={`text-sm font-bold ${record.status === "overdue" ? "text-rose-600" : "text-slate-800"}`}
              >
                {record.dueDate}
              </p>
            </div>
            {record.returnDate && (
              <div className="col-span-2 space-y-1 rounded-xl bg-emerald-50 p-3">
                <p className="text-[10px] font-bold tracking-wider text-emerald-500 uppercase">
                  Returned On
                </p>
                <p className="text-sm font-bold text-emerald-700">
                  {record.returnDate}
                </p>
              </div>
            )}
          </div>

          {/* Renew count */}
          {record.renewCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 p-3">
              <RefreshCw className="size-4 text-violet-500" />
              <span className="text-sm font-semibold text-violet-700">
                Renewed {record.renewCount} time
                {record.renewCount > 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
              <p className="mb-1 text-[10px] font-bold tracking-wider text-amber-500 uppercase">
                Notes
              </p>
              <p className="text-sm text-amber-800">{record.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full rounded-xl font-bold text-slate-600"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sort helper
// ---------------------------------------------------------------------------

type SortKey = "borrowDate" | "dueDate" | "borrowerName" | "bookTitle";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function AdminBorrowingHistory() {
  const isMobile = useIsMobile();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | BorrowStatus>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [sortKey, setSortKey] = useState<SortKey>("borrowDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [detailRecord, setDetailRecord] = useState<BorrowRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Stats
  const totalRecords = RECORDS.length;
  const activeCount = RECORDS.filter((r) => r.status === "active").length;
  const overdueCount = RECORDS.filter((r) => r.status === "overdue").length;
  const returnedCount = RECORDS.filter((r) => r.status === "returned").length;
  const renewedCount = RECORDS.filter((r) => r.status === "renewed").length;

  // Filtered + sorted
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = RECORDS.filter((r) => {
      const matchSearch =
        r.bookTitle.toLowerCase().includes(q) ||
        r.borrowerName.toLowerCase().includes(q) ||
        r.borrowerEmail.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      const matchStatus = statusTab === "all" || r.status === statusTab;
      const matchRole = roleFilter === "all" || r.borrowerRole === roleFilter;
      return matchSearch && matchStatus && matchRole;
    });

    list.sort((a, b) => {
      let va = a[sortKey] ?? "";
      let vb = b[sortKey] ?? "";
      if (sortDir === "asc") return va < vb ? -1 : va > vb ? 1 : 0;
      return va > vb ? -1 : va < vb ? 1 : 0;
    });

    return list;
  }, [search, statusTab, roleFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k)
      return <ArrowUpDown className="ml-1 inline size-3.5 text-slate-300" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline size-3.5 text-indigo-500" />
    ) : (
      <ArrowDown className="ml-1 inline size-3.5 text-indigo-500" />
    );
  }

  const openDetail = (r: BorrowRecord) => {
    setDetailRecord(r);
    setDetailOpen(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* ── Page Header ── */}
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-indigo-400/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-violet-400/5 blur-3xl" />

        <div className="relative z-10 space-y-1">
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <BookMarked className="size-7 text-slate-900" />
            Borrowing History
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Track and manage all library borrowing transactions
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <TrendingUp className="size-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-600">
              {totalRecords} Total Records
            </span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Active Borrows",
            value: activeCount,
            icon: BookOpen,
            from: "from-blue-500",
            to: "to-indigo-600",
            shadow: "shadow-blue-200",
            bg: "bg-blue-50",
            text: "text-blue-700",
          },
          {
            label: "Overdue",
            value: overdueCount,
            icon: AlertTriangle,
            from: "from-rose-500",
            to: "to-pink-600",
            shadow: "shadow-rose-200",
            bg: "bg-rose-50",
            text: "text-rose-700",
          },
          {
            label: "Renewed",
            value: renewedCount,
            icon: RefreshCw,
            from: "from-violet-500",
            to: "to-purple-600",
            shadow: "shadow-violet-200",
            bg: "bg-violet-50",
            text: "text-violet-700",
          },
          {
            label: "Returned",
            value: returnedCount,
            icon: CheckCircle2,
            from: "from-emerald-500",
            to: "to-teal-600",
            shadow: "shadow-emerald-200",
            bg: "bg-emerald-50",
            text: "text-emerald-700",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`absolute -top-8 -right-8 h-24 w-24 rounded-full ${card.bg} opacity-60 blur-2xl transition-all duration-500 group-hover:opacity-100`}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {card.label}
                  </p>
                  <p className="mt-1 text-3xl font-black text-slate-900">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br ${card.from} ${card.to} shadow-lg ${card.shadow}`}
                >
                  <Icon className="size-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Table Card ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Status tabs (Desktop) */}
            {!isMobile && (
              <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                {STATUS_TABS.map((tab) => {
                  const count =
                    tab.value === "all"
                      ? totalRecords
                      : RECORDS.filter((r) => r.status === tab.value).length;
                  const isActive = statusTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => {
                        setStatusTab(tab.value);
                        setPage(1);
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                          isActive
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search + Filters */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search books, users, ID…"
                  className="h-10 w-full rounded-xl border-slate-200 pl-9 text-sm focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20 sm:w-56"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter (Mobile) */}
              {isMobile && (
                <Select
                  value={statusTab}
                  onValueChange={(v) => {
                    setStatusTab(v as "all" | BorrowStatus);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-400/20">
                    <Filter className="mr-1.5 size-3.5 text-slate-400" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {STATUS_TABS.map((tab) => {
                      const count =
                        tab.value === "all"
                          ? totalRecords
                          : RECORDS.filter((r) => r.status === tab.value)
                              .length;
                      return (
                        <SelectItem
                          key={tab.value}
                          value={tab.value}
                          className="text-sm font-semibold"
                        >
                          {tab.label} ({count})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}

              <Select
                value={roleFilter}
                onValueChange={(v) => {
                  setRoleFilter(v as "all" | UserRole);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-400/20 sm:w-36">
                  <Filter className="mr-1.5 size-3.5 text-slate-400" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all" className="text-sm font-semibold">
                    All Roles
                  </SelectItem>
                  <SelectItem value="student" className="text-sm font-semibold">
                    Students
                  </SelectItem>
                  <SelectItem value="faculty" className="text-sm font-semibold">
                    Faculty
                  </SelectItem>
                  <SelectItem value="admin" className="text-sm font-semibold">
                    Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/60 hover:bg-slate-50/60">
                <TableHead className="pl-5 text-[11px] font-black tracking-wider text-slate-400 uppercase">
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("bookTitle")}
                  >
                    Book <SortIcon k="bookTitle" />
                  </button>
                </TableHead>
                {!isMobile && (
                  <>
                    <TableHead className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
                      <button
                        className="flex items-center"
                        onClick={() => toggleSort("borrowerName")}
                      >
                        Borrower <SortIcon k="borrowerName" />
                      </button>
                    </TableHead>
                    <TableHead className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
                      <button
                        className="flex items-center"
                        onClick={() => toggleSort("borrowDate")}
                      >
                        Borrow Date <SortIcon k="borrowDate" />
                      </button>
                    </TableHead>
                    <TableHead className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
                      <button
                        className="flex items-center"
                        onClick={() => toggleSort("dueDate")}
                      >
                        Due Date <SortIcon k="dueDate" />
                      </button>
                    </TableHead>
                    <TableHead className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
                      Status
                    </TableHead>
                  </>
                )}
                <TableHead className="pr-5 text-right text-[11px] font-black tracking-wider text-slate-400 uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <BookOpen className="size-7 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-500">
                          No records found
                        </p>
                        <p className="text-sm text-slate-400">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((record) => {
                  const sc = statusConfig(record.status);
                  const rc = roleConfig(record.borrowerRole);
                  const RoleIcon = rc.icon;
                  const StatusIcon = sc.icon;

                  const isExpanded = isMobile && expandedRow === record.id;

                  return (
                    <Fragment key={record.id}>
                      <TableRow
                        className={`group cursor-pointer border-slate-100 transition-colors hover:bg-slate-50/80`}
                        onClick={() => {
                          if (isMobile) {
                            setExpandedRow(isExpanded ? null : record.id);
                          } else {
                            openDetail(record);
                          }
                        }}
                      >
                        {/* Book */}
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${record.bookCover} shadow-sm`}
                            >
                              <BookMarked className="size-4 text-white/80" />
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[180px] truncate text-sm font-bold text-slate-900">
                                {record.bookTitle}
                              </p>
                              <p className="max-w-[180px] truncate text-xs text-slate-400">
                                {record.bookAuthor}
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

                        {/* Borrower */}
                        {!isMobile && (
                          <>
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white ${record.borrowerAvatar}`}
                                >
                                  {getInitials(record.borrowerName)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-slate-900">
                                    {record.borrowerName}
                                  </p>
                                  <div
                                    className={`flex items-center gap-1 text-[10px] font-semibold ${rc.cls}`}
                                  >
                                    <RoleIcon className="size-3" />
                                    {rc.label}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Borrow Date */}
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <CalendarDays className="size-3.5 text-slate-400" />
                                {record.borrowDate}
                              </div>
                            </TableCell>

                            {/* Due Date */}
                            <TableCell>
                              <div
                                className={`flex items-center gap-1.5 text-sm font-medium ${
                                  record.status === "overdue"
                                    ? "text-rose-600"
                                    : "text-slate-600"
                                }`}
                              >
                                <Clock
                                  className={`size-3.5 ${record.status === "overdue" ? "text-rose-400" : "text-slate-400"}`}
                                />
                                {record.dueDate}
                                {record.status === "overdue" &&
                                  record.overdueDays && (
                                    <span className="ml-1 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-600">
                                      +{record.overdueDays}d
                                    </span>
                                  )}
                              </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Badge
                                className={`flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${sc.cls}`}
                              >
                                <StatusIcon className="size-3" />
                                {sc.label}
                              </Badge>
                              {record.renewCount > 0 && (
                                <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                                  <RefreshCw className="size-2.5" />
                                  {record.renewCount}× renewed
                                </p>
                              )}
                            </TableCell>
                          </>
                        )}

                        {/* Actions */}
                        <TableCell className="pr-5 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(record);
                            }}
                            className={`h-8 w-8 rounded-xl p-0 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          >
                            <Eye className="size-4" />
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
                                  Borrower
                                </span>
                                <div className="flex flex-col items-end">
                                  <span className="font-bold text-slate-800">
                                    {record.borrowerName}
                                  </span>
                                  <div
                                    className={`flex items-center gap-1 text-[10px] font-semibold ${rc.cls}`}
                                  >
                                    <RoleIcon className="size-3" />
                                    {rc.label}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Borrow Date
                                </span>
                                <span className="font-bold text-slate-800">
                                  {record.borrowDate}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Due Date
                                </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-bold ${record.status === "overdue" ? "text-rose-600" : "text-slate-800"}`}
                                  >
                                    {record.dueDate}
                                  </span>
                                  {record.status === "overdue" &&
                                    record.overdueDays && (
                                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-600">
                                        +{record.overdueDays}d
                                      </span>
                                    )}
                                </div>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Status
                                </span>
                                <Badge
                                  className={`flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${sc.cls}`}
                                >
                                  <StatusIcon className="size-3" />
                                  {sc.label}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <p className="text-xs font-medium text-slate-400">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–
              {Math.min(page * ROWS_PER_PAGE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-700">{filtered.length}</span>{" "}
            records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 rounded-xl border-slate-200 p-0 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Button
                key={n}
                variant={n === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(n)}
                className={`h-8 w-8 rounded-xl p-0 text-xs font-bold ${
                  n === page
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200 hover:bg-slate-800"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600"
                }`}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 rounded-xl border-slate-200 p-0 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <RecordDetailModal
        record={detailRecord}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
