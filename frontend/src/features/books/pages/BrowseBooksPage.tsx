import { useState, useEffect } from "react";
import {
  Search,
  Bookmark,
  ArrowRight,
  Grid2X2,
  List,
  SlidersHorizontal,
  Sparkles,
  Heart,
  BookOpen,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group";

// Asset imports
import bookDark1Img from "@/assets/images/dashboard/book_dark1.png";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useBooks } from "@/features/books/hooks/useBooks";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const BOOK_COLORS = [
  "from-blue-100 to-indigo-50",
  "from-slate-800 to-slate-900",
  "from-amber-50 to-orange-50",
  "from-rose-800 to-rose-900",
  "from-gray-50 to-slate-100",
  "from-emerald-50 to-teal-50",
  "from-indigo-800 to-indigo-900",
  "from-orange-800 to-orange-900",
];

const getBookColor = (id: string) => {
  const sum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BOOK_COLORS[sum % BOOK_COLORS.length];
};

export function BrowseBooksPage() {
  usePageTitle("Browse Books");
  const [activeCategory, setActiveCategory] = useState("All Books");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<readonly string[]>(["grid"]);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data, isLoading } = useBooks({
    page: 1,
    limit: 100, // Fetch up to 100 for browsing
    search: debouncedSearch,
  });

  const books = data?.data || [];
  const totalBooks = data?.total || 0;

  // Extract unique categories from fetched books
  const CATEGORIES = [
    "All Books",
    ...Array.from(new Set(books.map((b) => b.category?.name).filter((n): n is string => !!n))),
  ];

  const displayBooks =
    activeCategory === "All Books"
      ? books
      : books.filter((b) => b.category?.name === activeCategory);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8">
      {/* ── Search Bar ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md lg:max-w-lg">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search books, authors, ISBN…"
              className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-sm shadow-sm transition-shadow focus:shadow-md focus:ring-2 focus:ring-indigo-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Select defaultValue="popular">
              <SelectTrigger className="h-11 w-[140px] flex-1 rounded-xl border-slate-200 bg-white text-sm shadow-sm sm:w-[150px] sm:flex-none">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-slate-400" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Recently Added</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <ToggleGroup
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v)}
              variant="outline"
              className="h-11 rounded-xl border-slate-200 bg-white shadow-sm"
            >
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="h-full rounded-l-xl px-3"
              >
                <Grid2X2 size={16} />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                className="h-full rounded-r-xl px-3"
              >
                <List size={16} />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                activeCategory === cat
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured Hero ──────────────────────────────────────────── */}
      <section className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 sm:p-8 md:p-10">
        <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:gap-12">
          {/* Text Content */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400">
              <Sparkles size={12} />
              Curated For You
            </div>
            <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
              Uncover the{" "}
              <span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Classics
              </span>
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-slate-400 md:text-base">
              Discover a handpicked collection of timeless literature that
              shaped the world. From epic journeys to intimate portraits of the
              human soul.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row md:items-start">
              <Button className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]">
                <BookOpen size={16} className="mr-2" />
                Explore Collection
              </Button>
              <Button
                variant="ghost"
                className="gap-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Learn More <ArrowRight size={14} />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-6 pt-2 md:justify-start">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <BookOpen size={14} className="text-indigo-400" />
                <span>
                  <strong className="text-white">12,450</strong> Books
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <TrendingUp size={14} className="text-emerald-400" />
                <span>
                  <strong className="text-white">98%</strong> Satisfaction
                </span>
              </div>
            </div>
          </div>

          {/* Book Visual */}
          <div className="relative flex w-48 shrink-0 items-center justify-center sm:w-56 md:w-64">
            <div className="absolute inset-0 scale-150 rounded-full bg-indigo-500/15 blur-3xl transition-all duration-700 group-hover:bg-indigo-500/25" />
            <div className="relative transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:scale-105 group-hover:rotate-2">
              <div className="absolute inset-0 translate-y-6 scale-[0.85] rounded-xl bg-black/30 blur-2xl" />
              <img
                src={bookDark1Img}
                alt="Featured Book"
                className="relative w-full drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 bg-linear-to-l from-indigo-500/5 to-transparent" />
      </section>

      {/* ── Book Grid ──────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Recent Discovery
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {displayBooks.length} books found
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View All
            <ChevronDown size={14} className="ml-1 -rotate-90" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-3"
                >
                  <Skeleton className="aspect-3/4 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            : displayBooks.map((book) => {
                const coverColor = getBookColor(book.id);

                return (
                  <article
                    key={book.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
                  >
                    {/* Book Cover */}
                    <div
                      className={`relative aspect-3/4 overflow-hidden bg-linear-to-br ${coverColor}`}
                    >
                      <img
                        src={book.coverImage || bookDark1Img}
                        alt={book.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 flex items-start justify-end bg-linear-to-t from-black/50 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="flex flex-col gap-2">
                          <button className="flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition-colors hover:bg-white hover:text-rose-500">
                            <Heart size={14} />
                          </button>
                          <button className="flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition-colors hover:bg-white hover:text-indigo-600">
                            <Bookmark size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute bottom-3 left-3">
                        <Badge
                          className={`rounded-full border-0 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-lg backdrop-blur-md ${
                            book?.status === "AVAILABLE"
                              ? "bg-emerald-500/90 text-white"
                              : book?.status === "UNAVAILABLE"
                                ? "bg-rose-500/90 text-white"
                                : "bg-amber-500/90 text-white"
                          }`}
                        >
                          {book?.status === "AVAILABLE" && (
                            <span className="relative mr-1.5 flex size-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/75" />
                              <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                            </span>
                          )}
                          {book?.availabilityLabel}
                        </Badge>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
                      <div className="space-y-1.5">
                        <h3 className="line-clamp-1 text-sm font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-base">
                          {book.title}
                        </h3>
                        <p className="truncate text-xs text-slate-500 sm:text-sm">
                          {book.author}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center">
                        <Badge
                          variant="secondary"
                          className="rounded-md bg-slate-100 text-[10px] font-medium text-slate-500 sm:text-xs"
                        >
                          {book.category?.name || "Uncategorized"}
                        </Badge>
                      </div>

                      <Button
                        className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-200 active:scale-[0.98] sm:text-sm"
                        onClick={() =>
                          navigate(`/student/books/details/${book.id}`)
                        }
                      >
                        View Book
                      </Button>
                    </div>
                  </article>
                );
              })}
        </div>

        {/* Load More */}
        <div className="flex flex-col items-center gap-3 pt-6">
          <p className="text-xs text-slate-400 sm:text-sm">
            Showing {displayBooks.length} of {totalBooks} books
          </p>
          <Button
            variant="outline"
            className="h-11 rounded-xl border-2 border-slate-200 px-8 text-sm font-semibold text-slate-600 transition-all hover:border-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-600"
          >
            Load More Books
          </Button>
        </div>
      </section>
    </div>
  );
}
