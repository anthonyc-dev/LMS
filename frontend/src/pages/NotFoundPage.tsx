import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="from-primary/90 via-primary to-primary/80 relative flex min-h-svh flex-col items-center justify-center bg-linear-to-br p-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
      <div className="relative z-10 flex max-w-md flex-col items-center justify-center gap-6 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-8 text-white"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-white">404</h1>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          Page not found
        </h2>
        <p className="mt-3 leading-relaxed text-white/80">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been removed or renamed.
        </p>
        <Link
          to="/login"
          className="text-primary rounded-md bg-white px-6 py-2.5 text-sm font-medium shadow transition-colors hover:bg-white/90"
        >
          <ArrowLeftIcon className="mr-2 inline-block size-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
