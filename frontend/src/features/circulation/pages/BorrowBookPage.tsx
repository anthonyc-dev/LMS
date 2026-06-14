import { useState } from "react";
import {
  Search,
  User as UserIcon,
  Book,
  Barcode,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

import { useUsers, type ApiUser, type Role } from "@/features/users/api/users";
import {
  useBorrowBooksBulk,
  type BorrowingStatus,
  type BookCopy,
} from "@/features/circulation/api/circulation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import api from "@/shared/lib/axios";

const ROLE_LIMITS: Record<Role, number> = {
  student: 3,
  faculty: 5,
  admin: 10,
};

export function BorrowBookPage() {
  usePageTitle("Borrow Book");

  // Borrower State
  const [borrowerSearch, setBorrowerSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);

  // Queue State
  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [scannedBooks, setScannedBooks] = useState<BookCopy[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const borrowBulkMutation = useBorrowBooksBulk();

  // Borrower search logic
  const handleBorrowerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!users) return;
    const q = borrowerSearch.toLowerCase().trim();
    const found = users.find(
      (u) =>
        u.schoolId.toLowerCase() === q ||
        u.email.toLowerCase() === q ||
        u.fullName.toLowerCase().includes(q),
    );
    if (found) {
      setSelectedUser(found);
      setBorrowerSearch("");
      toast.success("Borrower selected");
    } else {
      toast.error("Borrower not found");
    }
  };

  const limit = selectedUser ? ROLE_LIMITS[selectedUser.Role] : 0;
  const currentBorrows = selectedUser ? selectedUser.activeBorrowingsCount : 0;
  const validBooksCount = scannedBooks.filter(
    (b) => b.status.toUpperCase() === "AVAILABLE",
  ).length;
  const hasInvalidBooks = scannedBooks.some(
    (b) => b.status.toUpperCase() !== "AVAILABLE",
  );
  const canBorrowMore = currentBorrows + validBooksCount < limit;

  // Barcode scan logic
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isScanning) return;

    if (!selectedUser) {
      toast.error("Please select a borrower first");
      return;
    }

    if (!canBorrowMore) {
      toast.error("Borrowing limit reached for this user.");
      return;
    }

    const barcode = barcodeSearch.trim().toUpperCase();

    if (!barcode) return;

    setBarcodeSearch("");

    try {
      setIsScanning(true);

      const response = await api.get(`/book-copies/barcode/${barcode}`);

      const copy: BookCopy = response.data;

      if (!copy) {
        toast.error("Book copy not found.");
        return;
      }

      /*
     |--------------------------------------------------------------------------
     | Prevent Duplicate Queue Entries
     |--------------------------------------------------------------------------
     */

      const alreadyQueued = scannedBooks.some((book) => book.id === copy.id);

      if (alreadyQueued) {
        toast.error("Book copy is already in the queue.");
        return;
      }

      /*
     |--------------------------------------------------------------------------
     | Validate Availability
     |--------------------------------------------------------------------------
     */

      if (copy.status !== "AVAILABLE") {
        toast.error(`Book copy is ${copy.status.toLowerCase()}.`);

        return;
      }

      /*
     |--------------------------------------------------------------------------
     | Add To Queue
     |--------------------------------------------------------------------------
     */

      setScannedBooks((prev) => [...prev, copy]);

      toast.success("Book added to queue");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to find book copy.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemoveBook = (id: string) => {
    setScannedBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleConfirmBorrow = () => {
    if (!selectedUser) {
      toast.error("Please select a borrower.");
      return;
    }
    if (scannedBooks.length === 0) {
      toast.error("Please scan at least one book.");
      return;
    }
    if (hasInvalidBooks) {
      toast.error("Please remove unavailable books before confirming.");
      return;
    }
    if (currentBorrows + validBooksCount > limit) {
      toast.error("Borrower has reached their borrowing limit.");
      return;
    }

    const borrowDate = new Date();
    const dueDate = new Date();
    // Default 14 days borrowing period
    dueDate.setDate(dueDate.getDate() + 14);

    borrowBulkMutation.mutate(
      {
        userId: selectedUser._id,
        bookCopyIds: scannedBooks.map((b) => b.id),
        borrowDate,
        dueDate,
        status: "borrowed" as BorrowingStatus,
      },
      {
        onSuccess: () => {
          toast.success("Borrowing transaction successful!");
          // Reset
          setSelectedUser(null);
          setScannedBooks([]);
          setBarcodeSearch("");
          setBorrowerSearch("");
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message ||
              "Failed to create borrowing transaction",
          );
        },
      },
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-6xl space-y-6 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Borrow Books
          </h1>
          <p className="font-medium text-slate-500">
            Scan a borrower ID and multiple book barcodes to check out items in
            bulk.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Borrower Info */}
        <div className="col-span-1 flex flex-col gap-6 lg:col-span-1">
          <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <UserIcon className="size-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                1. Select Borrower
              </h2>
            </div>

            <form onSubmit={handleBorrowerSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={borrowerSearch}
                  onChange={(e) => setBorrowerSearch(e.target.value)}
                  placeholder="School ID, Email, Name..."
                  className="h-12 rounded-xl border-slate-200 pl-10 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                  disabled={isLoadingUsers}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute top-1 right-1 h-10 rounded-lg bg-indigo-600 font-bold hover:bg-indigo-700"
                >
                  Find
                </Button>
              </div>
            </form>

            {selectedUser ? (
              <div className="flex flex-1 flex-col justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 shadow-sm ring-4 ring-white">
                    <AvatarImage src={selectedUser.avatarUrl} />
                    <AvatarFallback className="bg-indigo-100 text-xl font-black text-indigo-700">
                      {selectedUser.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {selectedUser.fullName}
                    </h3>
                    <p className="text-sm font-medium text-slate-500">
                      {selectedUser.schoolId}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-indigo-200 bg-white text-[10px] tracking-wider text-indigo-700 uppercase"
                      >
                        <Shield className="mr-1 size-3" />
                        {selectedUser.Role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Borrowings Used</span>
                    <span className="font-bold text-slate-900">
                      {currentBorrows + validBooksCount} / {limit}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        !canBorrowMore
                          ? "bg-rose-500"
                          : currentBorrows + validBooksCount > limit * 0.7
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(((currentBorrows + validBooksCount) / limit) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  {!canBorrowMore && (
                    <p className="flex items-center gap-1 text-xs font-bold text-rose-500">
                      <AlertTriangle className="size-3" />
                      Limit reached. Cannot add more books.
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-fit text-xs font-bold text-slate-500"
                  onClick={() => setSelectedUser(null)}
                >
                  Clear Selection
                </Button>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                <UserIcon className="mb-3 size-10 text-slate-300" />
                <p className="font-bold text-slate-500">No borrower selected</p>
                <p className="text-xs text-slate-400">
                  Search for a student or faculty to begin.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Book Queue */}
        <div
          className={`col-span-1 flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-opacity lg:col-span-2 ${
            !selectedUser
              ? "pointer-events-none border-slate-100 opacity-50"
              : "border-slate-100"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Book className="size-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                2. Scan Book Copies
              </h2>
            </div>
            {scannedBooks.length > 0 && (
              <Badge variant="secondary" className="font-bold">
                {scannedBooks.length} in queue
              </Badge>
            )}
          </div>

          <form onSubmit={handleBarcodeSubmit} className="mb-6">
            <div className="relative">
              <Barcode className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                placeholder="Scan barcode (e.g. BC-1234)..."
                className="h-14 rounded-xl border-slate-200 pl-10 text-lg font-bold tracking-wide focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                autoFocus={!!selectedUser}
                disabled={!canBorrowMore || isScanning}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute top-2 right-2 h-10 rounded-lg bg-amber-500 px-6 font-bold text-white hover:bg-amber-600"
                disabled={isScanning || !canBorrowMore}
              >
                {isScanning ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Scan"
                )}
              </Button>
            </div>
          </form>

          {scannedBooks.length > 0 ? (
            <div className="flex max-h-[400px] flex-1 flex-col gap-3 overflow-y-auto pr-2">
              {scannedBooks.map((bookCopy) => {
                const isAvailable =
                  bookCopy.status.toUpperCase() === "AVAILABLE";
                return (
                  <div
                    key={bookCopy.id}
                    className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                      isAvailable
                        ? "border-amber-100 bg-amber-50/30 hover:bg-amber-50/80"
                        : "border-rose-200 bg-rose-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-slate-200 shadow-sm">
                        {bookCopy.book.coverImage ? (
                          <img
                            src={bookCopy.book.coverImage}
                            alt="Cover"
                            className={`h-full w-full object-cover ${!isAvailable && "opacity-50 grayscale"}`}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-amber-100 text-amber-500">
                            <Book className="size-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="leading-tight font-black text-slate-900">
                          {bookCopy.book.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-500">
                          by {bookCopy.book.author}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            BC: {bookCopy.barcode}
                          </p>
                          {!isAvailable && (
                            <Badge
                              variant="destructive"
                              className="h-4 text-[9px] tracking-wider uppercase"
                            >
                              {bookCopy.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-400 hover:bg-rose-100 hover:text-rose-600"
                      onClick={() => handleRemoveBook(bookCopy.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
              <Barcode className="mb-3 size-10 text-slate-300" />
              <p className="font-bold text-slate-500">Queue is empty</p>
              <p className="text-xs text-slate-400">
                Scan book barcodes to add them to the checkout queue.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-900 p-6 shadow-lg">
        <div className="flex items-center gap-4 text-white">
          <div className="rounded-full bg-slate-800 p-3">
            <Clock className="size-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Due Date</p>
            <p className="text-lg font-black tracking-wide text-white">
              {(() => {
                const d = new Date();
                d.setDate(d.getDate() + 14);
                return d.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              })()}
            </p>
          </div>
        </div>

        <Button
          onClick={handleConfirmBorrow}
          disabled={
            !selectedUser ||
            validBooksCount === 0 ||
            hasInvalidBooks ||
            borrowBulkMutation.isPending
          }
          className="h-14 rounded-xl bg-emerald-500 px-8 text-lg font-black tracking-wide text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-105 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:scale-100"
        >
          {borrowBulkMutation.isPending ? (
            <Loader2 className="mr-2 size-5 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 size-5" />
          )}
          Confirm {scannedBooks.length > 0 ? scannedBooks.length : ""} Borrow
          {scannedBooks.length > 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
