import { useState, useMemo, useRef, useEffect } from "react";
import { useVisits, useScanVisit, type Visit } from "../api/visits";
import { ScanStationPage } from "./ScanStationPage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import {
  isToday,
  isThisWeek,
  isThisMonth,
  isWithinInterval,
  startOfDay,
  endOfDay,
  parseISO,
} from "date-fns";
import {
  Search,
  CalendarIcon,
  ClockIcon,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Loader2,
  Scan,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { toast } from "sonner";

const ROWS_PER_PAGE = 8;
type SortKey = "userName" | "schoolId" | "timeIn" | "timeOut" | "status";
type SortDir = "asc" | "desc";

export function VisitsLogbookPage() {
  const { data: visits = [], isLoading, error } = useVisits();
  const scanMutation = useScanVisit();
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | "INSIDE" | "EXITED">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "this-week" | "this-month" | "custom"
  >("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });
  const [sortKey, setSortKey] = useState<SortKey>("timeIn");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [isKioskOpen, setIsKioskOpen] = useState(false);

  const [scanValue, setScanValue] = useState("");
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Focus scan input on load
  useEffect(() => {
    scanInputRef.current?.focus();
  }, []);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanValue.trim() || scanMutation.isPending) return;

    const barcode = scanValue.trim();
    setScanValue(""); // clear immediately for next scan

    scanMutation.mutate(barcode, {
      onSuccess: (data) => {
        if (data.action === "ENTER") {
          toast.success(`Welcome, ${data.user.fullName}!`, {
            description: "Checked in successfully.",
          });
        } else {
          toast.info(`Goodbye, ${data.user.fullName}!`, {
            description: "Checked out successfully.",
          });
        }
        // Refocus after scan
        scanInputRef.current?.focus();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        toast.error("Scan Failed", {
          description: err.response?.data?.message || "User not found.",
        });
        scanInputRef.current?.focus();
      },
    });
  };

  const filtered = useMemo(() => {
    if (!visits) return [];
    const q = search.toLowerCase();

    const list = visits.filter((v: Visit) => {
      const matchSearch =
        v.user.fullName.toLowerCase().includes(q) ||
        v.user.schoolId.toLowerCase().includes(q);
      const matchStatus = statusTab === "all" || v.status === statusTab;

      let matchDate = true;
      if (dateFilter !== "all") {
        const d = new Date(v.timeIn);
        if (dateFilter === "today") {
          matchDate = isToday(d);
        } else if (dateFilter === "this-week") {
          matchDate = isThisWeek(d);
        } else if (dateFilter === "this-month") {
          matchDate = isThisMonth(d);
        } else if (dateFilter === "custom") {
          if (customDateRange.from && customDateRange.to) {
            try {
              const start = startOfDay(parseISO(customDateRange.from));
              const end = endOfDay(parseISO(customDateRange.to));
              matchDate = isWithinInterval(d, { start, end });
            // eslint-disable-next-line unused-imports/no-unused-vars
            } catch (e) {
              matchDate = true;
            }
          }
        }
      }

      return matchSearch && matchStatus && matchDate;
    });

    list.sort((a: Visit, b: Visit) => {
      let va = "";
      let vb = "";
      if (sortKey === "userName") {
        va = a.user.fullName.toLowerCase();
        vb = b.user.fullName.toLowerCase();
      } else if (sortKey === "schoolId") {
        va = a.user.schoolId.toLowerCase();
        vb = b.user.schoolId.toLowerCase();
      } else if (sortKey === "timeIn") {
        va = a.timeIn;
        vb = b.timeIn;
      } else if (sortKey === "timeOut") {
        va = a.timeOut || "";
        vb = b.timeOut || "";
      } else if (sortKey === "status") {
        va = a.status;
        vb = b.status;
      }

      if (sortDir === "asc") return va < vb ? -1 : va > vb ? 1 : 0;
      return va > vb ? -1 : va < vb ? 1 : 0;
    });

    return list;
  }, [
    visits,
    search,
    statusTab,
    sortKey,
    sortDir,
    dateFilter,
    customDateRange,
  ]);

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
      <ArrowUp className="inlinz-1003.5 ml-1 text-blue-500" />
    ) : (
      <ArrowDown className="ml-1 inline size-3.5 text-blue-500" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center font-bold text-red-500">
        Failed to load visits logbook.
      </div>
    );
  }

  if (isKioskOpen) {
    return (
      <div className="fixed inset-0 z-100 bg-black">
        <ScanStationPage onClose={() => setIsKioskOpen(false)} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* Page Header */}
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-blue-400/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-400/5 blur-3xl" />

        <div className="relative z-10 space-y-1">
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <BookOpen className="size-7 text-slate-900" />
            Visits Logbook
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Track and manage all library visitor entries and exits
          </p>
        </div>

        <div className="relative z-10 flex w-full flex-col items-start gap-4 lg:w-auto lg:flex-row lg:items-center">
          {/* Quick Scan Input */}
          <form onSubmit={handleScanSubmit} className="relative w-full lg:w-72">
            <div className="flex overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <div className="flex items-center justify-center bg-blue-50 px-3">
                {scanMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin text-blue-600" />
                ) : (
                  <Scan className="size-4 text-blue-600" />
                )}
              </div>
              <Input
                ref={scanInputRef}
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)}
                placeholder="Quick Scan ID..."
                className="border-0 bg-transparent font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                autoComplete="off"
              />
            </div>
          </form>

          <Button
            onClick={() => setIsKioskOpen(true)}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 lg:w-auto"
          >
            <Scan className="size-4" /> Open Kiosk
          </Button>

          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <TrendingUp className="size-4 text-blue-500" />
            <span className="text-xs font-bold text-slate-600">
              {visits?.length || 0} Total Records
            </span>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Status tabs */}
              <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
                {[
                  { value: "all", label: "All Status" },
                  { value: "INSIDE", label: "Inside Library" },
                  { value: "EXITED", label: "Exited" },
                ].map((tab) => {
                  const isActive = statusTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setStatusTab(tab.value as any);
                        setPage(1);
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Filters & Search */}
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <NativeSelect
                  value={dateFilter}
                  onChange={(e) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setDateFilter(e.target.value as any);
                    setPage(1);
                  }}
                  className="w-full bg-slate-50 sm:w-[150px]"
                >
                  <NativeSelectOption value="all">All Time</NativeSelectOption>
                  <NativeSelectOption value="today">Today</NativeSelectOption>
                  <NativeSelectOption value="this-week">
                    This Week
                  </NativeSelectOption>
                  <NativeSelectOption value="this-month">
                    This Month
                  </NativeSelectOption>
                  <NativeSelectOption value="custom">
                    Custom Range
                  </NativeSelectOption>
                </NativeSelect>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by name or ID..."
                    className="h-10 w-full rounded-xl border-slate-200 pl-9 text-sm focus-visible:border-blue-400 focus-visible:ring-blue-400/20"
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

            {/* Custom Date Range Picker */}
            {dateFilter === "custom" && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 sm:w-fit">
                <span className="ml-1 text-xs font-bold text-slate-500">
                  From:
                </span>
                <Input
                  type="date"
                  value={customDateRange.from}
                  onChange={(e) => {
                    setCustomDateRange((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }));
                    setPage(1);
                  }}
                  className="h-8 w-[130px] border-slate-200 text-xs"
                />
                <span className="mx-1 text-xs font-bold text-slate-500">
                  To:
                </span>
                <Input
                  type="date"
                  value={customDateRange.to}
                  onChange={(e) => {
                    setCustomDateRange((prev) => ({
                      ...prev,
                      to: e.target.value,
                    }));
                    setPage(1);
                  }}
                  className="h-8 w-[130px] border-slate-200 text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead
                  className="cursor-pointer font-bold text-slate-500"
                  onClick={() => toggleSort("userName")}
                >
                  User {renderSortIcon("userName")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-bold text-slate-500"
                  onClick={() => toggleSort("status")}
                >
                  Status {renderSortIcon("status")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-bold text-slate-500"
                  onClick={() => toggleSort("timeIn")}
                >
                  Time In {renderSortIcon("timeIn")}
                </TableHead>
                <TableHead
                  className="cursor-pointer font-bold text-slate-500"
                  onClick={() => toggleSort("timeOut")}
                >
                  Time Out {renderSortIcon("timeOut")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-slate-500"
                  >
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((visit) => (
                  <TableRow
                    key={visit.id}
                    className="border-slate-100 transition-colors hover:bg-slate-50/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border shadow-sm">
                          <AvatarImage
                            src={visit.user.avatarUrl || undefined}
                          />
                          <AvatarFallback>
                            {visit.user.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {visit.user.fullName}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {visit.user.schoolId}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          visit.status === "INSIDE" ? "default" : "secondary"
                        }
                        className={
                          visit.status === "INSIDE"
                            ? "border-green-200 bg-green-100 text-green-700 hover:bg-green-100"
                            : "border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100"
                        }
                      >
                        {visit.status === "INSIDE" ? (
                          <CheckCircle2 className="mr-1 size-3" />
                        ) : (
                          <AlertTriangle className="mr-1 size-3" />
                        )}
                        {visit.status === "INSIDE" ? "Inside" : "Exited"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <ClockIcon className="h-3.5 w-3.5 text-blue-500" />
                          {new Date(visit.timeIn).toLocaleTimeString("en-PH", {
                            timeZone: "Asia/Manila",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(visit.timeIn).toLocaleDateString("en-PH", {
                            timeZone: "Asia/Manila",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {visit.timeOut ? (
                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <ClockIcon className="h-3.5 w-3.5 text-blue-500" />
                            {new Date(visit.timeOut).toLocaleTimeString(
                              "en-PH",
                              {
                                timeZone: "Asia/Manila",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(visit.timeOut).toLocaleDateString(
                              "en-PH",
                              {
                                timeZone: "Asia/Manila",
                              },
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">
                          Currently inside
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {(page - 1) * ROWS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-700">
                {Math.min(page * ROWS_PER_PAGE, totalRecords)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-700">{totalRecords}</span>{" "}
              records
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 rounded-lg border-slate-200 text-xs font-bold text-slate-600"
              >
                <ChevronLeft className="mr-1 size-3.5" /> Previous
              </Button>
              <div className="flex h-8 items-center justify-center rounded-lg bg-white px-3 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 ring-inset">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 rounded-lg border-slate-200 text-xs font-bold text-slate-600"
              >
                Next <ChevronRight className="ml-1 size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
