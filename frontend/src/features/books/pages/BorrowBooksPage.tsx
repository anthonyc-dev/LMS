import { useMemo } from "react";
import { Plus, Clock, BookOpen, ArrowRight } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

// Asset imports
import bannerImg from "@/assets/images/dashboard/banner.png";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useAuthStore } from "@/app/store/authStore";
import { useBorrowingsByUser } from "@/features/circulation/api/circulation";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useRoleBasePath } from "@/shared/hooks/useRoleBasePath";

export function BorrowBooksPage() {
  usePageTitle("Borrow Books");
  const navigate = useNavigate();
  const basePath = useRoleBasePath();
  const { user } = useAuthStore();
  const { data: borrowings } = useBorrowingsByUser(user?.id);

  const activeBorrowings = useMemo(() => {
    if (!borrowings) return [];

    return borrowings.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (b: any) =>
        b.status === "borrowed" ||
        b.status === "pending" ||
        b.status === "overdue",
    );
  }, [borrowings]);
  return (
    <div className="mx-auto max-w-[1600px] space-y-8 md:space-y-10">
      {/* ── Banner Section ────────────────────────────────────────── */}
      <section className="group relative overflow-hidden rounded-2xl bg-[#E2E2F8] p-6 transition-shadow duration-300 hover:shadow-xl sm:p-8 md:p-10">
        <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:gap-10">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <Badge className="rounded-full border-0 bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700">
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
            {/* <Button className="shadow-warning-bg/50 rounded-xl bg-[#FF7A59] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#FF6B49] hover:shadow-xl active:scale-[0.98]">
              Find out more
            </Button> */}
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
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 rounded-full bg-blue-200/30 blur-2xl" />
      </section>

      {/* ── On Loan Section ───────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Loans and Requests
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {activeBorrowings.length} active loans and pending requests
            </p>
          </div>
          <Button
            variant="ghost"
            className="gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            render={
              <Link to={`${basePath}/books/history`}>
                View All <ArrowRight size={14} />
              </Link>
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {activeBorrowings.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (borrowing: any) => {
              const book = borrowing.bookCopy?.book;
              if (!book) return null;
              return (
                <div
                  key={borrowing.id}
                  className="group cursor-pointer space-y-3"
                >
                  <div
                    className={`relative aspect-3/4 overflow-hidden rounded-xl bg-linear-to-br from-slate-100 to-slate-200 shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl`}
                  >
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <BookOpen size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {book.title}
                    </h3>
                    <p className="truncate text-xs text-slate-500">
                      {book.author}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="text-warning-bg0" />
                      <span className="text-warning-text text-[10px] font-semibold">
                        {borrowing.status === "pending"
                          ? "Pending admin approval"
                          : "Due " +
                            format(new Date(borrowing.dueDate), "dd/MM/yy")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            },
          )}

          {/* Add more card */}
          <div
            onClick={() => navigate(`${basePath}/books/browse`)}
            className="group flex aspect-3/4 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-lg"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-blue-100 group-hover:text-blue-600">
              <Plus size={24} />
            </div>
            <p className="mt-3 px-4 text-center text-xs font-semibold text-slate-400 group-hover:text-blue-600">
              Borrow more
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Reserved Books */}
        {/* <Card className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
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
                      <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-600">
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
        </Card> */}

        {/* Favourite Authors */}
        {/* <Card className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
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
                      <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                        {author.name}
                      </h3>
                      <p className="text-xs text-slate-500">{author.period}</p>
                    </div>
                    {author.badge && (
                      <Badge className="shrink-0 rounded-md border-0 bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
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
        </Card> */}

        {/* Popular Reads */}
        {/* <Card className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
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
                      <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                        {book.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {book.author}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 rounded-lg text-slate-300 hover:text-blue-600"
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
        </Card> */}
      </div>
    </div>
  );
}
