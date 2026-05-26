import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Shield,
  MapPin,
  Mail,
  Phone,
  User,
  IdCard,
  Lock,
  Key,
  Camera,
  Edit3,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
  Save,
  X,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { LoadingOverlay } from "@/components/commons/loading-overlay";

// Role-specific color configs
const roleConfig: Record<
  string,
  {
    label: string;
    gradient: string;
    iconBg: string;
    accent: string;
    icon: React.ReactNode;
  }
> = {
  admin: {
    label: "Super Administrator",
    gradient: "from-rose-600 via-pink-600 to-purple-700",
    iconBg: "bg-rose-50 text-rose-600",
    accent: "text-rose-600",
    icon: <Shield className="size-4" />,
  },
  faculty: {
    label: "Faculty Member",
    gradient: "from-violet-600 via-indigo-600 to-blue-700",
    iconBg: "bg-violet-50 text-violet-600",
    accent: "text-violet-600",
    icon: <GraduationCap className="size-4" />,
  },
  student: {
    label: "Student",
    gradient: "from-blue-600 via-sky-500 to-indigo-600",
    iconBg: "bg-blue-50 text-blue-600",
    accent: "text-blue-600",
    icon: <BookOpen className="size-4" />,
  },
};

export function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const role = user?.role ?? "student";
  const cfg = roleConfig[role] ?? roleConfig.student;

  // Editable field state — seeded from store
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [schoolId, setSchoolId] = useState(user?.schoolId ?? "");
  const [phone, setPhone] = useState("+63 (912) 345-6789");
  const [location, setLocation] = useState("Main Library, NCMC");

  const initials = (user?.fullName ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = () => {
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }
    updateUser({
      fullName: fullName.trim(),
      email: email.trim(),
      schoolId: schoolId.trim(),
    });
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    setFullName(user?.fullName ?? "");
    setEmail(user?.email ?? "");
    setSchoolId(user?.schoolId ?? "");
    setIsEditing(false);
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    } finally {
      setIsLoggingOut(false);
    }
    logout();
    toast.success("Signed out successfully.");
    navigate("/login");
  };

  return (
    <>
      <LoadingOverlay
        isOpen={isLoggingOut}
        label="Signing Out"
        sublabel="Clearing your session..."
      />
      <div className="animate-fade-in mx-auto max-w-[1400px] space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div
              className={`flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase ${cfg.accent}`}
            >
              {cfg.icon}
              <span>Account Management</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              My{" "}
              <span
                className={`bg-linear-to-r bg-clip-text text-transparent ${cfg.gradient}`}
              >
                Profile
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-9 cursor-pointer rounded-lg px-4 text-sm font-bold text-slate-500 hover:bg-slate-100"
                >
                  <X className="mr-1.5 size-3.5" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="h-9 cursor-pointer rounded-lg bg-slate-900 px-5 text-sm font-bold text-white transition-all hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-200"
                >
                  <Save className="mr-1.5 size-3.5" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="h-9 cursor-pointer rounded-lg bg-slate-900 px-5 text-sm font-bold text-white transition-all hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-200"
              >
                <Edit3 className="mr-1.5 size-3.5" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN */}
          <div className="space-y-5 lg:col-span-4">
            {/* Profile Identity Card */}
            <Card className="overflow-hidden border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
              {/* Gradient cover banner */}
              <div
                className={`h-28 bg-linear-to-br ${cfg.gradient} relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-20" />
                <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-white/10 blur-xl" />
              </div>

              {/* Avatar */}
              <CardHeader className="relative z-10 -mt-14 pb-0 text-center">
                <div className="flex justify-center">
                  <div className="group relative">
                    <Avatar className="h-28 w-28 shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage src="" />
                      <AvatarFallback
                        className={`bg-linear-to-br ${cfg.gradient} text-2xl font-black text-white`}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute right-0.5 bottom-0.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-100 bg-white text-slate-600 shadow-md transition-all hover:bg-indigo-50 hover:text-indigo-600">
                      <Camera className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 pb-2">
                  <CardTitle className="text-xl leading-tight font-black text-slate-900">
                    {user?.fullName ?? "User"}
                  </CardTitle>
                  <div
                    className={`flex items-center justify-center gap-1.5 text-sm font-bold ${cfg.accent}`}
                  >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 px-5 pb-5">
                {/* Status / Member info */}
                <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Account Status
                    </span>
                    <Badge className="flex items-center gap-1 border-none bg-emerald-500/10 px-2.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      School / Staff ID
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {user?.schoolId ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Member Since
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      Jan 2024
                    </span>
                  </div>
                </div>

                {/* Contact quick-view */}
                <div className="space-y-2">
                  {[
                    {
                      icon: <Mail className="size-3.5" />,
                      label: "Email",
                      value: user?.email ?? "—",
                    },
                    {
                      icon: <MapPin className="size-3.5" />,
                      label: "Location",
                      value: location,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <div className="shrink-0 rounded-lg bg-slate-100 p-1.5 text-slate-500 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-500">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] leading-none font-black tracking-widest text-slate-400 uppercase">
                          {item.label}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-bold text-slate-700">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sign out */}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="h-9 w-full cursor-pointer rounded-xl text-sm font-bold text-rose-500 transition-all hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`rounded-xl bg-linear-to-br p-5 ${cfg.gradient} relative overflow-hidden text-white shadow-sm`}
              >
                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
                <div className="mb-3 w-fit rounded-lg bg-white/20 p-2">
                  <BookOpen className="size-4" />
                </div>
                <p className="mb-0.5 text-[10px] font-bold tracking-widest text-white/70 uppercase">
                  Books Borrowed
                </p>
                <h4 className="text-3xl font-black tracking-tighter">24</h4>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-slate-900 p-5 text-white shadow-sm">
                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/5 blur-xl" />
                <div className="mb-3 w-fit rounded-lg bg-white/10 p-2">
                  <Clock className="size-4" />
                </div>
                <p className="mb-0.5 text-[10px] font-bold tracking-widest text-white/70 uppercase">
                  On Time Rate
                </p>
                <h4 className="text-3xl font-black tracking-tighter">98%</h4>
              </div>
            </div>

            {/* Reading Progress */}
            <Card className="border border-slate-100 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-indigo-500" />
                    <span className="text-xs font-black text-slate-700">
                      Semester Goal
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    5 / 12 books
                  </span>
                </div>
                <Progress
                  value={42}
                  className="h-2 bg-slate-100 [&>div]:bg-indigo-500"
                />
                <p className="text-[10px] font-semibold text-slate-400">
                  42% — Keep it up! 7 more books to reach your goal.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5 lg:col-span-8">
            {/* Personal Information Card */}
            <Card className="border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-5">
                <div>
                  <CardTitle className="text-base font-black text-slate-900">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs font-medium text-slate-400">
                    {isEditing
                      ? "Edit your fields and click Save Changes above."
                      : "Hover any field to reveal details."}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 rounded-full border-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-600"
                >
                  <BadgeCheck className="size-3" />
                  Verified
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Full Name */}
                  <div className="group space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors group-hover:text-indigo-500">
                      <User className="size-3" />
                      <span>Full Name</span>
                    </div>
                    {isEditing ? (
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-9 rounded-lg text-sm font-bold"
                      />
                    ) : (
                      <>
                        <p className="text-base font-black text-slate-900">
                          {user?.fullName ?? "—"}
                        </p>
                        <div className="h-px w-0 rounded-full bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                      </>
                    )}
                  </div>

                  {/* School / Staff ID */}
                  <div className="group space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors group-hover:text-indigo-500">
                      <IdCard className="size-3" />
                      <span>
                        {role === "student" ? "School ID" : "Staff ID"}
                      </span>
                    </div>
                    {isEditing ? (
                      <Input
                        value={schoolId}
                        onChange={(e) => setSchoolId(e.target.value)}
                        className="h-9 rounded-lg text-sm font-bold"
                      />
                    ) : (
                      <>
                        <p className="text-base font-black text-slate-900">
                          {user?.schoolId ?? "—"}
                        </p>
                        <div className="h-px w-0 rounded-full bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                      </>
                    )}
                  </div>

                  {/* Email */}
                  <div className="group space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors group-hover:text-indigo-500">
                      <Mail className="size-3" />
                      <span>Email Address</span>
                    </div>
                    {isEditing ? (
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-9 rounded-lg text-sm font-bold"
                      />
                    ) : (
                      <>
                        <p className="text-base font-black text-slate-900">
                          {user?.email ?? "—"}
                        </p>
                        <div className="h-px w-0 rounded-full bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                      </>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div className="group space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors group-hover:text-indigo-500">
                      <Phone className="size-3" />
                      <span>Contact Number</span>
                    </div>
                    {isEditing ? (
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-9 rounded-lg text-sm font-bold"
                      />
                    ) : (
                      <>
                        <p className="text-base font-black text-slate-900">
                          {phone}
                        </p>
                        <div className="h-px w-0 rounded-full bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                      </>
                    )}
                  </div>

                  {/* Location */}
                  <div className="group space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors group-hover:text-indigo-500">
                      <MapPin className="size-3" />
                      <span>Location / Department</span>
                    </div>
                    {isEditing ? (
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="h-9 rounded-lg text-sm font-bold"
                      />
                    ) : (
                      <>
                        <p className="text-base font-black text-slate-900">
                          {location}
                        </p>
                        <div className="h-px w-0 rounded-full bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                      </>
                    )}
                  </div>

                  {/* Role */}
                  <div className="group space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors group-hover:text-indigo-500">
                      <Shield className="size-3" />
                      <span>Account Role</span>
                    </div>
                    <p className="text-base font-black text-slate-900 capitalize">
                      {user?.role ?? "—"}
                    </p>
                    <div className="h-px w-0 rounded-full bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Cards Row */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* 2FA Card */}
              <Card className="group border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="space-y-4 p-6">
                  <div className="w-fit rounded-xl bg-indigo-50 p-2.5 text-indigo-600 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                    <Lock className="size-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-slate-900">
                      Two-Factor Authentication
                    </h4>
                    <p className="text-xs leading-relaxed font-medium text-slate-500">
                      2FA is currently{" "}
                      <span className="font-bold text-emerald-500">
                        Enabled
                      </span>
                      . Your account is protected with an additional security
                      layer.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                    <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                      Protection Active
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="h-9 w-full cursor-pointer rounded-lg border-slate-200 text-xs font-bold transition-all hover:border-indigo-500 hover:text-indigo-600"
                  >
                    Configure 2FA
                  </Button>
                </CardContent>
              </Card>

              {/* Password Card */}
              <Card className="group border-0 bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1">
                <CardContent className="space-y-4 p-6">
                  <div className="w-fit rounded-xl bg-white/10 p-2.5 text-white">
                    <Key className="size-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-white">
                      Password & Credentials
                    </h4>
                    <p className="text-xs leading-relaxed font-medium text-slate-400">
                      Last changed 3 months ago. We recommend updating every 6
                      months for optimal security.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Calendar className="size-3.5 shrink-0 text-slate-400" />
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Next recommended: Aug 2026
                    </span>
                  </div>
                  <Button className="h-9 w-full cursor-pointer rounded-lg bg-white text-xs font-black text-slate-900 transition-all hover:bg-indigo-500 hover:text-white">
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
