import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { type User, roleConfig } from "@/features/users/pages/UserManagement";
import { Users, Mail, Phone, Building2, School, BookOpen } from "lucide-react";
import { formatPhilippinePeso } from "@/shared/utils/currency";

export interface ViewUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function ViewUserModal({ open, onClose, user }: ViewUserModalProps) {
  if (!user) return null;

  const role = roleConfig(user.role);
  const RoleIcon = role.icon;

  const borrowings = user.borrowings ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-primary/20 max-h-[90vh] w-[95vw] overflow-x-hidden overflow-y-auto rounded-xl border p-0 shadow-sm sm:max-w-[700px]">
        {/* Header */}
        <div className="bg-primary text-primary-foreground relative overflow-hidden p-6">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute top-6 right-8 opacity-10">
            <Users size={90} className="-rotate-12" />
          </div>

          <div className="relative z-10 flex items-start gap-4">
            <Avatar className="h-20 w-20 shadow-sm ring-4 ring-white/20">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="bg-slate-100 text-2xl font-bold text-slate-400">
                {user.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="pt-2">
              <h2 className="text-2xl font-semibold text-white">
                {user.fullName}
              </h2>
              <p className="font-medium text-white/80">{user.schoolId}</p>
              <div className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                <RoleIcon className="size-3.5" />
                {role.label}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 bg-white p-6">
          {/* User Details */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
                Contact Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Email Address
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Phone Number
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
                Academic Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Department
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {user.department || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <School className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Year Level
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {user.yearLevel || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Borrowings */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-900 uppercase">
              <BookOpen className="size-4" />
              Borrowing History
            </h3>

            {borrowings.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-500">
                  No borrowing history found for this user.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-bold text-slate-500">
                          Book
                        </th>
                        <th className="px-4 py-3 font-bold text-slate-500">
                          Borrowed
                        </th>
                        <th className="px-4 py-3 font-bold text-slate-500">
                          Due
                        </th>
                        <th className="px-4 py-3 font-bold text-slate-500">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {borrowings.map((b: any) => {
                        const bookCondition =
                          b.book?.status === "LOST" ||
                          b.fines?.some((fine: { type: string }) => fine.type === "LOST")
                            ? "LOST"
                            : b.book?.condition === "DAMAGED" ||
                                b.fines?.some(
                                  (fine: { type: string }) => fine.type === "DAMAGED",
                                )
                              ? "DAMAGED"
                              : b.book?.condition || "GOOD";

                        return (
                          <tr
                            key={b.id}
                            className="transition-colors hover:bg-slate-50/50"
                          >
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900">
                              {b.book?.title || "Unknown Book"}
                            </p>
                            <p className="text-xs text-slate-500">
                              ISBN: {b.book?.isbn || "N/A"}
                            </p>
                            <Badge
                              variant={
                                bookCondition === "GOOD" ? "outline" : "destructive"
                              }
                              className={`mt-1 text-[10px] ${
                                bookCondition === "GOOD"
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : ""
                              }`}
                            >
                              {bookCondition.charAt(0) +
                                bookCondition.slice(1).toLowerCase()}
                            </Badge>
                            {b.fines?.map((fine: { id: string; amount: string; type: string; status: string }) => (
                              <p key={fine.id} className="mt-1 text-xs font-medium text-slate-500">
                                Fine: {formatPhilippinePeso(fine.amount)} {fine.type} ({fine.status})
                              </p>
                            ))}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {new Date(b.borrowDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {new Date(b.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={` ${b.status === "borrowed" ? "border-warning-bg bg-warning-bg text-warning-text" : ""} ${b.status === "returned" ? "border-success-bg bg-success-bg text-success-text" : ""} ${b.status === "overdue" ? "border-error-bg bg-error-bg text-error-text" : ""} `}
                            >
                              {b.status.charAt(0).toUpperCase() +
                                b.status.slice(1)}
                            </Badge>
                          </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
