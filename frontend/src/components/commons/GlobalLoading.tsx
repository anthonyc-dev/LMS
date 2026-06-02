import Lottie from "lottie-react";
import booksAnimation from "@/assets/animated/Books.json";

export default function LoadingSpinner() {
  const LottieComponent =
    (Lottie as unknown as { default: typeof Lottie }).default || Lottie;
  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-2 bg-[#0f172a]">
      <div className="flex h-40 w-40 items-center justify-center">
        <LottieComponent animationData={booksAnimation} loop={true} />
      </div>
      <div className="flex items-center gap-1 text-xs font-bold tracking-widest text-slate-400 uppercase select-none">
        <span>Loading</span>
        <span className="flex gap-0.5">
          <span
            className="inline-block animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "1s" }}
          >
            .
          </span>
          <span
            className="inline-block animate-bounce"
            style={{ animationDelay: "150ms", animationDuration: "1s" }}
          >
            .
          </span>
          <span
            className="inline-block animate-bounce"
            style={{ animationDelay: "300ms", animationDuration: "1s" }}
          >
            .
          </span>
        </span>
      </div>
    </div>
  );
}
