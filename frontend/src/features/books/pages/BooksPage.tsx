import { useState, useEffect, Fragment } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Hash,
  ChevronDown,
  Library,
  BookText,
} from "lucide-react";
import { useIsMobile } from "@/shared/hooks/use-mobile";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { usePageTitle } from "@/shared/hooks/usePageTitle";
import {
  useBooks,
  useDeleteBook,
  useUpdateBook,
} from "@/features/books/hooks/useBooks";
import type { Book, UpdateBookDto } from "@/features/books/types/book";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { EditBookModal } from "@/features/books/components/EditBookModal";
import { DeleteBookModal } from "@/features/books/components/DeleteBookModal";

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function BooksPage() {
  usePageTitle("Books Metadata");
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Queries & Mutations
  const { data, isLoading } = useBooks({
    page,
    limit,
    search: debouncedSearch,
  });
  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();

  const books = data?.data || [];
  const totalItems = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Modals state
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = (book: Book) => {
    setEditBook(book);
    setEditOpen(true);
  };

  const handleSaveEdit = (id: string, updated: UpdateBookDto) => {
    updateBookMutation.mutate(
      { id, data: updated },
      {
        onSuccess: () => {
          toast.success("Book metadata updated successfully");
          setEditOpen(false);
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (deleteBook) {
      deleteBookMutation.mutate(deleteBook.id, {
        onSuccess: () => {
          toast.success("Book metadata deleted");
          setDeleteOpen(false);
        },
      });
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
              <Skeleton className="h-8 w-64 rounded-lg" />
            </div>
            <Skeleton className="ml-1 h-4 w-96 rounded-lg" />
          </div>
        ) : (
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              <div className="rounded-xl bg-indigo-50 p-2">
                <Library className="size-7" />
              </div>
              Book Catalog Metadata
            </h1>
            <p className="mt-1 ml-1 font-medium text-slate-500">
              Manage your library's core metadata, ISBNs, and descriptions.
            </p>
          </div>
        )}
        {isLoading ? (
          <Skeleton className="h-11 w-40 rounded-xl" />
        ) : (
          <Button
            onClick={() => navigate("/admin/books/add")}
            id="add-book-btn"
            className="h-11 gap-2 rounded-xl bg-slate-900 px-6 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
          >
            <Plus className="size-4" /> Register Title
          </Button>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 rounded-lg" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
            <div className="shrink-0 rounded-xl bg-indigo-50 p-3 text-indigo-600 transition-transform group-hover:scale-110">
              <BookText className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Total Titles Cataloged
              </p>
              <h3 className="text-2xl font-black text-slate-900">
                {totalItems}
              </h3>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Table Card ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-5 w-32 rounded-lg" />
            ) : (
              <>
                <Hash className="size-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">
                  {totalItems} title{totalItems !== 1 ? "s" : ""} found
                </span>
              </>
            )}
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search title, author, ISBN…"
                className="h-10 rounded-xl border-slate-200 pl-10 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
            <TableHeader className="border-b border-slate-100 bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[350px] py-4 pl-5 font-bold text-slate-500">
                  Metadata Title
                </TableHead>
                {!isMobile && (
                  <>
                    <TableHead className="py-4 font-bold text-slate-500">
                      Category
                    </TableHead>
                    <TableHead className="py-4 font-bold text-slate-500">
                      Publisher
                    </TableHead>
                    <TableHead className="py-4 font-bold text-slate-500">
                      Pages
                    </TableHead>
                    <TableHead className="py-4 font-bold text-slate-500">
                      Available Copies
                    </TableHead>
                  </>
                )}
                <TableHead className="py-4 pr-5 text-right font-bold text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-14 w-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-10" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-10" />
                        </TableCell>
                      </>
                    )}
                    <TableCell className="pr-5 text-right">
                      <Skeleton className="ml-auto h-8 w-8 rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
              ) : books.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isMobile ? 2 : 6}
                    className="py-10 text-center text-slate-500"
                  >
                    No books found. Try adjusting your search.
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => {
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
                              <p className="max-w-[200px] truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                                {book.title}
                              </p>
                              <p className="truncate text-xs font-medium text-slate-500">
                                {book.author || "Unknown Author"}
                              </p>
                              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                                ISBN: {book.isbn}
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

                        {!isMobile && (
                          <>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="border-none bg-slate-100 text-xs font-bold text-slate-600"
                              >
                                {book.category?.name ||
                                  (book.categoryId
                                    ? `${book.categoryId.substring(0, 8)}...`
                                    : "None")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {book.publisher || "—"}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-slate-700">
                              {book.pages || "—"}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-slate-700">
                              {book.availableCopies}
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
                                <Trash2 className="size-3.5" /> Delete Entry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                                  className="border-none bg-slate-100 text-xs font-bold text-slate-600"
                                >
                                  {book.category?.name ||
                                    (book.categoryId
                                      ? `${book.categoryId.substring(0, 8)}...`
                                      : "None")}
                                </Badge>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Publisher
                                </span>
                                <span className="text-sm text-slate-700">
                                  {book.publisher || "—"}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Pages
                                </span>
                                <span className="text-sm font-medium text-slate-700">
                                  {book.pages || "—"}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Available Copies
                                </span>
                                <span className="text-sm font-medium text-slate-700">
                                  {book.availableCopies}
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
          {isLoading ? (
            <Skeleton className="h-4 w-40 rounded-lg" />
          ) : (
            <p className="text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {totalItems === 0 ? 0 : (page - 1) * limit + 1}–
                {Math.min(page * limit, totalItems)}
              </span>{" "}
              of <span className="font-bold text-slate-700">{totalItems}</span>
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200 text-slate-500"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                    page === i + 1
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-200"
                  }`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200 text-slate-500"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <EditBookModal
        book={editBook}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveEdit}
        isUpdating={updateBookMutation.isPending}
      />
      <DeleteBookModal
        book={deleteBook}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteBookMutation.isPending}
      />
    </div>
  );
}
