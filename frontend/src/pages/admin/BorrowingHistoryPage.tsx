import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function BorrowingHistoryPage() {
  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Borrowing History</h2>
      </div>
      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>History Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Borrow Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="group transition-colors hover:bg-white/5">
                  <TableCell className="font-medium">User {i}</TableCell>
                  <TableCell>The Great Gatsby</TableCell>
                  <TableCell>May 01, 2026</TableCell>
                  <TableCell>May 15, 2026</TableCell>
                  <TableCell>
                    <Badge variant={i % 2 === 0 ? "default" : "secondary"} className={i % 2 === 0 ? "bg-green-100 text-green-700 hover:bg-green-200 border-none" : "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none"}>
                      {i % 2 === 0 ? "Returned" : "On Loan"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
