import { useQuery } from "@tanstack/react-query";
import { booksApi } from "../api/books";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

export function EbookReader({
  bookId,
  title,
  onClose,
}: {
  bookId: string;
  title: string;
  onClose: () => void;
}) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["ebook-reader", bookId],
    queryFn: () => booksApi.readEbook(bookId),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  });
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[95vh] flex-col sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Read the eBook PDF. Refresh the link if it expires.
          </DialogDescription>
        </DialogHeader>
        {isPending && <p role="status">Loading PDF…</p>}
        {isError && (
          <div role="alert">
            <p>Unable to load PDF.</p>
            <Button onClick={() => refetch()}>Try again</Button>
          </div>
        )}
        {data && (
          <>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <a
                className="text-blue-700 underline"
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open PDF in new tab
              </a>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh reading link
              </Button>
            </div>
            <iframe
              className="h-[70vh] w-full rounded-md border"
              src={data.url}
              title={title + " PDF reader"}
              referrerPolicy="no-referrer"
            />
            <p className="text-sm text-slate-500">
              PDF not displayed? Use “Open PDF in new tab”.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
