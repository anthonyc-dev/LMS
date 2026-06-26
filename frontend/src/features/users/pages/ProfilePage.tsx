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
  const [firstName, setFirstName] = useState(user?.fullName ?? "");
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
    const fullName = `${firstName}`;
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
        <h1 className="text-lg font-semibold">My Profile</h1>
        {/* Profile Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {/* Avatar with camera badge */}
              <div className="group relative shrink-0">
                <Avatar className="h-20 w-20 shadow ring-2 ring-slate-100">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-slate-100 text-lg font-bold text-slate-700">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -right-0.5 bottom-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-white bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700">
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

            {/* Large Scannable Barcode */}
            {user?.barcode && (
              <div className="border-slate-150 flex shrink-0 flex-col items-center gap-1.5 rounded-xl border bg-slate-50/50 px-4 py-2.5 shadow-xs transition-all duration-200 hover:shadow-sm">
                <div className="flex w-full max-w-[240px] items-center justify-center rounded-lg border border-slate-200/60 bg-white p-2">
                  <img
                    src={user.barcode}
                    alt={`Barcode for ${user.schoolId}`}
                    className="h-12 w-auto object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Digital Library ID Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-base font-semibold">Digital Library Card</h3>
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
            {/* The Library ID Card */}
            <div className="group relative flex aspect-[1.586/1] w-full max-w-[340px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-blue-700/35 bg-linear-to-br from-blue-800 via-blue-950 to-slate-900 p-4 text-white shadow-md transition-all duration-300 select-none hover:scale-[1.01] hover:shadow-lg">
              {/* Glossy sheen */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent" />
              {/* Watermark decors */}
              <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-blue-500/10 blur-xl" />
              <div className="pointer-events-none absolute -top-6 -left-6 h-28 w-28 rounded-full bg-teal-500/10 blur-xl" />

              {/* Card Top */}
              <div className="z-10 flex items-start justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                    LMS Library Card
                  </p>
                  <p className="text-[8px] font-medium tracking-wider text-blue-200/50 uppercase">
                    Official Library ID
                  </p>
                </div>
                <div className="rounded-full border border-blue-500/20 bg-blue-950/40 px-2 py-0.5 text-[9px] font-semibold text-blue-400/80">
                  ACTIVE
                </div>
              </div>

              {/* Card Middle (User Info - Read Only) */}
              <div className="z-10 my-1.5 flex items-center gap-3">
                <Avatar className="h-12 w-12 shrink-0 shadow-sm ring-2 ring-blue-400/20">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-blue-950 text-xs font-bold text-blue-300">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="truncate text-xs font-bold tracking-wide text-blue-50">
                    {user?.fullName ?? "Member Name"}
                  </h3>
                  <p className="mt-0.5 text-[9px] font-semibold tracking-wider text-blue-300/70 uppercase">
                    {roleLabel}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-blue-200/40">
                    ID: {user?.schoolId || "—"}
                  </p>
                </div>
              </div>

              {/* Card Bottom (Barcode) */}
              {user?.barcode ? (
                <div className="z-10 flex flex-col items-center justify-center rounded bg-white/95 p-1 shadow-sm">
                  <img
                    src={user.barcode}
                    alt={`Barcode for ${user.schoolId}`}
                    className="h-6 w-full object-contain mix-blend-multiply"
                  />
                </div>
              ) : (
                <div className="z-10 flex h-8 items-center justify-center rounded border border-dashed border-blue-600/30 bg-blue-950/20">
                  <span className="text-[10px] font-medium text-blue-300/40">
                    No Barcode Available
                  </span>
                </div>
              )}
            </div>

            {/* Description / Instructions */}
            <div className="w-full flex-1 space-y-4 pt-2">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/10 ring-inset">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                  Active Library Account
                </span>
                <h4 className="text-base font-bold text-slate-800">
                  Digital Membership Pass
                </h4>
                <p className="max-w-lg text-sm leading-relaxed text-slate-500">
                  This pass contains your unique barcode mapped directly to your{" "}
                  <strong>School ID ({user?.schoolId})</strong> in the LMS
                  database. Present this card on your device screen at checkout
                  counters or scan kiosks to borrow books.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold">Personal Information</h3>
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
                  className="h-8 cursor-pointer rounded-lg bg-blue-600 px-4 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
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
              {/* School ID */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400">School ID</p>
                <p className="text-sm font-semibold text-slate-800">
                  {user?.schoolId || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold">Address</h3>
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
                  className="h-8 cursor-pointer rounded-lg bg-blue-600 px-4 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
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
