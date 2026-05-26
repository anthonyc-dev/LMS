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
  Package,
  Tag,
  Layers,
  Users,
  ClipboardList,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

import { SidebarContentInner } from "@/components/admin.component/Sidebar";
import { MobileNav } from "@/components/admin.component/MobileNav";

const menuItems = [
  {
    icon: HomeIcon,
    label: "Dashboard",
    path: "/student/dashboard",
    roles: ["admin", "student", "faculty"],
  },
  {
    icon: LibraryIcon,
    label: "Books",
    path: "/student/books",
    roles: ["student", "faculty"],
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
    roles: ["student", "faculty"], // Example: might not need this for admin if admin has Admin Books
  },
  {
    icon: CalendarIcon,
    label: "Schedule",
    path: "/student/schedule",
    roles: ["admin", "student", "faculty"],
  },
  {
    icon: Users,
    label: "User Management",
    path: "/admin/users",
    roles: ["admin"],
  },
  {
    icon: Layers,
    label: "Shelves",
    path: "/admin/shelves",
    roles: ["admin"],
  },
  {
    icon: Tag,
    label: "Categories",
    path: "/admin/categories",
    roles: ["admin"],
  },
  {
    icon: Book,
    label: "Books",
    path: "/admin/books",
    roles: ["admin"],
  },
  {
    icon: Package,
    label: "Inventory",
    path: "/admin/inventory",
    roles: ["admin"],
  },
  {
    icon: ClipboardList,
    label: "Borrowing History",
    path: "/admin/borrowing-history",
    roles: ["admin"],
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
          className="hidden border-none text-white md:flex"
        >
          <SidebarContentInner
            navigate={navigate}
            location={location}
            menuItems={filteredMenuItems}
          />
        </Sidebar>
        <main className="flex flex-1 flex-col pb-20 md:pb-0">
          <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-white/50 px-4 backdrop-blur-md lg:px-6">
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <h1 className="text-lg font-semibold capitalize">
              {location.pathname.split("/").pop()?.replace("-", " ") ||
                "Dashboard"}
            </h1>
          </header>
          <div className="flex-1 overflow-auto bg-gray-100 p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile Navigation */}
        <MobileNav menuItems={filteredMenuItems} />
      </div>
    </SidebarProvider>
  );
}
