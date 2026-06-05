import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Download, Printer, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { type BookCopy } from "@/features/books/types/bookCopy";
import { useBookCopyBarcode } from "@/features/books/api/bookCopies";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

function SingleBarcodeDisplay({ copy }: { copy: BookCopy }) {
  const [barcodeSrc, setBarcodeSrc] = useState<string>("");
  const { data: barcodeBlob, isLoading } = useBookCopyBarcode(copy.id);

  useEffect(() => {
    if (!barcodeBlob) {
      setBarcodeSrc("");
      return;
    }
    const objectUrl = window.URL.createObjectURL(barcodeBlob);
    setBarcodeSrc(objectUrl);
    return () => window.URL.revokeObjectURL(objectUrl);
  }, [barcodeBlob]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3">
      <span className="mb-2 text-xs font-bold text-slate-700">
        {copy.barcode}
      </span>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      ) : barcodeSrc ? (
        <img
          src={barcodeSrc}
          alt={`Barcode ${copy.barcode}`}
          className="h-12 w-auto"
        />
      ) : (
        <span className="text-xs text-slate-500">Failed to load</span>
      )}
    </div>
  );
}

export interface ViewMultipleBarcodesModalProps {
  open: boolean;
  bookCopies: BookCopy[];
  onClose: () => void;
}

export function ViewMultipleBarcodesModal({
  open,
  bookCopies,
  onClose,
}: ViewMultipleBarcodesModalProps) {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBarcodeAsDataUrl = async (copyId: string): Promise<string> => {
    const blob = await queryClient.fetchQuery({
      queryKey: ["book-copy-barcode", copyId],
      queryFn: () =>
        api
          .get(`/book-copies/${copyId}/barcode`, { responseType: "blob" })
          .then((res) => res.data as Blob),
    });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const handleDownload = async () => {
    if (!bookCopies.length) return;
    setIsProcessing(true);
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [80, 40],
      });

      for (let i = 0; i < bookCopies.length; i++) {
        const copy = bookCopies[i];
        if (i > 0) doc.addPage([80, 40], "landscape");

        const dataUrl = await fetchBarcodeAsDataUrl(copy.id);

        const title = copy.book?.title || "Unknown Book";
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");

        const titleWidth = doc.getTextWidth(title);
        const xPos = Math.max((80 - titleWidth) / 2, 2);
        const truncatedTitle =
          title.length > 40 ? title.substring(0, 37) + "..." : title;
        doc.text(truncatedTitle, xPos, 8);

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => {
          img.onload = () => {
            doc.addImage(img, "PNG", 10, 12, 60, 20);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text("LMS Library System", 40, 36, { align: "center" });
            resolve(null);
          };
        });
      }
      doc.save(`barcodes-batch-${Date.now()}.pdf`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = async () => {
    if (!bookCopies.length) return;
    setIsProcessing(true);
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcodes</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 0;
              }
              .page {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                page-break-after: always;
              }
              .page:last-child {
                page-break-after: auto;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              .barcode-label {
                margin-top: 10px;
                font-family: sans-serif;
                font-size: 14px;
                font-weight: bold;
              }
              @media print {
                @page { size: auto; margin: 0mm; }
                body { margin: 1cm; }
              }
            </style>
          </head>
          <body>
      `);

      for (const copy of bookCopies) {
        const dataUrl = await fetchBarcodeAsDataUrl(copy.id);
        const title = copy.book?.title || "Unknown Book";
        printWindow.document.write(`
            <div class="page">
                <div class="barcode-label">${title} (${copy.barcode})</div>
                <img src="${dataUrl}" />
            </div>
        `);
      }

      printWindow.document.write(`
          <script>
              window.onload = function() {
                  setTimeout(function() {
                      window.print();
                      window.close();
                  }, 500);
              }
          </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden rounded-2xl sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Newly Created Barcodes</DialogTitle>
          <DialogDescription>
            {bookCopies.length} barcodes were successfully generated.
          </DialogDescription>
        </DialogHeader>

        <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto py-4 sm:grid-cols-3 md:grid-cols-4">
          {bookCopies.map((copy) => (
            <SingleBarcodeDisplay key={copy.id} copy={copy} />
          ))}
        </div>

        <div className="flex w-full shrink-0 gap-4 border-t pt-4">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={handlePrint}
            disabled={isProcessing || !bookCopies.length}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Printer className="mr-2 size-4" />
            )}
            Print All
          </Button>
          <Button
            className="flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            onClick={handleDownload}
            disabled={isProcessing || !bookCopies.length}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
