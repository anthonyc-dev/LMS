import { useState } from "react";
import {
  Barcode,
  Book,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Loader2,
  Receipt,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

import {
  useActiveBorrowingByBarcode,
  useReturnBook,
} from "@/features/circulation/api/circulation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

export function ReturnBookPage() {
  usePageTitle("Return Book");

  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [scannedBarcode, setScannedBarcode] = useState("");

  const {
    data: borrowing,
    error,
    isFetching,
  } = useActiveBorrowingByBarcode(scannedBarcode);
  const returnMutation = useReturnBook();

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeSearch.trim()) return;
    setScannedBarcode(barcodeSearch.trim());
    setBarcodeSearch("");
  };

  const handleConfirmReturn = () => {
    if (!borrowing) {
      toast.error("No valid borrowing record to return.");
      return;
    }

    returnMutation.mutate(borrowing.id, {
      onSuccess: () => {
        toast.success("Book returned successfully!");
        setScannedBarcode(""); // Reset view
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to return book");
      },
    });
  };

  // Helper to calculate overdue info
  const calculateOverdue = () => {
    if (!borrowing) return { isOverdue: false, days: 0, penalty: 0 };

    const due = new Date(borrowing.dueDate);
    const now = new Date();

    // Only set time to 0 to compare dates directly
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      // 50 per day as an example
      return { isOverdue: true, days: diffDays, penalty: diffDays * 50 };
    }

    return { isOverdue: false, days: 0, penalty: 0 };
  };

  const { isOverdue, days, penalty } = calculateOverdue();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-4xl space-y-6 duration-700">
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <RotateCcw className="size-8 text-indigo-600" />
            Return Book
          </h1>
          <p className="mt-1 font-medium text-slate-500">
            Scan a book barcode to process a return and calculate fines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Scanner & Book Details */}
        <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
          {/* Scanner */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">
              Scan Barcode
            </h2>
            <form onSubmit={handleBarcodeSubmit}>
              <div className="relative">
                <Barcode className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={barcodeSearch}
                  onChange={(e) => setBarcodeSearch(e.target.value)}
                  placeholder="Scan book barcode (e.g. BC-1234)..."
                  className="h-14 rounded-xl border-2 border-slate-200 pl-12 text-lg font-bold tracking-wide focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                  autoFocus
                />
                <Button
                  type="submit"
                  className="absolute top-1.5 right-1.5 h-11 rounded-lg bg-indigo-600 px-6 font-bold text-white hover:bg-indigo-700"
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    "Process"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Book Details */}
          {borrowing ? (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <h3 className="flex items-center gap-2 font-bold text-slate-700">
                  <Book className="size-4" /> Book Information
                </h3>
              </div>
              <div className="flex flex-col gap-6 p-6 sm:flex-row">
                <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm">
                  {borrowing.bookCopy?.book.coverImage ? (
                    <img
                      src={borrowing.bookCopy.book.coverImage}
                      alt="Cover"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-300">
                      <Book className="size-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {borrowing.bookCopy?.book.title}
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                      by {borrowing.bookCopy?.book.author}
                    </p>
                    <p className="mt-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Barcode: {borrowing.bookCopy?.barcode} • ISBN:{" "}
                      {borrowing.bookCopy?.book.isbn}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="flex items-center gap-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                        <Calendar className="size-3" /> Borrowed On
                      </p>
                      <p className="mt-1 font-bold text-slate-700">
                        {new Date(borrowing.borrowDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl border p-3 ${isOverdue ? "border-rose-200 bg-rose-50" : "border-slate-100 bg-slate-50"}`}
                    >
                      <p
                        className={`flex items-center gap-1 text-xs font-bold tracking-wider uppercase ${isOverdue ? "text-rose-500" : "text-slate-400"}`}
                      >
                        <Calendar className="size-3" /> Due Date
                      </p>
                      <p
                        className={`mt-1 font-bold ${isOverdue ? "text-rose-700" : "text-slate-700"}`}
                      >
                        {new Date(borrowing.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : scannedBarcode && !isFetching && error ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50 py-16 text-center">
              <XCircle className="mb-4 size-12 text-rose-300" />
              <p className="text-lg font-bold text-rose-600">
                No active borrowing found
              </p>
              <p className="mt-1 text-sm text-rose-400">
                Barcode '{scannedBarcode}' does not have an active borrowing
                record.
              </p>
              <Button
                variant="outline"
                className="mt-6 border-rose-200 font-bold text-rose-600 hover:bg-rose-100"
                onClick={() => setScannedBarcode("")}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
              <RotateCcw className="mb-4 size-12 text-slate-300" />
              <p className="text-lg font-bold text-slate-500">
                Ready to return
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Scan a book to see return details and process the return.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Borrower & Receipt Summary */}
        <div
          className={`col-span-1 transition-opacity ${!borrowing ? "pointer-events-none opacity-50" : ""}`}
        >
          <div className="sticky top-20 flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h3 className="flex items-center gap-2 font-bold text-slate-700">
                <Receipt className="size-4" /> Return Summary
              </h3>
            </div>

            <div className="flex flex-1 flex-col p-6">
              {borrowing?.user && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={borrowing.user.avatarUrl} />
                    <AvatarFallback className="bg-indigo-100 font-bold text-indigo-700">
                      {borrowing.user.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">
                      {borrowing.user.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {borrowing.user.schoolId}
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6 flex-1 space-y-4">
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-4">
                  <span className="text-sm font-medium text-slate-500">
                    Condition
                  </span>
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                  >
                    Good
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-4">
                  <span className="text-sm font-medium text-slate-500">
                    Overdue Days
                  </span>
                  <span
                    className={`font-bold ${isOverdue ? "text-rose-600" : "text-slate-900"}`}
                  >
                    {days} Days
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-slate-900">Total Fines</span>
                  <span
                    className={`text-xl font-black ${penalty > 0 ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    ₱{penalty.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                {isOverdue && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <p>
                      This book is overdue. Please ensure fines are collected if
                      applicable before confirming.
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleConfirmReturn}
                  disabled={!borrowing || returnMutation.isPending}
                  className="h-12 w-full rounded-xl bg-indigo-600 text-base font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
                >
                  {returnMutation.isPending ? (
                    <Loader2 className="mr-2 size-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 size-5" />
                  )}
                  Confirm Return
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setScannedBarcode("")}
                  className="h-12 w-full rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
