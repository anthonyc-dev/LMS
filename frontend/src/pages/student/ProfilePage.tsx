import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
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
} from "lucide-react"
import api from "@/lib/axios"
import { useNavigate } from "react-router-dom"

// Role-specific color configs
const roleConfig: Record<string, { label: string; gradient: string; iconBg: string; accent: string; icon: React.ReactNode }> = {
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
}

export function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore()
  const navigate = useNavigate()

  const role = user?.role ?? "student"
  const cfg = roleConfig[role] ?? roleConfig.student

  // Editable field state — seeded from store
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.fullName ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [schoolId, setSchoolId] = useState(user?.schoolId ?? "")
  const [phone, setPhone] = useState("+63 (912) 345-6789")
  const [location, setLocation] = useState("Main Library, NCMC")

  const initials = (user?.fullName ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleSave = () => {
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty.")
      return
    }
    updateUser({ fullName: fullName.trim(), email: email.trim(), schoolId: schoolId.trim() })
    setIsEditing(false)
    toast.success("Profile updated successfully!")
  }

  const handleCancel = () => {
    setFullName(user?.fullName ?? "")
    setEmail(user?.email ?? "")
    setSchoolId(user?.schoolId ?? "")
    setIsEditing(false)
  }

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
    } catch { /* ignore */ }
    logout()
    toast.success("Signed out successfully.")
    navigate("/login")
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 animate-fade-in">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className={`flex items-center gap-1.5 font-bold tracking-widest uppercase text-xs ${cfg.accent}`}>
            {cfg.icon}
            <span>Account Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            My <span className={`text-transparent bg-clip-text bg-linear-to-r ${cfg.gradient}`}>Profile</span>
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="h-9 px-4 rounded-lg font-bold text-slate-500 hover:bg-slate-100 text-sm cursor-pointer"
              >
                <X className="size-3.5 mr-1.5" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="h-9 px-5 rounded-lg bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-200 font-bold text-sm transition-all cursor-pointer"
              >
                <Save className="size-3.5 mr-1.5" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="h-9 px-5 rounded-lg bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-200 font-bold text-sm transition-all cursor-pointer"
            >
              <Edit3 className="size-3.5 mr-1.5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-12">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-5">

          {/* Profile Identity Card */}
          <Card className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            {/* Gradient cover banner */}
            <div className={`h-28 bg-linear-to-br ${cfg.gradient} relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-xl" />
            </div>

            {/* Avatar */}
            <CardHeader className="text-center -mt-14 relative z-10 pb-0">
              <div className="flex justify-center">
                <div className="relative group">
                  <Avatar className="h-28 w-28 ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage src="" />
                    <AvatarFallback className={`bg-linear-to-br ${cfg.gradient} text-white text-2xl font-black`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0.5 right-0.5 h-8 w-8 rounded-full bg-white text-slate-600 shadow-md border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center cursor-pointer">
                    <Camera className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-1 pb-2">
                <CardTitle className="text-xl font-black text-slate-900 leading-tight">
                  {user?.fullName ?? "User"}
                </CardTitle>
                <div className={`flex items-center justify-center gap-1.5 font-bold text-sm ${cfg.accent}`}>
                  {cfg.icon}
                  <span>{cfg.label}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-5 pb-5 space-y-4">
              {/* Status / Member info */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Account Status</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px] uppercase tracking-wider px-2.5 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">School / Staff ID</span>
                  <span className="font-black text-slate-800 text-xs">{user?.schoolId ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Member Since</span>
                  <span className="font-black text-slate-800 text-xs">Jan 2024</span>
                </div>
              </div>

              {/* Contact quick-view */}
              <div className="space-y-2">
                {[
                  { icon: <Mail className="size-3.5" />, label: "Email", value: user?.email ?? "—" },
                  { icon: <MapPin className="size-3.5" />, label: "Location", value: location },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
                      <p className="text-xs font-bold text-slate-700 truncate mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sign out */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold rounded-xl h-9 text-sm transition-all cursor-pointer"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-5 rounded-xl bg-linear-to-br ${cfg.gradient} text-white shadow-sm relative overflow-hidden`}>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
              <div className="p-2 rounded-lg bg-white/20 w-fit mb-3">
                <BookOpen className="size-4" />
              </div>
              <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest mb-0.5">Books Borrowed</p>
              <h4 className="text-3xl font-black tracking-tighter">24</h4>
            </div>
            <div className="p-5 rounded-xl bg-slate-900 text-white shadow-sm relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
              <div className="p-2 rounded-lg bg-white/10 w-fit mb-3">
                <Clock className="size-4" />
              </div>
              <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest mb-0.5">On Time Rate</p>
              <h4 className="text-3xl font-black tracking-tighter">98%</h4>
            </div>
          </div>

          {/* Reading Progress */}
          <Card className="border border-slate-100 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-indigo-500" />
                  <span className="text-xs font-black text-slate-700">Semester Goal</span>
                </div>
                <span className="text-xs font-bold text-slate-500">5 / 12 books</span>
              </div>
              <Progress value={42} className="h-2 bg-slate-100 [&>div]:bg-indigo-500" />
              <p className="text-[10px] text-slate-400 font-semibold">42% — Keep it up! 7 more books to reach your goal.</p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-5">

          {/* Personal Information Card */}
          <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-slate-50 px-6 py-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-slate-900">Personal Information</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400 mt-0.5">
                  {isEditing ? "Edit your fields and click Save Changes above." : "Hover any field to reveal details."}
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-indigo-100 text-indigo-600 font-bold text-[10px] px-2.5 py-1 flex items-center gap-1 rounded-full">
                <BadgeCheck className="size-3" />
                Verified
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2 group">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <User className="size-3" />
                    <span>Full Name</span>
                  </div>
                  {isEditing ? (
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-9 rounded-lg text-sm font-bold" />
                  ) : (
                    <>
                      <p className="text-base font-black text-slate-900">{user?.fullName ?? "—"}</p>
                      <div className="h-px w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full" />
                    </>
                  )}
                </div>

                {/* School / Staff ID */}
                <div className="space-y-2 group">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <IdCard className="size-3" />
                    <span>{role === "student" ? "School ID" : "Staff ID"}</span>
                  </div>
                  {isEditing ? (
                    <Input value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="h-9 rounded-lg text-sm font-bold" />
                  ) : (
                    <>
                      <p className="text-base font-black text-slate-900">{user?.schoolId ?? "—"}</p>
                      <div className="h-px w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full" />
                    </>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2 group">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <Mail className="size-3" />
                    <span>Email Address</span>
                  </div>
                  {isEditing ? (
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 rounded-lg text-sm font-bold" />
                  ) : (
                    <>
                      <p className="text-base font-black text-slate-900">{user?.email ?? "—"}</p>
                      <div className="h-px w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full" />
                    </>
                  )}
                </div>

                {/* Contact Number */}
                <div className="space-y-2 group">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <Phone className="size-3" />
                    <span>Contact Number</span>
                  </div>
                  {isEditing ? (
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 rounded-lg text-sm font-bold" />
                  ) : (
                    <>
                      <p className="text-base font-black text-slate-900">{phone}</p>
                      <div className="h-px w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full" />
                    </>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2 group">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <MapPin className="size-3" />
                    <span>Location / Department</span>
                  </div>
                  {isEditing ? (
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-9 rounded-lg text-sm font-bold" />
                  ) : (
                    <>
                      <p className="text-base font-black text-slate-900">{location}</p>
                      <div className="h-px w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full" />
                    </>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2 group">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <Shield className="size-3" />
                    <span>Account Role</span>
                  </div>
                  <p className="text-base font-black text-slate-900 capitalize">{user?.role ?? "—"}</p>
                  <div className="h-px w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Cards Row */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* 2FA Card */}
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="p-6 space-y-4">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Lock className="size-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-slate-900">Two-Factor Authentication</h4>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">
                    2FA is currently{" "}
                    <span className="text-emerald-500 font-bold">Enabled</span>. Your account is protected with an additional security layer.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Protection Active</span>
                </div>
                <Button variant="outline" className="w-full rounded-lg border-slate-200 font-bold h-9 text-xs hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-pointer">
                  Configure 2FA
                </Button>
              </CardContent>
            </Card>

            {/* Password Card */}
            <Card className="border-0 bg-slate-900 shadow-sm hover:-translate-y-1 transition-all duration-300 group">
              <CardContent className="p-6 space-y-4">
                <div className="p-2.5 rounded-xl bg-white/10 text-white w-fit">
                  <Key className="size-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-white">Password & Credentials</h4>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">
                    Last changed 3 months ago. We recommend updating every 6 months for optimal security.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Calendar className="size-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next recommended: Aug 2026</span>
                </div>
                <Button className="w-full rounded-lg bg-white text-slate-900 hover:bg-indigo-500 hover:text-white transition-all font-black h-9 text-xs cursor-pointer">
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
