import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2Icon, ArrowLeftIcon, MailIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import api from "@/lib/axios";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/lib/schemas";

export function ForgotPassword() {
    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const navigate = useNavigate();

    const form = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
        mode: "onChange",
    });

    const isSubmittingEmail = form.formState.isSubmitting;

    const handleRequestOtp = async (data: ForgotPasswordSchema) => {
        try {
            await api.post("/auth/forgot-password", data);
            setEmail(data.email);
            setStep("otp");
            toast.success("An OTP has been sent to your email.");
        } catch (error: any) {
            console.error("Forgot password request failed:", error);
            toast.error(
                error.response?.data?.message || "Something went wrong. Please try again."
            );
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error("Please enter the complete 6-digit OTP.");
            return;
        }

        setIsVerifyingOtp(true);
        try {
            const response = await api.post("/auth/verify-otp", { otp });
            toast.success(response.data.message || "OTP verified successfully!");
            // Redirect to ResetPassword page
            navigate("/reset-password");
        } catch (error: any) {
            console.error("OTP verification failed:", error);
            toast.error(
                error.response?.data?.message || "Invalid OTP code. Please try again."
            );
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        try {
            await api.post("/auth/forgot-password", { email });
            toast.success("OTP has been resent to your email.");
            setOtp("");
        } catch (error: any) {
            console.error("Resending OTP failed:", error);
            toast.error(
                error.response?.data?.message || "Could not resend OTP. Please try again."
            );
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Left Column: Cover & Brand Info */}
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
                        LMS Platform
                    </h2>
                    <p className="text-white/80 text-lg leading-relaxed">
                        Secure, premium access for administrators, students, and faculty members.
                    </p>
                </div>
            </div>

            {/* Right Column: Form Wizard */}
            <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-slate-900/5 dark:bg-slate-950/20">
                <div className="w-full max-w-sm">
                    {/* Logo on Mobile */}
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
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {step === "email" ? "Forgot your password?" : "Verify your OTP"}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {step === "email"
                                ? "Enter your email address to receive a one-time password code."
                                : `We sent a 6-digit OTP code to ${email}`}
                        </p>
                    </div>

                    {step === "email" ? (
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(handleRequestOtp)}
                                className="space-y-5"
                                noValidate
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="email"
                                                        placeholder="your@gmail.com"
                                                        className="pl-10"
                                                        {...field}
                                                    />
                                                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmittingEmail}
                                >
                                    {isSubmittingEmail ? (
                                        <>
                                            <Loader2Icon className="mr-2 size-4 animate-spin" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        "Send OTP Code"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <Label className="text-center font-bold">OTP Code</Label>
                                <div className="flex justify-center w-full">
                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={setOtp}
                                        disabled={isVerifyingOtp}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isVerifyingOtp || otp.length !== 6}
                                >
                                    {isVerifyingOtp ? (
                                        <>
                                            <Loader2Icon className="mr-2 size-4 animate-spin" />
                                            Verifying OTP...
                                        </>
                                    ) : (
                                        "Verify Code"
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={isResending}
                                    onClick={handleResendOtp}
                                >
                                    {isResending ? (
                                        <>
                                            <Loader2Icon className="mr-2 size-4 animate-spin" />
                                            Resending...
                                        </>
                                    ) : (
                                        "Resend OTP"
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => {
                                        setStep("email");
                                        setOtp("");
                                    }}
                                >
                                    <ArrowLeftIcon className="mr-2 size-4" />
                                    Back to email
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 text-center text-sm">
                        <Link
                            to="/login"
                            className="font-medium text-primary hover:underline inline-flex items-center gap-2"
                        >
                            <ArrowLeftIcon className="size-4" /> Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
