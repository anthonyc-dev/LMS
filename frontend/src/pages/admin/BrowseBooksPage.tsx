import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function BrowseBooksPage() {
  return (
    <div className="flex-1 space-y-4  pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Browse Books</h2>
      </div>
      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search books by title, author, or ISBN..." className="pl-9 h-10" />
            </div>
            <Button variant="outline" className="h-10">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="group relative rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-4">
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <BookOpen size={48} className="opacity-20" />
                  </div>
                </div>
                <h3 className="font-semibold truncate">Sample Book Title {i}</h3>
                <p className="text-sm text-muted-foreground mb-4">Author Name</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Available</span>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
