import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { type User } from "@/features/users/pages/UserManagement";

export function DeleteUserModal({
  user,
  open,
  onClose,
  onConfirm,
  isPending,
}: {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}) {
  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] overflow-hidden rounded-3xl border-none p-0 shadow-2xl sm:max-w-sm">
        <div className="space-y-5 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <AlertCircle size={32} className="text-rose-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">Delete User?</h3>
            <p className="text-sm font-medium text-slate-500">
              Are you sure you want to permanently remove{" "}
              <span className="font-bold text-slate-800">
                "{user.fullName}"
              </span>{" "}
              from the system? This cannot be undone.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="h-11 w-full rounded-xl font-bold sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isPending}
              className="h-11 w-full rounded-xl bg-rose-500 font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-600 sm:flex-1"
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
