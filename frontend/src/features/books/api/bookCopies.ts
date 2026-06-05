import api from "@/shared/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { BookCopy } from "../types/bookCopy";

export interface CreateBookCopyPayload {
  status: string;
  condition: string;
  notes?: string;
  acquiredAt?: string;
  purchasePrice?: number;
  bookId: string;
  shelfId?: string;
}

export interface UpdateBookCopyPayload extends Partial<CreateBookCopyPayload> {
  id: string;
}

async function fetchBookCopies(search?: string): Promise<BookCopy[]> {
  const response = await api.get("/book-copies", { params: { search } });
  return response.data;
}

async function createBookCopy(data: CreateBookCopyPayload): Promise<BookCopy> {
  const response = await api.post("/book-copies", data);
  return response.data;
}

async function updateBookCopy(data: UpdateBookCopyPayload): Promise<BookCopy> {
  const { id, ...payload } = data;
  const response = await api.put(`/book-copies/${id}`, payload);
  return response.data;
}

async function deleteBookCopy(id: string): Promise<void> {
  await api.delete(`/book-copies/${id}`);
}

export function useBookCopies(search?: string) {
  return useQuery({
    queryKey: ["book-copies", search],
    queryFn: () => fetchBookCopies(search),
  });
}

export interface BulkCreateBookCopyPayload extends CreateBookCopyPayload {
  count: number;
}

async function bulkCreateBookCopy(
  data: BulkCreateBookCopyPayload,
): Promise<BookCopy[]> {
  const response = await api.post("/book-copies/bulk", data);
  return response.data;
}

export function useBulkCreateBookCopy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bulkCreateBookCopy,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["book-copies"] });
    },
  });
}

export function useCreateBookCopy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBookCopy,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["book-copies"] });
    },
  });
}

export function useUpdateBookCopy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateBookCopy,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["book-copies"] });
    },
  });
}

export function useDeleteBookCopy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBookCopy,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["book-copies"] });
    },
  });
}

async function fetchBookCopyBarcode(id: string): Promise<Blob> {
  const response = await api.get(`/book-copies/${id}/barcode`, {
    responseType: "blob",
  });
  return response.data;
}

export function useBookCopyBarcode(id?: string) {
  return useQuery({
    queryKey: ["book-copy-barcode", id],
    queryFn: () => fetchBookCopyBarcode(id!),
    enabled: !!id,
    staleTime: Infinity,
  });
}
