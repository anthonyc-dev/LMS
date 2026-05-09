import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Book, Calendar } from "lucide-react"

export function BorrowBooksPage() {
  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Borrow Books</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Issue New Book</CardTitle>
            <CardDescription>Fill in the details to issue a book to a user.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">User ID / Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Enter user identification..." className="pl-9 h-10" />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">Book ISBN / Title</label>
                <div className="relative">
                  <Book className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Enter book identification..." className="pl-9 h-10" />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">Return Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-9 h-10" />
                </div>
              </div>
            </div>
            <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-200">
              Complete Issuance
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Borrowers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe {i}</p>
                    <p className="text-xs text-muted-foreground">Borrowed "Modern Web Design"</p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">Just now</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
