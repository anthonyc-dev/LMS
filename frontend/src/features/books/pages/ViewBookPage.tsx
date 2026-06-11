import { useParams, useNavigate } from "react-router-dom";
import { useBook } from "@/features/books/hooks/useBooks";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ArrowLeft, BookOpen, XCircle, MapPin, FileText } from "lucide-react";
import bookDark1Img from "@/assets/images/dashboard/book_dark1.png";

export function ViewBookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: book, isLoading, isError } = useBook(id || "");

  usePageTitle(book ? `View Book: ${book.title}` : "View Book");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-8 p-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-8 lg:grid-cols-12">
          <Skeleton className="h-[500px] rounded-2xl lg:col-span-4" />
          <div className="space-y-6 lg:col-span-8">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <XCircle className="size-16 text-rose-500" />
        <h2 className="text-2xl font-bold text-slate-800">Book Not Found</h2>
        <p className="text-slate-500">
          We couldn't find the book you are looking for.
        </p>
        <Button
          onClick={() => navigate("/student/books/browse")}
          variant="outline"
          className="mt-4"
        >
          <ArrowLeft className="mr-2 size-4" /> Back to Browse
        </Button>
      </div>
    );
  }

  const isAvailable = (book.availableCopies ?? 0) > 0;

  return (
    <div className="max-w-[1200px]">
      {/* Back button */}
      <div className="mb-5 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/student/books/browse")}
          className="group -ml-3 flex items-center gap-2 rounded-xl text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Library
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Cover Card */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-xl shadow-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50">
            <img
              src={book.coverImage || bookDark1Img}
              alt={book.title}
              className="aspect-2/3 w-full object-cover object-center transition-transform duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
            <div className="absolute right-4 bottom-4 left-4 flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={`rounded-full border-none px-3.5 py-1 text-xs font-bold tracking-wide shadow-lg backdrop-blur-md ${
                    isAvailable
                      ? "bg-emerald-500/90 text-white"
                      : "bg-rose-500/90 text-white"
                  }`}
                >
                  {book?.availabilityLabel}
                </Badge>
                {book.category?.name && (
                  <Badge
                    variant="secondary"
                    className="rounded-full border-none bg-white/90 px-3.5 py-1 text-xs font-bold text-slate-800 shadow-md backdrop-blur-md"
                  >
                    {book.category.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Structured details */}
        <div className="flex flex-col space-y-6 md:space-y-8 lg:col-span-8 xl:col-span-9">
          {/* Header Section */}
          <div className="space-y-3">
            <h1 className="text-3xl leading-tight font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {book.title}
            </h1>
            <p className="text-base font-semibold text-slate-500 sm:text-lg">
              by{" "}
              <span className="font-bold text-slate-800">
                {book.author || "Unknown Author"}
              </span>
            </p>
          </div>

          {/* About/Description Card */}
          <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100/50">
            <h3 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-base font-black text-slate-900">
              <BookOpen className="size-5 text-indigo-500" /> About this book
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              {book.description || "No description provided for this book."}
            </p>
          </div>

          {/* Specifications Card */}
          <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100/50">
            <h3 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-base font-black text-slate-900">
              <FileText className="size-5 text-indigo-500" /> Book
              Specifications
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Pages
                </p>
                <p className="text-sm font-semibold text-slate-800 md:text-base">
                  {book.pages || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  ISBN
                </p>
                <p className="text-sm font-semibold text-slate-800 md:text-base">
                  {book.isbn || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Edition
                </p>
                <p className="text-sm font-semibold text-slate-800 md:text-base">
                  {book.edition || "1st"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Publisher
                </p>
                <p
                  className="truncate text-sm font-semibold text-slate-800 md:text-base"
                  title={book.publisher}
                >
                  {book.publisher || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Published
                </p>
                <p className="text-sm font-semibold text-slate-800 md:text-base">
                  {book.publishedDate
                    ? new Date(book.publishedDate).getFullYear()
                    : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Language
                </p>
                <p className="text-sm font-semibold text-slate-800 md:text-base">
                  {book.language || "English"}
                </p>
              </div>
            </div>
          </div>

          {/* Locations Card */}
          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100/50">
            <h3 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-base font-black text-slate-900">
              <MapPin className="size-5 text-purple-600" /> Copies Location
            </h3>
            <div className="flex flex-wrap gap-2">
              {book.locations && book.locations.length > 0 ? (
                book.locations.map((loc, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="rounded-full border border-purple-100 bg-purple-50 px-3.5 py-1.5 text-xs font-semibold text-purple-700 shadow-none hover:bg-purple-100/60"
                  >
                    {loc}
                  </Badge>
                ))
              ) : (
                <span className="text-sm font-semibold text-slate-400 italic">
                  No copies available / Location unassigned
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
