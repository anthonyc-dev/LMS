import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen, Clock, AlertCircle } from "lucide-react"

export function MyBooksPage() {
  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Books</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Reading</CardTitle>
            <BookOpen className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 Books</div>
            <p className="text-xs opacity-70 mt-1">1 due in 2 days</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reservations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 Pending</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for pickup tomorrow</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">0</div>
            <p className="text-xs text-muted-foreground mt-1">Great job!</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>My Borrowed Items</CardTitle>
          <CardDescription>A list of books you currently have or have previously borrowed.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center p-4 rounded-xl bg-white/50 border border-white/20 transition-all hover:bg-white/80">
                <div className="h-16 w-12 rounded bg-muted mr-4" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">Effective TypeScript</h4>
                  <p className="text-xs text-muted-foreground">Borrowed on April 12, 2026</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Due May 12</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
