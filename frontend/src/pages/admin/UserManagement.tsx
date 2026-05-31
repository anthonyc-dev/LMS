import { useState, useMemo, Fragment } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Hash,
  GraduationCap,
  BookOpen,
  Crown,
  Calendar,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  useUsers,
  useUsersMeta,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type Role,
  type ApiUser,
} from "@/lib/api/users";
import { UserModal } from "@/components/admin/UserModal";
import { DeleteUserModal } from "@/components/admin/DeleteUserModal";
import { TableSkeleton } from "@/components/commons/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Types & display helpers
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  schoolId: string;
  fullName: string;
  email: string;
  department: string;
  yearLevel: string;
  phone?: string;
  role: Role;
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

function pickAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function mapApiUser(u: ApiUser): User {
  return {
    id: u._id,
    schoolId: u.schoolId,
    fullName: u.fullName,
    email: u.email,
    department: u.department,
    yearLevel: u.yearLevel,
    phone: u.phoneNumber,
    role: u.Role,
    joinedAt: new Date(u.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    lastActive: formatRelativeTime(u.updatedAt),
    borrowedBooks: 0,
    avatarColor: pickAvatarColor(),
  };
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function roleConfig(role: Role) {
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

// ---------------------------------------------------------------------------
// Add / Edit Modal
// ---------------------------------------------------------------------------

export interface UserFormData {
  schoolId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  yearLevel: string;
  role: Role;
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
  usePageTitle("User Management");
  const isMobile = useIsMobile();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState<"all" | Role>("all");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // API hooks
  const { data: apiUsers, isLoading, isError, error } = useUsers();
  const { data: meta, isLoading: isLoadingMeta } = useUsersMeta();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const users = useMemo(() => (apiUsers ?? []).map(mapApiUser), [apiUsers]);

  // Derived stats
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const facultyCount = users.filter((u) => u.role === "faculty").length;
  const studentCount = users.filter((u) => u.role === "student").length;

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").includes(q);
      const matchRole = roleTab === "all" || u.role === roleTab;
      return matchSearch && matchRole;
    });
  }, [users, search, roleTab]);

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
      updateMutation.mutate(
        {
          id: editUser.id,
          data: {
            schoolId: data.schoolId,
            fullName: data.fullName,
            email: data.email,
            department: data.department,
            yearLevel: data.yearLevel,
            phoneNumber: data.phoneNumber,
            role: data.role,
          },
        },
        {
          onSuccess: () => {
            toast.success("User updated successfully");
            setModalOpen(false);
          },
          onError: (err: unknown) => {
            const msg =
              err instanceof Error ? err.message : "Failed to update user";
            toast.error(msg);
          },
        },
      );
    } else {
      createMutation.mutate(
        {
          schoolId: data.schoolId,
          fullName: data.fullName,
          email: data.email,
          department: data.department,
          yearLevel: data.yearLevel,
          phoneNumber: data.phoneNumber,
          role: data.role,
        },
        {
          onSuccess: () => {
            toast.success("New user created successfully");
            setModalOpen(false);
          },
          onError: (err: unknown) => {
            const msg =
              err instanceof Error ? err.message : "Failed to create user";
            toast.error(msg);
          },
        },
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteUser) return;
    deleteMutation.mutate(deleteUser.id, {
      onSuccess: () => {
        toast.success("User removed from the system");
        setDeleteOpen(false);
      },
      onError: (err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to delete user";
        toast.error(msg);
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
        {/* Header Skeleton */}
        <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-80 max-w-full rounded-lg" />
          </div>
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-7 w-12 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <TableSkeleton columns={6} rows={ROWS_PER_PAGE} />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="mx-auto flex max-w-[1600px] items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="size-12 text-rose-500" />
          <p className="text-lg font-bold text-slate-800">
            Failed to load users
          </p>
          <p className="text-sm text-slate-500">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred."}
          </p>
          <Button
            variant="outline"
            className="mt-2 rounded-xl font-bold"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* ── Page Header ── */}
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-indigo-400/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-violet-400/5 blur-3xl" />

        <div className="relative z-10 space-y-1">
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <div className="rounded-xl bg-indigo-50 p-2">
              <Users className="size-7 text-slate-900" />
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
          className="relative z-10 h-11 cursor-pointer gap-2 rounded-xl bg-slate-900 px-6 font-bold text-white shadow-lg shadow-slate-200 transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
        >
          <Plus className="size-4" />
          Add New User
        </Button>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
      </div>

      {/* ── Table Card ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Role Tabs (Desktop) */}
        {!isMobile && (
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
        )}

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

            {/* Role Filter (Mobile) */}
            {isMobile && (
              <Select
                value={roleTab}
                onValueChange={(v) => onRoleTab(v as typeof roleTab)}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 sm:w-44">
                  <Users className="mr-1.5 size-3.5 text-slate-400" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {ROLE_TABS.map((tab) => {
                    const count =
                      tab.value === "all"
                        ? totalUsers
                        : tab.value === "admin"
                          ? adminCount
                          : tab.value === "faculty"
                            ? facultyCount
                            : studentCount;
                    return (
                      <SelectItem key={tab.value} value={tab.value}>
                        {tab.label} ({count})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}

            {/* Status filter */}
            {/* <Select value={statusFilter} onValueChange={onStatus}>
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
            </Select> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-slate-100 bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[280px] py-4 pl-5 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  User
                </TableHead>
                {!isMobile && (
                  <>
                    <TableHead className="py-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Role
                    </TableHead>
                  </>
                )}
                {!isMobile && (
                  <>
                    <TableHead className="hidden py-4 text-xs font-bold tracking-wider text-slate-500 uppercase md:table-cell">
                      Joined
                    </TableHead>
                    <TableHead className="hidden py-4 text-xs font-bold tracking-wider text-slate-500 uppercase lg:table-cell">
                      Last Active
                    </TableHead>
                    <TableHead className="hidden py-4 text-center text-xs font-bold tracking-wider text-slate-500 uppercase sm:table-cell">
                      Borrowed
                    </TableHead>
                  </>
                )}
                <TableHead className="py-4 pr-5 text-right text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isMobile ? 4 : 7}
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
                  const RoleIcon = rc.icon;
                  const isExpanded = isMobile && expandedRow === user.id;
                  return (
                    <Fragment key={user.id}>
                      <TableRow
                        className={`group transition-colors hover:bg-slate-50/60 ${isMobile ? "cursor-pointer" : ""}`}
                        onClick={() => {
                          if (isMobile) {
                            setExpandedRow(isExpanded ? null : user.id);
                          }
                        }}
                      >
                        {/* User cell */}
                        <TableCell className="py-3.5 pl-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-sm ring-2 ring-white transition-all group-hover:scale-110 ${user.avatarColor}`}
                            >
                              {getInitials(user.fullName)}
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
                            {isMobile && (
                              <div className="ml-auto flex items-center justify-end">
                                <ChevronDown
                                  className={`size-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Role */}
                        {!isMobile && (
                          <>
                            <TableCell>
                              <Badge
                                className={`flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold shadow-sm ${rc.cls}`}
                              >
                                <RoleIcon className="size-3" />
                                {rc.label}
                              </Badge>
                            </TableCell>
                          </>
                        )}

                        {/* Joined */}
                        {!isMobile && (
                          <>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                <Calendar className="size-3.5 text-slate-400" />
                                {user.joinedAt}
                              </div>
                            </TableCell>

                            {/* Last Active */}
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                <Clock className="size-3.5 text-slate-400" />
                                {user.lastActive}
                              </div>
                            </TableCell>

                            {/* Borrowed */}
                            <TableCell className="hidden text-center sm:table-cell">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700">
                                {user.borrowedBooks}
                              </span>
                            </TableCell>
                          </>
                        )}

                        {/* Actions */}
                        <TableCell className="pr-5 text-right">
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-8 w-8 rounded-lg text-slate-400 transition-opacity hover:bg-slate-100 hover:text-slate-700 ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                }
                              />

                              <DropdownMenuContent
                                align="end"
                                sideOffset={8}
                                className="w-44 rounded-xl border-slate-100 shadow-xl"
                              >
                                <DropdownMenuItem
                                  onClick={() => openEditModal(user)}
                                  className="gap-2 rounded-lg font-semibold text-slate-700 focus:bg-indigo-50 focus:text-indigo-700"
                                >
                                  <Edit className="size-4" />
                                  Edit User
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
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                          <TableCell
                            colSpan={2}
                            className="border-b border-slate-100 p-0"
                          >
                            <div className="flex flex-col gap-3 px-5 py-4 text-sm">
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Role
                                </span>
                                <Badge
                                  className={`flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm ${rc.cls}`}
                                >
                                  <RoleIcon className="size-3" />
                                  {rc.label}
                                </Badge>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Joined
                                </span>
                                <span className="font-bold text-slate-800">
                                  {user.joinedAt}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Last Active
                                </span>
                                <span className="font-bold text-slate-800">
                                  {user.lastActive}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-500">
                                  Borrowed
                                </span>
                                <span className="font-bold text-slate-800">
                                  {user.borrowedBooks} books
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row">
            <p className="order-2 text-xs font-medium text-slate-500 sm:order-1">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–
                {Math.min(page * ROWS_PER_PAGE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-700">
                {filtered.length}
              </span>{" "}
              users
            </p>
            <div className="order-1 flex items-center gap-2 sm:order-2">
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
                  className={`h-8 w-8 cursor-pointer rounded-lg text-xs font-bold ${
                    p === page
                      ? "bg-slate-900 text-white shadow-sm shadow-slate-200 hover:bg-slate-800"
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
        meta={meta}
        isLoadingMeta={isLoadingMeta}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
      <DeleteUserModal
        user={deleteUser}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
