import { useEffect, useRef, useState } from "react";
import { useScanVisit, type ScanResult } from "../api/visits";
import { Scan, UserCheck, LogOut, XCircle, Loader2, Clock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function ScanStationPage({ onClose }: { onClose: () => void }) {
  const scanMutation = useScanVisit();
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-focus input on mount and whenever we click anywhere
  useEffect(() => {
    inputRef.current?.focus();
    const handleGlobalClick = () => inputRef.current?.focus();
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // Clear result after 5 seconds
  useEffect(() => {
    if (lastResult || error) {
      const timer = setTimeout(() => {
        setLastResult(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastResult, error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || scanMutation.isPending) return;

    const barcode = inputValue.trim();
    setInputValue("");
    setError(null);
    setLastResult(null);

    scanMutation.mutate(barcode, {
      onSuccess: (data) => {
        setLastResult(data);
      },
      onError: (err: any) => {
        setError(
          err.response?.data?.message || "User not found or scan failed.",
        );
      },
    });
  };

  // Determine UI State
  const isIdle = !lastResult && !error && !scanMutation.isPending;
  const isEnter = lastResult?.action === "ENTER";
  const isExit = lastResult?.action === "EXIT";

  let bgColor = "bg-slate-900";
  if (isEnter) bgColor = "bg-green-600";
  if (isExit) bgColor = "bg-blue-600";
  if (error) bgColor = "bg-red-600";

  return (
    <div
      className={`flex h-screen w-full flex-col transition-colors duration-500 ease-in-out ${bgColor}`}
    >
      {/* Hidden input for barcode scanner */}
      <form onSubmit={handleSubmit} className="absolute top-[-100px] opacity-0">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
          autoComplete="off"
        />
      </form>

      {/* Header */}
      <header className="flex w-full items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
            <Scan className="size-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-wider text-white uppercase">
            Library Scan Station
          </h1>
        </div>
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={onClose}
        >
          <XCircle className="mr-2 size-4" /> Close Station
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="animate-in fade-in zoom-in-95 flex max-w-2xl flex-col items-center justify-center space-y-8 duration-500">
          {scanMutation.isPending ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="rounded-full bg-white/20 p-8 shadow-2xl backdrop-blur-xl">
                <Loader2 className="size-24 animate-spin text-white" />
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white">
                Processing...
              </h2>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="rounded-full bg-white/20 p-8 shadow-2xl backdrop-blur-xl">
                <XCircle className="size-24 text-white" />
              </div>
              <h2 className="text-5xl font-black tracking-tight text-white">
                Scan Failed
              </h2>
              <p className="text-xl font-medium text-white/80">{error}</p>
            </div>
          ) : lastResult ? (
            <div className="flex flex-col items-center space-y-8">
              <div className="rounded-full bg-white/20 p-10 shadow-2xl backdrop-blur-xl">
                {isEnter ? (
                  <UserCheck className="size-32 text-white" />
                ) : (
                  <LogOut className="size-32 text-white" />
                )}
              </div>
              <div className="space-y-4">
                <h2 className="text-6xl font-black tracking-tight text-white">
                  {isEnter ? "Welcome" : "Goodbye"},{" "}
                  {lastResult.user.fullName.split(" ")[0]}!
                </h2>
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-white/90">
                  <span className="rounded-lg bg-white/20 px-4 py-1 backdrop-blur-md">
                    {lastResult.user.schoolId}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-2">
                    <Clock className="size-5" />
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-8">
              <div className="relative flex items-center justify-center">
                <div className="absolute size-48 animate-ping rounded-full bg-blue-400/20" />
                <div className="z-10 rounded-full border border-white/20 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
                  <Scan className="size-24 text-blue-300" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-5xl font-black tracking-tight text-white">
                  Ready to Scan
                </h2>
                <p className="text-xl font-medium text-slate-300">
                  Please scan your ID barcode to enter or exit
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Hint */}
      {isIdle && (
        <footer className="p-8 text-center text-sm font-medium text-slate-400">
          Waiting for scanner input...
        </footer>
      )}
    </div>
  );
}
