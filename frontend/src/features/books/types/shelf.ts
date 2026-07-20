export interface ShelfSection {
  id?: string;
  name: string;
  bookCopies?: unknown[];
}

export interface Shelf {
  id: string;
  code: string;
  name: string;
  floor: string;
  description?: string;
  sections: ShelfSection[];
  notes: string;
  lastAudited: string;
}

export const FLOORS = ["Ground Floor", "First Floor", "Second Floor"];
