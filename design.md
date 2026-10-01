# Panduan Desain
## Aplikasi Kasir & Pemesanan Mandiri untuk UMKM

| | |
|---|---|
| **Versi** | 0.1 (Draft) |
| **Tanggal** | 30 September 2026 |
| **Arah desain** | **Hijau Nota** |
| **Dokumen terkait** | PRD.md, arsitektur.md |

> **Status keputusan.** **[Diputuskan]** = sudah disepakati, **[Usulan]** = rekomendasi yang masih bisa diubah, **[Terbuka]** = belum ditentukan (lihat Bagian 16).
> **Catatan perubahan:** hijau terang (Hijau Pucuk, lime) pada versi sebelumnya diganti menjadi **Hijau Mint**. Warna ini hanya satu token (`--mint`), sehingga mudah diganti lagi tanpa mengubah komponen (lihat Bagian 2.5).

---

## 1. Ringkasan dan Prinsip

**Hijau Nota** adalah bahasa visual yang mengambil identitas dari benda yang dekat dengan dunia kasir: **nota, karcis antrian, dan bon dapur**, dengan palet dua hijau, bentuk tegas, dan tanpa efek "lembut" yang lazim pada tampilan buatan AI.

| # | Prinsip | Artinya dalam praktik |
|---|---|---|
| D1 | **Solid, bukan lembut.** | Warna datar, garis tegas, bayangan keras. **Tanpa gradient**, blur, kaca, atau glow. |
| D2 | **Cepat dibaca di tengah kesibukan.** | Kontras tinggi, target sentuh besar, angka dan status menonjol. |
| D3 | **Hijau berarti sesuatu.** | Hutan = struktur, Daun = aksi, Mint = sorotan. Tidak dipakai sembarangan. |
| D4 | **Ciri khas dari domain, bukan dari efek.** | Karcis, nota, cap LUNAS, titik penuntun harga. |
| D5 | **Konsisten lewat token.** | Komponen memakai nama semantik, bukan hex langsung. |
| D6 | **Ramah untuk semua.** | Aksesibel, terbaca di ponsel murah dan cahaya terang. |

**Font [Diputuskan]:** judul **Montserrat**, semua teks lainnya **Inter**.
**Palet [Diputuskan]:** berbasis hijau dan satu hijau lainnya; **tanpa gradient**.

---

## 2. Warna

### 2.1 Palet inti

| Nama | Token CSS | Hex | Peran | Teks di atasnya |
|---|---|---|---|---|
| **Hijau Hutan** | `--forest` | `#0F3D2A` | Struktur: sidebar, footer, blok section gelap, garis tepi, judul | Putih |
| **Hijau Hutan 2** | `--forest-2` | `#17513A` | Hover/aktif pada permukaan Hutan (sidebar) | Putih |
| **Hijau Daun** | `--leaf` | `#1B7F45` | **Aksi:** tombol primer, tautan, fokus | Putih |
| **Hijau Daun Gelap** | `--leaf-hover` | `#166B3A` | Hover tombol primer | Putih |
| **Hijau Daun Tekan** | `--leaf-active` | `#125A31` | Tombol saat ditekan | Putih |
| **Hijau Mint** | `--mint` | `#A5D8B4` | **Sorotan:** cap LUNAS, penanda kecil, status siap | Tinta |

### 2.2 Netral kehijauan

| Nama | Token CSS | Hex | Peran |
|---|---|---|---|
| Putih Embun | `--bg` | `#F6FAF6` | Latar halaman |
| Putih | `--surface` | `#FFFFFF` | Kartu, dialog, tabel |
| Embun Tua | `--surface-2` | `#EAF4EC` | Permukaan sekunder, header tabel, baris selang-seling |
| Garis | `--line` | `#CFE0D2` | Pembatas halus (dekoratif) |
| Garis Kontrol | `--control` | `#6F8B78` | Tepi input dan kontrol (memenuhi kontras elemen antarmuka) |
| Latar Nonaktif | `--disabled-bg` | `#E3ECE5` | Latar kontrol nonaktif |
| Tinta | `--ink` | `#12201A` | Teks utama |
| Teks Redam | `--muted` | `#4F6357` | Teks sekunder |
| Teks Nonaktif | `--disabled-text` | `#7A8C80` | Teks kontrol nonaktif (tidak wajib memenuhi kontras) |

### 2.3 Warna semantik

| Nama | Token CSS | Hex | Peran | Teks di atasnya |
|---|---|---|---|---|
| Merah | `--danger` | `#C8371F` | Bahaya, hapus, batal | Putih |
| Merah Gelap | `--danger-hover` | `#A82D18` | Hover aksi bahaya | Putih |
| Kuning | `--amber` | `#F2B01E` | Menunggu, peringatan | Tinta |
| Biru | `--blue` | `#2F5D8A` | Informasi, status dibayar | Putih |
| Jingga Bata | `--brick` | `#B4501C` | Status diproses | Putih |
| Abu Hijau | `--gray-green` | `#6F8076` | Status selesai/netral | Putih |

### 2.4 Warna status pesanan

| Status | Label tampilan | Warna | Ikon | Catatan |
|---|---|---|---|---|
| `menunggu_bayar` | Menunggu pembayaran | Kuning (teks Tinta) | jam | |
| `dibayar` | Sudah dibayar | Biru (teks Putih) | koin/centang | |
| `diproses` | Sedang dimasak | Jingga Bata (teks Putih) | wajan/api | |
| `siap` | Siap diambil | **Mint** (teks Tinta) + **garis tepi Hutan** | centang tebal | Mint di atas putih kontrasnya rendah, jadi wajib diberi garis tepi Hutan |
| `diambil` | Selesai | Abu Hijau (teks Putih) | tas/centang | |
| `dibatalkan` | Dibatalkan | Merah (teks Putih) | silang | |
| `kedaluwarsa` | Waktu habis | Abu Hijau (teks Putih) | jam berhenti | |

**Aturan status:** status **tidak pernah** disampaikan lewat warna saja; selalu ada label teks dan ikon.

### 2.5 Aturan pemakaian warna

1. **Proporsi:** sekitar 60% netral terang (Putih Embun dan Putih), 30% Hutan, 10% Daun dan Mint.
2. **Hutan = struktur.** Tidak dipakai sebagai warna tombol.
3. **Daun = bisa ditekan.** Hijau terang di atas latar terang berarti aksi. Pengguna belajar pola ini, jadi Daun tidak dipakai untuk dekorasi murni.
4. **Mint = sorotan.** Maksimal satu atau dua elemen Mint per layar. Selalu diberi **garis tepi Hutan** karena kontrasnya rendah terhadap latar putih.
5. **QR pembayaran memakai modul hitam dan latar putih**, tanpa warna merek atau logo di dalamnya, agar terbaca oleh semua aplikasi pembayaran.
6. Tidak ada gradient, transparansi bertingkat sebagai pengganti warna, atau bayangan kabur.
7. **Mode gelap tidak termasuk versi awal.** **[Usulan]**

### 2.6 Alternatif pengganti Mint

Kalau Mint kurang cocok, cukup ganti nilai `--mint`:

| Opsi | Hex | Kesan |
|---|---|---|
| **Hijau Mint** (saat ini) | `#A5D8B4` | Segar, lembut |
| Hijau Sage | `#B9D3BF` | Lebih kalem dan natural |
| Hijau Seafoam | `#8FD3C0` | Lebih kebiruan dan modern |

Ketiganya lolos kontras dengan teks Tinta. Periksa ulang dengan alat pengecek kontras bila memilih warna di luar tabel ini.

### 2.7 Catatan kontras

Pasangan teks-latar yang dianjurkan diperkirakan berada di atas **4,5:1** (batas AA untuk teks biasa): Putih di atas Hutan, Daun, Biru, Jingga Bata, dan Merah; Tinta di atas Mint, Kuning, dan Putih Embun; Teks Redam di atas Putih Embun. **Wajib diverifikasi** dengan alat pengecek kontras sebelum warna dikunci. Elemen antarmuka non-teks (tepi input) memakai `--control` yang diarahkan memenuhi 3:1.

---

## 3. Tipografi

### 3.1 Keluarga font

| Peran | Font | Bobot | Pemakaian |
|---|---|---|---|
| **Judul** | **Montserrat** | 500, 600, 700 | Judul halaman dan section, nomor antrian, cap LUNAS, total besar |
| **Isi & antarmuka** | **Inter** | 400, 500 | Isi, form, tombol, tabel, harga, label |

### 3.2 Skala tipografi

| Gaya | Font | Bobot | Ukuran / tinggi baris (desktop) | Ukuran / tinggi baris (ponsel) | Tracking |
|---|---|---|---|---|---|
| Display (hero landing) | Montserrat | 600 | 56 / 60 | 36 / 42 | −0,02em |
| H1 | Montserrat | 600 | 40 / 46 | 30 / 36 | −0,015em |
| H2 | Montserrat | 600 | 30 / 36 | 24 / 30 | −0,01em |
| H3 | Montserrat | 500 | 22 / 28 | 20 / 26 | 0 |
| H4 | Montserrat | 500 | 18 / 24 | 18 / 24 | 0 |
| Body besar (landing) | Inter | 400 | 18 / 28 | 17 / 26 | 0 |
| Body | Inter | 400 | 16 / 24 | 16 / 24 | 0 |
| Body kecil | Inter | 400 | 14 / 20 | 14 / 20 | 0 |
| Label / tombol | Inter | 500 | 14–16 / 20 | 14–16 / 20 | 0 |
| Caption | Inter | 400 | 12 / 16 | 12 / 16 | +0,01em |
| Overline | Inter | 500 | 12 / 16 | 12 / 16 | +0,08em, huruf kapital |
| Nomor antrian XL (status pelanggan) | Montserrat | 600 | 96 / 96 | 72 / 72 | −0,02em |
| Nomor antrian layar dapur | Montserrat | 600 | 48 / 48 | 40 / 40 | −0,01em |

### 3.3 Aturan tipografi

1. **Montserrat lebar.** Judul panjang cepat memenuhi baris; pakai tinggi baris rapat (1,1–1,2) dan usahakan judul pendek.
2. **Angka uang dan kolom angka** memakai Inter dengan **angka tabular** (`tabular-nums`) agar digit rata; angka rata kanan pada tabel.
3. **Nol bertanda** (`slashed-zero`) diaktifkan pada tampilan yang membutuhkan pembedaan 0 dan O (mis. kode).
4. Format uang: `Rp 25.000` (titik sebagai pemisah ribuan, tanpa desimal).
5. Panjang baris isi maksimal sekitar 65–75 karakter.
6. Ukuran teks minimum 12px (caption); teks fungsional utama minimal 14px.
7. Jangan memakai lebih dari dua bobot dalam satu blok teks.
8. Judul memakai huruf kapital hanya di awal kalimat (sentence case); huruf kapital penuh hanya untuk overline dan cap.

### 3.4 Pemuatan font

Gunakan `next/font/google` dengan **variable font**, subset Latin, `display: swap`, dan definisikan sebagai variabel CSS:

```tsx
// app/layout.tsx (garis besar)
const heading = Montserrat({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const body    = Inter({      subsets: ["latin"], variable: "--font-body",    display: "swap" });
// <html lang="id" className={`${heading.variable} ${body.variable}`}>
```

Petakan ke Tailwind sebagai `font-heading` dan `font-sans`. Muat hanya sumbu dan bobot yang dipakai untuk menjaga kecepatan di jaringan seluler.

---

## 4. Tata Letak dan Jarak

### 4.1 Skala jarak (basis 4px)
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`. Jarak di antara elemen selalu memakai nilai dari skala ini.

### 4.2 Breakpoint
Mengikuti bawaan Tailwind: `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Tulis gaya dasar untuk ponsel, tambahkan ke atas.

### 4.3 Kontainer dan grid

| Permukaan | Lebar konten | Padding halaman | Catatan |
|---|---|---|---|
| Landing | maks. 1200px | 16 (ponsel) / 32 (desktop) | Grid 12 kolom di desktop, 4 di ponsel; tata letak boleh asimetris |
| Menu publik | maks. 560px, di tengah pada layar lebar | 16 | Satu kolom; keranjang menempel di bawah pada ponsel |
| Halaman status pelanggan | maks. 480px | 16 | Nomor antrian di bagian atas |
| Dashboard | Fluid, sidebar 256px (ciut 72px) | 24 | Konten maks. 1280px |
| Layar dapur | Fluid, kartu dalam grid responsif | 16 | Kartu 2–4 kolom sesuai lebar tablet |

### 4.4 Kepadatan
- **Landing:** lega (jarak antar-section 64–96px).
- **Dashboard:** padat namun terbaca (tinggi baris tabel 48px).
- **Layar dapur dan kasir:** besar dan jarang, mengutamakan target sentuh.

---

## 5. Bentuk, Garis, dan Elevasi

### 5.1 Radius
| Elemen | Radius |
|---|---|
| Badge, chip | 6px |
| Tombol, input, kartu, dialog | 8px |
| Avatar | 9999px (satu-satunya bentuk bulat penuh) |

**Tidak ada** bentuk kapsul untuk tombol atau sudut sangat bulat (≥16px).

### 5.2 Garis tepi
| Jenis | Ketebalan | Warna | Dipakai pada |
|---|---|---|---|
| Tegas | 2px | `--forest` | Tombol, kartu pelanggan, karcis, dialog, toast |
| Halus | 1px | `--line` | Kartu dashboard, tabel, pembatas |
| Kontrol | 2px | `--control` | Input, select, textarea, checkbox |
| Putus-putus | 2px dashed | `--forest` atau `--line` | Motif sobekan karcis, kotak nomor antrian |

### 5.3 Bayangan keras
- `--shadow-hard: 4px 4px 0 var(--forest)` untuk kartu penting.
- `--shadow-hard-sm: 3px 3px 0 var(--forest)` untuk tombol.
- `--shadow-hard-lg: 6px 6px 0 var(--forest)` untuk dialog.
- **Tidak ada bayangan kabur (blur).** Elemen dashboard biasa tidak memakai bayangan.

### 5.4 Keadaan interaksi (tombol dan kartu yang bisa ditekan)
| Keadaan | Perilaku |
|---|---|
| Diam | Bayangan keras 3px |
| Hover | Warna latar satu tingkat lebih gelap; posisi tetap |
| Ditekan (active) | Elemen bergeser `translate(3px, 3px)` dan bayangan menjadi 0, seperti tombol fisik |
| Fokus (keyboard) | Cincin 3px `--leaf` dengan jarak 2px dari elemen; pada permukaan Hutan memakai cincin `--mint` |
| Nonaktif | Latar `--disabled-bg`, teks `--disabled-text`, tanpa bayangan, kursor tidak diperbolehkan |
| Memuat | Spinner di dalam tombol, lebar tombol tetap, klik diabaikan |

### 5.5 Lapisan
Overlay dialog memakai warna `--ink` dengan opasitas solid 60%, **tanpa blur**. Urutan z-index: konten < sticky < dropdown < dialog < toast.

---

## 6. Motif Ciri Khas

### 6.1 Karcis dan takik
- Kartu pesanan berbentuk karcis: dua takik setengah lingkaran di sisi kiri dan kanan pada garis pemisah header dan isi.
- Takik dibuat dengan **mask atau SVG**, bukan gradient, dan warna latar takik mengikuti latar halaman.
- Pemisah dalam karcis: garis putus-putus 2px.

### 6.2 Titik penuntun harga
Baris rincian pesanan: nama di kiri, harga di kanan, dihubungkan titik-titik:

```
Nasi Goreng Spesial ............ Rp 25.000
Es Teh Manis ................... Rp  5.000
```

Implementasi dengan flex dan garis bawah titik-titik (`border-bottom: 2px dotted`) yang mengisi ruang di antara nama dan harga; harga memakai angka tabular.

### 6.3 Nomor antrian sebagai bintang utama
Kotak berborder putus-putus 3px warna Hutan di atas latar putih; label "Nomor antrian kamu" (overline) di atas; nomor Montserrat 600 sangat besar di tengah; nama toko di bawah.

### 6.4 Cap LUNAS
| Properti | Nilai |
|---|---|
| Bentuk | Persegi panjang, radius 8px |
| Isi | Teks **LUNAS**, Montserrat 600, tracking +0,12em, warna Hutan |
| Latar dan tepi | Mint, garis tepi 3px Hutan, bayangan keras kecil |
| Sudut | Miring −4° |
| Animasi muncul | Dari skala 1,6 dan sudut −12° dengan opasitas 0 menuju skala 1 dan −4° dalam 220ms, easing dengan sedikit lonjakan (`cubic-bezier(.2, 1.4, .4, 1)`) |
| Gerak dikurangi | Muncul langsung tanpa animasi |
| Muncul saat | Status berubah ke `dibayar` (halaman status pelanggan dan kartu di kasir) |

### 6.5 Foto dan ilustrasi
- **Foto makanan asli** dari toko; rasio 4:3 (kartu menu) atau 1:1 (daftar), `object-fit: cover`.
- Produk tanpa foto: blok datar `--surface-2` dengan ikon peralatan makan, **bukan** foto stok.
- Ilustrasi (bila ada): bentuk geometris datar dengan palet yang sama; tanpa isometrik stok dan tanpa gradient.

### 6.6 Ikon
Lucide, ketebalan garis 2px (menyesuaikan garis tepi), ukuran 16 / 20 / 24. Tidak memakai emoji sebagai ikon fungsional.

---

## 7. Komponen Atom

Nilai berikut adalah spesifikasi awal yang bisa disesuaikan saat implementasi.

### 7.1 Tombol (Button)

| Varian | Latar | Teks | Tepi | Bayangan | Pemakaian |
|---|---|---|---|---|---|
| **Primary** | `--leaf` | Putih | 2px `--forest` | keras 3px | Aksi utama (Pesan, Simpan, Daftar) |
| **Secondary** | Putih | `--forest` | 2px `--forest` | keras 3px | Aksi pendamping |
| **Danger** | `--danger` | Putih | 2px `#7C2011` | keras 3px (`#7C2011`) | Batalkan, hapus |
| **Ghost** | Transparan | `--forest` | tanpa | tanpa | Aksi tersier, navigasi |
| **Link** | Transparan | `--leaf` | tanpa | tanpa | Tautan dalam teks |

| Ukuran | Tinggi | Padding horizontal | Teks | Dipakai |
|---|---|---|---|---|
| sm | 36px | 12px | 14px | Aksi padat di tabel |
| md | 44px | 20px | 16px | Standar |
| lg | 52px | 24px | 16px | CTA landing, tombol pelanggan |
| xl | 60px | 28px | 18px | Tombol layar dapur dan kasir (target sentuh besar) |

Tombol ikon: persegi sesuai tinggi ukuran; wajib memiliki label aksesibel.

### 7.2 Kolom isian (Input, Textarea, Select)
- Tinggi 44px (52px di layar kasir), radius 8px, tepi 2px `--control`, latar putih, teks `--ink`, placeholder `--muted`.
- Fokus: tepi `--leaf` + cincin fokus.
- Galat: tepi `--danger`, ikon dan pesan galat di bawah (tidak hanya warna).
- Label selalu di atas dan terlihat (tidak mengandalkan placeholder).
- Kolom uang: awalan "Rp" tetap, angka tabular rata kanan.

### 7.3 Kontrol pilihan
- **Checkbox/Radio:** ukuran 24px, tepi 2px `--control`, terpilih berlatar `--leaf` dengan tanda centang putih.
- **Switch:** trek 48×28, bulat penuh diperbolehkan untuk pegangan; aktif `--leaf`, nonaktif `--control`.

### 7.4 Badge
- Tinggi 24px, radius 6px, padding horizontal 8px, teks Inter 500 12px.
- **StatusBadge:** ikon 14px + label; warna sesuai Bagian 2.4. Badge `siap` selalu bertepi 2px Hutan.
- Badge peran pegawai (owner, kasir, koki, admin gudang): latar `--surface-2`, tepi 1px `--line`, teks `--forest`.

### 7.5 Lain-lain
| Komponen | Spesifikasi |
|---|---|
| **Avatar** | Bulat, 32/40px, inisial Montserrat 600 di latar `--surface-2` |
| **Spinner** | Cincin 2px `--leaf` dengan segmen `--forest`; 16/24px |
| **Skeleton** | Blok `--surface-2` dengan pulsa opasitas halus (tanpa gradient shimmer) |
| **Divider** | 1px `--line` atau putus-putus 2px pada motif karcis |
| **Tooltip** | Latar `--forest`, teks putih 12px, radius 6px |

---

## 8. Komponen Molekul dan Organisme

| Komponen | Spesifikasi |
|---|---|
| **FormField** | Label + input + teks bantu/galat; jarak 8px antar-elemen, 24px antar-field |
| **PriceTag** | `Rp` + angka tabular Inter 500; varian coret untuk harga lama (jika kelak ada) |
| **QuantityStepper** | Tombol − dan + ukuran 44px (sekunder), angka di tengah Inter 500 18px; minimum 0, dapat dihapus lewat nilai 0 |
| **SearchInput** | Input dengan ikon cari di kiri dan tombol hapus di kanan |
| **EmptyState** | Ikon 48px `--forest`, judul H4, teks bantu, satu tombol aksi opsional; nada santai |
| **Toast** | Putih, tepi 2px Hutan, bayangan keras 3px, ikon status di kiri, muncul 4 detik, dapat ditutup |
| **Dialog / ConfirmDialog** | Putih, tepi 2px Hutan, bayangan keras 6px, judul H3, tombol aksi di kanan bawah; aksi berbahaya memakai tombol Danger dan menyebut objeknya secara jelas |
| **Tabs** | Garis bawah 3px `--leaf` pada tab aktif; teks Inter 500; target sentuh 44px |
| **Table** | Header `--surface-2`, teks Inter 500 12px kapital kecil; tinggi baris 48px; garis bawah baris 1px `--line`; angka rata kanan tabular; baris dapat diklik memiliki hover `--surface-2` |
| **Pagination** | Tombol sekunder ukuran sm dengan nomor halaman aktif berlatar `--forest` teks putih |
| **Sidebar** | Latar `--forest`; item teks putih 80%; hover `--forest-2`; aktif `--forest-2` dengan penanda kiri 4px `--mint`; ikon 20px |
| **TopBar** | Putih, garis bawah 1px `--line`; nama toko, status buka/tutup (switch), menu pengguna |
| **PageHeader** | Judul H1/H2 + deskripsi singkat + aksi utama di kanan |
| **StatCard** (ringkasan dashboard) | Kartu halus 1px `--line`; label overline, nilai Montserrat 600 28px, perubahan opsional |

---

## 9. Komponen Domain Khas

### 9.1 QueueNumber
Lihat 6.3. Variasi: `xl` (halaman status pelanggan), `lg` (layar antrian publik), `md` (kartu dapur dan kasir).

### 9.2 OrderTicket (layar dapur dan kasir)
| Bagian | Spesifikasi |
|---|---|
| Kerangka | Putih, tepi 2px Hutan, bayangan keras 4px, takik pada pemisah header dan isi |
| Garis status | Strip vertikal 8px di sisi kiri berwarna status (dengan tepi Hutan untuk `siap`) |
| Header | Nomor antrian (Montserrat 600, 48px) di kiri; badge status dan waktu berjalan di kanan |
| Isi | Daftar item: `2×` tebal + nama; catatan (bila ada) di bawah dengan warna redam; pemisah putus-putus |
| Pewaktu | Warna waktu: < 5 menit `--forest`; 5–10 menit `--amber` (dengan ikon); > 10 menit `--danger` (dengan ikon). Ambang dapat diatur. **[Usulan]** |
| Aksi | Satu tombol besar (xl) di bawah: "Mulai masak", "Tandai siap", "Konfirmasi bayar", "Panggil", "Tandai diambil" sesuai konteks; aksi batal berupa tombol Ghost kecil dengan konfirmasi |
| Tanda khusus | Pesanan yang pembayarannya hanya dikonfirmasi pelanggan diberi penanda kecil "Konfirmasi pelanggan" pada header agar kasir mudah memeriksa |

### 9.3 ReceiptCart (keranjang berbentuk nota)
- Judul "Pesanan kamu" dengan pemisah putus-putus.
- Baris item dengan titik penuntun, `QuantityStepper` kecil di baris.
- Subtotal dan **Total** (Montserrat 600, 24px) di bagian bawah nota.
- Di ponsel: bilah ringkas menempel di bawah layar (jumlah item + total + tombol "Lihat pesanan"); membuka lembar nota penuh dari bawah.
- Tombol utama "Pesan sekarang" (lg, Primary).

### 9.4 OrderStatusTimeline
Langkah vertikal: Menunggu pembayaran → Sudah dibayar → Sedang dimasak → Siap diambil. Langkah selesai memakai ikon centang di lingkaran Daun; langkah aktif diberi latar Mint bertepi Hutan dan label medium; langkah berikutnya abu-abu (`--control` tipis). Pembaruan status diiringi cap LUNAS pada langkah "Sudah dibayar".

### 9.5 QrisPayPanel
Karcis putih berisi: nama merchant, **QR** (modul hitam, latar putih, zona tenang minimal 4 modul, ukuran minimal 240px), nominal besar (Montserrat 600), hitung mundur batas waktu, petunjuk singkat, tombol **"Saya sudah bayar"** (lg, Primary), dan tautan batalkan. Bila toko tidak memakai QRIS, panel ini diganti petunjuk membayar tunai di kasir dengan nomor pesanan yang besar.

### 9.6 ProductCard (menu publik)
Foto 4:3 di atas (atau blok ikon), nama Inter 500, deskripsi singkat maksimal dua baris, harga, dan tombol tambah (ikon plus atau stepper bila sudah di keranjang). Produk habis: foto dibuat abu-abu datar (tanpa filter blur), label "Habis" berbadge, tombol nonaktif.

### 9.7 ToastStatus dan StatusBanner
Banner status toko (mis. "Toko sedang tutup") berlatar Kuning bertepi Hutan di bagian atas menu publik.

---

## 10. Gerak

### 10.1 Token gerak
| Token | Durasi | Easing | Dipakai untuk |
|---|---|---|---|
| `fast` | 120ms | `cubic-bezier(.2, 0, 0, 1)` | Hover, perubahan warna |
| `base` | 200ms | `cubic-bezier(.2, 0, 0, 1)` | Buka/tutup dialog, dropdown, tab |
| `slow` | 320ms | `cubic-bezier(.2, 0, 0, 1)` | Reveal section landing |
| `stamp` | 220ms | `cubic-bezier(.2, 1.4, .4, 1)` | Cap LUNAS |

### 10.2 Pola
- **Reveal landing:** geser naik 16px + pudar, sekali saat memasuki layar (IntersectionObserver), tanpa parallax berlebihan.
- **Pesanan baru di layar dapur:** kartu masuk dengan pudar-dan-geser singkat, plus penanda visual (tepi berkedip dua kali dalam warna Kuning); suara opsional.
- **Perubahan status:** transisi warna strip 200ms; cap LUNAS untuk `dibayar`.
- **Tombol ditekan:** pergeseran fisik (Bagian 5.4).

### 10.3 Aturan
1. Hormati `prefers-reduced-motion`: matikan animasi dekoratif, reveal, dan Lenis; cap LUNAS muncul langsung.
2. **Lenis hanya pada landing page** (lihat arsitektur.md). Elemen dengan scroll sendiri diberi atribut pencegah Lenis.
3. Tidak ada animasi yang menghambat interaksi atau membuat pengguna menunggu.
4. Tidak ada animasi berulang tanpa henti selain spinner dan penanda pesanan baru yang terbatas.

---

## 11. Aksesibilitas

| Area | Aturan |
|---|---|
| Kontras | Teks memenuhi 4,5:1 (teks besar 3:1); elemen antarmuka 3:1; verifikasi dengan alat |
| Fokus | Cincin fokus selalu terlihat dan tidak dihapus; urutan tab logis |
| Target sentuh | Minimal 44×44px; layar dapur dan kasir minimal 56px |
| Warna | Status dan galat tidak hanya lewat warna: selalu ada teks dan ikon |
| Form | Label terlihat, galat dijelaskan dengan teks, `aria-invalid` dan `aria-describedby` |
| Bahasa | `lang="id"` pada dokumen |
| Ikon | Ikon dekoratif disembunyikan dari pembaca layar; tombol ikon memiliki nama aksesibel |
| Gerak | Hormati pengurangan gerak (Bagian 10.3) |
| Pembaruan langsung | Perubahan status penting diumumkan lewat region `aria-live` yang sopan |
| Zoom | Tata letak tetap terpakai pada zoom 200% |

---

## 12. Nada Bahasa dan Mikrokopi

### 12.1 Prinsip
- **Bahasa Indonesia santai dan langsung**, kalimat pendek, tanpa jargon teknis.
- **Sapaan:** untuk pelanggan memakai **"kamu"**; untuk owner dan pegawai (landing, dashboard) memakai **"Anda"**. **[Usulan]**
- Hindari klaim muluk ("revolusioner", "seamless", "tanpa batas").
- Pesan galat menjelaskan apa yang terjadi dan apa yang bisa dilakukan, tanpa kode teknis.

### 12.2 Contoh

| Konteks | Gunakan | Hindari |
|---|---|---|
| Tombol pesan | Pesan sekarang | Submit |
| Konfirmasi bayar pelanggan | Saya sudah bayar | Konfirmasi transaksi |
| Keranjang kosong | Belum ada pesanan. Pilih menu dulu, ya. | Keranjang kosong |
| Galat pesanan | Ups, pesanannya belum terkirim. Coba lagi sebentar. | Error 500 |
| Waktu bayar habis | Waktu pembayaran habis. Silakan pesan lagi. | Transaksi kedaluwarsa |
| Pesanan siap | Pesananmu sudah siap! Ambil di kasir dengan nomor 012. | Status: SIAP |
| Produk habis | Habis | Out of stock |
| Toko tutup | Toko sedang tutup. Menu masih bisa dilihat. | Layanan tidak tersedia |
| Konfirmasi batal (kasir) | Batalkan pesanan nomor 012? Alasan pembatalan akan dicatat. | Apakah Anda yakin? |
| Dashboard kosong | Belum ada penjualan hari ini. | No data |

### 12.3 Label status (tampilan pengguna)
Menunggu pembayaran · Sudah dibayar · Sedang dimasak · Siap diambil · Selesai · Dibatalkan · Waktu habis.

---

## 13. Landing Page

Struktur mengikuti komponen section pada arsitektur.md; setiap section satu berkas. Latar bergantian antara Putih Embun dan blok Hutan.

| Section | Isi | Visual dan latar |
|---|---|---|
| **Navbar** | Logo, tautan anchor (Cara kerja, Fitur, Harga, FAQ), Masuk, Daftar | Putih Embun, garis bawah 1px; tombol Daftar Primary |
| **Hero** | Judul Display, sub-judul, dua CTA (Daftar gratis, Lihat cara kerja) | Putih Embun; di sisi visual sebuah **karcis pesanan** besar dengan nomor antrian dan cap LUNAS (bukan ilustrasi stok); tata letak asimetris |
| **Masalah** | Tiga permasalahan UMKM dalam bahasa sehari-hari | Blok Hutan, teks putih, sorotan Mint kecil |
| **Cara kerja** | Tiga langkah: Scan QR → Pesan dan bayar → Ambil dengan nomor | Tiga karcis berjajar dengan angka langkah besar |
| **Fitur** | QR menu, layar dapur, laporan laba rugi, kelola pegawai | Grid asimetris dengan kartu berukuran berbeda; contoh tampilan nyata dari aplikasi |
| **Harga** | Gratis (aktif), Pro dan Maximal (showcase, label "Segera hadir") | Tiga karcis harga; Pro dan Maximal dengan badge Mint bertepi Hutan |
| **FAQ** | Pertanyaan umum (perlu akun pelanggan? bagaimana pembayaran? berapa biaya?) | Akordeon dengan garis putus-putus |
| **CTA akhir** | Ajakan mendaftar | Blok Hutan atau Daun dengan tombol besar |
| **Footer** | Tautan, kontak | Hutan |

Aturan: satu CTA utama per layar, teks hero dan salinan diambil dari `content/landing.ts`, gambar dioptimalkan dan dimuat malas di bawah lipatan.

---

## 14. Permukaan Lain

| Permukaan | Ringkasan tampilan |
|---|---|
| **Onboarding** | Wizard bertahap dengan indikator langkah (angka di karcis kecil), satu keputusan per layar; pertanyaan QRIS dengan dua pilihan besar (Ya, punya / Belum) |
| **Menu publik** | Header toko (nama, status buka/tutup), tab kategori menempel, kartu produk, bilah keranjang di bawah |
| **Halaman status** | Nomor antrian XL, garis waktu status, cap LUNAS, ringkasan pesanan sebagai nota |
| **Dashboard** | Sidebar Hutan, TopBar putih, konten di atas Putih Embun, kartu halus, tabel padat |
| **Layar dapur** | Grid karcis besar, kontras tinggi, koneksi terlihat (indikator hijau/kuning/merah dengan teks) |
| **Layar antrian publik** | Latar Hutan, nomor `siap` sangat besar berlatar Mint bertepi Putih/Hutan, terbaca dari jauh |
| **Halaman QR (owner)** | Pratinjau QR besar di karcis, tombol unduh (PNG dan SVG), petunjuk cetak |

---

## 15. Yang Dihindari dan Daftar Periksa Desain

### 15.1 Dihindari
- Gradient dalam bentuk apa pun (latar, teks, tombol, mesh)
- Efek kaca (glassmorphism), blur, glow, dan bayangan lembut
- Palet ungu-biru neon
- Kartu tiga kolom seragam dengan ikon emoji dan badge "✨ Baru"
- Hero rata tengah yang generik
- Semua elemen berbentuk kapsul atau sudut sangat bulat
- Ilustrasi isometrik stok dan foto stok makanan
- Teks pengisi yang generik ("Solusi terbaik untuk bisnis Anda")

### 15.2 Daftar periksa sebelum menerima sebuah layar
1. Tidak ada gradient, blur, atau bayangan kabur?
2. Warna hanya dari token; Hutan/Daun/Mint dipakai sesuai perannya?
3. Mint (bila ada) bertepi Hutan dan tidak lebih dari dua per layar?
4. Kontras teks dan elemen memenuhi batas?
5. Status dan galat punya teks dan ikon, bukan hanya warna?
6. Target sentuh memadai (44px, dapur dan kasir 56px)?
7. Angka uang memakai tabular dan format `Rp 25.000`?
8. Fokus keyboard terlihat?
9. Gerak menghormati pengurangan gerak?
10. Salinan memakai nada dan sapaan yang benar?

---

## 16. Token Implementasi

### 16.1 Variabel CSS

```css
:root {
  /* Hijau */
  --forest: #0F3D2A;  --forest-2: #17513A;
  --leaf: #1B7F45;    --leaf-hover: #166B3A;  --leaf-active: #125A31;
  --mint: #A5D8B4;

  /* Netral */
  --bg: #F6FAF6;  --surface: #FFFFFF;  --surface-2: #EAF4EC;
  --line: #CFE0D2;  --control: #6F8B78;
  --disabled-bg: #E3ECE5;  --disabled-text: #7A8C80;
  --ink: #12201A;  --muted: #4F6357;

  /* Semantik */
  --danger: #C8371F;  --danger-hover: #A82D18;
  --amber: #F2B01E;  --blue: #2F5D8A;
  --brick: #B4501C;  --gray-green: #6F8076;

  /* Bentuk */
  --radius-sm: 6px;  --radius: 8px;
  --shadow-hard-sm: 3px 3px 0 var(--forest);
  --shadow-hard: 4px 4px 0 var(--forest);
  --shadow-hard-lg: 6px 6px 0 var(--forest);

  /* Gerak */
  --ease: cubic-bezier(.2, 0, 0, 1);
  --ease-stamp: cubic-bezier(.2, 1.4, .4, 1);
}
```

### 16.2 Pemetaan ke Tailwind (nama semantik)

| Nama Tailwind | Token | Catatan |
|---|---|---|
| `bg-background` | `--bg` | Latar halaman |
| `bg-surface`, `bg-surface-2` | `--surface`, `--surface-2` | Kartu dan permukaan sekunder |
| `text-foreground`, `text-muted` | `--ink`, `--muted` | Teks |
| `bg-structure` | `--forest` | Sidebar, footer, blok gelap |
| `bg-primary`, `hover:bg-primary-hover` | `--leaf`, `--leaf-hover` | Aksi |
| `bg-highlight` | `--mint` | Sorotan |
| `border-line`, `border-control` | `--line`, `--control` | Garis |
| `bg-danger`, `bg-warning`, `bg-info` | `--danger`, `--amber`, `--blue` | Semantik |
| `font-heading`, `font-sans` | Montserrat, Inter | Font |
| `shadow-hard`, `shadow-hard-sm`, `shadow-hard-lg` | Bayangan keras | Elevasi |
| `rounded`, `rounded-sm` | 8px, 6px | Radius |

> Cara mendaftarkan token ke tema Tailwind berbeda antar versi (konfigurasi berbasis CSS atau berkas konfigurasi); ikuti dokumentasi versi yang dipakai. Komponen hanya boleh memakai nama semantik di atas, **bukan** hex.

### 16.3 Pemetaan ke struktur komponen (arsitektur.md)

| Level | Komponen dari dokumen ini |
|---|---|
| **Atoms** | Button, Input, Textarea, Select, Checkbox, Radio, Switch, Badge, Avatar, Spinner, Skeleton, Divider, Tooltip |
| **Molecules** | FormField, PriceTag, QuantityStepper, SearchInput, StatusBadge, EmptyState, Toast, DotLeader, StampLunas |
| **Organisms** | LoginForm, RegisterForm, ForgotPasswordForm, OrderTicket, ReceiptCart, QueueNumber, OrderStatusTimeline, QrisPayPanel, ProductCard, DataTable, Sidebar, TopBar, PageHeader, ConfirmDialog, Tabs, Pagination, StatCard |
| **Templates** | AuthLayout, MarketingLayout, DashboardShell, PublicStoreShell |
| **Sections** (`components/sections/landing`) | Navbar, Hero, Problem, HowItWorks, Features, Pricing, Faq, Cta, Footer |

---

## 17. Keputusan Terbuka

| # | Pertanyaan | Asumsi sementara |
|---|---|---|
| 1 | Nama produk dan logo | Belum ada; logo memakai bentuk karcis sederhana berwarna Hutan dan Daun bila dibuat |
| 2 | Warna hijau terang final (Mint, Sage, atau Seafoam) | Mint (dapat diganti lewat satu token) |
| 3 | Mode gelap | Tidak pada versi awal |
| 4 | Ambang warna pewaktu di layar dapur (5/10 menit) | Dapat diatur per toko di kemudian hari |
| 5 | Sapaan pelanggan "kamu" dan pegawai "Anda" | Sesuai Bagian 12.1 |
| 6 | Suara notifikasi pesanan baru di layar dapur | Opsional, dimatikan secara bawaan |
| 7 | Foto/ilustrasi landing page | Karcis pesanan sebagai visual utama; foto warung nyata bila tersedia |
| 8 | Verifikasi kontras final seluruh pasangan warna | Dilakukan dengan alat pengecek sebelum warna dikunci |

---

*Dokumen ini mengikuti PRD.md dan arsitektur.md. Bila token warna atau font berubah, perbarui Bagian 2, 3, dan 16 secara bersamaan.*