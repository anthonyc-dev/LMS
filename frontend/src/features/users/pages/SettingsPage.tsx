import { useState } from "react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { useAuthStore } from "@/app/store/authStore";
import {
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
  useChangePassword,
  useUpdateUserProfile,
} from "../api/users";
import { toast } from "sonner";

const ChromeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" x2="12" y1="8" y2="8" />
    <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
    <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
  </svg>
);

export function SettingsPage() {
  usePageTitle("Settings");
  const { user, updateUser } = useAuthStore();

  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const updateProfileMutation = useUpdateUserProfile();

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const changePasswordMutation = useChangePassword();

  const handleEmailSubmit = () => {
    if (!newEmail || !user?.id) return;
    const formData = new FormData();
    formData.append("email", newEmail.trim());
    updateProfileMutation.mutate(
      { id: user.id, data: formData },
      {
        onSuccess: (updatedUser) => {
          updateUser(updatedUser);
          toast.success("Email updated successfully");
          setIsEmailDialogOpen(false);
          setNewEmail("");
        },
        onError: () => toast.error("Failed to update email"),
      }
    );
  };

  const handlePasswordSubmit = () => {
    if (!oldPassword || !newPassword || !user?.id) return;
    changePasswordMutation.mutate(
      { id: user.id, data: { oldPassword, newPassword } },
      {
        onSuccess: () => {
          toast.success("Password changed successfully");
          setIsPasswordDialogOpen(false);
          setOldPassword("");
          setNewPassword("");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to change password");
        },
      }
    );
  };

  const { data: sessionsData, isLoading: isSessionsLoading } = useSessions();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllSessionsMutation = useRevokeAllSessions();

  const sessions = sessionsData?.sessions || [];

  const handleRevokeSession = (id: string) => {
    revokeSessionMutation.mutate(id, {
      onSuccess: () => toast.success("Session revoked successfully"),
      onError: () => toast.error("Failed to revoke session"),
    });
  };

  const handleRevokeAll = () => {
    revokeAllSessionsMutation.mutate(undefined, {
      onSuccess: () => toast.success("All other sessions revoked successfully"),
      onError: () => toast.error("Failed to revoke sessions"),
    });
  };

  return (
    <div className="mx-auto max-w-[800px] space-y-8 pb-12 font-sans">
      {/* Page Title */}
      <h1 className="text-lg font-semibold">Settings</h1>
      {/* Account Security Card */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="px-6 py-5">
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
            Account security
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Set up security measure for better protection
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col p-0">
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5 transition-colors hover:bg-slate-50/50">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                Email
              </span>
              <span className="text-sm text-slate-600">
                {user?.email || "No email provided"}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setNewEmail(user?.email || "");
                setIsEmailDialogOpen(true);
              }}
              className="h-9 cursor-pointer rounded-md border-slate-200 px-4 text-[13px] font-semibold text-slate-900 shadow-none hover:bg-slate-100"
            >
              Change email
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5 transition-colors hover:bg-slate-50/50">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                Password
              </span>
              <span className="text-sm text-slate-600">
                Ensure your account is using a long, random password to stay
                secure
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setOldPassword("");
                setNewPassword("");
                setIsPasswordDialogOpen(true);
              }}
              className="h-9 cursor-pointer rounded-md border-slate-200 px-4 text-[13px] font-semibold text-slate-900 shadow-none hover:bg-slate-100"
            >
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Card */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between px-6 py-5 sm:items-center">
          <div className="space-y-1.5">
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
              Sessions
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Places where you're logged into Oneleet
            </CardDescription>
          </div>
          <Button
            onClick={handleRevokeAll}
            disabled={revokeAllSessionsMutation.isPending}
            variant="outline"
            className="h-9 cursor-pointer rounded-md border-slate-200 px-4 text-[13px] font-semibold text-slate-900 shadow-none hover:bg-slate-100"
          >
            Sign out all other sessions
          </Button>
        </CardHeader>

        <CardContent className="px-6 pt-2 pb-6">
          {isSessionsLoading ? (
            <div className="text-sm text-slate-500">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-sm text-slate-500">No active sessions found.</div>
          ) : (
            <div className="space-y-6">
              {/* Sessions List */}
              <div className="space-y-3">
                <div className="flex flex-col gap-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {sessions.map((session: any, index: number) => {
                    const isCurrent = index === 0; // Most recently used is likely current
                    return (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-md ${
                          isCurrent ? "border-slate-200 bg-slate-50" : "border-slate-100 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/50">
                            <ChromeIcon className="size-[22px] text-slate-400" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold tracking-tight text-slate-900">
                              {session.deviceInfo}
                            </span>
                            <span className="text-xs text-slate-500">
                              {isCurrent ? (
                                <span className="font-medium tracking-tight text-blue-600">
                                  • Current session
                                </span>
                              ) : (
                                `Last seen ${new Date(session.lastUsedAt).toLocaleString()}`
                              )}{" "}
                              · IP: {session.ipAddress}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokeSessionMutation.isPending}
                          className="cursor-pointer text-[13px] font-medium text-slate-700 transition-colors hover:text-slate-900 disabled:opacity-50"
                        >
                          Sign out
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Change Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
            <DialogDescription>
              Enter your new email address below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Email</label>
              <Input
                type="email"
                placeholder="new@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEmailSubmit} disabled={updateProfileMutation.isPending || !newEmail}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={changePasswordMutation.isPending || !oldPassword || !newPassword}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
