import api from "@/shared/lib/axios";
import type {
  Book,
  PaginatedBooks,
  GetBooksParams,
  CreateBookDto,
  UpdateBookDto,
} from "@/features/books/types/book";

export const booksApi = {
  getBooks: async (params?: GetBooksParams): Promise<PaginatedBooks> => {
    const response = await api.get("/books", { params });
    return response.data;
  },

  getBook: async (id: string): Promise<Book> => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  createBook: async (data: CreateBookDto): Promise<Book> => {
    if (data.coverImage && typeof data.coverImage === "object") {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== "coverImage") {
          formData.append(key, String(value));
        }
      });
      formData.append("coverImage", data.coverImage as Blob);

      const response = await api.post("/books", formData, {
        headers: { "Content-Type": undefined },
      });
      return response.data;
    }

    // Send as JSON if no file is provided
    const response = await api.post("/books", data);
    return response.data;
  },

  updateBook: async (id: string, data: UpdateBookDto): Promise<Book> => {
    if (data.coverImage && typeof data.coverImage === "object") {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== "coverImage") {
          formData.append(key, String(value));
        }
      });
      formData.append("coverImage", data.coverImage as Blob);

      const response = await api.put(`/books/${id}`, formData, {
        headers: { "Content-Type": undefined },
      });
      return response.data;
    }

    const response = await api.put(`/books/${id}`, data);
    return response.data;
  },

  deleteBook: async (id: string): Promise<void> => {
    await api.delete(`/books/${id}`);
  },
};
