export interface NavLink {
  label: string;
  href: string;
}

export interface ProblemItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  impact: string;
}

export interface StepItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  points: string[];
}

export interface FeatureItem {
  id: string;
  title: string;
  tag: string;
  description: string;
  highlight: string;
  details: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  badge: {
    text: string;
    isActive: boolean;
  };
  description: string;
  target: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  isPrimary?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const landingContent = {
  brand: {
    name: "PayBuy",
    tagline: "Kasir & Pemesanan Mandiri UMKM",
    logoText: "PAYBUY",
  },

  navbar: {
    links: [
      { label: "Cara Kerja", href: "#cara-kerja" },
      { label: "Fitur", href: "#fitur" },
      { label: "Simulasi", href: "#simulasi" },
      { label: "Harga", href: "#harga" },
      { label: "FAQ", href: "#faq" },
    ] as NavLink[],
    loginText: "Masuk",
    loginHref: "/masuk",
    registerText: "Daftar Toko Gratis",
    registerHref: "/daftar",
  },

  hero: {
    badge: "Sistem Kasir & Pemesanan Mandiri UMKM Kuliner",
    headline: "Pesanan Rapi Tanpa Antri, Bayar Dulu, Dapur Tenang.",
    description:
      "Aplikasi berbasis web untuk warung makan, kafe, dan kedai minuman. Pelanggan cukup scan satu QR menu di meja atau konter tanpa download aplikasi. Pesanan masuk dapur hanya setelah dibayar lunas.",
    primaryCta: {
      text: "Daftar Toko Gratis",
      href: "/daftar",
    },
    secondaryCta: {
      text: "Lihat Cara Kerja",
      href: "#cara-kerja",
    },
    trustPoints: [
      "100% Gratis operasional awal",
      "Pelanggan tanpa akun & aplikasi",
      "Satu QR cetak seumur toko",
    ],
    sampleReceipt: {
      storeName: "Kedai Kopi Kawan",
      slug: "kopi-kawan",
      queueNumber: "042",
      orderDate: "Hari ini, 12:20 WIB",
      items: [
        { name: "Nasi Ayam Sambal Matah", qty: 1, price: 24000 },
        { name: "Es Kopi Susu Gula Aren", qty: 1, price: 16000 },
        { name: "Kentang Goreng Crispy", qty: 1, price: 12000 },
      ],
      total: 52000,
      paymentMethod: "QRIS Dinamis Otomatis",
      status: "Siap Diambil",
    },
  },

  problem: {
    overline: "TANTANGAN OPERASIONAL",
    headline: "Kendala Klasik yang Sering Bikin Warung & Kafe Kewalahan",
    description:
      "Usaha kuliner skala kecil sering kehilangan pelanggan bukan karena rasa makanan, melainkan kekacauan di konter kasir dan antrian dapur.",
    problems: [
      {
        id: "p1",
        badge: "Kekacauan Dapur",
        title: "Salah Catat & Lupa Pesanan",
        description:
          "Bon kertas manual sering terselip, kotor, atau tulisan tangan koki tak terbaca. Pesanan tertukar berujung komplain dan bahan makanan terbuang sia-sia.",
        impact: "Dapur berantakan & pelanggan menunggu terlalu lama.",
      },
      {
        id: "p2",
        badge: "Kasir Menumpuk",
        title: "Kasir Kewalahan Saat Jam Ramai",
        description:
          "Kasir harus mencatat menu, menghitung total, menerima uang tunai, dan memeriksa bukti transfer bank manual sambil berteriak ke bagian dapur.",
        impact: "Antrian mengular di depan meja konter.",
      },
      {
        id: "p3",
        badge: "Beban Biaya",
        title: "Mesin Kasir (POS) Mahal & Rumit",
        description:
          "Perangkat keras kasir konvensional berharga jutaan rupiah ditambah biaya langganan bulanan mahal. Terlalu rumit dan berat bagi UMKM kecil.",
        impact: "Pemilik toko kesulitan memiliki pencatatan keuangan yang rapi.",
      },
    ] as ProblemItem[],
  },

  howItWorks: {
    overline: "ALUR SEDERHANA",
    headline: "3 Langkah Kilat: Dari Scan QR Hingga Makanan Siap",
    description:
      "Tanpa repot mengunduh aplikasi di Play Store atau App Store. Pelanggan cukup membuka kamera ponsel mereka.",
    steps: [
      {
        number: "01",
        title: "Scan QR Menu di Meja / Konter",
        subtitle: "Pelanggan tanpa akun",
        description:
          "Toko hanya perlu mencetak satu QR code tetap. Pelanggan memindai QR lewat kamera ponsel untuk langsung membuka katalog menu yang selalu ter-update.",
        points: [
          "QR tidak pernah berubah walau menu berganti",
          "Ringan dan cepat di jaringan seluler apa pun",
          "Menu langsung menampilkan foto dan harga jual",
        ],
      },
      {
        number: "02",
        title: "Pilih Menu & Bayar Langsung",
        subtitle: "Bayar dulu, masak kemudian",
        description:
          "Pelanggan memilih makanan ke keranjang, lalu membayar dengan QRIS dinamis (nominal otomatis terisi tanpa takut salah transfer) atau bayar tunai di kasir.",
        points: [
          "QRIS milik toko sendiri dengan nominal otomatis",
          "Bebas salah ketik nominal transfer",
          "Pilihan bayar tunai langsung dikonfirmasi kasir",
        ],
      },
      {
        number: "03",
        title: "Dapur Masak, Panggil Nomor Antrian",
        subtitle: "Ambil mandiri di konter",
        description:
          "Pesanan lunas seketika muncul di layar tablet/HP dapur. Koki memasak sesuai urutan waktu bayar, lalu kasir memanggil nomor antrian saat pesanan siap diambil.",
        points: [
          "Dapur hanya menerima pesanan yang sudah lunas",
          "Nomor antrian 001 reset harian otomatis",
          "Pelanggan memantau status pesanan di HP sendiri",
        ],
      },
    ] as StepItem[],
  },

  features: {
    overline: "FITUR UTAMA",
    headline: "Dirancang Khusus untuk Ritme Cepat Bisnis Kuliner",
    description:
      "Setiap modul dibangun berdasarkan kebutuhan nyata di lapangan: simpel, anti-bocor data, dan mudah dioperasikan di smartphone biasa.",
    items: [
      {
        id: "qr-forever",
        tag: "Katalog & Menu",
        title: "Satu QR Code Seumur Toko",
        description:
          "Cukup cetak satu stiker QR untuk meja atau kasir. Ganti harga, tambah menu baru, atau sembunyikan menu habis kapan saja tanpa perlu mencetak ulang stiker QR.",
        highlight: "Cetak sekali, pakai selamanya",
        details: [
          "Format unduh stiker siap cetak (PNG resolusi tinggi & SVG vektor)",
          "Tandai menu sementara habis dalam 1 klik dari HP",
          "Harga modal toko dijamin tidak pernah bocor ke publik",
        ],
      },
      {
        id: "kds-screen",
        tag: "Operasional Dapur",
        title: "Layar Dapur Waktu Nyata (KDS)",
        description:
          "Gantikan tumpukan kertas bon dengan layar dapur modern di tablet atau smartphone koki. Pesanan yang lunas langsung masuk otomatis tanpa muat ulang halaman.",
        highlight: "Update otomatis tanpa reload",
        details: [
          "Dapur hanya menerima pesanan berstatus Lunas",
          "Tombol besar sentuh satu kali: 'Mulai Masak' & 'Siap Diambil'",
          "Indikator pewaktu pesanan (hijau, kuning, merah)",
        ],
      },
      {
        id: "dynamic-qris",
        tag: "Pembayaran Otomatis",
        title: "QRIS Dinamis Tanpa Ketik Nominal",
        description:
          "Gunakan QRIS toko yang sudah Anda miliki. Sistem secara otomatis menyisipkan total belanja ke dalam kode QR sehingga pelanggan tidak perlu mengetik nominal lagi.",
        highlight: "Nominal presisi & aman",
        details: [
          "Uang masuk 100% langsung ke rekening toko Anda",
          "Bebas risiko salah transfer kurang bayar dari pelanggan",
          "Dukungan pembayaran tunai untuk pelanggan yang membawa uang pas",
        ],
      },
      {
        id: "profit-reports",
        tag: "Keuangan & Laporan",
        title: "Laporan Laba Rugi & HPP Akurat",
        description:
          "Bukan sekadar mencatat omzet kotor! Sistem menyalin harga modal (HPP) setiap kali transaksi terjadi dan menghitung laba bersih riil setelah dikurangi biaya operasional.",
        highlight: "Tahu keuntungan bersih sebenarnya",
        details: [
          "Perhitungan otomatis: Omzet - HPP = Laba Kotor",
          "Pencatatan pos pengeluaran harian (belanja bahan, gas, sewa)",
          "Hanya pesanan yang lunas yang masuk ke pembukuan",
        ],
      },
      {
        id: "team-roles",
        tag: "Hak Akses Pegawai",
        title: "Manajemen Tim: Kasir, Koki, & Gudang",
        description:
          "Bagi tugas tim toko Anda dengan hak akses yang terkunci rapi. Pegawai kasir tidak bisa melihat harga modal atau laporan laba rugi milik owner.",
        highlight: "Aman & terisolasi penuh",
        details: [
          "Role khusus: Owner, Kasir, Koki, dan Admin Gudang",
          "Akses pegawai bisa dinonaktifkan seketika bila ada pergantian staf",
          "Data toko Anda terisolasi 100% dari toko pengguna lain",
        ],
      },
    ] as FeatureItem[],
  },

  interactiveDemo: {
    overline: "SIMULASI ANTARMUKA",
    headline: "Lihat Bagaimana PayBuy Bekerja di Tiga Layar Sekaligus",
    description:
      "Klik tab di bawah untuk melihat preview antarmuka nyata dari sudut pandang Pelanggan, Koki Dapur, dan Kasir Konter.",
  },

  pricing: {
    overline: "PAKET & HARGA",
    headline: "Mulai Gratis Hari Ini, Siap Tumbuh Bersama Bisnis Anda",
    description:
      "Paket Gratis aktif selamanya untuk seluruh operasional inti toko Anda. Fitur berbayar disiapkan untuk masa depan bisnis Anda.",
    plans: [
      {
        id: "free",
        name: "Paket Gratis",
        price: "Rp 0",
        period: "selamanya",
        badge: {
          text: "Aktif Digunakan",
          isActive: true,
        },
        description:
          "Semua fitur operasional inti yang dibutuhkan satu toko untuk langsung buka dan menerima pesanan.",
        target: "Cocok untuk kedai, warung makan, kafe kecil, dan booth F&B.",
        features: [
          "1 Toko dengan slug permanen",
          "Satu QR code seumur toko (unduh PNG/SVG)",
          "Pemesanan mandiri pelanggan tanpa batas",
          "Nomor antrian harian otomatis (reset tiap hari)",
          "Dukungan QRIS toko sendiri & Tunai",
          "Layar Dapur (KDS) & Layar Kasir interaktif",
          "Manajemen menu & kategori tak terbatas",
          "Pencatatan pengeluaran & laporan laba rugi dasar",
          "Tambah akun pegawai (Kasir, Koki, Gudang)",
        ],
        ctaText: "Mulai Gratis Sekarang",
        ctaHref: "/daftar",
        isPrimary: true,
      },
      {
        id: "pro",
        name: "Paket Pro",
        price: "Segera Hadir",
        period: "showcase",
        badge: {
          text: "Segera Hadir",
          isActive: false,
        },
        description:
          "Fitur otomasi lanjutan dan verifikasi pembayaran otomatis untuk bisnis yang semakin sibuk.",
        target: "Untuk restoran & kafe yang membutuhkan efisiensi maksimal.",
        features: [
          "Semua fitur di Paket Gratis",
          "Verifikasi pembayaran QRIS otomatis (Payment Gateway)",
          "Mode pemesanan meja tetap (QR per nomor meja)",
          "Notifikasi WhatsApp status pesanan siap ke pelanggan",
          "Ekspor riwayat transaksi ke format CSV & Excel",
          "Kustomisasi format nomor antrian (misal A-001)",
        ],
        ctaText: "Gabung Daftar Tunggu",
        ctaHref: "#faq",
        isPrimary: false,
      },
      {
        id: "maximal",
        name: "Paket Maximal",
        price: "Segera Hadir",
        period: "showcase",
        badge: {
          text: "Segera Hadir",
          isActive: false,
        },
        description:
          "Solusi skala besar untuk bisnis kuliner yang mengelola banyak cabang dan rantai pasok.",
        target: "Untuk brand kuliner yang berekspansi ke multi-cabang.",
        features: [
          "Semua fitur di Paket Pro",
          "Multi-cabang terintegrasi dalam 1 akun owner",
          "Pengurangan stok bahan baku otomatis per porsi",
          "Peringatan stok menipis & riwayat mutasi barang",
          "Laporan konsolidasi antar-cabang",
          "Dukungan prioritas 24/7 dan onboarding privat",
        ],
        ctaText: "Gabung Daftar Tunggu",
        ctaHref: "#faq",
        isPrimary: false,
      },
    ] as PricingPlan[],
  },

  faq: {
    overline: "TANYA JAWAB",
    headline: "Pertanyaan yang Sering Diajukan",
    description:
      "Punya pertanyaan sebelum mulai menggunakan PayBuy? Temukan jawabannya di bawah ini.",
    items: [
      {
        question: "Apakah pelanggan harus membuat akun atau mendownload aplikasi?",
        answer:
          "Tidak perlu sama sekali! Pelanggan cukup memindai kode QR menggunakan kamera ponsel atau aplikasi scanner bawaan. Halaman menu langsung terbuka di browser ponsel mereka, memilih menu, dan membayar tanpa mengisi data pribadi atau formulir pendaftaran.",
      },
      {
        question: "Bagaimana jika warung atau kafe saya belum memiliki QRIS?",
        answer:
          "Jangan khawatir! Saat pendaftaran, toko dapat memilih opsi hanya menerima Tunai. Pelanggan tetap bisa memilih menu di HP mereka, lalu membawa nomor pesanannya ke kasir untuk membayar tunai. Anda bisa menambahkan QRIS kapan saja di menu pengaturan setelah memilikinya.",
      },
      {
        question: "Apakah ada potongan biaya transaksi atau biaya admin tersembunyi?",
        answer:
          "Tidak ada potongan biaya transaksi dari sistem kami untuk Paket Gratis! Karena Anda menggunakan kode QRIS milik toko Anda sendiri, 100% uang pembayaran pelanggan langsung masuk ke rekening bank / e-wallet toko Anda sesuai ketentuan penyedia QRIS Anda.",
      },
      {
        question: "Kapan tepatnya pesanan diteruskan ke layar dapur koki?",
        answer:
          "Sesuai prinsip 'Bayar Dulu, Masak Kemudian', pesanan baru akan muncul di layar dapur setelah pembayaran lunas. Untuk metode QRIS, status berubah begitu pelanggan menekan konfirmasi bayar. Untuk tunai, kasir menekan tombol 'Konfirmasi Bayar' di konter.",
      },
      {
        question: "Bagaimana jika pelanggan menutup halaman browser setelah memesan?",
        answer:
          "Pelanggan dapat membuka kembali tautan status pesanan mereka dari riwayat browser. Setiap pesanan memiliki tautan dengan token acak yang unik dan nomor antrian tetap berlaku hingga pesanan diambil.",
      },
      {
        question: "Perangkat apa saja yang dibutuhkan untuk kasir dan dapur?",
        answer:
          "Tidak butuh perangkat POS khusus yang mahal! Anda cukup menggunakan smartphone, tablet Android/iPad, atau laptop/PC yang sudah ada di toko yang terhubung ke jaringan internet.",
      },
    ] as FaqItem[],
  },

  cta: {
    headline: "Siap Merapikan Kasir & Melipatgandakan Efisiensi Toko Anda?",
    subheadline:
      "Daftar dalam 2 menit tanpa biaya. Masukkan menu pertama Anda, cetak QR kode, dan mulai rasakan nikmatnya alur dapur yang tenang.",
    buttonText: "Daftar Toko Anda Sekarang — Gratis",
    buttonHref: "/daftar",
    note: "Tanpa kartu kredit. Tidak perlu download aplikasi untuk pelanggan Anda.",
  },

  footer: {
    description:
      "Sistem kasir dan pemesanan mandiri berbasis web untuk UMKM makanan dan minuman di seluruh Indonesia. Berbasis 'Hijau Nota' yang kokoh, cepat, dan mudah.",
    sections: [
      {
        title: "Navigasi",
        links: [
          { label: "Cara Kerja", href: "#cara-kerja" },
          { label: "Fitur Unggulan", href: "#fitur" },
          { label: "Paket & Harga", href: "#harga" },
          { label: "Tanya Jawab (FAQ)", href: "#faq" },
        ],
      },
      {
        title: "Akses Pengguna",
        links: [
          { label: "Masuk Dashboard", href: "/masuk" },
          { label: "Daftar Toko Baru", href: "/daftar" },
          { label: "Lupa Kata Sandi", href: "/lupa-sandi" },
        ],
      },
      {
        title: "Informasi",
        links: [
          { label: "Tentang Kami", href: "#" },
          { label: "Panduan QR Menu", href: "#" },
          { label: "Ketentuan Layanan", href: "#" },
          { label: "Kebijakan Privasi", href: "#" },
        ],
      },
    ],
    copyright: "© 2026 PayBuy (Proyek Kasir UMKM). Seluruh hak cipta dilindungi.",
    subText: "Dibuat dengan cermat untuk memajukan UMKM kuliner Indonesia.",
  },
};
