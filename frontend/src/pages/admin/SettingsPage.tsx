import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Shield, Palette } from "lucide-react"

export function SettingsPage() {
  return (
    <div className="flex-1 space-y-4  pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" /> Notifications
            </CardTitle>
            <CardDescription>Control which notifications you receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifs" className="flex flex-col gap-1">
                <span>Email Notifications</span>
                <span className="text-xs font-normal text-muted-foreground">Receive updates via email about loan statuses.</span>
              </Label>
              <Switch id="email-notifs" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="system-notifs" className="flex flex-col gap-1">
                <span>System Alerts</span>
                <span className="text-xs font-normal text-muted-foreground">Get notified about overdue items in real-time.</span>
              </Label>
              <Switch id="system-notifs" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" /> Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex flex-col gap-1">
                <span>Glassmorphism Effects</span>
                <span className="text-xs font-normal text-muted-foreground">Enable high-quality transparency and blur effects.</span>
              </Label>
              <Switch id="dark-mode" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="compact-mode" className="flex flex-col gap-1">
                <span>Compact Sidebar</span>
                <span className="text-xs font-normal text-muted-foreground">Keep the sidebar collapsed by default.</span>
              </Label>
              <Switch id="compact-mode" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" /> Security & Privacy
            </CardTitle>
            <CardDescription>Manage your security preferences.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Password Management</h4>
              <p className="text-sm text-muted-foreground">It's a good idea to use a strong password that you don't use elsewhere.</p>
              <Button variant="outline">Change Password</Button>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Session History</h4>
              <p className="text-sm text-muted-foreground">See which devices are currently logged into your account.</p>
              <Button variant="outline">View Active Sessions</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
