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
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const { logout, user } = useAuthStore();

    const handleLogout = async () => {
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
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e293b] text-white/90">
            <SidebarHeader className={`overflow-hidden border-b border-white/5 py-4 transition-all duration-300 ${isCollapsed ? 'px-0' : 'px-2'}`}>
                <SidebarMenu>
                    <SidebarMenuItem className="flex justify-center">
                        <SidebarMenuButton
                            size="lg"
                            tooltip="NCMC Library"
                            onClick={() => navigate("/admin/dashboard")}
                            className={`hover:bg-white/5 hover:text-white transition-all duration-300 h-auto py-2 group flex items-center justify-center ${isCollapsed ? 'w-full px-0' : 'w-full px-2'}`}
                        >
                            <div className={`flex items-center ${isCollapsed ? '' : 'gap-3 w-full'}`}>
                                <div className={`flex shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white/10 shadow-inner group-hover:scale-105 transition-all duration-300 ${isCollapsed ? 'size-10 p-2' : 'size-11 p-2'}`}>
                                    <img
                                        src="/img/logo.png"
                                        alt="NCMC Library"
                                        className="w-full h-full object-contain filter drop-shadow-md"
                                    />
                                </div>
                                {!isCollapsed && (
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-white tracking-tight leading-tight">
                                            NCMC Library
                                        </span>
                                        <span className="text-[10px] uppercase font-semibold text-white/50 tracking-wider leading-tight mt-0.5">
                                            Admin Panel
                                        </span>
                                    </div>
                                )}
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className={`flex-1 py-4 transition-all duration-300 ${isCollapsed ? 'px-1' : 'px-2'}`}>
                <SidebarGroup>
                    {!isCollapsed && (
                        <SidebarGroupLabel className="px-4 text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2">
                            Main Menu
                        </SidebarGroupLabel>
                    )}
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {menuItems.map((item) => {
                                const hasSubItems = item.items && item.items.length > 0;
                                const isSubItemActive = hasSubItems && item.items?.some(subItem => location.pathname === subItem.path);
                                const isActive = location.pathname === item.path || isSubItemActive;

                                if (hasSubItems && !isCollapsed) {
                                    return (
                                        <Collapsible key={item.label} defaultOpen={isSubItemActive} className="group/collapsible">
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger
                                                    render={
                                                        <SidebarMenuButton
                                                            tooltip={item.label}
                                                            className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
                                                                ${isActive ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-white'}`}
                                                        >
                                                            <item.icon
                                                                className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400' : ''}`} />
                                                            <span className="font-medium text-sm tracking-wide">{item.label}</span>
                                                            <ChevronRightIcon className="ml-auto w-4 h-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 text-white/30 group-hover:text-white" />
                                                            {isActive && !isSubItemActive && (
                                                                <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                                            )}
                                                        </SidebarMenuButton>
                                                    }
                                                />
                                                <CollapsibleContent>
                                                    <SidebarMenuSub className="ml-4 mt-1 border-l border-white/5 pl-2 gap-1">
                                                        {item.items?.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.label}>
                                                                <SidebarMenuSubButton
                                                                    onClick={() => navigate(subItem.path)}
                                                                    className={`px-3 py-2 rounded-lg text-xs transition-all duration-300 
                                                                        ${location.pathname === subItem.path
                                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                                                            : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                                                >
                                                                    <span className="font-medium">{subItem.label}</span>
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
                                    <SidebarMenuItem key={item.label} className={isCollapsed ? "flex justify-center" : ""}>
                                        <SidebarMenuButton
                                            tooltip={item.label}
                                            isActive={location.pathname === item.path}
                                            onClick={() => navigate(item.path)}
                                            className={`relative flex items-center rounded-xl transition-all duration-300 group
                                                ${isCollapsed ? "justify-center px-0 h-10 w-10" : "gap-3 px-4 py-2.5 w-full"}
                                                data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-blue-900/40
                                                hover:bg-white/5 hover:text-white`}
                                        >
                                            <item.icon className={`transition-transform duration-300 group-hover:scale-110 group-data-[active=true]:scale-110 w-5 h-5`} />
                                            {!isCollapsed && <span className="font-medium text-sm tracking-wide">{item.label}</span>}
                                            {location.pathname === item.path && (
                                                <div className={`absolute bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300 ${isCollapsed ? "left-0 w-0.5 h-6" : "left-0 w-1 h-5"}`} />
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
                                        className={`hover:bg-white/5 hover:text-white rounded-xl transition-all duration-300 ${isCollapsed ? "justify-center px-0 h-12" : "px-3 py-6"}`}
                                        tooltip="Admin Settings"
                                    >
                                        <div className={`flex items-center w-full ${isCollapsed ? "justify-center" : "gap-3"}`}>
                                            <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg transition-all duration-300 ${isCollapsed ? "size-8" : "size-9"}`}>
                                                <UserIcon className={`${isCollapsed ? "size-4" : "size-5"} text-white`} />
                                            </div>
                                            {!isCollapsed && (
                                                <div className="flex flex-col min-w-0 flex-1 text-left">
                                                    <span className="text-sm font-semibold text-white truncate">
                                                        {user?.fullName || "Administrator"}
                                                    </span>
                                                    <span className="text-[10px] text-white/50 truncate">
                                                        {user?.email || "admin@ncmc.edu"}
                                                    </span>
                                                </div>
                                            )}
                                            {!isCollapsed && (
                                                <ChevronUpIcon className="ml-auto w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                                            )}
                                        </div>
                                    </SidebarMenuButton>
                                }
                            />
                            <DropdownMenuContent
                                side="top"
                                align="end"
                                className="w-56 mb-2 p-1 bg-[#1e293b] border border-white/10 text-white shadow-2xl rounded-xl overflow-hidden"
                            >
                                <DropdownMenuItem
                                    onClick={() => navigate("/student/profile")}
                                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <User className="w-4 h-4 text-white/60" />
                                    <span className="text-sm">Profile</span>
                                </DropdownMenuItem>
                                <div className="h-px bg-white/5 my-1" />
                                <DropdownMenuItem
                                    onClick={() => navigate("/student/settings")}
                                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <SettingsIcon className="w-4 h-4 text-white/60" />
                                    <span className="text-sm">Account Settings</span>
                                </DropdownMenuItem>
                                <div className="h-px bg-white/5 my-1" />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                                >
                                    <LogOutIcon className="w-4 h-4" />
                                    <span className="text-sm">Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </div>
    );
}

