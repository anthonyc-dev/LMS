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

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 md:space-y-12 ">
      {/* Search & Header Section */}
      <section className="sticky top-0 z-30 space-y-4 md:space-y-6 pt-2 pb-6 bg-gray-100/90 backdrop-blur-md">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 md:gap-6 p-3 md:p-4 rounded-2xl md:rounded-[2rem] bg-white/70 border border-white shadow-xl shadow-indigo-100/30">
          <div className="relative w-full xl:max-w-2xl group">
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 md:h-5 md:w-5 text-slate-400 group-focus-within:text-indigo-500 transition-all duration-300" />
            <Input
              placeholder="Search books, authors, ISBN..."
              className="pl-12 md:pl-14 h-12 md:h-16 bg-white/50 border-2 border-transparent focus-visible:border-indigo-100 focus-visible:bg-white rounded-xl md:rounded-2xl text-base md:text-lg shadow-inner-sm transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
              <span className="text-[10px] font-black text-slate-400">⌘</span>
              <span className="text-[10px] font-black text-slate-400">K</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full xl:w-auto">
            <Select defaultValue="popular">
              <SelectTrigger className="h-12 md:h-16 px-6 md:px-8 rounded-xl md:rounded-2xl bg-white/50 border-none shadow-sm w-full sm:min-w-[180px] font-bold text-slate-600 hover:bg-white transition-all text-sm md:text-base">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal size={16} className="text-indigo-500" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl md:rounded-2xl border-none shadow-2xl">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Recently Added</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex bg-white/50 p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-sm border border-white/50 w-full sm:w-auto justify-center">
              <Button variant="ghost" size="icon" className="flex-1 sm:flex-none w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white text-indigo-600 shadow-sm transition-all hover:scale-105">
                <Grid2X2 size={20} className="md:size-[22px]" />
              </Button>
              <Button variant="ghost" size="icon" className="flex-1 sm:flex-none w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl text-slate-400 hover:text-slate-600 transition-all">
                <List size={20} className="md:size-[22px]" />
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="relative group">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar mask-fade-right">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black whitespace-nowrap transition-all duration-500 group/btn ${activeCategory === cat
                  ? "text-white scale-105"
                  : "text-slate-500 hover:text-slate-900 bg-white/40 hover:bg-white border border-white/50"
                  }`}
              >
                {activeCategory === cat && (
                  <div className="absolute inset-0 bg-indigo-600 rounded-xl md:rounded-2xl shadow-xl shadow-indigo-200 animate-in fade-in zoom-in duration-300" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {cat === "All Books" && <Grid2X2 size={14} className="md:size-4" />}
                  {cat === "Fiction" && <Sparkles size={14} className="md:size-4" />}
                  {cat}
                </span>
              </button>
            ))}
          </div>
          <div className="absolute top-0 right-0 h-full w-16 md:w-20 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Featured Hero Card */}
      <section className="relative group overflow-hidden rounded-2xl md:rounded-[3rem] bg-slate-900 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between transition-all duration-500 hover:shadow-3xl hover:shadow-slate-200">
        <div className="max-w-2xl space-y-6 md:space-y-8 z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 font-bold tracking-widest uppercase text-[10px] md:text-sm">
            <Sparkles size={16} className="md:size-[18px]" />
            <span>Curated For You</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Uncover the <span className="text-indigo-400">Classics</span>
          </h1>
          <p className="text-slate-400 text-base md:text-xl leading-relaxed max-w-lg font-medium">
            Discover a handpicked collection of timeless literature that shaped the world. From epic journeys to intimate portraits of the human soul.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button className="w-full sm:w-auto rounded-full bg-indigo-600 hover:bg-indigo-500 text-white px-8 md:px-10 py-6 md:py-8 text-lg md:text-xl font-bold shadow-2xl shadow-indigo-500/20 transition-all hover:-translate-y-1 hover:scale-105 active:scale-95">
              Explore Collection
            </Button>
            <Button variant="ghost" className="text-white hover:text-indigo-400 hover:bg-white/5 text-base md:text-lg font-bold gap-2">
              Learn More <ArrowRight size={18} className="md:size-5" />
            </Button>
          </div>
        </div>

        <div className="mt-12 md:mt-0 relative w-full md:w-[450px] aspect-square flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[60px] md:blur-[100px] animate-pulse" />
          <div className="relative z-20 w-48 sm:w-64 md:w-80 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
            <div className="absolute inset-0 bg-black/40 blur-2xl translate-y-10 scale-90" />
            <img
              src={bookDark1Img}
              alt="Featured Book"
              className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        <div className="absolute -top-24 -right-24 w-64 md:w-96 h-64 md:h-96 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-colors" />
        <div className="absolute -bottom-24 -left-24 w-48 md:w-64 h-48 md:h-64 bg-slate-800/50 rounded-full blur-2xl" />
      </section>

      {/* Main Grid Section */}
      <section className="space-y-8 md:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Recent Discovery</h2>
            <p className="text-slate-500 font-medium text-sm md:text-base">Explore 12,450 books in our library</p>
          </div>
          <Button variant="ghost" className="w-fit text-indigo-600 font-bold hover:bg-indigo-50/50 text-sm md:text-base px-0 sm:px-4">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
          {BOOKS.map((book) => (
            <div key={book.id} className="group relative flex flex-col bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 border border-slate-50">
              {/* Book Cover Container */}
              <div className={`relative aspect-[3/4.2] rounded-xl md:rounded-3xl overflow-hidden mb-4 md:mb-6 shadow-xl transition-all duration-500 group-hover:-translate-y-4 group-hover:scale-[1.02] ${book.color}`}>
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                />

                {/* Floating Actions on Cover */}
                <div className="absolute top-3 md:top-4 right-3 md:right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  <Button size="icon" className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white hover:text-indigo-600 shadow-lg border border-white/20">
                    <Heart size={16} className="md:size-[18px] transition-transform group-active:scale-125" />
                  </Button>
                  <Button size="icon" className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white hover:text-indigo-600 shadow-lg border border-white/20">
                    <Bookmark size={16} className="md:size-[18px]" />
                  </Button>
                </div>

                {/* Bottom Badge */}
                <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 flex items-center gap-2">
                  <Badge className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full border-none font-black text-[9px] md:text-[10px] uppercase tracking-[0.1em] backdrop-blur-xl shadow-lg ${book.status === "Available" ? "bg-emerald-500/80 text-white" :
                    book.status === "Borrowed" ? "bg-rose-500/80 text-white" : "bg-amber-500/80 text-white"
                    }`}>
                    {book.status === "Available" && (
                      <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2 mr-1.5 md:mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-100"></span>
                      </span>
                    )}
                    {book.status}
                  </Badge>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Book Details */}
              <div className="space-y-4 md:space-y-5 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 md:space-y-1.5">
                    <h3 className="font-black text-xl md:text-2xl text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tight">
                      {book.title}
                    </h3>
                    <p className="text-slate-500 font-bold text-sm md:text-base">{book.author}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md border border-white px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg md:rounded-xl shadow-sm">
                    <Star size={12} className="md:size-[14px] fill-amber-400 text-amber-400" />
                    <span className="text-[10px] md:text-xs font-black text-slate-700">{book.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 md:pt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5 md:mb-1">Category</span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] md:text-xs">
                      {book.category}
                    </Badge>
                  </div>
                  <Button className="rounded-xl md:rounded-2xl bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-200 border-none font-black px-6 md:px-8 py-5 md:py-6 text-sm md:text-base transition-all duration-300 hover:-translate-y-1 active:scale-95">
                    Borrow
                  </Button>
                </div>
              </div>

              {/* Decorative hover elements */}
              <div className="absolute -bottom-2 -right-2 w-16 md:w-24 h-16 md:h-24 bg-indigo-500/5 rounded-full blur-xl md:blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Load More Section */}
        <div className="flex flex-col items-center justify-center pt-6 md:pt-10 space-y-4 md:space-y-6">
          <p className="text-slate-400 font-bold text-xs md:text-sm">Showing 8 of 12,450 books</p>
          <Button variant="outline" className="h-14 md:h-16 px-8 md:px-12 rounded-xl md:rounded-2xl border-2 border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all font-black text-base md:text-lg">
            Load More Books
          </Button>
        </div>
      </section>
    </div>
  )
}
