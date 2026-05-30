import { useState } from "react";
import {
  Search,
  Star,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Asset imports
import book1Img from "@/assets/dashboard/book1.png";
import book2Img from "@/assets/dashboard/book2.png";
import bookDark1Img from "@/assets/dashboard/book_dark1.png";
import bookDark2Img from "@/assets/dashboard/book_dark2.png";
import { usePageTitle } from "@/hooks/usePageTitle";

const CATEGORIES = [
  "All Books",
  "Fiction",
  "Science",
  "History",
  "Biography",
  "Mystery",
  "Technology",
  "Art",
];

const BOOKS = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    rating: 4.8,
    reviews: 2431,
    category: "Fiction",
    image: book1Img,
    status: "Available",
    color: "from-blue-100 to-indigo-50",
  },
  {
    id: 2,
    title: "Brief History of Time",
    author: "Stephen Hawking",
    rating: 4.9,
    reviews: 3892,
    category: "Science",
    image: bookDark1Img,
    status: "Borrowed",
    color: "from-slate-800 to-slate-900",
  },
  {
    id: 3,
    title: "A Promised Land",
    author: "Barack Obama",
    rating: 4.7,
    reviews: 1854,
    category: "Biography",
    image: book2Img,
    status: "Available",
    color: "from-amber-50 to-orange-50",
  },
  {
    id: 4,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    rating: 4.5,
    reviews: 4201,
    category: "Mystery",
    image: bookDark2Img,
    status: "Reserved",
    color: "from-rose-800 to-rose-900",
  },
  {
    id: 5,
    title: "Steve Jobs",
    author: "Walter Isaacson",
    rating: 4.8,
    reviews: 2109,
    category: "Biography",
    image: book1Img,
    status: "Available",
    color: "from-gray-50 to-slate-100",
  },
  {
    id: 6,
    title: "Atomic Habits",
    author: "James Clear",
    rating: 5.0,
    reviews: 8743,
    category: "Technology",
    image: book2Img,
    status: "Available",
    color: "from-emerald-50 to-teal-50",
  },
  {
    id: 7,
    title: "Deep Work",
    author: "Cal Newport",
    rating: 4.6,
    reviews: 1567,
    category: "Technology",
    image: bookDark1Img,
    status: "Available",
    color: "from-indigo-800 to-indigo-900",
  },
  {
    id: 8,
    title: "The Alchemist",
    author: "Paulo Coelho",
    rating: 4.7,
    reviews: 6231,
    category: "Fiction",
    image: bookDark2Img,
    status: "Available",
    color: "from-orange-800 to-orange-900",
  },
];

export function BrowseBooksPage() {
  usePageTitle("Browse Books");
  const [activeCategory, setActiveCategory] = useState("All Books");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<readonly string[]>(["grid"]);

  const filteredBooks =
    activeCategory === "All Books"
      ? BOOKS
      : BOOKS.filter((b) => b.category === activeCategory);

  const displayBooks = searchQuery
    ? filteredBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filteredBooks;

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
          {displayBooks.map((book) => (
            <article
              key={book.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
            >
              {/* Book Cover */}
              <div
                className={`relative aspect-3/4 overflow-hidden bg-linear-to-br ${book.color}`}
              >
                <img
                  src={book.image}
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
                      book.status === "Available"
                        ? "bg-emerald-500/90 text-white"
                        : book.status === "Borrowed"
                          ? "bg-rose-500/90 text-white"
                          : "bg-amber-500/90 text-white"
                    }`}
                  >
                    {book.status === "Available" && (
                      <span className="relative mr-1.5 flex size-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/75" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                      </span>
                    )}
                    {book.status}
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

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5">
                      <Star
                        size={11}
                        className="fill-amber-400 text-amber-400"
                      />
                      <span className="text-[11px] font-bold text-amber-700">
                        {book.rating}
                      </span>
                    </div>
                    <span className="hidden text-[10px] text-slate-400 sm:inline">
                      ({book.reviews.toLocaleString()})
                    </span>
                  </div>

                  <Badge
                    variant="secondary"
                    className="rounded-md bg-slate-100 text-[10px] font-medium text-slate-500 sm:text-xs"
                  >
                    {book.category}
                  </Badge>
                </div>

                <Button
                  className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-200 active:scale-[0.98] sm:text-sm"
                  disabled={book.status === "Borrowed"}
                >
                  {book.status === "Borrowed" ? "Unavailable" : "Borrow Now"}
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="flex flex-col items-center gap-3 pt-6">
          <p className="text-xs text-slate-400 sm:text-sm">
            Showing {displayBooks.length} of 12,450 books
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
