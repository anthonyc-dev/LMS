import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  ArrowLeftIcon,
  KeyIcon,
} from "lucide-react";
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
import { toast } from "sonner";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/features/auth/validations/schemas";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

export function ResetPassword() {
  usePageTitle("Reset Password");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: ResetPasswordSchema) => {
    try {
      const response = await api.post("/auth/reset-password", {
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      toast.success(
        response.data.message ||
          "Password reset successful! Please sign in with your new password.",
      );
      navigate("/login");
    } catch (error: unknown) {
      console.error("Password reset failed:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message ||
          "Reset session expired or invalid. Please request a new OTP.",
      );
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Column: Cover & Brand Info */}
      <div className="relative hidden items-center justify-center overflow-hidden p-10 lg:flex lg:flex-col">
        <img
          src="/img/login.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/60 to-transparent" />
        <div className="relative z-10 flex max-w-md flex-col items-center text-center">
          <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <img
              src="/img/logo.png"
              alt="NCMC Library"
              className="h-full w-full object-contain"
            />
          </div>
          <h2 className="mb-3 text-5xl font-bold text-white">LMS Platform</h2>
          <p className="text-lg leading-relaxed text-white/80">
            Secure, premium access for administrators, students, and faculty
            members.
          </p>
        </div>
      </div>

      {/* Right Column: Reset Form */}
      <div className="flex flex-col items-center justify-center bg-slate-900/5 p-6 sm:p-10 dark:bg-slate-950/20">
        <div className="w-full max-w-sm">
          {/* Logo on Mobile */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              <img
                src="/img/logo.png"
                alt="NCMC Library"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold">LMS Platform</h1>
          </div>

          <div className="mb-6 md:text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset password
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Please enter and confirm your new password below.
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
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          className="pr-10 pl-10"
                          {...field}
                        />
                        <KeyIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <button
                          type="button"
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          className="pr-10 pl-10"
                          {...field}
                        />
                        <KeyIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                        >
                          {showConfirmPassword ? (
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <Link
              to="/forgot-password"
              className="text-primary inline-flex items-center gap-2 font-medium hover:underline"
            >
              <ArrowLeftIcon className="size-4" /> Request new OTP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
