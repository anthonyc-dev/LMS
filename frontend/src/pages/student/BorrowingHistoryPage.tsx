import { useState } from "react"
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle, Calendar, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Can } from "@/components/commons/Can"

const STATS = [
  { title: "Total Borrowed", value: "1,245", trend: "+12.5%", icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-50" },
  { title: "Active Loans", value: "156", trend: "+5.2%", icon: ArrowUpRight, color: "text-indigo-500", bg: "bg-indigo-50" },
  { title: "Overdue Books", value: "12", trend: "-2.4%", icon: ArrowDownRight, color: "text-rose-500", bg: "bg-rose-50" },
  { title: "Returned Books", value: "1,077", trend: "+15.8%", icon: ArrowUpRight, color: "text-amber-500", bg: "bg-amber-50" },
]

const HISTORY_DATA = [
  { id: "TX-9021", user: "Alex Johnson", email: "alex@example.com", book: "The Great Gatsby", borrowDate: "May 01, 2026", dueDate: "May 15, 2026", status: "Returned", initials: "AJ" },
  { id: "TX-9022", user: "Sarah Smith", email: "sarah@example.com", book: "Atomic Habits", borrowDate: "May 05, 2026", dueDate: "May 19, 2026", status: "On Loan", initials: "SS" },
  { id: "TX-9023", user: "Michael Brown", email: "mike@example.com", book: "Deep Work", borrowDate: "Apr 28, 2026", dueDate: "May 12, 2026", status: "Overdue", initials: "MB" },
  { id: "TX-9024", user: "Emily Davis", email: "emily@example.com", book: "The Alchemist", borrowDate: "May 10, 2026", dueDate: "May 24, 2026", status: "On Loan", initials: "ED" },
  { id: "TX-9025", user: "Chris Wilson", email: "chris@example.com", book: "Steve Jobs", borrowDate: "May 02, 2026", dueDate: "May 16, 2026", status: "Returned", initials: "CW" },
  { id: "TX-9026", user: "Jessica Taylor", email: "jess@example.com", book: "A Promised Land", borrowDate: "May 08, 2026", dueDate: "May 22, 2026", status: "Returned", initials: "JT" },
]

export function BorrowingHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 md:space-y-12 ">
      {/* Header Section */}
      <Can roles={["admin"]}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Borrowing History</h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Keep track of all book transactions across the library.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="flex-1 sm:flex-none rounded-xl md:rounded-2xl border-2 border-slate-200 font-bold h-12 gap-2 text-sm">
              <Download size={18} /> Export PDF
            </Button>
            <Button className="flex-1 sm:flex-none rounded-xl md:rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold h-12 shadow-lg shadow-indigo-200 text-sm">
              Generate Report
            </Button>
          </div>
        </div>
      </Can>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {STATS.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl md:rounded-[2rem] bg-white">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start justify-between">
                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Calendar size={20} className="md:size-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs md:text-sm font-bold ${stat.color}`}>
                  {stat.trend} <stat.icon size={14} className="md:size-4" />
                </div>
              </div>
              <div className="mt-4 md:mt-6 space-y-0.5 md:space-y-1">
                <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <p className="text-2xl md:text-4xl font-black text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <section className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-white/60 border border-white backdrop-blur-xl shadow-xl shadow-indigo-100/20 flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="relative w-full xl:max-w-2xl group">
          <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Search student, book title or ID..."
            className="pl-11 md:pl-14 h-12 md:h-14 bg-white border-none rounded-xl md:rounded-2xl text-base md:text-lg shadow-inner-sm focus-visible:ring-2 focus-visible:ring-indigo-500/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="h-12 md:h-14 px-6 rounded-xl md:rounded-2xl bg-white border-none shadow-sm w-full sm:min-w-[180px] font-bold text-slate-600 text-sm">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-indigo-500" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl md:rounded-2xl border-none shadow-2xl">
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="loan">On Loan</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="hidden sm:flex h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-white border-none shadow-sm text-slate-400 hover:text-indigo-600 transition-all">
            <MoreHorizontal size={24} />
          </Button>
        </div>
      </section>

      {/* Table Section */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-2xl md:rounded-[2.5rem] bg-white overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-50 h-16 md:h-20">
                  <TableHead className="pl-6 md:pl-10 font-black text-slate-400 uppercase tracking-widest text-[10px] md:text-[11px]">Student / ID</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] md:text-[11px]">Book Details</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] md:text-[11px]">Timeline</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] md:text-[11px]">Due Status</TableHead>
                  <TableHead className="pr-6 md:pr-10 text-right font-black text-slate-400 uppercase tracking-widest text-[10px] md:text-[11px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HISTORY_DATA.map((row) => (
                  <TableRow key={row.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50 h-20 md:h-24 cursor-pointer">
                    <TableCell className="pl-6 md:pl-10">
                      <div className="flex items-center gap-3 md:gap-4">
                        <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl shadow-sm border-2 border-white group-hover:scale-110 transition-transform">
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-xs md:text-sm">{row.initials}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="font-black text-slate-900 text-sm md:text-base">{row.user}</p>
                          <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-tight">{row.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex w-10 h-14 rounded-lg bg-slate-100 items-center justify-center text-slate-300">
                          <Calendar size={18} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm md:text-base">{row.book}</p>
                          <p className="text-[10px] md:text-xs font-medium text-slate-500">Fiction • Hardcover</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 md:gap-1.5">
                        <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500">
                          <Clock size={10} className="md:size-3 text-slate-300" />
                          <span>Borrowed: {row.borrowDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500">
                          <Calendar size={10} className="md:size-3 text-slate-300" />
                          <span>Deadline: {row.dueDate}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full border-none font-black text-[9px] md:text-[10px] uppercase tracking-wider flex items-center w-fit gap-1.5 md:gap-2 ${row.status === "Returned" ? "bg-emerald-50 text-emerald-600" :
                        row.status === "On Loan" ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600"
                        }`}>
                        {row.status === "Returned" && <CheckCircle2 size={10} className="md:size-3" />}
                        {row.status === "On Loan" && <Clock size={10} className="md:size-3" />}
                        {row.status === "Overdue" && <AlertCircle size={10} className="md:size-3" />}
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 md:pr-10 text-right">
                      <Button variant="ghost" size="icon" className="rounded-lg md:rounded-xl hover:bg-white hover:shadow-md transition-all">
                        <MoreHorizontal size={18} className="text-slate-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
