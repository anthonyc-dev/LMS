import { useState, useEffect, Fragment } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  BookCopy as BookCopyIcon,
  Layers,
  MoreHorizontal,
  ChevronDown,
  Barcode,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { toast } from "sonner";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import {
  useBookCopies,
  useCreateBookCopy,
  useBulkCreateBookCopy,
  useUpdateBookCopy,
  useDeleteBookCopy,
} from "@/features/books/api/bookCopies";
import { BookCopyFormModal } from "@/features/books/components/BookCopyFormModal";
import { DeleteBookCopyModal } from "@/features/books/components/DeleteBookCopyModal";
import { ViewBarcodeModal } from "@/features/books/components/ViewBarcodeModal";
import { ViewMultipleBarcodesModal } from "@/features/books/components/ViewMultipleBarcodesModal";
import {
  type BookCopy,
  type BookCopyStatus,
} from "@/features/books/types/bookCopy";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useIsMobile } from "@/shared/hooks/use-mobile";

const statusCfg: Record<BookCopyStatus, { label: string; cls: string }> = {
  AVAILABLE: { label: "Available", cls: "bg-success-bg text-success-text" },
  BORROWED: { label: "Borrowed", cls: "bg-blue-100 text-blue-800" },
  RESERVED: { label: "Reserved", cls: "bg-blue-100 text-blue-800" },
  LOST: { label: "Lost", cls: "bg-error-bg text-error-text" },
  DAMAGED: { label: "Damaged", cls: "bg-warning-bg text-warning-text" },
  MAINTENANCE: { label: "Maintenance", cls: "bg-warning-bg text-warning-text" },
};

const ROWS_PER_PAGE = 8;

export function BookCopiesPage() {
  usePageTitle("Book Copies");
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("ALL");

  const { data: response, isLoading } = useBookCopies(
    page,
    ROWS_PER_PAGE,
    debouncedSearch,
    status === "ALL" ? undefined : status,
  );
  const bookCopies = response?.data || [];
  const total = response?.total || 0;
  const totalPages = response?.totalPages || 1;
  const filtered = bookCopies;
  const paginated = bookCopies;

  const createMutation = useCreateBookCopy();
  const bulkCreateMutation = useBulkCreateBookCopy();
  const updateMutation = useUpdateBookCopy();
  const deleteMutation = useDeleteBookCopy();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BookCopy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookCopy | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [barcodeTarget, setBarcodeTarget] = useState<BookCopy | null>(null);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [multipleBarcodesTarget, setMultipleBarcodesTarget] = useState<
    BookCopy[]
  >([]);
  const [multipleBarcodesOpen, setMultipleBarcodesOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const onStatusChange = (v: string | null) => {
    setStatus(v ?? "ALL");
    setPage(1);
  };

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };
  const openEdit = (bc: BookCopy) => {
    setEditTarget(bc);
    setFormOpen(true);
  };
  const openDelete = (bc: BookCopy) => {
    setDeleteTarget(bc);
    setDeleteOpen(true);
  };
  const openBarcode = (bc: BookCopy) => {
    setBarcodeTarget(bc);
    setBarcodeOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editTarget) {
        const { shelfSectionIds, ...rest } = data;
        await updateMutation.mutateAsync({
          id: editTarget.id,
          ...rest,
          shelfSectionId: shelfSectionIds?.[0] || undefined,
        });
        toast.success("Book copy updated successfully");
        setFormOpen(false);
      } else {
        const { shelfSectionIds: sectionIds = [], ...rest } = data;
        if (sectionIds.length === 0) {
          if (data.count && data.count > 1) {
            const newCopies = await bulkCreateMutation.mutateAsync({
              ...rest,
              shelfSectionId: undefined,
            });
            toast.success(`${data.count} book copies created successfully`);
            setFormOpen(false);
            setMultipleBarcodesTarget(newCopies);
            setMultipleBarcodesOpen(true);
          } else {
            const newCopy = await createMutation.mutateAsync({
              ...rest,
              shelfSectionId: undefined,
            });
            toast.success("Book copy created successfully");
            setFormOpen(false);
            openBarcode(newCopy);
          }
        } else {
          if (data.count && data.count > 1) {
            const totalCount = data.count;
            const numSections = sectionIds.length;
            const base = Math.floor(totalCount / numSections);
            const remainder = totalCount % numSections;

            const results = await Promise.all(
              sectionIds.map((sectionId: string, i: number) => {
                const sectionCount = base + (i < remainder ? 1 : 0);
                if (sectionCount > 0) {
                  return bulkCreateMutation.mutateAsync({
                    ...rest,
                    shelfSectionId: sectionId,
                    count: sectionCount,
                  });
                }
                return Promise.resolve([]);
              })
            );
            const allNewCopies = results.flat();
            toast.success(`${totalCount} book copies created successfully across ${numSections} sections`);
            setFormOpen(false);
            setMultipleBarcodesTarget(allNewCopies);
            setMultipleBarcodesOpen(true);
          } else {
            const createdCopies = await Promise.all(
              sectionIds.map((sectionId: string) =>
                createMutation.mutateAsync({
                  ...rest,
                  shelfSectionId: sectionId,
                })
              )
            );
            toast.success(`${createdCopies.length} book copies created successfully`);
            setFormOpen(false);
            if (createdCopies.length > 1) {
              setMultipleBarcodesTarget(createdCopies);
              setMultipleBarcodesOpen(true);
            } else {
              openBarcode(createdCopies[0]);
            }
          }
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Book copy deleted");
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete book copy",
      );
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-8 w-48 rounded-lg" />
            </div>
            <Skeleton className="ml-1 h-4 w-80 rounded-lg" />
          </div>
        ) : (
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              <div className="rounded-xl bg-slate-100 p-2">
                <BookCopyIcon className="size-7 text-slate-700" />
              </div>
              Book Copies
            </h1>
            <p className="mt-1 ml-1 font-medium text-slate-500">
              Manage physical copies and barcodes for your library catalog.
            </p>
          </div>
        )}
        {isLoading ? (
          <Skeleton className="h-11 w-full rounded-xl sm:w-32" />
        ) : (
          <Button
            onClick={openCreate}
            className="h-11 w-full gap-2 rounded-xl bg-slate-900 px-6 font-bold text-white shadow-lg shadow-slate-300 transition-all hover:scale-105 hover:bg-slate-800 sm:w-auto"
          >
            <Plus className="size-4" /> New Copy
          </Button>
        )}
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-lg" />
              <Skeleton className="h-7 w-12 rounded-lg" />
            </div>
          </div>
        ) : (
          <Card className="group border-slate-100 bg-white transition-all hover:border-slate-300 hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="shrink-0 rounded-xl bg-slate-100 p-3 text-slate-600 transition-transform group-hover:scale-110">
                <Layers className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Total Copies
                </p>
                <h3 className="text-xl font-black text-slate-900">{total}</h3>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Toolbar & Table ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-full sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search copies (barcode, title)..."
              className="h-9 rounded-xl border-slate-200 pl-9 text-sm focus-visible:border-slate-400"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="h-9 w-full rounded-xl border-slate-200 text-sm focus:ring-slate-400 focus-visible:ring-slate-400 sm:w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem
                value="ALL"
                className="rounded-lg text-sm font-medium"
              >
                All Statuses
              </SelectItem>
              {Object.entries(statusCfg).map(([key, cfg]) => (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg text-sm font-medium"
                >
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-slate-100 bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 pl-5 font-bold text-slate-500">
                  Barcode
                </TableHead>
                <TableHead className="py-4 font-bold text-slate-500">
                  Book
                </TableHead>
                <TableHead className="hidden py-4 font-bold text-slate-500 md:table-cell">
                  Status | Condition
                </TableHead>
                <TableHead className="hidden py-4 font-bold text-slate-500 md:table-cell">
                  Shelf | Section
                </TableHead>
                <TableHead className="hidden py-4 font-bold text-slate-500 lg:table-cell">
                  Notes
                </TableHead>
                <TableHead className="py-4 pr-5 text-right font-bold text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-4 pl-5">
                      <Skeleton className="h-6 w-28 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px] rounded-md" />
                        <Skeleton className="h-3 w-[100px] rounded-md" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16 rounded-md" />
                        <Skeleton className="h-3 w-12 rounded-md" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-12 rounded-md" />
                        <Skeleton className="h-3 w-20 rounded-md" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-[150px] rounded-md" />
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Skeleton className="ml-auto h-8 w-8 rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isMobile ? 2 : 6}
                    className="py-10 text-center text-slate-500"
                  >
                    No book copies found. Try adjusting your search.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((bc) => {
                  const isExpanded = isMobile && expandedRow === bc.id;
                  return (
                    <Fragment key={bc.id}>
                      <TableRow
                        className="group cursor-pointer transition-colors hover:bg-slate-50/60"
                        onClick={() => {
                          if (isMobile) {
                            setExpandedRow(isExpanded ? null : bc.id);
                          }
                        }}
                      >
                        <TableCell className="py-4 pl-5">
                          <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-sm font-black text-slate-800">
                            {bc.barcode}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-between gap-3">
                            <div className="max-w-xs">
                              <p
                                className="truncate font-bold text-slate-800"
                                title={bc.book?.title}
                              >
                                {bc.book?.title || "Unknown Book"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {bc.book?.isbn || ""}
                              </p>
                            </div>
                            {isMobile && (
                              <ChevronDown
                                className={`size-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col items-start gap-1">
                            <Badge
                              className={`min-w-22 justify-center border-none px-2 py-0.5 text-center text-[10px] font-bold ${statusCfg[bc.status]?.cls || "bg-slate-100 text-slate-600"}`}
                            >
                              {statusCfg[bc.status]?.label || bc.status}
                            </Badge>
                            <span className="text-[10px] font-semibold text-slate-500">
                              Cond: {bc.condition}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {bc.location?.shelfId ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">
                                {bc.location.shelfName}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {bc.location.sectionName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="max-w-[200px] truncate text-xs text-slate-600">
                            {bc.notes || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="pr-5 text-right">
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
                              className="w-36 rounded-xl border-slate-100 p-1.5 shadow-xl"
                            >
                              <DropdownMenuItem
                                onClick={() => openEdit(bc)}
                                className="cursor-pointer gap-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit3 className="size-3.5" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openBarcode(bc)}
                                className="cursor-pointer gap-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                <Barcode className="size-3.5" /> View Barcode
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 bg-slate-100" />
                              <DropdownMenuItem
                                onClick={() => openDelete(bc)}
                                className="cursor-pointer gap-2 rounded-lg text-xs font-medium text-error-text hover:bg-error-bg"
                              >
                                <Trash2 className="size-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                          <TableCell
                            colSpan={6}
                            className="border-b border-slate-100 p-0"
                          >
                            <div className="flex flex-col gap-3 px-5 py-4 text-sm">
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Status & Cond.
                                </span>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`border-none px-2 py-0.5 text-[10px] font-bold ${statusCfg[bc.status]?.cls || "bg-slate-100 text-slate-600"}`}
                                  >
                                    {statusCfg[bc.status]?.label || bc.status}
                                  </Badge>
                                  <span className="text-xs font-semibold text-slate-600">
                                    {bc.condition}
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Shelf Location
                                </span>
                                <span className="text-sm font-bold text-slate-700">
                                  {bc.location?.shelfId
                                    ? bc.location.shelfName
                                    : "Unassigned"}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Notes
                                </span>
                                <span className="text-sm text-slate-700">
                                  {bc.notes || "—"}
                                </span>
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
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row">
          <p className="order-2 text-xs font-medium text-slate-500 sm:order-1">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–
              {Math.min(page * ROWS_PER_PAGE, total)}
            </span>{" "}
            of <span className="font-bold text-slate-700">{total}</span> copies
          </p>
          <div className="order-1 flex items-center gap-2 sm:order-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className={`h-8 w-8 cursor-pointer rounded-lg text-xs font-bold ${
                  p === page
                    ? "bg-slate-900 text-white shadow-sm shadow-slate-200 hover:bg-slate-800"
                    : "border-slate-200 text-slate-600"
                }`}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <BookCopyFormModal
        open={formOpen}
        initial={editTarget}
        isPending={
          createMutation.isPending ||
          updateMutation.isPending ||
          bulkCreateMutation.isPending
        }
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
      <DeleteBookCopyModal
        open={deleteOpen}
        bookCopy={deleteTarget}
        isPending={deleteMutation.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
      <ViewBarcodeModal
        open={barcodeOpen}
        bookCopy={barcodeTarget}
        onClose={() => setBarcodeOpen(false)}
      />

      <ViewMultipleBarcodesModal
        open={multipleBarcodesOpen}
        bookCopies={multipleBarcodesTarget}
        onClose={() => setMultipleBarcodesOpen(false)}
      />
    </div>
  );
}
