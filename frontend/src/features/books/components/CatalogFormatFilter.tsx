import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { CatalogFormat } from "../types/book";
const labels: Record<CatalogFormat, string> = {
  all: "All formats",
  physical: "Physical books",
  ebook: "eBooks",
  both: "Physical + eBook",
};
export function CatalogFormatFilter({
  value,
  onChange,
}: {
  value: CatalogFormat;
  onChange: (value: CatalogFormat) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => next && onChange(next as CatalogFormat)}
    >
      <SelectTrigger className="w-44" aria-label="Book format">
        <SelectValue>{labels[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All formats</SelectItem>
        <SelectItem value="physical">Physical books</SelectItem>
        <SelectItem value="ebook">eBooks</SelectItem>
        <SelectItem value="both">Physical + eBook</SelectItem>
      </SelectContent>
    </Select>
  );
}
