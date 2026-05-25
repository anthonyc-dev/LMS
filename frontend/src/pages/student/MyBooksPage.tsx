
import { BookOpen, Clock, Calendar, Bookmark, Star, ArrowRight, Library, RotateCcw, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import book1Img from "@/assets/dashboard/book1.png"
import book2Img from "@/assets/dashboard/book2.png"

const MY_BOOKS = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    progress: 68,
    dueDate: "May 15, 2026",
    status: "Reading",
    image: book1Img,
    category: "Classic Literature",
    color: "bg-amber-50"
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    progress: 32,
    dueDate: "May 20, 2026",
    status: "Reading",
    image: book2Img,
    category: "Self-Improvement",
    color: "bg-emerald-50"
  },
]

export function MyBooksPage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-10 md:space-y-16 ">
      {/* Welcome Section */}
      <section className="space-y-4 px-2">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-none">
          Hello, <span className="text-emerald-600">Anthony</span>.
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 max-w-3xl leading-relaxed">
          You have <span className="font-bold text-slate-900 underline decoration-emerald-200 decoration-4">2 books</span> currently in progress.
          Your next deadline is in <span className="font-bold text-slate-900 underline decoration-amber-200 decoration-4">4 days</span>.
        </p>
      </section>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="border-none shadow-sm bg-slate-900 text-white rounded-2xl md:rounded-[2rem] overflow-hidden group">
          <CardContent className="p-8 md:p-10 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
              <div className="p-3 md:p-4 bg-white/10 rounded-xl">
                <BookOpen size={28} className="md:size-8" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black px-4 py-2 text-[10px] md:text-xs">ACTIVE</Badge>
            </div>
            <div className="space-y-1 md:space-y-2">
              <p className="text-5xl md:text-6xl font-black tracking-tighter">02</p>
              <p className="text-base md:text-lg font-bold text-slate-400 uppercase tracking-widest">Books Reading</p>
            </div>
            <Button className="w-full h-14 md:h-16 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-black text-base md:text-lg gap-3 transition-all group-hover:scale-[1.02]">
              Continue Reading <ArrowRight size={20} />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-stone-100 rounded-2xl md:rounded-[2rem] overflow-hidden group">
          <CardContent className="p-8 md:p-10 space-y-6 md:space-y-8 text-slate-900">
            <div className="flex items-center justify-between">
              <div className="p-3 md:p-4 bg-white rounded-xl shadow-sm">
                <Clock size={28} className="md:size-8 text-amber-600" />
              </div>
              <Badge className="bg-amber-600/10 text-amber-600 border-none font-black px-4 py-2 text-[10px] md:text-xs">PENDING</Badge>
            </div>
            <div className="space-y-1 md:space-y-2">
              <p className="text-5xl md:text-6xl font-black tracking-tighter">01</p>
              <p className="text-base md:text-lg font-bold text-slate-500 uppercase tracking-widest">Reservation</p>
            </div>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed line-clamp-2">
              "The Alchemist" is being processed and will be ready for pickup by tomorrow afternoon.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] overflow-hidden group md:col-span-2 lg:col-span-1">
          <CardContent className="p-8 md:p-10 space-y-6 md:space-y-8 text-slate-900">
            <div className="flex items-center justify-between">
              <div className="p-3 md:p-4 bg-emerald-50 rounded-xl">
                <Library size={28} className="md:size-8 text-emerald-600" />
              </div>
              <Badge className="bg-slate-100 text-slate-600 border-none font-black px-4 py-2 text-[10px] md:text-xs">HISTORY</Badge>
            </div>
            <div className="space-y-1 md:space-y-2">
              <p className="text-5xl md:text-6xl font-black tracking-tighter">48</p>
              <p className="text-base md:text-lg font-bold text-slate-500 uppercase tracking-widest">Books Finished</p>
            </div>
            <div className="flex -space-x-3 md:-space-x-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="inline-block h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl ring-2 md:ring-4 ring-white bg-slate-200" />
              ))}
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl ring-2 md:ring-4 ring-white bg-slate-900 text-white text-[10px] md:text-sm font-bold">
                +44
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Reading Section */}
      <section className="space-y-8 md:space-y-10">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Active Reading</h2>
          <Button variant="ghost" className="text-emerald-600 font-bold hover:bg-emerald-50 text-sm md:text-lg gap-2">
            View All <ArrowRight size={18} className="md:size-5" />
          </Button>
        </div>

        <div className="space-y-6 md:space-y-8">
          {MY_BOOKS.map((book) => (
            <div key={book.id} className="group relative bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] p-6 md:p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col xl:flex-row items-center gap-8 md:gap-12">
              {/* Large Book Cover */}
              <div className={`relative w-40 sm:w-48 h-56 sm:h-64 shrink-0 rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2 ${book.color}`}>
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-all"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <Button size="icon" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-slate-900 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                  <Play className="fill-current ml-1" />
                </Button>
              </div>

              {/* Book Details & Progress */}
              <div className="flex-1 w-full space-y-6 md:space-y-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold px-3 py-1 text-[10px] md:text-xs">
                        {book.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={12} className="md:size-[14px] fill-current" />
                        <span className="text-xs md:text-sm font-black">4.9</span>
                      </div>
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-lg md:text-xl font-bold text-slate-500">by {book.author}</p>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                      <Calendar size={14} />
                      Due on {book.dueDate}
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-600 border-none font-black px-4 py-2 w-fit text-[10px] md:text-xs">
                      4 DAYS LEFT
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-base md:text-lg font-black text-slate-900">Reading Progress</p>
                    <p className="text-base md:text-lg font-black text-emerald-600">{book.progress}%</p>
                  </div>
                  <Progress value={book.progress} className="h-3 md:h-4" />
                  <p className="text-sm md:text-base text-slate-500 font-medium">You've completed <span className="text-slate-900 font-bold">182 of 240</span> pages. Keep it up!</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-6 md:pt-8 border-t border-slate-50">
                  <Button className="flex-1 sm:flex-none h-12 md:h-14 px-6 md:px-10 rounded-xl bg-slate-900 text-white hover:bg-emerald-600 font-black text-sm md:text-base transition-all">
                    Continue Reading
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none h-12 md:h-14 px-6 md:px-10 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-slate-900 font-black text-sm md:text-base transition-all gap-2">
                    <RotateCcw size={16} /> Renew Loan
                  </Button>
                  <Button variant="ghost" size="icon" className="h-12 w-12 md:h-14 md:w-14 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                    <Bookmark size={20} className="md:size-6" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Reading */}
      <section className="bg-stone-100 rounded-2xl md:rounded-[2.5rem] p-8 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
        <div className="space-y-6 md:space-y-8 z-10 text-center md:text-left">
          <Badge className="bg-white text-slate-900 border-none font-black px-4 py-2 text-xs md:text-sm">RECOMMENDED</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Discover your <br className="hidden md:block" /> next <span className="text-emerald-600 italic font-serif">Masterpiece</span>.
          </h2>
          <p className="text-base md:text-xl font-medium text-slate-600 max-w-xl leading-relaxed">
            Based on your interest in Classic Literature and Productivity, we think you'll love these hand-picked titles.
          </p>
          <Button className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-black text-base md:text-lg transition-all">
            Browse Recommendations
          </Button>
        </div>

        <div className="relative flex -space-x-12 md:-space-x-16 translate-x-4 md:translate-x-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`w-36 sm:w-40 md:w-56 h-52 sm:h-60 md:h-80 rounded-xl shadow-2xl transition-all duration-700 hover:-translate-y-10 hover:rotate-6 ${i === 1 ? 'bg-amber-100' : i === 2 ? 'bg-indigo-100' : 'bg-emerald-100'}`} />
          ))}
        </div>

        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </section>
    </div>
  )
}
