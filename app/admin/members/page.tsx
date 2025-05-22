'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { PageHeader } from "@/components/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { Search } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, ControllerRenderProps } from "react-hook-form"
import * as z from "zod"

interface User {
  id: number
  memberId: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
}

// Form validation schema
const userFormSchema = z.object({
  id: z.number(),
  name: z.string().min(2, { message: "Nama harus minimal 2 karakter." }),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string(),
  updatedAt: z.string(),
})

type UserFormValues = z.infer<typeof userFormSchema>

export default function AdminMembersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  // Form setup
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      id: 0,
      name: "",
      email: "",
      role: "user",
      status: "active",
      createdAt: "",
      updatedAt: ""
    }
  })

  // Function to fetch users
  const fetchUsers = async (search: string = "") => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/users${search ? `?search=${search}` : ''}`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error("Failed to fetch users:", err)
      setError("Gagal memuat data pengguna. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(searchQuery)
  }

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setEditingUser(user)
    form.reset({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "user",
      status: user.status as "active" | "inactive",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
    setIsEditDialogOpen(true)
  }
  
  // Handle user deletion
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }
      
      // Remove user from the list
      setUsers(users.filter(user => user.id !== userId))
      
      toast({
        title: 'Anggota berhasil dihapus',
        description: 'Data anggota telah dihapus dari sistem.',
      })
    } catch (err) {
      console.error('Failed to delete user:', err)
      
      toast({
        variant: 'destructive',
        title: 'Gagal menghapus anggota',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.',
      })
    }
  }
  
  // Handle form submission
  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: values.id,
          name: values.name,
          role: values.role,
          status: values.status
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }
      
      const updatedUser = await response.json()
      
      // Update user in the list
      setUsers(users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ))
      
      setIsEditDialogOpen(false)
      
      toast({
        title: 'Data anggota berhasil diperbarui',
        description: 'Perubahan telah disimpan dengan sukses.',
      })
    } catch (err) {
      console.error('Failed to update user:', err)
      
      toast({
        variant: 'destructive',
        title: 'Gagal memperbarui data anggota',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-6">
      <PageHeader 
        title="Daftar Anggota" 
        description="Kelola anggota perpustakaan"
        showAddButton={false}
      />
      
      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari berdasarkan nama, email, atau ID anggota..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Cari</Button>
        </form>
      </div>
      
      <div className="rounded-md border">
        {error && <p className="text-center text-red-500 py-4">{error}</p>}
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Memuat data anggota...</p>
          </div>
        ) : (
          <>
            {/* No users message */}
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada data anggota yang ditemukan.</p>
              </div>
            ) : (
              /* Users table */
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>ID Anggota</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Tanggal Daftar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.memberId}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'Anggota'}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Anggota</DialogTitle>
            <DialogDescription>
              Ubah informasi dan peran anggota.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: ControllerRenderProps<UserFormValues, "name"> }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Email Field (Read-only) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: ControllerRenderProps<UserFormValues, "email"> }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Role Field */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }: { field: ControllerRenderProps<UserFormValues, "role"> }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={
                        // Disable if user is trying to edit themselves and they're the only admin
                        session?.user?.id === editingUser?.id.toString() && 
                        field.value === 'admin' && 
                        users.filter(u => u.role === 'admin').length <= 1
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">Anggota</SelectItem>
                      </SelectContent>
                    </Select>
                    {session?.user?.id === editingUser?.id.toString() && 
                     field.value === 'admin' && 
                     users.filter(u => u.role === 'admin').length <= 1 && (
                      <p className="text-xs text-amber-600 mt-1">
                        Anda tidak dapat menurunkan role diri sendiri karena Anda adalah satu-satunya admin.
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
                render={({ field }: { field: ControllerRenderProps<UserFormValues, "status"> }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Tidak Aktif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Registration Date (Read-only) */}
              <div className="text-sm">
                <p className="font-medium">ID Anggota:</p>
                <p className="text-gray-500 mt-1">{editingUser?.memberId}</p>
              </div>
              
              <div className="text-sm">
                <p className="font-medium">Terdaftar Pada:</p>
                <p className="text-gray-500 mt-1">
                  {editingUser?.createdAt && formatDate(editingUser.createdAt)}
                </p>
              </div>
              
              <DialogFooter className="mt-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 