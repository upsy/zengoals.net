-- phpMyAdmin SQL Dump
-- version 3.5.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Dec 30, 2012 at 06:38 PM
-- Server version: 5.5.24-log
-- PHP Version: 5.3.13

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `zengoals`
--

-- --------------------------------------------------------

--
-- Table structure for table `goal`
--

CREATE TABLE IF NOT EXISTS `goal` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `goalscoreprofessional` tinyint(3) unsigned DEFAULT NULL,
  `goalscoresocial` tinyint(3) unsigned DEFAULT NULL,
  `goalscorepersonal` tinyint(3) unsigned DEFAULT NULL,
  `status` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=2 ;

--
-- Dumping data for table `goal`
--

INSERT INTO `goal` (`id`, `name`, `goalscoreprofessional`, `goalscoresocial`, `goalscorepersonal`, `status`) VALUES
(1, 'asdadasd', 50, 25, 25, 'newly_created');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `userscoreprofessional` tinyint(3) unsigned DEFAULT NULL,
  `userscoresocial` tinyint(3) unsigned DEFAULT NULL,
  `userscorepersonal` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=7 ;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `userscoreprofessional`, `userscoresocial`, `userscorepersonal`) VALUES
(1, 'asd', 'asd', 'asd', NULL, NULL, NULL),
(2, 'vecinu', 'vecinu@home', 'asd', NULL, NULL, NULL),
(3, 'dra', 'gos', 'sd', 50, 25, 25),
(4, 'sdfsd', 'sdfsd', 'ss', 45, 22, 33),
(5, 'iulica', 'gfff', 'dfdfd', 0, 0, 0),
(6, 'asdadasd', 'asda', 'asd', 23, 22, 55);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
