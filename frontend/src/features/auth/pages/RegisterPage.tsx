import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import {
  registerSchema,
  type RegisterSchema,
} from "@/features/auth/validations/schemas";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

export function RegisterPage() {
  usePageTitle("Register");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const {
    data: meta,
    isLoading: isLoadingMeta,
    isError: isMetaError,
  } = useQuery({
    queryKey: ["usersMeta"],
    queryFn: async () => {
      try {
        const res = await api.get("/users/meta");
        return res.data;
      } catch (error) {
        console.error("Failed to fetch meta:", error);
        throw error;
      }
    },
  });

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      schoolId: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      department: "",
      yearLevel: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: RegisterSchema) => {
    const { confirmPassword: _confirmPassword, ...payload } = data;

    try {
      await api.post("/auth/register", payload);
      toast.success("Account created successfully! Please sign in.");
      navigate("/login");
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden p-10 lg:flex lg:flex-col">
        <img
          src="/img/register.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/60 to-transparent" />
        <div className="relative z-10 flex max-w-md flex-col items-center text-center">
          <h2 className="mb-3 text-3xl font-bold text-white">
            Join Our Community
          </h2>
          <p className="text-lg leading-relaxed text-white/80">
            Start your learning journey today. Get access to world-class
            courses, expert instructors, and a supportive community.
          </p>
          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4 text-white"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              </div>
              <span className="text-sm text-white/90">
                Free access to introductory courses
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4 text-white"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              </div>
              <span className="text-sm text-white/90">
                Personalized learning paths
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4 text-white"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              </div>
              <span className="text-sm text-white/90">
                Certificate upon completion
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex size-32 shrink-0 items-center justify-center overflow-hidden">
              <img
                src="/img/logo.png"
                alt="NCMC Library"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Fill in the details below to get started
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="grid grid-cols-2 items-start gap-4">
                <FormField
                  control={form.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School ID</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="21-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="yearLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          disabled={isLoadingMeta || isMetaError}
                          className="h-auto min-h-9 w-full text-left whitespace-normal [&>span]:line-clamp-none"
                        >
                          <SelectValue
                            placeholder={
                              isLoadingMeta
                                ? "Loading..."
                                : isMetaError
                                  ? "Error loading"
                                  : "Select Year Level"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {meta?.yearLevels?.map(
                          (yl: { value: string; label: string }) => (
                            <SelectItem
                              key={yl.value}
                              value={yl.label}
                              className="wrap-break-word whitespace-normal [&>span]:whitespace-normal"
                            >
                              {yl.label}
                            </SelectItem>
                          ),
                        )}
                        {!meta?.yearLevels?.length && !isLoadingMeta && (
                          <div className="text-muted-foreground p-2 text-center text-sm">
                            No options available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          disabled={isLoadingMeta || isMetaError}
                          className="h-auto min-h-9 w-full text-left whitespace-normal [&>span]:line-clamp-none"
                        >
                          <SelectValue
                            placeholder={
                              isLoadingMeta
                                ? "Loading..."
                                : isMetaError
                                  ? "Error loading"
                                  : "Select Department"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {meta?.departments?.map(
                          (dept: { value: string; label: string }) => (
                            <SelectItem
                              key={dept.value}
                              value={dept.label}
                              className="wrap-break-word whitespace-normal [&>span]:whitespace-normal"
                            >
                              {dept.label}
                            </SelectItem>
                          ),
                        )}
                        {!meta?.departments?.length && !isLoadingMeta && (
                          <div className="text-muted-foreground p-2 text-center text-sm">
                            No options available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@gmail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="0912345678" {...field} />
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
                          placeholder="Create a password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          aria-label="Toggle password visibility"
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
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          aria-label="Toggle password visibility"
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
              <FormField
                control={form.control}
                name="acceptedTerms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-2">
                      <FormControl>
                        <Checkbox
                          id="terms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <label
                        htmlFor="terms"
                        className="text-sm leading-snug font-normal sm:flex-1 sm:leading-normal"
                      >
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
