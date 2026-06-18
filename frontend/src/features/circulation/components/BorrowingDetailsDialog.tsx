import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { type Borrowing } from "@/features/circulation/api/circulation";
import { statusConfig } from "../pages/BorrowingRecordsPage";

interface BorrowingDetailsDialogProps {
  selectedRecord: Borrowing | null;
  onClose: () => void;
}

export function BorrowingDetailsDialog({
  selectedRecord,
  onClose,
}: BorrowingDetailsDialogProps) {
  if (!selectedRecord) return null;

  return (
    <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto rounded-3xl p-6 sm:max-w-[600px]">
        <div tabIndex={0} className="sr-only focus:outline-none" />
        <DialogHeader className="mb-4">
          <DialogTitle
            className="text-xl font-bold text-slate-900 outline-none"
            tabIndex={-1}
            autoFocus
          >
            Borrowing Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* User Info */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="mb-3 text-sm font-bold tracking-wider text-slate-500 uppercase">
              User Information
            </h4>
            <div className="mb-4 flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage
                  src={selectedRecord.user?.avatarUrl || ""}
                  alt={selectedRecord.user?.fullName}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedRecord.user?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedRecord.user?.fullName}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedRecord.user?.email || "No email provided"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
              <div>
                <p className="text-xs font-medium text-slate-500">School ID</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedRecord.user?.schoolId}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Department</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedRecord.user?.department || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Year Level</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedRecord.user?.yearLevel || "-"}
                </p>
              </div>
            </div>
          </div>
          {/* Return Info */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="mb-3 text-sm font-bold tracking-wider text-slate-500 uppercase">
              Return Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500">Status</p>
                <Badge
                  className={`mt-1 flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-bold ${statusConfig(selectedRecord.status).cls}`}
                >
                  {statusConfig(selectedRecord.status).label}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Returned Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedRecord.returnedDate
                    ? new Date(selectedRecord.returnedDate).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Borrow Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {new Date(selectedRecord.borrowDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Due Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {new Date(selectedRecord.dueDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Fines Info */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="mb-3 text-sm font-bold tracking-wider text-slate-500 uppercase">
              Fines
            </h4>
            {selectedRecord.fines && selectedRecord.fines.length > 0 ? (
              <div className="space-y-3">
                {selectedRecord.fines.map((fine, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        ₱{Number(fine.amount).toFixed(2)}
                      </span>
                      <Badge
                        variant={
                          fine.status === "PAID" ? "default" : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {fine.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Type: {fine.type}</span>
                      <span>
                        {fine.paidAt
                          ? `Paid: ${new Date(fine.paidAt).toLocaleDateString()}`
                          : "Unpaid"}
                      </span>
                    </div>
                    {fine.reason && (
                      <p className="mt-1 text-xs text-slate-500 italic">
                        Reason: {fine.reason}
                      </p>
                    )}
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                  <span>Total Fines:</span>
                  <span>
                    ₱
                    {selectedRecord.fines
                      .reduce((sum, f) => sum + Number(f.amount), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No fines applied.</p>
            )}
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button
            onClick={onClose}
            className="w-full rounded-xl sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
