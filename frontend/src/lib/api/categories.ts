import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Category {
  id: string;
  name: string;
  description: string;
  color?: string;
  bookCount?: number;
  createdAt?: string;
  books?: any[]; // if backend sends books relation
}

export interface UICategory extends Category {
  color: string;
  bookCount: number;
  createdAt: string;
}

export const PALETTE = [
  "#6366f1",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#a855f7",
];

export interface CreateCategoryPayload {
  name: string;
  description: string;
}

export interface UpdateCategoryPayload {
  id: string;
  name: string;
  description: string;
}

async function fetchCategories(): Promise<Category[]> {
  const response = await api.get("/categories");
  return response.data.data;
}

async function createCategory(data: CreateCategoryPayload): Promise<Category> {
  const response = await api.post("/categories", data);
  return response.data.data;
}

async function updateCategory(data: UpdateCategoryPayload): Promise<Category> {
  const response = await api.patch(`/categories/${data.id}`, {
    name: data.name,
    description: data.description,
  });
  return response.data.data;
}

async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
