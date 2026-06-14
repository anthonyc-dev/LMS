import { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BookMarked,
  TrendingUp,
  Loader2,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

import {
  useBorrowings,
  type Borrowing,
  type BorrowingStatus,
} from "@/features/circulation/api/circulation";

const ROWS_PER_PAGE = 8;

type SortKey = "borrowDate" | "dueDate" | "borrowerName" | "bookTitle";
type SortDir = "asc" | "desc";

function statusConfig(status: BorrowingStatus) {
  switch (status) {
    case "borrowed":
    case "pending":
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
    default:
      return {
        label: status,
        cls: "bg-gray-100 text-gray-700 border-gray-200",
        dot: "bg-gray-500",
        icon: BookOpen,
      };
  }
}

export function BorrowingRecordsPage() {
  usePageTitle("Borrowing Records");

  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | BorrowingStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("borrowDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const { data: borrowings, isLoading, error } = useBorrowings();

  const filtered = useMemo(() => {
    if (!borrowings) return [];
    const q = search.toLowerCase();

    let list = borrowings.filter((r: Borrowing) => {
      const matchSearch =
        (r.bookCopy?.book.title || "").toLowerCase().includes(q) ||
        (r.user?.fullName || "").toLowerCase().includes(q) ||
        (r.bookCopy?.barcode || "").toLowerCase().includes(q) ||
        (r.id || "").toLowerCase().includes(q);
      const matchStatus = statusTab === "all" || r.status === statusTab;
      return matchSearch && matchStatus;
    });

    list.sort((a: Borrowing, b: Borrowing) => {
      let va = "";
      let vb = "";
      if (sortKey === "borrowDate") {
        va = a.borrowDate;
        vb = b.borrowDate;
      } else if (sortKey === "dueDate") {
        va = a.dueDate;
        vb = b.dueDate;
      } else if (sortKey === "borrowerName") {
        va = a.user?.fullName || "";
        vb = b.user?.fullName || "";
      } else if (sortKey === "bookTitle") {
        va = a.bookCopy?.book.title || "";
        vb = b.bookCopy?.book.title || "";
      }

      if (sortDir === "asc") return va < vb ? -1 : va > vb ? 1 : 0;
      return va > vb ? -1 : va < vb ? 1 : 0;
    });

    return list;
  }, [borrowings, search, statusTab, sortKey, sortDir]);

  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));
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

  const renderSortIcon = (k: SortKey) => {
    if (sortKey !== k)
      return <ArrowUpDown className="ml-1 inline size-3.5 text-slate-300" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline size-3.5 text-indigo-500" />
    ) : (
      <ArrowDown className="ml-1 inline size-3.5 text-indigo-500" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center font-bold text-rose-500">
        Failed to load borrowing records.
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* Page Header */}
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-indigo-400/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-violet-400/5 blur-3xl" />

        <div className="relative z-10 space-y-1">
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <BookMarked className="size-7 text-slate-900" />
            Borrowing Records
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Track and manage all library borrowing transactions
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <TrendingUp className="size-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-600">
              {borrowings?.length || 0} Total Records
            </span>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Status tabs */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
              {[
                { value: "all", label: "All" },
                { value: "borrowed", label: "Active" },
                { value: "overdue", label: "Overdue" },
                { value: "returned", label: "Returned" },
              ].map((tab) => {
                const isActive = statusTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setStatusTab(tab.value as any);
                      setPage(1);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search records..."
                className="h-10 w-full rounded-xl border-slate-200 pl-9 text-sm focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
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
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[100px] font-bold text-slate-500">
                  ID
                </TableHead>
                <TableHead
                  className="cursor-pointer font-bold text-slate-500"
                  onClick={() => toggleSort("borrowerName")}
                >
                  Borrower {renderSortIcon("borrowerName")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-bold text-slate-500"
                  onClick={() => toggleSort("bookTitle")}
                >
                  Book Copy {renderSortIcon("bookTitle")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-bold text-slate-500"
                  onClick={() => toggleSort("borrowDate")}
                >
                  Borrow Date {renderSortIcon("borrowDate")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-bold text-slate-500"
                  onClick={() => toggleSort("dueDate")}
                >
                  Due Date {renderSortIcon("dueDate")}
                </TableHead>
                <TableHead className="font-bold text-slate-500">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((record: Borrowing) => {
                  const sc = statusConfig(record.status);
                  return (
                    <TableRow
                      key={record.id}
                      className="border-slate-100 transition-colors hover:bg-slate-50/50"
                    >
                      <TableCell className="font-medium text-slate-500">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                          {record.id.slice(0, 8)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-slate-900">
                          {record.user?.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {record.user?.schoolId}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-slate-900">
                          {record.bookCopy?.book.title}
                        </p>
                        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                          BC: {record.bookCopy?.barcode}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-slate-700">
                          {new Date(record.borrowDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${record.status === "overdue" ? "text-rose-600" : "text-slate-700"}`}
                        >
                          {new Date(record.dueDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${sc.cls}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${sc.dot}`}
                          />
                          {sc.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search className="mb-2 size-8 text-slate-300" />
                      <p className="font-medium">No records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {(page - 1) * ROWS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-900">
                {Math.min(page * ROWS_PER_PAGE, totalRecords)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900">{totalRecords}</span>{" "}
              entries
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 rounded-lg border-slate-200 font-bold text-slate-600"
              >
                <ChevronLeft className="mr-1 size-3" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 rounded-lg border-slate-200 font-bold text-slate-600"
              >
                Next <ChevronRight className="ml-1 size-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
