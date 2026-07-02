import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserAnalytics } from "@/features/books/services/dashboardApi";
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
import { Input } from "@/shared/components/ui/input";
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
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

// Mock Data
const engagementData = [
  { course: "Web Dev I", studentViews: 145, checkouts: 98 },
  { course: "Data Systems", studentViews: 220, checkouts: 165 },
  { course: "Artificial Intell.", studentViews: 310, checkouts: 240 },
  { course: "Discrete Math", studentViews: 85, checkouts: 42 },
];

const mockAcquisitions = [
  {
    id: 1,
    title: "Deep Learning with PyTorch",
    author: "Eli Stevens",
    status: "Approved",
    date: "May 18, 2026",
  },
  {
    id: 2,
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    status: "Cataloged",
    date: "Apr 29, 2026",
  },
];

export function FacultyDashboardPage() {
  usePageTitle("Faculty Dashboard");
  const { user } = useAuthStore();
  // Acquisition Request Form state
  const [reqTitle, setReqTitle] = useState("");
  const [reqAuthor, setReqAuthor] = useState("");
  const [reqCourse, setReqCourse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-analytics"],
    queryFn: getUserAnalytics,
  });

  // Active Loans list (Stateful so that we can trigger "Renew" interaction live!)
  const loans = stats?.activeLoans || [];

  // Request lists
  const [acquisitions, setAcquisitions] = useState(mockAcquisitions);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
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
  const handleRenew = (_id: string) => {
    toast.info("Renew functionality will trigger a backend call in the future");
  };

  if (isLoading || !stats) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-[1600px] space-y-6 pb-12">
      {/* Welcome & Faculty Card Header */}
      <div className="relative flex flex-col items-stretch justify-between gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-12 -translate-y-12 rounded-full bg-slate-500/5 blur-3xl" />
        <div className="z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-slate-500" />
            <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">
              Faculty Space
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Hello,{" "}
            <span className="bg-linear-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
              {user?.fullName || "Professor"}
            </span>
          </h1>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Calendar className="size-4 text-slate-400" />
            <span>{currentDate}</span>
          </p>
        </div>

        <div className="z-10 flex w-full items-center gap-3 rounded-xl border border-slate-100/50 bg-slate-50/50 p-3 lg:w-auto">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-slate-600 to-blue-500 text-sm font-bold text-white">
            {user?.fullName
              ? user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "PF"}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-xs leading-tight font-bold text-slate-800">
              Faculty Member
            </span>
            <span className="truncate text-[10px] font-semibold text-slate-400">
              {user?.email || "faculty@ncmc.edu"}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Personal Loans */}
        <Card className="group transition-all hover:border-slate-200 hover:shadow-md">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-slate-50 p-2.5 text-slate-600 transition-transform group-hover:scale-110">
                <BookOpen className="size-5" />
              </div>
              <Badge className="border-none bg-slate-50 text-[10px] font-bold text-slate-700 hover:bg-slate-50">
                Quota: 15 Max
              </Badge>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                My Active Loans
              </span>
              <h3 className="text-2xl font-black text-slate-800">
                {stats.checkedOut}{" "}
                <span className="text-xs font-normal text-slate-400">
                  books borrowed
                </span>
              </h3>
            </div>
            <Progress
              value={(stats.checkedOut / 15) * 100}
              className="h-1 bg-slate-100"
            />
          </CardContent>
        </Card>

        {/* Course Reserves */}
        <Card className="group transition-all hover:border-blue-200 hover:shadow-md">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-transform group-hover:scale-110">
                <BookMarked className="size-5" />
              </div>
              <Badge className="border-none bg-blue-50 text-[10px] font-bold text-blue-700 hover:bg-blue-50">
                Curriculum
              </Badge>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Course Reserves
              </span>
              <h3 className="text-2xl font-black text-slate-800">
                8{" "}
                <span className="text-xs font-normal text-slate-400">
                  books pinned
                </span>
              </h3>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              Assigned to:{" "}
              <span className="font-bold text-slate-700">4 active courses</span>
            </p>
          </CardContent>
        </Card>

        {/* Book Requests */}
        <Card className="hover:border-success-bg group transition-all hover:shadow-md">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-start justify-between">
              <div className="bg-success-bg text-success-text rounded-xl p-2.5 transition-transform group-hover:scale-110">
                <PlusCircle className="size-5" />
              </div>
              <Badge className="bg-success-bg text-success-text hover:bg-success-bg border-none text-[10px] font-bold">
                Acquisitions
              </Badge>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Acquisitions Requested
              </span>
              <h3 className="text-2xl font-black text-slate-800">
                {acquisitions.length}{" "}
                <span className="text-xs font-normal text-slate-400">
                  suggested
                </span>
              </h3>
            </div>
            <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <CheckCircle2 className="text-success-bg0 size-3.5" />
              <span>
                {acquisitions.filter((a) => a.status === "Approved").length}{" "}
                approved by admin
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Syllabus / Reading List Views */}
        <Card className="group transition-all hover:border-pink-200 hover:shadow-md">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-pink-50 p-2.5 text-pink-600 transition-transform group-hover:scale-110">
                <Eye className="size-5" />
              </div>
              <Badge className="border-none bg-pink-50 text-[10px] font-bold text-pink-700 hover:bg-pink-50">
                Engagement
              </Badge>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Reading List Views
              </span>
              <h3 className="text-2xl font-black text-slate-800">760</h3>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              +18% student clicks this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Core Modules: Charts & Stepper */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Student syllabus engagement (2/3 width) */}
        <Card className="shadow-xs transition-shadow hover:shadow-md md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-800">
                Course Syllabus Reading Stats
              </CardTitle>
              <p className="text-xs font-medium text-slate-400">
                Student resource views vs actual book borrows
              </p>
            </div>
            <Badge
              variant="secondary"
              className="border-none bg-slate-100 px-2.5 py-1 font-bold text-slate-600"
            >
              Syllabus
            </Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="course"
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
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                />
                <Bar
                  name="Student Clicks"
                  dataKey="studentViews"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Book Checkouts"
                  dataKey="checkouts"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Acquisition Stepper HUD (1/3 width) */}
        <Card className="shadow-xs transition-shadow hover:shadow-md">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-base font-black text-slate-800">
              Acquisition Pipeline
            </CardTitle>
            <p className="text-xs font-medium text-slate-400">
              Tracking status of recent book proposals
            </p>
          </CardHeader>
          <CardContent className="scrollbar-hide h-[300px] overflow-auto p-6">
            <div className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-0.5 before:bg-slate-100">
              {/* Request 1 */}
              <div className="relative flex items-start gap-4">
                <div className="bg-success-bg0 z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-4 border-white text-white shadow-xs">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="space-y-1 pt-0.5">
                  <h4 className="text-xs leading-tight font-black text-slate-800">
                    Deep Learning with PyTorch
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">
                    Acquisition Stage: Approved
                  </p>
                  <span className="text-success-text bg-success-bg rounded px-1.5 py-0.5 text-[9px] font-bold">
                    Awaiting cataloging
                  </span>
                </div>
              </div>

              {/* Request 2 */}
              <div className="relative flex items-start gap-4">
                <div className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-4 border-white bg-slate-600 text-white shadow-xs">
                  <Clock className="size-4" />
                </div>
                <div className="space-y-1 pt-0.5">
                  <h4 className="text-xs leading-tight font-black text-slate-800">
                    Neural Networks & Deep Learning
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">
                    Acquisition Stage: Submitted
                  </p>
                  <span className="rounded bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                    Sent to Chief Librarian
                  </span>
                </div>
              </div>

              {/* Request 3 (Completed historic request) */}
              <div className="relative flex items-start gap-4 opacity-60">
                <div className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-4 border-white bg-slate-300 text-white shadow-xs">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="space-y-1 pt-0.5">
                  <h4 className="text-xs leading-tight font-black text-slate-800">
                    Designing Data-Intensive Systems
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">
                    Acquisition Stage: Cataloged
                  </p>
                  <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                    Available in stack
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms & Tables Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Book Request Form (1/3 size) */}
        <Card className="shadow-xs transition-shadow hover:shadow-md">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="flex items-center gap-1.5 text-base font-black text-slate-800">
              <PlusCircle className="size-4 text-slate-500" />
              <span>Acquisition Request</span>
            </CardTitle>
            <p className="text-xs font-medium text-slate-400">
              Request a new textbook for your syllabus
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAcquisitionSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Book Title
                </label>
                <Input
                  placeholder="e.g. Clean Architecture"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="h-9 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Author Name
                </label>
                <Input
                  placeholder="e.g. Robert C. Martin"
                  value={reqAuthor}
                  onChange={(e) => setReqAuthor(e.target.value)}
                  className="h-9 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Assigned Course
                </label>
                <Input
                  placeholder="e.g. SE-201 Systems Engineering"
                  value={reqCourse}
                  onChange={(e) => setReqCourse(e.target.value)}
                  className="h-9 rounded-lg text-xs"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-9 w-full cursor-pointer rounded-lg bg-slate-600 text-xs font-bold text-white transition-all hover:bg-slate-500"
              >
                {isSubmitting ? "Submitting..." : "Submit Acquisition Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Active Borrows Registry (2/3 size) */}
        <Card className="shadow-xs transition-shadow hover:shadow-md lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-800">
                My Borrowed Books
              </CardTitle>
              <p className="text-xs font-medium text-slate-400">
                Currently checked out titles with interactive renewal
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-slate-200 px-2 py-0.5 font-bold text-slate-500"
            >
              Faculty Perks
            </Badge>
          </CardHeader>
          <CardContent className="scrollbar-hide overflow-auto p-0">
            <div className="min-w-[500px] divide-y divide-slate-50">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50"
                >
                  <div className="max-w-[280px] space-y-1.5">
                    <h4 className="truncate text-xs leading-tight font-black text-slate-800">
                      {loan.title}
                    </h4>
                    <p className="text-[10px] leading-none font-medium text-slate-400">
                      {loan.author}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400">
                        Renewals: {loan.renewCount}/2
                      </span>
                      <span className="text-slate-200">|</span>
                      <span className="text-[9px] font-bold text-slate-400">
                        Due: {loan.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="max-w-[150px] flex-1 space-y-1 px-4">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400">
                      <span>Time Remaining</span>
                      <span
                        className={
                          loan.daysRemaining <= 5
                            ? "text-error-bg0"
                            : "text-slate-600"
                        }
                      >
                        {loan.daysRemaining} days
                      </span>
                    </div>
                    <Progress
                      value={(loan.daysRemaining / loan.totalDays) * 100}
                      className={`h-1.5 rounded bg-slate-100 ${
                        loan.daysRemaining <= 5
                          ? "[&>div]:bg-error-bg0"
                          : "[&>div]:bg-slate-600"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {loan.daysRemaining <= 5 && (
                      <Badge className="bg-error-bg text-error-text hover:bg-error-bg flex items-center gap-0.5 border-none text-[8px] font-bold">
                        <AlertCircle className="size-2.5 shrink-0" />
                        <span>Near Due</span>
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleRenew(loan.id)}
                      className="flex h-8 cursor-pointer items-center gap-1 rounded-lg border-slate-200 px-3 text-[10px] font-bold text-slate-600 transition-all hover:border-slate-600 hover:bg-slate-50/30 hover:text-slate-600"
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
