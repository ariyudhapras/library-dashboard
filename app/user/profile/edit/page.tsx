"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  Loader2,
  Upload,
  ArrowLeft,
  User,
  Save,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface UserProfile {
  id: number;
  memberId: string;
  name: string;
  email: string;
  address: string | null;
  phone: string | null;
  birthDate: string | null;
  profileImage: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced form schema with better validation
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must not exceed 100 characters" }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(255, { message: "Address must not exceed 255 characters" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(13, { message: "Phone number must not exceed 13 digits" })
    .regex(/^[0-9]{10,13}$/, {
      message: "Phone number must contain 10-13 digits only",
    }),
  birthDate: z.string().min(1, { message: "Birth date is required" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function UserProfileEditPage() {
  const { data: session, status: sessionStatus, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [fileInputKey, setFileInputKey] = useState<number>(Date.now());

  // Form setup with better defaults
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      birthDate: "",
    },
    mode: "onChange",
  });

  // Fetch user profile data
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo("Fetching profile data...");

    try {
      console.log("Fetching user profile...");
      const response = await fetch("/api/users/profile", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Authentication failed, redirecting to login");
          setDebugInfo("Authentication failed (401), redirecting to login...");
          router.push("/login");
          return;
        }

        const errorText = await response.text();
        const errorInfo = `Error response: ${response.status} - ${errorText}`;
        console.error(errorInfo);
        setDebugInfo(errorInfo);
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Profile data received:", data);
      setDebugInfo("Profile data received successfully");

      if (!data || !data.name) {
        throw new Error("Invalid profile data received");
      }

      setProfile(data);

      // Set form values
      form.reset({
        name: data.name,
        address: data.address || "",
        phone: data.phone || "",
        birthDate: data.birthDate
          ? format(new Date(data.birthDate), "yyyy-MM-dd")
          : "",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile data. Please try again.");
      setDebugInfo(
        `Error fetching profile: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle session status
  useEffect(() => {
    console.log("Session status:", sessionStatus);
    setDebugInfo(`Session status: ${sessionStatus}`);

    if (sessionStatus === "unauthenticated") {
      console.log("User is not authenticated, redirecting to login");
      setDebugInfo("User not authenticated, redirecting to login...");
      router.push("/login");
    } else if (sessionStatus === "authenticated") {
      console.log("User is authenticated, fetching profile");
      setDebugInfo(
        `User authenticated as ${session?.user?.email}, fetching profile...`
      );
      fetchProfile();
    }
  }, [sessionStatus, router, session]);

  // Handle profile update
  const onSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);
    setError(null);
    setDebugInfo("Submitting profile update...");

    try {
      // Additional validation
      if (
        values.phone &&
        !/^[0-9]{10,13}$/.test(values.phone.replace(/\D/g, ""))
      ) {
        throw new Error("Phone number must contain 10-13 digits only");
      }

      if (values.birthDate) {
        const birthDate = new Date(values.birthDate);
        if (isNaN(birthDate.getTime())) {
          throw new Error("Invalid birth date format");
        }
        if (birthDate > new Date()) {
          throw new Error("Birth date cannot be in the future");
        }
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          address: values.address,
          phone: values.phone,
          birthDate: values.birthDate
            ? new Date(values.birthDate).toISOString()
            : null,
          redirectTo: "/user/profile",
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error(
            "Authentication failed during update, redirecting to login"
          );
          setDebugInfo(
            "Authentication failed during update (401), redirecting to login..."
          );
          router.push("/login");
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      setDebugInfo("Profile updated successfully");
      if (update) {
        await update();
      }

      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been updated successfully.",
      });

      setTimeout(() => {
        router.push("/user/profile");
      }, 1000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setDebugInfo(
        `Error updating profile: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );

      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description:
          err instanceof Error
            ? err.message
            : "An error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Unsupported file format",
        description: "Please upload an image file (JPEG, PNG, WebP).",
      });
      setFileInputKey(Date.now());
      return;
    }

    // File size validation (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum file size is 2MB.",
      });
      setFileInputKey(Date.now());
      return;
    }

    setUploading(true);
    setError(null);
    setDebugInfo("Uploading profile image...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/users/profile/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error(
            "Authentication failed during image upload, redirecting to login"
          );
          setDebugInfo(
            "Authentication failed during image upload (401), redirecting to login..."
          );
          router.push("/login");
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      setDebugInfo("Profile image uploaded successfully");

      // Update profile with new image
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              profileImage: data.profileImage,
            }
          : null
      );

      if (update) {
        await update();
      }

      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (err) {
      console.error("Failed to upload profile image:", err);
      setDebugInfo(
        `Error uploading image: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );

      toast({
        variant: "destructive",
        title: "Failed to upload profile photo",
        description:
          err instanceof Error
            ? err.message
            : "An error occurred. Please try again.",
      });
    } finally {
      setUploading(false);
      setFileInputKey(Date.now());
    }
  };

  // Loading state while checking session
  if (sessionStatus === "loading") {
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

  // If not authenticated, redirect to login
  if (sessionStatus === "unauthenticated") {
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

  // Loading state while fetching profile
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

  // Error state
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
            onClick={() => router.push("/user/profile")}
            size="lg"
            className="text-base px-6 py-3"
          >
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto flex flex-col gap-8 p-6">
      {/* BACK TO PROFILE LINK */}
      <div className="mb-6">
        <Link
          href="/user/profile"
          className="flex items-center text-base text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Profile
        </Link>
      </div>

      {/* CONSISTENT HEADER */}
      <PageHeader
        title="Edit Profile"
        description="Update your personal information and account settings."
        variant="centered"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* ENHANCED PROFILE PHOTO SECTION */}
        <div className="lg:col-span-1">
          <Card className="shadow-xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold">Profile Photo</CardTitle>
              <CardDescription className="text-base">
                Upload a profile photo (max 2MB, JPEG/PNG/WebP)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                {profile?.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="w-20 h-20 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="w-full">
                <input
                  type="file"
                  id="profileImage"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageUpload}
                  key={fileInputKey}
                  disabled={uploading}
                />
                <label
                  htmlFor="profileImage"
                  className={`flex items-center justify-center gap-3 w-full py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-colors
                    ${
                      uploading
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white hover:bg-gray-50 hover:border-primary text-gray-700"
                    }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-base font-medium">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span className="text-base font-medium">
                        Upload Photo
                      </span>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ENHANCED FORM SECTION */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold">
                Personal Information
              </CardTitle>
              <CardDescription className="text-base">
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            className="text-base py-3 px-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your complete address"
                            className="text-base py-3 px-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            className="text-base py-3 px-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Birth Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="text-base py-3 px-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ENHANCED FORM BUTTONS */}
                  <div className="flex justify-end gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => router.push("/user/profile")}
                      className="text-base font-semibold px-8 py-4"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting || !form.formState.isDirty}
                      className="text-base font-semibold px-8 py-4"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-3" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
