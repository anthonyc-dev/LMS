import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Add login logic here
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:flex lg:flex-col items-center justify-center p-10 overflow-hidden">
        <img
          src="/img/login.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <div className="flex shrink-0 items-center justify-center rounded-lg overflow-hidden size-28">
            <img
              src="/img/logo.png"
              alt="NCMC Library"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-5xl font-bold text-white mb-3">
            Hybrid Library System for{" "}
            <span className="text-secondary">NCMCians</span>
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            A modern solution designed to transform the institution&apos;s
            library operations.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm text-white/70">Courses</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <div className="text-2xl font-bold text-white">10k+</div>
              <div className="text-sm text-white/70">Students</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-sm text-white/70">Success</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-8 lg:hidden">
            <div className="flex shrink-0 items-center justify-center rounded-lg overflow-hidden size-20">
              <img
                src="/img/logo.png"
                alt="NCMC Library"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold">LMS Platform</h1>
          </div>
          <div className="mb-6 md:text-center">
            <h1 className="text-2xl font-semibold tracking-tight lg:hidden">
              Welcome back
            </h1>
            <h1 className="text-2xl font-semibold tracking-tight hidden lg:block">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@gmail.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me for 30 days
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Don&apos;t have an account?{" "}
            </span>
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
          <div className="mt-4 text-center">
            <Link
              to="/admin/dashboard"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Dev Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
