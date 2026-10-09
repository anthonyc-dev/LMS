import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { useAuthStore } from "@/app/store/authStore";
import {
  type LucideIcon,
  Menu,
  LogOut,
  User,
  SettingsIcon,
  ChevronRight,
} from "lucide-react";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import { LoadingOverlay } from "@/shared/components/Modal/loading-overlay";
import { getRoleBasePath } from "@/shared/utils/roles";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
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

export function MobileNav({ menuItems }: { menuItems: MenuItem[] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const basePath = getRoleBasePath(user?.role);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const bottomBarItems = menuItems.slice(0, 4);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/auth/logout");
      logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      logout();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const isItemActive = (item: MenuItem) => {
    const hasSubItems = item.items && item.items.length > 0;
    const isSubItemActive =
      hasSubItems &&
      item.items?.some((subItem) => location.pathname === subItem.path);
    return location.pathname === item.path || isSubItemActive;
  };

  return (
    <>
      <LoadingOverlay
        isOpen={isLoggingOut}
        label="Signing Out"
        sublabel="Clearing your session..."
      />

      {/* Bottom Navigation Bar */}
      <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 flex h-18 items-center justify-around border-t border-slate-200 bg-white px-2 pt-1 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] md:hidden">
        {bottomBarItems.map((item) => {
          const active = isItemActive(item);
          const hasSubItems = item.items && item.items.length > 0;
          const isThisSheetOpen = activeSheet === item.label;

          if (hasSubItems) {
            return (
              <Sheet
                key={item.label}
                open={isThisSheetOpen}
                onOpenChange={(open) =>
                  setActiveSheet(open ? item.label : null)
                }
              >
                <SheetTrigger
                  render={
                    <button className="flex flex-1 flex-col items-center justify-center gap-1 overflow-hidden px-1">
                      <div
                        className={`flex h-8 w-14 items-center justify-center rounded-full transition-all ${
                          active
                            ? "bg-blue-100 text-blue-700"
                            : "text-slate-500"
                        }`}
                      >
                        <item.icon
                          className="size-5"
                          strokeWidth={active ? 2.5 : 2}
                        />
                      </div>
                      <span
                        className={`truncate text-[10px] font-medium tracking-wide ${
                          active ? "font-bold text-blue-700" : "text-slate-500"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  }
                />
                <SheetContent
                  side="bottom"
                  className="flex max-h-[85vh] flex-col rounded-t-3xl bg-white p-0"
                >
                  <SheetHeader className="border-b border-slate-100 p-4 text-left">
                    <SheetTitle className="text-lg font-bold">
                      {item.label}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-2 overflow-y-auto p-4 pb-8">
                    {item.items?.map((subItem) => (
                      <button
                        key={subItem.label}
                        onClick={() => {
                          setActiveSheet(null);
                          handleNavigate(subItem.path);
                        }}
                        className={`flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                          location.pathname === subItem.path
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => handleNavigate(item.path)}
              className="flex flex-1 flex-col items-center justify-center gap-1 overflow-hidden px-1"
            >
              <div
                className={`flex h-8 w-14 items-center justify-center rounded-full transition-all ${
                  active ? "bg-blue-100 text-blue-700" : "text-slate-500"
                }`}
              >
                <item.icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span
                className={`truncate text-[10px] font-medium tracking-wide ${
                  active ? "font-bold text-blue-700" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            render={
              <button className="flex flex-1 flex-col items-center justify-center gap-1 overflow-hidden px-1 text-slate-500">
                <div
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-all ${
                    isOpen ? "bg-slate-100 text-slate-900" : ""
                  }`}
                >
                  <Menu className="size-5" />
                </div>
                <span className="truncate text-[10px] font-medium tracking-wide text-slate-500">
                  Menu
                </span>
              </button>
            }
          />

          <SheetContent
            side="bottom"
            className="flex max-h-[85vh] flex-col rounded-t-3xl bg-white p-0"
          >
            <SheetHeader className="border-b border-slate-100 p-4 text-left">
              <SheetTitle className="text-lg font-bold">Navigation</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-2">
                <span className="mb-2 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Menu
                </span>
                {menuItems.map((item) => {
                  const hasSubItems = item.items && item.items.length > 0;
                  const active = isItemActive(item);

                  if (hasSubItems) {
                    return (
                      <Collapsible
                        key={item.label}
                        defaultOpen={active}
                        className="group/collapsible rounded-xl"
                      >
                        <CollapsibleTrigger
                          render={
                            <button
                              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                                active
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <item.icon
                                className={`size-5 ${active ? "text-blue-600" : ""}`}
                              />
                              {item.label}
                              <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </button>
                          }
                        />

                        <CollapsibleContent>
                          <div className="mt-1 ml-4 flex flex-col gap-1 border-l-2 border-slate-100 pl-2">
                            {item.items?.map((subItem) => (
                              <button
                                key={subItem.label}
                                onClick={() => handleNavigate(subItem.path)}
                                className={`flex w-full items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                                  location.pathname === subItem.path
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                              >
                                {subItem.label}
                              </button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  }

                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNavigate(item.path)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon
                        className={`size-5 ${active ? "text-blue-600" : ""}`}
                      />
                      {item.label}
                    </button>
                  );
                })}

                <div className="my-4 h-px bg-slate-100" />

                <span className="mb-2 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Account
                </span>

                {/* Profile Info */}
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-blue-600 to-blue-500 text-white shadow-md">
                    <Avatar className="shadow ring-2 ring-slate-100">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-amber-100 text-lg font-bold text-amber-700">
                        {user?.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex min-w-0 flex-col text-left">
                    <span className="truncate text-sm font-bold text-slate-800">
                      {user?.fullName || "Administrator"}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {user?.email || "admin@ncmc.edu"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleNavigate(`${basePath}/profile`)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <User className="size-5" />
                  Profile
                </button>
                <button
                  onClick={() => handleNavigate(`${basePath}/settings`)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <SettingsIcon className="size-5" />
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                >
                  <LogOut className="size-5" />
                  Sign out
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  );
}
