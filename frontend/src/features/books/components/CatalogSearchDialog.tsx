import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Tablet,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useRoleBasePath } from "@/shared/hooks/useRoleBasePath";
import { useBooks } from "../hooks/useBooks";
import { useCategories } from "../api/categories";

export function CatalogSearchDialog({ onClose }: { onClose: () => void }) {
  const basePath = useRoleBasePath();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<"all" | "physical" | "ebook">("all");
  const [categoryId, setCategoryId] = useState("all");
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);
  const { data, isPending, isPlaceholderData, isFetching, isError, refetch } =
    useBooks({
      page,
      limit: 8,
      search: query,
      format,
      categoryId: categoryId === "all" ? undefined : categoryId,
    });
  const { data: categories = [], isError: categoryError } = useCategories();
  const loading = isPending || isPlaceholderData || search.trim() !== query;
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="px-5 pt-5 pb-4 sm:px-6">
          <DialogTitle className="pr-9 text-lg font-semibold">
            Library Catalog
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search physical books and eBooks by title, author, or ISBN. Select a
            result to open its details.
          </DialogDescription>
        </DialogHeader>
        <form
          role="search"
          className="px-5 sm:px-6"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(search.trim());
            setPage(1);
          }}
        >
          <div className="relative">
            <Search
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute top-3.5 left-3.5 size-4"
            />
            <Input
              autoFocus
              type="search"
              aria-label="Search physical books and eBooks"
              placeholder="Search books, authors, ISBN…"
              maxLength={200}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-12 pr-11 pl-10 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground absolute top-1.5 right-1.5"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </form>
        <Tabs
          value={format}
          onValueChange={(value) => {
            if (value === "all" || value === "physical" || value === "ebook") {
              setFormat(value);
              setPage(1);
            }
          }}
          className="mt-4 min-h-0 gap-0"
        >
          <TabsList
            aria-label="Search book format"
            className="mx-5 mb-3 flex w-auto gap-2 sm:mx-6"
          >
            <TabsTrigger value="all" className="rounded-full">
              All
            </TabsTrigger>
            <TabsTrigger value="physical" className="rounded-full">
              Physical
            </TabsTrigger>
            <TabsTrigger value="ebook" className="rounded-full">
              E-books
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-2 sm:px-6">
            <p role="status" className="text-muted-foreground text-xs">
              {loading
                ? "Searching…"
                : isError
                  ? "Search unavailable"
                  : (data?.total || 0) +
                    (data?.total === 1 ? " title found" : " titles found")}
            </p>
            {categories.length > 0 && (
              <Select
                value={categoryId}
                onValueChange={(value) => {
                  setCategoryId(value || "all");
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Search category"
                  className="h-8 w-44 text-xs"
                >
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
            )}
            {categoryError && (
              <p className="text-muted-foreground text-xs">
                Categories unavailable. Title search still works.
              </p>
            )}
          </div>
          <TabsContent
            value={format}
            className="m-0 max-h-[55dvh] min-h-48 overflow-y-auto overscroll-contain px-5 sm:px-6"
            aria-busy={loading}
          >
            {isError ? (
              <div role="alert" className="space-y-3 py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Unable to search the catalog.
                </p>
                <Button
                  variant="ghost"
                  className="text-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => refetch()}
                >
                  Try again
                </Button>
              </div>
            ) : loading ? (
              <div className="space-y-5 py-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex items-center gap-5">
                    <Skeleton className="size-10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.data.length ? (
              <ul className="divide-border divide-y">
                {data.data.map((book) => {
                  const physical =
                    (book.physicalCopies ?? book.bookCopies?.length ?? 0) > 0;
                  const digital = !!book.ebookFileName;
                  const Icon = digital && !physical ? Tablet : BookOpen;
                  return (
                    <li key={book.id}>
                      <Link
                        to={basePath + "/books/details/" + book.id}
                        onClick={onClose}
                        aria-label={"Open " + book.title}
                        className="group hover:bg-accent focus-visible:bg-accent focus-visible:outline-ring flex items-center gap-4 rounded-lg px-1 py-5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 sm:gap-6"
                      >
                        <Icon
                          aria-hidden="true"
                          className="text-muted-foreground mx-2 size-6 shrink-0"
                        />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <h3 className="text-foreground line-clamp-2 text-sm font-semibold sm:text-base">
                            {book.title}
                          </h3>
                          <p className="text-muted-foreground truncate text-xs sm:text-sm">
                            {book.author || "Unknown author"}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            {physical && (
                              <>
                                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                                  Physical
                                </span>
                                <span className="text-muted-foreground">
                                  {(book.availableCopies || 0) > 0
                                    ? "Available"
                                    : "Unavailable"}
                                </span>
                              </>
                            )}
                            {digital && (
                              <>
                                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                                  E-book
                                </span>
                                <span className="text-muted-foreground">
                                  Read Online
                                </span>
                              </>
                            )}
                            {!physical && !digital && (
                              <span className="text-muted-foreground">
                                No copies or eBook available
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          aria-hidden="true"
                          className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="space-y-2 py-10 text-center">
                <p className="text-foreground text-sm">No matching books.</p>
                <p className="text-muted-foreground text-xs">
                  Try another title, author, ISBN, or format.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <footer className="border-border text-muted-foreground flex shrink-0 items-center justify-between gap-3 border-t px-5 py-3 text-xs sm:px-6">
          <span>Esc to close</span>
          {!loading && !isError && (data?.totalPages || 0) > 1 && (
            <nav
              aria-label="Search result pages"
              className="flex items-center gap-2"
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label="Previous search page"
                className="text-foreground hover:bg-accent hover:text-accent-foreground size-8"
                disabled={page === 1 || isFetching}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span>
                Page {page} of {data?.totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Next search page"
                className="text-foreground hover:bg-accent hover:text-accent-foreground size-8"
                disabled={page >= (data?.totalPages || 1) || isFetching}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </nav>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
