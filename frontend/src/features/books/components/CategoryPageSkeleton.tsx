import { Card, CardContent } from "@/shared/components/ui/card";
import { Tag, BookOpen, TrendingUp, BarChart3, Layers } from "lucide-react";

export function CategoryPageSkeleton() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[1600px] space-y-6 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          </div>
          <div className="mt-2 ml-1 h-4 w-96 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-11 w-40 animate-pulse rounded-xl bg-slate-200" />
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[Tag, BookOpen, TrendingUp, BarChart3].map((Icon, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="shrink-0 rounded-xl bg-slate-100 p-3 text-slate-300">
                <Icon className="size-5" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-6 w-12 animate-pulse rounded bg-slate-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Category Grid + Chart ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grid list — 2/3 */}
        <div className="space-y-4 lg:col-span-2">
          {/* Search bar */}
          <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200" />

          {/* Category cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                <div className="h-1.5 w-full animate-pulse bg-slate-200" />
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution chart — 1/3 */}
        <Card className="h-fit shadow-xs">
          <div className="border-b border-slate-50 p-6 pb-4">
            <div className="flex items-center gap-2 text-base font-black text-slate-800">
              <Layers className="size-4 text-slate-300" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
          <CardContent className="flex flex-col items-center pt-8">
            <div className="h-40 w-40 animate-pulse rounded-full border-8 border-slate-100 bg-white" />

            <div className="mt-8 w-full space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-3 w-8 animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
