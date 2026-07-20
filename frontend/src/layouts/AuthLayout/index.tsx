// AuthLayout — simple pass-through layout for public/auth pages
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-50">
      <Outlet />
    </div>
  );
}
