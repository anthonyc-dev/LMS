import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export function TableSkeleton({
  columns = 5,
  rows = 5,
  withHeader = true,
}: {
  columns?: number;
  rows?: number;
  withHeader?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {withHeader && (
        <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <div className="flex w-full gap-3 sm:w-auto">
            <Skeleton className="h-10 w-full rounded-xl sm:w-80" />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-slate-100 bg-slate-50">
            <TableRow className="hover:bg-transparent">
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i} className="py-4">
                  <Skeleton className="h-4 w-24 rounded" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columns }).map((_, j) => (
                  <TableCell key={j} className="py-4">
                    <Skeleton className="h-5 w-full max-w-[200px] rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
