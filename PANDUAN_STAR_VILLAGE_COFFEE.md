# 📖 PANDUAN LENGKAP WEBAPP
## Star Village Coffee - Versi 2.1.0

---

# 📊 PENILAIAN PRODUK

## Rating: ⭐⭐⭐⭐½ (4.5/5.0)

### Penilaian Detail:

| Aspek | Nilai | Keterangan |
|-------|-------|------------|
| **Fitur** | ⭐⭐⭐⭐⭐ | Sangat lengkap untuk F&B business |
| **UI/UX** | ⭐⭐⭐⭐½ | Modern, responsive, user-friendly |
| **Kode** | ⭐⭐⭐⭐ | Clean, TypeScript, best practices |
| **Keamanan** | ⭐⭐⭐⭐ | Session-based auth, input validation |
| **Performa** | ⭐⭐⭐⭐ | Next.js 16, optimized loading |
| **Mobile** | ⭐⭐⭐⭐⭐ | Fully responsive, mobile-first |

---

## 💰 Estimasi Nilai Jual

### Harga Pasar: **Rp 8.000.000 - Rp 15.000.000**

### Breakdown Harga:

| Komponen | Estimasi Harga |
|----------|----------------|
| Frontend Customer (7 halaman) | Rp 3.000.000 |
| Admin Dashboard (lengkap) | Rp 4.000.000 |
| Backend API (20+ endpoints) | Rp 2.500.000 |
| Database & ORM | Rp 1.000.000 |
| AI Integration (Menu Assistant) | Rp 1.500.000 |
| WhatsApp Integration | Rp 500.000 |
| Responsive Design | Rp 1.500.000 |
| **Total** | **Rp 14.000.000** |

### Harga Rekomendasi: **Rp 12.000.000** (nego)

---

# 📱 FITUR LENGKAP

## A. CUSTOMER (Pelanggan)

### 1. Homepage (`/`)
- Hero section dengan foto cafe
- Informasi jam buka/tutup (otomatis)
- Menu populer & terbaru
- Fasilitas cafe
- Galeri foto
- Lokasi dengan Google Maps
- Form reservasi inline

### 2. Menu (`/menu`)
- Kategori: Coffee, Non-Coffee, Food, Snacks
- Pencarian menu
- Filter berdasarkan kategori
- Variant & harga
- Keranjang belanja
- **AI Menu Assistant** - Rekomendasi menu berdasarkan mood
- Panduan cara memesan

### 3. Checkout (`/checkout`)
- Pilihan: Pick Up / Delivery
- Pengiriman: Staff Delivery / GoSend
- Metode pembayaran:
  - Transfer Bank (BCA, Mandiri)
  - QRIS
  - COD (Cash on Delivery)
- Kode promo/voucher
- Upload bukti pembayaran

### 4. Order Tracking (`/order/[id]`)
- Status pesanan real-time
- Notifikasi WhatsApp otomatis
- Detail pesanan

### 5. Reservasi (`/reservasi`)
- Pilih tanggal & waktu
- Pilih area: Indoor (AC) / Outdoor (Taman)
- Jumlah tamu
- Kode reservasi unik
- Tracking status reservasi

### 6. Loyalty Points (`/loyalty`)
- Cek poin dengan nomor HP
- Sistem level: Bronze → Silver → Gold → Platinum
- Penjelasan cara mendapat poin
- Daftar hadiah yang bisa ditukar
- Riwayat pesanan

### 7. Gallery (`/gallery`)
- Foto-foto cafe
- Drag & drop reorder (admin)

---

## B. ADMIN DASHBOARD (`/admin`)

### 1. Overview
- Total pesanan hari ini
- Pendapatan
- Pesanan pending
- Grafik penjualan

### 2. Manajemen Pesanan
- Daftar semua pesanan
- Filter berdasarkan status
- Update status pesanan:
  - Pending → Confirmed → Processing → Delivering → Completed
- Verifikasi pembayaran
- Kirim notifikasi WhatsApp
- Hapus pesanan

### 3. Manajemen Menu
- Tambah/Edit/Hapus menu
- Kategori menu
- Variant & harga
- Stok
- Badge: Popular, New, Promo
- Upload foto menu

### 4. Manajemen Kategori
- Tambah/Edit/Hapus kategori
- Icon kategori
- Urutan kategori

### 5. Manajemen Promo
- Buat kode voucher
- Diskon (nominal/ persen)
- Minimal pembelian
- Batas penggunaan
- Tanggal kadaluarsa

### 6. Manajemen Reservasi
- Daftar reservasi
- Konfirmasi/Tolak reservasi
- Catatan admin
- Kirim notifikasi WhatsApp

### 7. Galeri
- Upload foto
- Drag & drop untuk ubah urutan
- Aktif/nonaktifkan foto

### 8. Loyalty Members
- Daftar member
- Poin & level
- Total belanja

### 9. Pengaturan
- Nama & tagline cafe
- Alamat
- Nomor telepon
- Instagram
- Logo & hero image
- Jam operasional
- Rekening bank
- QRIS
- Biaya pengiriman
- Zona delivery

---

## C. INTEGRASI

### 1. WhatsApp
- Notifikasi pesanan otomatis
- Konfirmasi pembayaran
- Update status pesanan
- Konfirmasi reservasi
- Pendaftaran member loyalty

### 2. AI Menu Assistant
- Rekomendasi menu berdasarkan mood
- Powered by LLM (Z.AI)
- Quick actions: Ngantuk, Butuh Energi, Creamy, Segar

### 3. Payment Gateway Ready
- Struktur siap untuk integrasi Midtrans/Xendit
- Bank transfer manual
- QRIS
- COD

---

# 🔧 PANDUAN TEKNIS

## Teknologi yang Digunakan

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js | 16.1.3 | Framework utama |
| TypeScript | 5.x | Bahasa pemrograman |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | Component library |
| Prisma | Latest | ORM database |
| SQLite/PostgreSQL | - | Database |

## Struktur Folder

```
src/
├── app/                    # Halaman & API
│   ├── admin/             # Admin dashboard
│   ├── api/               # Backend API
│   ├── checkout/          # Halaman checkout
│   ├── gallery/           # Halaman galeri
│   ├── loyalty/           # Halaman loyalty
│   ├── menu/              # Halaman menu
│   ├── order/             # Tracking pesanan
│   └── reservasi/         # Halaman reservasi
├── components/            # Komponen UI
│   └── ui/               # shadcn components
├── lib/                   # Utilities
└── prisma/               # Database schema
```

## Database Tables

- `menu_categories` - Kategori menu
- `menu_items` - Menu
- `menu_item_variants` - Variant menu
- `orders` - Pesanan
- `order_items` - Item pesanan
- `reservations` - Reservasi
- `gallery_images` - Galeri foto
- `promos` - Kode promo
- `loyalty_members` - Member loyalty
- `cafe_settings` - Pengaturan cafe
- `reviews` - Ulasan

---

# 📋 PANDUAN PENGGUNAAN

## A. Cara Login Admin

1. Buka URL: `yourdomain.com/admin`
2. Masukkan password admin
3. Klik "Login"

**Default Password:** (Tanyakan ke developer)

## B. Cara Menambah Menu Baru

1. Login ke admin dashboard
2. Buka tab "Menu"
3. Klik tombol "Tambah Menu"
4. Isi form:
   - Nama menu
   - Deskripsi
   - Kategori
   - Upload foto
   - Varian (nama & harga)
   - Stok
   - Centang Popular/New/Promo jika perlu
5. Klik "Simpan"

## C. Cara Mengelola Pesanan

1. Buka tab "Pesanan"
2. Klik pesanan untuk melihat detail
3. Update status sesuai progress:
   - **Pending** → Pesanan masuk, menunggu pembayaran
   - **Confirmed** → Pembayaran diverifikasi
   - **Processing** → Sedang diproses
   - **Delivering** → Sedang diantar (untuk delivery)
   - **Completed** → Selesai
4. Klik "Kirim WA" untuk notifikasi customer

## D. Cara Membuat Kode Promo

1. Buka tab "Promo"
2. Klik "Tambah Promo"
3. Isi:
   - Kode promo (contoh: DISKON10)
   - Nilai diskon
   - Minimal pembelian
   - Batas penggunaan
   - Tanggal kadaluarsa
4. Simpan

## E. Cara Mengelola Reservasi

1. Buka tab "Reservasi"
2. Lihat daftar reservasi masuk
3. Klik untuk melihat detail
4. Update status:
   - **Pending** → Menunggu konfirmasi
   - **Confirmed** → Dikonfirmasi
   - **Cancelled** → Dibatalkan
5. Tambah catatan admin jika perlu
6. Kirim notifikasi WA

## F. Cara Update Pengaturan Cafe

1. Buka tab "Pengaturan"
2. Edit informasi:
   - Nama cafe
   - Alamat
   - Nomor telepon
   - Instagram
   - Logo & hero image
   - Jam buka/tutup
   - Rekening bank
   - QRIS
   - Biaya delivery
3. Klik "Simpan"

---

# 🔐 KEEAMANAN

## Password Admin

Password admin disimpan dalam bentuk hash (SHA-256) di database untuk keamanan.

### Cara Reset Password:
1. Buka URL: `yourdomain.com/admin`
2. Klik "Lupa Password"
3. Masukkan Master Key
4. Buat password baru

**Master Key Default:** (Tanyakan ke developer)

## Session Management

- Session berlaku 24 jam
- Cookie httpOnly untuk keamanan
- Auto logout setelah session expired

---

# 🚀 DEPLOYMENT

## Platform yang Direkomendasikan:
- **Vercel** (Gratis, optimal untuk Next.js)
- **Netlify** (Alternatif gratis)
- **Railway** (Database + hosting)

## Langkah Deploy:
1. Push kode ke GitHub
2. Hubungkan ke Vercel
3. Set environment variables
4. Deploy

---

# 📞 SUPPORT

Untuk pertanyaan teknis atau bantuan:
- GitHub: github.com/BongSkuy
- WhatsApp: [Hubungi developer]

---

**Dokumen ini dibuat untuk Star Village Coffee**
**Versi 2.1.0 | Tanggal: Maret 2026**
