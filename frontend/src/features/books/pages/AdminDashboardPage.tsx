import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminAnalytics } from "@/features/books/services/dashboardApi";
import { useAuthStore } from "@/app/store/authStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import {
  Library,
  Users,
  BookOpen,
  AlertTriangle,
  DollarSign,
  Plus,
  ArrowUpRight,
  Clock,
  Cpu,
  Database,
  Wifi,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

// Traffic data remains mocked since we don't have visitor tracking yet
const trafficData = [
  { day: "Mon", visitors: 145 },
  { day: "Tue", visitors: 262 },
  { day: "Wed", visitors: 318 },
  { day: "Thu", visitors: 285 },
  { day: "Fri", visitors: 420 },
  { day: "Sat", visitors: 190 },
  { day: "Sun", visitors: 95 },
];

export function AdminDashboardPage() {
  usePageTitle("Admin Dashboard");
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: getAdminAnalytics,
  });

  // HUD simulation states for interactive visual metrics
  const [cpuUsage, setCpuUsage] = useState(24);
  const [latency, setLatency] = useState(48);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    // Simulate fluctuating server telemetry metrics
    const interval = setInterval(() => {
      setCpuUsage((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        return Math.max(10, Math.min(85, prev + delta));
      });
      setLatency((prev) => {
        const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
        return Math.max(15, Math.min(120, prev + delta));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !stats) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Loading dashboard data...</div>;
  }

  return (
    <div className="animate-fade-in mx-auto max-w-[1600px] space-y-6 pb-12">
      {/* Header and Welcome Panel */}
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl md:flex-row md:items-center">
        {/* Animated Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 animate-pulse rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute -right-24 -bottom-24 h-96 w-96 animate-pulse rounded-full bg-blue-500/5 blur-3xl delay-1000" />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-[spin_10s_linear_infinite] rounded-full bg-slate-500/5 blur-3xl" />
        </div>

        <div className="z-10 space-y-1.5">
          <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
            Welcome back,{" "}
            <span className="bg-linear-to-r from-blue-400 to-blue-400 bg-clip-text text-transparent">
              {user?.fullName || "Administrator"}
            </span>
          </h1>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <Calendar className="size-4 text-slate-500" />
            <span>{currentDate}</span>
          </p>
        </div>

        {/* Real-time Telemetry Dashboard HUD */}
        <div className="z-10 flex w-full flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 backdrop-blur-sm md:w-auto">
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 shadow-inner">
            <Cpu className="size-4 text-blue-400" />
            <div className="flex flex-col">
              <span className="text-[10px] leading-none font-semibold text-slate-400 uppercase">
                CPU Core
              </span>
              <span className="text-xs leading-normal font-bold text-slate-200">
                {cpuUsage}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 shadow-inner">
            <Database className="text-success-text size-4" />
            <div className="flex flex-col">
              <span className="text-[10px] leading-none font-semibold text-slate-400 uppercase">
                DB Latency
              </span>
              <span className="text-xs leading-normal font-bold text-slate-200">
                {latency} ms
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 shadow-inner">
            <Wifi className="size-4 animate-pulse text-blue-400" />
            <div className="flex flex-col">
              <span className="text-[10px] leading-none font-semibold text-slate-400 uppercase">
                Gateway
              </span>
              <span className="text-success-text flex items-center gap-1 text-xs leading-normal font-bold">
                Active{" "}
                <span className="bg-success-text inline-block h-1.5 w-1.5 animate-ping rounded-full" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Catalog Size */}
        <Card className="group transition-all duration-300 hover:border-blue-200 hover:shadow-md">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-transform group-hover:scale-110">
                <Library className="size-5" />
              </div>
              <Badge className="border-none bg-blue-50 text-[10px] font-bold text-blue-700 hover:bg-blue-50">
                +1.4k New
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Total Catalog
              </span>
              <h3 className="text-2xl font-black text-slate-800">{stats.totalCatalog.toLocaleString()}</h3>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Available</span>
                <span>{Math.round(((stats.totalCatalog - stats.activeBorrows) / (stats.totalCatalog || 1)) * 100)}%</span>
              </div>
              <Progress value={((stats.totalCatalog - stats.activeBorrows) / (stats.totalCatalog || 1)) * 100} className="h-1.5 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Active Members */}
        <Card className="group transition-all duration-300 hover:border-blue-200 hover:shadow-md">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-transform group-hover:scale-110">
                <Users className="size-5" />
              </div>
              <Badge className="bg-success-bg text-success-text hover:bg-success-bg border-none text-[10px] font-bold">
                +12% Growth
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Active Members
              </span>
              <h3 className="text-2xl font-black text-slate-800">{stats.activeMembers.toLocaleString()}</h3>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              Daily active users:{" "}
              <span className="font-bold text-slate-800">Online now</span>
            </p>
          </CardContent>
        </Card>

        {/* Active Borrowed Books */}
        <Card className="group hover:border-success-bg transition-all duration-300 hover:shadow-md">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div className="bg-success-bg text-success-text rounded-xl p-2.5 transition-transform group-hover:scale-110">
                <BookOpen className="size-5" />
              </div>
              <Badge className="bg-success-bg text-success-text hover:bg-success-bg border-none text-[10px] font-bold">
                +24% checked
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Active Borrows
              </span>
              <h3 className="text-2xl font-black text-slate-800">{stats.activeBorrows.toLocaleString()}</h3>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Returns Rate</span>
                <span>{Math.round(((stats.activeBorrows - stats.overdueAlerts) / (stats.activeBorrows || 1)) * 100)}%</span>
              </div>
              <Progress value={((stats.activeBorrows - stats.overdueAlerts) / (stats.activeBorrows || 1)) * 100} className="h-1.5 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Overdue/Alert Books */}
        <Card className="group hover:border-error-bg transition-all duration-300 hover:shadow-md">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div className="bg-error-bg text-error-text rounded-xl p-2.5 transition-transform group-hover:scale-110">
                <AlertTriangle className="size-5" />
              </div>
              <Badge className="bg-error-bg text-error-text hover:bg-error-bg border-none text-[10px] font-bold">
                Action Required
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Overdue Alert
              </span>
              <h3 className="text-error-text text-2xl font-black">{stats.overdueAlerts}</h3>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              Overdue rate:{" "}
              <span className="text-error-bg0 font-bold">
                {((stats.overdueAlerts / (stats.activeBorrows || 1)) * 100).toFixed(1)}% of loans
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Fine Collection */}
        <Card className="group hover:border-warning-bg transition-all duration-300 hover:shadow-md">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div className="bg-warning-bg text-warning-text rounded-xl p-2.5 transition-transform group-hover:scale-110">
                <DollarSign className="size-5" />
              </div>
              <Badge className="bg-warning-bg text-warning-text hover:bg-warning-bg border-none text-[10px] font-bold">
                Month-to-Date
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Fine Collections
              </span>
              <h3 className="text-2xl font-black text-slate-800">${stats.fineCollections.toFixed(2)}</h3>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Collections Target</span>
                <span>92%</span>
              </div>
              <Progress
                value={92}
                className="h-1.5 animate-pulse bg-slate-100"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts Panels */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Borrowing & Returns Trends Chart */}
        <Card className="shadow-xs transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-800">
                Borrowing Dynamics
              </CardTitle>
              <p className="text-xs font-medium text-slate-400">
                Checkouts vs Returns comparison (Last 6 Months)
              </p>
            </div>
            <Badge
              variant="secondary"
              className="border-none bg-slate-100 px-2.5 py-1 font-bold text-slate-600"
            >
              Monthly
            </Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.borrowingTrendsData} barGap={6}>
                <defs>
                  <linearGradient id="checkoutGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#94A3B8" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                  labelClassName="font-bold text-slate-800"
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: 12,
                    fontWeight: 500,
                    paddingTop: 10,
                  }}
                />
                <Bar
                  name="Books Borrowed"
                  dataKey="checkouts"
                  fill="url(#checkoutGrad)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Books Returned"
                  dataKey="returns"
                  fill="url(#returnGrad)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Visitor Traffic & Peak Hours */}
        <Card className="shadow-xs transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-800">
                Library Foot Traffic
              </CardTitle>
              <p className="text-xs font-medium text-slate-400">
                Daily visitor volumes breakdown
              </p>
            </div>
            <Badge
              variant="secondary"
              className="border-none bg-slate-100 px-2.5 py-1 font-bold text-slate-600"
            >
              Weekly
            </Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                />
                <Area
                  type="monotone"
                  name="Visitors"
                  dataKey="visitors"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trafficGrad)"
                  dot={{
                    stroke: "#2563EB",
                    strokeWidth: 2,
                    fill: "#fff",
                    r: 4,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations Bottom Row: Category breakdown + Quick Actions & logs */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category breakdown (1/3 size) */}
        <Card className="shadow-xs transition-shadow hover:shadow-md">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-base font-black text-slate-800">
              Genre Distribution
            </CardTitle>
            <p className="text-xs font-medium text-slate-400">
              Catalog cataloging by top subjects
            </p>
          </CardHeader>
          <CardContent className="flex h-[340px] flex-col items-center justify-center p-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [`${value}%`, "Share"]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Interactive Legend */}
            <div className="mt-4 grid w-full grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
              {stats.categoryDistribution.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Timelines (2/3 size) */}
        <Card className="shadow-xs transition-shadow hover:shadow-md lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-800">
                Recent Live Activity
              </CardTitle>
              <p className="text-xs font-medium text-slate-400">
                Real-time LMS transactions & log timeline
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="bg-success-text absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-success-bg0 relative inline-flex h-2 w-2 rounded-full"></span>
              </span>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Live Logs
              </span>
            </div>
          </CardHeader>
          <CardContent className="scrollbar-hide h-[340px] overflow-auto p-0">
            <div className="divide-y divide-slate-50">
              {stats.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-slate-50/50"
                >
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {log.type === "loan" && (
                        <div className="bg-success-bg text-success-text rounded-lg p-1.5">
                          <CheckCircle2 className="size-4" />
                        </div>
                      )}
                      {log.type === "return" && (
                        <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
                          <BookOpen className="size-4" />
                        </div>
                      )}
                      {log.type === "overdue" && (
                        <div className="bg-error-bg text-error-text rounded-lg p-1.5">
                          <AlertTriangle className="size-4" />
                        </div>
                      )}
                      {log.type === "user" && (
                        <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
                          <Users className="size-4" />
                        </div>
                      )}
                      {log.type === "acquisition" && (
                        <div className="rounded-lg bg-slate-50 p-1.5 text-slate-600">
                          <Sparkles className="size-4" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">
                        {log.user}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">
                        {log.book}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
                    <Badge
                      className={`border-none px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase ${
                        log.status === "success"
                          ? "bg-success-bg0/10 text-success-bg0"
                          : log.status === "info"
                            ? "bg-blue-500/10 text-blue-500"
                            : log.status === "warning"
                              ? "bg-error-bg0/10 text-error-bg0"
                              : "bg-slate-500/10 text-slate-500"
                      }`}
                    >
                      {log.type}
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                      <Clock className="size-3 text-slate-300" />
                      {log.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Commands Hub */}
      <Card className="border-dashed shadow-xs transition-colors hover:border-blue-400">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="flex items-center justify-center gap-1.5 text-sm font-black tracking-tight text-slate-800 sm:justify-start">
              <span>Admin Tool Belt</span>
            </h4>
            <p className="text-xs font-medium text-slate-400">
              Quick links to create assets, check users, or configure details
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-2.5 sm:w-auto">
            <Button
              onClick={() => navigate("/admin/books/add")}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 active:scale-95"
            >
              <Plus className="size-3.5" />
              <span>Catalog New Book</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/books")}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:border-slate-800 hover:bg-slate-50 hover:text-slate-800"
            >
              <span>Manage Books Database</span>
              <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
