import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Users,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Hash,
  UserCheck,
  UserX,
  GraduationCap,
  BookOpen,
  Crown,
  Mail,
  Phone,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types & seed data
// ---------------------------------------------------------------------------

type Role = "admin" | "faculty" | "student";
type Status = "active" | "inactive" | "suspended";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  status: Status;
  joinedAt: string;
  lastActive: string;
  borrowedBooks: number;
  avatarColor: string;
}

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-pink-500",
];

const ROWS_PER_PAGE = 8;

const INITIAL_USERS: User[] = [
  {
    id: "1",
    fullName: "Alexander Mitchell",
    email: "a.mitchell@lms.edu",
    phone: "+1 (555) 012-3456",
    role: "admin",
    status: "active",
    joinedAt: "Jan 12, 2024",
    lastActive: "2 mins ago",
    borrowedBooks: 0,
    avatarColor: "bg-violet-500",
  },
  {
    id: "2",
    fullName: "Dr. Sarah Chen",
    email: "s.chen@lms.edu",
    phone: "+1 (555) 234-5678",
    role: "faculty",
    status: "active",
    joinedAt: "Mar 5, 2024",
    lastActive: "1 hour ago",
    borrowedBooks: 4,
    avatarColor: "bg-blue-500",
  },
  {
    id: "3",
    fullName: "Marcus Johnson",
    email: "m.johnson@student.lms.edu",
    phone: "+1 (555) 345-6789",
    role: "student",
    status: "active",
    joinedAt: "Aug 20, 2024",
    lastActive: "3 hours ago",
    borrowedBooks: 2,
    avatarColor: "bg-emerald-500",
  },
  {
    id: "4",
    fullName: "Emily Watson",
    email: "e.watson@student.lms.edu",
    phone: "+1 (555) 456-7890",
    role: "student",
    status: "inactive",
    joinedAt: "Sep 1, 2024",
    lastActive: "5 days ago",
    borrowedBooks: 1,
    avatarColor: "bg-amber-500",
  },
  {
    id: "5",
    fullName: "Prof. David Vance",
    email: "d.vance@lms.edu",
    phone: "+1 (555) 567-8901",
    role: "faculty",
    status: "active",
    joinedAt: "Feb 14, 2024",
    lastActive: "Yesterday",
    borrowedBooks: 6,
    avatarColor: "bg-indigo-500",
  },
  {
    id: "6",
    fullName: "Sofia Martinez",
    email: "s.martinez@student.lms.edu",
    phone: "+1 (555) 678-9012",
    role: "student",
    status: "suspended",
    joinedAt: "Jul 30, 2024",
    lastActive: "2 weeks ago",
    borrowedBooks: 0,
    avatarColor: "bg-rose-500",
  },
  {
    id: "7",
    fullName: "James Lee",
    email: "j.lee@student.lms.edu",
    phone: "+1 (555) 789-0123",
    role: "student",
    status: "active",
    joinedAt: "Oct 5, 2024",
    lastActive: "Just now",
    borrowedBooks: 3,
    avatarColor: "bg-cyan-500",
  },
  {
    id: "8",
    fullName: "Dr. Priya Patel",
    email: "p.patel@lms.edu",
    phone: "+1 (555) 890-1234",
    role: "faculty",
    status: "active",
    joinedAt: "Apr 18, 2024",
    lastActive: "4 hours ago",
    borrowedBooks: 8,
    avatarColor: "bg-pink-500",
  },
  {
    id: "9",
    fullName: "Ryan Thompson",
    email: "r.thompson@student.lms.edu",
    phone: "+1 (555) 901-2345",
    role: "student",
    status: "active",
    joinedAt: "Nov 2, 2024",
    lastActive: "30 mins ago",
    borrowedBooks: 1,
    avatarColor: "bg-violet-500",
  },
  {
    id: "10",
    fullName: "Isabella Brown",
    email: "i.brown@student.lms.edu",
    phone: "+1 (555) 012-3456",
    role: "student",
    status: "inactive",
    joinedAt: "Jun 22, 2024",
    lastActive: "3 weeks ago",
    borrowedBooks: 0,
    avatarColor: "bg-blue-500",
  },
  {
    id: "11",
    fullName: "Prof. Nathan Clark",
    email: "n.clark@lms.edu",
    role: "faculty",
    status: "active",
    joinedAt: "Jan 30, 2024",
    lastActive: "2 days ago",
    borrowedBooks: 5,
    avatarColor: "bg-emerald-500",
  },
  {
    id: "12",
    fullName: "Olivia Davis",
    email: "o.davis@student.lms.edu",
    role: "student",
    status: "active",
    joinedAt: "Dec 1, 2024",
    lastActive: "10 mins ago",
    borrowedBooks: 2,
    avatarColor: "bg-amber-500",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function roleConfig(role: Role) {
  switch (role) {
    case "admin":
      return {
        label: "Admin",
        icon: Crown,
        cls: "bg-violet-100 text-violet-700 border-violet-200",
        iconCls: "text-violet-500",
      };
    case "faculty":
      return {
        label: "Faculty",
        icon: GraduationCap,
        cls: "bg-blue-100 text-blue-700 border-blue-200",
        iconCls: "text-blue-500",
      };
    case "student":
      return {
        label: "Student",
        icon: BookOpen,
        cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
        iconCls: "text-emerald-500",
      };
  }
}

function statusConfig(status: Status) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "inactive":
      return {
        label: "Inactive",
        cls: "bg-slate-100 text-slate-500 border-slate-200",
        dot: "bg-slate-400",
      };
    case "suspended":
      return {
        label: "Suspended",
        cls: "bg-rose-100 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
      };
  }
}

// ---------------------------------------------------------------------------
// Add / Edit Modal
// ---------------------------------------------------------------------------

interface UserFormData {
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: Status;
  password: string;
}

const EMPTY_FORM: UserFormData = {
  fullName: "",
  email: "",
  phone: "",
  role: "student",
  status: "active",
  password: "",
};

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  editUser: User | null;
}

function UserModal({ open, onClose, onSave, editUser }: UserModalProps) {
  const isEdit = !!editUser;
  const [form, setForm] = useState<UserFormData>(
    editUser
      ? {
          fullName: editUser.fullName,
          email: editUser.email,
          phone: editUser.phone ?? "",
          role: editUser.role,
          status: editUser.status,
          password: "",
        }
      : EMPTY_FORM,
  );
  const [showPass, setShowPass] = useState(false);

  const set = (key: keyof UserFormData) => (val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Full name and email are required.");
      return;
    }
    if (!isEdit && !form.password.trim()) {
      toast.error("Password is required for new users.");
      return;
    }
    onSave(form);
  };

  const roleIcon = roleConfig(form.role);
  const RoleIcon = roleIcon.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-3xl border-none p-0 shadow-2xl sm:max-w-[580px]">
        {/* Gradient Header */}
        <div
          className={`relative overflow-hidden p-6 text-white ${
            form.role === "admin"
              ? "bg-linear-to-br from-violet-600 to-purple-700"
              : form.role === "faculty"
                ? "bg-linear-to-br from-blue-600 to-indigo-700"
                : "bg-linear-to-br from-emerald-500 to-teal-600"
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
          {/* Name + Email row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Users className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={form.fullName}
                  onChange={(e) => set("fullName")(e.target.value)}
                  placeholder="John Doe"
                  className="rounded-xl border-slate-200 pl-9 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Email <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                  placeholder="user@lms.edu"
                  className="rounded-xl border-slate-200 pl-9 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          {/* Phone + Password */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="rounded-xl border-slate-200 pl-9 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Password {!isEdit && <span className="text-rose-500">*</span>}
                {isEdit && (
                  <span className="font-normal text-slate-400">
                    (leave blank to keep)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password")(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl border-slate-200 pr-10 pl-9 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPass ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Role <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.role}
                onValueChange={(v) => set("role")(v as Role)}
              >
                <SelectTrigger className="h-10 rounded-xl border-slate-200 focus:ring-indigo-500/20">
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
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-700">
                Account Status
              </Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status")(v as Status)}
              >
                <SelectTrigger className="h-10 rounded-xl border-slate-200 focus:ring-indigo-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <span className="font-semibold">Active</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-slate-400" />
                      <span className="font-semibold">Inactive</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="suspended">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-4 text-rose-500" />
                      <span className="font-semibold">Suspended</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 border-t border-slate-100 bg-slate-50 p-5">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl font-bold text-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className={`flex-1 rounded-xl font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-95 ${
              form.role === "admin"
                ? "bg-violet-600 shadow-violet-200 hover:bg-violet-700"
                : form.role === "faculty"
                  ? "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
                  : "bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700"
            }`}
          >
            {isEdit ? "Save Changes" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete Modal
// ---------------------------------------------------------------------------

function DeleteUserModal({
  user,
  open,
  onClose,
  onConfirm,
}: {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-3xl border-none p-0 shadow-2xl sm:max-w-sm">
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
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="h-11 flex-1 rounded-xl bg-rose-500 font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-600"
            >
              Delete User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Role Tab Filter
// ---------------------------------------------------------------------------

const ROLE_TABS: {
  value: "all" | Role;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "all", label: "All Users", icon: Users },
  { value: "admin", label: "Admins", icon: Crown },
  { value: "faculty", label: "Faculty", icon: GraduationCap },
  { value: "student", label: "Students", icon: BookOpen },
];

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState<"all" | Role>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Derived stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const facultyCount = users.filter((u) => u.role === "faculty").length;
  const studentCount = users.filter((u) => u.role === "student").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").includes(q);
      const matchRole = roleTab === "all" || u.role === roleTab;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleTab, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const onRoleTab = (v: "all" | Role) => {
    setRoleTab(v);
    setPage(1);
  };
  const onStatus = (v: string | null) => {
    if (v) {
      setStatusFilter(v as "all" | Status);
      setPage(1);
    }
  };

  const openAddModal = () => {
    setEditUser(null);
    setModalOpen(true);
  };
  const openEditModal = (user: User) => {
    setEditUser(user);
    setModalOpen(true);
  };
  const openDeleteModal = (user: User) => {
    setDeleteUser(user);
    setDeleteOpen(true);
  };

  const handleSave = (data: UserFormData) => {
    if (editUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? {
                ...u,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                role: data.role,
                status: data.status,
              }
            : u,
        ),
      );
      toast.success("User updated successfully");
    } else {
      const newUser: User = {
        id: String(Date.now()),
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        role: data.role,
        status: data.status,
        joinedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        lastActive: "Just now",
        borrowedBooks: 0,
        avatarColor:
          AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      };
      setUsers((prev) => [newUser, ...prev]);
      toast.success("New user created successfully");
    }
    setModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    setUsers((prev) => prev.filter((u) => u.id !== deleteUser?.id));
    toast.success("User removed from the system");
    setDeleteOpen(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* ── Page Header ── */}
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-indigo-400/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-violet-400/5 blur-3xl" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 animate-pulse text-indigo-500" />
            <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">
              User Control Center
            </span>
          </div>
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <div className="rounded-xl bg-indigo-50 p-2">
              <Users className="size-7 text-indigo-600" />
            </div>
            User Management
          </h1>
          <p className="ml-1 font-medium text-slate-500">
            Manage accounts, roles, and permissions across the LMS.
          </p>
        </div>

        <Button
          id="add-user-btn"
          onClick={openAddModal}
          className="relative z-10 h-11 gap-2 rounded-xl bg-indigo-600 px-6 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95"
        >
          <Plus className="size-4" />
          Add New User
        </Button>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {/* Total */}
        <div className="group col-span-1 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
          <div className="shrink-0 rounded-xl bg-indigo-50 p-3 text-indigo-600 transition-transform group-hover:scale-110">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Total Users
            </p>
            <h3 className="text-2xl font-black text-slate-900">{totalUsers}</h3>
          </div>
        </div>

        {/* Active */}
        <div className="group col-span-1 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
          <div className="shrink-0 rounded-xl bg-emerald-50 p-3 text-emerald-600 transition-transform group-hover:scale-110">
            <UserCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Active
            </p>
            <h3 className="text-2xl font-black text-emerald-700">
              {activeUsers}
            </h3>
          </div>
        </div>

        {/* Admins */}
        <div className="group col-span-1 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
          <div className="shrink-0 rounded-xl bg-violet-50 p-3 text-violet-600 transition-transform group-hover:scale-110">
            <Crown className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Admins
            </p>
            <h3 className="text-2xl font-black text-violet-700">
              {adminCount}
            </h3>
          </div>
        </div>

        {/* Faculty */}
        <div className="group col-span-1 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
          <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-600 transition-transform group-hover:scale-110">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Faculty
            </p>
            <h3 className="text-2xl font-black text-blue-700">
              {facultyCount}
            </h3>
          </div>
        </div>

        {/* Students */}
        <div className="group col-span-1 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
          <div className="shrink-0 rounded-xl bg-emerald-50 p-3 text-emerald-600 transition-transform group-hover:scale-110">
            <BookOpen className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Students
            </p>
            <h3 className="text-2xl font-black text-emerald-700">
              {studentCount}
            </h3>
          </div>
        </div>

        {/* Suspended */}
        <div className="group col-span-1 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-rose-200 hover:shadow-md">
          <div className="shrink-0 rounded-xl bg-rose-50 p-3 text-rose-600 transition-transform group-hover:scale-110">
            <UserX className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Suspended
            </p>
            <h3 className="text-2xl font-black text-rose-600">
              {suspendedCount}
            </h3>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Role Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/60 px-5 pt-4">
          {ROLE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = roleTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onRoleTab(tab.value)}
                className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "border border-b-0 border-slate-200 bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="size-3.5" />
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    isActive
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {tab.value === "all"
                    ? totalUsers
                    : tab.value === "admin"
                      ? adminCount
                      : tab.value === "faculty"
                        ? facultyCount
                        : studentCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Hash className="size-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">
              {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
            </span>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search name, email, phone…"
                className="h-10 rounded-xl border-slate-200 pl-10 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => onSearch("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={onStatus}>
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 sm:w-44">
                <Filter className="mr-1.5 size-3.5 text-slate-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-slate-100 bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[280px] py-4 pl-5 font-bold text-slate-500">
                  User
                </TableHead>
                <TableHead className="py-4 font-bold text-slate-500">
                  Role
                </TableHead>
                <TableHead className="py-4 font-bold text-slate-500">
                  Status
                </TableHead>
                <TableHead className="py-4 font-bold text-slate-500">
                  Joined
                </TableHead>
                <TableHead className="py-4 font-bold text-slate-500">
                  Last Active
                </TableHead>
                <TableHead className="py-4 text-center font-bold text-slate-500">
                  Borrowed
                </TableHead>
                <TableHead className="py-4 pr-5 text-right font-bold text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-16 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full bg-slate-100 p-4">
                        <Users className="size-8 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-500">
                          No users found
                        </p>
                        <p className="text-sm text-slate-400">
                          Try adjusting your search or filters.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((user) => {
                  const rc = roleConfig(user.role);
                  const sc = statusConfig(user.status);
                  const RoleIcon = rc.icon;
                  return (
                    <TableRow
                      key={user.id}
                      className="group transition-colors hover:bg-slate-50/60"
                    >
                      {/* User cell */}
                      <TableCell className="py-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div
                            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-sm ring-2 ring-white transition-all group-hover:scale-110 ${user.avatarColor}`}
                          >
                            {getInitials(user.fullName)}
                            {/* Online dot */}
                            {user.status === "active" && (
                              <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[160px] truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                              {user.fullName}
                            </p>
                            <p className="truncate text-xs font-medium text-slate-500">
                              {user.email}
                            </p>
                            {user.phone && (
                              <p className="text-[10px] text-slate-400">
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <Badge
                          className={`flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold shadow-sm ${rc.cls}`}
                        >
                          <RoleIcon className="size-3" />
                          {rc.label}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <div
                          className={`flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${sc.cls}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${sc.dot} ${user.status === "active" ? "animate-pulse" : ""}`}
                          />
                          {sc.label}
                        </div>
                      </TableCell>

                      {/* Joined */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <Calendar className="size-3.5 text-slate-400" />
                          {user.joinedAt}
                        </div>
                      </TableCell>

                      {/* Last Active */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <Clock className="size-3.5 text-slate-400" />
                          {user.lastActive}
                        </div>
                      </TableCell>

                      {/* Borrowed */}
                      <TableCell className="text-center">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700">
                          {user.borrowedBooks}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="pr-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />

                          <DropdownMenuContent
                            align="end"
                            className="w-44 rounded-xl border-slate-100 shadow-xl"
                          >
                            <DropdownMenuItem
                              onClick={() => openEditModal(user)}
                              className="gap-2 rounded-lg font-semibold text-slate-700 focus:bg-indigo-50 focus:text-indigo-700"
                            >
                              <Edit className="size-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setUsers((prev) =>
                                  prev.map((u) =>
                                    u.id === user.id
                                      ? {
                                          ...u,
                                          status:
                                            u.status === "active"
                                              ? "suspended"
                                              : "active",
                                        }
                                      : u,
                                  ),
                                );
                                toast.success(
                                  user.status === "active"
                                    ? "User suspended"
                                    : "User reactivated",
                                );
                              }}
                              className={`gap-2 rounded-lg font-semibold focus:bg-amber-50 focus:text-amber-700 ${
                                user.status === "active"
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {user.status === "active" ? (
                                <>
                                  <UserX className="size-4" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <UserCheck className="size-4" />
                                  Reactivate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem
                              onClick={() => openDeleteModal(user)}
                              className="gap-2 rounded-lg font-semibold text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                            >
                              <Trash2 className="size-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-xs font-semibold text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {(page - 1) * ROWS_PER_PAGE + 1}–
                {Math.min(page * ROWS_PER_PAGE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-700">
                {filtered.length}
              </span>{" "}
              users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-slate-200"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 rounded-lg text-xs font-bold ${
                    p === page
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-slate-200"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editUser={editUser}
      />
      <DeleteUserModal
        user={deleteUser}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
