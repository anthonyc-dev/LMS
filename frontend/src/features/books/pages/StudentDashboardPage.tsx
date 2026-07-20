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


import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Asset imports
/* import book1Img from "@/assets/images/dashboard/book1.png";
import book2Img from "@/assets/images/dashboard/book2.png";
import bookDark1Img from "@/assets/images/dashboard/book_dark1.png";
import bookDark2Img from "@/assets/images/dashboard/book_dark2.png"; */
import { usePageTitle } from "@/shared/hooks/usePageTitle";

// Mock Data
const readingStats = [
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 2.2 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 3.0 },
  { day: "Fri", hours: 2.5 },
  { day: "Sat", hours: 4.2 },
  { day: "Sun", hours: 2.0 },
];

/* const _mockEvents = [
  {
    id: 1,
    title: "AI & Literature Research Seminar",
    time: "Tomorrow, 2:00 PM",
    location: "Hall A",
    type: "academic",
  },
  {
    id: 2,
    title: "Book Club: Classic Novels Review",
    time: "May 27, 4:30 PM",
    location: "Discussion Room 3",
    type: "social",
  },
  {
    id: 3,
    title: "Vinyasa Yoga in Library Yard",
    time: "May 29, 7:00 AM",
    location: "Courtyard",
    type: "health",
  },
]; */

/* const _recommendationBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    rating: 4.8,
    category: "Fiction",
    image: book1Img,
    color: "bg-blue-50/50",
  },
  {
    id: 2,
    title: "Brief History of Time",
    author: "Stephen Hawking",
    rating: 4.9,
    category: "Science",
    image: bookDark1Img,
    color: "bg-slate-900/90",
  },
  {
    id: 3,
    title: "A Promised Land",
    author: "Barack Obama",
    rating: 4.7,
    category: "Biography",
    image: book2Img,
    color: "bg-warning-bg/50",
  },
  {
    id: 4,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    rating: 4.5,
    category: "Mystery",
    image: bookDark2Img,
    color: "bg-error-text/90",
  },
]; */

export function StudentDashboardPage() {
  usePageTitle("Student Dashboard");
  const { user: _user } = useAuthStore();
  const navigate = useNavigate();
  // const [searchQuery, _setSearchQuery] = useState("");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-analytics"],
    queryFn: getUserAnalytics,
  });

  // Goal tracking states
  // const goalBooksCount = 12;
  // const readBooksCount = stats?.readBooksCount || 0;
  // const _progressPercent = Math.round((readBooksCount / goalBooksCount) * 100);

  // Math for SVG Progress ring
  // const ringRadius = 18;
  // const ringCircumference = 2 * Math.PI * ringRadius;
  // const _ringOffset = ringCircumference * (1 - readBooksCount / goalBooksCount);

  // Stateful books array for interactions (using API data as initial state)
  const borrowedBooks = stats?.activeLoans || [];

  const [_greeting, _setGreeting] = useState(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  });

  /* const _handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching database for: "${searchQuery}"`);
      navigate(`/student/books/browse?q=${encodeURIComponent(searchQuery)}`);
    }
  }; */

  const handleRenewBook = (id: string) => {
    // This will be replaced by a real API call later
    toast.info(
      `Renew functionality for book ${id} will trigger a backend call in the future`,
    );
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
      {/* Modern Gradient Hero Welcome Banner */}
      {/* <section className="group relative flex flex-col items-center justify-between overflow-hidden rounded-2xl bg-linear-to-r from-blue-900 via-blue-950 to-slate-900 p-6 shadow-sm transition-all duration-300 hover:shadow-md md:flex-row md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-400 via-blue-900 to-slate-900 opacity-10" />
        <div className="absolute top-0 right-0 h-80 w-80 translate-x-12 -translate-y-12 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="z-10 w-full space-y-4 text-center md:max-w-2xl md:text-left">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider text-blue-400 uppercase md:justify-start">
            <Sparkles size={14} className="animate-pulse" />
            <span>Student Terminal</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl leading-tight font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              {greeting},{" "}
              <span className="bg-linear-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                {user?.fullName || "Scholar"}
              </span>
            </h1>
            <p className="max-w-lg text-xs font-medium text-slate-400 sm:text-sm md:text-base">
              Find reference materials, check your deadlines, and explore
              recommended journals for your syllabus.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="relative mx-auto w-full max-w-lg pt-2 md:mx-0"
          >
            <InputGroup className="h-10 rounded-xl border-white/10 bg-white/10 text-white shadow-inner backdrop-blur-md transition-all focus-within:border-blue-400 md:h-11">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-slate-400" />
              </InputGroupAddon>
              <Input
                placeholder="Search catalogs, authors, ISBNs..."
                className="h-10 rounded-none border-0 bg-transparent text-xs text-white placeholder-slate-400 shadow-none ring-0 md:h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                size="xs"
                className="absolute top-1.5 right-1.5 h-7 cursor-pointer rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 md:h-8"
              >
                <span>Find</span>
              </Button>
            </InputGroup>
          </form>
        </div>

        <div className="relative mt-6 flex aspect-square w-full max-w-[150px] items-center justify-center md:mt-0 md:w-[220px] md:max-w-none">
          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-2xl" />
          <img
            src={bookDark2Img}
            alt="Hero Graphic"
            className="animate-float relative z-10 w-28 drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] md:w-36"
          />
        </div>
      </section> */}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {/* Active Loan Count */}
        <Card className="group transition-all duration-300 hover:border-blue-200 hover:shadow-md">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="space-y-1">
              <span className="text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase">
                Checked Out
              </span>
              <h3 className="text-2xl leading-normal font-black text-slate-800">
                {stats.checkedOut}{" "}
                <span className="text-xs font-semibold text-slate-400">
                  books
                </span>
              </h3>
              <p
                className="flex cursor-pointer items-center gap-0.5 text-[10px] font-bold text-blue-600 hover:underline"
                onClick={() => navigate("/student/books")}
              >
                <span>View library list</span>
                <ArrowRight size={10} />
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 transition-transform group-hover:scale-110">
              <BookOpen className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Return Countdown Deadline */}
        <Card className="group hover:border-warning-bg transition-all duration-300 hover:shadow-md">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="space-y-1">
              <span className="text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase">
                Next Deadline
              </span>
              <h3 className="text-2xl leading-normal font-black text-slate-800">
                {stats.nextDeadlineDays !== "None"
                  ? `${stats.nextDeadlineDays} Days`
                  : "None"}
              </h3>
              <p className="text-[10px] font-semibold text-slate-500">
                {stats.nextDeadlineDate !== "All clear"
                  ? `Due: ${stats.nextDeadlineDate}`
                  : "All clear"}
              </p>
            </div>
            <div className="bg-warning-bg text-warning-text animate-pulse rounded-xl p-3 transition-transform group-hover:scale-110">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Semester Reading Goal (Custom Circular Ring Indicator) */}
        {/* <Card className="group transition-all duration-300 hover:border-slate-200 hover:shadow-md">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="space-y-1">
              <span className="text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase">
                Reading Goals
              </span>
              <h3 className="text-2xl leading-normal font-black text-slate-800">
                {readBooksCount}{" "}
                <span className="text-xs font-semibold text-slate-400">
                  / {goalBooksCount} read
                </span>
              </h3>
              <p className="text-[10px] font-semibold text-slate-500">
                {progressPercent}% semester goal
              </p>
            </div>
            <div className="relative flex shrink-0 items-center justify-center">
              <svg className="h-12 w-12 -rotate-90">
                <circle
                  className="text-slate-100"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="transparent"
                  r={ringRadius}
                  cx="24"
                  cy="24"
                />
                <circle
                  className="text-slate-600 transition-all duration-500"
                  strokeWidth="3"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={ringRadius}
                  cx="24"
                  cy="24"
                />
              </svg>
              <div className="absolute text-[9px] font-black text-slate-700">
                {progressPercent}%
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Fines & Violations Status */}
        <Card className="group hover:border-success-bg transition-all duration-300 hover:shadow-md">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="space-y-1">
              <span className="text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase">
                Outstanding Fines
              </span>
              <h3 className="text-2xl leading-normal font-black text-slate-800">
                ₱ {stats.outstandingFines.toFixed(2)}
              </h3>
              {stats.outstandingFines === 0 ? (
                <Badge className="bg-success-bg0/10 text-success-bg0 hover:bg-success-bg0/10 flex w-fit items-center gap-0.5 border-none text-[8px] font-bold">
                  <ShieldCheck size={10} />
                  <span>Account Safe</span>
                </Badge>
              ) : (
                <Badge className="bg-error-bg0/10 text-error-bg0 hover:bg-error-bg0/10 flex w-fit items-center gap-0.5 border-none text-[8px] font-bold">
                  <Award size={10} />
                  <span>Fines Unpaid</span>
                </Badge>
              )}
            </div>
            <div className="bg-success-bg text-success-text rounded-xl p-3 transition-transform group-hover:scale-110">
              <Award className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections: Active Loans List & Carousel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Loan Details (2/3 width) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Active Loans Details
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Keep track of dates and extend borrow status
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/student/books")}
              className="flex cursor-pointer items-center gap-0.5 px-0 text-xs font-bold text-blue-600"
            >
              <span>View All history</span>
              <ChevronRight size={14} />
            </Button>
          </div>

          {borrowedBooks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {borrowedBooks.map((book) => (
                <Card
                  key={book.id}
                  className="relative overflow-hidden border-slate-100 transition-shadow hover:shadow-md"
                >
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="secondary"
                      className="border-none bg-slate-100 text-[9px] font-bold text-slate-600"
                    >
                      {book.category}
                    </Badge>
                  </div>
                  <CardContent className="flex gap-4 p-5">
                    {/* Book cover thumbnail */}
                    <div className="flex h-22 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 shadow-xs">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {/* Title and stats details */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="truncate text-xs leading-tight font-black text-slate-800">
                          {book.title}
                        </h4>
                        <p className="text-[10px] leading-none font-medium text-slate-400">
                          {book.author}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-slate-500">
                          <span>Due: {book.dueDate}</span>
                          <span
                            className={
                              book.daysRemaining <= 3
                                ? "text-error-bg0"
                                : "text-blue-600"
                            }
                          >
                            {book.daysRemaining < 0
                              ? `${Math.abs(book.daysRemaining)} days overdue`
                              : `${book.daysRemaining} days left`}
                          </span>
                        </div>
                        <Progress
                          value={Math.max(0, Math.min(100, (book.daysRemaining / book.totalDays) * 100))}
                          className={`h-1.5 bg-slate-100 ${
                            book.daysRemaining <= 3
                              ? "[&>div]:bg-error-bg0"
                              : "[&>div]:bg-blue-600"
                          }`}
                        />
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => handleRenewBook(book.id)}
                        className="mt-1 h-7 w-full cursor-pointer rounded-lg border-slate-200 px-3 text-[9px] font-bold text-slate-600 transition-all hover:border-blue-600 hover:bg-blue-50/50 hover:text-blue-600"
                      >
                        <span>Extend Loan (1 week)</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-slate-50/50 py-12 shadow-none">
              <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
                <BookOpen size={32} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No Active Loans
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                You don't have any books currently borrowed.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/student/books/browse")}
                className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                Browse Books
              </Button>
            </Card>
          )}
        </div>

        {/* Reading hours area chart (1/3 width) */}
        <Card className="shadow-xs transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-800">
                Reading Track
              </CardTitle>
              <p className="text-xs font-medium text-slate-400">
                Weekly analysis of study time (Hours)
              </p>
            </div>
            <TrendingUp className="text-success-bg0 size-4" />
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={readingStats}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f8fafc"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                  }}
                />
                <Area
                  type="monotone"
                  name="Hours"
                  dataKey="hours"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#hoursGrad)"
                  dot={{
                    stroke: "#3b82f6",
                    strokeWidth: 1.5,
                    fill: "#fff",
                    r: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Books & Events row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommended Carousel (2/3 width) */}
        {/* <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Recommended For You
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Curated reads based on your active loans history
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/student/books/browse")}
              className="flex cursor-pointer items-center gap-0.5 px-0 text-xs font-bold text-blue-600"
            >
              <span>Browse Catalog</span>
              <ChevronRight size={14} />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recommendationBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate("/student/books/browse")}
                className="group cursor-pointer rounded-xl border border-slate-100 bg-white p-3 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md"
              >
                <div
                  className={`relative mb-3 aspect-[3/4.2] overflow-hidden rounded-lg shadow-xs ${book.color}`}
                >
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded bg-white/95 px-1 py-0.5 shadow-xs backdrop-blur-md">
                    <Star className="fill-warning-text text-warning-text size-2.5" />
                    <span className="text-[8px] font-black text-slate-700">
                      {book.rating}
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h4 className="truncate text-[11px] leading-tight font-black text-slate-800 transition-colors group-hover:text-blue-600">
                    {book.title}
                  </h4>
                  <p className="truncate text-[9px] font-medium text-slate-400">
                    {book.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Calendar Events (1/3 width) */}
        {/* <Card className="shadow-xs transition-shadow hover:shadow-md">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="flex items-center gap-1.5 text-base font-black text-slate-800">
              <CalendarDays className="size-4 text-slate-500" />
              <span>Library Events</span>
            </CardTitle>
            <p className="text-xs font-medium text-slate-400">
              Join workshops & group study forums
            </p>
          </CardHeader>
          <CardContent className="scrollbar-hide max-h-[260px] overflow-auto p-0">
            <div className="divide-y divide-slate-50">
              {mockEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex gap-3 p-4 transition-colors hover:bg-slate-50/50"
                >
                  <div className="mt-0.5">
                    {evt.type === "academic" && (
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                    )}
                    {evt.type === "social" && (
                      <span className="bg-warning-bg0 inline-block h-2 w-2 rounded-full" />
                    )}
                    {evt.type === "health" && (
                      <span className="bg-success-bg0 inline-block h-2 w-2 rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h5 className="truncate text-xs leading-tight font-black text-slate-800">
                      {evt.title}
                    </h5>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] font-semibold text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Clock className="size-3 text-slate-300" /> {evt.time}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="size-3 text-slate-300" />{" "}
                        {evt.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
