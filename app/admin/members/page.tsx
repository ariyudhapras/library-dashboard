"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Users,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  Loader2,
  Calendar,
  Mail,
  Hash,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import * as z from "zod";

interface User {
  id: number;
  memberId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  profileImage?: string | null; // Added profileImage field
  createdAt: string;
  updatedAt: string;
}

// Enhanced form validation schema with English messages
const userFormSchema = z.object({
  id: z.number(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Enhanced Avatar Component for Members Management
interface MemberAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
}

const MemberAvatar = ({ user, size = "md" }: MemberAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-12 w-12 sm:h-14 sm:w-14 text-base sm:text-lg",
    lg: "h-16 w-16 text-xl",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // If user has profileImage, show real photo
  if (user.profileImage && user.profileImage.trim() !== "") {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-md flex-shrink-0 border-2 border-white relative`}
      >
        <img
          src={user.profileImage}
          alt={`${user.name}'s profile`}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="${
                  sizeClasses[size]
                } bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span class="text-white font-bold">${getInitials(
                    user.name
                  )}</span>
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  // If no profileImage, show initials
  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0`}
    >
      <span className="text-white font-bold">{getInitials(user.name)}</span>
    </div>
  );
};

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AdminMembersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();

  // Enhanced form setup
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      id: 0,
      name: "",
      email: "",
      role: "user",
      status: "active",
      createdAt: "",
      updatedAt: "",
    },
  });

  // Function to fetch users
  const fetchUsers = async (search: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/users${search ? `?search=${search}` : ""}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setEditingUser(user);
    form.reset({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "user",
      status: user.status as "active" | "inactive",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/users?id=${deletingUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      // Remove user from the list
      setUsers(users.filter((user) => user.id !== deletingUser.id));
      setIsDeleteDialogOpen(false);

      toast({
        title: "Member deleted successfully",
        description: "The member has been removed from the system.",
      });
    } catch (err) {
      console.error("Failed to delete user:", err);

      toast({
        variant: "destructive",
        title: "Failed to delete member",
        description:
          err instanceof Error
            ? err.message
            : "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: values.id,
          name: values.name,
          role: values.role,
          status: values.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      const updatedUser = await response.json();

      // Update user in the list
      setUsers(
        users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );

      setIsEditDialogOpen(false);

      toast({
        title: "Member updated successfully",
        description: "Changes have been saved successfully.",
      });
    } catch (err) {
      console.error("Failed to update user:", err);

      toast({
        variant: "destructive",
        title: "Failed to update member",
        description:
          err instanceof Error
            ? err.message
            : "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-6 sm:gap-8 p-4 sm:p-6">
      {/* ENHANCED HEADER - Matching User Style */}
      <div className="relative flex flex-col sm:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl lg:rounded-2xl shadow-lg mb-4 sm:mb-6">
        <div className="flex flex-col items-center text-center flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-900 mb-2 sm:mb-4 leading-tight">
            Members Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 font-light px-2">
            Manage library members and their permissions.
          </p>
        </div>
      </div>

      {/* ENHANCED SEARCH SECTION */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by name, email, or member ID..."
              className="pl-10 text-base py-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="text-base px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* ENHANCED TABLE WITH BETTER STYLING */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg bg-white">
        {error && (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-lg text-red-600 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-lg text-gray-600">Loading members data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* No users message */}
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No Members Found
                </h3>
                <p className="text-base text-gray-600">
                  No members match your search criteria.
                </p>
              </div>
            ) : (
              /* Enhanced Users table */
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900">
                      Member Details
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Member ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Role
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Registration Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Status
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-900">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        {/* ENHANCED MEMBER DETAILS - Using Real Avatar */}
                        <div className="flex items-center gap-4 sm:gap-6">
                          <MemberAvatar user={user} size="md" />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                              {user.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-full font-semibold">
                            {user.memberId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.role === "admin" ? (
                            <Shield className="h-4 w-4 text-purple-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-blue-600" />
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role === "admin" ? "Administrator" : "Member"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              user.status === "active"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          {user.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 sm:gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="text-sm sm:text-base px-3 sm:px-4 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                          >
                            <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            className="text-sm sm:text-base px-3 sm:px-4 py-2 transition-all duration-200 hover:shadow-lg"
                          >
                            <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </div>

      {/* ENHANCED EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Member</DialogTitle>
            <DialogDescription className="text-base">
              Update member information and permissions.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              {/* Member Avatar Preview */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <MemberAvatar user={editingUser!} size="lg" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingUser?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Member ID: {editingUser?.memberId}
                  </p>
                </div>
              </div>

              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<UserFormValues, "name">;
                }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="text-base py-3" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field (Read-only) */}
              <FormField
                control={form.control}
                name="email"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<UserFormValues, "email">;
                }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-gray-50 text-base py-3"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Field */}
              <FormField
                control={form.control}
                name="role"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<UserFormValues, "role">;
                }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Role
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={
                        // Disable if user is trying to edit themselves and they're the only admin
                        session?.user?.id === editingUser?.id.toString() &&
                        field.value === "admin" &&
                        users.filter((u) => u.role === "admin").length <= 1
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="text-base py-3">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple-600" />
                            Administrator
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                            Member
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {session?.user?.id === editingUser?.id.toString() &&
                      field.value === "admin" &&
                      users.filter((u) => u.role === "admin").length <= 1 && (
                        <p className="text-sm text-amber-600 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          ⚠️ You cannot change your own role as you are the only
                          administrator.
                        </p>
                      )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Field */}
              <FormField
                control={form.control}
                name="status"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<UserFormValues, "status">;
                }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Account Status
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-base py-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Information */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">
                  Registration Information
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Member ID:
                      </p>
                      <p className="text-sm text-blue-700 font-mono">
                        {editingUser?.memberId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Registration Date:
                      </p>
                      <p className="text-sm text-blue-700">
                        {editingUser?.createdAt &&
                          formatDate(editingUser.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  size="lg"
                  className="text-base px-6 py-3"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="text-base px-6 py-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ENHANCED DELETE DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete member "{deletingUser?.name}"?
              This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>

          {/* Member info in delete dialog */}
          {deletingUser && (
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <MemberAvatar user={deletingUser} size="md" />
              <div>
                <h4 className="font-semibold text-red-900">
                  {deletingUser.name}
                </h4>
                <p className="text-sm text-red-700">{deletingUser.email}</p>
                <p className="text-xs text-red-600 font-mono">
                  ID: {deletingUser.memberId}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
              size="lg"
              className="text-base px-6 py-3"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              size="lg"
              className="text-base px-6 py-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Member"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile hint */}
      <div className="block md:hidden text-sm text-center text-muted-foreground mt-4 select-none">
        <span className="inline-flex items-center gap-2">
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 18l6-6-6-6" />
          </svg>
          Swipe right to see more details
        </span>
      </div>
    </div>
  );
}
