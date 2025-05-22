# Perpustakaan Digital

Aplikasi manajemen perpustakaan digital dengan pemisahan akses admin dan user biasa.

## Struktur Aplikasi

Aplikasi ini memiliki pemisahan halaman yang jelas untuk admin dan user:

- **Halaman Admin**: Terletak di `/app/admin/*`
- **Halaman User**: Terletak di `/app/*` dan `/app/user/*`

## Proteksi Route

Aplikasi menggunakan middleware NextAuth untuk melindungi halaman berdasarkan role pengguna:

- Halaman admin (`/admin/*`) hanya dapat diakses oleh pengguna dengan role `admin`
- Halaman user biasa dapat diakses oleh semua pengguna yang sudah login
- Pengguna yang belum login akan diarahkan ke halaman login

## Cara Akses

### Akses Admin

1. Buka `/admin/dashboard` atau halaman admin lainnya
2. Login dengan akun yang memiliki role `admin`
3. Anda akan memiliki akses ke:
   - Dashboard Admin (`/admin/dashboard`)
   - Manajemen Buku (`/admin/books`)
   - Manajemen Anggota (`/admin/members`)
   - Permintaan Peminjaman (`/admin/requests`)
   - Pengembalian (`/admin/returns`)
   - Laporan (`/admin/reports`)

### Akses User Biasa

1. Buka halaman utama aplikasi
2. Login dengan akun yang memiliki role `user`
3. Anda akan memiliki akses ke:
   - Beranda (`/beranda`)
   - Katalog Buku (`/books`)
   - Peminjaman (`/peminjaman`)
   - Riwayat Peminjaman (`/riwayat`)
   - Profil User (`/user/profile`)

## Panduan Penggunaan

1. **Login**: Semua user (admin dan non-admin) menggunakan halaman login yang sama.
2. **Redirect setelah login**:
   - Jika role `admin`, akan diarahkan ke `/admin/dashboard`
   - Jika role `user`, akan diarahkan ke `/beranda`

## Pengujian

Untuk menguji sebagai admin:
1. Pastikan ada user dengan role `admin` di database
2. Login dengan user tersebut
3. Coba akses halaman `/admin/dashboard`

Untuk menguji sebagai user biasa:
1. Gunakan akun dengan role `user`
2. Login dan pastikan Anda tidak bisa mengakses halaman admin
3. Halaman user biasa akan dapat diakses

## Model Database

Model User telah ditambahkan field role untuk identifikasi akses:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Setelah melakukan perubahan model, jalankan migrasi database:

```
npx prisma migrate dev --name add-user-role
``` 