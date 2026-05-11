import { Plus, Calendar, BookOpen, User, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Asset imports
import bannerImg from "@/assets/dashboard/banner.png"
import book1Img from "@/assets/dashboard/book1.png"
import book2Img from "@/assets/dashboard/book2.png"
import author1Img from "@/assets/dashboard/author1.png"
import { Separator } from "@/components/ui/separator"

const ON_LOAN_BOOKS = [
  { id: 1, title: "A Promised Land", author: "Barack Obama", due: "02/02/22", image: book1Img, color: "bg-gray-100" },
  { id: 2, title: "Write Who You Are", author: "April Hartman", due: "12/02/22", image: book2Img, color: "bg-red-500" },
  { id: 3, title: "Wuthering Heights", author: "Emily Brontë", due: "22/02/22", image: book2Img, color: "bg-slate-700" },
  { id: 4, title: "A God In Ruins", author: "Kate Atkinson", due: "22/02/22", image: book1Img, color: "bg-red-400" },
  { id: 5, title: "What Echo Heard", author: "Gordon Sombrowski", due: "22/02/22", image: book2Img, color: "bg-blue-100" },
  { id: 6, title: "The Bone Clocks", author: "Gillian Flynn", due: "22/02/22", image: book1Img, color: "bg-indigo-900" },
]

const RESERVED_BOOKS = [
  { title: "The Secret Lives of Colours", author: "David Bergen", due: "22/02/22", image: book1Img },
  { title: "Here the Dark", author: "David Bergen", due: "22/02/22", image: book2Img },
  { title: "Klara and the Sun", author: "Gillian Flynn", due: "22/02/22", image: book1Img },
]

const FAVORITE_AUTHORS = [
  { name: "Emily Brontë", period: "1818 - 1848", image: author1Img },
  { name: "Alice Walker", period: "1944 - present", image: author1Img, badge: "NEW RELEASE" },
  { name: "Chinua Achebe", period: "1930 - 2013", image: author1Img },
]

const POPULAR_READS = [
  { title: "A Passage North", author: "Anuk Arudpragasam", image: book2Img },
  { title: "The Sweetness of Water", author: "Nathan Harris", image: book1Img },
]

export function BorrowBooksPage() {
  return (
    <>
      {/* Banner Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#E2E2F8] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between transition-all hover:shadow-2xl hover:shadow-indigo-100">
        <div className="max-w-2xl space-y-8 z-10 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            Black History Month
          </h1>
          <p className="text-slate-600 text-xl leading-relaxed max-w-lg">
            From firebrand fiction to cultural history, and from seminal lives to inspiring volumes for children, we're celebrating classic works and contemporary triumphs from the best black authors and commentators.
          </p>
          <Button className="rounded-full bg-[#FF7A59] hover:bg-[#FF6B49] text-white px-10 py-7 text-xl font-bold shadow-2xl shadow-orange-200 transition-all hover:-translate-y-1 hover:scale-105 active:scale-95">
            Find out more
          </Button>
        </div>
        <div className="mt-12 md:mt-0 relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden">
          <img
            src={bannerImg}
            alt="Banner Illustration"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-200/30 rounded-full blur-2xl" />
      </section>

      {/* On Loan Section */}
      <section className="space-y-8 p-4 py-8 bg-white rounded-2xl my-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">On Loan</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
          {ON_LOAN_BOOKS.map((book) => (
            <div key={book.id} className="group cursor-pointer space-y-4">
              <div className={`relative aspect-[3/4.2] rounded-2xl overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-3 ${book.color}`}>
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-slate-900 truncate leading-tight">{book.title}</h3>
                <p className="text-sm text-slate-500 font-medium">{book.author}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Due</span>
                  <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">{book.due}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Borrow more books card */}
          <div className="group cursor-pointer flex flex-col items-center justify-center aspect-[3/4.2] rounded-2xl border-4 border-dashed border-slate-200 bg-white/40 transition-all duration-300 hover:border-slate-400 hover:bg-white hover:shadow-xl hover:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-slate-500 transition-all duration-300 group-hover:bg-slate-100 group-hover:rotate-90">
              <Plus size={32} />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-400 group-hover:text-slate-600 text-center px-6 leading-relaxed">
              Borrow more books
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Reserved Books */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-8 space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Reserved books</h2>
            <Separator />
            <div className="space-y-8">
              {RESERVED_BOOKS.map((book, i) => (
                <>
                  <div key={i} className="flex items-center gap-5 group cursor-pointer">
                    <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                      <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      <h3 className="font-bold text-base text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors truncate">
                        {book.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">{book.author}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Due</span>
                        <span className="text-[10px] font-black text-slate-400 tracking-widest">{book.due}</span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Favourite Authors */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-8 space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Favourite Authors</h2>
            <Separator />
            <div className="space-y-8">
              {FAVORITE_AUTHORS.map((author, i) => (
                <>
                  <div key={i} className="flex items-center gap-5 group cursor-pointer">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-3">
                      <img src={author.image} alt={author.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {author.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">{author.period}</p>
                    </div>
                    {author.badge && (
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none text-[10px] font-black py-1 px-3 rounded-full">
                        {author.badge}
                      </Badge>
                    )}
                  </div>
                  <Separator />
                </>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Reads */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-8 space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Popular reads</h2>
            <Separator />
            <div className="space-y-8">
              {POPULAR_READS.map((book, i) => (
                <>
                  <div key={i} className="flex items-center gap-5 group cursor-pointer">
                    <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                      <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      <h3 className="font-bold text-base text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors truncate">
                        {book.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">{book.author}</p>
                    </div>
                  </div>
                  <Separator />
                </>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

