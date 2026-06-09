import { useParams, useNavigate } from "react-router-dom";
import { useBook } from "@/features/books/hooks/useBooks";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Languages,
  Layers,
  Hash,
  Users,
  XCircle,
  FileText,
  MapPin,
} from "lucide-react";
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
    <div className="mx-auto max-w-[1200px] space-y-6 md:space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/student/books/browse")}
        className="group -ml-4 flex items-center gap-2 text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        Back to Library
      </Button>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Cover */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xl">
            <img
              src={book.coverImage || bookDark1Img}
              alt={book.title}
              className="aspect-2/3 w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
            <div className="absolute right-4 bottom-4 left-4 flex justify-between">
              <Badge
                className={`rounded-full border-0 px-3 py-1 text-xs font-bold tracking-wide shadow-lg backdrop-blur-md ${
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
                  className="rounded-md bg-white/90 text-slate-800 shadow-md backdrop-blur-md"
                >
                  {book.category.name}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col space-y-8 lg:col-span-8 xl:col-span-9">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {book.title}
            </h1>
            <p className="text-lg font-medium text-slate-500 sm:text-xl">
              by{" "}
              <span className="text-slate-700">
                {book.author || "Unknown Author"}
              </span>
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-8">
            <Button
              size="lg"
              className="rounded-xl bg-indigo-600 px-8 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-[0.98]"
            >
              Request to Borrow
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl border-2 border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FileText className="mr-2 size-5 text-slate-400" /> Read Preview
            </Button>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              About this book
            </h3>
            <p className="leading-relaxed text-slate-600">
              {book.description || "No description provided for this book."}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <BookOpen className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Pages
                </p>
                <p className="font-semibold text-slate-700">
                  {book.pages || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <Hash className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  ISBN
                </p>
                <p className="font-semibold text-slate-700">
                  {book.isbn || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Publisher
                </p>
                <p
                  className="truncate font-semibold text-slate-700"
                  title={book.publisher}
                >
                  {book.publisher || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                <Layers className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Edition
                </p>
                <p className="font-semibold text-slate-700">
                  {book.edition || "1st"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Languages className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Language
                </p>
                <p className="font-semibold text-slate-700">
                  {book.language || "English"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Published
                </p>
                <p className="font-semibold text-slate-700">
                  {book.publishedDate
                    ? new Date(book.publishedDate).getFullYear()
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                <MapPin className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Location
                </p>
                <p className="font-semibold text-slate-700">
                  {book.locations?.join(", ") || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
