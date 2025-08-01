-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 21, 2025 at 02:57 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kost_patemon`
--

-- --------------------------------------------------------

--
-- Table structure for table `kamar`
--

CREATE TABLE `kamar` (
  `No_Kamar` int(10) NOT NULL,
  `Nama_Kamar` varchar(50) NOT NULL,
  `Letak` varchar(50) NOT NULL,
  `Ketersediaan` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kamar`
--

INSERT INTO `kamar` (`No_Kamar`, `Nama_Kamar`, `Letak`, `Ketersediaan`) VALUES
(1, 'Kamar Mawar', 'Lantai 2', 0),
(2, 'Kamar Melati', 'Lantai 2', 0),
(3, 'Kamar Kenanga', 'Lantai 2', 1),
(4, 'Kamar Anggrek', 'Lantai 3', 1),
(5, 'Kamar Kaktus', 'Lantai 3', 1);

-- --------------------------------------------------------

--
-- Table structure for table `pembayaran`
--

CREATE TABLE `pembayaran` (
  `ID_Pembayaran` int(11) NOT NULL,
  `ID_Reservasi` int(11) NOT NULL,
  `Tanggal_Bayar` datetime DEFAULT NULL,
  `Jumlah` decimal(12,2) NOT NULL DEFAULT 900000.00,
  `Bukti_Pembayaran` varchar(255) DEFAULT NULL,
  `Status` enum('Belum Bayar','Menunggu','Diterima') NOT NULL DEFAULT 'Belum Bayar',
  `Created_At` datetime DEFAULT current_timestamp(),
  `Updated_At` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pembayaran`
--

INSERT INTO `pembayaran` (`ID_Pembayaran`, `ID_Reservasi`, `Tanggal_Bayar`, `Jumlah`, `Bukti_Pembayaran`, `Status`, `Created_At`, `Updated_At`) VALUES
(2, 2, '2025-06-20 22:51:49', 900000.00, 'uploads\\bukti_pembayaran\\bukti-1753026692504-37640398.png', 'Diterima', '2025-06-20 22:51:49', '2025-06-20 23:09:17'),
(7, 3, '2025-07-21 03:38:11', 900000.00, 'uploads\\bukti_pembayaran\\bukti-1753029775688-516989187.png', 'Diterima', '2025-07-21 03:38:11', '2025-07-21 03:38:11'),
(10, 2, NULL, 900000.00, NULL, 'Belum Bayar', '2025-07-21 00:00:00', '2025-07-21 07:55:34');

-- --------------------------------------------------------

--
-- Table structure for table `reservasi`
--

CREATE TABLE `reservasi` (
  `ID_Reservasi` int(11) NOT NULL,
  `No_Kamar` int(10) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Tanggal_Reservasi` datetime NOT NULL DEFAULT current_timestamp(),
  `Status` enum('Telat/Belum Bayar','Aktif/Lunas','Keluar') NOT NULL DEFAULT 'Telat/Belum Bayar'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservasi`
--

INSERT INTO `reservasi` (`ID_Reservasi`, `No_Kamar`, `Email`, `Tanggal_Reservasi`, `Status`) VALUES
(2, 1, 'rapop@example.com', '2025-06-20 22:51:49', 'Aktif/Lunas'),
(3, 2, 'purel@gmail.com', '2025-07-21 03:38:11', 'Aktif/Lunas');

-- --------------------------------------------------------

--
-- Table structure for table `tmp`
--

CREATE TABLE `tmp` (
  `ID_Tmp` int(11) NOT NULL,
  `Nama` varchar(70) NOT NULL,
  `No_telp` varchar(20) NOT NULL,
  `Alamat` varchar(200) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Foto` varchar(255) DEFAULT NULL,
  `Role` enum('admin','penyewa') NOT NULL DEFAULT 'penyewa',
  `No_Kamar` int(10) NOT NULL,
  `Bukti_Pembayaran` varchar(255) DEFAULT NULL,
  `Created_At` datetime DEFAULT current_timestamp(),
  `Updated_At` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ulasan`
--

CREATE TABLE `ulasan` (
  `No_Kamar` int(10) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Tanggal` date NOT NULL DEFAULT curdate(),
  `Rating` int(1) NOT NULL CHECK (`Rating` between 1 and 5),
  `Ulasan` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `Nama` varchar(70) NOT NULL,
  `No_telp` varchar(20) NOT NULL,
  `Alamat` varchar(200) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Foto` varchar(255) DEFAULT NULL,
  `Role` enum('admin','penyewa') NOT NULL DEFAULT 'penyewa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`Nama`, `No_telp`, `Alamat`, `Email`, `Password`, `Foto`, `Role`) VALUES
('Admin Kost Patemon', '088216003562', 'Jl. Serayu IV No. 13 03/01 Desa Patemon, Kecamatan Gombong, Kabupaten Kebumen', 'admin@kost.com', '$2a$10$EyQsPQjIHhbFcxUR0ZSy2OQ.t2hFieZk9iWjb8TrO0UaofXpW3Crq', NULL, 'admin'),
('Purell', '085284125125', 'Playen', 'purel@gmail.com', '$2a$10$40zYg8DDhj3RK8uNACr3UOON5IJ.8gaNeIeqwS/frXS1LsQGz.kZ6', NULL, 'penyewa'),
('Rapop Ghan', '085267412342', 'SOLO', 'rapop@example.com', '$2a$10$oi6HQmK3GjukEGvWoim8oepjQ4VOhTdc3NAFrFK2vxQz8gUa8iBoG', '/uploads/profiles/profile-1753059077416-359022871.jpg', 'penyewa');

-- --------------------------------------------------------

--
-- Table structure for table `user_tokens`
--

CREATE TABLE `user_tokens` (
  `ID_Token` int(11) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Token` varchar(255) NOT NULL,
  `Expires_At` datetime NOT NULL,
  `Used` tinyint(1) NOT NULL DEFAULT 0,
  `Created_At` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_tokens`
--

INSERT INTO `user_tokens` (`ID_Token`, `Email`, `Token`, `Expires_At`, `Used`, `Created_At`) VALUES
(2, 'rapop@example.com', '12b3d40b2fca11eb5760031c1e824615697e7471ca99680508d1c4a63ac96c61', '2025-07-21 22:51:49', 0, '2025-07-20 22:51:49'),
(3, 'purel@gmail.com', 'ea40481ae08c3201ceaa3aaab6e6c0cb3d2e701db78a096f5798fe1202b8964e', '2025-07-22 03:38:11', 0, '2025-07-21 03:38:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `kamar`
--
ALTER TABLE `kamar`
  ADD PRIMARY KEY (`No_Kamar`);

--
-- Indexes for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD PRIMARY KEY (`ID_Pembayaran`),
  ADD KEY `idx_reservasi` (`ID_Reservasi`),
  ADD KEY `idx_status` (`Status`);

--
-- Indexes for table `reservasi`
--
ALTER TABLE `reservasi`
  ADD PRIMARY KEY (`ID_Reservasi`),
  ADD KEY `idx_no_kamar` (`No_Kamar`),
  ADD KEY `idx_email` (`Email`),
  ADD KEY `idx_status` (`Status`);

--
-- Indexes for table `tmp`
--
ALTER TABLE `tmp`
  ADD PRIMARY KEY (`ID_Tmp`),
  ADD UNIQUE KEY `unique_email_tmp` (`Email`),
  ADD KEY `idx_no_kamar` (`No_Kamar`);

--
-- Indexes for table `ulasan`
--
ALTER TABLE `ulasan`
  ADD PRIMARY KEY (`No_Kamar`,`Email`),
  ADD KEY `idx_email` (`Email`),
  ADD KEY `idx_rating` (`Rating`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`Email`);

--
-- Indexes for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`ID_Token`),
  ADD UNIQUE KEY `unique_token` (`Token`),
  ADD KEY `idx_email` (`Email`),
  ADD KEY `idx_token_expires` (`Token`,`Expires_At`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `kamar`
--
ALTER TABLE `kamar`
  MODIFY `No_Kamar` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pembayaran`
--
ALTER TABLE `pembayaran`
  MODIFY `ID_Pembayaran` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `reservasi`
--
ALTER TABLE `reservasi`
  MODIFY `ID_Reservasi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tmp`
--
ALTER TABLE `tmp`
  MODIFY `ID_Tmp` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `ID_Token` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD CONSTRAINT `fk_pembayaran_reservasi` FOREIGN KEY (`ID_Reservasi`) REFERENCES `reservasi` (`ID_Reservasi`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reservasi`
--
ALTER TABLE `reservasi`
  ADD CONSTRAINT `fk_reservasi_kamar` FOREIGN KEY (`No_Kamar`) REFERENCES `kamar` (`No_Kamar`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reservasi_user` FOREIGN KEY (`Email`) REFERENCES `user` (`Email`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tmp`
--
ALTER TABLE `tmp`
  ADD CONSTRAINT `fk_tmp_kamar` FOREIGN KEY (`No_Kamar`) REFERENCES `kamar` (`No_Kamar`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ulasan`
--
ALTER TABLE `ulasan`
  ADD CONSTRAINT `fk_ulasan_kamar` FOREIGN KEY (`No_Kamar`) REFERENCES `kamar` (`No_Kamar`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ulasan_user` FOREIGN KEY (`Email`) REFERENCES `user` (`Email`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD CONSTRAINT `fk_user_tokens_user` FOREIGN KEY (`Email`) REFERENCES `user` (`Email`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
