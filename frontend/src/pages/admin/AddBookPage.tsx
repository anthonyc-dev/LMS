import { useState } from "react"
import { Upload, BookOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function AddBookPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        category: "",
        isbn: "",
        stock: "1",
        description: "",
        status: "Available"
    })

    const handleSaveBook = () => {
        if (!formData.title || !formData.author || !formData.category) {
            toast.error("Please fill in all required fields")
            return
        }

        // Logic to actually save the book to the backend will go here.
        // For now, we simulate success and go back to the books list.
        toast.success("Book created successfully")
        navigate("/admin/books")
    }

    return (
        <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
            {/* Header Section */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full hover:bg-slate-100 shrink-0"
                    onClick={() => navigate("/admin/books")}
                >
                    <ArrowLeft className="h-5 w-5 text-slate-500" />
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Add New Book
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Enter the details of the new book to add it to your catalog.</p>
                </div>
            </div>

            {/* Main Form Content */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-indigo-600 p-8 sm:p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <BookOpen size={160} className="-rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <h2 className="text-3xl font-black text-white">
                            Book Details
                        </h2>
                        <p className="text-indigo-100 font-medium text-lg max-w-lg">
                            Provide the necessary information to list a new book in the library management system.
                        </p>
                    </div>
                </div>

                <div className="p-8 sm:p-12 space-y-10">
                    <div className="flex flex-col sm:flex-row items-start gap-8">
                        <div className="w-full sm:w-48 shrink-0 space-y-2">
                            <Label className="text-slate-700 font-bold mb-2 block">Cover Image</Label>
                            <div className="aspect-[3/4] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group">
                                <Upload className="size-8 mb-3 group-hover:text-indigo-500 transition-colors" />
                                <span className="text-xs font-bold text-center px-4 group-hover:text-indigo-600">Click to upload cover image</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6 w-full">
                            <div className="space-y-3">
                                <Label htmlFor="title" className="text-slate-700 font-bold text-base">Book Title <span className="text-rose-500">*</span></Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. The Great Gatsby"
                                    className="h-14 text-lg rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 shadow-sm"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="author" className="text-slate-700 font-bold text-base">Author <span className="text-rose-500">*</span></Label>
                                <Input
                                    id="author"
                                    placeholder="e.g. F. Scott Fitzgerald"
                                    className="h-14 text-lg rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 shadow-sm"
                                    value={formData.author}
                                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label htmlFor="category" className="text-slate-700 font-bold text-base">Category <span className="text-rose-500">*</span></Label>
                            <Select value={formData.category} onValueChange={val => setFormData({ ...formData, category: val })}>
                                <SelectTrigger className="h-14 text-base rounded-xl border-slate-200 focus:ring-indigo-500/20 shadow-sm">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    {["Fiction", "Science", "Biography", "Self-Help", "Productivity", "Mystery", "Technology"].map(cat => (
                                        <SelectItem key={cat} value={cat} className="text-base py-3">{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="isbn" className="text-slate-700 font-bold text-base">ISBN</Label>
                            <Input
                                id="isbn"
                                placeholder="e.g. 978-0743273565"
                                className="h-14 text-base rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 shadow-sm"
                                value={formData.isbn}
                                onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="stock" className="text-slate-700 font-bold text-base">Initial Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                className="h-14 text-base rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 shadow-sm"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="description" className="text-slate-700 font-bold text-base">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief summary of the book..."
                            className="text-base rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 resize-none h-32 shadow-sm"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4 items-center">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate("/admin/books")} 
                        className="w-full sm:w-auto h-14 rounded-xl font-bold text-slate-600 text-base px-8"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSaveBook} 
                        className="w-full sm:w-auto h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base px-10 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                    >
                        Add Book to Catalog
                    </Button>
                </div>
            </div>
        </div>
    )
}
