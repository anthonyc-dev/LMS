import { useState } from "react"
import { Search, Star, Bookmark, ArrowRight, Grid2X2, List, SlidersHorizontal, Sparkles, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Kbd } from "@/components/ui/kbd"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"

// Asset imports
import bannerImg from "@/assets/dashboard/banner.png"
import book1Img from "@/assets/dashboard/book1.png"
import book2Img from "@/assets/dashboard/book2.png"
import bookDark1Img from "@/assets/dashboard/book_dark1.png"
import bookDark2Img from "@/assets/dashboard/book_dark2.png"

const CATEGORIES = ["All Books", "Fiction", "Science", "History", "Biography", "Mystery", "Technology", "Art"]

const BOOKS = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", rating: 4.8, category: "Fiction", image: book1Img, status: "Available", color: "bg-blue-50/50" },
  { id: 2, title: "Brief History of Time", author: "Stephen Hawking", rating: 4.9, category: "Science", image: bookDark1Img, status: "Borrowed", color: "bg-slate-900/90" },
  { id: 3, title: "A Promised Land", author: "Barack Obama", rating: 4.7, category: "Biography", image: book2Img, status: "Available", color: "bg-amber-50/50" },
  { id: 4, title: "The Silent Patient", author: "Alex Michaelides", rating: 4.5, category: "Mystery", image: bookDark2Img, status: "Reserved", color: "bg-rose-900/90" },
  { id: 5, title: "Steve Jobs", author: "Walter Isaacson", rating: 4.8, category: "Biography", image: book1Img, status: "Available", color: "bg-gray-100/50" },
  { id: 6, title: "Atomic Habits", author: "James Clear", rating: 5.0, category: "Technology", image: book2Img, status: "Available", color: "bg-emerald-50/50" },
  { id: 7, title: "Deep Work", author: "Cal Newport", rating: 4.6, category: "Technology", image: bookDark1Img, status: "Available", color: "bg-indigo-900/90" },
  { id: 8, title: "The Alchemist", author: "Paulo Coelho", rating: 4.7, category: "Fiction", image: bookDark2Img, status: "Available", color: "bg-orange-900/90" },
]

export function BrowseBooksPage() {
  const [activeCategory, setActiveCategory] = useState("All Books")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<readonly string[]>(["grid"])

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 md:space-y-8 px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Search & Header Section */}
      <section className="sticky top-0 z-30 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 space-y-3 md:space-y-4 pt-2 pb-4 px-3 sm:px-4 md:px-6 lg:px-8 bg-gray-100/90 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 md:p-3.5 rounded-lg bg-white/70 border border-white/80 shadow-sm">
          <div className="relative w-full lg:max-w-2xl lg:min-w-0">
            <InputGroup className="h-10 md:h-11 rounded-lg bg-white/80 border-slate-200/60 shadow-xs">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-slate-400" />
              </InputGroupAddon>
              <Input
                placeholder="Search books, authors, ISBN..."
                className="h-10 md:h-11 rounded-none border-0 bg-transparent shadow-none ring-0 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <InputGroupAddon align="inline-end" className="hidden lg:flex gap-1">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="flex flex-row flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto">
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="h-10 md:h-11 px-3 md:px-4 rounded-lg bg-white/80 border-slate-200/60 shadow-xs flex-1 sm:flex-none sm:w-[130px] md:w-[140px] font-medium text-slate-600 text-sm">
                <div className="flex items-center gap-2 truncate">
                  <Grid2X2 size={14} className="text-slate-400 shrink-0" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-lg border-slate-200 shadow-lg min-w-[160px]">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select defaultValue="popular">
              <SelectTrigger className="h-10 md:h-11 px-3 md:px-4 rounded-lg bg-white/80 border-slate-200/60 shadow-xs flex-1 sm:flex-none sm:w-[130px] md:w-[140px] font-medium text-slate-600 text-sm">
                <div className="flex items-center gap-2 truncate">
                  <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-lg border-slate-200 shadow-lg min-w-[160px]">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Recently Added</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <ToggleGroup value={viewMode} onValueChange={(v) => v && setViewMode(v)} variant="outline" className="bg-white/80 border-slate-200/60 shadow-xs rounded-lg">
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
      <section className="relative group overflow-hidden rounded-xl bg-slate-900 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200">
        <div className="max-w-xl space-y-3 md:space-y-4 z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-indigo-400 font-medium tracking-widest uppercase text-[9px] md:text-xs">
            <Sparkles size={12} />
            <span>Curated For You</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-[1.1]">
            Uncover the <span className="text-indigo-400">Classics</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-md font-medium">
            Discover a handpicked collection of timeless literature that shaped the world. From epic journeys to intimate portraits of the human soul.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
            <Button className="w-full sm:w-auto rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-5 md:px-8 py-2.5 md:py-3.5 text-xs sm:text-sm md:text-base font-bold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95">
              Explore Collection
            </Button>
            <Button variant="ghost" className="text-white hover:text-indigo-400 hover:bg-white/5 text-xs sm:text-sm md:text-base font-bold gap-1.5">
              Learn More <ArrowRight size={14} />
            </Button>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 md:mt-0 relative w-full md:w-[280px] aspect-square flex items-center justify-center max-w-[200px] sm:max-w-[240px] md:max-w-none">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[40px] md:blur-[60px] animate-pulse" />
          <div className="relative z-20 w-32 sm:w-40 md:w-52 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
            <div className="absolute inset-0 bg-black/40 blur-xl translate-y-8 scale-90" />
            <img
              src={bookDark1Img}
              alt="Featured Book"
              className="w-full h-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        <div className="absolute -top-16 -right-16 w-48 md:w-64 h-48 md:h-64 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-colors" />
        <div className="absolute -bottom-16 -left-16 w-32 md:w-48 h-32 md:h-48 bg-slate-800/50 rounded-full blur-xl" />
      </section>

      {/* Main Grid Section */}
      <section className="space-y-5 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">Recent Discovery</h2>
            <p className="text-slate-500 font-medium text-xs md:text-sm">Explore 12,450 books in our library</p>
          </div>
          <Button variant="ghost" className="w-fit text-indigo-600 font-bold hover:bg-indigo-50/50 text-sm px-0 sm:px-3">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {BOOKS.map((book) => (
            <div key={book.id} className="group relative flex flex-col bg-white rounded-lg p-3 md:p-4 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-500 border border-slate-50">
              {/* Book Cover Container */}
              <div className={`relative aspect-[3/4.2] rounded-lg overflow-hidden mb-3 md:mb-4 shadow-md transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02] ${book.color}`}>
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                />

                {/* Floating Actions on Cover */}
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0">
                  <Button size="icon-xs" className="bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white hover:text-indigo-600 shadow-md border border-white/20">
                    <Heart size={12} className="transition-transform group-active:scale-125" />
                  </Button>
                  <Button size="icon-xs" className="bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white hover:text-indigo-600 shadow-md border border-white/20">
                    <Bookmark size={12} />
                  </Button>
                </div>

                {/* Bottom Badge */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <Badge className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-full border-none font-bold text-[7px] md:text-[8px] uppercase tracking-[0.1em] backdrop-blur-xl shadow-md ${book.status === "Available" ? "bg-emerald-500/80 text-white" :
                    book.status === "Borrowed" ? "bg-rose-500/80 text-white" : "bg-amber-500/80 text-white"
                    }`}>
                    {book.status === "Available" && (
                      <span className="relative flex h-1 w-1.5 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1 w-1.5 bg-emerald-100"></span>
                      </span>
                    )}
                    {book.status}
                  </Badge>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Book Details */}
              <div className="space-y-2 md:space-y-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tight">
                      {book.title}
                    </h3>
                    <p className="text-slate-500 font-medium text-[10px] sm:text-xs md:text-sm truncate">{book.author}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md border border-white px-1.5 py-1 rounded-md shadow-sm shrink-0">
                    <Star size={9} className="md:size-[10px] fill-amber-400 text-amber-400" />
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-700">{book.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[7px] md:text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Category</span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-medium text-[8px] md:text-[10px] truncate max-w-[100px] sm:max-w-[120px]">
                      {book.category}
                    </Badge>
                  </div>
                  <Button className="rounded-lg bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-200 border-none font-bold px-3 md:px-5 py-1.5 md:py-2.5 text-[10px] sm:text-xs md:text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shrink-0">
                    Borrow
                  </Button>
                </div>
              </div>

              {/* Decorative hover elements */}
              <div className="absolute -bottom-1.5 -right-1.5 w-12 md:w-16 h-12 md:h-16 bg-indigo-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Load More Section */}
        <div className="flex flex-col items-center justify-center pt-4 md:pt-6 space-y-3 md:space-y-4">
          <p className="text-slate-400 font-medium text-xs md:text-sm">Showing 8 of 12,450 books</p>
          <Button variant="outline" className="h-10 md:h-12 px-5 md:px-8 rounded-lg border-2 border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all font-bold text-xs sm:text-sm md:text-base">
            Load More Books
          </Button>
        </div>
      </section>
    </div>
  )
}
