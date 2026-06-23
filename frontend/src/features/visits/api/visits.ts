import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

export interface ScanResult {
  message: string;
  action: "ENTER" | "EXIT";
  visit: {
    id: string;
    status: "INSIDE" | "EXITED";
    timeIn: string;
    timeOut: string | null;
  };
  user: {
    id: string;
    schoolId: string;
    barcode?: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}

export function useScanVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (barcode: string): Promise<ScanResult> => {
      const response = await api.post("/visits/scan", { barcode });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });
}

export interface Visit {
  id: string;
  status: "INSIDE" | "EXITED";
  timeIn: string;
  timeOut: string | null;
  user: {
    id: string;
    schoolId: string;
    barcode: string | null;
    fullName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
}

export function useVisits() {
  return useQuery({
    queryKey: ["visits"],
    queryFn: async (): Promise<Visit[]> => {
      const response = await api.get("/visits");
      return response.data;
    },
  });
}
