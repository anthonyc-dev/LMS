import { useState } from "react";
import { LoadingOverlay } from "@/shared/components/Modal/loading-overlay";
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
} from "@/shared/components/ui/sidebar";
import {
  SettingsIcon,
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
} from "@/shared/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { useAuthStore } from "@/app/store/authStore";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
  items?: {
    label: string;
    path: string;
  }[];
};

function CollapsibleSidebarItem({
  item,
  location,
  handleNavigate,
}: {
  item: MenuItem;
  location: { pathname: string };
  handleNavigate: (path: string) => void;
}) {
  const hasSubItems = item.items && item.items.length > 0;
  const isSubItemActive =
    !!hasSubItems &&
    !!item.items?.some((subItem) => location.pathname === subItem.path);
  const isActive = location.pathname === item.path || isSubItemActive;

  const [userOpen, setUserOpen] = useState(false);

  const isOpen = isSubItemActive || userOpen;

  const handleOpenChange = (open: boolean) => {
    if (!isSubItemActive) {
      setUserOpen(open);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton
              tooltip={item.label}
              className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
            >
              <item.icon
                className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-sidebar-primary" : ""}`}
              />
              <span className="text-sm font-medium tracking-wide">
                {item.label}
              </span>
              <ChevronRightIcon
                className={`text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground group-data-[state=open]/collapsible:text-sidebar-primary ml-auto h-4 w-4 transition-all duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-90 ${
                  !isOpen ? "rotate-180" : ""
                }`}
              />

              {isActive && !isSubItemActive && (
                <div className="bg-sidebar-primary absolute left-0 h-5 w-1 rounded-r-full shadow-sm" />
              )}
            </SidebarMenuButton>
          }
        />
        <CollapsibleContent className="collapsible-content-animation">
          <SidebarMenuSub className="border-sidebar-border mt-1 ml-4 gap-1 border-l-2 pl-3">
            {item.items?.map((subItem) => {
              const isSubActive = location.pathname === subItem.path;
              return (
                <SidebarMenuSubItem key={subItem.label} className="relative">
                  {/* L-shaped connector pointer line */}
                  <div
                    className={`absolute top-1/2 -left-3.5 h-px w-3.5 -translate-y-1/2 transition-all duration-300 ${
                      isSubActive
                        ? "bg-sidebar-primary w-4"
                        : "bg-sidebar-border/60"
                    }`}
                  />
                  <SidebarMenuSubButton
                    onClick={() => handleNavigate(subItem.path)}
                    className={`cursor-pointer rounded-lg px-3 py-2 text-xs transition-all duration-300 hover:translate-x-1 ${
                      isSubActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <span className="font-medium">{subItem.label}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

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
      <div className="bg-sidebar text-sidebar-foreground flex h-full flex-col overflow-hidden">
        <SidebarHeader
          className={`overflow-hidden border-b border-white/5 py-4 transition-all duration-300 ${isCollapsed ? "px-0" : "px-2"}`}
        >
          <SidebarMenu>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButton
                size="lg"
                tooltip="NCMC Library"
                onClick={() => handleNavigate("/student/dashboard")}
                className={`group hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-auto items-center justify-center py-2 transition-all duration-300 ${isCollapsed ? "w-full px-0" : "w-full px-2"}`}
              >
                <div
                  className={`flex items-center ${isCollapsed ? "" : "w-full gap-3"}`}
                >
                  <div
                    className={`flex shrink-0 items-center justify-center overflow-hidden shadow-inner transition-all duration-300 group-hover:scale-105 ${isCollapsed ? "size-10 p-2" : "size-16 p-2"}`}
                  >
                    <img
                      src="/img/logo.png"
                      alt="NCMC Library"
                      className="h-full w-full object-contain drop-shadow-md filter"
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="flex min-w-0 flex-col">
                      <span className="text-sidebar-foreground group-hover:text-sidebar-accent-foreground text-sm leading-tight font-bold tracking-tight">
                        NCMC Library
                      </span>
                      <span className="text-sidebar-foreground/70 mt-0.5 text-[10px] leading-tight font-semibold tracking-wider uppercase">
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

                  if (hasSubItems && !isCollapsed) {
                    return (
                      <CollapsibleSidebarItem
                        key={item.label}
                        item={item}
                        location={location}
                        handleNavigate={handleNavigate}
                      />
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
                        className={`group relative flex items-center rounded-xl transition-all duration-300 ${isCollapsed ? "h-10 w-10 justify-center px-0" : "w-full gap-3 px-4 py-2.5"} hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground`}
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
                            className={`bg-sidebar-primary-foreground absolute rounded-r-full shadow-sm transition-all duration-300 ${isCollapsed ? "left-0 h-6 w-0.5" : "left-0 h-5 w-1"}`}
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
                      className={`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl transition-all duration-300 ${isCollapsed ? "h-12 justify-center px-0" : "px-3 py-6"}`}
                      tooltip="Admin Settings"
                    >
                      <div
                        className={`flex w-full items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
                      >
                        <div
                          className={`bg-sidebar-primary flex shrink-0 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${isCollapsed ? "size-8" : "size-9"}`}
                        >
                          <Avatar className="shadow ring-2 ring-slate-100">
                            <AvatarImage src={user?.avatarUrl} />
                            <AvatarFallback
                              className={`${isCollapsed ? "size-4" : "size-5"} bg-amber-100 text-lg font-bold text-amber-700`}
                            >
                              {user?.fullName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        {!isCollapsed && (
                          <div className="flex min-w-0 flex-1 flex-col text-left">
                            <span className="text-sidebar-foreground group-hover:text-sidebar-accent-foreground truncate text-sm font-semibold">
                              {user?.fullName || "Administrator"}
                            </span>
                            <span className="text-sidebar-foreground/70 truncate text-[10px]">
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
                  className="border-border bg-popover text-popover-foreground mb-2 w-56 overflow-hidden rounded-xl border p-1 shadow-lg"
                >
                  <DropdownMenuItem
                    onClick={() => handleNavigate("/student/profile")}
                    className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm">Profile</span>
                  </DropdownMenuItem>
                  <div className="bg-border my-1 h-px" />
                  <DropdownMenuItem
                    onClick={() => handleNavigate("/student/settings")}
                    className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    <span className="text-sm">Account Settings</span>
                  </DropdownMenuItem>
                  <div className="bg-border my-1 h-px" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors"
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
