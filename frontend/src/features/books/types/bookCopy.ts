import type { Book } from "./book";

export type BookCopyStatus =
  | "AVAILABLE"
  | "BORROWED"
  | "RESERVED"
  | "LOST"
  | "DAMAGED"
  | "MAINTENANCE";

export type BookCondition = "NEW" | "GOOD" | "FAIR" | "POOR" | "DAMAGED";

export interface BookCopy {
  id: string;
  barcode: string;
  status: BookCopyStatus;
  condition: BookCondition;
  notes?: string;
  acquiredAt?: string;
  purchasePrice?: number;
  bookId: string;
  book?: Book;
  location?: {
    shelfId: string | null;
    shelfName: string | null;
    sectionId: string | null;
    sectionName: string | null;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
