import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { booksApi } from "@/features/books/api/books";
import type {
  GetBooksParams,
  CreateBookDto,
  UpdateBookDto,
  Book,
  PaginatedBooks,
} from "@/features/books/types/book";

export const BOOKS_QUERY_KEYS = {
  all: ["books"] as const,
  lists: () => [...BOOKS_QUERY_KEYS.all, "list"] as const,
  list: (params: GetBooksParams) =>
    [...BOOKS_QUERY_KEYS.lists(), params] as const,
  details: () => [...BOOKS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...BOOKS_QUERY_KEYS.details(), id] as const,
};

export const useBooks = (params: GetBooksParams) => {
  return useQuery({
    queryKey: BOOKS_QUERY_KEYS.list(params),
    queryFn: () => booksApi.getBooks(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useBook = (id: string) => {
  return useQuery({
    queryKey: BOOKS_QUERY_KEYS.detail(id),
    queryFn: () => booksApi.getBook(id),
    enabled: !!id,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookDto) => booksApi.createBook(data),
    onMutate: async (newBookData) => {
      await queryClient.cancelQueries({ queryKey: BOOKS_QUERY_KEYS.lists() });

      const tempId = crypto.randomUUID();
      const optimisticBook: Book = {
        id: tempId,
        title: newBookData.title,
        description: newBookData.description,
        isbn: newBookData.isbn,
        categoryId: newBookData.categoryId,
        author: newBookData.author || "",
        publisher: newBookData.publisher || "",
        pages: newBookData.pages || 0,
        language: newBookData.language || "",
        edition: newBookData.edition || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueriesData<PaginatedBooks>(
        { queryKey: BOOKS_QUERY_KEYS.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: [optimisticBook, ...oldData.data],
            total: oldData.total ? oldData.total + 1 : 1,
          };
        },
      );

      return { tempId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEYS.lists() });
    },
    onError: (_err, _newBook, _context) => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEYS.lists() });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookDto }) =>
      booksApi.updateBook(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: BOOKS_QUERY_KEYS.detail(id),
      });
      await queryClient.cancelQueries({ queryKey: BOOKS_QUERY_KEYS.lists() });

      const previousBook = queryClient.getQueryData<Book>(
        BOOKS_QUERY_KEYS.detail(id),
      );

      const { coverImage, ...updateData } = data;

      if (previousBook) {
        queryClient.setQueryData<Book>(BOOKS_QUERY_KEYS.detail(id), {
          ...previousBook,
          ...updateData,
        });
      }

      queryClient.setQueriesData<PaginatedBooks>(
        { queryKey: BOOKS_QUERY_KEYS.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((book) =>
              book.id === id ? { ...book, ...updateData } : book,
            ),
          };
        },
      );

      return { previousBook };
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEYS.lists() });
    },
    onError: (_err, newBook, context) => {
      if (context?.previousBook) {
        queryClient.setQueryData(
          BOOKS_QUERY_KEYS.detail(newBook.id),
          context.previousBook,
        );
      }
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEYS.lists() });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => booksApi.deleteBook(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: BOOKS_QUERY_KEYS.lists() });

      queryClient.setQueriesData<PaginatedBooks>(
        { queryKey: BOOKS_QUERY_KEYS.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.filter((book) => book.id !== deletedId),
            total: Math.max(0, (oldData.total || 1) - 1),
          };
        },
      );

      return { deletedId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEYS.lists() });
    },
    onError: (_err, _deletedId, _context) => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEYS.lists() });
    },
  });
};
