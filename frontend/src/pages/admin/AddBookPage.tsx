import { useState, useRef } from "react"
import {
    Upload, BookOpen, ArrowLeft, Plus, Minus,
    Tag, Hash, User, FileText, Library, Check,
    ImageIcon, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { usePageTitle } from "@/hooks/usePageTitle";

const CATEGORIES = ["Fiction", "Science", "Biography", "Self-Help", "Productivity", "Mystery", "Technology", "History", "Philosophy"]
const LANGUAGES  = ["English", "Filipino", "Spanish", "French", "German", "Japanese", "Chinese"]
const CONDITIONS = ["New", "Good", "Fair", "Poor"]

// ---------------------------------------------------------------------------
// Reusable field wrapper
// ---------------------------------------------------------------------------

function Field({
    id, label, required, hint, error, icon: Icon, children,
}: {
    id?: string
    label: string
    required?: boolean
    hint?: string
    error?: string
    icon?: React.ElementType
    children: React.ReactNode
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                {Icon && <Icon className="size-3.5 text-slate-400" />}
                {label}
                {required && <span className="text-rose-500 ml-0.5">*</span>}
            </Label>
            {children}
            {hint  && !error && <p className="text-[11px] text-slate-400 font-medium">{hint}</p>}
            {error && <p className="text-[11px] text-rose-500 font-bold">{error}</p>}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
    return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
            done   ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" :
            active ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" :
                     "bg-slate-100 text-slate-400"
        }`}>
            {done ? <Check className="size-4" /> : n}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function AddBookPage() {
  usePageTitle("Add Book");
    const navigate = useNavigate()

    const [step, setStep] = useState(1)

    const [formData, setFormData] = useState({
        title: "", author: "", isbn: "", publisher: "",
        year: "", language: "English", category: "",
        stock: 1, condition: "New", description: "", tags: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const set = (key: keyof typeof formData) => (val: string | number | null) =>
        setFormData(f => ({ ...f, [key]: (val ?? "") as never }))

    // Validation per step
    const validateStep1 = () => {
        const e: Record<string, string> = {}
        if (!formData.title.trim())    e.title    = "Book title is required."
        if (!formData.author.trim())   e.author   = "Author is required."
        if (!formData.category)        e.category = "Please select a category."
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return
        setStep(s => s + 1)
    }

    const handleBack = () => setStep(s => s - 1)

    const handleSubmit = () => {
        toast.success("Book added to catalog successfully!")
        navigate("/admin/books")
    }

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setCoverPreview(url)
    }

    const steps = [
        { n: 1, label: "Book Info" },
        { n: 2, label: "Details"   },
        { n: 3, label: "Review"    },
    ]

    return (
        <div className="max-w-[860px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* ── Page Header ── */}
            <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <Button
                    variant="ghost" size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-slate-100 shrink-0"
                    onClick={() => navigate("/admin/books")}
                >
                    <ArrowLeft className="size-5 text-slate-500" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Add New Book</h1>
                    <p className="text-slate-500 font-medium text-sm mt-0.5">Fill in the details below to add a book to the catalog.</p>
                </div>
                {/* Step indicator */}
                <div className="hidden sm:flex items-center gap-2">
                    {steps.map((s, i) => (
                        <div key={s.n} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <StepDot n={s.n} active={step === s.n} done={step > s.n} />
                                <span className={`text-xs font-bold hidden md:block ${step === s.n ? "text-indigo-600" : step > s.n ? "text-emerald-600" : "text-slate-400"}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-8 h-0.5 rounded-full transition-colors ${step > s.n ? "bg-emerald-400" : "bg-slate-100"}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── STEP 1: Core Book Info ── */}
            {step === 1 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Banner */}
                    <div className="bg-linear-to-br from-indigo-600 to-violet-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
                        <div className="absolute top-4 right-16 opacity-10">
                            <BookOpen size={130} className="-rotate-12" />
                        </div>
                        <div className="relative z-10 space-y-1">
                            <Badge className="bg-white/10 text-white border-white/20 text-[10px] font-bold tracking-wider uppercase mb-2">Step 1 of 3</Badge>
                            <h2 className="text-2xl font-black text-white">Book Information</h2>
                            <p className="text-indigo-200 font-medium">Enter the core details that identify this book.</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Cover + Title/Author */}
                        <div className="flex flex-col sm:flex-row items-start gap-8">
                            {/* Cover uploader */}
                            <div className="w-full sm:w-44 shrink-0">
                                <Label className="text-sm font-bold text-slate-700 block mb-2">Cover Image</Label>
                                <div
                                    className="aspect-3/4 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group relative overflow-hidden"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    {coverPreview ? (
                                        <>
                                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                            <button
                                                onClick={e => { e.stopPropagation(); setCoverPreview(null) }}
                                                className="absolute top-2 right-2 bg-black/40 rounded-full p-1 text-white hover:bg-black/60 transition-colors"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-3 bg-slate-100 rounded-xl mb-2 group-hover:bg-indigo-100 transition-colors">
                                                <ImageIcon className="size-5 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                            <span className="text-[11px] font-bold text-center px-4 group-hover:text-indigo-600 transition-colors">
                                                Click to upload
                                            </span>
                                            <span className="text-[10px] text-slate-300 mt-1">PNG, JPG up to 5MB</span>
                                        </>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                                {coverPreview && (
                                    <Button
                                        variant="outline" size="sm"
                                        className="w-full mt-2 rounded-xl text-xs font-bold border-slate-200"
                                        onClick={() => fileRef.current?.click()}
                                    >
                                        <Upload className="size-3 mr-1" /> Change
                                    </Button>
                                )}
                            </div>

                            {/* Title & Author */}
                            <div className="flex-1 space-y-5 w-full">
                                <Field id="title" label="Book Title" required icon={BookOpen} error={errors.title}>
                                    <Input
                                        id="title"
                                        placeholder="e.g. The Great Gatsby"
                                        className="h-12 rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 text-base"
                                        value={formData.title}
                                        onChange={e => { set("title")(e.target.value); setErrors(er => ({ ...er, title: "" })) }}
                                    />
                                </Field>
                                <Field id="author" label="Author" required icon={User} error={errors.author}>
                                    <Input
                                        id="author"
                                        placeholder="e.g. F. Scott Fitzgerald"
                                        className="h-12 rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 text-base"
                                        value={formData.author}
                                        onChange={e => { set("author")(e.target.value); setErrors(er => ({ ...er, author: "" })) }}
                                    />
                                </Field>
                                <Field id="category" label="Category" required icon={Tag} error={errors.category}>
                                    <Select value={formData.category} onValueChange={v => { set("category")(v); setErrors(er => ({ ...er, category: "" })) }}>
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-indigo-500/20 text-base">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                            {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-sm py-2.5">{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>
                        </div>

                        {/* ISBN + Stock */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field id="isbn" label="ISBN" icon={Hash} hint="International Standard Book Number">
                                <Input
                                    id="isbn"
                                    placeholder="e.g. 978-0743273565"
                                    className="h-12 rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                                    value={formData.isbn}
                                    onChange={e => set("isbn")(e.target.value)}
                                />
                            </Field>

                            {/* Stock stepper */}
                            <Field label="Initial Stock" icon={Library}>
                                <div className="flex items-center gap-3 h-12">
                                    <button
                                        onClick={() => set("stock")(Math.max(0, formData.stock - 1))}
                                        className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors font-bold shrink-0"
                                    >
                                        <Minus className="size-4" />
                                    </button>
                                    <div className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-900 text-lg">
                                        {formData.stock}
                                    </div>
                                    <button
                                        onClick={() => set("stock")(formData.stock + 1)}
                                        className="h-10 w-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors font-bold shrink-0"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                            </Field>
                        </div>
                    </div>

                    <div className="px-8 pb-8 flex justify-end">
                        <Button
                            onClick={handleNext}
                            className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                        >
                            Continue to Details →
                        </Button>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Additional Details ── */}
            {step === 2 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-linear-to-br from-violet-600 to-fuchsia-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
                        <div className="relative z-10 space-y-1">
                            <Badge className="bg-white/10 text-white border-white/20 text-[10px] font-bold tracking-wider uppercase mb-2">Step 2 of 3</Badge>
                            <h2 className="text-2xl font-black text-white">Additional Details</h2>
                            <p className="text-violet-200 font-medium">Add more context to help users find and understand this book.</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field id="publisher" label="Publisher" icon={Library}>
                                <Input
                                    id="publisher"
                                    placeholder="e.g. Scribner"
                                    className="h-12 rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                                    value={formData.publisher}
                                    onChange={e => set("publisher")(e.target.value)}
                                />
                            </Field>
                            <Field id="year" label="Publication Year">
                                <Input
                                    id="year"
                                    type="number"
                                    placeholder="e.g. 1925"
                                    min="1000"
                                    max="2099"
                                    className="h-12 rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                                    value={formData.year}
                                    onChange={e => set("year")(e.target.value)}
                                />
                            </Field>
                            <Field id="language" label="Language">
                                <Select value={formData.language} onValueChange={v => set("language")(v)}>
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-indigo-500/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        {LANGUAGES.map(l => <SelectItem key={l} value={l} className="text-sm py-2">{l}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field id="condition" label="Book Condition">
                                <Select value={formData.condition} onValueChange={v => set("condition")(v)}>
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-indigo-500/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        {CONDITIONS.map(c => <SelectItem key={c} value={c} className="text-sm py-2">{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        <Field id="description" label="Description" icon={FileText} hint="A brief summary or synopsis to help students find the right book.">
                            <Textarea
                                id="description"
                                placeholder="Brief summary of the book…"
                                className="rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 resize-none h-28"
                                value={formData.description}
                                onChange={e => set("description")(e.target.value)}
                            />
                        </Field>

                        <Field id="tags" label="Tags" hint='Comma-separated keywords, e.g. "classic, american-literature, novel"'>
                            <Input
                                id="tags"
                                placeholder="classic, american-literature, 1920s…"
                                className="h-12 rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                                value={formData.tags}
                                onChange={e => set("tags")(e.target.value)}
                            />
                        </Field>
                    </div>

                    <div className="px-8 pb-8 flex justify-between">
                        <Button variant="outline" onClick={handleBack} className="h-12 rounded-xl font-bold text-slate-600 px-6">
                            ← Back
                        </Button>
                        <Button
                            onClick={handleNext}
                            className="h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 shadow-lg shadow-violet-200 transition-all hover:scale-105 active:scale-95"
                        >
                            Review & Submit →
                        </Button>
                    </div>
                </div>
            )}

            {/* ── STEP 3: Review ── */}
            {step === 3 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-linear-to-br from-emerald-600 to-teal-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
                        <div className="relative z-10 space-y-1">
                            <Badge className="bg-white/10 text-white border-white/20 text-[10px] font-bold tracking-wider uppercase mb-2">Step 3 of 3</Badge>
                            <h2 className="text-2xl font-black text-white">Review & Confirm</h2>
                            <p className="text-emerald-100 font-medium">Verify the details below before adding to the catalog.</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Preview card */}
                        <div className="flex flex-col sm:flex-row gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            {/* Cover */}
                            <div className="w-28 shrink-0">
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover" className="w-full aspect-3/4 object-cover rounded-xl shadow-md" />
                                ) : (
                                    <div className="w-full aspect-3/4 bg-linear-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center shadow-md">
                                        <BookOpen className="size-8 text-indigo-400" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-3">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{formData.title || <span className="text-slate-300">Untitled</span>}</h3>
                                    <p className="text-slate-500 font-medium">{formData.author || "Unknown author"}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.category && <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold">{formData.category}</Badge>}
                                    {formData.language  && <Badge className="bg-slate-100 text-slate-600 border-none font-bold">{formData.language}</Badge>}
                                    {formData.condition && <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">{formData.condition}</Badge>}
                                </div>
                                {formData.description && (
                                    <p className="text-sm text-slate-500 font-medium line-clamp-2">{formData.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                                { label: "ISBN",        value: formData.isbn      || "—" },
                                { label: "Publisher",   value: formData.publisher  || "—" },
                                { label: "Year",        value: formData.year       || "—" },
                                { label: "Initial Stock", value: String(formData.stock) },
                                { label: "Tags",        value: formData.tags       || "—" },
                            ].map(item => (
                                <div key={item.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                                    <p className="text-sm font-bold text-slate-800 truncate">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="px-8 pb-8 flex flex-col sm:flex-row justify-between gap-4">
                        <Button variant="outline" onClick={handleBack} className="h-12 rounded-xl font-bold text-slate-600 px-6">
                            ← Back
                        </Button>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => navigate("/admin/books")} className="h-12 rounded-xl font-bold text-slate-600 px-6">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95 gap-2"
                            >
                                <Check className="size-4" /> Add to Catalog
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
