import api from "@/shared/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define Types
export type BorrowingStatus =
  | "pending"
  | "borrowed"
  | "returned"
  | "overdue"
  | "lost"
  | "rejected";

export interface BookCopy {
  id: string;
  barcode: string;
  status: string;
  condition?: string;
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    coverImage?: string;
  };
}

export interface Borrowing {
  id: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    schoolId: string;
    avatarUrl?: string;
    department?: string;
    yearLevel?: string;
  };
  bookCopy?: BookCopy;
  borrowDate: string;
  dueDate: string;
  returnedDate?: string;
  status: BorrowingStatus;
  fines?: {
    id: string;
    borrowingId: string;
    type: string;
    status: string;
    amount: string;
    reason: string | null;
    paidAt: string | null;
  }[];
}

// Queries
export const useBookCopyByBarcode = (barcode: string) => {
  return useQuery({
    queryKey: ["book-copy-barcode", barcode],
    queryFn: async () => {
      if (!barcode) return null;
      const res = await api.get(`/book-copies/barcode/${barcode}`);
      return res.data;
    },
    enabled: !!barcode,
    retry: false, // Don't retry if barcode is invalid
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useBorrowings = (filters?: any) => {
  return useQuery({
    queryKey: ["borrowings", filters],
    queryFn: async () => {
      const res = await api.get("/borrowings", { params: filters });
      return res.data;
    },
  });
};

export const useBorrowingsByUser = (userId?: string) => {
  return useQuery({
    queryKey: ["borrowings-user", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await api.get(`/borrowings/user/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
};

export const useActiveBorrowingByBarcode = (barcode: string) => {
  return useQuery({
    queryKey: ["active-borrowing-barcode", barcode],
    queryFn: async () => {
      if (!barcode) return null;
      // We can get the book copy first
      const copyRes = await api.get(`/book-copies/barcode/${barcode}`);
      const copy = copyRes.data;
      if (!copy) throw new Error("Book copy not found");

      // Find active borrowing for this copy
      const borrowingsRes = await api.get("/borrowings");
      const borrowings = borrowingsRes.data;
      const active = borrowings.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (b: any) =>
          b.bookCopy?.id === copy.id &&
          (b.status === "borrowed" || b.status === "overdue"),
      );

      if (!active)
        throw new Error("No active borrowing found for this book copy");
      return active;
    },
    enabled: !!barcode,
    retry: false,
  });
};

// Mutations
export const useBorrowBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      bookCopyId: string;
      borrowDate: Date;
      dueDate: Date;
      status: BorrowingStatus;
    }) => {
      const res = await api.post("/borrowings", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["borrowings"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["book-copies"] });
      qc.invalidateQueries({ queryKey: ["user-analytics"] });
    },
  });
};

export const useSelfBorrowBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      const res = await api.post("/borrowings/self-borrow", { bookId });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["borrowings"] });
      qc.invalidateQueries({ queryKey: ["borrowings-user"] });
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["book-copies"] });
      qc.invalidateQueries({ queryKey: ["user-analytics"] });
    },
  });
};

export const useBorrowBooksBulk = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      bookCopyIds: string[];
      borrowDate: Date;
      dueDate: Date;
      status: BorrowingStatus;
    }) => {
      const res = await api.post("/borrowings/bulk", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["borrowings"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["book-copies"] });
    },
  });
};

export const useReturnBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { borrowingId: string; condition?: string }) => {
      const res = await api.patch(`/borrowings/${data.borrowingId}/return`, {
        condition: data.condition,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["borrowings"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["book-copies"] });
    },
  });
};

//Fines--------------------------------
export const useMarkFinePaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fineId: string) => {
      const res = await api.patch(`/fines/${fineId}/paid`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["borrowings"] });
      qc.invalidateQueries({ queryKey: ["fines"] });
      qc.invalidateQueries({ queryKey: ["user-analytics"] });
    },
  });
};

export const useCreateFine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      borrowingId: string;
      type: "OVERDUE" | "NO COVER" | "DAMAGED" | "LOST";
      status: "UNPAID" | "PAID" | "WAIVED";
      amount: number;
      reason?: string;
    }) => {
      const res = await api.post("/fines", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fines"] });
      qc.invalidateQueries({ queryKey: ["borrowings"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDecideBorrowing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      decision,
    }: {
      id: string;
      decision: "confirm" | "reject";
    }) => {
      const response = await api.patch("/borrowings/" + id + "/" + decision);
      return response.data;
    },
    onSuccess: () => {
      for (const key of [
        "borrowings",
        "borrowings-user",
        "books",
        "book-copies",
        "user-analytics",
        "admin-analytics",
      ]) {
        qc.invalidateQueries({ queryKey: [key] });
      }
    },
  });
};
