import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Bell, 
  Shield, 
  Palette, 
  Settings, 
  Monitor, 
  Smartphone, 
  Globe, 
  Lock, 
  UserCog,
  Database,
  Cloud,
  Eye,
  Mail,
  Moon,
  Sun,
  LayoutGrid
} from "lucide-react"

export function SettingsPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest uppercase text-xs">
            <Settings size={14} />
            <span>Platform Configuration</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">System <span className="text-indigo-600">Settings</span></h2>
          <p className="text-slate-500 font-medium text-lg">Customize your experience and manage system-wide preferences.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Notifications Section */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group hover:shadow-indigo-100 transition-all duration-500">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <Bell size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">Notifications</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Manage how you receive alerts and updates.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
              <Label htmlFor="email-notifs" className="flex flex-col gap-1 cursor-pointer">
                <span className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />
                  Email Notifications
                </span>
                <span className="text-xs font-medium text-slate-500">Receive updates via email about loan statuses and system health.</span>
              </Label>
              <Switch id="email-notifs" defaultChecked className="data-[state=checked]:bg-blue-600" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
              <Label htmlFor="system-notifs" className="flex flex-col gap-1 cursor-pointer">
                <span className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Monitor size={16} className="text-slate-400" />
                  Real-time Alerts
                </span>
                <span className="text-xs font-medium text-slate-500">Get notified about overdue items and urgent requests instantly.</span>
              </Label>
              <Switch id="system-notifs" defaultChecked className="data-[state=checked]:bg-blue-600" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
              <Label htmlFor="push-notifs" className="flex flex-col gap-1 cursor-pointer">
                <span className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Smartphone size={16} className="text-slate-400" />
                  Push Notifications
                </span>
                <span className="text-xs font-medium text-slate-500">Enable mobile notifications for important library events.</span>
              </Label>
              <Switch id="push-notifs" className="data-[state=checked]:bg-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-slate-900 rounded-[2.5rem] overflow-hidden group hover:-translate-y-1 transition-all duration-500 text-white">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-all duration-500">
                <Palette size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-black italic">Appearance</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Customize the interface visual styling.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <Label htmlFor="dark-mode" className="flex flex-col gap-1 cursor-pointer">
                <span className="text-base font-black flex items-center gap-2">
                  <Moon size={16} className="text-slate-400" />
                  Glassmorphism UI
                </span>
                <span className="text-xs font-medium text-slate-400">Enable high-quality transparency and blur effects throughout.</span>
              </Label>
              <Switch id="dark-mode" defaultChecked className="data-[state=checked]:bg-indigo-500" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <Label htmlFor="compact-mode" className="flex flex-col gap-1 cursor-pointer">
                <span className="text-base font-black flex items-center gap-2">
                  <LayoutGrid size={16} className="text-slate-400" />
                  Compact Sidebar
                </span>
                <span className="text-xs font-medium text-slate-400">Keep the navigation collapsed by default for more space.</span>
              </Label>
              <Switch id="compact-mode" className="data-[state=checked]:bg-indigo-500" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button variant="outline" className="h-14 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white hover:text-slate-900 transition-all font-bold">
                <Sun className="mr-2 h-4 w-4" />
                Light Theme
              </Button>
              <Button className="h-14 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all font-black">
                <Moon className="mr-2 h-4 w-4" />
                Dark Theme
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security & System Section */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-[2.5rem] md:col-span-2 overflow-hidden group transition-all duration-500">
          <CardHeader className="p-8 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500">
                <Shield size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">Security & Privacy</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Protect your account and manage platform data.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-500 mb-2">
                  <Lock size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900">Access Keys</h4>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">Update your security credentials and set up two-factor authentication.</p>
                </div>
                <Button variant="outline" className="w-full rounded-xl border-2 font-bold h-10">Manage Access</Button>
              </div>

              <div className="space-y-4 p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500 mb-2">
                  <UserCog size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900">User Roles</h4>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">Configure administrator permissions and staff access levels.</p>
                </div>
                <Button variant="outline" className="w-full rounded-xl border-2 font-bold h-10">Configure Roles</Button>
              </div>

              <div className="space-y-4 p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500 mb-2">
                  <Database size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900">Data Backup</h4>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">Schedule automated library database backups to the cloud.</p>
                </div>
                <Button variant="outline" className="w-full rounded-xl border-2 font-bold h-10">Backup Now</Button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Cloud size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">System Status: <span className="text-emerald-500 italic">Operational</span></p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last checked: 5 minutes ago</p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <Button variant="ghost" className="flex-1 md:flex-none text-slate-500 font-bold hover:bg-slate-100 rounded-xl h-12">Cancel</Button>
                <Button className="flex-1 md:flex-none h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 shadow-xl transition-all font-black">Save Changes</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
