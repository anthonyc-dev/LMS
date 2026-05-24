import { useState } from "react"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Filter, Upload, BookOpen, Star, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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

// Asset imports
import book1Img from "@/assets/dashboard/book1.png"
import book2Img from "@/assets/dashboard/book2.png"
import bookDark1Img from "@/assets/dashboard/book_dark1.png"

interface Book {
    id: string
    title: string
    author: string
    category: string
    isbn: string
    stock: number
    status: string
    coverImage?: string
    rating?: number
}

// Dummy data for design purposes
const INITIAL_BOOKS: Book[] = [
    { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", isbn: "978-0743273565", stock: 12, status: "Available", coverImage: book1Img, rating: 4.8 },
    { id: "2", title: "Brief History of Time", author: "Stephen Hawking", category: "Science", isbn: "978-0553380163", stock: 5, status: "Low Stock", coverImage: bookDark1Img, rating: 4.9 },
    { id: "3", title: "A Promised Land", author: "Barack Obama", category: "Biography", isbn: "978-1524763169", stock: 0, status: "Out of Stock", coverImage: book2Img, rating: 4.7 },
    { id: "4", title: "Atomic Habits", author: "James Clear", category: "Self-Help", isbn: "978-0735211292", stock: 45, status: "Available", coverImage: book1Img, rating: 5.0 },
    { id: "5", title: "Deep Work", author: "Cal Newport", category: "Productivity", isbn: "978-1455586691", stock: 8, status: "Available", coverImage: bookDark1Img, rating: 4.6 },
]

export function BooksPage() {
    const navigate = useNavigate()
    const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedBook, setSelectedBook] = useState<Book | null>(null)

    // Form states for new book
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        category: "",
        isbn: "",
        stock: "1",
        description: "",
        status: "Available"
    })

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.includes(searchQuery)
    )

    const handleOpenAddModal = () => {
        navigate("/admin/books/add")
    }

    const handleOpenEditModal = (book: Book) => {
        setFormData({
            title: book.title,
            author: book.author,
            category: book.category,
            isbn: book.isbn,
            stock: book.stock.toString(),
            description: "",
            status: book.status
        })
        setSelectedBook(book)
        setIsAddBookModalOpen(true)
    }

    const handleSaveBook = () => {
        if (!formData.title || !formData.author || !formData.category) {
            toast.error("Please fill in all required fields")
            return
        }

        if (selectedBook) {
            setBooks(books.map(b => b.id === selectedBook.id ? {
                ...b,
                ...formData,
                stock: parseInt(formData.stock),
                status: parseInt(formData.stock) === 0 ? "Out of Stock" : parseInt(formData.stock) < 10 ? "Low Stock" : "Available"
            } : b))
            toast.success("Book updated successfully")
        } else {
            const newBook: Book = {
                id: Math.random().toString(36).substr(2, 9),
                title: formData.title,
                author: formData.author,
                category: formData.category,
                isbn: formData.isbn || `ISBN-${Math.floor(Math.random() * 1000000)}`,
                stock: parseInt(formData.stock),
                status: parseInt(formData.stock) === 0 ? "Out of Stock" : parseInt(formData.stock) < 10 ? "Low Stock" : "Available",
                rating: 0
            }
            setBooks([newBook, ...books])
            toast.success("Book created successfully")
        }
        setIsAddBookModalOpen(false)
    }

    const handleDeleteBook = () => {
        if (selectedBook) {
            setBooks(books.filter(b => b.id !== selectedBook.id))
            toast.success("Book deleted successfully")
            setIsDeleteDialogOpen(false)
        }
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "Available": return "bg-emerald-100 text-emerald-800 border-emerald-200"
            case "Low Stock": return "bg-amber-100 text-amber-800 border-amber-200"
            case "Out of Stock": return "bg-rose-100 text-rose-800 border-rose-200"
            default: return "bg-slate-100 text-slate-800 border-slate-200"
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <BookOpen className="text-indigo-600 size-8" />
                        Book Management
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Add, edit, and manage your library's catalog</p>
                </div>
                <Button
                    onClick={handleOpenAddModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 rounded-xl px-6 h-12 font-bold transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="mr-2 size-5" /> Add New Book
                </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                        <BookOpen className="size-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Books</p>
                        <h3 className="text-2xl font-black text-slate-900">{books.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Search className="size-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Available</p>
                        <h3 className="text-2xl font-black text-slate-900">{books.filter(b => b.status === "Available").length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
                        <AlertCircle className="size-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Low Stock</p>
                        <h3 className="text-2xl font-black text-slate-900">{books.filter(b => b.status === "Low Stock").length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl">
                        <Filter className="size-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Categories</p>
                        <h3 className="text-2xl font-black text-slate-900">{new Set(books.map(b => b.category)).size}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-5">
                {/* Toolbar */}
                <div className="py-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Search by title, author, or ISBN..."
                            className="pl-11 h-12 rounded-xl border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="outline" className="h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 flex-1 sm:flex-none">
                            <Filter className="mr-2 size-4" /> Filter
                        </Button>
                        <Button variant="outline" className="h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 flex-1 sm:flex-none hidden sm:flex">
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[300px] py-5 font-bold text-slate-500">Book Info</TableHead>
                                <TableHead className="py-5 font-bold text-slate-500">Category</TableHead>
                                <TableHead className="py-5 font-bold text-slate-500">Stock</TableHead>
                                <TableHead className="py-5 font-bold text-slate-500">Status</TableHead>
                                <TableHead className="py-5 font-bold text-slate-500">Rating</TableHead>
                                <TableHead className="text-right py-5 font-bold text-slate-500">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBooks.map((book) => (
                                <TableRow key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 shadow-sm border border-slate-200/50 relative group-hover:shadow-md transition-all">
                                                {book.coverImage ? (
                                                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <BookOpen size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-slate-900 text-sm md:text-base truncate">{book.title}</span>
                                                <span className="text-sm font-medium text-slate-500 truncate">{book.author}</span>
                                                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{book.isbn}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold border-none">
                                            {book.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-black text-slate-700">{book.stock}</span>
                                        <span className="text-slate-400 text-xs ml-1 font-medium">units</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`px-2.5 py-1 rounded-full border shadow-sm font-bold text-xs ${getStatusBadgeVariant(book.status)}`}>
                                            {book.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="size-4 fill-amber-400 text-amber-400" />
                                            <span className="font-bold text-slate-700">{book.rating?.toFixed(1) || "N/A"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                render={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                }
                                            />

                                            <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl p-2">
                                                <DropdownMenuItem onClick={() => handleOpenEditModal(book)} className="cursor-pointer rounded-lg font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 focus:bg-indigo-50 focus:text-indigo-600 py-2">
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                                <DropdownMenuItem
                                                    onClick={() => { setSelectedBook(book); setIsDeleteDialogOpen(true); }}
                                                    className="cursor-pointer rounded-lg font-medium text-rose-600 hover:bg-rose-50 focus:bg-rose-50 focus:text-rose-600 py-2"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Book
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredBooks.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <Search className="size-10 text-slate-300" />
                                            <p className="font-medium">No books found matching your search.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add / Edit Book Modal */}
            <Dialog open={isAddBookModalOpen} onOpenChange={setIsAddBookModalOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem]">
                    <div className="bg-indigo-600 p-6 sm:p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <BookOpen size={120} className="-rotate-12 translate-x-8 -translate-y-8" />
                        </div>
                        <DialogHeader className="relative z-10 space-y-2">
                            <DialogTitle className="text-2xl font-black text-white">
                                {selectedBook ? "Edit Book Details" : "Add New Book"}
                            </DialogTitle>
                            <DialogDescription className="text-indigo-100 font-medium">
                                {selectedBook ? "Update the information for this book in your catalog." : "Enter the details of the new book to add it to your catalog."}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6 bg-white">
                        <div className="flex items-start gap-6">
                            <div className="w-32 shrink-0 space-y-2">
                                <div className="aspect-[3/4] bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group">
                                    <Upload className="size-6 mb-2 group-hover:text-indigo-500 transition-colors" />
                                    <span className="text-[10px] font-bold text-center px-2 group-hover:text-indigo-600">Upload Cover</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-slate-700 font-bold">Book Title <span className="text-rose-500">*</span></Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. The Great Gatsby"
                                        className="rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="author" className="text-slate-700 font-bold">Author <span className="text-rose-500">*</span></Label>
                                    <Input
                                        id="author"
                                        placeholder="e.g. F. Scott Fitzgerald"
                                        className="rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                                        value={formData.author}
                                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-slate-700 font-bold">Category <span className="text-rose-500">*</span></Label>
                                <Select value={formData.category} onValueChange={val => setFormData({ ...formData, category: val })}>
                                    <SelectTrigger className="rounded-xl border-slate-200 focus:ring-indigo-500/20">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        {["Fiction", "Science", "Biography", "Self-Help", "Productivity", "Mystery", "Technology"].map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="isbn" className="text-slate-700 font-bold">ISBN</Label>
                                <Input
                                    id="isbn"
                                    placeholder="e.g. 978-0743273565"
                                    className="rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                                    value={formData.isbn}
                                    onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock" className="text-slate-700 font-bold">Initial Stock</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    className="rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-700 font-bold">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief summary of the book..."
                                className="rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 resize-none h-24"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsAddBookModalOpen(false)} className="rounded-xl font-bold text-slate-600">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveBook} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-md shadow-indigo-200">
                            {selectedBook ? "Save Changes" : "Add Book"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-2">
                            <AlertCircle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900">Delete Book?</h3>
                            <p className="text-slate-500 font-medium">
                                Are you sure you want to delete <span className="font-bold text-slate-700">"{selectedBook?.title}"</span>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-center gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl font-bold flex-1 h-12">
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteBook} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex-1 h-12 shadow-md shadow-rose-200">
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
