import { AuthBrandPanel } from "@/features/auth/components/AuthBrandPanel";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import api from "@/shared/lib/axios";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "sonner";
import {
  loginSchema,
  type LoginSchema,
} from "@/features/auth/validations/schemas";
import { LoadingOverlay } from "@/shared/components/Modal/loading-overlay";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { getRoleDashboardPath } from "@/shared/utils/roles";

export function LoginPage() {
  usePageTitle("Login");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: LoginSchema) => {
    try {
      const response = await api.post("/auth/login", data);
      const { user, token } = response.data;

      setAuth(user, token);
      toast.success("Login successful!");

      navigate(getRoleDashboardPath(user.role));
    } catch (error: unknown) {
      console.error("Login failed:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
    }
  };

  return (
    <>
      <LoadingOverlay
        isOpen={isSubmitting}
        label="Signing In"
        sublabel="Verifying your credentials..."
      />
      <div className="bg-card grid min-h-svh lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <AuthBrandPanel />
        <div className="flex flex-col items-center justify-center px-6 py-12 sm:p-12">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 flex flex-col items-start text-left">
              <div className="mb-6 flex size-14 shrink-0 items-center justify-center overflow-hidden">
                <img
                  src="/img/logo.png"
                  alt="NCMC Library"
                  className="h-full w-full object-contain"
                />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Sign in to access your library account.
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-5"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>

                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOffIcon className="size-4" />
                            ) : (
                              <EyeIcon className="size-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 30 days
                </label>
              </div> */}

                <div className="flex items-center justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={isSubmitting}
                >
                  Sign In
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
