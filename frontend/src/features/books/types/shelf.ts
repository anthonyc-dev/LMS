export type ShelfStatus = "active" | "maintenance" | "full";

export interface Shelf {
  id: string;
  code: string; // e.g. "A-01"
  name: string; // e.g. "Fiction — Row 1"
  floor: string; // e.g. "Ground Floor"
  section: string; // e.g. "Section A"
  category: string; // category it houses
  capacity: number;
  occupied: number;
  status: ShelfStatus;
  notes: string;
  lastAudited: string;
}

export const FLOORS = ["Ground Floor", "First Floor", "Second Floor"];
export const SECTIONS = ["Section A", "Section B", "Section C", "Section D"];
export const CATS = [
  "Fiction",
  "Science",
  "Technology",
  "Biography",
  "Self-Help",
  "History",
  "Philosophy",
  "Mystery",
];
