-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 06, 2024 at 04:52 PM
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
-- Database: `projectapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `admin_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `autonumber_reservations`
--

CREATE TABLE `autonumber_reservations` (
  `reservation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `auto_number` varchar(20) NOT NULL,
  `reserved_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_reserved` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lotto_numbers`
--

CREATE TABLE `lotto_numbers` (
  `lotto_id` int(11) NOT NULL,
  `draw_number` int(11) NOT NULL,
  `lotto_number` varchar(6) NOT NULL,
  `is_sold` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lotto_purchases`
--

CREATE TABLE `lotto_purchases` (
  `purchase_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `lotto_id` int(11) DEFAULT NULL,
  `purchased_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_winner` tinyint(1) DEFAULT 0,
  `prize_amount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lotto_results`
--

CREATE TABLE `lotto_results` (
  `result_id` int(11) NOT NULL,
  `draw_number` int(11) NOT NULL,
  `winning_number` varchar(6) NOT NULL,
  `prize_level` int(11) NOT NULL,
  `prize_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lotto_transfers`
--

CREATE TABLE `lotto_transfers` (
  `transfer_id` int(11) NOT NULL,
  `from_user_id` int(11) DEFAULT NULL,
  `to_user_id` int(11) DEFAULT NULL,
  `lotto_id` int(11) DEFAULT NULL,
  `transferred_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `transfer_status` enum('pending','confirmed') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `memberships`
--

CREATE TABLE `memberships` (
  `membership_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `membership_start_date` date NOT NULL,
  `membership_end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_member` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `initial_wallet_balance` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `wallet_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `balance` int(11) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `autonumber_reservations`
--
ALTER TABLE `autonumber_reservations`
  ADD PRIMARY KEY (`reservation_id`),
  ADD UNIQUE KEY `auto_number` (`auto_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `lotto_numbers`
--
ALTER TABLE `lotto_numbers`
  ADD PRIMARY KEY (`lotto_id`),
  ADD UNIQUE KEY `draw_number` (`draw_number`,`lotto_number`);

--
-- Indexes for table `lotto_purchases`
--
ALTER TABLE `lotto_purchases`
  ADD PRIMARY KEY (`purchase_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `lotto_id` (`lotto_id`);

--
-- Indexes for table `lotto_results`
--
ALTER TABLE `lotto_results`
  ADD PRIMARY KEY (`result_id`),
  ADD KEY `draw_number` (`draw_number`);

--
-- Indexes for table `lotto_transfers`
--
ALTER TABLE `lotto_transfers`
  ADD PRIMARY KEY (`transfer_id`),
  ADD KEY `from_user_id` (`from_user_id`),
  ADD KEY `to_user_id` (`to_user_id`),
  ADD KEY `lotto_id` (`lotto_id`);

--
-- Indexes for table `memberships`
--
ALTER TABLE `memberships`
  ADD PRIMARY KEY (`membership_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`wallet_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `autonumber_reservations`
--
ALTER TABLE `autonumber_reservations`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lotto_numbers`
--
ALTER TABLE `lotto_numbers`
  MODIFY `lotto_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lotto_purchases`
--
ALTER TABLE `lotto_purchases`
  MODIFY `purchase_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lotto_results`
--
ALTER TABLE `lotto_results`
  MODIFY `result_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lotto_transfers`
--
ALTER TABLE `lotto_transfers`
  MODIFY `transfer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `memberships`
--
ALTER TABLE `memberships`
  MODIFY `membership_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `wallet_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `autonumber_reservations`
--
ALTER TABLE `autonumber_reservations`
  ADD CONSTRAINT `autonumber_reservations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `lotto_purchases`
--
ALTER TABLE `lotto_purchases`
  ADD CONSTRAINT `lotto_purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `lotto_purchases_ibfk_2` FOREIGN KEY (`lotto_id`) REFERENCES `lotto_numbers` (`lotto_id`);

--
-- Constraints for table `lotto_results`
--
ALTER TABLE `lotto_results`
  ADD CONSTRAINT `lotto_results_ibfk_1` FOREIGN KEY (`draw_number`) REFERENCES `lotto_numbers` (`draw_number`);

--
-- Constraints for table `lotto_transfers`
--
ALTER TABLE `lotto_transfers`
  ADD CONSTRAINT `lotto_transfers_ibfk_1` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `lotto_transfers_ibfk_2` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `lotto_transfers_ibfk_3` FOREIGN KEY (`lotto_id`) REFERENCES `lotto_purchases` (`purchase_id`);

--
-- Constraints for table `memberships`
--
ALTER TABLE `memberships`
  ADD CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `wallets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
