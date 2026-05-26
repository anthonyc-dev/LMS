import { useState } from "react";
import { LoadingOverlay } from "@/components/commons/loading-overlay";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
  SidebarContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  SettingsIcon,
  UserIcon,
  LogOutIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  type LucideIcon,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { toast } from "sonner";

type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
  items?: {
    label: string;
    path: string;
  }[];
};

export function SidebarContentInner({
  menuItems,
  navigate,
  location,
}: {
  menuItems: MenuItem[];
  navigate: (path: string) => void;
  location: { pathname: string };
}) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const { logout, user } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/auth/logout");
      logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Even if API fails, clear local state
      logout();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <LoadingOverlay
        isOpen={isLoggingOut}
        label="Signing Out"
        sublabel="Clearing your session..."
      />
      <div className="flex h-full flex-col overflow-hidden rounded-tr-3xl rounded-br-3xl bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-size-[20px_20px] text-white/90">
        <SidebarHeader
          className={`overflow-hidden border-b border-white/5 py-4 transition-all duration-300 ${isCollapsed ? "px-0" : "px-2"}`}
        >
          <SidebarMenu>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButton
                size="lg"
                tooltip="NCMC Library"
                onClick={() => handleNavigate("/student/dashboard")}
                className={`group flex h-auto items-center justify-center py-2 transition-all duration-300 hover:bg-white/5 hover:text-white ${isCollapsed ? "w-full px-0" : "w-full px-2"}`}
              >
                <div
                  className={`flex items-center ${isCollapsed ? "" : "w-full gap-3"}`}
                >
                  <div
                    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 shadow-inner transition-all duration-300 group-hover:scale-105 ${isCollapsed ? "size-10 p-2" : "size-11 p-2"}`}
                  >
                    <img
                      src="/img/logo.png"
                      alt="NCMC Library"
                      className="h-full w-full object-contain drop-shadow-md filter"
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="flex min-w-0 flex-col">
                      <span className="text-sm leading-tight font-bold tracking-tight text-white">
                        NCMC Library
                      </span>
                      <span className="mt-0.5 text-[10px] leading-tight font-semibold tracking-wider text-white/50 uppercase">
                        {user ? `${user.role!.toUpperCase()} Panel` : "Panel"}
                      </span>
                    </div>
                  )}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent
          className={`flex-1 py-4 transition-all duration-300 ${isCollapsed ? "px-1" : "px-2"}`}
        >
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="mb-2 px-4 text-[11px] font-bold tracking-widest text-white/30 uppercase">
                Main Menu
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {menuItems.map((item) => {
                  const hasSubItems = item.items && item.items.length > 0;
                  const isSubItemActive =
                    hasSubItems &&
                    item.items?.some(
                      (subItem) => location.pathname === subItem.path,
                    );
                  const isActive =
                    location.pathname === item.path || isSubItemActive;

                  if (hasSubItems && !isCollapsed) {
                    return (
                      <Collapsible
                        key={item.label}
                        defaultOpen={isSubItemActive}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger
                            render={
                              <SidebarMenuButton
                                tooltip={item.label}
                                className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 ${isActive ? "bg-white/5 text-white" : "hover:bg-white/5 hover:text-white"}`}
                              >
                                <item.icon
                                  className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-blue-400" : ""}`}
                                />
                                <span className="text-sm font-medium tracking-wide">
                                  {item.label}
                                </span>
                                <ChevronRightIcon className="ml-auto h-4 w-4 text-white/30 transition-transform duration-300 group-hover:text-white group-data-[state=open]/collapsible:rotate-90" />
                                {isActive && !isSubItemActive && (
                                  <div className="absolute left-0 h-5 w-1 rounded-r-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                )}
                              </SidebarMenuButton>
                            }
                          />
                          <CollapsibleContent>
                            <SidebarMenuSub className="mt-1 ml-4 gap-1 border-l border-white/5 pl-2">
                              {item.items?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.label}>
                                  <SidebarMenuSubButton
                                    onClick={() => handleNavigate(subItem.path)}
                                    className={`cursor-pointer rounded-lg px-3 py-2 text-xs transition-all duration-300 ${
                                      location.pathname === subItem.path
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                    }`}
                                  >
                                    <span className="font-medium">
                                      {subItem.label}
                                    </span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  return (
                    <SidebarMenuItem
                      key={item.label}
                      className={isCollapsed ? "flex justify-center" : ""}
                    >
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={location.pathname === item.path}
                        onClick={() => handleNavigate(item.path)}
                        className={`group relative flex items-center rounded-xl transition-all duration-300 ${isCollapsed ? "h-10 w-10 justify-center px-0" : "w-full gap-3 px-4 py-2.5"} hover:bg-white/5 hover:text-white data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-blue-900/40`}
                      >
                        <item.icon
                          className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-data-[active=true]:scale-110`}
                        />
                        {!isCollapsed && (
                          <span className="text-sm font-medium tracking-wide">
                            {item.label}
                          </span>
                        )}
                        {location.pathname === item.path && (
                          <div
                            className={`absolute rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300 ${isCollapsed ? "left-0 h-6 w-0.5" : "left-0 h-5 w-1"}`}
                          />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-white/5 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className={`rounded-xl transition-all duration-300 hover:bg-white/5 hover:text-white ${isCollapsed ? "h-12 justify-center px-0" : "px-3 py-6"}`}
                      tooltip="Admin Settings"
                    >
                      <div
                        className={`flex w-full items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
                      >
                        <div
                          className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 shadow-lg transition-all duration-300 ${isCollapsed ? "size-8" : "size-9"}`}
                        >
                          <UserIcon
                            className={`${isCollapsed ? "size-4" : "size-5"} text-white`}
                          />
                        </div>
                        {!isCollapsed && (
                          <div className="flex min-w-0 flex-1 flex-col text-left">
                            <span className="truncate text-sm font-semibold text-white">
                              {user?.fullName || "Administrator"}
                            </span>
                            <span className="truncate text-[10px] text-white/50">
                              {user?.email || "admin@ncmc.edu"}
                            </span>
                          </div>
                        )}
                        {!isCollapsed && (
                          <ChevronUpIcon className="ml-auto h-4 w-4 text-white/30 transition-colors group-hover:text-white" />
                        )}
                      </div>
                    </SidebarMenuButton>
                  }
                />
                <DropdownMenuContent
                  side="top"
                  align="end"
                  className="mb-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#00091d] p-1 text-white shadow-2xl"
                >
                  <DropdownMenuItem
                    onClick={() => handleNavigate("/student/profile")}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                  >
                    <User className="h-4 w-4 text-white/60" />
                    <span className="text-sm">Profile</span>
                  </DropdownMenuItem>
                  <div className="my-1 h-px bg-white/5" />
                  <DropdownMenuItem
                    onClick={() => handleNavigate("/student/settings")}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                  >
                    <SettingsIcon className="h-4 w-4 text-white/60" />
                    <span className="text-sm">Account Settings</span>
                  </DropdownMenuItem>
                  <div className="my-1 h-px bg-white/5" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    <span className="text-sm">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </div>
    </>
  );
}
