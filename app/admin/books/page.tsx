"use client";

import { useEffect, useState, useRef } from "react";
import {
  Edit,
  Trash2,
  ImageIcon,
  XCircle,
  Plus,
  BookOpen,
  Loader2,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Type for Book
type Book = {
  id: number;
  title: string;
  author: string;
  publisher: string | null;
  year: number | null;
  isbn: string | null;
  stock: number;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    year: "",
    isbn: "",
    stock: "1",
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    author?: string;
    year?: string;
    stock?: string;
    coverImage?: string;
  }>({});
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch books from the API
  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/books");
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load books data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBook) return;

    try {
      const response = await fetch(`/api/books?id=${selectedBook.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete book");
      }

      await fetchBooks();
      toast.success(`Book "${selectedBook.title}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher || "",
      year: book.year ? book.year.toString() : "",
      isbn: book.isbn || "",
      stock: book.stock.toString(),
    });
    setCoverImageFile(null);
    setCoverImagePreview(book.coverImage);
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      author: "",
      publisher: "",
      year: "",
      isbn: "",
      stock: "1",
    });
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setFormErrors({});
    setIsAddDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverImageFile(file);

    setFormErrors({
      ...formErrors,
      coverImage: undefined,
    });

    if (file) {
      if (!file.type.startsWith("image/")) {
        setFormErrors({
          ...formErrors,
          coverImage: "File must be an image",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    if (isEditDialogOpen && editFileInputRef.current) {
      editFileInputRef.current.value = "";
    } else if (isAddDialogOpen && addFileInputRef.current) {
      addFileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const errors: {
      title?: string;
      author?: string;
      year?: string;
      stock?: string;
      coverImage?: string;
    } = {};

    if (!formData.title.trim()) {
      errors.title = "Book title is required";
    }

    if (!formData.author.trim()) {
      errors.author = "Author name is required";
    }

    if (
      formData.year &&
      (isNaN(parseInt(formData.year)) ||
        parseInt(formData.year) < 1000 ||
        parseInt(formData.year) > new Date().getFullYear())
    ) {
      errors.year = "Invalid publication year";
    }

    if (!formData.stock || parseInt(formData.stock) < 1) {
      errors.stock = "Stock must be at least 1";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const formDataObj = new FormData();
      formDataObj.append("id", selectedBook.id.toString());
      formDataObj.append("title", formData.title);
      formDataObj.append("author", formData.author);
      formDataObj.append("publisher", formData.publisher || "");
      formDataObj.append("year", formData.year || "");
      formDataObj.append("isbn", formData.isbn || "");
      formDataObj.append("stock", formData.stock || "1");

      if (coverImageFile) {
        formDataObj.append("coverImage", coverImageFile);
      }

      const response = await fetch("/api/books", {
        method: "PUT",
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update book");
      }

      const updatedBook = await response.json();
      setBooks(
        books.map((book) => (book.id === updatedBook.id ? updatedBook : book))
      );

      toast.success(`Book "${formData.title}" updated successfully`);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating book:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update book: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const formDataObj = new FormData();
      formDataObj.append("title", formData.title);
      formDataObj.append("author", formData.author);
      formDataObj.append("publisher", formData.publisher || "");
      formDataObj.append("year", formData.year || "");
      formDataObj.append("isbn", formData.isbn || "");
      formDataObj.append("stock", formData.stock || "1");

      if (coverImageFile) {
        formDataObj.append("coverImage", coverImageFile);
      }

      const response = await fetch("/api/books", {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add book");
      }

      await fetchBooks();

      setFormData({
        title: "",
        author: "",
        publisher: "",
        year: "",
        isbn: "",
        stock: "1",
      });
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setFormErrors({});

      toast.success(`Book "${formData.title}" added successfully`);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding book:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to add book: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-6 sm:gap-8 p-4 sm:p-6">
      {/* ENHANCED HEADER - Matching User Style */}
      <div className="relative flex flex-col sm:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl lg:rounded-2xl shadow-lg mb-4 sm:mb-6">
        <div className="flex flex-col items-center text-center flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-900 mb-2 sm:mb-4 leading-tight">
            Books Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 font-light px-2">
            Add, edit, and manage books in your library collection.
          </p>
        </div>
        {/* Add Button in Top Right */}
        <div className="mt-4 sm:mt-0 sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2">
          <Button
            onClick={handleAdd}
            size="lg"
            className="text-base px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Book
          </Button>
        </div>
      </div>

      {/* ENHANCED TABLE WITH BETTER STYLING */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">
                Book Details
              </TableHead>
              <TableHead className="font-semibold text-gray-900">No</TableHead>
              <TableHead className="font-semibold text-gray-900">
                Publisher
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Year
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                ISBN
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Stock
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-900">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-lg text-gray-600">
                      Loading books data...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <BookOpen className="h-16 w-16 text-gray-400" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Books Found
                      </h3>
                      <p className="text-base text-gray-600">
                        Start by adding your first book to the collection.
                      </p>
                    </div>
                    <Button
                      onClick={handleAdd}
                      size="lg"
                      className="text-base px-6 py-3"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add First Book
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              books.map((book, index) => (
                <TableRow
                  key={book.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    {/* ENHANCED BOOK DETAILS - Matching User Style */}
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="h-20 w-16 sm:h-24 sm:w-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 mb-1 sm:mb-2">
                          {book.title}
                        </h4>
                        <p className="text-sm sm:text-base text-gray-600">
                          by {book.author}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {book.publisher || "Not specified"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {book.year || "N/A"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">
                    {book.isbn || "N/A"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {book.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(book)}
                        className="text-sm sm:text-base px-3 sm:px-4 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(book)}
                        className="text-sm sm:text-base px-3 sm:px-4 py-2 transition-all duration-200 hover:shadow-lg"
                      >
                        <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ENHANCED DELETE DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete the book "{selectedBook?.title}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              size="lg"
              className="text-base px-6 py-3"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              size="lg"
              className="text-base px-6 py-3"
            >
              Delete Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ENHANCED EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Book</DialogTitle>
            <DialogDescription className="text-base">
              Update the book information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-6 py-6">
              {/* Cover Image Upload */}
              <div className="grid gap-4">
                <Label className="text-base font-semibold">Book Cover</Label>
                <div className="flex items-center gap-6">
                  <div className="h-40 w-32 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50">
                    {coverImagePreview ? (
                      <img
                        src={coverImagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-16 w-16 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <Input
                      id="edit-cover"
                      type="file"
                      accept="image/*"
                      ref={editFileInputRef}
                      onChange={handleImageChange}
                      className={`cursor-pointer text-base py-3 ${
                        formErrors.coverImage
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    {formErrors.coverImage && (
                      <p className="text-sm font-medium text-red-500">
                        {formErrors.coverImage}
                      </p>
                    )}
                    {coverImagePreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearImage}
                        className="flex items-center text-red-500 hover:text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Remove Image
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="title" className="text-base font-semibold">
                  Book Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className={`text-base py-3 ${
                    formErrors.title
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                {formErrors.title && (
                  <p className="text-sm font-medium text-red-500">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="author" className="text-base font-semibold">
                  Author
                </Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  className={`text-base py-3 ${
                    formErrors.author
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                {formErrors.author && (
                  <p className="text-sm font-medium text-red-500">
                    {formErrors.author}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="publisher" className="text-base font-semibold">
                  Publisher
                </Label>
                <Input
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  className="text-base py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="year" className="text-base font-semibold">
                    Publication Year
                  </Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    className={`text-base py-3 ${
                      formErrors.year
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {formErrors.year && (
                    <p className="text-sm font-medium text-red-500">
                      {formErrors.year}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="stock" className="text-base font-semibold">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="1"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    className={`text-base py-3 ${
                      formErrors.stock
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {formErrors.stock && (
                    <p className="text-sm font-medium text-red-500">
                      {formErrors.stock}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="isbn" className="text-base font-semibold">
                  ISBN
                </Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className="text-base py-3"
                />
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
              <Button type="submit" size="lg" className="text-base px-6 py-3">
                {isLoading ? "Saving Changes..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ENHANCED ADD DIALOG */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Add New Book
            </DialogTitle>
            <DialogDescription className="text-base">
              Enter the information for the new book below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-6 py-6">
              {/* Cover Image Upload */}
              <div className="grid gap-4">
                <Label className="text-base font-semibold">Book Cover</Label>
                <div className="flex items-center gap-6">
                  <div className="h-40 w-32 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50">
                    {coverImagePreview ? (
                      <img
                        src={coverImagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-16 w-16 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <Input
                      id="add-cover"
                      type="file"
                      accept="image/*"
                      ref={addFileInputRef}
                      onChange={handleImageChange}
                      className={`cursor-pointer text-base py-3 ${
                        formErrors.coverImage
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    {formErrors.coverImage && (
                      <p className="text-sm font-medium text-red-500">
                        {formErrors.coverImage}
                      </p>
                    )}
                    {coverImagePreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearImage}
                        className="flex items-center text-red-500 hover:text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Remove Image
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="add-title" className="text-base font-semibold">
                  Book Title
                </Label>
                <Input
                  id="add-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className={`text-base py-3 ${
                    formErrors.title
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                {formErrors.title && (
                  <p className="text-sm font-medium text-red-500">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="add-author" className="text-base font-semibold">
                  Author
                </Label>
                <Input
                  id="add-author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  className={`text-base py-3 ${
                    formErrors.author
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                {formErrors.author && (
                  <p className="text-sm font-medium text-red-500">
                    {formErrors.author}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label
                  htmlFor="add-publisher"
                  className="text-base font-semibold"
                >
                  Publisher
                </Label>
                <Input
                  id="add-publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  className="text-base py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="add-year" className="text-base font-semibold">
                    Publication Year
                  </Label>
                  <Input
                    id="add-year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    className={`text-base py-3 ${
                      formErrors.year
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {formErrors.year && (
                    <p className="text-sm font-medium text-red-500">
                      {formErrors.year}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label
                    htmlFor="add-stock"
                    className="text-base font-semibold"
                  >
                    Stock
                  </Label>
                  <Input
                    id="add-stock"
                    name="stock"
                    type="number"
                    min="1"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    className={`text-base py-3 ${
                      formErrors.stock
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {formErrors.stock && (
                    <p className="text-sm font-medium text-red-500">
                      {formErrors.stock}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="add-isbn" className="text-base font-semibold">
                  ISBN
                </Label>
                <Input
                  id="add-isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className="text-base py-3"
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                size="lg"
                className="text-base px-6 py-3"
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" className="text-base px-6 py-3">
                {isLoading ? "Adding Book..." : "Add Book"}
              </Button>
            </DialogFooter>
          </form>
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
