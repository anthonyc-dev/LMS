import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BookOpen,
  GraduationCap,
  PlusCircle,
  Eye,
  CheckCircle2,
  Clock,
  BookMarked,
  Calendar,
  RotateCw,
  AlertCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { usePageTitle } from "@/hooks/usePageTitle";

// Mock Data
const engagementData = [
  { course: "Web Dev I", studentViews: 145, checkouts: 98 },
  { course: "Data Systems", studentViews: 220, checkouts: 165 },
  { course: "Artificial Intell.", studentViews: 310, checkouts: 240 },
  { course: "Discrete Math", studentViews: 85, checkouts: 42 },
];

const mockAcquisitions = [
  { id: 1, title: "Deep Learning with PyTorch", author: "Eli Stevens", status: "Approved", date: "May 18, 2026" },
  { id: 2, title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", status: "Cataloged", date: "Apr 29, 2026" },
];

export function FacultyDashboardPage() {
  usePageTitle("Faculty Dashboard");
  const { user } = useAuthStore();
  // Acquisition Request Form state
  const [reqTitle, setReqTitle] = useState("");
  const [reqAuthor, setReqAuthor] = useState("");
  const [reqCourse, setReqCourse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Loans list (Stateful so that we can trigger "Renew" interaction live!)
  const [loans, setLoans] = useState([
    { id: 1, title: "Clean Code: A Handbook of Agile Software Craftsmanship", author: "Robert C. Martin", dueDate: "Jun 14, 2026", daysRemaining: 21, totalDays: 30, renewCount: 0 },
    { id: 2, title: "Introduction to Algorithms, 4th Edition", author: "Thomas H. Cormen", dueDate: "Jun 02, 2026", daysRemaining: 9, totalDays: 30, renewCount: 1 },
    { id: 3, title: "Operating System Concepts", author: "Abraham Silberschatz", dueDate: "May 29, 2026", daysRemaining: 5, totalDays: 30, renewCount: 0 },
  ]);

  // Request lists
  const [acquisitions, setAcquisitions] = useState(mockAcquisitions);

  const currentDate = new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Form submit handler
  const handleAcquisitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle || !reqAuthor || !reqCourse) {
      toast.error("Please fill in all acquisition request fields.");
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      const newReq = {
        id: acquisitions.length + 1,
        title: reqTitle,
        author: reqAuthor,
        status: "Submitted",
        date: new Date().toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })
      };
      
      setAcquisitions([newReq, ...acquisitions]);
      setIsSubmitting(false);
      setReqTitle("");
      setReqAuthor("");
      setReqCourse("");
      toast.success("Book acquisition request submitted to library registry!");
    }, 1000);
  };

  // Renewal click handler (Updates remaining days and renew counter with feedback)
  const handleRenew = (id: number) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === id) {
        if (loan.renewCount >= 2) {
          toast.warning(`Maximum renewals (2) reached for "${loan.title}". Please return the book.`);
          return loan;
        }
        
        toast.success(`"${loan.title}" renewed successfully! Extended by 14 days.`);
        // Calculate new due date (14 days from current due date)
        // Dummy extension date calculation
        const newDueDate = "Jun 28, 2026";
        return {
          ...loan,
          dueDate: newDueDate,
          daysRemaining: loan.daysRemaining + 14,
          totalDays: loan.totalDays + 14,
          renewCount: loan.renewCount + 1
        };
      }
      return loan;
    }));
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Welcome & Faculty Card Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-violet-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600">Faculty Space</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Hello, <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-indigo-600">{user?.fullName || "Professor"}</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
            <Calendar className="size-4 text-slate-400" />
            <span>{currentDate}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-violet-50/50 border border-violet-100/50 p-3 rounded-xl z-10 w-full lg:w-auto">
          <div className="h-10 w-10 bg-linear-to-tr from-violet-600 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.fullName ? user.fullName.split(" ").map(n => n[0]).join("") : "PF"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-800 leading-tight">Faculty Member</span>
            <span className="text-[10px] text-slate-400 font-semibold truncate">{user?.email || "faculty@ncmc.edu"}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Active Personal Loans */}
        <Card className="hover:shadow-md hover:border-violet-200 transition-all group">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 group-hover:scale-110 transition-transform">
                <BookOpen className="size-5" />
              </div>
              <Badge className="bg-violet-50 text-violet-700 hover:bg-violet-50 border-none font-bold text-[10px]">Quota: 15 Max</Badge>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Active Loans</span>
              <h3 className="text-2xl font-black text-slate-800">{loans.length} <span className="text-xs font-normal text-slate-400">books borrowed</span></h3>
            </div>
            <Progress value={(loans.length / 15) * 100} className="h-1 bg-slate-100" />
          </CardContent>
        </Card>

        {/* Course Reserves */}
        <Card className="hover:shadow-md hover:border-blue-200 transition-all group">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <BookMarked className="size-5" />
              </div>
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none font-bold text-[10px]">Curriculum</Badge>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Course Reserves</span>
              <h3 className="text-2xl font-black text-slate-800">8 <span className="text-xs font-normal text-slate-400">books pinned</span></h3>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Assigned to: <span className="font-bold text-slate-700">4 active courses</span></p>
          </CardContent>
        </Card>

        {/* Book Requests */}
        <Card className="hover:shadow-md hover:border-emerald-200 transition-all group">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <PlusCircle className="size-5" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-bold text-[10px]">Acquisitions</Badge>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Acquisitions Requested</span>
              <h3 className="text-2xl font-black text-slate-800">{acquisitions.length} <span className="text-xs font-normal text-slate-400">suggested</span></h3>
            </div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>{acquisitions.filter(a => a.status === "Approved").length} approved by admin</span>
            </p>
          </CardContent>
        </Card>

        {/* Syllabus / Reading List Views */}
        <Card className="hover:shadow-md hover:border-pink-200 transition-all group">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 group-hover:scale-110 transition-transform">
                <Eye className="size-5" />
              </div>
              <Badge className="bg-pink-50 text-pink-700 hover:bg-pink-50 border-none font-bold text-[10px]">Engagement</Badge>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reading List Views</span>
              <h3 className="text-2xl font-black text-slate-800">760</h3>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">+18% student clicks this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Core Modules: Charts & Stepper */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Student syllabus engagement (2/3 width) */}
        <Card className="md:col-span-2 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-800">Course Syllabus Reading Stats</CardTitle>
              <p className="text-xs text-slate-400 font-medium">Student resource views vs actual book borrows</p>
            </div>
            <Badge variant="secondary" className="font-bold bg-slate-100 text-slate-600 border-none px-2.5 py-1">Syllabus</Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="course" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                />
                <Bar name="Student Clicks" dataKey="studentViews" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar name="Book Checkouts" dataKey="checkouts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Acquisition Stepper HUD (1/3 width) */}
        <Card className="shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-base font-black text-slate-800">Acquisition Pipeline</CardTitle>
            <p className="text-xs text-slate-400 font-medium">Tracking status of recent book proposals</p>
          </CardHeader>
          <CardContent className="p-6 h-[300px] overflow-auto scrollbar-hide">
            <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              
              {/* Request 1 */}
              <div className="relative flex gap-4 items-start">
                <div className="z-10 flex items-center justify-center size-9 rounded-full bg-emerald-500 text-white shrink-0 border-4 border-white shadow-xs">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="space-y-1 pt-0.5">
                  <h4 className="text-xs font-black text-slate-800 leading-tight">Deep Learning with PyTorch</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Acquisition Stage: Approved</p>
                  <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Awaiting cataloging</span>
                </div>
              </div>

              {/* Request 2 */}
              <div className="relative flex gap-4 items-start">
                <div className="z-10 flex items-center justify-center size-9 rounded-full bg-violet-600 text-white shrink-0 border-4 border-white shadow-xs">
                  <Clock className="size-4" />
                </div>
                <div className="space-y-1 pt-0.5">
                  <h4 className="text-xs font-black text-slate-800 leading-tight">Neural Networks & Deep Learning</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Acquisition Stage: Submitted</p>
                  <span className="text-[9px] text-violet-600 font-bold bg-violet-50 px-1.5 py-0.5 rounded">Sent to Chief Librarian</span>
                </div>
              </div>

              {/* Request 3 (Completed historic request) */}
              <div className="relative flex gap-4 items-start opacity-60">
                <div className="z-10 flex items-center justify-center size-9 rounded-full bg-slate-300 text-white shrink-0 border-4 border-white shadow-xs">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="space-y-1 pt-0.5">
                  <h4 className="text-xs font-black text-slate-800 leading-tight">Designing Data-Intensive Systems</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Acquisition Stage: Cataloged</p>
                  <span className="text-[9px] text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded-sm">Available in stack</span>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms & Tables Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Book Request Form (1/3 size) */}
        <Card className="shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-1.5">
              <PlusCircle className="size-4 text-violet-500" />
              <span>Acquisition Request</span>
            </CardTitle>
            <p className="text-xs text-slate-400 font-medium">Request a new textbook for your syllabus</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAcquisitionSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Book Title</label>
                <Input 
                  placeholder="e.g. Clean Architecture" 
                  value={reqTitle} 
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="rounded-lg h-9 text-xs" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Author Name</label>
                <Input 
                  placeholder="e.g. Robert C. Martin" 
                  value={reqAuthor} 
                  onChange={(e) => setReqAuthor(e.target.value)}
                  className="rounded-lg h-9 text-xs" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Course</label>
                <Input 
                  placeholder="e.g. SE-201 Systems Engineering" 
                  value={reqCourse} 
                  onChange={(e) => setReqCourse(e.target.value)}
                  className="rounded-lg h-9 text-xs" 
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold h-9 text-xs mt-2 transition-all cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit Acquisition Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Active Borrows Registry (2/3 size) */}
        <Card className="lg:col-span-2 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-800">My Borrowed Books</CardTitle>
              <p className="text-xs text-slate-400 font-medium">Currently checked out titles with interactive renewal</p>
            </div>
            <Badge variant="outline" className="font-bold border-slate-200 text-slate-500 px-2 py-0.5">Faculty Perks</Badge>
          </CardHeader>
          <CardContent className="p-0 overflow-auto scrollbar-hide">
            <div className="divide-y divide-slate-50 min-w-[500px]">
              {loans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1.5 max-w-[280px]">
                    <h4 className="text-xs font-black text-slate-800 leading-tight truncate">{loan.title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-none">{loan.author}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-400 font-bold">Renewals: {loan.renewCount}/2</span>
                      <span className="text-slate-200">|</span>
                      <span className="text-[9px] text-slate-400 font-bold">Due: {loan.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex-1 max-w-[150px] px-4 space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400">
                      <span>Time Remaining</span>
                      <span className={loan.daysRemaining <= 5 ? "text-rose-500" : "text-slate-600"}>
                        {loan.daysRemaining} days
                      </span>
                    </div>
                    <Progress 
                      value={(loan.daysRemaining / loan.totalDays) * 100} 
                      className={`h-1.5 rounded bg-slate-100 ${
                        loan.daysRemaining <= 5 ? "[&>div]:bg-rose-500" : "[&>div]:bg-violet-600"
                      }`} 
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {loan.daysRemaining <= 5 && (
                      <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-50 border-none font-bold text-[8px] flex items-center gap-0.5">
                        <AlertCircle className="size-2.5 shrink-0" />
                        <span>Near Due</span>
                      </Badge>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => handleRenew(loan.id)}
                      className="rounded-lg h-8 px-3 border-slate-200 text-slate-600 hover:border-violet-600 hover:text-violet-600 hover:bg-violet-50/30 transition-all font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="size-3" />
                      <span>Renew</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
