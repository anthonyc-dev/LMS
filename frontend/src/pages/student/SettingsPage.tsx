import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import { toast } from "sonner"
import {
  Bell,
  Shield,
  Palette,
  Settings,
  Monitor,
  Smartphone,
  Lock,
  UserCog,
  Database,
  Cloud,
  Mail,
  Moon,
  Sun,
  LayoutGrid,
  RefreshCw,
  Trash2,
} from "lucide-react"

// Helper: reads the current theme from the DOM
function getStoredTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

function applyTheme(theme: "light" | "dark") {
  if (theme === "dark") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
  localStorage.setItem("lms-theme", theme)
}

export function SettingsPage() {


  // ─── Theme ───────────────────────────────────────────────────
  const [theme, setTheme] = useState<"light" | "dark">(getStoredTheme)

  useEffect(() => {
    const saved = localStorage.getItem("lms-theme") as "light" | "dark" | null
    if (saved) {
      applyTheme(saved)
    }
  }, [])

  const handleTheme = (next: "light" | "dark") => {
    setTheme(next)
    applyTheme(next)
    toast.success(`Switched to ${next === "dark" ? "Dark" : "Light"} mode.`)
  }

  // ─── Notifications ────────────────────────────────────────────
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [realTimeAlerts, setRealTimeAlerts] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(false)

  // ─── Appearance ───────────────────────────────────────────────
  const [glassmorphism, setGlassmorphism] = useState(true)
  const [compactSidebar, setCompactSidebar] = useState(false)

  // ─── Save handler ─────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false)
  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Preferences saved successfully!")
    }, 900)
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 animate-fade-in">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold tracking-widest uppercase text-xs text-indigo-600">
            <Settings className="size-3.5" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Account <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">Settings</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Customize your experience and manage system-wide preferences.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            className="h-9 px-4 rounded-lg font-bold text-slate-500 hover:bg-slate-100 text-sm cursor-pointer"
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-5 rounded-lg bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-200 font-bold text-sm transition-all cursor-pointer"
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="size-3.5 animate-spin" />
                Saving…
              </span>
            ) : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">

        {/* ── Notifications ─────────────────────────────────────── */}
        <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
          <CardHeader className="border-b border-slate-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Bell className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-black text-slate-900">Notifications</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">Manage how you receive alerts and updates.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {[
              {
                id: "email-notifs",
                icon: <Mail className="size-4 text-slate-400" />,
                label: "Email Notifications",
                desc: "Receive updates via email about loan statuses and reminders.",
                checked: emailNotifs,
                onChange: (v: boolean) => setEmailNotifs(v),
              },
              {
                id: "realtime-alerts",
                icon: <Monitor className="size-4 text-slate-400" />,
                label: "Real-time Alerts",
                desc: "Get instant alerts for overdue items and urgent requests.",
                checked: realTimeAlerts,
                onChange: (v: boolean) => setRealTimeAlerts(v),
              },
              {
                id: "push-notifs",
                icon: <Smartphone className="size-4 text-slate-400" />,
                label: "Push Notifications",
                desc: "Enable mobile push notifications for library events.",
                checked: pushNotifs,
                onChange: (v: boolean) => setPushNotifs(v),
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                <Label htmlFor={item.id} className="flex flex-col gap-1 cursor-pointer flex-1 min-w-0 pr-4">
                  <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 leading-relaxed">{item.desc}</span>
                </Label>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={item.onChange}
                  className="data-[state=checked]:bg-blue-600 shrink-0"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Appearance ────────────────────────────────────────── */}
        <Card className="border-0 bg-slate-900 shadow-sm hover:-translate-y-0.5 transition-all duration-300 group">
          <CardHeader className="border-b border-white/5 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-white group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                <Palette className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-black text-white">Appearance</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">Customize the interface visual styling.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Theme toggle pills */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleTheme("light")}
                className={`flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm transition-all cursor-pointer border ${theme === "light"
                  ? "bg-white text-slate-900 border-white shadow-md"
                  : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Sun className="size-4" />
                Light
              </button>
              <button
                onClick={() => handleTheme("dark")}
                className={`flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm transition-all cursor-pointer border ${theme === "dark"
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/40"
                  : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Moon className="size-4" />
                Dark
              </button>
            </div>

            {/* Appearance switches */}
            {[
              {
                id: "glassmorphism",
                icon: <Palette className="size-4 text-slate-400" />,
                label: "Glassmorphism UI",
                desc: "High-quality transparency and blur effects throughout the interface.",
                checked: glassmorphism,
                onChange: (v: boolean) => setGlassmorphism(v),
              },
              {
                id: "compact-sidebar",
                icon: <LayoutGrid className="size-4 text-slate-400" />,
                label: "Compact Sidebar",
                desc: "Collapse the navigation sidebar by default for more content space.",
                checked: compactSidebar,
                onChange: (v: boolean) => setCompactSidebar(v),
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <Label htmlFor={item.id} className="flex flex-col gap-1 cursor-pointer flex-1 min-w-0 pr-4">
                  <span className="text-sm font-black text-white flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 leading-relaxed">{item.desc}</span>
                </Label>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={item.onChange}
                  className="data-[state=checked]:bg-indigo-500 shrink-0"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Security & Privacy ────────────────────────────────── */}
        <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <CardHeader className="border-b border-slate-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                <Shield className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-black text-slate-900">Security & Privacy</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">Protect your account and manage platform data.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: <Lock className="size-5" />,
                  iconBg: "bg-rose-50 text-rose-500",
                  title: "Access Keys",
                  desc: "Update your security credentials and configure two-factor authentication.",
                  action: "Manage Access",
                },
                {
                  icon: <UserCog className="size-5" />,
                  iconBg: "bg-indigo-50 text-indigo-500",
                  title: "User Roles",
                  desc: "Configure administrator permissions and staff access levels.",
                  action: "Configure Roles",
                },
                {
                  icon: <Database className="size-5" />,
                  iconBg: "bg-emerald-50 text-emerald-500",
                  title: "Data Backup",
                  desc: "Schedule automated library database backups to secure cloud storage.",
                  action: "Backup Now",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="space-y-4 p-5 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  <div className={`p-2.5 rounded-xl w-fit ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-lg border-slate-200 font-bold h-9 text-xs hover:border-slate-700 hover:text-slate-900 transition-all cursor-pointer">
                    {item.action}
                  </Button>
                </div>
              ))}
            </div>

            {/* Danger Zone + System Status footer */}
            <div className="mt-6 pt-6 border-t border-slate-100 grid sm:grid-cols-2 gap-5">
              {/* System Status */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="relative">
                  <Cloud className="size-5 text-emerald-500" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">System Status: <span className="text-emerald-600">All Systems Operational</span></p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Last checked: 5 minutes ago</p>
                </div>
              </div>

              {/* Danger zone */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                <Trash2 className="size-5 text-rose-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 leading-tight">Delete Account</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">Permanently remove your account and all associated data.</p>
                </div>
                <Button variant="ghost" className="h-8 px-3 text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold text-xs rounded-lg shrink-0 cursor-pointer">
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
