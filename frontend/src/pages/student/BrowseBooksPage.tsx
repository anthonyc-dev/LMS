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
import { Kbd } from "@/components/ui/kbd";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";

// Asset imports
import book1Img from "@/assets/dashboard/book1.png";
import book2Img from "@/assets/dashboard/book2.png";
import bookDark1Img from "@/assets/dashboard/book_dark1.png";
import bookDark2Img from "@/assets/dashboard/book_dark2.png";

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
    category: "Fiction",
    image: book1Img,
    status: "Available",
    color: "bg-blue-50/50",
  },
  {
    id: 2,
    title: "Brief History of Time",
    author: "Stephen Hawking",
    rating: 4.9,
    category: "Science",
    image: bookDark1Img,
    status: "Borrowed",
    color: "bg-slate-900/90",
  },
  {
    id: 3,
    title: "A Promised Land",
    author: "Barack Obama",
    rating: 4.7,
    category: "Biography",
    image: book2Img,
    status: "Available",
    color: "bg-amber-50/50",
  },
  {
    id: 4,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    rating: 4.5,
    category: "Mystery",
    image: bookDark2Img,
    status: "Reserved",
    color: "bg-rose-900/90",
  },
  {
    id: 5,
    title: "Steve Jobs",
    author: "Walter Isaacson",
    rating: 4.8,
    category: "Biography",
    image: book1Img,
    status: "Available",
    color: "bg-gray-100/50",
  },
  {
    id: 6,
    title: "Atomic Habits",
    author: "James Clear",
    rating: 5.0,
    category: "Technology",
    image: book2Img,
    status: "Available",
    color: "bg-emerald-50/50",
  },
  {
    id: 7,
    title: "Deep Work",
    author: "Cal Newport",
    rating: 4.6,
    category: "Technology",
    image: bookDark1Img,
    status: "Available",
    color: "bg-indigo-900/90",
  },
  {
    id: 8,
    title: "The Alchemist",
    author: "Paulo Coelho",
    rating: 4.7,
    category: "Fiction",
    image: bookDark2Img,
    status: "Available",
    color: "bg-orange-900/90",
  },
];

export function BrowseBooksPage() {
  const [activeCategory, setActiveCategory] = useState("All Books");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<readonly string[]>(["grid"]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 md:space-y-8">
      {/* Search & Header Section */}
      <section className="sticky top-0 z-30 -mx-3 space-y-3 bg-gray-100/90 px-3 pt-2 pb-4 backdrop-blur-md sm:-mx-4 sm:px-4 md:-mx-6 md:space-y-4 md:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col items-stretch justify-between gap-3 rounded-lg border border-white/80 bg-white/70 p-3 shadow-sm md:p-3.5 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-2xl lg:min-w-0">
            <InputGroup className="h-10 rounded-lg border-slate-200/60 bg-white/80 shadow-xs md:h-11">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-slate-400" />
              </InputGroupAddon>
              <Input
                placeholder="Search books, authors, ISBN..."
                className="h-10 rounded-none border-0 bg-transparent text-sm shadow-none ring-0 md:h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <InputGroupAddon
                align="inline-end"
                className="hidden gap-1 lg:flex"
              >
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="flex w-full flex-row flex-wrap items-center gap-2 md:gap-3 lg:w-auto">
            <Select
              value={activeCategory}
              onValueChange={(v) => {
                if (v !== null) setActiveCategory(v);
              }}
            >
              <SelectTrigger className="h-10 flex-1 rounded-lg border-slate-200/60 bg-white/80 px-3 text-sm font-medium text-slate-600 shadow-xs sm:w-[130px] sm:flex-none md:h-11 md:w-[140px] md:px-4">
                <div className="flex items-center gap-2 truncate">
                  <Grid2X2 size={14} className="shrink-0 text-slate-400" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="min-w-[160px] rounded-lg border-slate-200 shadow-lg">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select defaultValue="popular">
              <SelectTrigger className="h-10 flex-1 rounded-lg border-slate-200/60 bg-white/80 px-3 text-sm font-medium text-slate-600 shadow-xs sm:w-[130px] sm:flex-none md:h-11 md:w-[140px] md:px-4">
                <div className="flex items-center gap-2 truncate">
                  <SlidersHorizontal
                    size={14}
                    className="shrink-0 text-slate-400"
                  />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent className="min-w-[160px] rounded-lg border-slate-200 shadow-lg">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Recently Added</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <ToggleGroup
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v)}
              variant="outline"
              className="rounded-lg border-slate-200/60 bg-white/80 shadow-xs"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <Grid2X2 size={16} />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List size={16} />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </section>

      {/* Featured Hero Card */}
      <section className="group relative flex flex-col items-center justify-between overflow-hidden rounded-xl bg-slate-900 p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200 sm:p-6 md:flex-row md:p-8">
        <div className="z-10 max-w-xl space-y-3 text-center md:space-y-4 md:text-left">
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-medium tracking-widest text-indigo-400 uppercase md:justify-start md:text-xs">
            <Sparkles size={12} />
            <span>Curated For You</span>
          </div>
          <h1 className="text-xl leading-[1.1] font-black tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
            Uncover the <span className="text-indigo-400">Classics</span>
          </h1>
          <p className="max-w-md text-xs leading-relaxed font-medium text-slate-400 sm:text-sm md:text-base">
            Discover a handpicked collection of timeless literature that shaped
            the world. From epic journeys to intimate portraits of the human
            soul.
          </p>
          <div className="flex flex-col items-center gap-2 sm:flex-row md:gap-3">
            <Button className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-indigo-500 active:scale-95 sm:w-auto sm:text-sm md:px-8 md:py-3.5 md:text-base">
              Explore Collection
            </Button>
            <Button
              variant="ghost"
              className="gap-1.5 text-xs font-bold text-white hover:bg-white/5 hover:text-indigo-400 sm:text-sm md:text-base"
            >
              Learn More <ArrowRight size={14} />
            </Button>
          </div>
        </div>

        <div className="relative mt-6 flex aspect-square w-full max-w-[200px] items-center justify-center sm:mt-8 sm:max-w-[240px] md:mt-0 md:w-[280px] md:max-w-none">
          <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-500/20 blur-2xl md:blur-[60px]" />
          <div className="relative z-20 w-32 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 sm:w-40 md:w-52">
            <div className="absolute inset-0 translate-y-8 scale-90 bg-black/40 blur-xl" />
            <img
              src={bookDark1Img}
              alt="Featured Book"
              className="h-full w-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-600/10 blur-2xl transition-colors group-hover:bg-indigo-600/20 md:h-64 md:w-64" />
        <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-slate-800/50 blur-xl md:h-48 md:w-48" />
      </section>

      {/* Main Grid Section */}
      <section className="space-y-5 md:space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl md:text-2xl">
              Recent Discovery
            </h2>
            <p className="text-xs font-medium text-slate-500 md:text-sm">
              Explore 12,450 books in our library
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-fit px-0 text-sm font-bold text-indigo-600 hover:bg-indigo-50/50 sm:px-3"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {BOOKS.map((book) => (
            <div
              key={book.id}
              className="group relative flex flex-col rounded-lg border border-slate-50 bg-white p-3 shadow-sm transition-all duration-500 hover:shadow-lg hover:shadow-slate-200/50 md:p-4"
            >
              {/* Book Cover Container */}
              <div
                className={`relative mb-3 aspect-[3/4.2] overflow-hidden rounded-lg shadow-md transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02] md:mb-4 ${book.color}`}
              >
                <img
                  src={book.image}
                  alt={book.title}
                  className="h-full w-full object-cover opacity-90 mix-blend-multiply transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
                />

                {/* Floating Actions on Cover */}
                <div className="absolute top-2 right-2 flex translate-x-3 flex-col gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  <Button
                    size="icon-xs"
                    className="border border-white/20 bg-white/90 text-slate-900 shadow-md backdrop-blur-md hover:bg-white hover:text-indigo-600"
                  >
                    <Heart
                      size={12}
                      className="transition-transform group-active:scale-125"
                    />
                  </Button>
                  <Button
                    size="icon-xs"
                    className="border border-white/20 bg-white/90 text-slate-900 shadow-md backdrop-blur-md hover:bg-white hover:text-indigo-600"
                  >
                    <Bookmark size={12} />
                  </Button>
                </div>

                {/* Bottom Badge */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <Badge
                    className={`rounded-full border-none px-2 py-0.5 text-[7px] font-bold tracking-widest uppercase shadow-md backdrop-blur-xl md:px-2.5 md:py-1 md:text-[8px] ${
                      book.status === "Available"
                        ? "bg-emerald-500/80 text-white"
                        : book.status === "Borrowed"
                          ? "bg-rose-500/80 text-white"
                          : "bg-amber-500/80 text-white"
                    }`}
                  >
                    {book.status === "Available" && (
                      <span className="relative mr-1 flex h-1 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex h-1 w-1.5 rounded-full bg-emerald-100"></span>
                      </span>
                    )}
                    {book.status}
                  </Badge>
                </div>

                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              {/* Book Details */}
              <div className="flex-1 space-y-2 md:space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="line-clamp-1 text-xs leading-tight font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-sm md:text-base">
                      {book.title}
                    </h3>
                    <p className="truncate text-[10px] font-medium text-slate-500 sm:text-xs md:text-sm">
                      {book.author}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-md border border-white bg-white/80 px-1.5 py-1 shadow-sm backdrop-blur-md">
                    <Star
                      size={9}
                      className="fill-amber-400 text-amber-400 md:size-[10px]"
                    />
                    <span className="text-[8px] font-bold text-slate-700 md:text-[9px]">
                      {book.rating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex min-w-0 flex-col">
                    <span className="mb-0.5 text-[7px] font-bold tracking-widest text-slate-300 uppercase md:text-[8px]">
                      Category
                    </span>
                    <Badge
                      variant="secondary"
                      className="max-w-[100px] truncate border-none bg-slate-100 text-[8px] font-medium text-slate-600 sm:max-w-[120px] md:text-[10px]"
                    >
                      {book.category}
                    </Badge>
                  </div>
                  <Button className="shrink-0 rounded-lg border-none bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-200 active:scale-95 sm:text-xs md:px-5 md:py-2.5 md:text-sm">
                    Borrow
                  </Button>
                </div>
              </div>

              {/* Decorative hover elements */}
              <div className="absolute -right-1.5 -bottom-1.5 h-12 w-12 rounded-full bg-indigo-500/5 opacity-0 blur-xl transition-opacity group-hover:opacity-100 md:h-16 md:w-16" />
            </div>
          ))}
        </div>

        {/* Load More Section */}
        <div className="flex flex-col items-center justify-center space-y-3 pt-4 md:space-y-4 md:pt-6">
          <p className="text-xs font-medium text-slate-400 md:text-sm">
            Showing 8 of 12,450 books
          </p>
          <Button
            variant="outline"
            className="h-10 rounded-lg border-2 border-slate-200 px-5 text-xs font-bold text-slate-600 transition-all hover:border-indigo-600 hover:bg-indigo-50/30 hover:text-indigo-600 sm:text-sm md:h-12 md:px-8 md:text-base"
          >
            Load More Books
          </Button>
        </div>
      </section>
    </div>
  );
}
