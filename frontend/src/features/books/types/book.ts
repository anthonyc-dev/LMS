export interface Book {
  id: string;
  title: string;
  description: string;
  author?: string;
  isbn: string;
  publisher?: string;
  publishedDate?: string; // Date strings from API
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  bookCopies?: {
    shelf?: {
      id: string;
      name: string;
    };
  }[];
  pages?: number;
  language?: string;
  coverImage?: string;
  edition?: string;
  availableCopies?: number;
  availabilityLabel?: string;
  status?: string;
  locations?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PaginatedBooks {
  data: Book[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetBooksParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateBookDto {
  title: string;
  description: string;
  isbn: string;
  categoryId: string;
  author?: string;
  publisher?: string;
  publishedDate?: string;
  pages?: number;
  edition?: string;
  language?: string;
  coverImage?: File; // For multipart upload
}

export type UpdateBookDto = Partial<CreateBookDto>;
