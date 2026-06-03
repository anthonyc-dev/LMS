import api from "@/shared/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Role = "admin" | "faculty" | "student";

export const VALID_ROLES: Role[] = ["admin", "faculty", "student"];

function normalizeRole(val: unknown): Role {
  if (typeof val === "string" && VALID_ROLES.includes(val as Role))
    return val as Role;
  return "student";
}

// Try multiple common property names when reading from the API response
function getField<T>(
  obj: Record<string, unknown>,
  ...keys: string[]
): T | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return undefined;
}

export interface ApiUser {
  _id: string;
  schoolId: string;
  fullName: string;
  email: string;
  department: string;
  yearLevel: string;
  phoneNumber?: string;
  Role: Role;
  createdAt: string;
  updatedAt: string;
  borrowings?: any[];
}

export function normalizeApiUser(raw: Record<string, unknown>): ApiUser {
  return {
    _id: getField<string>(raw, "_id", "id") ?? "",
    schoolId: getField<string>(raw, "schoolId", "school_id") ?? "",
    fullName: getField<string>(raw, "fullName", "full_name", "name") ?? "",
    email: getField<string>(raw, "email") ?? "",
    department: getField<string>(raw, "department") ?? "",
    yearLevel: getField<string>(raw, "yearLevel", "year_level") ?? "",
    phoneNumber: getField<string>(raw, "phoneNumber", "phone_number", "phone"),
    Role: normalizeRole(getField(raw, "Role", "role")),
    createdAt:
      getField<string>(raw, "createdAt", "created_at", "createdAt") ??
      new Date().toISOString(),
    updatedAt:
      getField<string>(raw, "updatedAt", "updated_at", "updatedAt") ??
      new Date().toISOString(),
    borrowings: getField<any[]>(raw, "borrowings"),
  };
}

export interface MetaOption {
  value: string;
  label: string;
}

export interface UsersMeta {
  departments: MetaOption[];
  yearLevels: MetaOption[];
}

export interface CreateUserPayload {
  schoolId: string;
  fullName: string;
  email: string;
  department: string;
  yearLevel: string;
  phoneNumber: string;
  role: Role;
}

export interface UpdateUserPayload {
  schoolId?: string;
  fullName?: string;
  email?: string;
  department?: string;
  yearLevel?: string;
  phoneNumber?: string;
  role?: Role;
}

async function fetchUsers(): Promise<ApiUser[]> {
  const res = await api.get("/users");
  const data = res.data;
  let rawList: Record<string, unknown>[] = [];
  if (Array.isArray(data)) rawList = data;
  else if (data?.users && Array.isArray(data.users)) rawList = data.users;
  else if (data?.data && Array.isArray(data.data)) rawList = data.data;
  else console.warn("Unexpected users API response shape:", data);
  return rawList.map(normalizeApiUser);
}

async function fetchUsersMeta(): Promise<UsersMeta> {
  const res = await api.get("/users/meta");
  return res.data;
}

async function createUser(data: CreateUserPayload): Promise<ApiUser> {
  const res = await api.post("/users", data);
  const raw = res.data;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return normalizeApiUser(raw as Record<string, unknown>);
  }
  return raw;
}

async function updateUser(
  id: string,
  data: UpdateUserPayload,
): Promise<ApiUser> {
  const res = await api.put(`/users/${id}`, data);
  const raw = res.data;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return normalizeApiUser(raw as Record<string, unknown>);
  }
  return raw;
}

async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}

export function useUsersMeta() {
  return useQuery({
    queryKey: ["usersMeta"],
    queryFn: fetchUsersMeta,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
