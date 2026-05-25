import { useState, useMemo } from "react"
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    BookOpen,
    MoreHorizontal,
    AlertCircle,
    MapPin,
    Layers,
    LayoutGrid,
    List,
    Package,
    CheckCircle2,
    AlertTriangle,
    X,
    Hash,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Types & seed data
// ---------------------------------------------------------------------------

type ShelfStatus = "active" | "maintenance" | "full"

interface Shelf {
    id: string
    code: string           // e.g. "A-01"
    label: string          // e.g. "Fiction — Row 1"
    floor: string          // e.g. "Ground Floor"
    section: string        // e.g. "Section A"
    category: string       // category it houses
    capacity: number
    occupied: number
    status: ShelfStatus
    notes: string
    lastAudited: string
}

const FLOORS = ["Ground Floor", "First Floor", "Second Floor"]
const SECTIONS = ["Section A", "Section B", "Section C", "Section D"]
const CATS = ["Fiction", "Science", "Technology", "Biography", "Self-Help", "History", "Philosophy", "Mystery"]

const INITIAL_SHELVES: Shelf[] = [
    { id: "1", code: "A-01", label: "Fiction — Row 1", floor: "Ground Floor", section: "Section A", category: "Fiction", capacity: 80, occupied: 72, status: "active", notes: "", lastAudited: "2025-05-10" },
    { id: "2", code: "A-02", label: "Fiction — Row 2", floor: "Ground Floor", section: "Section A", category: "Fiction", capacity: 80, occupied: 76, status: "full", notes: "Needs overflow shelf", lastAudited: "2025-05-10" },
    { id: "3", code: "A-03", label: "Science — Row 1", floor: "Ground Floor", section: "Section A", category: "Science", capacity: 60, occupied: 38, status: "active", notes: "", lastAudited: "2025-05-12" },
    { id: "4", code: "B-01", label: "Technology — Row 1", floor: "Ground Floor", section: "Section B", category: "Technology", capacity: 70, occupied: 65, status: "active", notes: "", lastAudited: "2025-05-11" },
    { id: "5", code: "B-02", label: "Technology — Row 2", floor: "Ground Floor", section: "Section B", category: "Technology", capacity: 70, occupied: 47, status: "maintenance", notes: "Shelf bracket broken", lastAudited: "2025-05-08" },
    { id: "6", code: "B-03", label: "Self-Help — Row 1", floor: "Ground Floor", section: "Section B", category: "Self-Help", capacity: 50, occupied: 42, status: "active", notes: "", lastAudited: "2025-05-14" },
    { id: "7", code: "C-01", label: "History — Row 1", floor: "First Floor", section: "Section C", category: "History", capacity: 65, occupied: 55, status: "active", notes: "", lastAudited: "2025-05-09" },
    { id: "8", code: "C-02", label: "Biography — Row 1", floor: "First Floor", section: "Section C", category: "Biography", capacity: 45, occupied: 29, status: "active", notes: "", lastAudited: "2025-05-13" },
    { id: "9", code: "C-03", label: "Philosophy — Row 1", floor: "First Floor", section: "Section C", category: "Philosophy", capacity: 40, occupied: 31, status: "active", notes: "", lastAudited: "2025-05-15" },
    { id: "10", code: "D-01", label: "Mystery — Row 1", floor: "First Floor", section: "Section D", category: "Mystery", capacity: 55, occupied: 48, status: "active", notes: "", lastAudited: "2025-05-11" },
    { id: "11", code: "D-02", label: "Mystery — Row 2", floor: "First Floor", section: "Section D", category: "Mystery", capacity: 55, occupied: 21, status: "active", notes: "", lastAudited: "2025-05-11" },
    { id: "12", code: "D-03", label: "Reference — Row 1", floor: "Second Floor", section: "Section D", category: "Science", capacity: 90, occupied: 84, status: "full", notes: "Restricted access", lastAudited: "2025-05-07" },
]

const ROWS_PER_PAGE = 8

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusCfg: Record<ShelfStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    active: { label: "Active", cls: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 className="size-3" /> },
    maintenance: { label: "Maintenance", cls: "bg-amber-100  text-amber-800  border-amber-200", icon: <AlertTriangle className="size-3" /> },
    full: { label: "Full", cls: "bg-rose-100   text-rose-800   border-rose-200", icon: <Package className="size-3" /> },
}

function occupancyColor(pct: number) {
    if (pct >= 95) return "bg-rose-500"
    if (pct >= 75) return "bg-amber-500"
    return "bg-emerald-500"
}

// ---------------------------------------------------------------------------
// Field helper
// ---------------------------------------------------------------------------

function Field({ id, label, err, children }: { id: string; label: string; err?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-sm font-bold text-slate-700">{label}</Label>
            {children}
            {err && <p className="text-xs text-rose-500 font-medium">{err}</p>}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Shelf Form Modal
// ---------------------------------------------------------------------------

const EMPTY_FORM = {
    code: "", label: "", floor: FLOORS[0], section: SECTIONS[0],
    category: CATS[0], capacity: "60", occupied: "0",
    status: "active" as ShelfStatus, notes: "",
}

interface ShelfFormProps {
    open: boolean
    initial: Shelf | null
    onClose: () => void
    onSave: (data: Omit<Shelf, "id" | "lastAudited">) => void
}

function ShelfFormModal({ open, initial, onClose, onSave }: ShelfFormProps) {
    const [form, setForm] = useState(() =>
        initial
            ? { code: initial.code, label: initial.label, floor: initial.floor, section: initial.section, category: initial.category, capacity: String(initial.capacity), occupied: String(initial.occupied), status: initial.status, notes: initial.notes }
            : { ...EMPTY_FORM }
    )
    const [errors, setErrors] = useState<Record<string, string>>({})

    const set = (key: keyof typeof form) => (val: string | null) => setForm(f => ({ ...f, [key]: (val ?? "") as never }))

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.code.trim()) e.code = "Shelf code is required."
        if (!form.label.trim()) e.label = "Label is required."
        if (!form.capacity || isNaN(+form.capacity) || +form.capacity <= 0) e.capacity = "Enter a valid capacity."
        if (isNaN(+form.occupied) || +form.occupied < 0) e.occupied = "Enter a valid occupied count."
        if (+form.occupied > +form.capacity) e.occupied = "Occupied cannot exceed capacity."
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSave = () => {
        if (!validate()) return
        onSave({
            code: form.code.trim(),
            label: form.label.trim(),
            floor: form.floor,
            section: form.section,
            category: form.category,
            capacity: +form.capacity,
            occupied: +form.occupied,
            status: form.status,
            notes: form.notes.trim(),
        })
    }

    

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-4xl">
                <div className="bg-linear-to-br from-slate-800 to-slate-900 p-6 text-white relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full" />
                    <DialogHeader className="relative z-10 space-y-1">
                        <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                            <Layers className="size-5" /> {initial ? "Edit Shelf" : "New Shelf"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium text-sm">
                            {initial ? "Update shelf details and capacity." : "Register a new shelf in your library."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-4 bg-white max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <Field id="shelf-code" label="Shelf Code *" err={errors.code}>
                            <Input id="shelf-code" placeholder="e.g. A-01" className="rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500" value={form.code} onChange={e => set("code")(e.target.value)} />
                        </Field>
                        <Field id="shelf-status" label="Status">
                            <Select value={form.status} onValueChange={v => set("status")(v as ShelfStatus)}>
                                <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="full">Full</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <Field id="shelf-label" label="Shelf Label *" err={errors.label}>
                        <Input id="shelf-label" placeholder="e.g. Fiction — Row 1" className="rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500" value={form.label} onChange={e => set("label")(e.target.value)} />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field id="shelf-floor" label="Floor">
                            <Select value={form.floor} onValueChange={(v) => { if (v !== null) set("floor")(v) }}>
                                <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    {FLOORS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field id="shelf-section" label="Section">
                            <Select value={form.section} onValueChange={(v) => { if (v !== null) set("section")(v) }}>
                                <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <Field id="shelf-category" label="Assigned Category">
                        <Select value={form.category} onValueChange={(v) => { if (v !== null) set("category")(v) }}>
                            <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                {CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field id="shelf-capacity" label="Capacity *" err={errors.capacity}>
                            <Input id="shelf-capacity" type="number" min="1" className="rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500" value={form.capacity} onChange={e => set("capacity")(e.target.value)} />
                        </Field>
                        <Field id="shelf-occupied" label="Currently Occupied" err={errors.occupied}>
                            <Input id="shelf-occupied" type="number" min="0" className="rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500" value={form.occupied} onChange={e => set("occupied")(e.target.value)} />
                        </Field>
                    </div>

                    <Field id="shelf-notes" label="Notes">
                        <Input id="shelf-notes" placeholder="Any remarks about this shelf…" className="rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500" value={form.notes} onChange={e => set("notes")(e.target.value)} />
                    </Field>
                </div>

                <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <Button variant="outline" onClick={onClose} className="rounded-xl font-bold text-slate-600 flex-1">Cancel</Button>
                    <Button onClick={handleSave} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex-1 shadow-md">
                        {initial ? "Save Changes" : "Create Shelf"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ---------------------------------------------------------------------------
// Delete modal
// ---------------------------------------------------------------------------

function DeleteShelfModal({ open, shelf, onClose, onConfirm }: { open: boolean; shelf: Shelf | null; onClose: () => void; onConfirm: () => void }) {
    if (!shelf) return null
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm rounded-4xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="p-8 text-center space-y-5">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
                        <AlertCircle size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900">Delete Shelf?</h3>
                        <p className="text-slate-500 font-medium text-sm">
                            Remove shelf <span className="font-bold text-slate-800">"{shelf.code} — {shelf.label}"</span>? This cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={onClose} className="rounded-xl font-bold flex-1 h-11">Cancel</Button>
                        <Button onClick={onConfirm} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex-1 h-11 shadow-md shadow-rose-200">Delete</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function ShelfPage() {
    const [shelves, setShelves] = useState<Shelf[]>(INITIAL_SHELVES)
    const [search, setSearch] = useState("")
    const [floorFilter, setFloorFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [viewMode, setViewMode] = useState<"grid" | "table">("table")
    const [page, setPage] = useState(1)
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Shelf | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Shelf | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)

    // Derived
    const filtered = useMemo(() => shelves.filter(s => {
        const matchSearch = s.code.toLowerCase().includes(search.toLowerCase()) || s.label.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
        const matchFloor = floorFilter === "all" || s.floor === floorFilter
        const matchStatus = statusFilter === "all" || s.status === statusFilter
        return matchSearch && matchFloor && matchStatus
    }), [shelves, search, floorFilter, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
    const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

    const totalCapacity = shelves.reduce((s, sh) => s + sh.capacity, 0)
    const totalOccupied = shelves.reduce((s, sh) => s + sh.occupied, 0)
    const totalFree = totalCapacity - totalOccupied
    const fillPct = Math.round((totalOccupied / totalCapacity) * 100)
    const maintenanceCount = shelves.filter(s => s.status === "maintenance").length
    const _fullCount = shelves.filter(s => s.status === "full").length; void _fullCount;

    // Handlers
    const openCreate = () => { setEditTarget(null); setFormOpen(true) }
    const openEdit = (s: Shelf) => { setEditTarget(s); setFormOpen(true) }
    const openDelete = (s: Shelf) => { setDeleteTarget(s); setDeleteOpen(true) }

    const handleSave = (data: Omit<Shelf, "id" | "lastAudited">) => {
        if (editTarget) {
            setShelves(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...data } : s))
            toast.success("Shelf updated successfully")
        } else {
            setShelves(prev => [{
                id: Math.random().toString(36).slice(2, 9),
                lastAudited: new Date().toISOString().slice(0, 10),
                ...data,
            }, ...prev])
            toast.success("Shelf created successfully")
        }
        setFormOpen(false)
    }

    const handleDelete = () => {
        if (!deleteTarget) return
        setShelves(prev => prev.filter(s => s.id !== deleteTarget.id))
        toast.success("Shelf deleted")
        setDeleteOpen(false)
    }

    const onSearch = (v: string) => { setSearch(v); setPage(1) }
    const onFloor = (v: string | null) => { if (v !== null) { setFloorFilter(v); setPage(1) } }
    const onStatus = (v: string | null) => { if (v !== null) { setStatusFilter(v); setPage(1) } }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl">
                            <Layers className="text-slate-700 size-7" />
                        </div>
                        Shelf Management
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 ml-1">
                        Manage shelf locations, capacity, and status across all library floors.
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    id="create-shelf-btn"
                    className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-300 rounded-xl px-6 h-11 font-bold transition-all hover:scale-105 active:scale-95 gap-2"
                >
                    <Plus className="size-4" /> New Shelf
                </Button>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="hover:shadow-md hover:border-slate-300 transition-all group">
                    <CardContent className="p-5 flex items-center gap-3">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                            <Layers className="size-4" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Shelves</p>
                            <h3 className="text-xl font-black text-slate-900">{shelves.length}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md hover:border-indigo-200 transition-all group">
                    <CardContent className="p-5 flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                            <Package className="size-4" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Capacity</p>
                            <h3 className="text-xl font-black text-slate-900">{totalCapacity}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md hover:border-emerald-200 transition-all group">
                    <CardContent className="p-5 flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                            <CheckCircle2 className="size-4" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Free Slots</p>
                            <h3 className="text-xl font-black text-emerald-700">{totalFree}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md hover:border-amber-200 transition-all group">
                    <CardContent className="p-5 flex items-center gap-3">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                            <AlertTriangle className="size-4" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Maintenance</p>
                            <h3 className="text-xl font-black text-amber-700">{maintenanceCount}</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* Utilization card */}
                <Card className="lg:col-span-1 hover:shadow-md hover:border-blue-200 transition-all group">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                                <BookOpen className="size-4" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Fill</p>
                                <h3 className="text-xl font-black text-slate-900">{fillPct}%</h3>
                            </div>
                        </div>
                        <Progress value={fillPct} className="h-1.5 bg-slate-100" />
                    </CardContent>
                </Card>
            </div>

            {/* ── Toolbar ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Search */}
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                placeholder="Search shelves…"
                                className="pl-9 h-9 rounded-xl border-slate-200 focus-visible:border-slate-400 focus-visible:ring-slate-400/20 text-sm"
                                value={search}
                                onChange={e => onSearch(e.target.value)}
                            />
                            {search && (
                                <button onClick={() => onSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Floor filter */}
                        <Select value={floorFilter} onValueChange={(v) => { if (v !== null) onFloor(v) }}>
                            <SelectTrigger className="h-9 rounded-xl border-slate-200 w-40 text-sm">
                                <MapPin className="size-3.5 mr-1.5 text-slate-400" />
                                <SelectValue placeholder="Floor" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="all">All Floors</SelectItem>
                                {FLOORS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        {/* Status filter */}
                        <Select value={statusFilter} onValueChange={(v) => { if (v !== null) onStatus(v) }}>
                            <SelectTrigger className="h-9 rounded-xl border-slate-200 w-36 text-sm">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="full">Full</SelectItem>
                            </SelectContent>
                        </Select>

                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Hash className="size-3" />{filtered.length} shelf{filtered.length !== 1 ? "es" : ""}
                        </span>
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <List className="size-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <LayoutGrid className="size-4" />
                        </button>
                    </div>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === "table" && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-100">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="py-4 pl-5 font-bold text-slate-500">Code</TableHead>
                                    <TableHead className="py-4 font-bold text-slate-500">Label</TableHead>
                                    <TableHead className="py-4 font-bold text-slate-500">Floor / Section</TableHead>
                                    <TableHead className="py-4 font-bold text-slate-500">Category</TableHead>
                                    <TableHead className="py-4 font-bold text-slate-500">Occupancy</TableHead>
                                    <TableHead className="py-4 font-bold text-slate-500">Status</TableHead>
                                    <TableHead className="py-4 font-bold text-slate-500">Last Audit</TableHead>
                                    <TableHead className="py-4 font-bold text-slate-500 text-right pr-5">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.map(shelf => {
                                    const pct = Math.round((shelf.occupied / shelf.capacity) * 100)
                                    return (
                                        <TableRow key={shelf.id} className="hover:bg-slate-50/60 transition-colors group">
                                            <TableCell className="pl-5 py-4">
                                                <span className="font-black text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded-lg text-sm">{shelf.code}</span>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-bold text-slate-800 text-sm">{shelf.label}</p>
                                                {shelf.notes && <p className="text-[11px] text-amber-600 font-medium truncate max-w-[160px]">⚠ {shelf.notes}</p>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-bold text-slate-700">{shelf.floor}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium">{shelf.section}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold border-none text-xs">
                                                    {shelf.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="min-w-[140px]">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                                        <span>{shelf.occupied}/{shelf.capacity}</span>
                                                        <span>{pct}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${occupancyColor(pct)}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`px-2.5 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1 w-fit ${statusCfg[shelf.status].cls}`}>
                                                    {statusCfg[shelf.status].icon}
                                                    {statusCfg[shelf.status].label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-slate-400 font-medium">{shelf.lastAudited}</span>
                                            </TableCell>
                                            <TableCell className="text-right pr-5">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        render={
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        }
                                                    />
                                                    <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-100 shadow-xl p-1.5">
                                                        <DropdownMenuItem onClick={() => openEdit(shelf)} className="cursor-pointer rounded-lg font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 py-2 gap-2">
                                                            <Edit3 className="size-3.5" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                                        <DropdownMenuItem onClick={() => openDelete(shelf)} className="cursor-pointer rounded-lg font-medium text-rose-600 hover:bg-rose-50 py-2 gap-2">
                                                            <Trash2 className="size-3.5" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {paginated.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-48 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Layers className="size-8 text-slate-300" />
                                                <p className="text-sm font-medium">No shelves match your filters.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* ── GRID VIEW ── */}
                {viewMode === "grid" && (
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {paginated.map(shelf => {
                            const pct = Math.round((shelf.occupied / shelf.capacity) * 100)
                            const cfg = statusCfg[shelf.status]
                            return (
                                <div key={shelf.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="font-black text-slate-800 font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-sm shadow-xs">{shelf.code}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`text-[10px] font-bold border flex items-center gap-1 ${cfg.cls}`}>
                                                {cfg.icon} {cfg.label}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
                                                        <MoreHorizontal className="size-3.5" />
                                                    </Button>
                                                } />
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-100 shadow-xl p-1.5">
                                                    <DropdownMenuItem onClick={() => openEdit(shelf)} className="cursor-pointer rounded-lg font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 py-2 gap-2 text-xs">
                                                        <Edit3 className="size-3" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                                    <DropdownMenuItem onClick={() => openDelete(shelf)} className="cursor-pointer rounded-lg font-medium text-rose-600 hover:bg-rose-50 py-2 gap-2 text-xs">
                                                        <Trash2 className="size-3" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{shelf.label}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{shelf.floor} · {shelf.section}</p>
                                    </div>

                                    <Badge variant="secondary" className="bg-white text-slate-600 font-bold border border-slate-200 text-xs shadow-xs">
                                        {shelf.category}
                                    </Badge>

                                    {shelf.notes && (
                                        <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1 font-medium border border-amber-100">⚠ {shelf.notes}</p>
                                    )}

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                            <span>{shelf.occupied}/{shelf.capacity} books</span>
                                            <span>{pct}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-500 ${occupancyColor(pct)}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {paginated.length === 0 && (
                            <div className="col-span-full flex flex-col items-center gap-2 text-slate-400 py-16">
                                <Layers className="size-10 text-slate-300" />
                                <p className="text-sm font-medium">No shelves match your filters.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Pagination ── */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/60">
                    <p className="text-xs text-slate-500 font-medium">
                        Showing <span className="font-bold text-slate-700">{Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ROWS_PER_PAGE, filtered.length)}</span> of <span className="font-bold text-slate-700">{filtered.length}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft className="size-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <Button
                                key={p}
                                variant={p === page ? "default" : "outline"}
                                size="icon"
                                className={`h-8 w-8 rounded-lg text-xs font-bold ${p === page ? "bg-slate-900 hover:bg-slate-800 border-slate-900 shadow-sm" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ))}
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Modals ── */}
            {formOpen && (
                <ShelfFormModal
                    open={formOpen}
                    initial={editTarget}
                    onClose={() => setFormOpen(false)}
                    onSave={handleSave}
                />
            )}
            <DeleteShelfModal
                open={deleteOpen}
                shelf={deleteTarget}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    )
}
