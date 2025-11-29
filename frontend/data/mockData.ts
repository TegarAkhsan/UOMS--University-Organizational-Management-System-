import {
  Users,
  Building2,
  HelpCircle,
  Video,
  MessageSquare,
  DollarSign,
  FileText
} from 'lucide-react';

// HELPER TO MAP SHORT NAMES TO FULL NAMES
export const STAFF_MAPPING: any = {
  'putri': 'Nur Aini Setya Putri',
  'gathan': 'Gathan Yandino Putra',
  'septi': 'Septiana Dwi Lestari',
  'firtya': 'Fitrya Chalifatus Zahro',
  'dissa': 'Dissa (Staff)',
  'elia': "Elia Rifana Rif'an",
  'nesyari': 'Nesyari Az-Zahra',
  'rio': 'Rio (Staff)',
  'rosyad': 'Ulur Rosyad Rachmandani',
  'ditio': 'Ditio Septian R',
  'zahra': 'Ardelia Zahra Farsiana',
  'valentania': 'Valentania Alia Febrian',
  'ulil': 'Muhammad Ulil Amri',
  'ega': 'Ega khamidatin niswa',
  'kentsa': 'Gading Kent Sadewa',
  'syawa': 'Syawailie Syaf Anhar',
  'michi': 'Michiana Defi Gunawan',
  'eni': 'Eni (Staff)',
  'makrus': 'Makrus Fahrul Muharrom',
  'jihan': 'Jihan Salma Salsabila',
  'lusida': 'Lusida Cynthia Winayu',
  'diana': 'Diana Safitri'
};

const STAFF_ACCOUNTS = Object.keys(STAFF_MAPPING).map(shortName => ({
  email: `staff${shortName}@himaforticunesa.com`,
  password: 'staffhimafortic',
  role: 'Staff',
  status: 'staff',
  name: STAFF_MAPPING[shortName]
}));

export const AUTH_USERS = [
  { email: 'kahima@himaforticunesa.com', password: 'kahimahimafortic', role: 'Kahima', status: 'superadmin', name: 'Tegar Eka Pambudi El Akhsan' },
  { email: 'wakahima@himaforticunesa.com', password: 'wakahimahimafortic', role: 'Wakil Kahima', status: 'superadmin', name: 'Achmad Diky Setiawan' },
  { email: 'bendahara@himaforticunesa.com', password: 'bendaharahimafortic', role: 'Bendahara', status: 'sub_super_admin_1', name: 'Fiana Agta Riyani' },
  { email: 'Sekretaris@himaforticunesa.com', password: 'Sekretarishimafortic', role: 'Sekretaris', status: 'sub_super_admin_2', name: "Atika Haniifatun Nisa'" },

  // KADEP ACCOUNTS
  { email: 'kadepPSDM@himaforticunesa.com', password: 'kadephimafortic', role: 'Ketua Departemen', status: 'admin', name: 'Fina Fadhilah Maulana' },
  { email: 'kadepDAGRI@himaforticunesa.com', password: 'kadephimafortic', role: 'Ketua Departemen', status: 'admin', name: 'Muhammad Nizar Amirul H.' },
  { email: 'kadepDEPLU@himaforticunesa.com', password: 'kadephimafortic', role: 'Ketua Departemen', status: 'admin', name: 'Salzabila Ananda Putri' },
  { email: 'kadepMNB@himaforticunesa.com', password: 'kadephimafortic', role: 'Ketua Departemen', status: 'admin', name: 'M. Raka Phaedra Agus Putra' },
  { email: 'kadepEKRAF@himaforticunesa.com', password: 'kadephimafortic', role: 'Ketua Departemen', status: 'admin', name: 'Chaterina Fatma Diaksa' },
  { email: 'kadepPENRISTEK@himaforticunesa.com', password: 'kadephimafortic', role: 'Ketua Departemen', status: 'admin', name: 'Gerry Moeis' },
  { email: 'kadepAGSOS@himaforticunesa.com', password: 'kadephimafortic', role: 'Ketua Departemen', status: 'admin', name: 'Vergi Mutia Rahmasyani' },
  { email: 'kadepKOMINFO@himaforticunesa.com', password: 'kadephimafortic', role: 'Ketua Departemen', status: 'admin', name: 'Naufal Rizky Nugroho' },

  // STAFF ACCOUNTS
  { email: 'staffdiana@himafortic.com', password: 'staffhimafortic', role: 'Staff', status: 'staff', name: 'Diana Safitri' },
  { email: 'staffvalentania@himafortic.com', password: 'staffhimafortic', role: 'Staff', status: 'staff', name: 'Valentania Alia Febrian' },
  ...STAFF_ACCOUNTS
];

export const ROLES = [
  'Ketua Himpunan',
  'Wakil Ketua Himpunan',
  'Sekretaris Umum',
  'Sekretaris 1',
  'Sekretaris 2',
  'Bendahara Umum',
  'Bendahara 1',
  'Bendahara 2',
  'Ketua Departemen',
  'Staff'
];

export const BADGES = [
  { id: 1, name: 'Rookie Star', minPoints: 100, description: 'Earned 100 points. A great start!', icon: '⭐' },
  { id: 2, name: 'Proker Warrior', minPoints: 300, description: 'Active in 3+ Prokers.', icon: '🛡️' },
  { id: 3, name: 'Legendary Leader', minPoints: 600, description: 'Led a successful event and earned 600 points.', icon: '👑' },
  { id: 4, name: 'MVP', minPoints: 1000, description: 'Top contributor of the year.', icon: '🏆' }
];

export const RAB_STANDARDS = [
  { category: 'Konsumsi', item: 'Nasi Kotak (Sedang)', price: 15000, unit: 'pax' },
  { category: 'Konsumsi', item: 'Snack Box', price: 7500, unit: 'pax' },
  { category: 'Konsumsi', item: 'Air Mineral (Dus)', price: 35000, unit: 'dus' },
  { category: 'Perlengkapan', item: 'Banner (per meter)', price: 25000, unit: 'meter' },
  { category: 'Perlengkapan', item: 'Sewa Sound System (Kecil)', price: 500000, unit: 'set/hari' },
  { category: 'Kesekretariatan', item: 'Print Warna A4', price: 1000, unit: 'lembar' },
  { category: 'Kesekretariatan', item: 'Jilid Proposal', price: 5000, unit: 'buku' },
];

export const BUDGET_CODES = [
  { code: '101', category: 'Kesekretariatan', description: 'ATK, Print, Jilid, Fotocopy' },
  { code: '102', category: 'Konsumsi', description: 'Makan Besar, Snack, Air Mineral' },
  { code: '103', category: 'Perlengkapan', description: 'Sewa Alat, Banner, Dekorasi, Sound' },
  { code: '104', category: 'Transportasi', description: 'Bensin, Sewa Kendaraan, Parkir' },
  { code: '105', category: 'Publikasi & Dok.', description: 'Paid Promote, Ads, Cetak Foto' },
  { code: '106', category: 'Lain-lain', description: 'Dana Tak Terduga, Kebersihan' },
];

export const REQUIRED_DOCS = [
  {
    id: 1,
    name: 'Proposal Kegiatan',
    deadlineDiff: 30,
    type: 'Pre-Event',
    description: 'Wajib diasistensikan sebelum acara dimulai.',
    signatures: ['Ketupel', 'Kahim', 'Pembina', 'Koorprodi (jika perlu)']
  },
  {
    id: 2,
    name: 'Surat Peminjaman Ruangan',
    deadlineDiff: 25,
    type: 'Pre-Event',
    description: 'TTD Basah. Diserahkan ke Pak Erwan untuk disposisi. FC 4 rangkap (Penjaga, Satpam, Pak Sam, Arsip).',
    signatures: ['Ketupel', 'Kahim', 'Pembina']
  },
  {
    id: 3,
    name: 'Surat Peminjaman Alat',
    deadlineDiff: 25,
    type: 'Pre-Event',
    description: 'TTD Basah. Diserahkan ke Pak Sam untuk pengambilan alat.',
    signatures: ['Ketupel', 'Kahim', 'Pembina']
  },
  {
    id: 4,
    name: 'Surat Undangan Sambutan',
    deadlineDiff: 20,
    type: 'Pre-Event',
    description: 'TTD Digital. Jika ke Pembina (Ketupel, Kahim). Jika ke Koorprodi (Ketupel, Kahim, Pembina).',
    signatures: ['Ketupel', 'Kahim', 'Pembina (opsional)']
  },
  {
    id: 5,
    name: 'Surat Tugas Panitia',
    deadlineDiff: 30,
    type: 'Pre-Event',
    description: 'TTD Basah. Ditujukan ke Dekan. Lampirkan semua BPH. Serahkan ke Pak Rudy. Hardfile ke Pak Erwan.',
    signatures: ['Ketupel', 'Kahim', 'Pembina', 'Koorprodi']
  },
  {
    id: 6,
    name: 'Surat Undangan Pemateri',
    deadlineDiff: 20,
    type: 'Pre-Event',
    description: 'TTD Basah. Luar Dosen (Ketupel, Kahim). Dosen (Ketupel, Kahim, Pembina).',
    signatures: ['Ketupel', 'Kahim', 'Pembina (jika Dosen)']
  },
  {
    id: 7,
    name: 'Surat Permohonan Tugas Pemateri',
    deadlineDiff: 20,
    type: 'Pre-Event',
    description: 'TTD Basah. Serahkan ke Pak Rudy. Hardfile ke Pak Erwan.',
    signatures: ['Kahim', 'Pembina', 'Koorprodi']
  },
  {
    id: 8,
    name: 'Surat Pencairan Dana',
    deadlineDiff: 20,
    type: 'Pre-Event',
    description: 'TTD Basah. Serahkan ke Bu Geby.',
    signatures: ['Ketupel', 'Kahim', 'Pembina', 'Koorprodi']
  },
  {
    id: 9,
    name: 'Surat Permohonan TTD & No. Sertifikat',
    deadlineDiff: 10,
    type: 'Pre-Event',
    description: 'TTD Basah. Ditujukan ke Dekan. Serahkan ke Pak Rudy.',
    signatures: ['Ketupel', 'Kahim', 'Pembina', 'Koorprodi']
  },
  {
    id: 10,
    name: 'Surat Peminjaman Ruangan Prodi Lain',
    deadlineDiff: 25,
    type: 'Pre-Event',
    description: 'TTD Basah. Ditujukan ke Wadek II. FC 3 rangkap (Penjaga, Satpam, Arsip).',
    signatures: ['Ketupel', 'Kahim', 'Pembina', 'Kahim Prodi Lain']
  },
  {
    id: 11,
    name: 'Surat Permohonan Delegasi',
    deadlineDiff: 15,
    type: 'Pre-Event',
    description: 'TTD Digital.',
    signatures: ['Ketupel', 'Kahim']
  },
  {
    id: 12,
    name: 'Sponsor / Kerja Sama',
    deadlineDiff: 45,
    type: 'Pre-Event',
    description: 'TTD Digital. Termasuk Surat Permohonan, Tanda Terima, Pemberitahuan Keamanan.',
    signatures: ['Ketupel', 'Kahim']
  },
  {
    id: 13,
    name: 'Presensi Peserta',
    deadlineDiff: 0,
    type: 'Event',
    description: 'Administrasi saat hari H.',
    signatures: []
  },
  {
    id: 14,
    name: 'Surat Berita Acara',
    deadlineDiff: 1,
    type: 'Post-Event',
    description: 'TTD Basah. Dokumentasi resmi laporan kegiatan.',
    signatures: []
  },
  {
    id: 15,
    name: 'Laporan Pertanggungjawaban (LPJ)',
    deadlineDiff: -14,
    type: 'Post-Event',
    description: 'Wajib diselesaikan max 14 hari setelah acara.',
    signatures: ['Ketupel', 'Kahim', 'Pembina', 'Koorprodi']
  },
];

export const DEPARTMENT_TEXTS: any = {
  BPH: {
    fungsi: "Badan Pengurus Harian bertanggung jawab atas koordinasi seluruh kegiatan organisasi.",
    arahan: ["Mengawasi kinerja departemen", "Menjaga stabilitas organisasi"]
  },
  PSDM: {
    fungsi: "Fungsi Departemen PSDM adalah pada kaderisasi, di mana mereka bertanggung jawab untuk mengembangkan potensi dan kemampuan setiap pengurus. Selain itu, PSDM juga memegang peranan penting dalam penyelesaian konflik internal, memelihara hubungan kekeluargaan di antara pengurus, dan menanamkan nilai-nilai organisasi kepada seluruh anggota.",
    arahan: [
      "Menyelenggarakan program kepelatihan seperti Latihan Kepemimpinan dan Manajemen Mahasiswa (LKMM) untuk membangun pemahaman tentang visi, misi, dan nilai organisasi.",
      "Melakukan evaluasi kinerja pengurus secara berkala melalui mekanisme selfassessment dan feedback kolega.",
      "Membuka ruang konsultasi bagi pengurus yang menghadapi tekanan atau masalah.",
      "Bertanggung jawab kepada Ketua Himpunan dan Wakil Ketua Himpunan."
    ]
  },
  AGSOS: {
    fungsi: "Fungsi Departemen Agama dan Sosial ini bertanggung jawab untuk menciptakan suasana yang mendukung pengembangan spiritual mahasiswa, serta memfasilitasi kegiatan sosial yang bermanfaat bagi masyarakat sekitar kampus.",
    arahan: [
      "Menyelenggarakan bakti sosial yang melibatkan mahasiswa, seperti penggalangan dana untuk bencana alam, distribusi sembako, atau bantuan kepada rumah yatim piatu.",
      "Melaksanakan kegiatan berbagi, seperti program \"Bagi Takjil\" selama bulan Ramadan atau pembagian kebutuhan pokok kepada masyarakat kurang mampu.",
      "Menyusun daftar hari keagamaan yang digunakan untuk feed.",
      "Bertanggung jawab kepada Ketua Himpunan dan Wakil Ketua Himpunan."
    ]
  },
  MNB: {
    fungsi: "Departemen ini bertanggung jawab untuk menggali, mengembangkan, dan menyalurkan minat dan bakat mahasiswa dalam berbagai bidang, seperti olahraga dan e- sport.",
    arahan: [
      "Melaksanakan survei kepada mahasiswa untuk mengidentifikasi bidang minat seperti olahraga, e-sport, seni, atau bakat lainnya bersama DAGRI.",
      "Mengadakan event seperti kompetisi olahraga ataupun non olahraga, turnamen e-sport, atau festival bakat untuk meningkatkan antusiasme mahasiswa.",
      "Melaksanakan pelatihan rutin e-sport dan sport melalui biro",
      "Bertanggung jawab kepada Ketua Himpunan dan Wakil Ketua Himpunan."
    ]
  },
  DEPLU: {
    fungsi: "Fungsi Departemen Luar Negeri (Deplu) fokus pada pembinaan dan pengembangan hubungan antar universitas dan perusahaan yang masih relevan dengan program studi Manajemen Informatika di tingkat regional, universitas hingga nasional untuk mendukung pertukaran pengetahuan dan kolaborasi akademik",
    arahan: [
      "Menyusun daftar universitas dan organisasi mahasiswa dari perguruan tinggi lain yang memiliki program studi atau minat yang sejalan dengan Manajemen Informatika.",
      "Menyusun daftar informasi beasiswa atau kesempatan magang bagi mahasiswa manajemen informatika.",
      "Mengadakan kunjungan studi ke universitas lain untuk memperluas wawasan dan mempererat hubungan kerja sama melalui studi banding.",
      "Menjalin hubungan dengan perusahaan yang relevan untuk mendukung program magang, pelatihan, atau seminar karier bagi mahasiswa.",
      "Membangun program untuk berbagi pengalaman dan ide antara mahasiswa dari universitas berbeda.",
      "Kunjungan ke perusahaan teknologi untuk memahami proses kerja, teknologi terbaru, dan peluang magang atau karier melalui company visit.",
      "Membangun relasi dengan alumni atau kakak tingkat.",
      "Menyusun daftar kelulusan kakak tingkat untuk digunakan dalam Feed.",
      "Bertanggung jawab kepada Ketua Himpunan dan Wakil Ketua Himpunan."
    ]
  },
  DAGRI: {
    fungsi: "Fungsi Departemen Dalam Negeri adalah untuk memastikan bahwa lingkungan himpunan mendukung kebutuhan akademik dan sosial mahasiswa, serta melakukan pendataan terhadap sumber daya mahasiswa yang tersedia hingga memfasilitasi komunikasi yang efektif antara mahasiswa, dan stakeholder Himpunan Mahasiswa Manajemen Informatika",
    arahan: [
      "Pendataan mahasiswa untuk mengetahui minat, bakat, dan kompetensi yang dimiliki.",
      "Menganalisis data minat, bakat kompetensi tersebut untuk menyusun program atau rekomendasi pengembangan yang relevan.",
      "Mengadakan sosialisasi atau informasi terhadap segala bentuk kegiatan KEMENDIKTI, Universitas hingga program studi seperti PKM, PMW, PMWV, GAYATAMA, GEMASTIK, OLIVIA dan lainnya.",
      "Jembatan informasi seperti UKT, Kalender Akademik serta kebutuhan surat-surat resmi seperti surat pernyataan aktif mahasiswa.",
      "Mengadakan rapat koordinasi triwulan antara perwakilan mahasiswa dan pengurus HIMAFORTIC untuk membahas kebutuhan atau isu terkini.",
      "Membuat laporan berkala terkait hasil koordinasi dengan stakeholder himpunan yang dapat diakses oleh seluruh mahasiswa.",
      "Membuat platform wadah aspirasi sebagai bentuk advokasi.",
      "Menyusun panduan advokasi akademik yang dapat digunakan mahasiswa untuk memahami hak dan prosedur akademik mereka.",
      "Membuka layanan konsultasi advokasi bagi mahasiswa yang membutuhkan bantuan atau informasi terkait hak mereka.",
      "Mengidentifikasi kebutuhan mahasiswa, seperti ketersediaan fasilitas belajar, akses ke dosen pembimbing, atau peralatan laboratorium.",
      "Bertanggung jawab kepada Ketua Himpunan dan Wakil Ketua Himpunan."
    ]
  },
  KOMINFO: {
    fungsi: "Departemen Komunikasi & Informasi (KOMINFO) bertanggung jawab untuk mengelola dan menyebarkan informasi yang berkaitan dengan kegiatan program studi, fakultas, universitas melalui berbagai platform, termasuk media sosial.",
    arahan: [
      "Memberitakan segala kegiatan Himpunan Mahasiswa Manajemen Informatika dan program studi dalam bentuk feed hingga berita acara baik platform digital maupun cetak.",
      "Membuat feed perayaan hari-hari penting nasional hingga internasional.",
      "Mengembangkan alur komunikasi internal untuk memastikan informasi diterima oleh seluruh anggota himpunan sebelum dipublikasikan kepada mahasiswa.",
      "Menyusun arsip digital yang mencakup informasi penting seperti pengumuman, laporan kegiatan, dan kebijakan baru.",
      "Membuat kalender konten bulanan untuk merencanakan jenis postingan, seperti pengumuman, promosi acara, dan liputan kegiatan.",
      "Membantu setiap departemen dalam pembuatan poster, teaser video, atau press release untuk kegiatan yang mereka laksanakan.",
      "Membuat dokumentasi dan publikasi liputan kegiatan himpunan.",
      "Mengembangkan dan mengelola website atau media informasi, media digital dan media sosial resmi himpunan yang berfungsi sebagai pusat informasi, mencakup agenda kegiatan, pengumuman, dan berita.",
      "Bertanggung jawab kepada Ketua Himpunan dan Wakil Ketua Himpunan."
    ]
  },
  EKRAF: {
    fungsi: "Fungsi Departemen Ekonomi dan Kreatif ini adalah untuk menciptakan peluang ekonomi melalui pengembangan produk dan layanan yang memanfaatkan teknologi informasi dengan memanfaatkan sumber daya mahasiswa manajemen informatika.",
    arahan: [
      "Meluncurkan merchandise resmi himpunan, seperti kaos, tote bag, atau aksesoris bertema Manajemen Informatika.",
      "Menawarkan jasa seperti pembuatan desain grafis, pengembangan aplikasi sederhana, atau workshop berbayar.",
      "Menjalin kerja sama dengan UMKM atau startup untuk memasarkan produk hasil karya mahasiswa.",
      "Berkolaborasi dengan alumni yang memiliki bisnis di bidang ekonomi kreatif untuk mentoring atau pendanaan.",
      "Menyusun anggaran dan target pendapatan tahunan untuk mendukung operasional himpunan.",
      "Bertanggung jawab kepada Ketua Himpunan dan Wakil Ketua Himpunan."
    ]
  },
  PENRISTEK: {
    fungsi: "Departemen ini bertujuan untuk membina mahasiswa menjadi pemikir kritis, inovatif, dan produktif yang mampu menghasilkan penelitian berkualitas dan aplikasi teknologi yang relevan.",
    arahan: [
      "Melaksanakan kegiatan pameran karya mahasiswa manajemen informatika.",
      "Melaksanakan kegiatan pelatihan relevan dibidang teknologi.",
      "Mengadakan seminar dan lomba dibidang IT.",
      "Menyusun daftar kepelatihan, seminar dan sertifikasi dibidang IT atau sertifikasi lainnya yang relevan.",
      "Menyusun daftar perlombaan dibidang IT.",
      "Mengembangkan dan mengelola website Himpunan bersama DAGRI dan KOMINFO.",
      "Mengembangkan dan mengelola website atau aplikasi resmi himpunan yang berfungsi sebagai pusat informasi, mencakup agenda kegiatan, pengumuman, dan berita.",
      "Bertanggung jawab kepada Ketua Himpunan dan Wakil Ketua Himpunan."
    ]
  }
};

export const DEPARTMENTS = [
  { id: 'BPH', name: 'BPH', fullName: 'Badan Pengurus Harian', icon: Building2, color: 'bg-gray-100 text-gray-600', head: 'Tegar Eka Pambudi El Akhsan', staffId: '23091397038' },
  { id: 'PSDM', name: 'PSDM', fullName: 'Pengembangan Sumber Daya Mahasiswa', icon: Users, color: 'bg-blue-100 text-blue-600', head: 'Fina Fadhilah Maulana', staffId: '23091397207' },
  { id: 'AGSOS', name: 'AGSOS', fullName: 'Agama dan Sosial', icon: HelpCircle, color: 'bg-green-100 text-green-600', head: 'Vergi Mutia Rahmasyani', staffId: '23091397171' },
  { id: 'MNB', name: 'MNB', fullName: 'Minat dan Bakat', icon: Video, color: 'bg-purple-100 text-purple-600', head: 'M. Raka Phaedra Agus Putra', staffId: '23091397210' },
  { id: 'DEPLU', name: 'DEPLU', fullName: 'Luar Negeri', icon: Building2, color: 'bg-orange-100 text-orange-600', head: 'Salzabila Ananda Putri', staffId: '23091397177' },
  { id: 'DAGRI', name: 'DAGRI', fullName: 'Dalam Negeri', icon: Building2, color: 'bg-indigo-100 text-indigo-600', head: 'Muhammad Nizar Amirul H.', staffId: '23091397137' },
  { id: 'KOMINFO', name: 'KOMINFO', fullName: 'Komunikasi dan Informasi', icon: MessageSquare, color: 'bg-pink-100 text-pink-600', head: 'Naufal Rizky Nugroho', staffId: '23091397113' },
  { id: 'EKRAF', name: 'EKRAF', fullName: 'Ekonomi dan Kreatif', icon: DollarSign, color: 'bg-yellow-100 text-yellow-600', head: 'Chaterina Fatma Diaksa', staffId: '23091397107' },
  { id: 'PENRISTEK', name: 'PENRISTEK', fullName: 'Penalaran, Riset dan Teknologi', icon: FileText, color: 'bg-cyan-100 text-cyan-600', head: 'Gerry Moeis', staffId: '23091397164' },
];

export const getAvatar = (nim: string) => `https://i.pravatar.cc/150?u=${nim}`;

export const INITIAL_PROKERS = [
  {
    id: '1', title: 'EQUILIBRE', status: 'Done', progress: 100, department: 'PSDM',
    description: 'Program kaderisasi untuk mengembangkan potensi pengurus.',
    objectives: 'Meningkatkan kualitas SDM organisasi.',
    benefits: 'Terbentuknya pengurus yang kompeten.',
    impact: 'Kaderisasi berjalan lancar.',
    leader: 'Rachmah Fia Putri Dewi',
    secretary: 'Valentania Alia Febrian',
    treasurer: 'Diana Safitri',
    deadline: '2024-03-10'
  },
  {
    id: '2', title: 'LKMM PRA-TD', status: 'Done', progress: 100, department: 'PSDM',
    description: 'Latihan Keterampilan Manajemen Mahasiswa Pra-Tingkat Dasar.',
    objectives: 'Memberikan dasar-dasar manajemen organisasi.',
    benefits: 'Mahasiswa baru paham organisasi.',
    impact: 'Peserta lulus LKMM Pra-TD.',
    leader: 'Gathan Yandino Putra',
    secretary: 'Rachmah Fia Putri Dewi',
    treasurer: 'Fitrya Chalifatus Zahro',
    deadline: '2024-04-15'
  },
  {
    id: '3', title: 'LKMM TD', status: 'Done', progress: 100, department: 'PSDM',
    description: 'Latihan Keterampilan Manajemen Mahasiswa Tingkat Dasar.',
    objectives: 'Lanjutan dari Pra-TD untuk skill manajemen.',
    benefits: 'Skill leadership meningkat.',
    impact: 'Peserta siap menjadi pengurus.',
    leader: 'Septiana Dwi Lestari',
    secretary: 'Gathan Yandino Putra',
    treasurer: 'Rachmah Fia Putri Dewi',
    deadline: '2024-05-20'
  },
  {
    id: '4', title: 'WORKSHOP ARTIKEL ILMIAH', status: 'Done', progress: 100, department: 'DAGRI',
    description: 'Pelatihan penulisan artikel ilmiah yang baik dan benar.',
    objectives: 'Meningkatkan publikasi ilmiah mahasiswa.',
    benefits: 'Mahasiswa mampu menulis jurnal.',
    impact: 'Artikel terbit di jurnal.', leader: 'Khabibi Al Munif', deadline: '2024-06-05'
  },
  {
    id: '5', title: 'WORKSHOP PORTOFOLIO', status: 'Done', progress: 100, department: 'DAGRI',
    description: 'Pelatihan menyusun portofolio profesional.',
    objectives: 'Persiapan karir mahasiswa.',
    benefits: 'Mahasiswa punya CV/Portofolio menarik.',
    impact: 'Kesiapan kerja meningkat.', leader: 'Nesyari Az-Zahra', deadline: '2024-06-25'
  },
  {
    id: '6', title: 'WORKSHOP HKI', status: 'Done', progress: 100, department: 'DAGRI',
    description: 'Sosialisasi Hak Kekayaan Intelektual.',
    objectives: 'Paham tentang hak cipta karya.',
    benefits: 'Karya mahasiswa terlindungi.',
    impact: 'Pendaftaran HKI karya mahasiswa.', leader: "Elia Rifana Rif'an", deadline: '2024-07-10'
  },
  {
    id: '7', title: 'GERIGI', status: 'Done', progress: 100, department: 'KOMINFO',
    description: 'Generasi Resik Digital (Kampanye Digital).',
    objectives: 'Literasi digital yang sehat.',
    benefits: 'Lingkungan digital positif.',
    impact: 'Engagement sosmed naik.', leader: 'Syawailie Syaf Anhar', deadline: '2024-08-17'
  },
  {
    id: '8', title: 'INNOVATION LAB : GEMASTIK', status: 'Done', progress: 100, department: 'PENRISTEK',
    description: 'Persiapan dan bimbingan lomba Gemastik.',
    objectives: 'Juara Gemastik.',
    benefits: 'Prestasi mahasiswa tingkat nasional.',
    impact: 'Tim lolos final Gemastik.', leader: 'Ulur Rosyad Rachmandani', deadline: '2024-09-01'
  },
  {
    id: '9', title: 'LUMINUX', status: 'Done', progress: 100, department: 'PENRISTEK',
    description: 'Lomba UI/UX tingkat nasional.',
    objectives: 'Wadah kompetisi desain.',
    benefits: 'Branding himpunan.',
    impact: '100+ Peserta nasional.', leader: 'Valentania Alia Febrian', deadline: '2024-09-15'
  },
  {
    id: '10', title: 'SHORTCLASS', status: 'Cancelled', progress: 0, department: 'PENRISTEK',
    description: 'Kelas singkat pemrograman web.',
    objectives: 'Skill teknis mahasiswa.',
    benefits: 'Paham dasar coding.',
    impact: 'Program dibatalkan.', leader: 'Whimawansyah Sabilillah', deadline: '2024-10-01'
  },
  {
    id: '11', title: 'WORKSHOP CAREER QUEST', status: 'Done', progress: 100, department: 'DEPLU',
    description: 'Seminar persiapan karir dan dunia kerja.',
    objectives: 'Insight dunia industri.',
    benefits: 'Mahasiswa siap magang.',
    impact: 'Partnership dengan industri.', leader: 'Zaidan Mudzaky Juan Kusuma', deadline: '2024-10-15'
  },
  {
    id: '12', title: 'PIXANTARA', status: 'Cancelled', progress: 0, department: 'DEPLU',
    description: 'Pameran fotografi dan desain.',
    objectives: 'Apresiasi seni.',
    benefits: 'Pameran karya.',
    impact: 'Program dibatalkan.', leader: 'Moch. Izzul Maulana H.', deadline: '2024-11-01'
  },
  {
    id: '13', title: 'MOMIC', status: 'Done', progress: 100, department: 'MNB',
    description: 'Mobile Legends Competition.',
    objectives: 'Wadah e-sport mahasiswa.',
    benefits: 'Solidaritas antar angkatan.',
    impact: '32 Tim bertanding.', leader: 'Gading Kent Sadewa', deadline: '2024-11-15'
  },
  {
    id: '14', title: 'MIOTECH', status: 'Cancelled', progress: 0, department: 'MNB',
    description: 'Olimpiade Teknologi.',
    objectives: 'Kompetisi akademik.',
    benefits: 'Prestasi akademik.',
    impact: 'Program dibatalkan.', leader: 'Muhammad Ulil Amri', deadline: '2024-11-20'
  },
  {
    id: '15', title: 'BMC', status: 'Done', progress: 100, department: 'EKRAF',
    description: 'Business Model Canvas Workshop.',
    objectives: 'Membangun mindset wirausaha.',
    benefits: 'Ide bisnis mahasiswa.',
    impact: '10 Ide bisnis baru.', leader: 'Azizatul Husniyah', deadline: '2024-12-01'
  },
  {
    id: '16', title: 'MI EXPO', status: 'Cancelled', progress: 0, department: 'EKRAF',
    description: 'Expo produk wirausaha mahasiswa.',
    objectives: 'Pemasaran produk.',
    benefits: 'Profit untuk mahasiswa.',
    impact: 'Program dibatalkan.', leader: 'Lusida Cynthia Winayu', deadline: '2024-12-10'
  },
  {
    id: '17', title: 'DIGITALISASI UMKM', status: 'Done', progress: 100, department: 'AGSOS',
    description: 'Bantuan digital marketing untuk UMKM sekitar.',
    objectives: 'Pengabdian masyarakat.',
    benefits: 'UMKM Go Digital.',
    impact: '5 UMKM terbantu.', leader: 'Billy Bayhakhi', deadline: '2024-12-15'
  },
  {
    id: '18', title: 'RAPAT KERJA', status: 'Done', progress: 100, department: 'BPH',
    description: 'Rapat evaluasi akhir tahun dan perencanaan tahun depan.',
    objectives: 'Evaluasi menyeluruh.',
    benefits: 'Perbaikan organisasi.',
    impact: 'LPJ diterima.', leader: 'Gathan Yandino Putra', deadline: '2024-12-28'
  },
];

const calculatePoints = (name: string, dept: string, role: string) => {
  let points = 0;

  // Base Role Points
  if (dept === 'BPH') points = 500;
  else if (role.includes('Ketua')) points = 50; // Ketua Dept
  else points = 25; // Staff

  // Project Leadership Points (+100)
  const isLeader = INITIAL_PROKERS.some(p => p.leader === name);
  if (isLeader) points += 100;

  return points;
};

const getPointHistory = (name: string, dept: string, role: string) => {
  const history = [];
  if (dept === 'BPH') history.push({ reason: 'BPH Role Base Points', amount: 500, date: '2024-01-01' });
  else if (role.includes('Ketua')) history.push({ reason: 'Department Head Points', amount: 50, date: '2024-01-01' });
  else history.push({ reason: 'Staff Role Points', amount: 25, date: '2024-01-01' });

  const isLeader = INITIAL_PROKERS.some(p => p.leader === name);
  if (isLeader) {
    history.push({ reason: 'Project Leader Bonus', amount: 100, date: '2024-03-01' });
  }

  // Random additional points
  if (Math.random() > 0.5) history.push({ reason: 'Event Volunteer', amount: 25, date: '2024-06-15' });

  return history;
}

export const INITIAL_MEMBERS = [
  // BPH
  { id: '1', name: 'Tegar Eka Pambudi El Akhsan', nim: '23091397038', role: 'Ketua Himpunan', dept: 'BPH' },
  { id: '2', name: 'Achmad Diky Setiawan', nim: '23091397178', role: 'Wakil Ketua Himpunan', dept: 'BPH' },
  { id: '3', name: "Atika Haniifatun Nisa'", nim: '23091397098', role: 'Sekretaris Umum', dept: 'BPH' },
  { id: '4', name: 'Diah Arum Cahyaningtyas', nim: '23091397089', role: 'Sekretaris 1', dept: 'BPH' },
  { id: '5', name: 'Nayla Rahayu Puspitasari', nim: '24091397088', role: 'Sekretaris 2', dept: 'BPH' },
  { id: '6', name: 'Fiana Agta Riyani', nim: '23091397110', role: 'Bendahara Umum', dept: 'BPH' },
  { id: '7', name: 'Ambar Zahrotul Wardah', nim: '23091397054', role: 'Bendahara 1', dept: 'BPH' },
  { id: '8', name: 'Aftita Choirunnisa', nim: '24091397083', role: 'Bendahara 2', dept: 'BPH' },

  // PSDM
  { id: '9', name: 'Fina Fadhilah Maulana', nim: '23091397207', role: 'Ketua Departemen', dept: 'PSDM' },
  { id: '10', name: 'Rachmah Fia Putri Dewi', nim: '23091397057', role: 'Staff', dept: 'PSDM' },
  { id: '11', name: 'Gathan Yandino Putra', nim: '24091397026', role: 'Staff', dept: 'PSDM' },
  { id: '12', name: 'Septiana Dwi Lestari', nim: '24091397113', role: 'Staff', dept: 'PSDM' },
  { id: '13', name: 'Fitrya Chalifatus Zahro', nim: '24091397117', role: 'Staff', dept: 'PSDM' },

  // PENRISTEK
  { id: '14', name: 'Gerry Moeis', nim: '23091397164', role: 'Ketua Departemen', dept: 'PENRISTEK' },
  { id: '15', name: 'Dickrullah Brilian Akbar', nim: '23091397087', role: 'Staff', dept: 'PENRISTEK' },
  { id: '16', name: 'Ardelia Zahra Farsiana', nim: '23091397159', role: 'Staff', dept: 'PENRISTEK' },
  { id: '17', name: 'Ulur Rosyad Rachmandani', nim: '24091397100', role: 'Staff', dept: 'PENRISTEK' },
  { id: '18', name: 'Valentania Alia Febrian', nim: '24091397049', role: 'Staff', dept: 'PENRISTEK' },
  { id: '19', name: 'Whimawansyah Sabilillah', nim: '24091397071', role: 'Staff', dept: 'PENRISTEK' },
  { id: '20', name: 'Ditio Septian R', nim: '24091397151', role: 'Staff', dept: 'PENRISTEK' },

  // DAGRI
  { id: '21', name: 'Muhammad Nizar Amirul H.', nim: '23091397137', role: 'Ketua Departemen', dept: 'DAGRI' },
  { id: '22', name: 'Yosion Besty Marpaung', nim: '23091397168', role: 'Staff', dept: 'DAGRI' },
  { id: '23', name: 'Victorio Khalifah Indra', nim: '23091397112', role: 'Staff', dept: 'DAGRI' },
  { id: '24', name: 'Nesyari Az-Zahra', nim: '23091397104', role: 'Staff', dept: 'DAGRI' },
  { id: '25', name: 'Diana Safitri', nim: '24091397084', role: 'Staff', dept: 'DAGRI' },
  { id: '26', name: 'Khabibi Al Munif', nim: '24091397004', role: 'Staff', dept: 'DAGRI' },
  { id: '27', name: "Elia Rifana Rif'an", nim: '24091397139', role: 'Staff', dept: 'DAGRI' },

  // KOMINFO
  { id: '28', name: 'Naufal Rizky Nugroho', nim: '23091397113', role: 'Ketua Departemen', dept: 'KOMINFO' },
  { id: '29', name: 'Nur Aini Setya Putri', nim: '23091397077', role: 'Staff', dept: 'KOMINFO' },
  { id: '30', name: 'Dea Ayu Novita Putri', nim: '23091397173', role: 'Staff', dept: 'KOMINFO' },
  { id: '31', name: 'Naila Khalishah Mahendra', nim: '23091397067', role: 'Staff', dept: 'KOMINFO' },
  { id: '32', name: 'Muhammad Rafif Ramadhan', nim: '23091397108', role: 'Staff', dept: 'KOMINFO' },
  { id: '33', name: 'Syawailie Syaf Anhar', nim: '24091397053', role: 'Staff', dept: 'KOMINFO' },
  { id: '34', name: 'Meyssa Aqila Adikara', nim: '24091397076', role: 'Staff', dept: 'KOMINFO' },
  { id: '35', name: 'Michiana Defi Gunawan', nim: '24091397102', role: 'Staff', dept: 'KOMINFO' },

  // DEPLU
  { id: '36', name: 'Salzabila Ananda Putri', nim: '23091397177', role: 'Ketua Departemen', dept: 'DEPLU' },
  { id: '37', name: 'Widirga Putri Aditya Wardaningtyas', nim: '23091397079', role: 'Staff', dept: 'DEPLU' },
  { id: '38', name: 'Zaidan Mudzaky Juan Kusuma', nim: '23091397194', role: 'Staff', dept: 'DEPLU' },
  { id: '39', name: 'Astrid Yobela Lumbantobing', nim: '23091397040', role: 'Staff', dept: 'DEPLU' },
  { id: '40', name: 'Hanson Philip', nim: '24091397034', role: 'Staff', dept: 'DEPLU' },
  { id: '41', name: 'Selvi Adinda Hermawati', nim: '24091397145', role: 'Staff', dept: 'DEPLU' },
  { id: '42', name: 'Moch. Izzul Maulana H.', nim: '24091397160', role: 'Staff', dept: 'DEPLU' },

  // AGSOS
  { id: '43', name: 'Vergi Mutia Rahmasyani', nim: '23091397171', role: 'Ketua Departemen', dept: 'AGSOS' },
  { id: '44', name: 'Alya Faadhilah Putri', nim: '23091397153', role: 'Staff', dept: 'AGSOS' },
  { id: '45', name: 'Aghnia Diffitri Naurasyahbana', nim: '24091397006', role: 'Staff', dept: 'AGSOS' },
  { id: '46', name: 'Billy Bayhakhi', nim: '24091397155', role: 'Staff', dept: 'AGSOS' },
  { id: '47', name: 'Faiz Maulana', nim: '24091397103', role: 'Staff', dept: 'AGSOS' },

  // MNB
  { id: '48', name: 'M. Raka Phaedra Agus Putra', nim: '23091397210', role: 'Ketua Departemen', dept: 'MNB' },
  { id: '49', name: 'Muhammad Ulil Amri', nim: '23091397091', role: 'Staff', dept: 'MNB' },
  { id: '50', name: 'Lelycha Agnafarah Hendrawinata', nim: '24091397041', role: 'Staff', dept: 'MNB' },
  { id: '51', name: 'Moch Hafidz Asrof', nim: '24091397169', role: 'Staff', dept: 'MNB' },
  { id: '52', name: 'Gading Kent Sadewa', nim: '24091397031', role: 'Staff', dept: 'MNB' },
  { id: '53', name: 'Ega khamidatin niswa', nim: '24091397090', role: 'Staff', dept: 'MNB' },

  // EKRAF
  { id: '54', name: 'Chaterina Fatma Diaksa', nim: '23091397107', role: 'Ketua Departemen', dept: 'EKRAF' },
  { id: '55', name: 'Azizatul Husniyah', nim: '23091397109', role: 'Staff', dept: 'EKRAF' },
  { id: '56', name: 'Lusida Cynthia Winayu', nim: '23091397075', role: 'Staff', dept: 'EKRAF' },
  { id: '57', name: 'Makrus Fahrul Muharrom', nim: '24091397017', role: 'Staff', dept: 'EKRAF' },
  { id: '58', name: 'Achmad Hakim AlJumadi', nim: '24091397099', role: 'Staff', dept: 'EKRAF' },
  { id: '59', name: 'Jihan Salma Salsabila', nim: '24091397068', role: 'Staff', dept: 'EKRAF' },

  // Extras
  { id: '60', name: 'Dissa (Staff)', nim: '24091397991', role: 'Staff', dept: 'PSDM' },
  { id: '61', name: 'Rio (Staff)', nim: '24091397992', role: 'Staff', dept: 'DAGRI' },
  { id: '62', name: 'Eni (Staff)', nim: '24091397993', role: 'Staff', dept: 'AGSOS' },

].map(m => ({
  ...m,
  violations: 0,
  violationHistory: [],
  status: 'Active',
  activeProjects: 0,
  image: getAvatar(m.nim),
  lastActive: '2 days ago',
  points: calculatePoints(m.name, m.dept, m.role),
  pointHistory: getPointHistory(m.name, m.dept, m.role)
}));

export const RECENT_ACTIVITIES = [
  { id: 1, text: "Proker 'EQUILIBRE' completed", date: '2024-03-10', status: 'Completed' },
  { id: 2, text: "Workshop 'HKI' executed", date: '2024-07-10', status: 'Completed' },
  { id: 3, text: "New member 'Nayla' added", date: '2024-02-15', status: 'Active' },
  { id: 4, text: "Proker 'SHORTCLASS' cancelled", date: '2024-10-01', status: 'Cancelled' },
  { id: 5, text: "Meeting 'Rapat Kerja' scheduled", date: '2024-12-28', status: 'Upcoming' },
];

export const TRANSACTIONS = [
  { id: 1, date: '2024-07-26', type: 'Income', amount: 10000, description: 'Sponsorship for event', name: 'Tech Solutions Inc.', payment: 'Bank Transfer', category: 'Sponsorship', proker: 'GERIGI', status: 'Approved' },
  { id: 2, date: '2024-07-27', type: 'Expense', amount: 2000, description: 'Marketing materials', name: 'Print Shop', payment: 'Cash', category: 'Marketing', proker: 'GERIGI', status: 'Approved' },
  { id: 3, date: '2024-07-28', type: 'Expense', amount: 500, description: 'Operational costs', name: 'Office Supplies Store', payment: 'Credit Card', category: 'Operations', proker: 'DIGITALISASI UMKM', status: 'Pending' },
  { id: 4, date: '2024-07-29', type: 'Income', amount: 3000, description: 'Donation from alumni', name: 'Alumni Association', payment: 'Online Payment', category: 'Donation', proker: 'DIGITALISASI UMKM', status: 'Approved' },
  { id: 5, date: '2024-07-30', type: 'Expense', amount: 1000, description: 'Event venue rental', name: 'Event Center', payment: 'Bank Transfer', category: 'Event', proker: 'MOMIC', status: 'Rejected' },
];

export const NOTIFICATIONS = [
  { id: 1, title: "Event GERIGI", desc: "New proker created" },
  { id: 2, title: "Event MOMIC", desc: "Transaction logged" }
];

export const MOCK_ASISTENSI_HISTORY = [
  { id: 1, no: 1, proker: 'Open Recruitment', keterangan: 'Laporan Awal', status: 'Done' },
  { id: 2, no: 2, proker: 'Rapat Perdana', keterangan: 'Dokumentasi & Presensi', status: 'Done' },
  { id: 3, no: 3, proker: 'Pelaksanaan Hari H', keterangan: 'LPJ Kegiatan', status: 'Done' }
];

export const MOCK_ASISTENSI_DATA = [
  { id: 1, no: 1, proker: 'Open Recruitment', keterangan: 'Laporan Awal', status: 'Done' },
  { id: 2, no: 2, proker: 'Rapat Perdana', keterangan: 'Dokumentasi & Presensi', status: 'Done' },
  { id: 3, no: 3, proker: 'Pelaksanaan Hari H', keterangan: 'LPJ Kegiatan', status: 'Done' }
]

export const INITIAL_MEETINGS = [
  { id: 1, title: 'Weekly BPH Meeting', date: '2024-08-10', time: '19:00', platform: 'Google Meet', link: 'meet.google.com/abc-defg-hij' },
  { id: 2, title: 'Evaluasi Proker GERIGI', date: '2024-08-20', time: '20:00', platform: 'Zoom', link: 'zoom.us/j/123456789' }
];