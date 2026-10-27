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
  deletedAt?: string | null;
  schoolId: string;
  fullName: string;
  email: string;
  department: string;
  yearLevel: string;
  phoneNumber?: string;
  avatarUrl?: string;
  barcode?: string;
  Role: Role;
  createdAt: string;
  updatedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  borrowings?: any[];
  activeBorrowingsCount: number;
}

export function normalizeApiUser(raw: Record<string, unknown>): ApiUser {
  return {
    _id: getField<string>(raw, "_id", "id") ?? "",
    deletedAt: getField<string | null>(raw, "deletedAt"),
    schoolId: getField<string>(raw, "schoolId", "school_id") ?? "",
    fullName: getField<string>(raw, "fullName", "full_name", "name") ?? "",
    email: getField<string>(raw, "email") ?? "",
    department: getField<string>(raw, "department") ?? "",
    yearLevel: getField<string>(raw, "yearLevel", "year_level") ?? "",
    phoneNumber: getField<string>(raw, "phoneNumber", "phone_number", "phone"),
    avatarUrl: getField<string>(raw, "avatarUrl", "avatar_url"),
    barcode: getField<string>(raw, "barcode"),
    Role: normalizeRole(getField(raw, "Role", "role")),
    createdAt:
      getField<string>(raw, "createdAt", "created_at", "createdAt") ??
      new Date().toISOString(),
    updatedAt:
      getField<string>(raw, "updatedAt", "updated_at", "updatedAt") ??
      new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    borrowings: getField<any[]>(raw, "borrowings"),
    activeBorrowingsCount: getField<number>(raw, "activeBorrowingsCount") ?? 0,
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
  avatarUrl?: string;
  role: Role;
}

export interface UpdateUserPayload {
  schoolId?: string;
  fullName?: string;
  email?: string;
  department?: string;
  yearLevel?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role?: Role;
}

async function fetchUsers(
  status: "active" | "deactivated",
  signal?: AbortSignal,
): Promise<ApiUser[]> {
  const rawList: Record<string, unknown>[] = [];
  let page = 1;
  let totalPages: number;
  do {
    const res = await api.get("/users", {
      params: { status, page, limit: 100 },
      signal,
    });
    const data = res.data;
    if (Array.isArray(data)) rawList.push(...data);
    else if (Array.isArray(data?.users)) rawList.push(...data.users);
    else if (Array.isArray(data?.data)) rawList.push(...data.data);
    else throw new Error("Invalid users API response");
    totalPages = Number.isInteger(data?.meta?.totalPages)
      ? data.meta.totalPages
      : 1;
    page++;
  } while (page <= totalPages);
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

async function deactivateUser(id: string): Promise<void> {
  await api.post(`/users/${id}/deactivate`);
}

export async function updateUserProfile(
  id: string,
  data: FormData,
): Promise<ApiUser> {
  const res = await api.put(`/users/profile/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const raw = res.data;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return normalizeApiUser(raw as Record<string, unknown>);
  }
  return raw;
}

export function useUsers(status: "active" | "deactivated" = "active") {
  return useQuery({
    queryKey: ["users", status],
    queryFn: ({ signal }) => fetchUsers(status, signal),
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

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRestoreUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post("/users/" + id + "/restore");
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateUserProfile(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function changePassword(id: string, data: any) {
  const res = await api.put(`/users/change-password/${id}`, data);
  return res.data;
}

export function useChangePassword() {
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      changePassword(id, data),
  });
}

export async function fetchSessions() {
  const res = await api.get("/auth/sessions");
  return res.data;
}

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
  });
}

export async function revokeSession(id: string) {
  const res = await api.delete(`/auth/sessions/${id}`);
  return res.data;
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export async function revokeAllSessions() {
  const res = await api.delete("/auth/sessions");
  return res.data;
}

export function useRevokeAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
