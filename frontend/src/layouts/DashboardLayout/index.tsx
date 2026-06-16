import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import {
  LibraryIcon,
  CalendarIcon,
  HomeIcon,
  Book,
  Tag,
  Layers,
  Users,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/app/store/authStore";

import { SidebarContentInner } from "@/shared/components/Sidebar";
import { MobileNav } from "@/shared/components/MobileNav";

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
    icon: Layers,
    label: "Shelves",
    path: "/admin/shelves",
    roles: ["admin"],
  },
  {
    icon: Book, // Could use BookCopy but Book is used in the file
    label: "Book Copies",
    path: "/admin/book-copies",
    roles: ["admin"],
  },
  // {
  //   icon: Package,
  //   label: "Inventory",
  //   path: "/admin/inventory",
  //   roles: ["admin"],
  // },
  {
    icon: RefreshCw,
    label: "Circulation",
    path: "/admin/circulation",
    roles: ["admin", "faculty"],
    items: [
      { label: "Borrow Book", path: "/admin/circulation/borrow" },
      { label: "Return Book", path: "/admin/circulation/return" },
      { label: "Records", path: "/admin/circulation/records" },
    ],
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

  const getPageTitle = (pathname: string) => {
    if (/^\/student\/books\/details\/[^/]+$/.test(pathname)) {
      return "Book Details";
    }

    if (/^\/admin\/books\/(?!add)[^/]+$/.test(pathname)) {
      return "Book Details";
    }

    if (/^\/admin\/book-copies\/[^/]+$/.test(pathname)) {
      return "Book Copy Details";
    }

    return pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard";
  };

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
          <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-white/80 px-4 backdrop-blur-md lg:px-6">
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <h1 className="text-foreground text-lg font-semibold capitalize">
              {getPageTitle(location.pathname)}
            </h1>
          </header>
          <div className="bg-background flex-1 overflow-auto p-4 lg:p-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav menuItems={filteredMenuItems} />
      </div>
    </SidebarProvider>
  );
}
