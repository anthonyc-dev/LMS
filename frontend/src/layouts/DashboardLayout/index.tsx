import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import {
  LibraryIcon,
  HomeIcon,
  Book,
  Tag,
  Layers,
  Users,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { useAuthStore } from "@/app/store/authStore";

import { SidebarContentInner } from "@/shared/components/Sidebar";
import { MobileNav } from "@/shared/components/MobileNav";
import { NotificationBell } from "@/shared/components/NotificationBell";
import { useNotificationSocket } from "@/shared/hooks/useNotificationSocket";
import { getRoleBasePath } from "@/shared/utils/roles";

const createMenuItems = (basePath: string) => [
  {
    icon: HomeIcon,
    label: "Dashboard",
    path: `${basePath}/dashboard`,
    roles: ["admin", "student", "faculty"],
  },
  {
    icon: LibraryIcon,
    label: "Books",
    path: `${basePath}/books`,
    roles: ["student", "faculty"],
    items: [
      { label: "Browse Books", path: `${basePath}/books/browse` },
      { label: "Borrow Books", path: `${basePath}/books/borrow` },
      { label: "Borrowing History", path: `${basePath}/books/history` },
    ],
  },
  // {
  //   icon: Book,
  //   label: "My Books",
  //   path: `${basePath}/my-books`,
  //   roles: ["student", "faculty"], // Example: might not need this for admin if admin has Admin Books
  // },
  // {
  //   icon: CalendarIcon,
  //   label: "Schedule",
  //   path: `${basePath}/schedule`,
  //   roles: ["admin", "student", "faculty"],
  // },
  {
    icon: BookOpen,
    label: "Logbook",
    path: "/admin/visits-logbook",
    roles: ["admin"],
  },
  {
    icon: Users,
    label: "Users",
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
    roles: ["admin"],
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
  const basePath = getRoleBasePath(user?.role);
  const menuItems = createMenuItems(basePath);

  // Activate real-time notification listener
  useNotificationSocket();

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || "");
  });

  const getPageTitle = (pathname: string) => {
    if (/^\/(student|faculty)\/books\/details\/[^/]+$/.test(pathname)) {
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
      <div className="flex h-svh w-full overflow-hidden">
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
        <main className="relative flex flex-1 flex-col overflow-hidden pb-20 md:pb-0">
          <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-4 border-b bg-white/80 px-4 backdrop-blur-md lg:px-6">
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <h1 className="text-foreground text-lg font-semibold capitalize">
              {getPageTitle(location.pathname)}
            </h1>
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </header>
          <div className="bg-background flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav menuItems={filteredMenuItems} />
      </div>
    </SidebarProvider>
  );
}
