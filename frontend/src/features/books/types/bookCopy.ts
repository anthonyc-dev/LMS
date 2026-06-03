import type { Book } from "./book";
import type { Shelf } from "./shelf";

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
  shelfId?: string;
  shelf?: Shelf;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
