import { useState, useEffect } from "react";
import {
  Users,
  Edit,
  Plus,
  Hash,
  Mail,
  Phone,
  Building2,
  School,
  Crown,
  GraduationCap,
  BookOpen,
  Loader2,
  Shield,
  Camera,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { toast } from "sonner";
import { type UsersMeta as UsersMetaType } from "@/features/users/api/users";
import {
  type User,
  type UserFormData,
  roleConfig,
} from "@/features/users/pages/UserManagement";
import { userFormSchema } from "@/features/users/validation/userSchema";

const EMPTY_FORM: UserFormData = {
  schoolId: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  department: "",
  yearLevel: "",
  role: "student",
  avatarFile: null,
};

export interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  editUser: User | null;
  meta: UsersMetaType | undefined;
  isLoadingMeta: boolean;
  isPending?: boolean;
}

export function UserModal({
  open,
  onClose,
  onSave,
  editUser,
  meta,
  isLoadingMeta,
  isPending,
}: UserModalProps) {
  const isEdit = !!editUser;
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(
        editUser
          ? {
              schoolId: editUser.schoolId,
              fullName: editUser.fullName,
              email: editUser.email,
              phoneNumber: editUser.phone ?? "",
              department: editUser.department ?? "",
              yearLevel: editUser.yearLevel ?? "",
              role: editUser.role,
              avatarFile: null,
            }
          : EMPTY_FORM,
      );
      setErrors({});
    }
  }, [open, editUser]);

  const set = (key: keyof UserFormData) => (val: string | null) => {
    setForm((p) => ({ ...p, [key]: (val ?? "") as never }));
    if (errors[key]) {
      setErrors((p) => {
        const newErrors = { ...p };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSave = () => {
    const result = userFormSchema.safeParse(form);
    if (!result.success) {
      const formattedErrors = result.error.format();
      const newErrors: Record<string, string> = {};

      if (formattedErrors.schoolId)
        newErrors.schoolId = formattedErrors.schoolId._errors[0];
      if (formattedErrors.fullName)
        newErrors.fullName = formattedErrors.fullName._errors[0];
      if (formattedErrors.email)
        newErrors.email = formattedErrors.email._errors[0];
      if (formattedErrors.department)
        newErrors.department = formattedErrors.department._errors[0];
      if (formattedErrors.yearLevel)
        newErrors.yearLevel = formattedErrors.yearLevel._errors[0];

      setErrors(newErrors);
      toast.error("Please fix the validation errors in the form.");
      return;
    }

    setErrors({});
    onSave(form);
  };

  const roleIcon = roleConfig(form.role);
  const RoleIcon = roleIcon.icon;

  return (
    <Dialog
      key={open ? (editUser?.id ?? "create") : "closed"}
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-x-hidden overflow-y-auto rounded-3xl border-none p-0 shadow-2xl sm:max-w-[580px]">
        {/* Gradient Header */}
        <div
          className={`relative overflow-hidden p-6 text-white ${
            form.role === "admin"
              ? "bg-slate-600"
              : form.role === "faculty"
                ? "bg-linear-to-br from-blue-600 to-blue-700"
                : "bg-blue-600"
          }`}
        >
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute top-6 right-8 opacity-10">
            <Users size={90} className="-rotate-12" />
          </div>
          <DialogHeader className="relative z-10 space-y-1">
            <DialogTitle className="flex items-center gap-2.5 text-xl font-black text-white">
              {isEdit ? (
                <>
                  <Edit className="size-5" />
                  Edit User Account
                </>
              ) : (
                <>
                  <Plus className="size-5" />
                  Add New User
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-white/70">
              {isEdit
                ? `Updating information for ${editUser?.fullName}`
                : "Create a new LMS user account with role assignment."}
            </DialogDescription>
          </DialogHeader>

          {/* Role Pill in header */}
          <div className="relative z-10 mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
              <RoleIcon className="size-3.5" />
              {roleConfig(form.role).label}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="space-y-5 bg-white p-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center gap-3 pb-2">
            <div className="group relative">
              <Avatar
                className={`h-20 w-20 shadow-sm ring-2 ring-slate-100 transition-opacity ${isPending ? "opacity-50" : ""}`}
              >
                <AvatarImage
                  src={
                    form.avatarFile
                      ? URL.createObjectURL(form.avatarFile)
                      : (editUser?.avatarUrl ?? undefined)
                  }
                />
                <AvatarFallback className="bg-slate-100 text-xl font-bold text-slate-400">
                  {form.fullName ? (
                    form.fullName.charAt(0).toUpperCase()
                  ) : (
                    <Users className="size-8 opacity-20" />
                  )}
                </AvatarFallback>
              </Avatar>

              {isPending && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/10 backdrop-blur-[1px]">
                  <Loader2 className="size-6 animate-spin text-blue-600" />
                </div>
              )}

              <label
                className={`absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-white shadow-sm transition-transform ${isPending ? "cursor-not-allowed bg-slate-400" : "cursor-pointer bg-blue-600 hover:scale-110"}`}
              >
                <Camera className="size-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  disabled={isPending}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm((p) => ({ ...p, avatarFile: file }));
                  }}
                />
              </label>
            </div>
            <div className="space-y-0.5 text-center">
              <p className="text-xs font-semibold text-slate-700">
                Profile Picture
              </p>
              <p className="text-[10px] text-slate-400">
                Optional. Image file only.
              </p>
            </div>
          </div>

          {/* School ID + Full Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                School ID <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={form.schoolId}
                  onChange={(e) => set("schoolId")(e.target.value)}
                  placeholder="22-0350"
                  className={`rounded-xl pl-9 focus-visible:ring-blue-500/20 ${errors.schoolId ? "border-red-500 focus-visible:border-red-500" : "border-slate-200 focus-visible:border-blue-500"}`}
                />
              </div>
              {errors.schoolId && (
                <p className="text-xs text-red-500">{errors.schoolId}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Users className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={form.fullName}
                  onChange={(e) => set("fullName")(e.target.value)}
                  placeholder="John Doe"
                  className={`rounded-xl pl-9 focus-visible:ring-blue-500/20 ${errors.fullName ? "border-red-500 focus-visible:border-red-500" : "border-slate-200 focus-visible:border-blue-500"}`}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                  placeholder="user@lms.edu"
                  className={`rounded-xl pl-9 focus-visible:ring-blue-500/20 ${errors.email ? "border-red-500 focus-visible:border-red-500" : "border-slate-200 focus-visible:border-blue-500"}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => set("phoneNumber")(e.target.value)}
                  placeholder="09123457878"
                  className="rounded-xl border-slate-200 pl-9 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Department + Year Level */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Department <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Select
                  value={form.department}
                  onValueChange={set("department")}
                >
                  <SelectTrigger
                    className={`h-auto min-h-10 w-full rounded-xl py-2 pl-9 text-left whitespace-normal focus:ring-blue-500/20 [&>span]:line-clamp-none ${errors.department ? "border-red-500 focus:border-red-500" : "border-slate-200"}`}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingMeta ? "Loading..." : "Select department"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {meta?.departments?.map((d) => (
                      <SelectItem
                        key={d.value}
                        value={d.label}
                        className="whitespace-normal [&_span]:whitespace-normal"
                      >
                        <span className="text-left font-semibold">
                          {d.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.department && (
                <p className="text-xs text-red-500">{errors.department}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Year Level <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <School className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Select value={form.yearLevel} onValueChange={set("yearLevel")}>
                  <SelectTrigger
                    className={`h-auto min-h-10 w-full rounded-xl py-2 pl-9 text-left whitespace-normal focus:ring-blue-500/20 [&>span]:line-clamp-none ${errors.yearLevel ? "border-red-500 focus:border-red-500" : "border-slate-200"}`}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingMeta ? "Loading..." : "Select year level"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {meta?.yearLevels?.map((y) => (
                      <SelectItem
                        key={y.value}
                        value={y.label}
                        className="whitespace-normal [&_span]:whitespace-normal"
                      >
                        <span className="text-left font-semibold">
                          {y.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.yearLevel && (
                <p className="text-xs text-red-500">{errors.yearLevel}</p>
              )}
            </div>
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Role <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Shield className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Select
                  value={form.role}
                  onValueChange={(v) => set("role")((v ?? "") as string)}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 pl-9 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="size-4 text-violet-500" />
                        <span className="font-semibold">Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="faculty">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="size-4 text-blue-500" />
                        <span className="font-semibold">Faculty</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-4 text-emerald-500" />
                        <span className="font-semibold">Student</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="w-full rounded-xl font-bold text-slate-600 sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className={`w-full rounded-xl font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-95 sm:flex-1 ${
              form.role === "admin"
                ? "bg-violet-600 shadow-violet-200 hover:bg-violet-700"
                : form.role === "faculty"
                  ? "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
                  : "bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700"
            }`}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
