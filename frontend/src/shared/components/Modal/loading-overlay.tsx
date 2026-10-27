import { createPortal } from "react-dom";
import LottieRaw from "lottie-react";

// Handle ESM/CJS interop — the default export may be wrapped in a module namespace object
const Lottie =
  (LottieRaw as unknown as { default: typeof LottieRaw }).default || LottieRaw;
import { cn } from "@/shared/lib/utils";
import loadingAnimation from "@/assets/animated/book2.json";

interface LoadingOverlayProps {
  isOpen: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function LoadingOverlay({ isOpen, className }: LoadingOverlayProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-9999 flex items-center justify-center",
        "animate-in fade-in duration-200",
        className,
      )}
    >
      {/* Backdrop */}
      <div className="bg-primary/25 absolute inset-0 backdrop-blur-sm" />

      {/* Lottie Animation */}
      <div className="flex items-center justify-center">
        <Lottie
          animationData={loadingAnimation}
          loop
          autoplay
          className="h-30 w-30 sm:h-32 sm:w-32"
        />
      </div>

      {/* Animated dots bar */}
      {/* <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-blue-500 sm:h-2 sm:w-2"
              style={{
                animation: "pulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div> */}
    </div>,
    document.body,
  );
}
