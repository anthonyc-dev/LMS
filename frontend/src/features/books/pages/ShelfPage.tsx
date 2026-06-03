import { useState, useMemo, Fragment } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  BookOpen,
  MoreHorizontal,
  MapPin,
  Layers,
  LayoutGrid,
  List,
  Package,
  CheckCircle2,
  AlertTriangle,
  X,
  Hash,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { toast } from "sonner";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import {
  useShelves,
  useCreateShelf,
  useUpdateShelf,
  useDeleteShelf,
} from "@/features/books/api/shelves";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ShelfFormModal } from "@/features/books/components/ShelfFormModal";
import { DeleteShelfModal } from "@/features/books/components/DeleteShelfModal";
import { type Shelf, type ShelfStatus, FLOORS } from "@/features/books/types/shelf";

// ---------------------------------------------------------------------------
// Types & seed data
// ---------------------------------------------------------------------------

const ROWS_PER_PAGE = 8;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusCfg: Record<
  ShelfStatus,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <CheckCircle2 className="size-3" />,
  },
  maintenance: {
    label: "Maintenance",
    cls: "bg-amber-100  text-amber-800  border-amber-200",
    icon: <AlertTriangle className="size-3" />,
  },
  full: {
    label: "Full",
    cls: "bg-rose-100   text-rose-800   border-rose-200",
    icon: <Package className="size-3" />,
  },
};

function occupancyColor(pct: number) {
  if (pct >= 95) return "bg-rose-500";
  if (pct >= 75) return "bg-amber-500";
  return "bg-emerald-500";
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function ShelfPage() {
  usePageTitle("Shelf");
  const isMobile = useIsMobile();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data: apiShelves = [], isLoading } = useShelves();
  const createMutation = useCreateShelf();
  const updateMutation = useUpdateShelf();
  const deleteMutation = useDeleteShelf();

  const shelves: Shelf[] = useMemo(() => {
    return apiShelves.map((s) => ({
      id: s.id,
      code: s.code,
      label: s.name,
      floor: s.floor || "Ground Floor",
      section: s.section || "Section A",
      category: "General",
      capacity: 100, // Default capacity
      occupied: s.bookCopies?.length || 0,
      status: (s.bookCopies?.length || 0) >= 100 ? "full" : "active",
      notes: s.description || "",
      lastAudited: new Date(s.updatedAt || new Date())
        .toISOString()
        .slice(0, 10),
    }));
  }, [apiShelves]);

  const [search, setSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Shelf | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shelf | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Derived
  const filtered = useMemo(
    () =>
      shelves.filter((s) => {
        const matchSearch =
          s.code.toLowerCase().includes(search.toLowerCase()) ||
          s.label.toLowerCase().includes(search.toLowerCase()) ||
          s.category.toLowerCase().includes(search.toLowerCase());
        const matchFloor = floorFilter === "all" || s.floor === floorFilter;
        const matchStatus = statusFilter === "all" || s.status === statusFilter;
        return matchSearch && matchFloor && matchStatus;
      }),
    [shelves, search, floorFilter, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  const totalCapacity = shelves.reduce((s, sh) => s + sh.capacity, 0);
  const totalOccupied = shelves.reduce((s, sh) => s + sh.occupied, 0);
  const totalFree = totalCapacity - totalOccupied;
  const fillPct = Math.round((totalOccupied / totalCapacity) * 100);
  const maintenanceCount = shelves.filter(
    (s) => s.status === "maintenance",
  ).length;
  const _fullCount = shelves.filter((s) => s.status === "full").length;
  void _fullCount;

  // Handlers
  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };
  const openEdit = (s: Shelf) => {
    setEditTarget(s);
    setFormOpen(true);
  };
  const openDelete = (s: Shelf) => {
    setDeleteTarget(s);
    setDeleteOpen(true);
  };

  const handleSave = async (data: Omit<Shelf, "id" | "lastAudited">) => {
    try {
      const payload = {
        code: data.code,
        name: data.label,
        description: data.notes,
        floor: data.floor,
        section: data.section,
      };

      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, ...payload });
        toast.success("Shelf updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Shelf created successfully");
      }
      setFormOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Shelf deleted");
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete shelf");
    }
  };

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const onFloor = (v: string | null) => {
    if (v !== null) {
      setFloorFilter(v);
      setPage(1);
    }
  };
  const onStatus = (v: string | null) => {
    if (v !== null) {
      setStatusFilter(v);
      setPage(1);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-xl" />
              <Skeleton className="h-8 w-48 rounded-md" />
            </div>
            <Skeleton className="ml-1 h-4 w-72 rounded-md" />
          </div>
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-slate-100 bg-white">
              <CardContent className="flex items-center gap-3 p-5">
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-6 w-12 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar & Table Skeleton */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-9 w-64 rounded-xl" />
              <Skeleton className="h-9 w-40 rounded-xl" />
              <Skeleton className="h-9 w-36 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>

          <div className="space-y-4 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
                <div className="hidden items-center gap-6 sm:flex">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-8 w-32 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="size-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <div className="rounded-xl bg-slate-100 p-2">
              <Layers className="size-7 text-slate-700" />
            </div>
            Shelf Management
          </h1>
          <p className="mt-1 ml-1 font-medium text-slate-500">
            Manage shelf locations, capacity, and status across all library
            floors.
          </p>
        </div>
        <Button
          onClick={openCreate}
          id="create-shelf-btn"
          className="h-11 gap-2 rounded-xl bg-slate-900 px-6 font-bold text-white shadow-lg shadow-slate-300 transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
        >
          <Plus className="size-4" /> New Shelf
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card className="group border-slate-100 bg-white transition-all hover:border-slate-300 hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="shrink-0 rounded-xl bg-slate-100 p-3 text-slate-600 transition-transform group-hover:scale-110">
              <Layers className="size-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Total Shelves
              </p>
              <h3 className="text-xl font-black text-slate-900">
                {shelves.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-slate-100 bg-white transition-all hover:border-indigo-200 hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="shrink-0 rounded-xl bg-indigo-50 p-3 text-indigo-600 transition-transform group-hover:scale-110">
              <Package className="size-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Total Capacity
              </p>
              <h3 className="text-xl font-black text-slate-900">
                {totalCapacity}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-slate-100 bg-white transition-all hover:border-emerald-200 hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="shrink-0 rounded-xl bg-emerald-50 p-3 text-emerald-600 transition-transform group-hover:scale-110">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Free Slots
              </p>
              <h3 className="text-xl font-black text-emerald-700">
                {totalFree}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-slate-100 bg-white transition-all hover:border-amber-200 hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="shrink-0 rounded-xl bg-amber-50 p-3 text-amber-600 transition-transform group-hover:scale-110">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Maintenance
              </p>
              <h3 className="text-xl font-black text-amber-700">
                {maintenanceCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Utilization card */}
        <Card className="group border-slate-100 bg-white transition-all hover:border-blue-200 hover:shadow-md lg:col-span-1">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-600 transition-transform group-hover:scale-110">
                <BookOpen className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Overall Fill
                </p>
                <h3 className="text-xl font-black text-slate-900">
                  {fillPct}%
                </h3>
              </div>
            </div>
            <Progress value={fillPct} className="h-1.5 bg-slate-100" />
          </CardContent>
        </Card>
      </div>

      {/* ── Toolbar ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search shelves…"
                className="h-9 rounded-xl border-slate-200 pl-9 text-sm focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => onSearch("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Floor filter */}
            <Select
              value={floorFilter}
              onValueChange={(v) => {
                if (v !== null) onFloor(v);
              }}
            >
              <SelectTrigger className="h-9 w-40 rounded-xl border-slate-200 text-sm">
                <MapPin className="mr-1.5 size-3.5 text-slate-400" />
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="all">All Floors</SelectItem>
                {FLOORS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                if (v !== null) onStatus(v);
              }}
            >
              <SelectTrigger className="h-9 w-36 rounded-xl border-slate-200 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>

            <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
              <Hash className="size-3" />
              {filtered.length} shelf{filtered.length !== 1 ? "es" : ""}
            </span>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-lg p-1.5 transition-all ${viewMode === "table" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-1.5 transition-all ${viewMode === "grid" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>

        {/* ── TABLE VIEW ── */}
        {viewMode === "table" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-slate-100 bg-slate-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 pl-5 font-bold text-slate-500">
                    {isMobile ? "Shelf" : "Code"}
                  </TableHead>
                  {!isMobile && (
                    <>
                      <TableHead className="py-4 font-bold text-slate-500">
                        Label
                      </TableHead>
                      <TableHead className="py-4 font-bold text-slate-500">
                        Floor / Section
                      </TableHead>
                      <TableHead className="py-4 font-bold text-slate-500">
                        Category
                      </TableHead>
                      <TableHead className="py-4 font-bold text-slate-500">
                        Occupancy
                      </TableHead>
                      <TableHead className="py-4 font-bold text-slate-500">
                        Status
                      </TableHead>
                      <TableHead className="py-4 font-bold text-slate-500">
                        Last Audit
                      </TableHead>
                    </>
                  )}
                  <TableHead className="py-4 pr-5 text-right font-bold text-slate-500">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((shelf) => {
                  const pct = Math.round(
                    (shelf.occupied / shelf.capacity) * 100,
                  );
                  const isExpanded = isMobile && expandedRow === shelf.id;
                  return (
                    <Fragment key={shelf.id}>
                      <TableRow
                        className={`group transition-colors hover:bg-slate-50/60 ${isMobile ? "cursor-pointer" : ""}`}
                        onClick={() => {
                          if (isMobile) {
                            setExpandedRow(isExpanded ? null : shelf.id);
                          }
                        }}
                      >
                        <TableCell className="py-4 pl-5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-sm font-black text-slate-800">
                                {shelf.code}
                              </span>
                              {isMobile && (
                                <div className="mt-2">
                                  <p className="text-sm font-bold text-slate-800">
                                    {shelf.label}
                                  </p>
                                  {shelf.notes && (
                                    <p className="max-w-[160px] truncate text-[11px] font-medium text-amber-600">
                                      ⚠ {shelf.notes}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            {isMobile && (
                              <ChevronDown
                                className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              />
                            )}
                          </div>
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell>
                              <p className="text-sm font-bold text-slate-800">
                                {shelf.label}
                              </p>
                              {shelf.notes && (
                                <p className="max-w-[160px] truncate text-[11px] font-medium text-amber-600">
                                  ⚠ {shelf.notes}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-slate-700">
                                  {shelf.floor}
                                </p>
                                <p className="text-[11px] font-medium text-slate-400">
                                  {shelf.section}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="border-none bg-slate-100 text-xs font-bold text-slate-600"
                              >
                                {shelf.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="min-w-[140px]">
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                  <span>
                                    {shelf.occupied}/{shelf.capacity}
                                  </span>
                                  <span>{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${occupancyColor(pct)}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusCfg[shelf.status].cls}`}
                              >
                                {statusCfg[shelf.status].icon}
                                {statusCfg[shelf.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-medium text-slate-400">
                                {shelf.lastAudited}
                              </span>
                            </TableCell>
                          </>
                        )}
                        <TableCell className="pr-5 text-right">
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-8 w-8 rounded-lg text-slate-400 transition-opacity hover:bg-slate-100 ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
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
                                  onClick={() => openEdit(shelf)}
                                  className="cursor-pointer gap-2 rounded-lg py-2 font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                                >
                                  <Edit3 className="size-3.5" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                <DropdownMenuItem
                                  onClick={() => openDelete(shelf)}
                                  className="cursor-pointer gap-2 rounded-lg py-2 font-medium text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="size-3.5" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
                                  Floor / Section
                                </span>
                                <span className="font-bold text-slate-800">
                                  {shelf.floor} · {shelf.section}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Category
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="border-none bg-slate-100 text-xs font-bold text-slate-600"
                                >
                                  {shelf.category}
                                </Badge>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Occupancy
                                </span>
                                <span className="font-bold text-slate-800">
                                  {shelf.occupied}/{shelf.capacity} ({pct}%)
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Status
                                </span>
                                <Badge
                                  className={`flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusCfg[shelf.status].cls}`}
                                >
                                  {statusCfg[shelf.status].icon}
                                  {statusCfg[shelf.status].label}
                                </Badge>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Last Audit
                                </span>
                                <span className="font-bold text-slate-800">
                                  {shelf.lastAudited}
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
                      colSpan={isMobile ? 2 : 8}
                      className="h-48 text-center text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Layers className="size-8 text-slate-300" />
                        <p className="text-sm font-medium">
                          No shelves match your filters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginated.map((shelf) => {
              const pct = Math.round((shelf.occupied / shelf.capacity) * 100);
              const cfg = statusCfg[shelf.status];
              return (
                <div
                  key={shelf.id}
                  className="group space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 font-mono text-sm font-black text-slate-800 shadow-xs">
                        {shelf.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`flex items-center gap-1 border text-[10px] font-bold ${cfg.cls}`}
                      >
                        {cfg.icon} {cfg.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`-mr-1 h-7 w-7 rounded-lg text-slate-400 transition-opacity hover:bg-white ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent
                          align="end"
                          className="w-40 rounded-xl border-slate-100 p-1.5 shadow-xl"
                        >
                          <DropdownMenuItem
                            onClick={() => openEdit(shelf)}
                            className="cursor-pointer gap-2 rounded-lg py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Edit3 className="size-3" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 bg-slate-100" />
                          <DropdownMenuItem
                            onClick={() => openDelete(shelf)}
                            className="cursor-pointer gap-2 rounded-lg py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="size-3" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {shelf.label}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">
                      {shelf.floor} · {shelf.section}
                    </p>
                  </div>

                  <Badge
                    variant="secondary"
                    className="border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-xs"
                  >
                    {shelf.category}
                  </Badge>

                  {shelf.notes && (
                    <p className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
                      ⚠ {shelf.notes}
                    </p>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>
                        {shelf.occupied}/{shelf.capacity} books
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${occupancyColor(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {paginated.length === 0 && (
              <div className="col-span-full flex flex-col items-center gap-2 py-16 text-slate-400">
                <Layers className="size-10 text-slate-300" />
                <p className="text-sm font-medium">
                  No shelves match your filters.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          <p className="text-xs font-medium text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–
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
                variant={p === page ? "default" : "outline"}
                size="icon"
                className={`h-8 w-8 rounded-lg text-xs font-bold ${p === page ? "border-slate-900 bg-slate-900 shadow-sm hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
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
      {formOpen && (
        <ShelfFormModal
          open={formOpen}
          initial={editTarget}
          isPending={createMutation.isPending || updateMutation.isPending}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
        />
      )}
      <DeleteShelfModal
        open={deleteOpen}
        shelf={deleteTarget}
        isPending={deleteMutation.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
