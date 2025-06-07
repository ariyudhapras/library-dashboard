import { supabase } from '@/lib/supabase'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import fs from 'fs'

// Tipe sederhana untuk data
type BackupUser = {
  id: number
  name: string
  email: string
  password: string
  role: string
  createdAt: Date
  updatedAt: Date
}

type BackupBook = {
  id: number
  title: string
  author: string
  publisher: string | null
  year: number | null
  isbn: string | null
  stock: number
  coverImage: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Fungsi untuk membuat backup data dari tabel-tabel penting
 * Gunakan sebelum melakukan migrasi yang bersifat destructive
 */
export async function backupDatabase() {
  try {
    console.log('Starting database backup...')
    
    // Ambil data dari tabel-tabel penting
    const { data: users, error: usersError } = await supabase.from('user').select('*')
    if (usersError) throw new Error(`Error fetching users: ${usersError.message}`)

    const { data: books, error: booksError } = await supabase.from('book').select('*')
    if (booksError) throw new Error(`Error fetching books: ${booksError.message}`)

    const { data: bookLoans, error: bookLoansError } = await supabase.from('bookLoan').select('*')
    if (bookLoansError) throw new Error(`Error fetching bookLoans: ${bookLoansError.message}`)

    
    // Buat objek backup
    const backupData = {
      timestamp: new Date().toISOString(),
      users: (users || []).map((user: any) => ({ // Add null check for users
        ...user,
        password: '[REDACTED]' // Jangan backup password plaintext
      })),
      books,
      bookLoans
    }
    
    // Buat nama file dengan timestamp
    const filename = `backup-${new Date().toISOString().replace(/:/g, '-')}.json`
    const backupDir = join(process.cwd(), 'backups')
    
    // Pastikan direktori backups ada
    if (!fs.existsSync(backupDir)) {
      await mkdir(backupDir, { recursive: true })
    }
    
    const filepath = join(backupDir, filename)
    
    // Tulis ke file JSON
    await writeFile(filepath, JSON.stringify(backupData, null, 2))
    
    console.log(`Database backup completed: ${filepath}`)
    
    return {
      success: true,
      message: `Backup created at ${filepath}`,
      path: filepath
    }
  } catch (error) {
    console.error('Error during database backup:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    }
  }
}

/**
 * Fungsi untuk memulihkan data dari backup
 * Gunakan jika migrasi menyebabkan kehilangan data
 */
export async function restoreFromBackup(backupFilePath: string) {
  try {
    console.log(`Starting database restore from ${backupFilePath}...`)
    
    // Baca file backup
    const backupContent = fs.readFileSync(backupFilePath, 'utf8')
    const backupData = JSON.parse(backupContent)
    
    // Restore books jika tabel kosong
    const { count: bookCount, error: countError } = await supabase.from('book').select('id', { count: 'exact', head: true })
    if (countError) throw new Error(`Error counting books: ${countError.message}`)

    if (bookCount === 0 && backupData.books && backupData.books.length > 0) {
      console.log(`Restoring ${backupData.books.length} books...`)
      
      // Hapus data id dan timestamp yang akan dihasilkan ulang
      const booksToRestore = backupData.books.map((book: any) => ({
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        year: book.year,
        isbn: book.isbn,
        stock: book.stock,
        coverImage: book.coverImage
      }))
      
      // Restore books
      // Supabase insert can take an array of objects
      const { error: insertError } = await supabase.from('book').insert(booksToRestore)
      if (insertError) throw new Error(`Error inserting books: ${insertError.message}`)

    }
    
    console.log('Database restore completed')
    
    return {
      success: true,
      message: 'Restore completed successfully'
    }
  } catch (error) {
    console.error('Error during database restore:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    }
  }
} 