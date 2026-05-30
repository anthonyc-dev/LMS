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
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/authStore";

import book1Img from "@/assets/dashboard/book1.png";
import book2Img from "@/assets/dashboard/book2.png";
import { usePageTitle } from "@/hooks/usePageTitle";

const MY_BOOKS = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    progress: 68,
    pagesRead: 182,
    totalPages: 240,
    dueDate: "May 15, 2026",
    daysLeft: 4,
    status: "Reading",
    image: book1Img,
    category: "Classic Literature",
    rating: 4.9,
    color: "from-amber-50 to-orange-50",
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    progress: 32,
    pagesRead: 96,
    totalPages: 320,
    dueDate: "May 20, 2026",
    daysLeft: 9,
    status: "Reading",
    image: book2Img,
    category: "Self-Improvement",
    rating: 5.0,
    color: "from-emerald-50 to-teal-50",
  },
];

export function MyBooksPage() {
  usePageTitle("My Books");
  const { user } = useAuthStore();
  const firstName = user?.fullName?.split(" ")[0] || "Reader";

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 md:space-y-12">
      {/* ── Welcome Section ───────────────────────────────────────── */}
      <section className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          Hello, <span className="text-emerald-600">{firstName}</span>.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base md:text-lg">
          You have{" "}
          <span className="font-semibold text-slate-900">
            {MY_BOOKS.length} books
          </span>{" "}
          currently in progress. Your next deadline is in{" "}
          <span className="font-semibold text-amber-600">
            {MY_BOOKS[0].daysLeft} days
          </span>
          .
        </p>
      </section>

      {/* ── Stats Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {/* Active Reading */}
        <Card className="group overflow-hidden rounded-2xl border-0 bg-slate-900 text-white shadow-sm transition-shadow hover:shadow-lg">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-white/10 p-3">
                <BookOpen size={22} />
              </div>
              <Badge className="border-0 bg-emerald-500/15 px-3 py-1 text-[10px] font-bold text-emerald-400">
                ACTIVE
              </Badge>
            </div>
            <div>
              <p className="text-4xl font-extrabold tracking-tighter">02</p>
              <p className="mt-1 text-sm font-semibold tracking-wide text-slate-400 uppercase">
                Books Reading
              </p>
            </div>
            <Button className="h-11 w-full gap-2 rounded-xl bg-white text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.98]">
              Continue Reading <ArrowRight size={16} />
            </Button>
          </CardContent>
        </Card>

        {/* Reservation */}
        <Card className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-3">
                <Clock size={22} className="text-amber-600" />
              </div>
              <Badge className="border-0 bg-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-600">
                PENDING
              </Badge>
            </div>
            <div>
              <p className="text-4xl font-extrabold tracking-tighter text-slate-900">
                01
              </p>
              <p className="mt-1 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                Reservation
              </p>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              &ldquo;The Alchemist&rdquo; will be ready for pickup by tomorrow
              afternoon.
            </p>
          </CardContent>
        </Card>

        {/* History */}
        <Card className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-lg sm:col-span-2 lg:col-span-1">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-3">
                <Library size={22} className="text-emerald-600" />
              </div>
              <Badge className="border-0 bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">
                HISTORY
              </Badge>
            </div>
            <div>
              <p className="text-4xl font-extrabold tracking-tighter text-slate-900">
                48
              </p>
              <p className="mt-1 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                Books Finished
              </p>
            </div>
            <div className="flex -space-x-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="inline-block size-9 rounded-lg bg-slate-200 ring-2 ring-white"
                />
              ))}
              <div className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white">
                +44
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Active Reading Section ────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            Active Reading
          </h2>
          <Button
            variant="ghost"
            className="gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View All <ArrowRight size={14} />
          </Button>
        </div>

        <div className="space-y-4">
          {MY_BOOKS.map((book) => (
            <article
              key={book.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg sm:flex-row"
            >
              {/* Book Cover */}
              <div
                className={`relative flex w-full shrink-0 items-center justify-center bg-linear-to-br p-6 sm:w-48 sm:p-8 md:w-56 ${book.color}`}
              >
                <div className="relative w-24 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2 sm:w-28 md:w-32">
                  <div className="absolute inset-0 translate-y-4 scale-90 bg-black/20 blur-xl" />
                  <img
                    src={book.image}
                    alt={book.title}
                    className="relative w-full drop-shadow-lg"
                  />
                </div>
                {/* Play button overlay */}
                <Button
                  size="icon"
                  className="absolute bottom-4 right-4 size-10 rounded-full bg-white/90 text-slate-900 opacity-0 shadow-lg backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-white sm:bottom-auto sm:right-auto"
                >
                  <Play size={16} className="ml-0.5 fill-current" />
                </Button>
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 md:p-8">
                <div className="space-y-3">
                  {/* Top row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 sm:text-xs"
                    >
                      {book.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={12} className="fill-current" />
                      <span className="text-xs font-bold">{book.rating}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl md:text-2xl">
                      {book.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      by {book.author}
                    </p>
                  </div>

                  {/* Due date */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar size={12} />
                      Due {book.dueDate}
                    </span>
                    <Badge
                      className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-bold ${
                        book.daysLeft <= 5
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-emerald-500/10 text-emerald-600"
                      }`}
                    >
                      {book.daysLeft} DAYS LEFT
                    </Badge>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-5 space-y-2.5 border-t border-slate-50 pt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">
                      Progress
                    </span>
                    <span className="font-bold text-emerald-600">
                      {book.progress}%
                    </span>
                  </div>
                  <Progress value={book.progress} className="h-2" />
                  <p className="text-xs text-slate-400">
                    {book.pagesRead} of {book.totalPages} pages completed
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <Button className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] sm:text-sm">
                    Continue Reading
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 gap-1.5 rounded-xl border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:border-slate-300 sm:text-sm"
                  >
                    <RotateCcw size={14} /> Renew
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-xl text-slate-400 hover:text-slate-700"
                  >
                    <Bookmark size={18} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Recommendation CTA ────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950 p-6 sm:p-8 md:p-10">
        <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:gap-12">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
              <Sparkles size={12} />
              Recommended For You
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
              Discover your next{" "}
              <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Masterpiece
              </span>
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-slate-400 md:text-base">
              Based on your interest in Classic Literature and Productivity, we
              think you&apos;ll love these hand-picked titles.
            </p>
            <Button className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition-all hover:bg-slate-100 active:scale-[0.98]">
              Browse Recommendations
            </Button>
          </div>

          {/* Stacked book previews */}
          <div className="relative flex shrink-0 -space-x-8 sm:-space-x-10 md:-space-x-12">
            {[
              { bg: "from-amber-100 to-amber-200", rotate: "-rotate-6" },
              { bg: "from-indigo-100 to-indigo-200", rotate: "-rotate-2" },
              { bg: "from-emerald-100 to-emerald-200", rotate: "rotate-2" },
            ].map((item, i) => (
              <div
                key={i}
                className={`h-36 w-24 rounded-xl bg-linear-to-br shadow-xl transition-all duration-500 hover:-translate-y-4 sm:h-48 sm:w-32 md:h-56 md:w-40 ${item.bg} ${item.rotate}`}
              />
            ))}
          </div>
        </div>

        {/* Background glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-teal-600/10 blur-3xl" />
      </section>
    </div>
  );
}
