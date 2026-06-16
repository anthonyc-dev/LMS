import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";

const ChromeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" x2="12" y1="8" y2="8" />
    <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
    <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
  </svg>
);

export function SettingsPage() {
  usePageTitle("Settings");

  return (
    <div className="mx-auto max-w-[800px] space-y-8 pb-12 font-sans">
      {/* Page Title */}
      <h1 className="text-lg font-semibold text-blue-700">Settings</h1>
      {/* Account Security Card */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="px-6 py-5">
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
            Account security
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Set up security measure for better protection
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col p-0">
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5 transition-colors hover:bg-slate-50/50">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                Email
              </span>
              <span className="text-sm text-slate-600">
                alberto@twoleet.com
              </span>
            </div>
            <Button
              variant="outline"
              className="h-9 cursor-pointer rounded-md border-slate-200 px-4 text-[13px] font-semibold text-slate-900 shadow-none hover:bg-slate-100"
            >
              Change email
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5 transition-colors hover:bg-slate-50/50">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                Password
              </span>
              <span className="text-sm text-slate-600">
                Ensure your account is using a long, random password to stay
                secure
              </span>
            </div>
            <Button
              variant="outline"
              className="h-9 cursor-pointer rounded-md border-slate-200 px-4 text-[13px] font-semibold text-slate-900 shadow-none hover:bg-slate-100"
            >
              Change password
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5 transition-colors hover:bg-slate-50/50">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-slate-900">
                  2-step verification
                </span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  Enabled
                </span>
              </div>
              <span className="text-sm text-slate-600">
                An extra layer of protection to your Oneleet account during
                login
              </span>
            </div>
            <Button
              variant="outline"
              className="h-9 cursor-pointer rounded-md border-slate-200 px-4 text-[13px] font-semibold text-slate-900 shadow-none hover:bg-slate-100"
            >
              Change method
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5 transition-colors hover:bg-slate-50/50">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                Recovery codes
              </span>
              <span className="text-sm text-slate-600">
                Generated Nov 23, 2024
              </span>
            </div>
            <Button
              variant="outline"
              className="h-9 cursor-pointer rounded-md border-slate-200 px-4 text-[13px] font-semibold text-slate-900 shadow-none hover:bg-slate-100"
            >
              Regenerate codes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Card */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between px-6 py-5 sm:items-center">
          <div className="space-y-1.5">
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
              Sessions
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Places where you're logged into Oneleet
            </CardDescription>
          </div>
          <Button
            variant="outline"
            className="h-9 cursor-pointer rounded-md border-slate-200 px-4 text-[13px] font-semibold text-slate-900 shadow-none hover:bg-slate-100"
          >
            Sign out all other sessions
          </Button>
        </CardHeader>

        <CardContent className="px-6 pt-2 pb-6">
          <div className="space-y-6">
            {/* Current Session */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/50">
                  {/* Custom icon placeholder for Arc */}
                  <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                    <div className="absolute h-full w-full rounded border-2 border-red-500 bg-blue-500 opacity-80 mix-blend-multiply" />
                    <span className="relative z-10 text-[10px] font-bold text-white">
                      A
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold tracking-tight text-slate-900">
                    Arc on macOS
                  </span>
                  <span className="text-xs text-slate-500">
                    <span className="font-medium tracking-tight text-blue-600">
                      • Current session
                    </span>{" "}
                    · Berlin, DE
                  </span>
                </div>
              </div>
              <button className="cursor-pointer text-[13px] font-medium text-slate-700 transition-colors hover:text-slate-900">
                Sign out
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-[13px] font-bold tracking-tight text-slate-900">
                3 other sessions
              </h3>
              <div className="flex flex-col gap-3">
                {/* Other session 1 */}
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50/80 ring-1 ring-red-100">
                      <div className="flex h-[22px] w-[22px] items-center justify-center rounded bg-red-500 text-[10px] font-bold text-white shadow-sm">
                        1L
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold tracking-tight text-slate-900">
                        Oneleet Agent
                      </span>
                      <span className="text-xs text-slate-500">
                        Last seen 30 mins ago · Berlin, DE
                      </span>
                    </div>
                  </div>
                  <button className="cursor-pointer text-[13px] font-medium text-slate-700 transition-colors hover:text-slate-900">
                    Sign out
                  </button>
                </div>

                {/* Other session 2 */}
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-100">
                      <ChromeIcon className="size-[22px] text-yellow-500/90" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold tracking-tight text-slate-900">
                        Chrome
                      </span>
                      <span className="text-xs text-slate-500">
                        Last seen 2 months ago · Barcelona, ES
                      </span>
                    </div>
                  </div>
                  <button className="cursor-pointer text-[13px] font-medium text-slate-700 transition-colors hover:text-slate-900">
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
