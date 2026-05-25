import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Sparkles
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
  Legend
} from "recharts";
import { useNavigate } from "react-router-dom";

// Mock Data
const borrowingTrendsData = [
  { month: "Jan", checkouts: 120, returns: 100 },
  { month: "Feb", checkouts: 150, returns: 130 },
  { month: "Mar", checkouts: 180, returns: 160 },
  { month: "Apr", checkouts: 220, returns: 175 },
  { month: "May", checkouts: 195, returns: 185 },
  { month: "Jun", checkouts: 250, returns: 210 },
];

const trafficData = [
  { day: "Mon", visitors: 145 },
  { day: "Tue", visitors: 262 },
  { day: "Wed", visitors: 318 },
  { day: "Thu", visitors: 285 },
  { day: "Fri", visitors: 420 },
  { day: "Sat", visitors: 190 },
  { day: "Sun", visitors: 95 },
];

const categoryDistribution = [
  { name: "Technology", value: 35, color: "#3b82f6" },
  { name: "Science", value: 25, color: "#10b981" },
  { name: "Fiction", value: 20, color: "#8b5cf6" },
  { name: "History", value: 15, color: "#f59e0b" },
  { name: "Arts", value: 5, color: "#ec4899" },
];

const recentLogs = [
  { id: 1, type: "loan", user: "Alexander Smith", book: "Introduction to Quantum Physics", time: "3 mins ago", status: "success" },
  { id: 2, type: "return", user: "Emily Watson", book: "Advanced Data Structures & Algorithms", time: "14 mins ago", status: "info" },
  { id: 3, type: "overdue", user: "Marcus Johnson", book: "A History of Modern Art", time: "1 hour ago", status: "warning" },
  { id: 4, type: "user", user: "Sarah Jenkins", book: "New Student Account registered", time: "2 hours ago", status: "success" },
  { id: 5, type: "acquisition", user: "Dr. David Vance", book: "Suggested purchase: Neural Networks V2", time: "3 hours ago", status: "purple" },
];

export function AdminDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  // HUD simulation states for interactive visual metrics
  const [cpuUsage, setCpuUsage] = useState(24);
  const [latency, setLatency] = useState(48);

  const currentDate = new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    // Simulate fluctuating server telemetry metrics
    const interval = setInterval(() => {
      setCpuUsage(prev => {
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        return Math.max(10, Math.min(85, prev + delta));
      });
      setLatency(prev => {
        const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
        return Math.max(15, Math.min(120, prev + delta));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Header and Welcome Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-blue-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Command Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">{user?.fullName || "Administrator"}</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
            <Calendar className="size-4 text-slate-400" />
            <span>{currentDate}</span>
          </p>
        </div>

        {/* Real-time Telemetry Dashboard HUD */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 w-full md:w-auto z-10">
          <div className="flex items-center gap-2.5 px-3 py-1 bg-white rounded-lg border border-slate-100 shadow-xs">
            <Cpu className="size-4 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">CPU Core</span>
              <span className="text-xs font-bold text-slate-700 leading-normal">{cpuUsage}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1 bg-white rounded-lg border border-slate-100 shadow-xs">
            <Database className="size-4 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">DB Latency</span>
              <span className="text-xs font-bold text-slate-700 leading-normal">{latency} ms</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1 bg-white rounded-lg border border-slate-100 shadow-xs">
            <Wifi className="size-4 text-indigo-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Gateway</span>
              <span className="text-xs font-bold text-emerald-600 leading-normal flex items-center gap-1">
                Active <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        
        {/* Total Catalog Size */}
        <Card className="hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <Library className="size-5" />
              </div>
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none font-bold text-[10px]">+1.4k New</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Catalog</span>
              <h3 className="text-2xl font-black text-slate-800">18,450</h3>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Available</span>
                <span>86%</span>
              </div>
              <Progress value={86} className="h-1.5 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Active Members */}
        <Card className="hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <Users className="size-5" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-bold text-[10px]">+12% Growth</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Members</span>
              <h3 className="text-2xl font-black text-slate-800">3,240</h3>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Daily active users: <span className="font-bold text-slate-800">768 online</span>
            </p>
          </CardContent>
        </Card>

        {/* Active Borrowed Books */}
        <Card className="hover:shadow-md hover:border-emerald-200 transition-all duration-300 group">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <BookOpen className="size-5" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-bold text-[10px]">+24% checked</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Borrows</span>
              <h3 className="text-2xl font-black text-slate-800">856</h3>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Returns Rate</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-1.5 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Overdue/Alert Books */}
        <Card className="hover:shadow-md hover:border-rose-200 transition-all duration-300 group">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                <AlertTriangle className="size-5" />
              </div>
              <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-none font-bold text-[10px]">Action Required</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Alert</span>
              <h3 className="text-2xl font-black text-rose-600">42</h3>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Overdue rate: <span className="font-bold text-rose-500">4.9% of loans</span>
            </p>
          </CardContent>
        </Card>

        {/* Fine Collection */}
        <Card className="hover:shadow-md hover:border-amber-200 transition-all duration-300 group">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                <DollarSign className="size-5" />
              </div>
              <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-none font-bold text-[10px]">Month-to-Date</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fine Collections</span>
              <h3 className="text-2xl font-black text-slate-800">$1,245.50</h3>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Collections Target</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-1.5 bg-slate-100 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts Panels */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Borrowing & Returns Trends Chart */}
        <Card className="shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-800">Borrowing Dynamics</CardTitle>
              <p className="text-xs text-slate-400 font-medium">Checkouts vs Returns comparison (Last 6 Months)</p>
            </div>
            <Badge variant="secondary" className="font-bold bg-slate-100 text-slate-600 border-none px-2.5 py-1">Monthly</Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={borrowingTrendsData} barGap={6}>
                <defs>
                  <linearGradient id="checkoutGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                  labelClassName="font-bold text-slate-800"
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 500, paddingTop: 10 }} />
                <Bar name="Books Borrowed" dataKey="checkouts" fill="url(#checkoutGrad)" radius={[4, 4, 0, 0]} />
                <Bar name="Books Returned" dataKey="returns" fill="url(#returnGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Visitor Traffic & Peak Hours */}
        <Card className="shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-800">Library Foot Traffic</CardTitle>
              <p className="text-xs text-slate-400 font-medium">Daily visitor volumes breakdown</p>
            </div>
            <Badge variant="secondary" className="font-bold bg-slate-100 text-slate-600 border-none px-2.5 py-1">Weekly</Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" name="Visitors" dataKey="visitors" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#trafficGrad)" dot={{ stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations Bottom Row: Category breakdown + Quick Actions & logs */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Category breakdown (1/3 size) */}
        <Card className="shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-base font-black text-slate-800">Genre Distribution</CardTitle>
            <p className="text-xs text-slate-400 font-medium">Catalog cataloging by top subjects</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 h-[340px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} 
                  formatter={(value) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Interactive Legend */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4 text-[10px] font-bold text-slate-500">
              {categoryDistribution.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Timelines (2/3 size) */}
        <Card className="lg:col-span-2 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-800">Recent Live Activity</CardTitle>
              <p className="text-xs text-slate-400 font-medium">Real-time LMS transactions & log timeline</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Logs</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[340px] overflow-auto scrollbar-hide">
            <div className="divide-y divide-slate-50">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {log.type === "loan" && <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 className="size-4" /></div>}
                      {log.type === "return" && <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><BookOpen className="size-4" /></div>}
                      {log.type === "overdue" && <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600"><AlertTriangle className="size-4" /></div>}
                      {log.type === "user" && <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><Users className="size-4" /></div>}
                      {log.type === "acquisition" && <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600"><Sparkles className="size-4" /></div>}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">{log.user}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{log.book}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <Badge className={`px-2 py-0.5 border-none font-bold text-[8px] uppercase tracking-wider ${
                      log.status === "success" ? "bg-emerald-500/10 text-emerald-500" :
                      log.status === "info" ? "bg-blue-500/10 text-blue-500" :
                      log.status === "warning" ? "bg-rose-500/10 text-rose-500" : "bg-purple-500/10 text-purple-500"
                    }`}>
                      {log.type}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
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
      <Card className="shadow-xs border-dashed hover:border-blue-400 transition-colors">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-black text-slate-800 text-sm tracking-tight flex items-center gap-1.5 justify-center sm:justify-start">
              <span>Admin Tool Belt</span>
            </h4>
            <p className="text-xs text-slate-400 font-medium">Quick links to create assets, check users, or configure details</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-center">
            <Button 
              onClick={() => navigate("/admin/books/add")} 
              className="rounded-lg bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 border-none font-bold px-4 py-2 text-xs flex items-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Catalog New Book</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/admin/books")} 
              className="rounded-lg border-slate-200 text-slate-600 hover:border-slate-800 hover:text-slate-800 hover:bg-slate-50 transition-all font-bold px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
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
