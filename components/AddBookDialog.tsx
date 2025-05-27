import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageIcon, XCircle } from "lucide-react"
import { toast } from "sonner"

interface AddBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddBookDialog({ open, onOpenChange, onSuccess }: AddBookDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    year: "",
    isbn: "",
    stock: "1",
  })
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    author?: string;
    year?: string;
    stock?: string;
    coverImage?: string;
  }>({})
  const [isLoading, setIsLoading] = useState(false)
  const addFileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setCoverImageFile(file)
    setFormErrors({ ...formErrors, coverImage: undefined })
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors({ ...formErrors, coverImage: "File harus berupa gambar" })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClearImage = () => {
    setCoverImageFile(null)
    setCoverImagePreview(null)
    if (addFileInputRef.current) {
      addFileInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    const errors: typeof formErrors = {}
    if (!formData.title.trim()) errors.title = "Judul buku wajib diisi"
    if (!formData.author.trim()) errors.author = "Penulis buku wajib diisi"
    if (formData.year && (isNaN(parseInt(formData.year)) || parseInt(formData.year) < 1000 || parseInt(formData.year) > new Date().getFullYear())) {
      errors.year = "Tahun terbit tidak valid"
    }
    if (!formData.stock || parseInt(formData.stock) < 1) errors.stock = "Stok buku minimal 1"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    try {
      setIsLoading(true)
      const formDataObj = new FormData()
      formDataObj.append('title', formData.title)
      formDataObj.append('author', formData.author)
      formDataObj.append('publisher', formData.publisher || '')
      formDataObj.append('year', formData.year || '')
      formDataObj.append('isbn', formData.isbn || '')
      formDataObj.append('stock', formData.stock || '1')
      if (coverImageFile) {
        formDataObj.append('coverImage', coverImageFile)
      }
      const response = await fetch('/api/books', {
        method: 'POST',
        body: formDataObj,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add book')
      }
      toast.success(`Buku "${formData.title}" berhasil ditambahkan`)
      setFormData({ title: "", author: "", publisher: "", year: "", isbn: "", stock: "1" })
      setCoverImageFile(null)
      setCoverImagePreview(null)
      setFormErrors({})
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error adding book:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Gagal menambahkan buku: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Tambah Buku Baru</DialogTitle>
          <DialogDescription>Masukkan informasi buku baru di bawah ini.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitAdd}>
          <div className="grid gap-5 py-4">
            {/* Cover Image Upload */}
            <div className="grid gap-3">
              <Label>Cover Buku</Label>
              <div className="flex items-center gap-4">
                <div className="h-32 w-24 border rounded-md overflow-hidden flex items-center justify-center bg-slate-50">
                  {coverImagePreview ? (
                    <img 
                      src={coverImagePreview} 
                      alt="Preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <Input
                    id="add-cover"
                    type="file"
                    accept="image/*"
                    ref={addFileInputRef}
                    onChange={handleImageChange}
                    className={`cursor-pointer ${formErrors.coverImage ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {formErrors.coverImage && (
                    <p className="text-sm font-medium text-red-500">{formErrors.coverImage}</p>
                  )}
                  {coverImagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearImage}
                      className="flex items-center text-red-500 hover:text-red-600"
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Hapus Gambar
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-title">Judul Buku</Label>
              <Input 
                id="add-title" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                required 
                className={formErrors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {formErrors.title && (
                <p className="text-sm font-medium text-red-500">{formErrors.title}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-author">Penulis</Label>
              <Input 
                id="add-author" 
                name="author" 
                value={formData.author} 
                onChange={handleInputChange} 
                required 
                className={formErrors.author ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {formErrors.author && (
                <p className="text-sm font-medium text-red-500">{formErrors.author}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-publisher">Penerbit</Label>
              <Input 
                id="add-publisher" 
                name="publisher" 
                value={formData.publisher} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-year">Tahun Terbit</Label>
                <Input
                  id="add-year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={formErrors.year ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {formErrors.year && (
                  <p className="text-sm font-medium text-red-500">{formErrors.year}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-stock">Stok</Label>
                <Input
                  id="add-stock"
                  name="stock"
                  type="number"
                  min="1"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  className={formErrors.stock ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {formErrors.stock && (
                  <p className="text-sm font-medium text-red-500">{formErrors.stock}</p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-isbn">ISBN</Label>
              <Input
                id="add-isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {isLoading ? "Menambahkan..." : "Tambah Buku"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 