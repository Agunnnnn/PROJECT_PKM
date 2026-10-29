-- =============================================================================
-- Skema Database Sistem Tracer Study Alumni (Project_PKM)
-- Lengkap dengan seluruh kolom admin, constraint UNIQUE, dan relasi CASCADE.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `Project_PKM` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `Project_PKM`;

-- -----------------------------------------------------------------------------
-- 1. Tabel: admin
-- Menyimpan kredensial dan profil administrator sistem
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `survey`;
DROP TABLE IF EXISTS `alumni`;
DROP TABLE IF EXISTS `admin`;

CREATE TABLE `admin` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `telepon` VARCHAR(20) DEFAULT NULL,
  `role` VARCHAR(50) DEFAULT 'Administrator',
  `foto` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- 2. Tabel: alumni
-- Menyimpan data master alumni (identitas unik berdasarkan NIS)
-- -----------------------------------------------------------------------------
CREATE TABLE `alumni` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nis` VARCHAR(20) NOT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `jurusan` VARCHAR(50) NOT NULL,
  `tahun_lulus` YEAR NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `no_hp` VARCHAR(20) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_alumni_nis` (`nis`),
  KEY `idx_alumni_tahun_lulus` (`tahun_lulus`),
  KEY `idx_alumni_jurusan` (`jurusan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- 3. Tabel: survey
-- Menyimpan jawaban kuesioner pelacakan alumni
-- alumni_id dibuat UNIQUE untuk memastikan 1 alumni hanya memiliki 1 data survey
-- ON DELETE CASCADE memastikan bila alumni dihapus, survey ikut terhapus
-- -----------------------------------------------------------------------------
CREATE TABLE `survey` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `alumni_id` INT NOT NULL,
  `status_saat_ini` VARCHAR(50) NOT NULL,
  `nama_perusahaan` VARCHAR(100) DEFAULT NULL,
  `bidang_kerja` VARCHAR(100) DEFAULT NULL,
  `relevansi_jurusan` VARCHAR(50) DEFAULT NULL,
  `lama_tunggu_kerja` VARCHAR(50) DEFAULT NULL,
  `nama_kampus` VARCHAR(100) DEFAULT NULL,
  `jurusan_kampus` VARCHAR(100) DEFAULT NULL,
  `saran_untuk_sekolah` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_survey_alumni_id` (`alumni_id`),
  KEY `idx_survey_status` (`status_saat_ini`),
  KEY `idx_survey_relevansi` (`relevansi_jurusan`),
  CONSTRAINT `fk_survey_alumni` FOREIGN KEY (`alumni_id`) REFERENCES `alumni` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
