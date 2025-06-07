"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Edit,
  Printer,
  QrCode,
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { generateMemberCardHTML } from "@/lib/utils";
import { useRouter } from "next/navigation";

type UserProfile = {
  name: string;
  email: string;
  role: string;
  memberId: string;
  profileImage?: string;
  address?: string;
  phone?: string;
  birthDate?: string;
  createdAt: string;
  status?: string;
};

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [incompleteFields, setIncompleteFields] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    if (status !== "authenticated") {
      console.log("Skip fetching profile: not authenticated");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDebugInfo("Fetching profile data...");
      console.log("Fetching profile data...");

      const response = await fetch("/api/users/profile", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorInfo = `Error response: ${response.status} - ${errorText}`;
        console.error(errorInfo);
        setDebugInfo(errorInfo);
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      console.log("Profile data received:", data);
      setDebugInfo("Profile data received successfully");

      if (!data || !data.name) {
        throw new Error("Invalid profile data received - missing fields");
      }

      setProfile(data);

      const incomplete = [];
      if (!data.address) incomplete.push("address");
      if (!data.phone) incomplete.push("phone number");
      if (!data.birthDate) incomplete.push("birth date");
      if (!data.profileImage) incomplete.push("profile photo");

      setIncompleteFields(incomplete);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching profile:", error);
      setError(`Failed to load profile data: ${errorMessage}`);
      setDebugInfo(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    console.log("Session status changed:", status);
    setDebugInfo(`Session status: ${status}`);

    if (status === "authenticated") {
      console.log("User is authenticated, fetching profile");
      setDebugInfo(
        `User authenticated as ${session?.user?.email}, fetching profile...`
      );
      fetchProfile();
    } else if (status === "unauthenticated") {
      console.log("User is not authenticated, redirecting to login");
      setDebugInfo("User not authenticated, redirecting to login...");
      router.push("/login");
    }
  }, [status, fetchProfile, router, session]);

  const handlePrintCard = () => {
    if (!profile) return;

    try {
      const htmlContent = generateMemberCardHTML(profile);

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      const printWindow = window.open(url, "_blank");

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
      } else {
        console.error("Popup blocked. Allow popups to print member card.");
      }
    } catch (err) {
      console.error("Failed to print card:", err);
    }
  };

  const handleShowQR = () => {
    if (!profile?.memberId) return;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${profile.memberId}`;
    window.open(qrUrl, "_blank");
  };

  const qrCodeUrl = profile?.memberId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${profile.memberId}`
    : null;

  const refreshSession = () => {
    console.log("Attempting to refresh session...");
    setLoading(true);
    setError(null);
    setDebugInfo("Refreshing session...");

    setTimeout(() => {
      fetchProfile();
    }, 1000);
  };

  const handleLogout = () => {
    console.log("Logging out and redirecting to login page...");
    signOut({ callbackUrl: "/login" });
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600">
            Checking authentication status...
          </p>
          <p className="text-sm text-gray-400">{debugInfo}</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600">Redirecting to login...</p>
          <p className="text-sm text-gray-400">{debugInfo}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600">Loading profile data...</p>
          <p className="text-sm text-gray-400">{debugInfo}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mx-auto flex flex-col gap-8 p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
          <AlertDescription className="text-base">{error}</AlertDescription>
        </Alert>
        <div className="text-sm text-gray-500 mb-4">{debugInfo}</div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchProfile();
            }}
            size="lg"
            className="text-base px-6 py-3"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={refreshSession}
            size="lg"
            className="text-base px-6 py-3"
          >
            Refresh Session
          </Button>
          <Button
            variant="secondary"
            onClick={handleLogout}
            size="lg"
            className="text-base px-6 py-3"
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full mx-auto flex flex-col gap-8 p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
          <AlertDescription className="text-base">
            Profile data not found. Please try again.
          </AlertDescription>
        </Alert>
        <div className="text-sm text-gray-500 mb-4">{debugInfo}</div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setLoading(true);
              fetchProfile();
            }}
            size="lg"
            className="text-base px-6 py-3"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={refreshSession}
            size="lg"
            className="text-base px-6 py-3"
          >
            Refresh Session
          </Button>
          <Button
            variant="secondary"
            onClick={handleLogout}
            size="lg"
            className="text-base px-6 py-3"
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto flex flex-col gap-8 p-6">
      {/* CONSISTENT HEADER */}
      <PageHeader
        title="My Profile"
        description="Manage your account information and settings."
        variant="centered"
      />

      {/* EDIT PROFILE BUTTON */}
      <div className="flex justify-center">
        <Link href="/user/profile/edit">
          <Button size="lg" className="text-base font-semibold px-8 py-4">
            <Edit className="h-5 w-5 mr-3" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* INCOMPLETE PROFILE ALERT */}
      {incompleteFields.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200 shadow-lg">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-lg font-semibold text-amber-800">
            Profile Incomplete
          </AlertTitle>
          <AlertDescription className="text-base text-amber-700">
            Please complete your profile by adding:{" "}
            {incompleteFields.join(", ")}.
            <div className="mt-4">
              <Link href="/user/profile/edit">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base font-semibold px-6 py-3 text-amber-700 border-amber-300 hover:bg-amber-100"
                >
                  Complete Profile
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* ENHANCED MEMBER CARD */}
      <Card className="shadow-xl border border-gray-200">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Digital Member Card
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Member ID:{" "}
            <span className="font-semibold text-primary">
              {profile?.memberId}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="membership-card flex flex-col lg:flex-row gap-8 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            {/* PROFILE IMAGE SECTION */}
            <div className="flex-shrink-0 flex items-center justify-center">
              {profile?.profileImage ? (
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                  <Image
                    src={profile.profileImage}
                    alt={profile?.name || "Profile"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-primary shadow-lg">
                  <span className="text-5xl font-bold text-gray-500">
                    {profile?.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>

            {/* PROFILE INFO SECTION */}
            <div className="flex-grow space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  {profile?.name}
                </h3>
                <div className="px-4 py-2 bg-blue-600 text-white text-base font-semibold rounded-full">
                  {profile?.memberId}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="h-5 w-5" />
                    <span className="text-base font-medium">Email</span>
                  </div>
                  <p className="text-lg text-gray-900 pl-8">{profile?.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span className="text-base font-medium">Member Since</span>
                  </div>
                  <p className="text-lg text-gray-900 pl-8">
                    {profile?.createdAt
                      ? format(new Date(profile.createdAt), "MMMM dd, yyyy", {
                          locale: enUS,
                        })
                      : "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="h-5 w-5" />
                    <span className="text-base font-medium">Address</span>
                  </div>
                  <p className="text-lg text-gray-900 pl-8">
                    {profile?.address || "Not provided"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-5 w-5" />
                    <span className="text-base font-medium">Phone</span>
                  </div>
                  <p className="text-lg text-gray-900 pl-8">
                    {profile?.phone || "Not provided"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-600">
                    <User className="h-5 w-5" />
                    <span className="text-base font-medium">Birth Date</span>
                  </div>
                  <p className="text-lg text-gray-900 pl-8">
                    {profile?.birthDate
                      ? format(new Date(profile.birthDate), "MMMM dd, yyyy", {
                          locale: enUS,
                        })
                      : "Not provided"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Shield className="h-5 w-5" />
                    <span className="text-base font-medium">Role</span>
                  </div>
                  <p className="text-lg text-gray-900 pl-8 capitalize">
                    {profile?.role || "Member"}
                  </p>
                </div>
              </div>
            </div>

            {/* QR CODE SECTION */}
            {qrCodeUrl && (
              <div className="flex-shrink-0 flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 bg-white p-2 rounded-xl border border-gray-200 shadow-md">
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code"
                    width={120}
                    height={120}
                    className="w-full h-full"
                  />
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  Scan for verification
                </span>
              </div>
            )}
          </div>
        </CardContent>

        {/* ENHANCED FOOTER BUTTONS */}
        <CardFooter className="flex justify-end gap-4 pt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrintCard}
            disabled={incompleteFields.length > 0}
            className="text-base font-semibold px-6 py-3"
          >
            <Printer className="h-5 w-5 mr-3" />
            Print Card
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleShowQR}
            className="text-base font-semibold px-6 py-3"
          >
            <QrCode className="h-5 w-5 mr-3" />
            Show QR Code
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
