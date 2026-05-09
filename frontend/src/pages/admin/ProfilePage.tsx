import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, MapPin } from "lucide-react"

export function ProfilePage() {
  return (
    <div className="flex-1 space-y-4  pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Profile</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-32 w-32 ring-4 ring-blue-500/10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-3xl font-bold">A</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">Administrator</CardTitle>
            <CardDescription>admin@ncmc.edu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center text-sm text-muted-foreground gap-3">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Super Admin Access</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground gap-3">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>Main Library, NCMC</span>
            </div>
            <Button className="w-full mt-4" variant="outline">Edit Profile</Button>
          </CardContent>
        </Card>

        <Card className="col-span-2 border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>View and manage your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</p>
                <p className="font-medium">System Administrator</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Staff ID</p>
                <p className="font-medium">ADM-2026-001</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</p>
                <p className="font-medium">admin@ncmc.edu</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</p>
                <p className="font-medium">+63 (000) 000-0000</p>
              </div>
            </div>
            <div className="pt-6 border-t border-white/10">
              <h4 className="font-semibold mb-4">Security Settings</h4>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-white/20">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
