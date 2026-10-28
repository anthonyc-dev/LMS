import { Button } from "@/shared/components/ui/button";
import { PaginationEllipsis } from "@/shared/components/ui/pagination";
import { getPaginationPages } from "@/shared/utils/pagination";

interface TablePageNumbersProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePageNumbers({
  page,
  totalPages,
  onPageChange,
}: TablePageNumbersProps) {
  const renderPages = (siblings: 0 | 1) =>
    getPaginationPages(page, totalPages, siblings).map((item) =>
      typeof item === "number" ? (
        <Button
          key={item}
          type="button"
          variant={item === page ? "default" : "outline"}
          size="icon-sm"
          aria-label={`Go to page ${item}`}
          aria-current={item === page ? "page" : undefined}
          className="w-auto min-w-8 shrink-0 rounded-lg px-1.5 text-xs font-bold tabular-nums"
          onClick={() => onPageChange(item)}
        >
          {item}
        </Button>
      ) : (
        <PaginationEllipsis
          key={item}
          className="text-muted-foreground size-5 shrink-0"
        />
      ),
    );

  return (
    <>
      <div className="flex items-center gap-1 sm:hidden">{renderPages(0)}</div>
      <div className="hidden items-center gap-1 sm:flex">{renderPages(1)}</div>
    </>
  );
}
