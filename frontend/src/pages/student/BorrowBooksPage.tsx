import { Fragment } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Asset imports
import bannerImg from "@/assets/dashboard/banner.png";
import book1Img from "@/assets/dashboard/book1.png";
import book2Img from "@/assets/dashboard/book2.png";
import author1Img from "@/assets/dashboard/author1.png";
import { Separator } from "@/components/ui/separator";

const ON_LOAN_BOOKS = [
  {
    id: 1,
    title: "A Promised Land",
    author: "Barack Obama",
    due: "02/02/22",
    image: book1Img,
    color: "bg-gray-100",
  },
  {
    id: 2,
    title: "Write Who You Are",
    author: "April Hartman",
    due: "12/02/22",
    image: book2Img,
    color: "bg-red-500",
  },
  {
    id: 3,
    title: "Wuthering Heights",
    author: "Emily Brontë",
    due: "22/02/22",
    image: book2Img,
    color: "bg-slate-700",
  },
  {
    id: 4,
    title: "A God In Ruins",
    author: "Kate Atkinson",
    due: "22/02/22",
    image: book1Img,
    color: "bg-red-400",
  },
  {
    id: 5,
    title: "What Echo Heard",
    author: "Gordon Sombrowski",
    due: "22/02/22",
    image: book2Img,
    color: "bg-blue-100",
  },
  {
    id: 6,
    title: "The Bone Clocks",
    author: "Gillian Flynn",
    due: "22/02/22",
    image: book1Img,
    color: "bg-indigo-900",
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
  { title: "The Sweetness of Water", author: "Nathan Harris", image: book1Img },
];

export function BorrowBooksPage() {
  return (
    <>
      {/* Banner Section */}
      <section className="relative flex flex-col items-center justify-between overflow-hidden rounded-[2.5rem] bg-[#E2E2F8] p-8 transition-all hover:shadow-2xl hover:shadow-indigo-100 md:flex-row md:p-10">
        <div className="z-10 max-w-2xl space-y-8 text-center md:text-left">
          <h1 className="text-5xl leading-[1.1] font-bold tracking-tight text-slate-900 md:text-6xl">
            Black History Month
          </h1>
          <p className="max-w-lg text-xl leading-relaxed text-slate-600">
            From firebrand fiction to cultural history, and from seminal lives
            to inspiring volumes for children, we're celebrating classic works
            and contemporary triumphs from the best black authors and
            commentators.
          </p>
          <Button className="rounded-full bg-[#FF7A59] px-10 py-7 text-xl font-bold text-white shadow-2xl shadow-orange-200 transition-all hover:-translate-y-1 hover:scale-105 hover:bg-[#FF6B49] active:scale-95">
            Find out more
          </Button>
        </div>
        <div className="relative mt-12 h-64 w-64 overflow-hidden rounded-2xl md:mt-0 md:h-80 md:w-80">
          <img
            src={bannerImg}
            alt="Banner Illustration"
            className="h-full w-full object-contain drop-shadow-2xl"
          />
        </div>
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-200/30 blur-2xl" />
      </section>

      {/* On Loan Section */}
      <section className="my-10 space-y-8 rounded-2xl bg-white p-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">On Loan</h2>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-7">
          {ON_LOAN_BOOKS.map((book) => (
            <div key={book.id} className="group cursor-pointer space-y-4">
              <div
                className={`relative aspect-[3/4.2] overflow-hidden rounded-2xl shadow-lg transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl ${book.color}`}
              >
                <img
                  src={book.image}
                  alt={book.title}
                  className="h-full w-full object-cover opacity-90 mix-blend-multiply transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="space-y-2">
                <h3 className="truncate text-base leading-tight font-bold text-slate-900">
                  {book.title}
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  {book.author}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                    Due
                  </span>
                  <span className="text-[11px] font-black tracking-widest text-amber-500 uppercase">
                    {book.due}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Borrow more books card */}
          <div className="group flex aspect-[3/4.2] cursor-pointer flex-col items-center justify-center rounded-2xl border-4 border-dashed border-slate-200 bg-white/40 transition-all duration-300 hover:-translate-y-2 hover:border-slate-400 hover:bg-white hover:shadow-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all duration-300 group-hover:rotate-90 group-hover:bg-slate-100 group-hover:text-slate-500">
              <Plus size={32} />
            </div>
            <p className="mt-4 px-6 text-center text-sm leading-relaxed font-bold text-slate-400 group-hover:text-slate-600">
              Borrow more books
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Grid Section */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Reserved Books */}
        <Card className="overflow-hidden rounded-3xl border-none bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="space-y-8 p-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Reserved books
            </h2>
            <Separator />
            <div className="space-y-8">
              {RESERVED_BOOKS.map((book, i) => (
                <Fragment key={i}>
                  <div className="group flex cursor-pointer items-center gap-5">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <h3 className="truncate text-base leading-tight font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                        {book.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-500">
                        {book.author}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
                          Due
                        </span>
                        <span className="text-[10px] font-black tracking-widest text-slate-400">
                          {book.due}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Favourite Authors */}
        <Card className="overflow-hidden rounded-3xl border-none bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="space-y-8 p-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Favourite Authors
            </h2>
            <Separator />
            <div className="space-y-8">
              {FAVORITE_AUTHORS.map((author, i) => (
                <Fragment key={i}>
                  <div className="group flex cursor-pointer items-center gap-5">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg">
                      <img
                        src={author.image}
                        alt={author.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h3 className="truncate text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                        {author.name}
                      </h3>
                      <p className="text-sm font-medium text-slate-500">
                        {author.period}
                      </p>
                    </div>
                    {author.badge && (
                      <Badge
                        variant="secondary"
                        className="rounded-full border-none bg-indigo-50 px-3 py-1 text-[10px] font-black text-indigo-600"
                      >
                        {author.badge}
                      </Badge>
                    )}
                  </div>
                  <Separator />
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Reads */}
        <Card className="overflow-hidden rounded-3xl border-none bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="space-y-8 p-8">
            <h2 className="text-2xl font-bold text-slate-900">Popular reads</h2>
            <Separator />
            <div className="space-y-8">
              {POPULAR_READS.map((book, i) => (
                <Fragment key={i}>
                  <div className="group flex cursor-pointer items-center gap-5">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <h3 className="truncate text-base leading-tight font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                        {book.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-500">
                        {book.author}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
