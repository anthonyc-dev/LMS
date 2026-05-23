import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  MapPin,
  Mail,
  Phone,
  User,
  IdCard,
  Lock,
  Key,
  Bell,
  Camera,
  LogOut,
  Edit3,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react"

export function ProfilePage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest uppercase text-xs">
            <User size={14} />
            <span>Account Management</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Admin <span className="text-indigo-600">Profile</span></h2>
          <p className="text-slate-500 font-medium text-lg">Manage your personal information and account security.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all font-bold">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 shadow-xl hover:shadow-indigo-200 transition-all font-black">
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-[2.5rem]">
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
            <CardHeader className="text-center -mt-16 relative z-10">
              <div className="flex justify-center relative group">
                <div className="relative">
                  <Avatar className="h-36 w-36 ring-8 ring-white shadow-2xl transition-transform duration-500 group-hover:scale-105">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-black">SA</AvatarFallback>
                  </Avatar>
                  <Button size="icon" className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-white text-indigo-600 shadow-lg border border-slate-100 hover:bg-indigo-50 transition-all">
                    <Camera size={18} />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <CardTitle className="text-3xl font-black text-slate-900">System Admin</CardTitle>
                <div className="flex items-center justify-center gap-2 text-slate-500 font-bold">
                  <Shield className="h-4 w-4 text-indigo-500" />
                  <span>Super Admin</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-10">
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">Status</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] uppercase tracking-wider px-3">Active</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">Member Since</span>
                  <span className="text-slate-900 font-black">Jan 2024</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-2 text-slate-600 group hover:text-indigo-600 transition-colors cursor-default">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <Mail size={18} className="text-slate-400 group-hover:text-indigo-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                    <span className="font-bold text-sm">admin@ncmc.edu</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 text-slate-600 group hover:text-indigo-600 transition-colors cursor-default">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <MapPin size={18} className="text-slate-400 group-hover:text-indigo-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                    <span className="font-bold text-sm">Main Library, NCMC</span>
                  </div>
                </div>
              </div>

              <Button variant="ghost" className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-black rounded-xl h-12 transition-all">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-200">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-white/70 font-bold text-xs uppercase tracking-widest mb-1">Actions</p>
              <h4 className="text-3xl font-black italic tracking-tighter">1,240</h4>
            </div>
            <div className="p-6 rounded-[2rem] bg-slate-900 text-white shadow-xl shadow-slate-200">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Clock size={20} />
              </div>
              <p className="text-white/70 font-bold text-xs uppercase tracking-widest mb-1">Online</p>
              <h4 className="text-3xl font-black italic tracking-tighter">14h</h4>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="lg:col-span-8 space-y-8">
          {/* Personal Information */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900">Personal Information</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Detailed account credentials and contact info.</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full border-2 border-indigo-100 text-indigo-600 font-black px-4 py-1">Verified Account</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <User size={12} />
                    <span>Full Name</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 tracking-tight">System Administrator</p>
                  <div className="h-1 w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
                </div>
                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <IdCard size={12} />
                    <span>Staff ID</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 tracking-tight">ADM-2026-001</p>
                  <div className="h-1 w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
                </div>
                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <Mail size={12} />
                    <span>Work Email</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 tracking-tight">admin@ncmc.edu</p>
                  <div className="h-1 w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
                </div>
                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <Phone size={12} />
                    <span>Contact Number</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 tracking-tight">+63 (912) 345-6789</p>
                  <div className="h-1 w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
                </div>
                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <Calendar size={12} />
                    <span>Birth Date</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 tracking-tight">October 24, 1992</p>
                  <div className="h-1 w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
                </div>
                <div className="space-y-2 group">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                    <Shield size={12} />
                    <span>Access Level</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 tracking-tight">Administrator (Level 5)</p>
                  <div className="h-1 w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Settings */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 space-y-6 group hover:shadow-indigo-100 transition-all duration-500">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <Lock size={24} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900">Security Access</h4>
                <p className="text-slate-500 font-medium text-sm">Two-factor authentication is currently <span className="text-emerald-500 font-bold">Enabled</span>. Your account is protected.</p>
              </div>
              <Button variant="outline" className="w-full rounded-xl border-2 font-bold h-12">Configure 2FA</Button>
            </Card>

            <Card className="border-none shadow-2xl shadow-slate-200/50 bg-slate-900 rounded-[2.5rem] p-8 space-y-6 group hover:-translate-y-2 transition-all duration-500">
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <Key size={24} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-white">Password Settings</h4>
                <p className="text-slate-400 font-medium text-sm">Last changed 3 months ago. We recommend updating it every 6 months.</p>
              </div>
              <Button className="w-full rounded-xl bg-white text-slate-900 hover:bg-indigo-400 hover:text-white transition-all font-black h-12">Update Password</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
