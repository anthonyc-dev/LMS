import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BookOpenIcon,
  UsersIcon,
  BarChart3Icon,
  SettingsIcon,
  LibraryIcon,
  CalendarIcon,
  FileTextIcon,
  HomeIcon,
  ChevronUpIcon,
  UserIcon,
  LogOutIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { icon: HomeIcon, label: "Dashboard", path: "/admin/dashboard" },
  { icon: LibraryIcon, label: "Books", path: "/admin/books" },
  { icon: UsersIcon, label: "Users", path: "/admin/users" },
  { icon: FileTextIcon, label: "Borrowing", path: "/admin/borrowing" },
  { icon: CalendarIcon, label: "Schedule", path: "/admin/schedule" },
  { icon: BarChart3Icon, label: "Reports", path: "/admin/reports" },
];

function SidebarContentInner({
  navigate,
  location,
}: {
  navigate: (path: string) => void;
  location: { pathname: string };
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="NCMC Library"
              onClick={() => navigate("/admin/dashboard")}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
                <BookOpenIcon className="size-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">NCMC Library</span>
                  <span className="text-xs text-muted-foreground">
                    Admin Panel
                  </span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    className="data-[active=true]:bg-blue-500 data-[active=true]:text-white hover:bg-blue-50 hover:text-blue-600 data-[active=true]:hover:bg-blue-600"
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-blue-50 hover:text-blue-600"
                  tooltip="Admin"
                >
                  <UserIcon />
                  {!isCollapsed && <span>Admin</span>}
                  {!isCollapsed && <ChevronUpIcon className="ml-auto" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <SettingsIcon />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/login")}>
                  <LogOutIcon />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <Sidebar
          collapsible="icon"
          variant="sidebar"
          className="bg-white text-foreground"
        >
          <SidebarContentInner navigate={navigate} location={location} />
        </Sidebar>
        <main className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-4 border-b px-4 lg:px-6 bg-white">
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
