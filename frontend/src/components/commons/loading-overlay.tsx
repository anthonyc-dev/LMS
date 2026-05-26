import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isOpen: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function LoadingOverlay({
  isOpen,
  label = "Loading...",
  sublabel,
  className,
}: LoadingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-9999 flex items-center justify-center",
        "animate-in fade-in duration-200",
        className,
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative z-10 flex flex-col items-center gap-6 rounded-3xl border border-white/20 bg-white px-10 py-10 shadow-2xl sm:px-14 sm:py-12">
        {/* Spinner Container */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Outer pulsing ring */}
          <div className="absolute h-20 w-20 animate-ping rounded-full bg-indigo-500/10 duration-1000 sm:h-24 sm:w-24" />

          {/* Middle rotating ring */}
          <div
            className="absolute h-16 w-16 animate-spin rounded-full border-[3px] border-transparent border-t-indigo-500 border-r-indigo-300 sm:h-20 sm:w-20"
            style={{ animationDuration: "1s" }}
          />

          {/* Inner rotating ring (opposite direction) */}
          <div
            className="absolute h-10 w-10 rounded-full border-[3px] border-transparent border-b-violet-500 border-l-violet-300 sm:h-12 sm:w-12"
            style={{ animation: "spin 1.5s linear infinite reverse" }}
          />

          {/* Center dot */}
          <div className="h-3 w-3 animate-pulse rounded-full bg-indigo-600 shadow-lg shadow-indigo-400 sm:h-4 sm:w-4" />
        </div>

        {/* Labels */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-base font-black tracking-tight text-slate-900 sm:text-lg">
            {label}
          </p>
          {sublabel && (
            <p className="max-w-[200px] text-xs font-medium text-slate-400 sm:text-sm">
              {sublabel}
            </p>
          )}
        </div>

        {/* Animated dots bar */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-indigo-500 sm:h-2 sm:w-2"
              style={{
                animation: "pulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
