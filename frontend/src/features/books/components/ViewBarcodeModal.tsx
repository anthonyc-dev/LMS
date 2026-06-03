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

export interface ViewBarcodeModalProps {
  open: boolean;
  bookCopy: BookCopy | null;
  onClose: () => void;
}

export function ViewBarcodeModal({
  open,
  bookCopy,
  onClose,
}: ViewBarcodeModalProps) {
  const [barcodeSrc, setBarcodeSrc] = useState<string>("");
  const { data: barcodeBlob, isLoading: loading } = useBookCopyBarcode(open && bookCopy ? bookCopy.id : undefined);

  useEffect(() => {
    if (!open || !bookCopy || !barcodeBlob) {
      setBarcodeSrc("");
      return;
    }

    const objectUrl = window.URL.createObjectURL(barcodeBlob);
    setBarcodeSrc(objectUrl);

    return () => {
      window.URL.revokeObjectURL(objectUrl);
    };
  }, [open, bookCopy, barcodeBlob]);

  if (!bookCopy) return null;

  const handleDownload = () => {
    if (!barcodeSrc || !bookCopy) return;
    
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [80, 40], // Standard label size
    });

    const title = bookCopy.book?.title || "Unknown Book";
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    // Attempt to center title
    const titleWidth = doc.getTextWidth(title);
    const xPos = Math.max((80 - titleWidth) / 2, 2);
    
    // Add text slightly truncated if too long
    const truncatedTitle = title.length > 40 ? title.substring(0, 37) + "..." : title;
    doc.text(truncatedTitle, xPos, 8);

    const img = new Image();
    img.src = barcodeSrc;
    img.onload = () => {
      // Put image centered
      // Image is 60x15 typically for Code128 in bwip-js
      doc.addImage(img, "PNG", 10, 12, 60, 20);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("LMS Library System", 40, 36, { align: "center" });

      doc.save(`barcode-${bookCopy.barcode}.pdf`);
    };
  };

  const handlePrint = () => {
    if (!barcodeSrc) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode - ${bookCopy.barcode}</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            @media print {
              @page { size: auto; margin: 0mm; }
              body { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <img src="${barcodeSrc}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>View Barcode</DialogTitle>
          <DialogDescription>
            Barcode for {bookCopy.book?.title || "Unknown Book"} ({bookCopy.barcode})
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="flex min-h-[96px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm w-full">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : barcodeSrc ? (
              <img src={barcodeSrc} alt={`Barcode ${bookCopy.barcode}`} className="h-24 w-auto" />
            ) : (
              <span className="text-sm text-slate-500">Failed to load barcode</span>
            )}
          </div>
          
          <div className="flex gap-4 w-full">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={handlePrint}
              disabled={loading || !barcodeSrc}
            >
              <Printer className="mr-2 size-4" /> Print
            </Button>
            <Button
              className="flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              onClick={handleDownload}
              disabled={loading || !barcodeSrc}
            >
              <Download className="mr-2 size-4" /> Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
