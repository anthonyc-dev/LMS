import { useState, useMemo } from "react"
import {
    Search,
    Filter,
    Package,
    TrendingUp,

    AlertTriangle,
    CheckCircle2,
    BookOpen,
    BarChart3,
    ArrowUpRight,

    ChevronLeft,
    ChevronRight,
    Edit3,
    Plus,
    Minus,
    RefreshCcw,
    Download,
    Layers,
    Hash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface InventoryBook {
    id: string
    title: string
    author: string
    isbn: string
    category: string
    totalCopies: number
    availableCopies: number
    borrowedCopies: number
    damagedCopies: number
    lastUpdated: string
    coverColor: string
}

const CATEGORY_COLORS: Record<string, string> = {
    Fiction:      "#6366f1",
    Science:      "#10b981",
    Technology:   "#3b82f6",
    Biography:    "#f59e0b",
    "Self-Help":  "#8b5cf6",
    History:      "#ec4899",
    Philosophy:   "#14b8a6",
    Mystery:      "#f97316",
}

const SAMPLE_BOOKS: InventoryBook[] = [
    { id: "1",  title: "The Great Gatsby",              author: "F. Scott Fitzgerald", isbn: "978-0743273565", category: "Fiction",     totalCopies: 20, availableCopies: 12, borrowedCopies: 7,  damagedCopies: 1, lastUpdated: "2025-05-20", coverColor: "#6366f1" },
    { id: "2",  title: "A Brief History of Time",       author: "Stephen Hawking",      isbn: "978-0553380163", category: "Science",     totalCopies: 15, availableCopies: 3,  borrowedCopies: 11, damagedCopies: 1, lastUpdated: "2025-05-18", coverColor: "#10b981" },
    { id: "3",  title: "Atomic Habits",                 author: "James Clear",          isbn: "978-0735211292", category: "Self-Help",   totalCopies: 30, availableCopies: 25, borrowedCopies: 5,  damagedCopies: 0, lastUpdated: "2025-05-22", coverColor: "#8b5cf6" },
    { id: "4",  title: "Clean Code",                    author: "Robert C. Martin",     isbn: "978-0132350884", category: "Technology",  totalCopies: 18, availableCopies: 2,  borrowedCopies: 14, damagedCopies: 2, lastUpdated: "2025-05-19", coverColor: "#3b82f6" },
    { id: "5",  title: "Sapiens",                       author: "Yuval Noah Harari",    isbn: "978-0062316097", category: "History",     totalCopies: 22, availableCopies: 10, borrowedCopies: 12, damagedCopies: 0, lastUpdated: "2025-05-17", coverColor: "#ec4899" },
    { id: "6",  title: "Deep Work",                     author: "Cal Newport",          isbn: "978-1455586691", category: "Self-Help",   totalCopies: 14, availableCopies: 0,  borrowedCopies: 12, damagedCopies: 2, lastUpdated: "2025-05-16", coverColor: "#8b5cf6" },
    { id: "7",  title: "The Pragmatic Programmer",      author: "David Thomas",         isbn: "978-0135957059", category: "Technology",  totalCopies: 10, availableCopies: 8,  borrowedCopies: 2,  damagedCopies: 0, lastUpdated: "2025-05-21", coverColor: "#3b82f6" },
    { id: "8",  title: "A Promised Land",               author: "Barack Obama",         isbn: "978-1524763169", category: "Biography",   totalCopies: 8,  availableCopies: 1,  borrowedCopies: 7,  damagedCopies: 0, lastUpdated: "2025-05-15", coverColor: "#f59e0b" },
    { id: "9",  title: "Meditations",                   author: "Marcus Aurelius",      isbn: "978-0140449334", category: "Philosophy",  totalCopies: 12, availableCopies: 9,  borrowedCopies: 3,  damagedCopies: 0, lastUpdated: "2025-05-14", coverColor: "#14b8a6" },
    { id: "10", title: "The Da Vinci Code",              author: "Dan Brown",            isbn: "978-0307474278", category: "Mystery",     totalCopies: 25, availableCopies: 4,  borrowedCopies: 20, damagedCopies: 1, lastUpdated: "2025-05-23", coverColor: "#f97316" },
    { id: "11", title: "Thinking, Fast and Slow",       author: "Daniel Kahneman",      isbn: "978-0374533557", category: "Science",     totalCopies: 16, availableCopies: 11, borrowedCopies: 5,  damagedCopies: 0, lastUpdated: "2025-05-12", coverColor: "#10b981" },
    { id: "12", title: "Zero to One",                   author: "Peter Thiel",          isbn: "978-0804139021", category: "Self-Help",   totalCopies: 9,  availableCopies: 7,  borrowedCopies: 2,  damagedCopies: 0, lastUpdated: "2025-05-11", coverColor: "#8b5cf6" },
]

const ROWS_PER_PAGE = 8

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStockStatus(book: InventoryBook) {
    const ratio = book.availableCopies / book.totalCopies
    if (book.availableCopies === 0) return "out"
    if (ratio <= 0.25)             return "low"
    if (ratio <= 0.60)             return "medium"
    return "good"
}

const statusConfig = {
    good:   { label: "In Stock",    cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    medium: { label: "Moderate",    cls: "bg-amber-100  text-amber-800  border-amber-200"  },
    low:    { label: "Low Stock",   cls: "bg-orange-100 text-orange-800 border-orange-200" },
    out:    { label: "Out of Stock",cls: "bg-rose-100   text-rose-800   border-rose-200"   },
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MiniBookCover({ color, title }: { color: string; title: string }) {
    return (
        <div
            className="w-10 h-14 rounded-md shrink-0 flex items-end justify-center pb-1 shadow-md relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}
            aria-label={title}
        >
            <div className="absolute top-1 left-1 right-1 h-0.5 bg-white/20 rounded-full" />
            <div className="absolute top-2.5 left-1 right-1 h-0.5 bg-white/10 rounded-full" />
            <BookOpen className="size-3.5 text-white/70" />
        </div>
    )
}

// ---------------------------------------------------------------------------
// Adjust Stock Modal
// ---------------------------------------------------------------------------

interface AdjustModalProps {
    book: InventoryBook | null
    open: boolean
    onClose: () => void
    onSave: (bookId: string, field: "available" | "damaged" | "borrowed", delta: number) => void
}

function AdjustStockModal({ book, open, onClose, onSave }: AdjustModalProps) {
    const [field, setField]   = useState<"available" | "damaged" | "borrowed">("available")
    const [delta, setDelta]   = useState(0)
    const [reason, setReason] = useState("")

    const handleSave = () => {
        if (!book || delta === 0) {
            toast.error("Please set a non-zero adjustment value.")
            return
        }
        onSave(book.id, field, delta)
        setDelta(0)
        setReason("")
        onClose()
    }

    if (!book) return null

    const currentVal = field === "available" ? book.availableCopies
                     : field === "damaged"   ? book.damagedCopies
                     : book.borrowedCopies

    const previewVal = Math.max(0, currentVal + delta)

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-4xl">
                {/* Header */}
                <div className="bg-linear-to-br from-indigo-600 to-violet-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full" />
                    <DialogHeader className="relative z-10 space-y-1">
                        <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                            <Edit3 className="size-5" /> Adjust Stock
                        </DialogTitle>
                        <DialogDescription className="text-indigo-200 font-medium text-sm">
                            {book.title}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-5 bg-white">
                    {/* Field selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Adjust Field</label>
                        <Select value={field} onValueChange={(v) => { setField(v as typeof field); setDelta(0) }}>
                            <SelectTrigger className="rounded-xl border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="available">Available Copies</SelectItem>
                                <SelectItem value="borrowed">Borrowed Copies</SelectItem>
                                <SelectItem value="damaged">Damaged Copies</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Delta stepper */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Quantity Change</label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDelta(d => d - 1)}
                                className="size-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors font-bold text-lg"
                            >
                                <Minus className="size-4" />
                            </button>
                            <div className="flex-1 text-center">
                                <span className={`text-3xl font-black ${delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-slate-400"}`}>
                                    {delta > 0 ? `+${delta}` : delta}
                                </span>
                            </div>
                            <button
                                onClick={() => setDelta(d => d + 1)}
                                className="size-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors font-bold text-lg"
                            >
                                <Plus className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between text-sm font-bold border border-slate-100">
                        <div className="text-center">
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Current</p>
                            <p className="text-2xl text-slate-800">{currentVal}</p>
                        </div>
                        <ArrowUpRight className="size-5 text-slate-300" />
                        <div className="text-center">
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">After</p>
                            <p className={`text-2xl ${previewVal !== currentVal ? "text-indigo-600" : "text-slate-800"}`}>{previewVal}</p>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Reason <span className="text-slate-400 font-normal">(optional)</span></label>
                        <Input
                            placeholder="e.g. New shipment received, damaged during shelving…"
                            className="rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <Button variant="outline" onClick={onClose} className="rounded-xl font-bold text-slate-600 flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex-1 shadow-md shadow-indigo-200"
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function InventoryPage() {
    const [books, setBooks]               = useState<InventoryBook[]>(SAMPLE_BOOKS)
    const [search, setSearch]             = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [page, setPage]                 = useState(1)
    const [adjustBook, setAdjustBook]     = useState<InventoryBook | null>(null)
    const [isAdjustOpen, setIsAdjustOpen] = useState(false)

    // -----------------------------------------------------------------------
    // Derived / computed
    // -----------------------------------------------------------------------

    const categories = useMemo(() => ["all", ...Array.from(new Set(books.map(b => b.category)))], [books])

    const filtered = useMemo(() => {
        return books.filter(b => {
            const matchSearch =
                b.title.toLowerCase().includes(search.toLowerCase()) ||
                b.author.toLowerCase().includes(search.toLowerCase()) ||
                b.isbn.includes(search)
            const matchCat    = categoryFilter === "all" || b.category === categoryFilter
            const matchStatus = statusFilter === "all"   || getStockStatus(b) === statusFilter
            return matchSearch && matchCat && matchStatus
        })
    }, [books, search, categoryFilter, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
    const paginatedBooks = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

    // KPI metrics
    const totalVolumes   = books.reduce((s, b) => s + b.totalCopies, 0)
    const totalAvailable = books.reduce((s, b) => s + b.availableCopies, 0)
    const totalBorrowed  = books.reduce((s, b) => s + b.borrowedCopies, 0)
    const totalDamaged   = books.reduce((s, b) => s + b.damagedCopies, 0)
    const lowStockCount  = books.filter(b => getStockStatus(b) === "low" || getStockStatus(b) === "out").length
    const utilizationPct = Math.round((totalBorrowed / totalVolumes) * 100)

    // Category chart data
    const getCategoryChartData = () => {
        const map: Record<string, { available: number; borrowed: number; damaged: number }> = {}
        books.forEach(b => {
            if (!map[b.category]) map[b.category] = { available: 0, borrowed: 0, damaged: 0 }
            map[b.category].available += b.availableCopies
            map[b.category].borrowed  += b.borrowedCopies
            map[b.category].damaged   += b.damagedCopies
        })
        return Object.entries(map).map(([name, v]) => ({ name: name.length > 8 ? name.slice(0, 7) + "…" : name, ...v }))
    }
    const categoryChartData = getCategoryChartData()

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    const handleAdjust = (book: InventoryBook) => {
        setAdjustBook(book)
        setIsAdjustOpen(true)
    }

    const handleSaveAdjust = (bookId: string, field: "available" | "damaged" | "borrowed", delta: number) => {
        setBooks(prev => prev.map(b => {
            if (b.id !== bookId) return b
            const updated = { ...b }
            if (field === "available") updated.availableCopies = Math.max(0, b.availableCopies + delta)
            if (field === "damaged")   updated.damagedCopies   = Math.max(0, b.damagedCopies   + delta)
            if (field === "borrowed")  updated.borrowedCopies  = Math.max(0, b.borrowedCopies  + delta)
            return updated
        }))
        toast.success("Stock updated successfully")
    }

    // Reset page on filter change
    const handleSearch = (v: string) => { setSearch(v); setPage(1) }
    const handleCatFilter = (v: string | null) => { if (v !== null) { setCategoryFilter(v); setPage(1) } }
    const handleStatusFilter = (v: string | null) => { if (v !== null) { setStatusFilter(v); setPage(1) } }

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <Package className="text-indigo-600 size-7" />
                        </div>
                        Inventory Management
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 ml-1">
                        Track stock levels, utilization, and book conditions across your entire catalog.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold gap-2"
                        onClick={() => toast.info("Export functionality coming soon.")}
                    >
                        <Download className="size-4" /> Export
                    </Button>
                    <Button
                        variant="outline"
                        className="h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold gap-2"
                        onClick={() => { setBooks(SAMPLE_BOOKS); toast.success("Data refreshed") }}
                    >
                        <RefreshCcw className="size-4" /> Refresh
                    </Button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Volumes */}
                <Card className="hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                            <Layers className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Volumes</p>
                            <h3 className="text-2xl font-black text-slate-900">{totalVolumes.toLocaleString()}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">{books.length} unique titles</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Available */}
                <Card className="hover:shadow-md hover:border-emerald-200 transition-all duration-300 group">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                            <CheckCircle2 className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available</p>
                            <h3 className="text-2xl font-black text-slate-900">{totalAvailable.toLocaleString()}</h3>
                            <div className="flex items-center gap-1 mt-0.5">
                                <ArrowUpRight className="size-3 text-emerald-500" />
                                <span className="text-[11px] text-emerald-600 font-bold">
                                    {Math.round((totalAvailable / totalVolumes) * 100)}% of stock
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Borrowed */}
                <Card className="hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                            <TrendingUp className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Borrowed</p>
                            <h3 className="text-2xl font-black text-slate-900">{totalBorrowed.toLocaleString()}</h3>
                            <div className="mt-1.5 space-y-0.5">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                    <span>Utilization</span>
                                    <span>{utilizationPct}%</span>
                                </div>
                                <Progress value={utilizationPct} className="h-1.5 bg-slate-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Alerts */}
                <Card className="hover:shadow-md hover:border-rose-200 transition-all duration-300 group">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                            <AlertTriangle className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Needs Attention</p>
                            <h3 className="text-2xl font-black text-rose-600">{lowStockCount}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {totalDamaged} damaged copies
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Charts + Low Stock Alerts Row ── */}
            <div className="grid gap-6 lg:grid-cols-5">

                {/* Category Stock Bar Chart (3/5) */}
                <Card className="lg:col-span-3 shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                                <BarChart3 className="size-4 text-indigo-500" /> Stock by Category
                            </CardTitle>
                            <p className="text-xs text-slate-400 font-medium">Available vs Borrowed copies per genre</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <ResponsiveContainer width="100%" height={230}>
                            <BarChart data={categoryChartData} barGap={4} barCategoryGap="35%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "rgba(255,255,255,0.97)", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                                    labelStyle={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}
                                />
                                <Bar name="Available" dataKey="available" radius={[4, 4, 0, 0]} fill="#6366f1" />
                                <Bar name="Borrowed"  dataKey="borrowed"  radius={[4, 4, 0, 0]} fill="#10b981" />
                                <Bar name="Damaged"   dataKey="damaged"   radius={[4, 4, 0, 0]} fill="#f87171" />
                            </BarChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="flex items-center gap-6 justify-center mt-3">
                            {[["Available", "#6366f1"], ["Borrowed", "#10b981"], ["Damaged", "#f87171"]].map(([label, color]) => (
                                <div key={label} className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Low-Stock Alerts (2/5) */}
                <Card className="lg:col-span-2 shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="border-b border-slate-50 pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                                <AlertTriangle className="size-4 text-rose-500" /> Stock Alerts
                            </CardTitle>
                            <p className="text-xs text-slate-400 font-medium">Titles needing restocking</p>
                        </div>
                        <Badge className="bg-rose-50 text-rose-600 border-none font-bold">{lowStockCount} items</Badge>
                    </CardHeader>
                    <CardContent className="p-0 h-[230px] overflow-y-auto">
                        {books
                            .filter(b => getStockStatus(b) === "low" || getStockStatus(b) === "out")
                            .map(b => {
                                const st = getStockStatus(b)
                                return (
                                    <div key={b.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <MiniBookCover color={b.coverColor} title={b.title} />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate">{b.title}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{b.author}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 space-y-1">
                                            <Badge className={`text-[9px] font-bold border px-2 py-0.5 ${statusConfig[st].cls}`}>
                                                {statusConfig[st].label}
                                            </Badge>
                                            <p className="text-[10px] text-slate-500 font-bold">
                                                {b.availableCopies}/{b.totalCopies} left
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        {lowStockCount === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                <CheckCircle2 className="size-8 text-emerald-400" />
                                <p className="text-sm font-medium">All titles are well-stocked!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── Inventory Table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Hash className="size-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">
                            {filtered.length} {filtered.length === 1 ? "title" : "titles"} found
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                placeholder="Search title, author, ISBN…"
                                className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                            />
                        </div>

                        {/* Category filter */}
                        <Select value={categoryFilter} onValueChange={handleCatFilter}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 w-full sm:w-40">
                                <Filter className="size-3.5 mr-1.5 text-slate-400" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                {categories.map(c => (
                                    <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status filter */}
                        <Select value={statusFilter} onValueChange={handleStatusFilter}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="good">In Stock</SelectItem>
                                <SelectItem value="medium">Moderate</SelectItem>
                                <SelectItem value="low">Low Stock</SelectItem>
                                <SelectItem value="out">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="py-4 pl-5 font-bold text-slate-500 w-[300px]">Book</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500">Category</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-center">Total</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-center">Available</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-center">Borrowed</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-center">Damaged</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500">Utilization</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500">Status</TableHead>
                                <TableHead className="py-4 font-bold text-slate-500 text-right pr-5">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedBooks.map((book) => {
                                const st         = getStockStatus(book)
                                const utilPct    = Math.round((book.borrowedCopies / book.totalCopies) * 100)
                                const progressCl = st === "out" ? "bg-rose-500" : st === "low" ? "bg-orange-500" : st === "medium" ? "bg-amber-500" : "bg-emerald-500"

                                return (
                                    <TableRow key={book.id} className="hover:bg-slate-50/60 transition-colors group">
                                        {/* Book info */}
                                        <TableCell className="py-3.5 pl-5">
                                            <div className="flex items-center gap-3">
                                                <MiniBookCover color={book.coverColor} title={book.title} />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 text-sm truncate max-w-[180px]">{book.title}</p>
                                                    <p className="text-xs text-slate-500 font-medium truncate">{book.author}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{book.isbn}</p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Category */}
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className="font-bold border-none text-xs"
                                                style={{
                                                    backgroundColor: `${CATEGORY_COLORS[book.category] || "#64748b"}18`,
                                                    color: CATEGORY_COLORS[book.category] || "#64748b",
                                                }}
                                            >
                                                {book.category}
                                            </Badge>
                                        </TableCell>

                                        {/* Counts */}
                                        <TableCell className="text-center">
                                            <span className="font-black text-slate-700">{book.totalCopies}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="font-black text-emerald-700">{book.availableCopies}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="font-black text-blue-700">{book.borrowedCopies}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`font-black ${book.damagedCopies > 0 ? "text-rose-600" : "text-slate-400"}`}>
                                                {book.damagedCopies}
                                            </span>
                                        </TableCell>

                                        {/* Utilization bar */}
                                        <TableCell className="min-w-[120px]">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                    <span>{utilPct}%</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${progressCl}`}
                                                        style={{ width: `${utilPct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Status badge */}
                                        <TableCell>
                                            <Badge className={`px-2.5 py-1 rounded-full border text-xs font-bold shadow-sm ${statusConfig[st].cls}`}>
                                                {statusConfig[st].label}
                                            </Badge>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right pr-5">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleAdjust(book)}
                                                className="h-8 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 font-bold gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit3 className="size-3.5" /> Adjust
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}

                            {paginatedBooks.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-48 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="size-8 text-slate-300" />
                                            <p className="font-medium text-sm">No books match your filters.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/60">
                    <p className="text-xs text-slate-500 font-medium">
                        Showing <span className="font-bold text-slate-700">{Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ROWS_PER_PAGE, filtered.length)}</span> of <span className="font-bold text-slate-700">{filtered.length}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-slate-200"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <Button
                                key={p}
                                variant={p === page ? "default" : "outline"}
                                size="icon"
                                className={`h-8 w-8 rounded-lg text-xs font-bold ${p === page ? "bg-indigo-600 hover:bg-indigo-700 border-indigo-600 shadow-sm shadow-indigo-200" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-slate-200"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Adjust Stock Modal ── */}
            <AdjustStockModal
                book={adjustBook}
                open={isAdjustOpen}
                onClose={() => setIsAdjustOpen(false)}
                onSave={handleSaveAdjust}
            />
        </div>
    )
}
