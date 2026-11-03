import { TablePageNumbers } from "@/shared/components/DataTable/TablePageNumbers";
import { useState, useMemo, Fragment } from "react";
import {
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  History,
} from "lucide-react";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Can } from "@/features/auth/components/Can";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useAuthStore } from "@/app/store/authStore";
import { useBorrowingsByUser } from "@/features/circulation/api/circulation";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface HistoryRow {
  originalId: string;
  id: string;
  user: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
  book: string;
  category: string;
  borrowDate: string;
  dueDate: string;
  status: string;
}

const ROWS_PER_PAGE = 6;

const STATUS_CFG = {
  "Pending approval": {
    icon: Clock,
    cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  Rejected: { icon: X, cls: "bg-slate-100 text-slate-700 border-slate-200" },
  Returned: {
    icon: CheckCircle2,
    cls: "bg-success-bg text-success-text border-success-bg",
  },
  "On Loan": {
    icon: Clock,
    cls: "bg-blue-100  text-blue-700  border-blue-200",
  },
  Overdue: {
    icon: AlertCircle,
    cls: "bg-error-bg    text-error-text    border-error-bg",
  },
} as const;

const AVATAR_COLORS = [
  "bg-slate-100 text-slate-700",
  "bg-blue-100 text-blue-700",
  "bg-success-bg text-success-text",
  "bg-error-bg text-error-text",
  "bg-warning-bg text-warning-text",
  "bg-blue-100 text-blue-700",
];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export function BorrowingHistoryPage() {
  usePageTitle("Borrowing History");
  const isMobile = useIsMobile();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  const { data: borrowingsData } = useBorrowingsByUser(user?.id);

  const HISTORY_DATA = useMemo(() => {
    if (!borrowingsData) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return borrowingsData.map((b: any) => {
      let statusStr = "Returned";
      if (b.status === "borrowed") statusStr = "On Loan";
      else if (b.status === "pending") statusStr = "Pending approval";
      else if (b.status === "rejected") statusStr = "Rejected";
      else if (b.status === "overdue") statusStr = "Overdue";

      return {
        originalId: b.id,
        id: "TX-" + b.id.substring(0, 4).toUpperCase(),
        user: b.user?.fullName || "Unknown",
        email: b.user?.email || "",
        initials: (b.user?.fullName || "U").substring(0, 2).toUpperCase(),
        avatarUrl: b.user?.avatarUrl || null,
        book: b.bookCopy?.book?.title || "Unknown Book",
        category: b.bookCopy?.book?.category?.name || "Uncategorized",
        borrowDate: format(new Date(b.borrowDate), "MMM dd, yyyy"),
        dueDate:
          b.status === "pending" || b.status === "rejected"
            ? "—"
            : format(new Date(b.dueDate), "MMM dd, yyyy"),
        status: statusStr,
      };
    });
  }, [borrowingsData]);

  const filtered = useMemo(() => {
    return HISTORY_DATA.filter((r: HistoryRow) => {
      const matchSearch =
        r.user.toLowerCase().includes(search.toLowerCase()) ||
        r.book.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "All" || r.status === status;
      return matchSearch && matchStatus;
    });
  }, [search, status, HISTORY_DATA]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  const totalBorrowed = HISTORY_DATA.length;
  const activeLoans = HISTORY_DATA.filter(
    (r: HistoryRow) => r.status === "On Loan",
  ).length;
  const overdueCount = HISTORY_DATA.filter(
    (r: HistoryRow) => r.status === "Overdue",
  ).length;
  const returnedCount = HISTORY_DATA.filter(
    (r: HistoryRow) => r.status === "Returned",
  ).length;

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const onStatus = (v: string) => {
    setStatus(v);
    setPage(1);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <div className="rounded-xl bg-blue-50 p-2">
              <History className="size-7" />
            </div>
            Borrowing History
          </h1>
          <p className="mt-1 ml-1 font-medium text-slate-500">
            Complete record of all book transactions across the library.
          </p>
        </div>
        <Can roles={["admin"]}>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-11 gap-2 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            >
              <Download className="size-4" /> Export PDF
            </Button>
            <Button className="h-11 gap-2 rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700">
              Generate Report
            </Button>
          </div>
        </Can>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Borrowed */}
        <Card className="group transition-all duration-300 hover:border-slate-200 hover:shadow-md">
          <CardContent className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 transition-transform group-hover:scale-110">
                <BookOpen className="size-5" />
              </div>
              <span className="text-success-text flex items-center gap-0.5 text-xs font-bold">
                +12.5% <ArrowUpRight className="size-3" />
              </span>
            </div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Total Borrowed
            </p>
            <h3 className="text-2xl font-black text-slate-900">
              {totalBorrowed.toLocaleString()}
            </h3>
          </CardContent>
        </Card>

        {/* Active Loans */}
        <Card className="group transition-all duration-300 hover:border-blue-200 hover:shadow-md">
          <CardContent className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-transform group-hover:scale-110">
                <Clock className="size-5" />
              </div>
              <span className="text-success-text flex items-center gap-0.5 text-xs font-bold">
                +5.2% <ArrowUpRight className="size-3" />
              </span>
            </div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Active Loans
            </p>
            <h3 className="text-2xl font-black text-slate-900">
              {activeLoans}
            </h3>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className="group hover:border-error-bg transition-all duration-300 hover:shadow-md">
          <CardContent className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <div className="bg-error-bg text-error-text rounded-xl p-2.5 transition-transform group-hover:scale-110">
                <AlertCircle className="size-5" />
              </div>
              <span className="text-error-bg0 flex items-center gap-0.5 text-xs font-bold">
                -2.4% <ArrowDownRight className="size-3" />
              </span>
            </div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Overdue Books
            </p>
            <h3 className="text-error-text text-2xl font-black">
              {overdueCount}
            </h3>
          </CardContent>
        </Card>

        {/* Returned */}
        <Card className="group hover:border-success-bg transition-all duration-300 hover:shadow-md">
          <CardContent className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <div className="bg-success-bg text-success-text rounded-xl p-2.5 transition-transform group-hover:scale-110">
                <CheckCircle2 className="size-5" />
              </div>
              <span className="text-success-text flex items-center gap-0.5 text-xs font-bold">
                +15.8% <ArrowUpRight className="size-3" />
              </span>
            </div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Returned Books
            </p>
            <h3 className="text-2xl font-black text-slate-900">
              {returnedCount}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* ── Table Card ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search student, book or ID…"
              className="h-10 rounded-xl border-slate-200 pl-10 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
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

          {/* Status filter */}
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <Select
              value={status}
              onValueChange={(v) => {
                if (v !== null) onStatus(v);
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 font-medium text-slate-600 sm:w-44">
                <Filter className="mr-1.5 size-3.5 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                {[
                  "All",
                  "Pending approval",
                  "On Loan",
                  "Returned",
                  "Overdue",
                  "Rejected",
                ].map((o) => (
                  <SelectItem key={o} value={o}>
                    {o === "All" ? "All Transactions" : o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="hidden text-xs font-medium whitespace-nowrap text-slate-400 sm:block">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-slate-100 bg-slate-50">
              <TableRow className="hover:bg-transparent">
                {!isMobile && (
                  <TableHead className="w-[240px] py-4 pl-5 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Student
                  </TableHead>
                )}
                <TableHead
                  className={`py-4 text-xs font-bold tracking-wider text-slate-500 uppercase ${isMobile ? "pl-5" : ""}`}
                >
                  Book Details
                </TableHead>
                {!isMobile && (
                  <TableHead className="py-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Timeline
                  </TableHead>
                )}
                <TableHead className="py-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Status
                </TableHead>
                {!isMobile && (
                  <TableHead className="py-4 pr-5 text-right text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Transaction ID
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row: HistoryRow, idx: number) => {
                const badge = STATUS_CFG[row.status as keyof typeof STATUS_CFG];
                const avatarCls = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const isExpanded = isMobile && expandedRow === row.id;

                return (
                  <Fragment key={row.id}>
                    <TableRow
                      className="group cursor-pointer border-slate-50 transition-colors hover:bg-slate-50/60"
                      onClick={() => {
                        if (isMobile) {
                          setExpandedRow(isExpanded ? null : row.id);
                        }
                      }}
                    >
                      {/* Student */}
                      {!isMobile && (
                        <TableCell className="py-4 pl-5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 shrink-0 rounded-xl shadow-sm transition-transform group-hover:scale-105">
                              <AvatarImage
                                src={row.avatarUrl || undefined}
                                alt={row.user}
                                className="rounded-xl"
                              />
                              <AvatarFallback
                                className={`${avatarCls} rounded-xl text-xs font-black`}
                              >
                                {row.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {row.user}
                              </p>
                              <p className="truncate text-[11px] font-medium text-slate-400">
                                {row.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      )}

                      {/* Book */}
                      <TableCell className={isMobile ? "py-4 pl-5" : ""}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col gap-2">
                            {isMobile && (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 shrink-0 rounded-md">
                                  <AvatarImage
                                    src={row.avatarUrl || undefined}
                                    alt={row.user}
                                    className="rounded-md"
                                  />
                                  <AvatarFallback
                                    className={`${avatarCls} rounded-md text-[9px] font-black`}
                                  >
                                    {row.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-bold text-slate-700">
                                  {row.user}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="max-w-[200px] truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                                {row.book}
                              </p>
                              <p className="text-[11px] font-medium text-slate-400">
                                {row.category} • Hardcover
                              </p>
                            </div>
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

                      {/* Timeline */}
                      {!isMobile && (
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <Clock className="size-3 shrink-0 text-slate-300" />
                              <span>Borrowed: {row.borrowDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <Calendar className="size-3 shrink-0 text-slate-300" />
                              <span>Due: {row.dueDate}</span>
                            </div>
                          </div>
                        </TableCell>
                      )}

                      {/* Status */}
                      <TableCell className={isMobile ? "pr-5" : ""}>
                        <Badge
                          className={`flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${badge.cls}`}
                        >
                          <badge.icon className="size-3" />
                          {row.status}
                        </Badge>
                      </TableCell>

                      {/* ID */}
                      {!isMobile && (
                        <TableCell className="pr-5 text-right">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-400">
                            {row.id}
                          </span>
                        </TableCell>
                      )}
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
                                Transaction ID
                              </span>
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-400">
                                {row.id}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="font-medium text-slate-500">
                                Borrowed
                              </span>
                              <span className="font-bold text-slate-800">
                                {row.borrowDate}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="font-medium text-slate-500">
                                Due
                              </span>
                              <span
                                className={`font-bold ${row.status === "Overdue" ? "text-error-text" : "text-slate-800"}`}
                              >
                                {row.dueDate}
                              </span>
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
                    colSpan={5}
                    className="h-48 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <History className="size-8 text-slate-300" />
                      <p className="text-sm font-medium">
                        No transactions match your search.
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
          <p className="order-2 text-xs font-medium text-slate-500 sm:order-1">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–
              {Math.min(page * ROWS_PER_PAGE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-700">{filtered.length}</span>{" "}
            results
          </p>
          <div className="order-1 flex items-center gap-2 sm:order-2">
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
    </div>
  );
}
