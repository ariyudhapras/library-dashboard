"use client"

import { useState } from "react"
import { Edit, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Sample member data
const initialMembers = [
  {
    id: 1,
    name: "Budi Santoso",
    address: "Jl. Merdeka No. 123, Jakarta Selatan",
    email: "budi.santoso@email.com",
    phone: "081234567890",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    address: "Jl. Pahlawan No. 45, Bandung",
    email: "siti.nurhaliza@email.com",
    phone: "082345678901",
  },
  {
    id: 3,
    name: "Ahmad Dahlan",
    address: "Jl. Diponegoro No. 67, Yogyakarta",
    email: "ahmad.dahlan@email.com",
    phone: "083456789012",
  },
  {
    id: 4,
    name: "Dewi Lestari",
    address: "Jl. Sudirman No. 89, Surabaya",
    email: "dewi.lestari@email.com",
    phone: "084567890123",
  },
  {
    id: 5,
    name: "Rudi Hartono",
    address: "Jl. Gatot Subroto No. 34, Semarang",
    email: "rudi.hartono@email.com",
    phone: "085678901234",
  },
]

export default function MemberDataTable() {
  const [members, setMembers] = useState(initialMembers)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  })

  const handleDelete = (member) => {
    setSelectedMember(member)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    setMembers(members.filter((member) => member.id !== selectedMember.id))
    setIsDeleteDialogOpen(false)
  }

  const handleEdit = (member) => {
    setSelectedMember(member)
    setFormData({
      name: member.name,
      address: member.address,
      email: member.email,
      phone: member.phone,
    })
    setIsEditDialogOpen(true)
  }

  const handleAdd = () => {
    setFormData({
      name: "",
      address: "",
      email: "",
      phone: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmitEdit = (e) => {
    e.preventDefault()
    const updatedMembers = members.map((member) => {
      if (member.id === selectedMember.id) {
        return {
          ...member,
          name: formData.name,
          address: formData.address,
          email: formData.email,
          phone: formData.phone,
        }
      }
      return member
    })
    setMembers(updatedMembers)
    setIsEditDialogOpen(false)
  }

  const handleSubmitAdd = (e) => {
    e.preventDefault()
    const newMember = {
      id: members.length > 0 ? Math.max(...members.map((member) => member.id)) + 1 : 1,
      name: formData.name,
      address: formData.address,
      email: formData.email,
      phone: formData.phone,
    }
    setMembers([...members, newMember])
    setIsAddDialogOpen(false)
  }

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Daftar Anggota</CardTitle>
          <CardDescription>Daftar semua anggota perpustakaan digital</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Button onClick={handleAdd}>
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Anggota
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="hidden md:table-cell">Alamat</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>No HP</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member, index) => (
                  <TableRow key={member.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="hidden max-w-[200px] truncate md:table-cell">{member.address}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(member)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus anggota &quot;
              {selectedMember?.name}&quot;? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Anggota</DialogTitle>
            <DialogDescription>Ubah informasi anggota di bawah ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">No HP</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Anggota Baru</DialogTitle>
            <DialogDescription>Masukkan informasi anggota baru di bawah ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="add-name">Nama</Label>
                <Input id="add-name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-address">Alamat</Label>
                <Textarea
                  id="add-address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-phone">No HP</Label>
                <Input id="add-phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Tambah Anggota</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
