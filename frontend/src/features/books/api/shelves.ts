import api from "@/shared/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ShelfSectionResponse {
  id: string;
  name: string;
  bookCopies?: { id: string }[];
}

export interface ShelfResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  floor: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sections: ShelfSectionResponse[];
}

export interface CreateShelfPayload {
  code: string;
  name: string;
  description?: string;
  floor: string;
  sections?: { name: string }[];
}

export interface UpdateShelfPayload extends Partial<CreateShelfPayload> {
  id: string;
  sections?: { id?: string; name: string }[];
}

async function fetchShelves(): Promise<ShelfResponse[]> {
  const response = await api.get("/shelves");
  return response.data;
}

async function createShelf(data: CreateShelfPayload): Promise<ShelfResponse> {
  const response = await api.post("/shelves", data);
  return response.data;
}

async function updateShelf(data: UpdateShelfPayload): Promise<ShelfResponse> {
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
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useUpdateShelf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateShelf,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shelves"] });
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useDeleteShelf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteShelf,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shelves"] });
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
