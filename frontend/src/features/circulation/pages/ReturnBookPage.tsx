import { useState, useEffect } from "react";
import {
  Book,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Loader2,
  Plus,
  Trash2,
  ScanBarcode,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useActiveBorrowingByBarcode,
  useReturnBook,
  useCreateFine,
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
  const createFineMutation = useCreateFine();

  type FineEntry = {
    id: string;
    type: "OVERDUE" | "DAMAGED" | "LOST";
    amount: string;
    reason: string;
    status: "UNPAID" | "PAID" | "WAIVED";
  };
  const [fines, setFines] = useState<FineEntry[]>([]);
  const [returnCondition, setReturnCondition] = useState<string>("GOOD");

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeSearch.trim()) return;
    setScannedBarcode(barcodeSearch.trim());
    setBarcodeSearch("");
  };

  const handleConfirmReturn = async () => {
    if (!borrowing) {
      toast.error("No valid borrowing record to return.");
      return;
    }

    try {
      const validFines = fines.filter((f) => Number(f.amount) > 0);

      if (validFines.length > 0) {
        await Promise.all(
          validFines.map((fine) =>
            createFineMutation.mutateAsync({
              borrowingId: borrowing.id,
              type: fine.type,
              status: fine.status,
              amount: Number(fine.amount),
              reason: fine.reason || undefined,
            }),
          ),
        );
      }

      await returnMutation.mutateAsync({
        borrowingId: borrowing.id,
        condition: returnCondition,
      });
      toast.success("Book returned successfully!");
      setScannedBarcode(""); // Reset view
      setFines([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to process return");
    }
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

  useEffect(() => {
    if (borrowing) {
      if (borrowing.bookCopy?.condition) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReturnCondition(borrowing.bookCopy.condition);
      } else {
        setReturnCondition("GOOD");
      }

      if (isOverdue) {
        setFines([
          {
            id: "auto-overdue",
            type: "OVERDUE",
            amount: String(penalty),
            reason: `Overdue by ${days} days`,
            status: "UNPAID",
          },
        ]);
      } else {
        setFines([]);
      }
    }
  }, [borrowing, isOverdue, penalty, days]);

  const handleAddFine = () => {
    setFines([
      ...fines,
      {
        id: Date.now().toString(),
        type: "DAMAGED",
        amount: "",
        reason: "",
        status: "UNPAID",
      },
    ]);
  };

  const handleRemoveFine = (id: string) => {
    setFines(fines.filter((f) => f.id !== id));
  };

  const handleUpdateFine = (
    id: string,
    field: keyof FineEntry,
    value: string,
  ) => {
    setFines(fines.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-6xl space-y-6 duration-700">
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <RotateCcw className="size-8 text-blue-600" />
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
                <ScanBarcode className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={barcodeSearch}
                  onChange={(e) => setBarcodeSearch(e.target.value)}
                  placeholder="Scan book barcode (e.g. BC-1234)..."
                  className="h-10 rounded-lg border border-slate-200 pl-10 text-sm font-semibold tracking-wide focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  autoFocus
                />
                <Button
                  type="submit"
                  className="absolute top-1 right-1 h-8 rounded-md bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700"
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <Loader2 className="size-3.5 animate-spin" />
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
                    <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-300">
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
                      className={`rounded-xl border p-3 ${isOverdue ? "border-error-bg bg-error-bg" : "border-slate-100 bg-slate-50"}`}
                    >
                      <p
                        className={`flex items-center gap-1 text-xs font-bold tracking-wider uppercase ${isOverdue ? "text-error-text" : "text-slate-400"}`}
                      >
                        <Calendar className="size-3" /> Due Date
                      </p>
                      <p
                        className={`mt-1 font-bold ${isOverdue ? "text-error-text" : "text-slate-700"}`}
                      >
                        {new Date(borrowing.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : scannedBarcode && !isFetching && error ? (
            <div className="border-error-bg bg-error-bg flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
              <XCircle className="text-error-text mb-4 size-12" />
              <p className="text-error-text text-lg font-bold">
                No active borrowing found
              </p>
              <p className="text-error-text mt-1 text-sm">
                Barcode '{scannedBarcode}' does not have an active borrowing
                record.
              </p>
              <Button
                variant="outline"
                className="border-error-bg text-error-text hover:bg-error-bg mt-6 font-bold"
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
                <ArrowLeftRight className="size-4" /> Return Summary
              </h3>
            </div>

            <div className="flex flex-1 flex-col p-6">
              {borrowing?.user && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={borrowing.user.avatarUrl} />
                    <AvatarFallback className="bg-blue-100 font-bold text-blue-700">
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
                  <Select
                    value={returnCondition}
                    onValueChange={(val) => { if (val) setReturnCondition(val); }}
                  >
                    <SelectTrigger className="h-8 w-32 bg-white text-xs font-bold text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="GOOD">Good</SelectItem>
                      <SelectItem value="FAIR">Fair</SelectItem>
                      <SelectItem value="POOR">Poor</SelectItem>
                      <SelectItem value="DAMAGED">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-4">
                  <span className="text-sm font-medium text-slate-500">
                    Overdue Days
                  </span>
                  <span
                    className={`font-bold ${isOverdue ? "text-error-text" : "text-slate-900"}`}
                  >
                    {days} Days
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-slate-900">
                    Calculated Penalty
                  </span>
                  <span
                    className={`text-xl font-black ${penalty > 0 ? "text-error-text" : "text-success-text"}`}
                  >
                    ₱{penalty.toFixed(2)}
                  </span>
                </div>

                {/* Fines Section */}
                <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-slate-700">Fines</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddFine}
                      className="h-8 gap-1 text-xs"
                    >
                      <Plus className="size-3" />
                      Add Fine
                    </Button>
                  </div>

                  {fines.length === 0 && (
                    <p className="text-sm text-slate-500">No fines added.</p>
                  )}

                  {fines.map((fine, index) => (
                    <div
                      key={fine.id}
                      className="relative space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                          Fine #{index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFine(fine.id)}
                          className="size-6 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      <div className="grid w-full grid-cols-2 gap-3">
                        <div className="w-full space-y-1">
                          <Label className="text-xs text-slate-500">Type</Label>
                          <Select
                            value={fine.type}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onValueChange={(val: any) =>
                              handleUpdateFine(fine.id, "type", val)
                            }
                          >
                            <SelectTrigger className="h-9 w-full bg-white text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OVERDUE">Overdue</SelectItem>
                              <SelectItem value="DAMAGED">Damaged</SelectItem>
                              <SelectItem value="LOST">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-500">
                            Status
                          </Label>
                          <Select
                            value={fine.status}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onValueChange={(val: any) =>
                              handleUpdateFine(fine.id, "status", val)
                            }
                          >
                            <SelectTrigger className="h-9 w-full bg-white text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UNPAID">Unpaid</SelectItem>
                              <SelectItem value="PAID">Paid</SelectItem>
                              <SelectItem value="WAIVED">Waived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs text-slate-500">
                            Amount (₱)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={fine.amount}
                            onChange={(e) =>
                              handleUpdateFine(
                                fine.id,
                                "amount",
                                e.target.value,
                              )
                            }
                            className="h-9 w-full bg-white text-sm font-bold text-red-600"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Reason</Label>
                        <Textarea
                          value={fine.reason}
                          onChange={(e) =>
                            handleUpdateFine(fine.id, "reason", e.target.value)
                          }
                          className="min-h-[60px] bg-white text-sm"
                          placeholder="e.g. Returned with water damage"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-6">
                {isOverdue && (
                  <div className="bg-error-bg text-error-text mb-4 flex items-start gap-2 rounded-lg p-3 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <p>
                      This book is overdue. Please ensure fines are collected if
                      applicable before confirming.
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleConfirmReturn}
                  disabled={
                    !borrowing ||
                    returnMutation.isPending ||
                    createFineMutation.isPending
                  }
                  className="h-10 w-full rounded-lg bg-blue-600 text-sm font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700"
                >
                  {returnMutation.isPending || createFineMutation.isPending ? (
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 size-4" />
                  )}
                  Confirm Return{" "}
                  {fines.length > 0 ? `& Add ${fines.length} Fine(s)` : ""}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setScannedBarcode("")}
                  className="h-10 w-full rounded-lg text-sm font-bold text-slate-600"
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
