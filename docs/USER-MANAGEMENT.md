# Sistem Manajemen Anggota Perpustakaan

Dokumentasi ini menjelaskan fitur-fitur dan implementasi sistem manajemen anggota di aplikasi perpustakaan.

## Fitur Utama

1. **ID Anggota Otomatis**
   - Format: `A0001` (A diikuti oleh 4 digit nomor urut)
   - Otomatis diberikan saat pendaftaran
   - Unik dan tidak dapat diubah

2. **Proses Registrasi**
   - Field wajib: Nama, Email, Password 
   - Field opsional: Alamat, Nomor HP, Tanggal Lahir, Foto Profil
   - Setelah registrasi berhasil, user diarahkan ke halaman login
   - Notifikasi sukses ditampilkan di halaman login

3. **Profil Anggota**
   - Tampilan Kartu Anggota (ID Anggota, Nama, Status)
   - Alert jika profil belum lengkap
   - Field yang dapat diupdate: Nama, Alamat, Nomor HP, Tanggal Lahir
   - Upload foto profil
   - Field yang tidak dapat diubah: Email, ID Anggota

4. **Panel Admin**
   - Daftar anggota dengan informasi lengkap
   - Fitur pencarian berdasarkan nama, email, atau ID anggota
   - Edit anggota: mengubah nama, peran (admin/user), status (aktif/tidak aktif)
   - Hapus anggota (dengan konfirmasi)

## Struktur Database (Model User)

```prisma
model User {
  id            Int        @id @default(autoincrement())
  memberId      String     @unique
  name          String
  email         String     @unique
  password      String
  address       String?
  phone         String?
  birthDate     DateTime?
  profileImage  String?
  role          String     @default("user")
  status        String     @default("active")
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  bookLoans     BookLoan[]
}
```

## API Endpoints

### 1. Registrasi
- `POST /api/register`
  - Body: `{ name, email, password, address?, phone?, birthDate? }`
  - Generates unique memberId
  - Returns: User object with memberId

### 2. Profil Anggota
- `GET /api/users/profile` - Mendapatkan data profil pengguna yang terautentikasi
- `PUT /api/users/profile` - Mengupdate data profil
  - Body: `{ name, address, phone, birthDate }`
- `POST /api/users/profile/image` - Mengupload foto profil
  - Body: FormData dengan field `file`

### 3. Manajemen Anggota (Admin)
- `GET /api/users` - Mendapatkan daftar anggota (dengan parameter pencarian opsional)
- `PUT /api/users` - Mengupdate data anggota (role, status, dll)
  - Body: `{ id, name, role, status }`
- `DELETE /api/users?id={userId}` - Menghapus anggota

## Alur Kerja User

1. **Registrasi**
   - Pengunjung mengisi form registrasi (nama, email, password)
   - Sistem membuat ID anggota unik
   - Redirect ke halaman login dengan pesan sukses

2. **Login**
   - User login dengan akun yang baru dibuat
   - Setelah login berhasil, user diarahkan sesuai role

3. **Melengkapi Profil**
   - Alert menampilkan field yang belum dilengkapi
   - User melengkapi alamat, nomor HP, dan tanggal lahir
   - Opsional: Upload foto profil

4. **Admin Panel**
   - Admin dapat melihat, mencari, dan mengelola anggota
   - Edit status anggota (aktif/tidak aktif)
   - Mengubah peran user (admin/anggota)
   - Menghapus anggota jika diperlukan 