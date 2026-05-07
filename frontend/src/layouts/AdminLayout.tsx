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
      <SidebarHeader className="overflow-hidden bg-[#202940] px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="NCMC Library"
              onClick={() => navigate("/admin/dashboard")}
              className="hover:bg-white/10 hover:text-white transition-all duration-200 h-auto py-2"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex shrink-0 items-center justify-center rounded-lg overflow-hidden size-10">
                  <img
                    src="/img/logo.png"
                    alt="NCMC Library"
                    className="w-full h-full object-contain"
                  />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white drop-shadow-sm leading-tight">
                      NCMC Library
                    </span>
                    <span className="text-xs text-white/70 drop-shadow-sm leading-tight">
                      Admin Panel
                    </span>
                  </div>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-[#202940] text-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    className="data-[active=true]:bg-blue-600 data-[active=true]:text-white hover:bg-white/10 hover:text-white data-[active=true]:hover:bg-blue-700"
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
      <SidebarFooter className="bg-[#202940] text-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-white/10 hover:text-white"
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
          className="bg-[#202940] text-white"
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
