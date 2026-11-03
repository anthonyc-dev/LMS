import { useState } from "react";
import { Search, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { CatalogSearchDialog } from "../components/CatalogSearchDialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useRoleBasePath } from "@/shared/hooks/useRoleBasePath";
import { useBooks } from "../hooks/useBooks";
import { useCategories } from "../api/categories";
import { CatalogFormatFilter } from "../components/CatalogFormatFilter";
import type { CatalogFormat } from "../types/book";
import bookCover from "@/assets/images/dashboard/book_dark1.png";

export function BrowseBooksPage() {
  usePageTitle("Library Catalog");
  const navigate = useNavigate();
  const basePath = useRoleBasePath();
  const [format, setFormat] = useState<CatalogFormat>("all");
  const [categoryId, setCategoryId] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isPending, isPlaceholderData, isFetching, isError, refetch } =
    useBooks({
      page,
      limit: 12,
      format,
      categoryId: categoryId === "all" ? undefined : categoryId,
    });
  const { data: categories = [] } = useCategories();
  const loading = isPending || isPlaceholderData;
  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {searchOpen && (
        <CatalogSearchDialog onClose={() => setSearchOpen(false)} />
      )}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Library Catalog
        </h1>
        <p className="text-sm text-slate-500">
          Discover physical books and eBooks in one place. Borrow a physical
          copy or read an eBook instantly.
        </p>
      </header>
      <section aria-label="Catalog filters" className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          aria-haspopup="dialog"
          onClick={() => setSearchOpen(true)}
          className="h-11 min-w-52 flex-1 justify-start gap-3 text-slate-500"
        >
          <Search className="size-4" aria-hidden="true" />
          Search books, authors, ISBN…
        </Button>
        <CatalogFormatFilter
          value={format}
          onChange={(value) => {
            setFormat(value);
            setPage(1);
          }}
        />
        <Select
          value={categoryId}
          onValueChange={(value) => {
            setCategoryId(value || "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44" aria-label="Category">
            <SelectValue>
              {categories.find((category) => category.id === categoryId)
                ?.name || "All categories"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>
      {isError ? (
        <div role="alert" className="space-y-3 rounded-xl border p-6">
          <p>Unable to load the catalog.</p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500" role="status">
            {loading
              ? "Loading catalog…"
              : (data?.total || 0) + " titles found"}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }, (_, index) => (
                  <Skeleton key={index} className="h-80 rounded-2xl" />
                ))
              : data?.data.map((book) => {
                  const physical = (book.physicalCopies || 0) > 0;
                  const digital = !!book.ebookFileName;
                  return (
                    <article
                      key={book.id}
                      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                    >
                      <img
                        src={book.coverImage || bookCover}
                        alt={book.title}
                        className="aspect-3/4 w-full object-cover"
                      />
                      <div className="space-y-3 p-4">
                        <Badge variant="secondary">
                          {physical && digital
                            ? "Physical + eBook"
                            : digital
                              ? "eBook"
                              : physical
                                ? "Physical book"
                                : "Catalog title"}
                        </Badge>
                        <h2 className="line-clamp-2 font-bold text-slate-900">
                          {book.title}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {book.author || "Unknown author"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {book.category?.name || "Uncategorized"}
                        </p>
                        {physical && (
                          <p className="text-sm text-slate-600">
                            Physical: {book.availabilityLabel}
                          </p>
                        )}
                        {digital && (
                          <p className="text-sm text-blue-700">
                            eBook: Read instantly
                          </p>
                        )}
                        <Button
                          className="w-full"
                          onClick={() =>
                            navigate(basePath + "/books/details/" + book.id)
                          }
                        >
                          <BookOpen className="mr-2 size-4" />
                          {digital && !physical ? "Read eBook" : "View title"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
          </div>
          {!loading && !data?.data.length && (
            <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">
              No titles match your filters.
            </p>
          )}
          {!loading && (data?.totalPages || 0) > 1 && (
            <nav
              aria-label="Catalog pages"
              className="flex items-center justify-center gap-4"
            >
              <Button
                variant="outline"
                disabled={page === 1 || isFetching}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <span className="text-sm">
                Page {page} of {data?.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= (data?.totalPages || 1) || isFetching}
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
