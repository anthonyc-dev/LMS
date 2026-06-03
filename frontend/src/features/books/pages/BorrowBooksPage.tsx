import { Fragment } from "react";
import {
  Plus,
  Clock,
  BookOpen,
  Heart,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

// Asset imports
import bannerImg from "@/assets/images/dashboard/banner.png";
import book1Img from "@/assets/images/dashboard/book1.png";
import book2Img from "@/assets/images/dashboard/book2.png";
import author1Img from "@/assets/images/dashboard/author1.png";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

const ON_LOAN_BOOKS = [
  {
    id: 1,
    title: "A Promised Land",
    author: "Barack Obama",
    due: "02/02/22",
    image: book1Img,
    color: "from-gray-100 to-gray-200",
  },
  {
    id: 2,
    title: "Write Who You Are",
    author: "April Hartman",
    due: "12/02/22",
    image: book2Img,
    color: "from-red-400 to-red-500",
  },
  {
    id: 3,
    title: "Wuthering Heights",
    author: "Emily Brontë",
    due: "22/02/22",
    image: book2Img,
    color: "from-slate-600 to-slate-700",
  },
  {
    id: 4,
    title: "A God In Ruins",
    author: "Kate Atkinson",
    due: "22/02/22",
    image: book1Img,
    color: "from-red-300 to-red-400",
  },
  {
    id: 5,
    title: "What Echo Heard",
    author: "Gordon Sombrowski",
    due: "22/02/22",
    image: book2Img,
    color: "from-blue-100 to-blue-200",
  },
  {
    id: 6,
    title: "The Bone Clocks",
    author: "Gillian Flynn",
    due: "22/02/22",
    image: book1Img,
    color: "from-indigo-800 to-indigo-900",
  },
];

const RESERVED_BOOKS = [
  {
    title: "The Secret Lives of Colours",
    author: "David Bergen",
    due: "22/02/22",
    image: book1Img,
  },
  {
    title: "Here the Dark",
    author: "David Bergen",
    due: "22/02/22",
    image: book2Img,
  },
  {
    title: "Klara and the Sun",
    author: "Gillian Flynn",
    due: "22/02/22",
    image: book1Img,
  },
];

const FAVORITE_AUTHORS = [
  { name: "Emily Brontë", period: "1818 - 1848", image: author1Img },
  {
    name: "Alice Walker",
    period: "1944 - present",
    image: author1Img,
    badge: "NEW RELEASE",
  },
  { name: "Chinua Achebe", period: "1930 - 2013", image: author1Img },
];

const POPULAR_READS = [
  { title: "A Passage North", author: "Anuk Arudpragasam", image: book2Img },
  {
    title: "The Sweetness of Water",
    author: "Nathan Harris",
    image: book1Img,
  },
];

export function BorrowBooksPage() {
  usePageTitle("Borrow Books");
  return (
    <div className="mx-auto max-w-[1600px] space-y-8 md:space-y-10">
      {/* ── Banner Section ────────────────────────────────────────── */}
      <section className="group relative overflow-hidden rounded-2xl bg-[#E2E2F8] p-6 transition-shadow duration-300 hover:shadow-xl sm:p-8 md:p-10">
        <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:gap-10">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <Badge className="rounded-full border-0 bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-700">
              Featured Collection
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Black History Month
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-slate-600 md:text-base">
              From firebrand fiction to cultural history, and from seminal lives
              to inspiring volumes for children, we&apos;re celebrating classic
              works and contemporary triumphs.
            </p>
            <Button className="rounded-xl bg-[#FF7A59] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200/50 transition-all hover:bg-[#FF6B49] hover:shadow-xl active:scale-[0.98]">
              Find out more
            </Button>
          </div>
          <div className="relative w-48 shrink-0 sm:w-56 md:w-64">
            <img
              src={bannerImg}
              alt="Banner Illustration"
              className="w-full drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Background shapes */}
        <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-200/30 blur-2xl" />
      </section>

      {/* ── On Loan Section ───────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              On Loan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {ON_LOAN_BOOKS.length} books currently borrowed
            </p>
          </div>
          <Button
            variant="ghost"
            className="gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View All <ArrowRight size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {ON_LOAN_BOOKS.map((book) => (
            <div key={book.id} className="group cursor-pointer space-y-3">
              <div
                className={`relative aspect-3/4 overflow-hidden rounded-xl bg-linear-to-br shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl ${book.color}`}
              >
                <img
                  src={book.image}
                  alt={book.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="space-y-1">
                <h3 className="truncate text-sm font-bold text-slate-900">
                  {book.title}
                </h3>
                <p className="truncate text-xs text-slate-500">{book.author}</p>
                <div className="flex items-center gap-1.5">
                  <Clock size={10} className="text-amber-500" />
                  <span className="text-[10px] font-semibold text-amber-600">
                    Due {book.due}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Add more card */}
          <div className="group flex aspect-3/4 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-lg">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-indigo-100 group-hover:text-indigo-600">
              <Plus size={24} />
            </div>
            <p className="mt-3 px-4 text-center text-xs font-semibold text-slate-400 group-hover:text-indigo-600">
              Borrow more
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Reserved Books */}
        <Card className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Reserved Books
              </h2>
              <Badge
                variant="secondary"
                className="rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500"
              >
                {RESERVED_BOOKS.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {RESERVED_BOOKS.map((book, i) => (
                <Fragment key={i}>
                  <div className="group flex cursor-pointer items-center gap-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                        {book.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {book.author}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Clock size={10} className="text-slate-400" />
                        <span className="text-[10px] font-semibold text-slate-400">
                          Due {book.due}
                        </span>
                      </div>
                    </div>
                  </div>
                  {i < RESERVED_BOOKS.length - 1 && (
                    <div className="border-t border-slate-50" />
                  )}
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Favourite Authors */}
        <Card className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Favourite Authors
              </h2>
              <Heart size={16} className="text-slate-300" />
            </div>
            <div className="space-y-4">
              {FAVORITE_AUTHORS.map((author, i) => (
                <Fragment key={i}>
                  <div className="group flex cursor-pointer items-center gap-4">
                    <div className="size-14 shrink-0 overflow-hidden rounded-full shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={author.image}
                        alt={author.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                        {author.name}
                      </h3>
                      <p className="text-xs text-slate-500">{author.period}</p>
                    </div>
                    {author.badge && (
                      <Badge className="shrink-0 rounded-md border-0 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-600">
                        {author.badge}
                      </Badge>
                    )}
                  </div>
                  {i < FAVORITE_AUTHORS.length - 1 && (
                    <div className="border-t border-slate-50" />
                  )}
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Reads */}
        <Card className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Popular Reads
              </h2>
              <TrendingUp size={16} className="text-slate-300" />
            </div>
            <div className="space-y-4">
              {POPULAR_READS.map((book, i) => (
                <Fragment key={i}>
                  <div className="group flex cursor-pointer items-center gap-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                        {book.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {book.author}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 rounded-lg text-slate-300 hover:text-indigo-600"
                    >
                      <BookOpen size={14} />
                    </Button>
                  </div>
                  {i < POPULAR_READS.length - 1 && (
                    <div className="border-t border-slate-50" />
                  )}
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
