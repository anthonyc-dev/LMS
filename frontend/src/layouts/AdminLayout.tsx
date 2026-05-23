import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LibraryIcon,
  CalendarIcon,
  HomeIcon,
  Book,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

import { SidebarContentInner } from "@/components/admin.component/Sidebar";

const menuItems = [
  {
    icon: HomeIcon,
    label: "Dashboard",
    path: "/student/dashboard",
    roles: ["admin", "student", "faculty"]
  },
  {
    icon: LibraryIcon,
    label: "Books",
    path: "/student/books",
    roles: ["admin", "student", "faculty"],
    items: [
      { label: "Browse Books", path: "/student/books/browse" },
      { label: "Borrow Books", path: "/student/books/borrow" },
      { label: "Borrowing History", path: "/student/books/history" },
    ],
  },
  {
    icon: Book,
    label: "My Books",
    path: "/student/books",
    roles: ["student", "faculty"] // Example: might not need this for admin if admin has Admin Books
  },
  {
    icon: CalendarIcon,
    label: "Schedule",
    path: "/student/schedule",
    roles: ["admin", "student", "faculty"]
  },
  {
    icon: Book,
    label: "Admin Books",
    path: "/admin/books",
    roles: ["admin"]
  },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || "");
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <Sidebar
          collapsible="icon"
          variant="sidebar"
          className="text-white"
        >
          <SidebarContentInner navigate={navigate} location={location} menuItems={filteredMenuItems} />
        </Sidebar>
        <main className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-4 border-b px-4 lg:px-6 bg-white/50 backdrop-blur-md sticky top-0 z-50">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold capitalize">
              {location.pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
            </h1>
          </header>
          <div className="flex-1 overflow-auto p-4 lg:p-6 bg-gray-100">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
