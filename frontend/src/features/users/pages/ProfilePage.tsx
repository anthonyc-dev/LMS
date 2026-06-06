import { useState } from "react";
import { useAuthStore } from "@/app/store/authStore";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { Edit3, Camera } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

export function ProfilePage() {
  usePageTitle("Profile");
  const { user, updateUser } = useAuthStore();

  const role = user?.role ?? "student";

  // Editable field state — seeded from store
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Personal info fields
  const [firstName, setFirstName] = useState(
    () => (user?.fullName ?? "").split(" ")[0] ?? "",
  );
  const [lastName, setLastName] = useState(
    () => (user?.fullName ?? "").split(" ").slice(1).join(" ") ?? "",
  );
  const [dateOfBirth, setDateOfBirth] = useState("12-10-1990");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState("(+62) 821 2554-5846");

  // Address fields
  const [country, setCountry] = useState("Philippines");
  const [city, setCity] = useState("Cabanatuan City");
  const [postalCode, setPostalCode] = useState("3100");

  // const initials = (user?.fullName ?? "?")
  //   .split(" ")
  //   .map((n) => n[0])
  //   .join("")
  //   .toUpperCase()
  //   .slice(0, 2);

  const roleLabel =
    role === "admin" ? "Admin" : role === "faculty" ? "Faculty" : "Student";

  const handleSavePersonal = () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      toast.error("Name cannot be empty.");
      return;
    }
    updateUser({
      fullName,
      email: email.trim(),
    });
    setIsEditingPersonal(false);
    toast.success("Personal information updated!");
  };

  const handleCancelPersonal = () => {
    setFirstName((user?.fullName ?? "").split(" ")[0] ?? "");
    setLastName((user?.fullName ?? "").split(" ").slice(1).join(" ") ?? "");
    setEmail(user?.email ?? "");
    setIsEditingPersonal(false);
  };

  const handleSaveAddress = () => {
    setIsEditingAddress(false);
    toast.success("Address updated!");
  };

  const handleCancelAddress = () => {
    setIsEditingAddress(false);
  };

  // const [isLoggingOut, setIsLoggingOut] = useState(false);

  // const handleLogout = async () => {
  //   setIsLoggingOut(true);
  //   try {
  //     await api.post("/auth/logout");
  //   } catch {
  //     /* ignore */
  //   } finally {
  //     setIsLoggingOut(false);
  //   }
  //   logout();
  //   toast.success("Signed out successfully.");
  //   navigate("/login");
  // };

  return (
    <>
      {/* <LoadingOverlay
        isOpen={isLoggingOut}
        label="Signing Out"
        sublabel="Clearing your session..."
      /> */}
      <div className="mx-auto max-w-[1000px] space-y-6 pb-12">
        {/* Page Title */}
        <h1 className="text-lg font-semibold text-emerald-700">My Profile</h1>

        {/* Profile Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-5">
            {/* Avatar with camera badge */}
            <div className="group relative shrink-0">
              <Avatar className="h-20 w-20 shadow ring-2 ring-slate-100">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-amber-100 text-lg font-bold text-amber-700">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -right-0.5 bottom-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-white bg-emerald-600 text-white shadow-sm transition-colors hover:bg-emerald-700">
                <Camera className="size-3" />
              </button>
            </div>
            {/* Name & meta */}
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900">
                {user?.fullName ?? "User"}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">{roleLabel}</p>
              <p className="mt-0.5 text-sm text-slate-500">
                {city}, {country}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-emerald-700">
              Personal Information
            </h3>
            {isEditingPersonal ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={handleCancelPersonal}
                  className="h-8 cursor-pointer rounded-lg px-3 text-xs font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePersonal}
                  className="h-8 cursor-pointer rounded-lg bg-emerald-600 px-4 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                >
                  Save
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditingPersonal(true)}
                className="h-8 cursor-pointer rounded-lg bg-orange-500 px-4 text-xs font-medium text-white shadow-sm hover:bg-orange-600"
              >
                <Edit3 className="mr-1.5 size-3.5" />
                Edit
              </Button>
            )}
          </div>
          {/* Card Body */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* First Name */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400">First Name</p>
                {isEditingPersonal ? (
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-9 rounded-lg text-sm font-medium"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {firstName || "—"}
                  </p>
                )}
              </div>
              {/* Last Name */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400">Last Name</p>
                {isEditingPersonal ? (
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-9 rounded-lg text-sm font-medium"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {lastName || "—"}
                  </p>
                )}
              </div>
              {/* Date of Birth */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400">
                  Date of Birth
                </p>
                {isEditingPersonal ? (
                  <Input
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="h-9 rounded-lg text-sm font-medium"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {dateOfBirth || "—"}
                  </p>
                )}
              </div>
              {/* Email Address */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400">
                  Email Address
                </p>
                {isEditingPersonal ? (
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 rounded-lg text-sm font-medium"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.email ?? "—"}
                  </p>
                )}
              </div>
              {/* Phone Number */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400">
                  Phone Number
                </p>
                {isEditingPersonal ? (
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-9 rounded-lg text-sm font-medium"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {phoneNumber}
                  </p>
                )}
              </div>
              {/* User Role */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400">User Role</p>
                <p className="text-sm font-semibold text-slate-800 capitalize">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-emerald-700">
              Address
            </h3>
            {isEditingAddress ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={handleCancelAddress}
                  className="h-8 cursor-pointer rounded-lg px-3 text-xs font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAddress}
                  className="h-8 cursor-pointer rounded-lg bg-emerald-600 px-4 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                >
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditingAddress(true)}
                className="h-8 cursor-pointer rounded-lg border-slate-300 px-4 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Edit3 className="mr-1.5 size-3.5" />
                Edit
              </Button>
            )}
          </div>
          {/* Card Body */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Country */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400">Country</p>
                {isEditingAddress ? (
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-9 rounded-lg text-sm font-medium"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {country}
                  </p>
                )}
              </div>
              {/* City */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400">City</p>
                {isEditingAddress ? (
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-9 rounded-lg text-sm font-medium"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">{city}</p>
                )}
              </div>
              {/* Postal Code */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400">
                  Postal Code
                </p>
                {isEditingAddress ? (
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="h-9 rounded-lg text-sm font-medium"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {postalCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
