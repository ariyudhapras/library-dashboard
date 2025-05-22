import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

// GET endpoint to fetch all books
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new book
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get cover image file if it exists
    const coverImageFile = formData.get('coverImage') as File | null;
    
    // Validate the required fields
    const title = formData.get('title')?.toString();
    const author = formData.get('author')?.toString();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Judul buku wajib diisi' },
        { status: 400 }
      );
    }
    
    if (!author) {
      return NextResponse.json(
        { error: 'Penulis buku wajib diisi' },
        { status: 400 }
      );
    }
    
    // Validate stock
    const stockValue = formData.get('stock')?.toString();
    let stock = 1;
    
    if (stockValue) {
      stock = parseInt(stockValue, 10);
      if (isNaN(stock) || stock < 1) {
        return NextResponse.json(
          { error: 'Stok buku minimal 1' },
          { status: 400 }
        );
      }
    }
    
    let coverImagePath: string | null = null;
    
    // If cover image is provided, save it to public/uploads
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        // Ensure uploads directory exists
        await mkdir(join(process.cwd(), 'public/uploads'), { recursive: true });
        
        // Create unique filename based on timestamp and original name
        const bytes = new Uint8Array(8);
        crypto.getRandomValues(bytes);
        const uniqueId = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Get file extension from original name
        const originalName = coverImageFile.name;
        const extension = originalName.split('.').pop();
        
        // Create a unique filename
        const filename = `${uniqueId}-${Date.now()}.${extension}`;
        const filepath = join(process.cwd(), 'public/uploads', filename);
        
        // Convert file to buffer and save it
        const buffer = Buffer.from(await coverImageFile.arrayBuffer());
        await writeFile(filepath, buffer);
        
        // Set relative path for database
        coverImagePath = `/uploads/${filename}`;
      } catch (error) {
        console.error('Error saving cover image:', error);
        return NextResponse.json(
          { error: 'Gagal mengupload gambar cover buku' },
          { status: 500 }
        );
      }
    }
    
    // Convert year to number if provided
    let year = null;
    const yearValue = formData.get('year')?.toString();
    if (yearValue && yearValue.trim() !== '') {
      year = parseInt(yearValue, 10);
      if (isNaN(year)) {
        return NextResponse.json(
          { error: 'Format tahun terbit tidak valid' },
          { status: 400 }
        );
      }
    }
    
    // Prepare book data
    const bookData = {
      title,
      author,
      publisher: formData.get('publisher')?.toString() || null,
      year,
      isbn: formData.get('isbn')?.toString() || null,
      stock,
      coverImage: coverImagePath,
    };
    
    const newBook = await prisma.book.create({
      data: bookData,
    });
    
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create book' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update a book
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get book ID
    const id = formData.get('id')?.toString();
    if (!id) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the book exists
    const bookId = parseInt(id, 10);
    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'ID buku tidak valid' },
        { status: 400 }
      );
    }
    
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    });
    
    if (!existingBook) {
      return NextResponse.json(
        { error: 'Buku tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Validate required fields
    const title = formData.get('title')?.toString();
    const author = formData.get('author')?.toString();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Judul buku wajib diisi' },
        { status: 400 }
      );
    }
    
    if (!author) {
      return NextResponse.json(
        { error: 'Penulis buku wajib diisi' },
        { status: 400 }
      );
    }
    
    // Validate stock
    const stockValue = formData.get('stock')?.toString();
    let stock = 1;
    
    if (stockValue) {
      stock = parseInt(stockValue, 10);
      if (isNaN(stock) || stock < 1) {
        return NextResponse.json(
          { error: 'Stok buku minimal 1' },
          { status: 400 }
        );
      }
    }
    
    // Get the current book to check if we need to replace the cover image
    const currentBook = await prisma.book.findUnique({
      where: { id: bookId },
      select: { coverImage: true }
    });
    
    // Get cover image file if it exists
    const coverImageFile = formData.get('coverImage') as File | null;
    let coverImagePath = currentBook?.coverImage || null;
    
    // If cover image is provided, save it to public/uploads
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        // Ensure uploads directory exists
        await mkdir(join(process.cwd(), 'public/uploads'), { recursive: true });
        
        // Create unique filename based on timestamp and original name
        const bytes = new Uint8Array(8);
        crypto.getRandomValues(bytes);
        const uniqueId = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Get file extension from original name
        const originalName = coverImageFile.name;
        const extension = originalName.split('.').pop();
        
        // Create a unique filename
        const filename = `${uniqueId}-${Date.now()}.${extension}`;
        const filepath = join(process.cwd(), 'public/uploads', filename);
        
        // Convert file to buffer and save it
        const buffer = Buffer.from(await coverImageFile.arrayBuffer());
        await writeFile(filepath, buffer);
        
        // Set relative path for database
        coverImagePath = `/uploads/${filename}`;
      } catch (error) {
        console.error('Error saving cover image:', error);
        return NextResponse.json(
          { error: 'Gagal mengupload gambar cover buku' },
          { status: 500 }
        );
      }
    }
    
    // Convert year to number if provided
    let year = null;
    const yearValue = formData.get('year')?.toString();
    if (yearValue && yearValue.trim() !== '') {
      year = parseInt(yearValue, 10);
      if (isNaN(year)) {
        return NextResponse.json(
          { error: 'Format tahun terbit tidak valid' },
          { status: 400 }
        );
      }
    }
    
    // Prepare book data
    const bookData = {
      title,
      author,
      publisher: formData.get('publisher')?.toString() || null,
      year,
      isbn: formData.get('isbn')?.toString() || null,
      stock,
      coverImage: coverImagePath,
    };
    
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: bookData,
    });
    
    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update book' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a book
export async function DELETE(request: NextRequest) {
  try {
    // Get the book ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }
    
    const bookId = parseInt(id, 10);
    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'ID buku tidak valid' },
        { status: 400 }
      );
    }
    
    // Check if the book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });
    
    if (!book) {
      return NextResponse.json(
        { error: 'Buku tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Check if book is being borrowed
    const activeLoans = await prisma.bookLoan.count({
      where: {
        bookId: bookId,
        status: {
          in: ['PENDING', 'APPROVED']
        }
      }
    });
    
    if (activeLoans > 0) {
      return NextResponse.json(
        { error: 'Buku tidak dapat dihapus karena sedang dipinjam' },
        { status: 400 }
      );
    }
    
    // Delete the book
    await prisma.book.delete({
      where: { id: bookId },
    });
    
    return NextResponse.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete book' },
      { status: 500 }
    );
  }
} 