import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
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
} from "lucide-react";

// Helper: reads the current theme from the DOM
function getStoredTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: "light" | "dark") {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("lms-theme", theme);
}

export function SettingsPage() {
  // ─── Theme ───────────────────────────────────────────────────
  const [theme, setTheme] = useState<"light" | "dark">(getStoredTheme);

  useEffect(() => {
    const saved = localStorage.getItem("lms-theme") as "light" | "dark" | null;
    if (saved) {
      applyTheme(saved);
    }
  }, []);

  const handleTheme = (next: "light" | "dark") => {
    setTheme(next);
    applyTheme(next);
    toast.success(`Switched to ${next === "dark" ? "Dark" : "Light"} mode.`);
  };

  // ─── Notifications ────────────────────────────────────────────
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [realTimeAlerts, setRealTimeAlerts] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  // ─── Appearance ───────────────────────────────────────────────
  const [glassmorphism, setGlassmorphism] = useState(true);
  const [compactSidebar, setCompactSidebar] = useState(false);

  // ─── Save handler ─────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Preferences saved successfully!");
    }, 900);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-indigo-600 uppercase">
            <Settings className="size-3.5" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Account <span className="text-indigo-600">Settings</span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Customize your experience and manage system-wide preferences.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            className="h-10 cursor-pointer rounded-xl px-4 text-sm font-bold text-slate-500 hover:bg-slate-100"
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 cursor-pointer rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-all hover:bg-indigo-600 hover:shadow-lg active:scale-[0.98]"
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="size-3.5 animate-spin" />
                Saving…
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── Notifications ─────────────────────────────────────── */}
        <Card className="group overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="border-b border-slate-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                <Bell className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Notifications
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">
                  Manage how you receive alerts and updates.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
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
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition-all duration-200 hover:bg-white hover:shadow-sm"
              >
                <Label
                  htmlFor={item.id}
                  className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1 pr-4"
                >
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    {item.icon}
                    {item.label}
                  </span>
                  <span className="text-xs leading-relaxed text-slate-500">
                    {item.desc}
                  </span>
                </Label>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={item.onChange}
                  className="shrink-0 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Appearance ────────────────────────────────────────── */}
        <Card className="group overflow-hidden rounded-2xl border-0 bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="border-b border-white/5 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2.5 text-white transition-all duration-300 group-hover:bg-white group-hover:text-slate-900">
                <Palette className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">
                  Appearance
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Customize the interface visual styling.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {/* Theme toggle pills */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleTheme("light")}
                className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition-all ${
                  theme === "light"
                    ? "border-white bg-white text-slate-900 shadow-md"
                    : "border-transparent bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Sun className="size-4" />
                Light
              </button>
              <button
                onClick={() => handleTheme("dark")}
                className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition-all ${
                  theme === "dark"
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                    : "border-transparent bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
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
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all duration-200 hover:bg-white/10"
              >
                <Label
                  htmlFor={item.id}
                  className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1 pr-4"
                >
                  <span className="flex items-center gap-2 text-sm font-bold text-white">
                    {item.icon}
                    {item.label}
                  </span>
                  <span className="text-xs leading-relaxed text-slate-400">
                    {item.desc}
                  </span>
                </Label>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={item.onChange}
                  className="shrink-0 data-[state=checked]:bg-indigo-500"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Security & Privacy ────────────────────────────────── */}
        <Card className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md lg:col-span-2">
          <CardHeader className="border-b border-slate-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 transition-all duration-300 group-hover:bg-rose-600 group-hover:text-white">
                <Shield className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Security & Privacy
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">
                  Protect your account and manage platform data.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-5 md:grid-cols-3">
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
                  className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 transition-all duration-200 hover:bg-white hover:shadow-md"
                >
                  <div className={`w-fit rounded-xl p-2.5 ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 w-full cursor-pointer rounded-xl border-slate-200 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    {item.action}
                  </Button>
                </div>
              ))}
            </div>

            {/* Danger Zone + System Status footer */}
            <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
              {/* System Status */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="relative">
                  <Cloud className="size-5 text-emerald-600" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    System Status:{" "}
                    <span className="text-emerald-600">
                      All Systems Operational
                    </span>
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    Last checked: 5 minutes ago
                  </p>
                </div>
              </div>

              {/* Danger zone */}
              <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                <Trash2 className="size-5 shrink-0 text-rose-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">
                    Delete Account
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Permanently remove your account and all data.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="h-9 shrink-0 cursor-pointer rounded-xl px-4 text-xs font-bold text-rose-600 hover:bg-rose-100/50 hover:text-rose-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
