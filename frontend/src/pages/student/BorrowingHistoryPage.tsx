import { useState, useMemo } from "react"
import {
    Search, Download, ArrowUpRight, ArrowDownRight, Clock,
    CheckCircle2, AlertCircle, Calendar, Filter, BookOpen,
    ChevronLeft, ChevronRight, X, History,
} from "lucide-react"
import { Badge }  from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Can } from "@/components/commons/Can"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const HISTORY_DATA = [
    { id: "TX-9021", user: "Alex Johnson",    email: "alex@example.com",    initials: "AJ", book: "The Great Gatsby",         category: "Fiction",    borrowDate: "May 01, 2026", dueDate: "May 15, 2026", status: "Returned" },
    { id: "TX-9022", user: "Sarah Smith",     email: "sarah@example.com",   initials: "SS", book: "Atomic Habits",            category: "Self-Help",  borrowDate: "May 05, 2026", dueDate: "May 19, 2026", status: "On Loan"  },
    { id: "TX-9023", user: "Michael Brown",   email: "mike@example.com",    initials: "MB", book: "Deep Work",                category: "Self-Help",  borrowDate: "Apr 28, 2026", dueDate: "May 12, 2026", status: "Overdue"  },
    { id: "TX-9024", user: "Emily Davis",     email: "emily@example.com",   initials: "ED", book: "The Alchemist",            category: "Fiction",    borrowDate: "May 10, 2026", dueDate: "May 24, 2026", status: "On Loan"  },
    { id: "TX-9025", user: "Chris Wilson",    email: "chris@example.com",   initials: "CW", book: "Steve Jobs",               category: "Biography",  borrowDate: "May 02, 2026", dueDate: "May 16, 2026", status: "Returned" },
    { id: "TX-9026", user: "Jessica Taylor",  email: "jess@example.com",    initials: "JT", book: "A Promised Land",          category: "Biography",  borrowDate: "May 08, 2026", dueDate: "May 22, 2026", status: "Returned" },
    { id: "TX-9027", user: "Nathan Park",     email: "nathan@example.com",  initials: "NP", book: "Brief History of Time",    category: "Science",    borrowDate: "May 03, 2026", dueDate: "May 17, 2026", status: "Overdue"  },
    { id: "TX-9028", user: "Laura Chen",      email: "laura@example.com",   initials: "LC", book: "Sapiens",                  category: "History",    borrowDate: "May 12, 2026", dueDate: "May 26, 2026", status: "On Loan"  },
    { id: "TX-9029", user: "Marcus Lee",      email: "marcus@example.com",  initials: "ML", book: "Zero to One",              category: "Self-Help",  borrowDate: "May 06, 2026", dueDate: "May 20, 2026", status: "Returned" },
    { id: "TX-9030", user: "Olivia Martinez", email: "olivia@example.com",  initials: "OM", book: "Clean Code",               category: "Technology", borrowDate: "Apr 30, 2026", dueDate: "May 14, 2026", status: "Overdue"  },
]

const ROWS_PER_PAGE = 6

const STATUS_CFG = {
    "Returned": { icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "On Loan":  { icon: Clock,        cls: "bg-indigo-100  text-indigo-700  border-indigo-200"  },
    "Overdue":  { icon: AlertCircle,  cls: "bg-rose-100    text-rose-700    border-rose-200"    },
} as const

const AVATAR_COLORS = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-indigo-100 text-indigo-700",
]

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export function BorrowingHistoryPage() {
    const [search,  setSearch]  = useState("")
    const [status,  setStatus]  = useState("All")
    const [page,    setPage]    = useState(1)

    const filtered = useMemo(() => {
        return HISTORY_DATA.filter(r => {
            const matchSearch = r.user.toLowerCase().includes(search.toLowerCase()) ||
                                r.book.toLowerCase().includes(search.toLowerCase()) ||
                                r.id.toLowerCase().includes(search.toLowerCase())
            const matchStatus = status === "All" || r.status === status
            return matchSearch && matchStatus
        })
    }, [search, status])

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
    const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

    const totalBorrowed = HISTORY_DATA.length
    const activeLoans   = HISTORY_DATA.filter(r => r.status === "On Loan").length
    const overdueCount  = HISTORY_DATA.filter(r => r.status === "Overdue").length
    const returnedCount = HISTORY_DATA.filter(r => r.status === "Returned").length

    const onSearch = (v: string) => { setSearch(v); setPage(1) }
    const onStatus = (v: string) => { setStatus(v); setPage(1) }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <History className="text-indigo-600 size-7" />
                        </div>
                        Borrowing History
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 ml-1">
                        Complete record of all book transactions across the library.
                    </p>
                </div>
                <Can roles={["admin"]}>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold gap-2"
                        >
                            <Download className="size-4" /> Export PDF
                        </Button>
                        <Button className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 gap-2">
                            Generate Report
                        </Button>
                    </div>
                </Can>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Borrowed */}
                <Card className="hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl group-hover:scale-110 transition-transform">
                                <BookOpen className="size-5" />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                                +12.5% <ArrowUpRight className="size-3" />
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Borrowed</p>
                        <h3 className="text-2xl font-black text-slate-900">{totalBorrowed.toLocaleString()}</h3>
                    </CardContent>
                </Card>

                {/* Active Loans */}
                <Card className="hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Clock className="size-5" />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                                +5.2% <ArrowUpRight className="size-3" />
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Loans</p>
                        <h3 className="text-2xl font-black text-slate-900">{activeLoans}</h3>
                    </CardContent>
                </Card>

                {/* Overdue */}
                <Card className="hover:shadow-md hover:border-rose-200 transition-all duration-300 group">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-110 transition-transform">
                                <AlertCircle className="size-5" />
                            </div>
                            <span className="text-xs font-bold text-rose-500 flex items-center gap-0.5">
                                -2.4% <ArrowDownRight className="size-3" />
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue Books</p>
                        <h3 className="text-2xl font-black text-rose-600">{overdueCount}</h3>
                    </CardContent>
                </Card>

                {/* Returned */}
                <Card className="hover:shadow-md hover:border-emerald-200 transition-all duration-300 group">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                                +15.8% <ArrowUpRight className="size-3" />
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Returned Books</p>
                        <h3 className="text-2xl font-black text-slate-900">{returnedCount}</h3>
                    </CardContent>
                </Card>
            </div>

            {/* ── Table Card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Search student, book or ID…"
                            className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                            value={search}
                            onChange={e => onSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status filter */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Select value={status} onValueChange={(v) => { if (v !== null) onStatus(v) }}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 w-full sm:w-44 font-medium text-slate-600">
                                <Filter className="size-3.5 mr-1.5 text-slate-400" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                {["All", "On Loan", "Returned", "Overdue"].map(o => (
                                    <SelectItem key={o} value={o}>{o === "All" ? "All Transactions" : o}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:block">
                            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="py-4 pl-5 font-bold text-slate-500 text-xs uppercase tracking-wider w-[240px]">Student</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Book Details</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Timeline</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Status</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right pr-5 hidden sm:table-cell">Transaction ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.map((row, idx) => {
                                const badge = STATUS_CFG[row.status as keyof typeof STATUS_CFG]
                                const avatarCls = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                                return (
                                    <TableRow key={row.id} className="group hover:bg-slate-50/60 transition-colors border-slate-50 cursor-pointer">
                                        {/* Student */}
                                        <TableCell className="py-4 pl-5">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 rounded-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                                                    <AvatarFallback className={`${avatarCls} font-black text-xs rounded-xl`}>
                                                        {row.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{row.user}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium truncate">{row.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Book */}
                                        <TableCell>
                                            <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate max-w-[200px]">
                                                {row.book}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-medium">{row.category} • Hardcover</p>
                                        </TableCell>

                                        {/* Timeline */}
                                        <TableCell className="hidden md:table-cell">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                    <Clock className="size-3 text-slate-300 shrink-0" />
                                                    <span>Borrowed: {row.borrowDate}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                    <Calendar className="size-3 text-slate-300 shrink-0" />
                                                    <span>Due: {row.dueDate}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <Badge className={`px-2.5 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1.5 w-fit ${badge.cls}`}>
                                                <badge.icon className="size-3" />
                                                {row.status}
                                            </Badge>
                                        </TableCell>

                                        {/* ID */}
                                        <TableCell className="text-right pr-5 hidden sm:table-cell">
                                            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                {row.id}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}

                            {paginated.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <History className="size-8 text-slate-300" />
                                            <p className="text-sm font-medium">No transactions match your search.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
                    <p className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                        Showing <span className="font-bold text-slate-700">
                            {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)}
                        </span> of <span className="font-bold text-slate-700">{filtered.length}</span> results
                    </p>
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <Button
                            variant="outline" size="icon"
                            className="h-8 w-8 rounded-lg border-slate-200"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <Button
                                key={p}
                                size="icon"
                                className={`h-8 w-8 rounded-lg text-xs font-bold ${p === page ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ))}
                        <Button
                            variant="outline" size="icon"
                            className="h-8 w-8 rounded-lg border-slate-200"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
