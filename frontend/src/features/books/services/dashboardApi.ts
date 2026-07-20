import api from "@/shared/lib/axios";

export interface AdminDashboardStats {
  totalCatalog: number;
  activeMembers: number;
  activeBorrows: number;
  overdueAlerts: number;
  fineCollections: number;
  categoryDistribution: { name: string; value: number; color: string }[];
  recentLogs: {
    id: string;
    type: string;
    user: string;
    book: string;
    time: string;
    status: string;
  }[];
  borrowingTrendsData: { month: string; checkouts: number; returns: number }[];
}

export interface UserDashboardStats {
  checkedOut: number;
  nextDeadlineDays: number | string;
  nextDeadlineDate: string;
  readBooksCount: number;
  outstandingFines: number;
  activeLoans: {
    id: string;
    title: string;
    author: string;
    dueDate: string;
    daysRemaining: number;
    totalDays: number;
    cover: string;
    category: string;
    renewCount: number;
  }[];
}

export const getAdminAnalytics = async (): Promise<AdminDashboardStats> => {
  const response = await api.get("/analytics/admin");
  return response.data;
};

export const getUserAnalytics = async (): Promise<UserDashboardStats> => {
  const response = await api.get("/analytics/user");
  return response.data;
};
