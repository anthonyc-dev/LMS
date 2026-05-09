import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  BarChart3Icon,
  LibraryIcon,
  CalendarIcon,
  HomeIcon,
  Book,
} from "lucide-react";

import { SidebarContentInner } from "@/components/admin.component/Sidebar";

const menuItems = [
  { icon: HomeIcon, label: "Dashboard", path: "/admin/dashboard" },
  {
    icon: LibraryIcon,
    label: "Books",
    path: "/admin/books",
    items: [
      { label: "Browse Books", path: "/admin/books/browse" },
      { label: "Borrow Books", path: "/admin/books/borrow" },
      { label: "Borrowing History", path: "/admin/books/history" },
    ],
  },
  { icon: Book, label: "My Books", path: "/admin/books" },
  { icon: CalendarIcon, label: "Schedule", path: "/admin/schedule" },
  { icon: BarChart3Icon, label: "Reports", path: "/admin/reports" },
];


export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <Sidebar
          collapsible="icon"
          variant="sidebar"
          className="text-white"
        >
          <SidebarContentInner navigate={navigate} location={location} menuItems={menuItems} />
        </Sidebar>
        <main className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-4 border-b px-4 lg:px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </header>
          <div className="flex-1 overflow-auto p-4 lg:p-6 bg-gray-100">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
