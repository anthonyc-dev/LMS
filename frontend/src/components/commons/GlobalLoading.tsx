import Lottie from "lottie-react"
import booksAnimation from "@/assets/animated/Books.json"

export default function LoadingSpinner() {
    const LottieComponent = ((Lottie as unknown) as { default: typeof Lottie }).default || Lottie;
    return (
  <div className="flex flex-col h-svh w-full items-center justify-center bg-[#0f172a] gap-2">
    <div className="w-48 h-48 flex items-center justify-center">
      <LottieComponent animationData={booksAnimation} loop={true} />
    </div>
    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 select-none">
      <span>Loading</span>
      <span className="flex gap-0.5">
        <span className="animate-bounce inline-block" style={{ animationDelay: '0ms', animationDuration: '1s' }}>.</span>
        <span className="animate-bounce inline-block" style={{ animationDelay: '150ms', animationDuration: '1s' }}>.</span>
        <span className="animate-bounce inline-block" style={{ animationDelay: '300ms', animationDuration: '1s' }}>.</span>
      </span>
    </div>
  </div>
    )
}