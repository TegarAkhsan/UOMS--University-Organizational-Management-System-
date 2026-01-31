<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Department;
use App\Models\Program;
use App\Models\Transaction;
use App\Models\Meeting;
use App\Models\Assistance;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Departments
        $departments = [
            ['id' => 'BPH', 'name' => 'BPH', 'full_name' => 'Badan Pengurus Harian', 'description' => 'Badan Pengurus Harian bertanggung jawab atas koordinasi seluruh kegiatan organisasi.', 'head_name' => 'Tegar Eka Pambudi El Akhsan'],
            ['id' => 'PSDM', 'name' => 'PSDM', 'full_name' => 'Pengembangan Sumber Daya Mahasiswa', 'description' => 'Fungsi Departemen PSDM adalah pada kaderisasi...', 'head_name' => 'Fina Fadhilah Maulana'],
            ['id' => 'AGSOS', 'name' => 'AGSOS', 'full_name' => 'Agama dan Sosial', 'description' => 'Fungsi Departemen Agama dan Sosial...', 'head_name' => 'Vergi Mutia Rahmasyani'],
            ['id' => 'MNB', 'name' => 'MNB', 'full_name' => 'Minat dan Bakat', 'description' => 'Departemen ini bertanggung jawab untuk menggali...', 'head_name' => 'M. Raka Phaedra Agus Putra'],
            ['id' => 'DEPLU', 'name' => 'DEPLU', 'full_name' => 'Luar Negeri', 'description' => 'Fungsi Departemen Luar Negeri...', 'head_name' => 'Salzabila Ananda Putri'],
            ['id' => 'DAGRI', 'name' => 'DAGRI', 'full_name' => 'Dalam Negeri', 'description' => 'Fungsi Departemen Dalam Negeri...', 'head_name' => 'Muhammad Nizar Amirul H.'],
            ['id' => 'KOMINFO', 'name' => 'KOMINFO', 'full_name' => 'Komunikasi dan Informasi', 'description' => 'Departemen Komunikasi & Informasi...', 'head_name' => 'Naufal Rizky Nugroho'],
            ['id' => 'EKRAF', 'name' => 'EKRAF', 'full_name' => 'Ekonomi dan Kreatif', 'description' => 'Fungsi Departemen Ekonomi dan Kreatif...', 'head_name' => 'Chaterina Fatma Diaksa'],
            ['id' => 'PENRISTEK', 'name' => 'PENRISTEK', 'full_name' => 'Penalaran, Riset dan Teknologi', 'description' => 'Departemen ini bertujuan untuk membina...', 'head_name' => 'Gerry Moeis'],
        ];

        foreach ($departments as $dept) {
            Department::create($dept);
        }

        // Users
        // Points Logic: Staff = 25, Kadep = 50, BPH = 1000. Leader = +100 (Updated later)
        $users = [
            // BPH (Points 1000)
            ['name' => 'Tegar Eka Pambudi El Akhsan', 'email' => 'kahima@himaforticunesa.com', 'password' => 'kahimahimafortic', 'role' => 'Kahima', 'status' => 'superadmin', 'department_id' => 'BPH', 'nim' => '23091397038', 'points' => 1000],
            ['name' => 'Achmad Diky Setiawan', 'email' => 'wakahima@himaforticunesa.com', 'password' => 'wakahimahimafortic', 'role' => 'Wakil Kahima', 'status' => 'superadmin', 'department_id' => 'BPH', 'nim' => '23091397178', 'points' => 1000],
            ['name' => "Atika Haniifatun Nisa'", 'email' => 'Sekretaris@himaforticunesa.com', 'password' => 'Sekretarishimafortic', 'role' => 'Sekretaris Umum', 'status' => 'sub_super_admin_2', 'department_id' => 'BPH', 'nim' => '23091397098', 'points' => 1000],
            ['name' => 'Diah Arum Cahyaningtyas', 'email' => 'sekretaris1@himaforticunesa.com', 'password' => 'sekretarishimafortic', 'role' => 'Sekretaris 1', 'status' => 'sub_super_admin_2', 'department_id' => 'BPH', 'nim' => '23091397089', 'points' => 1000],
            ['name' => 'Nayla Rahayu Puspitasari', 'email' => 'sekretaris2@himaforticunesa.com', 'password' => 'sekretarishimafortic', 'role' => 'Sekretaris 2', 'status' => 'sub_super_admin_2', 'department_id' => 'BPH', 'nim' => '24091397088', 'points' => 1000],
            ['name' => 'Fiana Agta Riyani', 'email' => 'bendahara@himaforticunesa.com', 'password' => 'bendaharahimafortic', 'role' => 'Bendahara Umum', 'status' => 'sub_super_admin_1', 'department_id' => 'BPH', 'nim' => '23091397110', 'points' => 1000],
            ['name' => 'Ambar Zahrotul Wardah', 'email' => 'bendahara1@himaforticunesa.com', 'password' => 'bendaharahimafortic', 'role' => 'Bendahara 1', 'status' => 'sub_super_admin_1', 'department_id' => 'BPH', 'nim' => '23091397054', 'points' => 1000],
            ['name' => 'Aftita Choirunnisa', 'email' => 'bendahara2@himaforticunesa.com', 'password' => 'bendaharahimafortic', 'role' => 'Bendahara 2', 'status' => 'sub_super_admin_1', 'department_id' => 'BPH', 'nim' => '24091397083', 'points' => 1000],

            // PSDM
            ['name' => 'Fina Fadhilah Maulana', 'email' => 'kadepPSDM@himaforticunesa.com', 'password' => 'kadephimafortic', 'role' => 'Ketua Departemen', 'status' => 'admin', 'department_id' => 'PSDM', 'nim' => '23091397207', 'points' => 50],
            ['name' => 'Rachmah Fia Putri Dewi', 'email' => 'rachmah@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'PSDM', 'nim' => '23091397057', 'points' => 25],
            ['name' => 'Gathan Yandino Putra', 'email' => 'gathan@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'PSDM', 'nim' => '24091397026', 'points' => 25],
            ['name' => 'Septiana Dwi Lestari', 'email' => 'septiana@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'PSDM', 'nim' => '24091397113', 'points' => 25],
            ['name' => 'Fitrya Chalifatus Zahro', 'email' => 'fitrya@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'PSDM', 'nim' => '24091397117', 'points' => 25],

            // PENRISTEK
            ['name' => 'Gerry Moeis', 'email' => 'kadepPENRISTEK@himaforticunesa.com', 'password' => 'kadephimafortic', 'role' => 'Ketua Departemen', 'status' => 'admin', 'department_id' => 'PENRISTEK', 'nim' => '23091397164', 'points' => 50],
            ['name' => 'Dickrullah Brilian Akbar', 'email' => 'dickrullah@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'PENRISTEK', 'nim' => '23091397087', 'points' => 25],
            ['name' => 'Ardelia Zahra Farsiana', 'email' => 'ardelia@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'PENRISTEK', 'nim' => '23091397159', 'points' => 25],
            ['name' => 'Ulur Rosyad Rachmandani', 'email' => 'ulur@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'PENRISTEK', 'nim' => '24091397100', 'points' => 25],
            ['name' => 'Valentania Alia Febrian', 'email' => 'valentania@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'PENRISTEK', 'nim' => '24091397049', 'points' => 25],
            ['name' => 'Whimawansyah Sabilillah', 'email' => 'whimawansyah@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'PENRISTEK', 'nim' => '24091397071', 'points' => 25],
            ['name' => 'Ditio Septian R', 'email' => 'ditio@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'PENRISTEK', 'nim' => '24091397151', 'points' => 25],

            // DAGRI
            ['name' => 'Muhammad Nizar Amirul H.', 'email' => 'kadepDAGRI@himaforticunesa.com', 'password' => 'kadephimafortic', 'role' => 'Ketua Departemen', 'status' => 'admin', 'department_id' => 'DAGRI', 'nim' => '23091397137', 'points' => 50],
            ['name' => 'Yosion Besty Marpaung', 'email' => 'yosion@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DAGRI', 'nim' => '23091397168', 'points' => 25],
            ['name' => 'Victorio Khalifah Indra', 'email' => 'victorio@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DAGRI', 'nim' => '23091397112', 'points' => 25],
            ['name' => 'Nesyari Az-Zahra', 'email' => 'nesyari@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DAGRI', 'nim' => '23091397104', 'points' => 25],
            ['name' => 'Diana Safitri', 'email' => 'diana@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DAGRI', 'nim' => '24091397084', 'points' => 25],
            ['name' => 'Khabibi Al Munif', 'email' => 'khabibi@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DAGRI', 'nim' => '24091397004', 'points' => 25],
            ['name' => "Elia Rifana Rif'an", 'email' => 'elia@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DAGRI', 'nim' => '24091397139', 'points' => 25],

            // KOMINFO
            ['name' => 'Naufal Rizky Nugroho', 'email' => 'kadepKOMINFO@himaforticunesa.com', 'password' => 'kadephimafortic', 'role' => 'Ketua Departemen', 'status' => 'admin', 'department_id' => 'KOMINFO', 'nim' => '23091397113', 'points' => 50],
            ['name' => 'Nur Aini Setya Putri', 'email' => 'nur@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'KOMINFO', 'nim' => '23091397077', 'points' => 25],
            ['name' => 'Dea Ayu Novita Putri', 'email' => 'dea@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'KOMINFO', 'nim' => '23091397173', 'points' => 25],
            ['name' => 'Naila Khalishah Mahendra', 'email' => 'naila@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'KOMINFO', 'nim' => '23091397067', 'points' => 25],
            ['name' => 'Muhammad Rafif Ramadhan', 'email' => 'rafif@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'KOMINFO', 'nim' => '23091397108', 'points' => 25],
            ['name' => 'Syawailie Syaf Anhar', 'email' => 'syawailie@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'KOMINFO', 'nim' => '24091397053', 'points' => 25],
            ['name' => 'Meyssa Aqila Adikara', 'email' => 'meyssa@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'KOMINFO', 'nim' => '24091397076', 'points' => 25],
            ['name' => 'Michiana Defi Gunawan', 'email' => 'michiana@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'KOMINFO', 'nim' => '24091397102', 'points' => 25],

            // DEPLU
            ['name' => 'Salzabila Ananda Putri', 'email' => 'kadepDEPLU@himaforticunesa.com', 'password' => 'kadephimafortic', 'role' => 'Ketua Departemen', 'status' => 'admin', 'department_id' => 'DEPLU', 'nim' => '23091397177', 'points' => 50],
            ['name' => 'Widirga Putri Aditya Wardaningtyas', 'email' => 'widirga@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DEPLU', 'nim' => '23091397079', 'points' => 25],
            ['name' => 'Zaidan Mudzaky Juan Kusuma', 'email' => 'zaidan@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DEPLU', 'nim' => '23091397194', 'points' => 25],
            ['name' => 'Astrid Yobela Lumbantobing', 'email' => 'astrid@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DEPLU', 'nim' => '23091397040', 'points' => 25],
            ['name' => 'Hanson Philip', 'email' => 'hanson@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DEPLU', 'nim' => '24091397034', 'points' => 25],
            ['name' => 'Selvi Adinda Hermawati', 'email' => 'selvi@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DEPLU', 'nim' => '24091397145', 'points' => 25],
            ['name' => 'Moch. Izzul Maulana H.', 'email' => 'izzul@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'DEPLU', 'nim' => '24091397160', 'points' => 25],

            // AGSOS
            ['name' => 'Vergi Mutia Rahmasyani', 'email' => 'kadepAGSOS@himaforticunesa.com', 'password' => 'kadephimafortic', 'role' => 'Ketua Departemen', 'status' => 'admin', 'department_id' => 'AGSOS', 'nim' => '23091397171', 'points' => 50],
            ['name' => 'Alya Faadhilah Putri', 'email' => 'alya@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'AGSOS', 'nim' => '23091397153', 'points' => 25],
            ['name' => 'Aghnia Diffitri Naurasyahbana', 'email' => 'aghnia@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'AGSOS', 'nim' => '24091397006', 'points' => 25],
            ['name' => 'Billy Bayhakhi', 'email' => 'billy@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'AGSOS', 'nim' => '24091397155', 'points' => 25],
            ['name' => 'Faiz Maulana', 'email' => 'faiz@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'AGSOS', 'nim' => '24091397103', 'points' => 25],

            // MNB
            ['name' => 'M. Raka Phaedra Agus Putra', 'email' => 'kadepMNB@himaforticunesa.com', 'password' => 'kadephimafortic', 'role' => 'Ketua Departemen', 'status' => 'admin', 'department_id' => 'MNB', 'nim' => '23091397210', 'points' => 50],
            ['name' => 'Muhammad Ulil Amri', 'email' => 'ulil@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'MNB', 'nim' => '23091397091', 'points' => 25],
            ['name' => 'Lelycha Agnafarah Hendrawinata', 'email' => 'lelycha@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'MNB', 'nim' => '24091397041', 'points' => 25],
            ['name' => 'Moch Hafidz Asrof', 'email' => 'hafidz@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'MNB', 'nim' => '24091397169', 'points' => 25],
            ['name' => 'Gading Kent Sadewa', 'email' => 'gading@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'MNB', 'nim' => '24091397031', 'points' => 25],
            ['name' => 'Ega khamidatin niswa', 'email' => 'ega@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'MNB', 'nim' => '24091397090', 'points' => 25],

            // EKRAF
            ['name' => 'Chaterina Fatma Diaksa', 'email' => 'kadepEKRAF@himaforticunesa.com', 'password' => 'kadephimafortic', 'role' => 'Ketua Departemen', 'status' => 'admin', 'department_id' => 'EKRAF', 'nim' => '23091397107', 'points' => 50],
            ['name' => 'Azizatul Husniyah', 'email' => 'azizatul@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'EKRAF', 'nim' => '23091397109', 'points' => 25],
            ['name' => 'Lusida Cynthia Winayu', 'email' => 'lusida@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'EKRAF', 'nim' => '23091397075', 'points' => 25],
            ['name' => 'Makrus Fahrul Muharrom', 'email' => 'makrus@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'EKRAF', 'nim' => '24091397017', 'points' => 25],
            ['name' => 'Achmad Hakim AlJumadi', 'email' => 'hakim@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'EKRAF', 'nim' => '24091397099', 'points' => 25],
            ['name' => 'Jihan Salma Salsabila', 'email' => 'jihan@himaforticunesa.com', 'password' => 'staffhimafortic', 'role' => 'Staff', 'status' => 'staff', 'department_id' => 'EKRAF', 'nim' => '24091397068', 'points' => 25],
        ];

        foreach ($users as $user) {
            // $user['password'] = Hash::make($user['password']); // Removed to prevent double hashing due to User model cast
            User::create($user);
        }

        // BPH Members for Steering Committee
        $bphNames = [
            'Tegar Eka Pambudi El Akhsan',
            'Achmad Diky Setiawan',
            "Atika Haniifatun Nisa'",
            'Diah Arum Cahyaningtyas',
            'Nayla Rahayu Puspitasari',
            'Fiana Agta Riyani',
            'Ambar Zahrotul Wardah',
            'Aftita Choirunnisa'
        ];

        // Programs
        $programs = [
            [
                'title' => 'EQUILIBRE',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'PSDM',
                'description' => 'Program kaderisasi untuk mengembangkan potensi pengurus.',
                'objectives' => 'Meningkatkan kualitas SDM organisasi.',
                'benefits' => 'Terbentuknya pengurus yang kompeten.',
                'impact' => 'Kaderisasi berjalan lancar.',
                'leader_name' => 'Rachmah Fia Putri Dewi',
                'deadline' => '2024-03-10'
            ],
            [
                'title' => 'LKMM PRA-TD',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'PSDM',
                'description' => 'Latihan Keterampilan Manajemen Mahasiswa Pra-Tingkat Dasar.',
                'objectives' => 'Memberikan dasar-dasar manajemen organisasi.',
                'benefits' => 'Mahasiswa baru paham organisasi.',
                'impact' => 'Peserta lulus LKMM Pra-TD.',
                'leader_name' => 'Gathan Yandino Putra',
                'deadline' => '2024-04-15'
            ],
            [
                'title' => 'LKMM TD',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'PSDM',
                'description' => 'Latihan Keterampilan Manajemen Mahasiswa Tingkat Dasar.',
                'objectives' => 'Lanjutan dari Pra-TD untuk skill manajemen.',
                'benefits' => 'Skill leadership meningkat.',
                'impact' => 'Peserta siap menjadi pengurus.',
                'leader_name' => 'Septiana Dwi Lestari',
                'deadline' => '2024-05-20'
            ],
            [
                'title' => 'WORKSHOP ARTIKEL ILMIAH',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'DAGRI',
                'description' => 'Pelatihan penulisan artikel ilmiah yang baik dan benar.',
                'objectives' => 'Meningkatkan publikasi ilmiah mahasiswa.',
                'benefits' => 'Mahasiswa mampu menulis jurnal.',
                'impact' => 'Artikel terbit di jurnal.',
                'leader_name' => 'Khabibi Al Munif',
                'deadline' => '2024-06-05'
            ],
            [
                'title' => 'WORKSHOP PORTOFOLIO',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'DAGRI',
                'description' => 'Pelatihan menyusun portofolio profesional.',
                'objectives' => 'Persiapan karir mahasiswa.',
                'benefits' => 'Mahasiswa punya CV/Portofolio menarik.',
                'impact' => 'Kesiapan kerja meningkat.',
                'leader_name' => 'Nesyari Az-Zahra',
                'deadline' => '2024-06-25'
            ],
            [
                'title' => 'WORKSHOP HKI',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'DAGRI',
                'description' => 'Sosialisasi Hak Kekayaan Intelektual.',
                'objectives' => 'Paham tentang hak cipta karya.',
                'benefits' => 'Karya mahasiswa terlindungi.',
                'impact' => 'Pendaftaran HKI karya mahasiswa.',
                'leader_name' => "Elia Rifana Rif'an",
                'deadline' => '2024-07-10'
            ],
            [
                'title' => 'GERIGI',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'KOMINFO',
                'description' => 'Generasi Resik Digital (Kampanye Digital).',
                'objectives' => 'Literasi digital yang sehat.',
                'benefits' => 'Lingkungan digital positif.',
                'impact' => 'Engagement sosmed naik.',
                'leader_name' => 'Syawailie Syaf Anhar',
                'deadline' => '2024-08-17'
            ],
            [
                'title' => 'INNOVATION LAB : GEMASTIK',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'PENRISTEK',
                'description' => 'Persiapan dan bimbingan lomba Gemastik.',
                'objectives' => 'Juara Gemastik.',
                'benefits' => 'Prestasi mahasiswa tingkat nasional.',
                'impact' => 'Tim lolos final Gemastik.',
                'leader_name' => 'Ulur Rosyad Rachmandani',
                'deadline' => '2024-09-01'
            ],
            [
                'title' => 'LUMINUX',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'PENRISTEK',
                'description' => 'Lomba UI/UX tingkat nasional.',
                'objectives' => 'Wadah kompetisi desain.',
                'benefits' => 'Branding himpunan.',
                'impact' => '100+ Peserta nasional.',
                'leader_name' => 'Valentania Alia Febrian',
                'deadline' => '2024-09-15'
            ],
            [
                'title' => 'SHORTCLASS',
                'status' => 'Cancelled',
                'progress' => 0,
                'department_id' => 'PENRISTEK',
                'description' => 'Kelas singkat pemrograman web.',
                'objectives' => 'Skill teknis mahasiswa.',
                'benefits' => 'Paham dasar coding.',
                'impact' => 'Program dibatalkan.',
                'leader_name' => 'Whimawansyah Sabilillah',
                'deadline' => '2024-10-01'
            ],
            [
                'title' => 'WORKSHOP CAREER QUEST',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'DEPLU',
                'description' => 'Seminar persiapan karir dan dunia kerja.',
                'objectives' => 'Insight dunia industri.',
                'benefits' => 'Mahasiswa siap magang.',
                'impact' => 'Partnership dengan industri.',
                'leader_name' => 'Zaidan Mudzaky Juan Kusuma',
                'deadline' => '2024-10-15'
            ],
            [
                'title' => 'PIXANTARA',
                'status' => 'Cancelled',
                'progress' => 0,
                'department_id' => 'DEPLU',
                'description' => 'Pameran fotografi dan desain.',
                'objectives' => 'Apresiasi seni.',
                'benefits' => 'Pameran karya.',
                'impact' => 'Program dibatalkan.',
                'leader_name' => 'Moch. Izzul Maulana H.',
                'deadline' => '2024-11-01'
            ],
            [
                'title' => 'MOMIC',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'MNB',
                'description' => 'Mobile Legends Competition.',
                'objectives' => 'Wadah e-sport mahasiswa.',
                'benefits' => 'Solidaritas antar angkatan.',
                'impact' => '32 Tim bertanding.',
                'leader_name' => 'Gading Kent Sadewa',
                'deadline' => '2024-11-15'
            ],
            [
                'title' => 'MIOTECH',
                'status' => 'Cancelled',
                'progress' => 0,
                'department_id' => 'MNB',
                'description' => 'Olimpiade Teknologi.',
                'objectives' => 'Kompetisi akademik.',
                'benefits' => 'Prestasi akademik.',
                'impact' => 'Program dibatalkan.',
                'leader_name' => 'Muhammad Ulil Amri',
                'deadline' => '2024-11-20'
            ],
            [
                'title' => 'BMC',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'EKRAF',
                'description' => 'Business Model Canvas Workshop.',
                'objectives' => 'Membangun mindset wirausaha.',
                'benefits' => 'Ide bisnis mahasiswa.',
                'impact' => '10 Ide bisnis baru.',
                'leader_name' => 'Azizatul Husniyah',
                'deadline' => '2024-12-01'
            ],
            [
                'title' => 'MI EXPO',
                'status' => 'Cancelled',
                'progress' => 0,
                'department_id' => 'EKRAF',
                'description' => 'Expo produk wirausaha mahasiswa.',
                'objectives' => 'Pemasaran produk.',
                'benefits' => 'Profit untuk mahasiswa.',
                'impact' => 'Program dibatalkan.',
                'leader_name' => 'Lusida Cynthia Winayu',
                'deadline' => '2024-12-10'
            ],
            [
                'title' => 'DIGITALISASI UMKM',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'AGSOS',
                'description' => 'Bantuan digital marketing untuk UMKM sekitar.',
                'objectives' => 'Pengabdian masyarakat.',
                'benefits' => 'UMKM Go Digital.',
                'impact' => '5 UMKM terbantu.',
                'leader_name' => 'Billy Bayhakhi',
                'deadline' => '2024-12-15'
            ],
            [
                'title' => 'RAPAT KERJA',
                'status' => 'Done',
                'progress' => 100,
                'department_id' => 'BPH',
                'description' => 'Rapat evaluasi akhir tahun dan perencanaan tahun depan.',
                'objectives' => 'Evaluasi menyeluruh.',
                'benefits' => 'Perbaikan organisasi.',
                'impact' => 'LPJ diterima.',
                'leader_name' => 'Gathan Yandino Putra',
                'deadline' => '2024-12-28'
            ],
        ];

        foreach ($programs as $prog) {
            // SC Logic Removed Per User Request
            // BPH is now handled as a global supervisor by role, not a specific Sie
            $prog['sies'] = []; // Initialize empty or with other default sies if needed

            Program::create($prog);

            // Update Leader Points (+100)
            if (isset($prog['leader_name'])) {
                $leader = User::where('name', $prog['leader_name'])->first();
                if ($leader) {
                    $leader->increment('points', 100);
                }
            }
        }

        // Transactions
        $transactions = [
            ['amount' => 10000, 'type' => 'Income', 'description' => 'Sponsorship for event', 'date' => '2024-07-26', 'status' => 'Approved', 'category' => 'Sponsorship', 'payment_method' => 'Bank Transfer'],
            ['amount' => 2000, 'type' => 'Expense', 'description' => 'Marketing materials', 'date' => '2024-07-27', 'status' => 'Approved', 'category' => 'Marketing', 'payment_method' => 'Cash'],
        ];

        foreach ($transactions as $trans) {
            Transaction::create($trans);
        }

        // Meetings
        $meetings = [
            ['title' => 'Weekly BPH Meeting', 'date' => '2024-08-10', 'time' => '19:00', 'platform' => 'Google Meet', 'link' => 'meet.google.com/abc-defg-hij', 'audience' => 'all'],
        ];

        foreach ($meetings as $meet) {
            Meeting::create($meet);
        }
    }
}
