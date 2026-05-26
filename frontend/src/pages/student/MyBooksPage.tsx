import {
  BookOpen,
  Clock,
  Calendar,
  Bookmark,
  Star,
  ArrowRight,
  Library,
  RotateCcw,
  Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import book1Img from "@/assets/dashboard/book1.png";
import book2Img from "@/assets/dashboard/book2.png";

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
    color: "bg-amber-50",
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
    color: "bg-emerald-50",
  },
];

export function MyBooksPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-8 md:space-y-16">
      {/* Welcome Section */}
      <section className="space-y-3 px-2 md:space-y-4">
        <h1 className="text-3xl leading-none font-black tracking-tight text-slate-900 sm:text-5xl md:text-7xl">
          Hello, <span className="text-emerald-600">Anthony</span>.
        </h1>
        <p className="max-w-3xl text-base leading-relaxed font-medium text-slate-500 sm:text-xl md:text-2xl">
          You have{" "}
          <span className="font-bold text-slate-900 underline decoration-emerald-200 decoration-4">
            2 books
          </span>{" "}
          currently in progress. Your next deadline is in{" "}
          <span className="font-bold text-slate-900 underline decoration-amber-200 decoration-4">
            4 days
          </span>
          .
        </p>
      </section>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card className="group overflow-hidden rounded-2xl border-none bg-slate-900 text-white shadow-sm md:rounded-4xl">
          <CardContent className="space-y-4 p-6 md:space-y-8 md:p-10">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-white/10 p-3 md:p-4">
                <BookOpen size={28} className="md:size-8" />
              </div>
              <Badge className="border-none bg-emerald-500/20 px-4 py-2 text-[10px] font-black text-emerald-400 md:text-xs">
                ACTIVE
              </Badge>
            </div>
            <div className="space-y-1 md:space-y-2">
              <p className="text-5xl font-black tracking-tighter md:text-6xl">
                02
              </p>
              <p className="text-base font-bold tracking-widest text-slate-400 uppercase md:text-lg">
                Books Reading
              </p>
            </div>
            <Button className="h-14 w-full gap-3 rounded-xl bg-white text-base font-black text-slate-900 transition-all group-hover:scale-[1.02] hover:bg-slate-100 md:h-16 md:text-lg">
              Continue Reading <ArrowRight size={20} />
            </Button>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden rounded-2xl border-none bg-stone-100 shadow-sm md:rounded-4xl">
          <CardContent className="space-y-4 p-6 text-slate-900 md:space-y-8 md:p-10">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-white p-3 shadow-sm md:p-4">
                <Clock size={28} className="text-amber-600 md:size-8" />
              </div>
              <Badge className="border-none bg-amber-600/10 px-4 py-2 text-[10px] font-black text-amber-600 md:text-xs">
                PENDING
              </Badge>
            </div>
            <div className="space-y-1 md:space-y-2">
              <p className="text-5xl font-black tracking-tighter md:text-6xl">
                01
              </p>
              <p className="text-base font-bold tracking-widest text-slate-500 uppercase md:text-lg">
                Reservation
              </p>
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed font-medium text-slate-500 md:text-base">
              "The Alchemist" is being processed and will be ready for pickup by
              tomorrow afternoon.
            </p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden rounded-2xl border border-none border-slate-100 bg-white shadow-sm md:col-span-2 md:rounded-4xl lg:col-span-1">
          <CardContent className="space-y-4 p-6 text-slate-900 md:space-y-8 md:p-10">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-3 md:p-4">
                <Library size={28} className="text-emerald-600 md:size-8" />
              </div>
              <Badge className="border-none bg-slate-100 px-4 py-2 text-[10px] font-black text-slate-600 md:text-xs">
                HISTORY
              </Badge>
            </div>
            <div className="space-y-1 md:space-y-2">
              <p className="text-5xl font-black tracking-tighter md:text-6xl">
                48
              </p>
              <p className="text-base font-bold tracking-widest text-slate-500 uppercase md:text-lg">
                Books Finished
              </p>
            </div>
            <div className="flex -space-x-3 overflow-hidden md:-space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="inline-block h-10 w-10 rounded-lg bg-slate-200 ring-2 ring-white md:h-12 md:w-12 md:rounded-xl md:ring-4"
                />
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white md:h-12 md:w-12 md:rounded-xl md:text-sm md:ring-4">
                +44
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Reading Section */}
      <section className="space-y-8 md:space-y-10">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Active Reading
          </h2>
          <Button
            variant="ghost"
            className="gap-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 md:text-lg"
          >
            View All <ArrowRight size={18} className="md:size-5" />
          </Button>
        </div>

        <div className="space-y-5 md:space-y-8">
          {MY_BOOKS.map((book) => (
            <div
              key={book.id}
              className="group relative flex flex-col items-center gap-5 rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 sm:gap-8 md:gap-12 md:rounded-4xl md:p-10 xl:flex-row"
            >
              {/* Large Book Cover */}
              <div
                className={`relative h-44 w-32 shrink-0 overflow-hidden rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2 sm:h-64 sm:w-48 ${book.color}`}
              >
                <img
                  src={book.image}
                  alt={book.title}
                  className="h-full w-full object-cover opacity-90 mix-blend-multiply transition-all group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                <Button
                  size="icon"
                  className="absolute top-1/2 left-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 scale-75 rounded-full bg-white text-slate-900 opacity-0 shadow-2xl transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 sm:h-16 sm:w-16"
                >
                  <Play className="ml-1 fill-current" />
                </Button>
              </div>

              {/* Book Details & Progress */}
              <div className="w-full flex-1 space-y-6 md:space-y-10">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="border-none bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600 md:text-xs"
                      >
                        {book.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star
                          size={12}
                          className="fill-current md:size-[14px]"
                        />
                        <span className="text-xs font-black md:text-sm">
                          4.9
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl leading-tight font-black tracking-tight text-slate-900 sm:text-3xl md:text-5xl">
                      {book.title}
                    </h3>
                    <p className="text-lg font-bold text-slate-500 md:text-xl">
                      by {book.author}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 md:items-end">
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase md:text-xs">
                      <Calendar size={14} />
                      Due on {book.dueDate}
                    </div>
                    <Badge className="w-fit border-none bg-amber-500/10 px-4 py-2 text-[10px] font-black text-amber-600 md:text-xs">
                      4 DAYS LEFT
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-black text-slate-900 md:text-lg">
                      Reading Progress
                    </p>
                    <p className="text-base font-black text-emerald-600 md:text-lg">
                      {book.progress}%
                    </p>
                  </div>
                  <Progress value={book.progress} className="h-3 md:h-4" />
                  <p className="text-sm font-medium text-slate-500 md:text-base">
                    You've completed{" "}
                    <span className="font-bold text-slate-900">182 of 240</span>{" "}
                    pages. Keep it up!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-50 pt-6 md:gap-4 md:pt-8">
                  <Button className="h-12 flex-1 rounded-xl bg-slate-900 px-6 text-sm font-black text-white transition-all hover:bg-emerald-600 sm:flex-none md:h-14 md:px-10 md:text-base">
                    Continue Reading
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 flex-1 gap-2 rounded-xl border-2 border-slate-200 px-6 text-sm font-black text-slate-600 transition-all hover:border-slate-900 sm:flex-none md:h-14 md:px-10 md:text-base"
                  >
                    <RotateCcw size={16} /> Renew Loan
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-slate-400 transition-all hover:text-slate-900 md:h-14 md:w-14"
                  >
                    <Bookmark size={20} className="md:size-6" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Reading */}
      <section className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl bg-stone-100 p-6 md:flex-row md:gap-12 md:rounded-[2.5rem] md:p-20">
        <div className="z-10 space-y-4 text-center md:space-y-8 md:text-left">
          <Badge className="border-none bg-white px-4 py-2 text-xs font-black text-slate-900 md:text-sm">
            RECOMMENDED
          </Badge>
          <h2 className="text-3xl leading-tight font-black tracking-tight text-slate-900 sm:text-4xl md:text-6xl">
            Discover your <br className="hidden md:block" /> next{" "}
            <span className="font-serif text-emerald-600 italic">
              Masterpiece
            </span>
            .
          </h2>
          <p className="max-w-xl text-base leading-relaxed font-medium text-slate-600 md:text-xl">
            Based on your interest in Classic Literature and Productivity, we
            think you'll love these hand-picked titles.
          </p>
          <Button className="h-14 w-full rounded-xl bg-slate-900 px-8 text-base font-black text-white transition-all hover:bg-slate-800 sm:w-auto md:h-16 md:px-12 md:text-lg">
            Browse Recommendations
          </Button>
        </div>

        <div className="relative flex translate-x-2 -space-x-10 sm:translate-x-4 sm:-space-x-12 md:translate-x-8 md:-space-x-16">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-40 w-28 rounded-xl shadow-2xl transition-all duration-700 hover:-translate-y-10 hover:rotate-6 sm:h-60 sm:w-40 md:h-80 md:w-56 ${i === 1 ? "bg-amber-100" : i === 2 ? "bg-indigo-100" : "bg-emerald-100"}`}
            />
          ))}
        </div>

        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </section>
    </div>
  );
}
