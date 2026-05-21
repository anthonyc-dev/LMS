import { useState } from "react"
import { Search, Download, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle, Calendar, MoreHorizontal, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Can } from "@/components/commons/Can"

const STATUS_OPTIONS = ["All Transactions", "On Loan", "Returned", "Overdue"]

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

const STATUS_BADGE = {
  "Returned": { icon: CheckCircle2, class: "bg-emerald-50 text-emerald-600" },
  "On Loan": { icon: Clock, class: "bg-indigo-50 text-indigo-600" },
  "Overdue": { icon: AlertCircle, class: "bg-rose-50 text-rose-600" },
} as const

export function BorrowingHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-5 md:space-y-8 px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Header Section */}
      <Can roles={["admin"]}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-0.5">
            <h1 className="text-lg sm:text-xl md:text-3xl font-black text-slate-900 tracking-tight">Borrowing History</h1>
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 font-medium">Keep track of all book transactions across the library.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-lg border-2 border-slate-200 font-bold gap-1.5 text-[10px] sm:text-xs px-3 sm:px-4 h-8 sm:h-9">
              <Download size={12} className="sm:size-[14px]" /> Export PDF
            </Button>
            <Button size="sm" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold shadow-md shadow-indigo-200 text-[10px] sm:text-xs px-3 sm:px-4 h-8 sm:h-9">
              Generate Report
            </Button>
          </div>
        </div>
      </Can>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {STATS.map((stat) => (
          <Card key={stat.title} className="border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-lg bg-white">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className={`p-1.5 sm:p-2 md:p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={12} className="sm:size-[14px] md:size-4" />
                </div>
                <div className={`flex items-center gap-0.5 text-[9px] sm:text-[10px] md:text-xs font-bold ${stat.color}`}>
                  {stat.trend} <stat.icon size={8} className="sm:size-[10px] md:size-3" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4 space-y-0.5">
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <p className="text-sm sm:text-lg md:text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter Section */}
      <section className="p-2 sm:p-3 rounded-lg bg-white/70 border border-white/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <InputGroup className="h-9 sm:h-10 md:h-11 rounded-lg bg-white/80 border-slate-200/60 shadow-xs">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5 sm:size-4 text-slate-400" />
            </InputGroupAddon>
            <Input
              placeholder="Search student, book title or ID..."
              className="h-9 sm:h-10 md:h-11 rounded-none border-0 bg-transparent shadow-none ring-0 text-xs sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3">
          <Select defaultValue="All Transactions">
            <SelectTrigger className="h-9 sm:h-10 md:h-11 px-3 sm:px-4 rounded-lg bg-white/80 border-slate-200/60 shadow-xs w-full sm:w-[150px] md:w-[170px] font-medium text-slate-600 text-xs sm:text-sm">
              <div className="flex items-center gap-2 truncate">
                <Filter size={13} className="sm:size-[14px] text-slate-400 shrink-0" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200 shadow-lg min-w-[140px] sm:min-w-[160px]">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-xs sm:text-sm">{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-lg bg-white/80 border border-slate-200/60 shadow-xs text-slate-400 hover:text-indigo-600 transition-all shrink-0">
            <MoreHorizontal size={16} className="sm:size-[18px]" />
          </Button>
        </div>
      </section>

      {/* Table Section */}
      <Card className="border border-slate-100 shadow-sm rounded-lg bg-white overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[650px] sm:min-w-[700px] md:min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100 h-10 sm:h-12 md:h-14">
                  <TableHead className="pl-3 sm:pl-4 md:pl-6 font-bold text-slate-400 uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[10px]">Student / ID</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[10px]">Book Details</TableHead>
                  <TableHead className="hidden sm:table-cell font-bold text-slate-400 uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[10px]">Timeline</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[10px]">Due Status</TableHead>
                  <TableHead className="pr-3 sm:pr-4 md:pr-6 text-right font-bold text-slate-400 uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HISTORY_DATA.map((row) => {
                  const badge = STATUS_BADGE[row.status as keyof typeof STATUS_BADGE]
                  return (
                    <TableRow key={row.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100 h-12 sm:h-14 md:h-16 cursor-pointer">
                      <TableCell className="pl-3 sm:pl-4 md:pl-6">
                        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-md shadow-sm border border-white group-hover:scale-110 transition-transform">
                            <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-[8px] sm:text-[10px] md:text-xs">{row.initials}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-0 min-w-0">
                            <p className="font-bold text-slate-900 text-[10px] sm:text-xs md:text-sm truncate">{row.user}</p>
                            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-slate-400 tracking-tight">{row.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0 min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-[10px] sm:text-xs md:text-sm truncate">{row.book}</p>
                          <p className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-slate-500 truncate">Fiction • Hardcover</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                          <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] md:text-[10px] font-medium text-slate-500">
                            <Clock size={7} className="sm:size-[9px] md:size-[10px] text-slate-300 shrink-0" />
                            <span className="truncate">Borrowed: {row.borrowDate}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] md:text-[10px] font-medium text-slate-500">
                            <Calendar size={7} className="sm:size-[9px] md:size-[10px] text-slate-300 shrink-0" />
                            <span className="truncate">Deadline: {row.dueDate}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`px-1.5 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full border-none font-bold text-[7px] sm:text-[8px] md:text-[9px] uppercase tracking-wider flex items-center w-fit gap-0.5 sm:gap-1 ${badge.class}`}>
                          <badge.icon size={7} className="sm:size-[9px] md:size-[10px]" />
                          <span className="hidden xs:inline">{row.status}</span>
                          <span className="xs:hidden">{row.status === "Returned" ? "Ret" : row.status === "On Loan" ? "Loan" : "Due"}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-3 sm:pr-4 md:pr-6 text-right">
                        <Button variant="ghost" size="icon" className="rounded-md hover:bg-white hover:shadow-sm transition-all h-7 w-7 sm:h-8 sm:w-8">
                          <MoreHorizontal size={12} className="sm:size-[14px] text-slate-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <Separator />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 px-3 sm:px-4 md:px-6 py-2 sm:py-3">
          <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-slate-400 order-2 sm:order-1">Showing 6 of 1,245 results</p>
          <Pagination className="w-auto order-1 sm:order-2">
            <PaginationContent className="gap-0.5 sm:gap-1">
              <PaginationPrevious text="Prev" className="h-7 sm:h-8 text-[9px] sm:text-xs rounded-md px-1.5 sm:px-2" />
              <PaginationItem>
                <PaginationLink isActive className="h-7 sm:h-8 min-w-7 sm:min-w-8 text-[9px] sm:text-xs rounded-md">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink className="h-7 sm:h-8 min-w-7 sm:min-w-8 text-[9px] sm:text-xs rounded-md">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink className="h-7 sm:h-8 min-w-7 sm:min-w-8 text-[9px] sm:text-xs rounded-md">3</PaginationLink>
              </PaginationItem>
              <PaginationNext text="Next" className="h-7 sm:h-8 text-[9px] sm:text-xs rounded-md px-1.5 sm:px-2" />
            </PaginationContent>
          </Pagination>
        </div>
      </Card>
    </div>
  )
}
