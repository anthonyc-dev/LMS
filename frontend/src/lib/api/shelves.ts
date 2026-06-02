import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface BookCopy {
  id: string;
  barcode: string;
  status: string;
  condition: string;
  notes?: string;
  acquiredAt?: string;
  purchasePrice?: string;
  bookId: string;
  shelfId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Shelf {
  id: string;
  code: string;
  name: string;
  description: string | null;
  floor: string | null;
  section: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  bookCopies: BookCopy[];
}

export interface CreateShelfPayload {
  code: string;
  name: string;
  description?: string;
  floor: string;
  section?: string;
}

export interface UpdateShelfPayload extends Partial<CreateShelfPayload> {
  id: string;
}

async function fetchShelves(): Promise<Shelf[]> {
  const response = await api.get("/shelves");
  return response.data;
}

async function createShelf(data: CreateShelfPayload): Promise<Shelf> {
  const response = await api.post("/shelves", data);
  return response.data;
}

async function updateShelf(data: UpdateShelfPayload): Promise<Shelf> {
  const { id, ...payload } = data;
  const response = await api.put(`/shelves/${id}`, payload);
  return response.data;
}

async function deleteShelf(id: string): Promise<void> {
  await api.delete(`/shelves/${id}`);
}

export function useShelves() {
  return useQuery({
    queryKey: ["shelves"],
    queryFn: fetchShelves,
  });
}

export function useCreateShelf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createShelf,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shelves"] });
    },
  });
}

export function useUpdateShelf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateShelf,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shelves"] });
    },
  });
}

export function useDeleteShelf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteShelf,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shelves"] });
    },
  });
}
