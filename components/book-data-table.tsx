"use client"

import { useEffect, useState, useRef } from "react"
import { Edit, Trash2, ImageIcon, XCircle } from "lucide-react"
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
import { toast } from "sonner"

// Type for Book
type Book = {
  id: number
  title: string
  author: string
  publisher: string | null
  year: number | null
  isbn: string | null
  stock: number
  coverImage: string | null
  createdAt: string
  updatedAt: string
}

export default function BookDataTable() {
  const [books, setBooks] = useState<Book[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const addFileInputRef = useRef<HTMLInputElement>(null)

  // Fetch books from the API
  const fetchBooks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/books')
      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }
      const data = await response.json()
      setBooks(data)
    } catch (error) {
      console.error('Error fetching books:', error)
      toast.error("Gagal memuat data buku")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch books on component mount
  useEffect(() => {
    fetchBooks()
  }, [])

  const handleDelete = (book: Book) => {
    setSelectedBook(book)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedBook) return
    
    try {
      // Call the DELETE API endpoint
      const response = await fetch(`/api/books?id=${selectedBook.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete book')
      }
      
      // Refresh book data after successful deletion
      await fetchBooks()
      
      toast.success(`Buku "${selectedBook.title}" berhasil dihapus`)
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error("Gagal menghapus buku")
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleEdit = (book: Book) => {
    setSelectedBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher || "",
      year: book.year ? book.year.toString() : "",
      isbn: book.isbn || "",
      stock: book.stock.toString(),
    })
    setCoverImageFile(null)
    setCoverImagePreview(book.coverImage)
    setFormErrors({})
    setIsEditDialogOpen(true)
  }

  const handleAdd = () => {
    setFormData({
      title: "",
      author: "",
      publisher: "",
      year: "",
      isbn: "",
      stock: "1",
    })
    setCoverImageFile(null)
    setCoverImagePreview(null)
    setFormErrors({})
    setIsAddDialogOpen(true)
  }

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
    
    // Clear any previous cover image errors
    setFormErrors({
      ...formErrors,
      coverImage: undefined
    })
    
    if (file) {
      // Validate image file
      if (!file.type.startsWith('image/')) {
        setFormErrors({
          ...formErrors,
          coverImage: "File harus berupa gambar"
        })
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
    if (isEditDialogOpen && editFileInputRef.current) {
      editFileInputRef.current.value = ''
    } else if (isAddDialogOpen && addFileInputRef.current) {
      addFileInputRef.current.value = ''
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBook) return
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    console.log("Processing edit book submission:", formData, coverImageFile);
    
    try {
      setIsLoading(true)
      
      const formDataObj = new FormData()
      formDataObj.append('id', selectedBook.id.toString())
      formDataObj.append('title', formData.title)
      formDataObj.append('author', formData.author)
      formDataObj.append('publisher', formData.publisher || '')
      formDataObj.append('year', formData.year || '')
      formDataObj.append('isbn', formData.isbn || '')
      formDataObj.append('stock', formData.stock || '1')
      
      // Only append the file if a new one was selected
      if (coverImageFile) {
        formDataObj.append('coverImage', coverImageFile)
      }
      
      const response = await fetch('/api/books', {
        method: 'PUT',
        body: formDataObj,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update book')
      }
      
      const updatedBook = await response.json()
      
      // Update the books state
      setBooks(books.map(book => book.id === updatedBook.id ? updatedBook : book))
      
      toast.success(`Buku "${formData.title}" berhasil diperbarui`)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating book:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Gagal memperbarui buku: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const errors: {
      title?: string;
      author?: string;
      year?: string;
      stock?: string;
      coverImage?: string;
    } = {};
    
    // Required fields validation
    if (!formData.title.trim()) {
      errors.title = "Judul buku wajib diisi";
    }
    
    if (!formData.author.trim()) {
      errors.author = "Penulis buku wajib diisi";
    }
    
    // Year validation (if provided)
    if (formData.year && (isNaN(parseInt(formData.year)) || parseInt(formData.year) < 1000 || parseInt(formData.year) > new Date().getFullYear())) {
      errors.year = "Tahun terbit tidak valid";
    }
    
    // Stock validation
    if (!formData.stock || parseInt(formData.stock) < 1) {
      errors.stock = "Stok buku minimal 1";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    console.log("Processing add book submission:", formData, coverImageFile);
    
    try {
      setIsLoading(true)
      
      const formDataObj = new FormData()
      formDataObj.append('title', formData.title)
      formDataObj.append('author', formData.author)
      formDataObj.append('publisher', formData.publisher || '')
      formDataObj.append('year', formData.year || '')
      formDataObj.append('isbn', formData.isbn || '')
      formDataObj.append('stock', formData.stock || '1')
      
      // Append cover image if one was selected
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
      
      const newBook = await response.json()
      
      // Refresh book data to ensure we have the latest from server
      await fetchBooks()
      
      // Reset form after successful submission
      setFormData({
        title: "",
        author: "",
        publisher: "",
        year: "",
        isbn: "",
        stock: "1",
      })
      setCoverImageFile(null)
      setCoverImagePreview(null)
      setFormErrors({})
      
      toast.success(`Buku "${formData.title}" berhasil ditambahkan`)
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding book:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Gagal menambahkan buku: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Daftar Buku</CardTitle>
          <CardDescription>Daftar semua buku yang tersedia di perpustakaan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Button onClick={handleAdd}>Tambah Buku</Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Cover</TableHead>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Judul Buku</TableHead>
                  <TableHead>Penulis</TableHead>
                  <TableHead>Penerbit</TableHead>
                  <TableHead className="w-24">Tahun Terbit</TableHead>
                  <TableHead className="w-16">ISBN</TableHead>
                  <TableHead className="w-20">Stok</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : books.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Tidak ada data buku
                    </TableCell>
                  </TableRow>
                ) : (
                  books.map((book, index) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div className="h-12 w-10 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                          {book.coverImage ? (
                            <img 
                              src={book.coverImage} 
                              alt={book.title} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.publisher || "-"}</TableCell>
                      <TableCell>{book.year || "-"}</TableCell>
                      <TableCell>{book.isbn || "-"}</TableCell>
                      <TableCell>{book.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(book)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDelete(book)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
              Apakah Anda yakin ingin menghapus buku &quot;
              {selectedBook?.title}&quot;? Tindakan ini tidak dapat dibatalkan.
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

      {/* Edit Book Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Buku</DialogTitle>
            <DialogDescription>Ubah informasi buku di bawah ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
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
                      id="edit-cover"
                      type="file"
                      accept="image/*"
                      ref={editFileInputRef}
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
                <Label htmlFor="title">Judul Buku</Label>
                <Input 
                  id="title" 
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
                <Label htmlFor="author">Penulis</Label>
                <Input 
                  id="author" 
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
                <Label htmlFor="publisher">Penerbit</Label>
                <Input
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="year">Tahun Terbit</Label>
                  <Input
                    id="year"
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
                  <Label htmlFor="stock">Stok</Label>
                  <Input
                    id="stock"
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
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Book Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
    </>
  )
}
