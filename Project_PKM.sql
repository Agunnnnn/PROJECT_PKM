-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 14 Sep 2026 pada 14.44
-- Versi server: 8.0.46-0ubuntu0.24.04.4
-- Versi PHP: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Project_PKM`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `admin`
--

CREATE TABLE `admin` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`) VALUES
(1, 'admin', '$2a$10$5JY5MoK3fve4B4SVyWepD.YCbs4L5A1PksTHyPtN7EtpJ5SzZwyoe');

-- --------------------------------------------------------

--
-- Struktur dari tabel `alumni`
--

CREATE TABLE `alumni` (
  `id` int NOT NULL,
  `nis` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `jurusan` varchar(50) NOT NULL,
  `tahun_lulus` year NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `alumni`
--

INSERT INTO `alumni` (`id`, `nis`, `nama`, `jurusan`, `tahun_lulus`, `email`, `no_hp`, `created_at`) VALUES
(1, '2024642717', 'Oki Puspita Pratama', 'Akuntansi', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(2, '2022717024', 'Dedi Santoso Wijaya', 'Akuntansi', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(3, '2023174299', 'Sri Abdullah Firmansyah', 'Otomatisasi Tata Kelola Perkantoran', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(4, '2024354801', 'Melati Pertiwi Setiawan', 'Rekayasa Perangkat Lunak', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(5, '2024471507', 'Faisal Santoso', 'Bisnis Daring dan Pemasaran', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(6, '2021163556', 'Wahyu Setiawan Wulandari', 'Akuntansi', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(7, '2024246991', 'Rizki Kusuma Nugroho', 'Rekayasa Perangkat Lunak', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(8, '2024947272', 'Eka Setiawan Wibowo', 'Bisnis Daring dan Pemasaran', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(9, '2021197793', 'Oktavia Handayani Abdullah', 'Rekayasa Perangkat Lunak', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(10, '2024324130', 'Prita Santoso Saputra', 'Bisnis Daring dan Pemasaran', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(11, '2024378085', 'Melati Kusuma Prasetyo', 'Bisnis Daring dan Pemasaran', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(12, '2024262316', 'Mahmud Santoso', 'Rekayasa Perangkat Lunak', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(13, '2021884309', 'Andi Az-Zahra', 'Akuntansi', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(14, '2022159642', 'Dewi Anggraini Nugroho', 'Akuntansi', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(15, '2022523389', 'Miftah Handayani', 'Bisnis Daring dan Pemasaran', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(16, '2021749468', 'Nur Salsabila', 'Akuntansi', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(17, '2023314181', 'Wulan Handayani Firmansyah', 'Akuntansi', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(18, '2023579434', 'Dedi Saputra', 'Otomatisasi Tata Kelola Perkantoran', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(19, '2021176819', 'Dinda Utami Syahputra', 'Bisnis Daring dan Pemasaran', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(20, '2021356150', 'Joko Rahayu', 'Perhotelan', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(21, '2023741390', 'Melati Hartono Prasetyo', 'Perhotelan', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(22, '2023795613', 'Hendra Utami Setiawan', 'Perhotelan', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(23, '2022385577', 'Mahmud Hakim Utami', 'Perhotelan', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(24, '2024363319', 'Oktavia Santoso Yulianti', 'Otomatisasi Tata Kelola Perkantoran', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(25, '2023146228', 'Hendra Utami Rahayu', 'Otomatisasi Tata Kelola Perkantoran', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(26, '2024688153', 'Dedi Susanto', 'Akuntansi', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(27, '2023710805', 'Anggun Firmansyah Gunawan', 'Otomatisasi Tata Kelola Perkantoran', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(28, '2021475190', 'Oki Setiawan', 'Perhotelan', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(29, '2024750810', 'Ratna Handayani', 'Otomatisasi Tata Kelola Perkantoran', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(30, '2022532322', 'Wahyu Pertiwi', 'Perhotelan', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(31, '2022379766', 'Fajar Hidayat', 'Rekayasa Perangkat Lunak', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(32, '2024333238', 'Faisal Syahputra', 'Akuntansi', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(33, '2022333752', 'Lukman Lestari', 'Akuntansi', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(34, '2021910891', 'Ilham Lestari', 'Bisnis Daring dan Pemasaran', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(35, '2023128941', 'Putra Anggraini', 'Bisnis Daring dan Pemasaran', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(36, '2023140115', 'Dimas Syahputra', 'Akuntansi', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(37, '2023557592', 'Dinda Ramadhan', 'Otomatisasi Tata Kelola Perkantoran', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(38, '2022367095', 'Dimas Saputra', 'Akuntansi', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(39, '2022481913', 'Wahyu Aisyah', 'Otomatisasi Tata Kelola Perkantoran', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(40, '2021854717', 'Dinda Cahyani', 'Rekayasa Perangkat Lunak', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(41, '2023521947', 'Eka Firmansyah Hidayat', 'Perhotelan', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(42, '2022745414', 'Zahra Prasetyo', 'Perhotelan', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(43, '2023400850', 'Nur Nurjanah', 'Perhotelan', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(44, '2024563246', 'Mahmud Fauzi', 'Akuntansi', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(45, '2022790855', 'Ilham Aisyah', 'Rekayasa Perangkat Lunak', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(46, '2022805477', 'Lukman Susanto Handayani', 'Bisnis Daring dan Pemasaran', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(47, '2024740967', 'Dewi Kusuma', 'Bisnis Daring dan Pemasaran', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(48, '2022853240', 'Citra Lestari Saputra', 'Bisnis Daring dan Pemasaran', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(49, '2021916232', 'Kurnia Hartono', 'Rekayasa Perangkat Lunak', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(50, '2022989545', 'Hendra Kusuma', 'Perhotelan', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(51, '2023891937', 'Gita Fauzi', 'Otomatisasi Tata Kelola Perkantoran', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(52, '2024266889', 'Citra Rahayu Handayani', 'Akuntansi', '2023', NULL, NULL, '2026-09-11 16:22:08'),
(53, '2023903013', 'Citra Handayani Nugroho', 'Rekayasa Perangkat Lunak', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(54, '2023345884', 'Umar Wibowo Susanto', 'Akuntansi', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(55, '2022501641', 'Jasmine Rahmawati Pertiwi', 'Rekayasa Perangkat Lunak', '2022', NULL, NULL, '2026-09-11 16:22:08'),
(56, '2023668969', 'Andi Rahmawati', 'Perhotelan', '2024', NULL, NULL, '2026-09-11 16:22:08'),
(57, '2024907189', 'Jasmine Pratama', 'Akuntansi', '2021', NULL, NULL, '2026-09-11 16:22:08'),
(58, '2024600149', 'Yusuf Cahyani', 'Bisnis Daring dan Pemasaran', '2024', NULL, NULL, '2026-09-11 16:22:09'),
(59, '2024664365', 'Eka Nurjanah', 'Perhotelan', '2022', NULL, NULL, '2026-09-11 16:22:09'),
(60, '2024330080', 'Hidayat Pratama', 'Bisnis Daring dan Pemasaran', '2021', NULL, NULL, '2026-09-11 16:22:09'),
(61, '2024859359', 'Faisal Firmansyah', 'Perhotelan', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(62, '2021513160', 'Intan Pratama Yulianti', 'Rekayasa Perangkat Lunak', '2022', NULL, NULL, '2026-09-11 16:22:09'),
(63, '2022584125', 'Putra Hidayat', 'Rekayasa Perangkat Lunak', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(64, '2024442722', 'Agus Safitri', 'Bisnis Daring dan Pemasaran', '2022', NULL, NULL, '2026-09-11 16:22:09'),
(65, '2024364525', 'Citra Pratama', 'Otomatisasi Tata Kelola Perkantoran', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(66, '2021466960', 'Dedi Wijaya', 'Rekayasa Perangkat Lunak', '2022', NULL, NULL, '2026-09-11 16:22:09'),
(67, '2022309044', 'Gita Susanto Aditya', 'Bisnis Daring dan Pemasaran', '2022', NULL, NULL, '2026-09-11 16:22:09'),
(68, '2021691364', 'Bella Utami', 'Akuntansi', '2021', NULL, NULL, '2026-09-11 16:22:09'),
(69, '2022735324', 'Kartika Ramadhan', 'Otomatisasi Tata Kelola Perkantoran', '2024', NULL, NULL, '2026-09-11 16:22:09'),
(70, '2022426147', 'Muhammad Cahyani', 'Perhotelan', '2021', NULL, NULL, '2026-09-11 16:22:09'),
(71, '2024515922', 'Putri Nugroho', 'Rekayasa Perangkat Lunak', '2021', NULL, NULL, '2026-09-11 16:22:09'),
(72, '2022206851', 'Tuti Nurjanah', 'Otomatisasi Tata Kelola Perkantoran', '2021', NULL, NULL, '2026-09-11 16:22:09'),
(73, '2021464069', 'Intan Gunawan Hakim', 'Akuntansi', '2021', NULL, NULL, '2026-09-11 16:22:09'),
(74, '2021990844', 'Hidayat Setiawan', 'Otomatisasi Tata Kelola Perkantoran', '2021', NULL, NULL, '2026-09-11 16:22:09'),
(75, '2023766459', 'Bella Susanto', 'Akuntansi', '2024', NULL, NULL, '2026-09-11 16:22:09'),
(76, '2023745830', 'Eka Aditya', 'Otomatisasi Tata Kelola Perkantoran', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(77, '2023437960', 'Nia Kurniawan Rahayu', 'Perhotelan', '2024', NULL, NULL, '2026-09-11 16:22:09'),
(78, '2022886931', 'Panji Hidayat', 'Bisnis Daring dan Pemasaran', '2022', NULL, NULL, '2026-09-11 16:22:09'),
(79, '2024992288', 'Hidayat Rahmawati', 'Otomatisasi Tata Kelola Perkantoran', '2022', NULL, NULL, '2026-09-11 16:22:09'),
(80, '2023456871', 'Okta Safitri', 'Bisnis Daring dan Pemasaran', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(81, '2022189771', 'Candra Abdullah', 'Bisnis Daring dan Pemasaran', '2024', NULL, NULL, '2026-09-11 16:22:09'),
(82, '2022824156', 'Hidayat Rahayu', 'Perhotelan', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(83, '2021408528', 'Oki Cahyani', 'Perhotelan', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(84, '2023596249', 'Yuni Yulianti', 'Otomatisasi Tata Kelola Perkantoran', '2024', NULL, NULL, '2026-09-11 16:22:09'),
(85, '2023468900', 'Sri Cahyani Ramadhan', 'Otomatisasi Tata Kelola Perkantoran', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(86, '2022430876', 'Kevin Anggraini Aditya', 'Rekayasa Perangkat Lunak', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(87, '2023859782', 'Lestari Hartono', 'Akuntansi', '2022', NULL, NULL, '2026-09-11 16:22:09'),
(88, '2021973074', 'Nanda Gunawan Saputra', 'Bisnis Daring dan Pemasaran', '2021', NULL, NULL, '2026-09-11 16:22:09'),
(89, '2022387636', 'Andi Prasetyo Firmansyah', 'Rekayasa Perangkat Lunak', '2022', NULL, NULL, '2026-09-11 16:22:09'),
(90, '2024207570', 'Farah Amelia', 'Bisnis Daring dan Pemasaran', '2021', NULL, NULL, '2026-09-11 16:22:09'),
(91, '2024457256', 'Andi Utami', 'Otomatisasi Tata Kelola Perkantoran', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(92, '2024219629', 'Zahra Abdullah Santoso', 'Rekayasa Perangkat Lunak', '2024', NULL, NULL, '2026-09-11 16:22:09'),
(93, '2022256445', 'Tuti Kurniawan', 'Rekayasa Perangkat Lunak', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(94, '2021685181', 'Gita Nurjanah', 'Perhotelan', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(95, '2022913373', 'Bella Rahayu Az-Zahra', 'Perhotelan', '2024', NULL, NULL, '2026-09-11 16:22:09'),
(96, '2024420214', 'Ayu Aisyah', 'Perhotelan', '2024', NULL, NULL, '2026-09-11 16:22:09'),
(97, '2021899787', 'Mahmud Utami', 'Otomatisasi Tata Kelola Perkantoran', '2022', NULL, NULL, '2026-09-11 16:22:09'),
(98, '2022351516', 'Dedi Permata Rahayu', 'Rekayasa Perangkat Lunak', '2024', NULL, NULL, '2026-09-11 16:22:09'),
(99, '2024405407', 'Surya Amelia', 'Rekayasa Perangkat Lunak', '2023', NULL, NULL, '2026-09-11 16:22:09'),
(100, '2024174637', 'Ratna Utami', 'Otomatisasi Tata Kelola Perkantoran', '2022', NULL, NULL, '2026-09-11 16:22:09');

-- --------------------------------------------------------

--
-- Struktur dari tabel `survey`
--

CREATE TABLE `survey` (
  `id` int NOT NULL,
  `alumni_id` int NOT NULL,
  `status_saat_ini` enum('Bekerja','Kuliah','Wirausaha','Belum Bekerja') NOT NULL,
  `nama_perusahaan` varchar(100) DEFAULT NULL,
  `bidang_kerja` varchar(100) DEFAULT NULL,
  `relevansi_jurusan` enum('Sangat Sesuai','Cukup Sesuai','Tidak Sesuai') DEFAULT NULL,
  `lama_tunggu_kerja` varchar(50) DEFAULT NULL,
  `nama_kampus` varchar(100) DEFAULT NULL,
  `jurusan_kampus` varchar(100) DEFAULT NULL,
  `saran_untuk_sekolah` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `survey`
--

INSERT INTO `survey` (`id`, `alumni_id`, `status_saat_ini`, `nama_perusahaan`, `bidang_kerja`, `relevansi_jurusan`, `lama_tunggu_kerja`, `nama_kampus`, `jurusan_kampus`, `saran_untuk_sekolah`, `created_at`) VALUES
(1, 53, 'Kuliah', NULL, NULL, NULL, NULL, 'Universitas Pamulang', 'Teknik Informatika', 'Teknik Informatika', '2026-09-13 16:30:09'),
(2, 98, 'Bekerja', 'pt suka maju', 'IT Support', 'Cukup Sesuai', '3 tahun', NULL, NULL, NULL, '2026-09-13 16:30:53'),
(3, 56, 'Bekerja', 'PT CAT', 'Barista', 'Tidak Sesuai', '3 tahun', NULL, NULL, 'Barista', '2026-09-13 16:32:49');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indeks untuk tabel `alumni`
--
ALTER TABLE `alumni`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nis` (`nis`);

--
-- Indeks untuk tabel `survey`
--
ALTER TABLE `survey`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alumni_id` (`alumni_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `alumni`
--
ALTER TABLE `alumni`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT untuk tabel `survey`
--
ALTER TABLE `survey`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `survey`
--
ALTER TABLE `survey`
  ADD CONSTRAINT `survey_ibfk_1` FOREIGN KEY (`alumni_id`) REFERENCES `alumni` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
